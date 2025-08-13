// IMPORTANT: Do not import native BLE module at top-level to avoid SSR/web crashes.
// We'll dynamically require it only on native at runtime.
type BleManager = any;
type Device = any;
type Characteristic = any;
import { Buffer } from 'buffer';
import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';
import { Platform } from 'react-native';

let bleManagerRef: BleManager | null = null;
function getBleManager(): BleManager {
  if (Platform.OS === 'web') {
    throw new Error('BLE is not supported on web');
  }
  if (!bleManagerRef) {
    const mod = require('react-native-ble-plx');
    const Manager = mod?.BleManager;
    if (!Manager) {
      throw new Error('BLE module not available');
    }
    bleManagerRef = new Manager();
  }
  return bleManagerRef;
}

export interface BleConnection {
  device: Device;
  characteristic: Characteristic;
  disconnect: () => Promise<void>;
  send: (data: Uint8Array) => Promise<void>;
  onReceive: (handler: (data: Uint8Array) => void) => void;
}

/**
 * Scan and connect to a BLE device advertising the given service UUID.
 * Returns a BleConnection object on success.
 */
export async function connectToDevice(serviceUuid = BLE_CONFIG.SERVICE_UUID): Promise<BleConnection> {
  if (Platform.OS === 'web') {
    throw new Error('BLE connect not supported on web');
  }
  const bleManager = getBleManager();
  return new Promise((resolve, reject) => {
    let found = false;
    // Start scanning for devices advertising our Service UUID
    bleManager.startDeviceScan([serviceUuid], null, async (error: any, device: any) => {
      if (error) {
        bleManager.stopDeviceScan();
        return reject(error);
      }
      if (device && !found) {
        found = true;
        bleManager.stopDeviceScan();
        try {
          const connectedDevice = await device.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          const chars = await connectedDevice.characteristicsForService(serviceUuid);
          const char = chars.find(c => c.uuid.toLowerCase() === BLE_CONFIG.CHARACTERISTIC_UUID.toLowerCase());
          if (!char) throw new Error('Characteristic not found');
          resolve({
            device: connectedDevice,
            characteristic: char,
            disconnect: async () => { await connectedDevice.cancelConnection(); },
            send: async (data: Uint8Array) => {
              await connectedDevice.writeCharacteristicWithResponseForService(
                serviceUuid,
                BLE_CONFIG.CHARACTERISTIC_UUID,
                Buffer.from(data).toString('base64')
              );
            },
            onReceive: (handler) => {
              char.monitor((err: any, c: any) => {
                if (err || !c?.value) return;
                const raw = Buffer.from(c.value, 'base64');
                handler(new Uint8Array(raw));
              });
            },
          });
        } catch (e) {
          reject(e);
        }
      }
    });
    // Optional: timeout after 20s
    // setTimeout(() => {
    //   if (!found) {
    //     subscription.remove();
    //     reject(new Error('Device not found'));
    //   }
    // }, 20000);
  });
}

/**
 * Ensure the device is connected. If already connected, re-use it; otherwise connect.
 */
export async function ensureConnected(device: Device): Promise<{ device: Device; freshlyConnected: boolean }> {
  let freshlyConnected = false;
  try {
    if (device.isConnected && (await device.isConnected())) {
      return { device, freshlyConnected: false };
    }
  } catch {}
  try {
    const connected = await device.connect();
    freshlyConnected = true;
    await connected.discoverAllServicesAndCharacteristics();
    return { device: connected, freshlyConnected };
  } catch (e: any) {
    const msg = String(e?.message || e);
    // Some platforms throw if already connected; reuse existing connection
    if (/already connected/i.test(msg)) {
      try {
        await device.discoverAllServicesAndCharacteristics();
      } catch {}
      return { device, freshlyConnected: false };
    }
    throw e;
  }
}

/**
 * Write a string packet to the configured characteristic using base64 encoding.
 * Optionally disconnect after write if we established the connection here.
 */
export async function sendCardId(
  device: Device,
  cardDocId: string,
  senderName: string,
  opts: { disconnectAfter?: boolean } = {}
): Promise<void> {
  const { disconnectAfter = false } = opts;
  let connectedRef: Device | null = null;
  let weConnected = false;
  try {
    const ensured = await ensureConnected(device);
    connectedRef = ensured.device;
    weConnected = ensured.freshlyConnected;
    const packet = BLEUtils.createPacket(cardDocId, senderName);
    const dataBytes = BLEUtils.stringToBytes(packet);
    const dataBase64 = Buffer.from(Uint8Array.from(dataBytes)).toString('base64');
    try {
      await connectedRef.writeCharacteristicWithResponseForService(
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHARACTERISTIC_UUID,
        dataBase64
      );
    } catch (e: any) {
      const msg = String(e?.message || e);
      // If the configured service isn't present, search all services for our characteristic
      if (/service .* not found/i.test(msg)) {
        console.warn('[BLE][send] target service not found; scanning services for characteristic');
        const svcs = await connectedRef.services();
        const svcIds = svcs.map((s: any) => s.uuid);
        console.log('[BLE][send] discovered services:', svcIds);
        let foundService: string | null = null;
        for (const s of svcs) {
          try {
            const chars = await connectedRef.characteristicsForService(s.uuid);
            const match = chars.find((c: any) => (c.uuid || '').toLowerCase() === BLE_CONFIG.CHARACTERISTIC_UUID.toLowerCase());
            if (match) { foundService = s.uuid; break; }
          } catch {}
        }
        if (foundService) {
          console.log('[BLE][send] found characteristic under service', foundService, 'writing...');
          await connectedRef.writeCharacteristicWithResponseForService(
            foundService,
            BLE_CONFIG.CHARACTERISTIC_UUID,
            dataBase64
          );
        } else {
          throw e;
        }
      } else if (/cancelled/i.test(msg)) {
        await new Promise(res => setTimeout(res, 250));
        await connectedRef.writeCharacteristicWithResponseForService(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          dataBase64
        );
      } else if (/disconnected/i.test(msg)) {
        console.warn('[BLE][send] device disconnected during write; reconnecting and retrying once');
        const ensured2 = await ensureConnected(connectedRef);
        connectedRef = ensured2.device;
        await connectedRef.writeCharacteristicWithResponseForService(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          dataBase64
        );
      } else {
        throw e;
      }
    }
  } finally {
    if (connectedRef && (disconnectAfter && weConnected)) {
      try { await connectedRef.cancelConnection(); } catch {}
    }
  }
}


