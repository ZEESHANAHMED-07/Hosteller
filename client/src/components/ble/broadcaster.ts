import { Platform } from 'react-native';
import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';

// Optional native advertiser (react-native-ble-advertiser) if installed
let RNAdvertiser: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNAdvertiser = require('react-native-ble-advertiser');
} catch (_) {
  RNAdvertiser = null;
}

let advertising = false;

export const isAdvertising = () => advertising;

export async function startBroadcasting(userId: string): Promise<void> {
  if (!userId) throw new Error('startBroadcasting: userId is required');

  // Build a compact payload announcing readiness to receive
  const payload = JSON.stringify({ t: 'READY', uid: userId, ts: Date.now() });

  // Prefer native advertiser on Android
  if (Platform.OS === 'android' && RNAdvertiser) {
    try {
      // Manufacturer data as byte array
      const manufacturerData: number[] = BLEUtils.stringToBytes(payload);

      // Use a default company ID (0xFFFF is reserved for testing)
      const manufacturerId = 0xffff;

      // Some implementations require setting company id first
      if (typeof RNAdvertiser.setCompanyId === 'function') {
        RNAdvertiser.setCompanyId(manufacturerId);
      }

      // Start BLE advertising with manufacturer data
      await RNAdvertiser.startBroadcast(
        {
          manufacturerId,
          manufacturerData,
          includeDeviceName: true,
          serviceUuids: [BLE_CONFIG.SERVICE_UUID],
        },
        {
          advertiseMode:
            RNAdvertiser.ADVERTISE_MODE_LOW_LATENCY ?? RNAdvertiser.ADVERTISE_MODE_LOW_POWER,
          txPowerLevel:
            RNAdvertiser.ADVERTISE_TX_POWER_HIGH ?? RNAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
          connectable: false,
          timeout: 0,
        }
      );

      advertising = true;
      return;
    } catch (err) {
      console.warn('BLE advertising failed, falling back to no-op:', err);
      // fallthrough to no-op
    }
  }

  // Fallback: no-op with logs so UI can still toggle without crashing
  advertising = true;
  console.warn(
    '[BLE] Advertising fallback active. Install and configure react-native-ble-advertiser for real broadcasting.'
  );
}

export async function stopBroadcasting(): Promise<void> {
  try {
    if (Platform.OS === 'android' && RNAdvertiser && advertising) {
      await RNAdvertiser.stopBroadcast();
    }
  } catch (err) {
    console.warn('Stop advertising error:', err);
  } finally {
    advertising = false;
  }
}

