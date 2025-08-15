import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';
import { ensureBlePermissions } from './utils/permissions';

// Prefer the user's installed peripheral library
let RNPeripheral: any = null;
let RNAdvertiser: any = null; // fallback support if available
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNPeripheral = require('react-native-bluetooth-peripheral');
} catch (_) {
  RNPeripheral = null;
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNAdvertiser = require('react-native-ble-advertiser');
} catch (_) {
  RNAdvertiser = null;
}

// On Android, force the advertiser path to ensure service/characteristic are actually created
if (Platform.OS === 'android') {
  RNPeripheral = null;
}

let serverRunning = false;
const writeListeners = new Set<(packetString: string) => void>();
let nativeWriteSubscription: { remove: () => void } | null = null;

export const isGattServerRunning = () => serverRunning;

export function onWrite(listener: (packetString: string) => void): () => void {
  writeListeners.add(listener);
  return () => writeListeners.delete(listener);
}

function emitWrite(packetString: string) {
  for (const l of Array.from(writeListeners)) {
    try { l(packetString); } catch (e) { console.warn('[BLE][gatt] listener error', e); }
  }
}

export async function startGattServer(): Promise<void> {
  if (serverRunning) return;
  console.log('[BLE][gatt] startGattServer invoked');

  // Try to support both Android and iOS if RNPeripheral is present

  if (!RNPeripheral && !RNAdvertiser) {
    console.warn('[BLE][gatt] No peripheral native module found. Install/configure react-native-bluetooth-peripheral (preferred) or react-native-ble-advertiser.');
    serverRunning = true; // fallback so UI can show running state
    return;
  }

  const granted = await ensureBlePermissions();
  if (!granted) throw new Error('Bluetooth permissions not granted');

  try {
    // Prefer RNPeripheral API
    if (RNPeripheral) {
      try { console.log('[BLE][gatt] RNPeripheral methods:', Object.keys(RNPeripheral)); } catch {}

      // Create service
      let serviceAdded = false;
      if (typeof RNPeripheral.addService === 'function') {
        await RNPeripheral.addService(BLE_CONFIG.SERVICE_UUID);
        serviceAdded = true;
      } else if (typeof RNPeripheral.createService === 'function') {
        await RNPeripheral.createService(BLE_CONFIG.SERVICE_UUID);
        serviceAdded = true;
      }

      // Add writable characteristic
      let charAdded = false;
      const props = { write: true, writeNoResponse: true, read: false, notify: false };
      if (typeof RNPeripheral.addCharacteristicToService === 'function') {
        await RNPeripheral.addCharacteristicToService(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          props
        );
        charAdded = true;
      } else if (typeof RNPeripheral.addCharacteristic === 'function') {
        await RNPeripheral.addCharacteristic(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          props
        );
        charAdded = true;
      }

      if (!serviceAdded || !charAdded) {
        console.warn('[BLE][gatt] RNPeripheral: service/characteristic may be missing');
      }

      // Start advertising with our service UUID
      try {
        if (typeof RNPeripheral.setName === 'function') {
          // Keep name short; allow UI to set a custom name elsewhere if needed
          await RNPeripheral.setName('TravelCard');
        }
      } catch {}

      if (typeof RNPeripheral.start === 'function') {
        await RNPeripheral.start();
      } else if (typeof RNPeripheral.startAdvertising === 'function') {
        await RNPeripheral.startAdvertising({
          name: 'TravelCard',
          serviceUuids: [BLE_CONFIG.SERVICE_UUID],
        });
      }

      // Subscribe to write events
      try {
        // Some libs expose a dedicated setter for write callbacks
        if (typeof RNPeripheral.setCharacteristicWriteRequest === 'function') {
          RNPeripheral.setCharacteristicWriteRequest((event: any) => {
            try {
              console.log('[BLE][gatt] write request', event);
              let packetString = '';
              const v = event?.value ?? event?.data ?? event?.payload;
              if (typeof v === 'string') {
                try {
                  const base64Bytes = BLEUtils.stringToBytes(v);
                  packetString = BLEUtils.base64BytesToString(base64Bytes);
                } catch { packetString = v; }
              } else if (Array.isArray(v)) {
                try { packetString = BLEUtils.bytesToString(v as number[]); } catch {}
              }
              if (packetString) emitWrite(packetString);
            } catch (err) { console.warn('[BLE][gatt] write cb error', err); }
          });
        } else {
          // Fallback to events
          const emitter = new NativeEventEmitter(RNPeripheral || (NativeModules as any).RNPeripheral || undefined);
          const candidates = ['onWriteRequest', 'onWrite', 'BluetoothPeripheral:OnWrite'];
          for (const evt of candidates) {
            if (typeof (emitter as any).addListener === 'function') {
              nativeWriteSubscription = (emitter as any).addListener(evt, (event: any) => {
                try {
                  console.log('[BLE][gatt] write event', evt, event);
                  let packetString = '';
                  const v = event?.value ?? event?.data ?? event?.payload;
                  if (typeof v === 'string') {
                    try {
                      const base64Bytes = BLEUtils.stringToBytes(v);
                      packetString = BLEUtils.base64BytesToString(base64Bytes);
                    } catch { packetString = v; }
                  } else if (Array.isArray(v)) {
                    try { packetString = BLEUtils.bytesToString(v as number[]); } catch {}
                  }
                  if (packetString) emitWrite(packetString);
                } catch (err) { console.warn('[BLE][gatt] onWrite handler error', err); }
              });
              console.log('[BLE][gatt] subscribed to RNPeripheral event', evt);
              break;
            }
          }
        }
      } catch (subErr) {
        console.warn('[BLE][gatt] RNPeripheral write subscription failed', subErr);
      }

      serverRunning = true;
      console.log('[BLE][gatt] server running (RNPeripheral)');
      return;
    }

    // Fallback to RNAdvertiser API if present
    if (RNAdvertiser) {
      try { console.log('[BLE][gatt] RNAdvertiser methods:', Object.keys(RNAdvertiser)); } catch {}

      if (typeof RNAdvertiser.startGattServer === 'function') {
        await RNAdvertiser.startGattServer();
      }
      let serviceAdded = false;
      if (typeof RNAdvertiser.addService === 'function') {
        await RNAdvertiser.addService(BLE_CONFIG.SERVICE_UUID);
        serviceAdded = true;
      } else if (typeof RNAdvertiser.addServiceUUID === 'function') {
        await RNAdvertiser.addServiceUUID(BLE_CONFIG.SERVICE_UUID);
        serviceAdded = true;
      } else if (typeof RNAdvertiser.createService === 'function') {
        await RNAdvertiser.createService(BLE_CONFIG.SERVICE_UUID);
        serviceAdded = true;
      }
      let charAdded = false;
      if (typeof RNAdvertiser.addCharacteristic === 'function') {
        await RNAdvertiser.addCharacteristic(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          { write: true, writeNoResponse: false, read: false, notify: false }
        );
        charAdded = true;
      } else if (typeof RNAdvertiser.addCharacteristicToService === 'function') {
        await RNAdvertiser.addCharacteristicToService(
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.CHARACTERISTIC_UUID,
          { write: true, writeNoResponse: false, read: false, notify: false }
        );
        charAdded = true;
      }

      try {
        if (typeof RNAdvertiser.setDeviceName === 'function') {
          await RNAdvertiser.setDeviceName('TravelCard');
        }
        if (typeof RNAdvertiser.startAdvertising === 'function') {
          await RNAdvertiser.startAdvertising(BLE_CONFIG.SERVICE_UUID, 'TravelCard');
        }
      } catch {}

      // Subscribe to possible write events via NativeEventEmitter
      try {
        const possibleEventNames = ['onCharacteristicWrite', 'onDeviceWrite', 'onWrite'];
        const emitter = new NativeEventEmitter(
          RNAdvertiser?.eventEmitterModule || (NativeModules as any).RNAdvertiser || undefined
        );
        for (const evt of possibleEventNames) {
          if (typeof (emitter as any).addListener === 'function') {
            nativeWriteSubscription = (emitter as any).addListener(evt, (event: any) => {
              try {
                console.log('[BLE][gatt] write event', evt, event);
                let packetString = '';
                const v = event?.value ?? event?.data ?? event?.payload;
                if (typeof v === 'string') {
                  try {
                    const base64Bytes = BLEUtils.stringToBytes(v);
                    packetString = BLEUtils.base64BytesToString(base64Bytes);
                  } catch { packetString = v; }
                } else if (Array.isArray(v)) {
                  try { packetString = BLEUtils.bytesToString(v as number[]); } catch {}
                }
                if (packetString) emitWrite(packetString);
              } catch (err) { console.warn('[BLE][gatt] onWrite handler error', err); }
            });
            console.log('[BLE][gatt] subscribed to RNAdvertiser event', evt);
            break;
          }
        }
      } catch (subErr) {
        console.warn('[BLE][gatt] RNAdvertiser write subscription failed', subErr);
      }

      serverRunning = true;
      console.log('[BLE][gatt] server running (RNAdvertiser)');
      return;
    }
  } catch (err) {
    console.warn('[BLE][gatt] startGattServer error', err);
    serverRunning = false;
    throw err;
  }
}

export async function stopGattServer(): Promise<void> {
  console.log('[BLE][gatt] stopGattServer invoked');
  try {
    if (nativeWriteSubscription) {
      try { nativeWriteSubscription.remove(); } catch {}
      nativeWriteSubscription = null;
    }
    if (RNPeripheral) {
      if (typeof RNPeripheral.stop === 'function') {
        try { await RNPeripheral.stop(); } catch {}
      } else if (typeof RNPeripheral.stopAdvertising === 'function') {
        try { await RNPeripheral.stopAdvertising(); } catch {}
      }
      if (typeof RNPeripheral.removeService === 'function') {
        try { await RNPeripheral.removeService(BLE_CONFIG.SERVICE_UUID); } catch {}
      }
    }
    if (RNAdvertiser) {
      if (typeof RNAdvertiser.clearServices === 'function') {
        try { await RNAdvertiser.clearServices(); } catch {}
      }
      if (typeof RNAdvertiser.stopGattServer === 'function') {
        try { await RNAdvertiser.stopGattServer(); } catch {}
      }
    }
  } finally {
    serverRunning = false;
  }
}
