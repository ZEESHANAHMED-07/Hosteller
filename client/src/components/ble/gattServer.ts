import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';
import { ensureBlePermissions } from './utils/permissions';

// Optional native advertiser/server (e.g., react-native-ble-advertiser)
let RNAdvertiser: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNAdvertiser = require('react-native-ble-advertiser');
} catch (_) {
  RNAdvertiser = null;
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

  if (Platform.OS !== 'android') {
    console.warn('[BLE][gatt] GATT server currently implemented for Android only');
    serverRunning = true; // allow UI toggle for now
    return;
  }

  if (!RNAdvertiser) {
    console.warn('[BLE][gatt] Native module not found. Install/configure react-native-ble-advertiser to host a GATT server.');
    serverRunning = true; // fallback so UI can show running state
    return;
  }

  const granted = await ensureBlePermissions();
  if (!granted) throw new Error('Bluetooth permissions not granted');

  try {
    try {
      const keys = Object.keys(RNAdvertiser || {});
      console.log('[BLE][gatt] RNAdvertiser methods:', keys);
    } catch {}
    // Start native GATT server if available
    if (typeof RNAdvertiser.startGattServer === 'function') {
      console.log('[BLE][gatt] starting native GATT server');
      await RNAdvertiser.startGattServer();
    }

    // Add service (try common method names)
    let serviceAdded = false;
    if (typeof RNAdvertiser.addService === 'function') {
      console.log('[BLE][gatt] adding service (addService)', BLE_CONFIG.SERVICE_UUID);
      await RNAdvertiser.addService(BLE_CONFIG.SERVICE_UUID);
      serviceAdded = true;
    } else if (typeof RNAdvertiser.addServiceUUID === 'function') {
      console.log('[BLE][gatt] adding service (addServiceUUID)', BLE_CONFIG.SERVICE_UUID);
      await RNAdvertiser.addServiceUUID(BLE_CONFIG.SERVICE_UUID);
      serviceAdded = true;
    } else if (typeof RNAdvertiser.createService === 'function') {
      console.log('[BLE][gatt] adding service (createService)', BLE_CONFIG.SERVICE_UUID);
      await RNAdvertiser.createService(BLE_CONFIG.SERVICE_UUID);
      serviceAdded = true;
    } else {
      console.warn('[BLE][gatt] No known addService API on RNAdvertiser; service may not be created');
    }

    // Add characteristic: write with response (try common method names)
    let charAdded = false;
    if (typeof RNAdvertiser.addCharacteristic === 'function') {
      console.log('[BLE][gatt] adding characteristic (addCharacteristic)', BLE_CONFIG.CHARACTERISTIC_UUID);
      await RNAdvertiser.addCharacteristic(
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHARACTERISTIC_UUID,
        { write: true, writeNoResponse: false, read: false, notify: false }
      );
      charAdded = true;
    } else if (typeof RNAdvertiser.addCharacteristicToService === 'function') {
      console.log('[BLE][gatt] adding characteristic (addCharacteristicToService)', BLE_CONFIG.CHARACTERISTIC_UUID);
      await RNAdvertiser.addCharacteristicToService(
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHARACTERISTIC_UUID,
        { write: true, writeNoResponse: false, read: false, notify: false }
      );
      charAdded = true;
    } else {
      console.warn('[BLE][gatt] No known addCharacteristic API on RNAdvertiser; characteristic may not be created');
    }

    if (!serviceAdded || !charAdded) {
      console.warn('[BLE][gatt] Service/Characteristic may be missing; sender will not find target UUIDs');
    }

    // Subscribe to write events if the module exposes them
    try {
      const possibleEventNames = [
        'onCharacteristicWrite',
        'onDeviceWrite',
        'onWrite',
      ];
      const emitter = new NativeEventEmitter(
        // Prefer module emitter if exposed, else RN NativeModules fallback
        RNAdvertiser?.eventEmitterModule || (NativeModules as any).RNAdvertiser || undefined
      );

      for (const evt of possibleEventNames) {
        if (typeof emitter.addListener === 'function') {
          nativeWriteSubscription = emitter.addListener(evt, (event: any) => {
            try {
              console.log('[BLE][gatt] write event', evt, event);
              // Attempt to extract value (may be base64 or bytes depending on module)
              let packetString = '';
              const v = event?.value ?? event?.data ?? event?.payload;
              if (typeof v === 'string') {
                // base64 string -> bytes (of base64) -> decode to utf8
                try {
                  const base64Bytes = BLEUtils.stringToBytes(v);
                  packetString = BLEUtils.base64BytesToString(base64Bytes);
                } catch {
                  packetString = v; // fallback: treat as plain string
                }
              } else if (Array.isArray(v)) {
                // assume byte array
                try {
                  const arr = v as number[];
                  packetString = BLEUtils.bytesToString(arr);
                } catch {}
              }
              if (packetString) emitWrite(packetString);
            } catch (err) {
              console.warn('[BLE][gatt] onWrite handler error', err);
            }
          }) as any;
          console.log('[BLE][gatt] subscribed to native event', evt);
          break; // stop after first successful subscription
        }
      }
    } catch (subErr) {
      console.warn('[BLE][gatt] failed to subscribe to write events', subErr);
    }

    serverRunning = true;
    console.log('[BLE][gatt] server running');
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

    if (Platform.OS === 'android' && RNAdvertiser) {
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
