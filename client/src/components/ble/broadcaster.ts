import { Platform } from 'react-native';
import { BLE_CONFIG, BLEUtils, AdvCodec, AdvOpcode } from './utils/bleUtils';
import { ensureBlePermissions } from './utils/permissions';

// Optional native advertiser (react-native-ble-advertiser) if installed
let RNAdvertiser: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNAdvertiser = require('react-native-ble-advertiser');
} catch (_) {
  RNAdvertiser = null;
}

let advertising = false;
let currentMode: 'READY' | 'REQUEST' | 'ACCEPT' | null = null;

export const isAdvertising = () => advertising;

export async function startBroadcasting(userId: string): Promise<void> {
  if (!userId) throw new Error('startBroadcasting: userId is required');
  console.log('[BLE][broadcast] startBroadcasting called with userId:', userId);

  // Use a tiny payload to stay under 31-byte legacy advertising limit
  // We'll send only the first letter of the user's name.
  const firstLetter = String(userId).trim().charAt(0) || '?';

  // Prefer native advertiser on Android
  if (Platform.OS === 'android' && RNAdvertiser) {
    try {
      console.log('[BLE][broadcast] RNAdvertiser detected. Requesting permissions...');
      const granted = await ensureBlePermissions();
      console.log('[BLE][broadcast] permissions granted?', granted);
      if (!granted) throw new Error('Bluetooth permissions not granted');
      // Manufacturer data: single byte = first letter (uppercase) for READY mode (back-compat)
      const letter = firstLetter.toUpperCase();
      const manufacturerData: number[] = [ letter.charCodeAt(0) ];
      console.log('[BLE][broadcast] advertising letter:', letter, 'code:', manufacturerData[0]);

      // Use a default company ID (0xFFFF is reserved for testing)
      const manufacturerId = 0xffff;

      // Some implementations require setting company id first
      if (typeof RNAdvertiser.setCompanyId === 'function') {
        console.log('[BLE][broadcast] calling setCompanyId', manufacturerId);
        RNAdvertiser.setCompanyId(manufacturerId);
      }

      // Start BLE advertising with manufacturer data using native API: broadcast(uid, payload, options)
      const options = {
        // Device name increases payload size; disable to avoid exceeding 31 bytes
        includeDeviceName: false,
        includeTxPowerLevel: false,
        advertiseMode:
          RNAdvertiser.ADVERTISE_MODE_LOW_LATENCY ?? RNAdvertiser.ADVERTISE_MODE_LOW_POWER,
        txPowerLevel:
          RNAdvertiser.ADVERTISE_TX_POWER_HIGH ?? RNAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
        connectable: true,
        reportDelay: 0,
      } as const;
      console.log('[BLE][broadcast] starting broadcast with serviceUuid, options:', BLE_CONFIG.SERVICE_UUID, options);
      const maybePromise = RNAdvertiser.broadcast(
        BLE_CONFIG.SERVICE_UUID,
        manufacturerData,
        options
      );

      // Optimistically set state; some devices resolve the promise late
      advertising = true;
      currentMode = 'READY';
      console.log('[BLE][broadcast] broadcast invoked; advertising set true optimistically');

      if (maybePromise && typeof maybePromise.then === 'function') {
        (maybePromise as Promise<any>)
          .then((res) => console.log('[BLE][broadcast] native onStartSuccess', res))
          .catch((err) => console.warn('[BLE][broadcast] native onStartFailure', err));
      }
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
  console.log('[BLE][broadcast] stopBroadcasting called. advertising?', advertising);
  try {
    if (Platform.OS === 'android' && RNAdvertiser && advertising) {
      console.log('[BLE][broadcast] calling RNAdvertiser.stopBroadcast()');
      await RNAdvertiser.stopBroadcast();
    }
  } catch (err) {
    console.warn('Stop advertising error:', err);
  } finally {
    advertising = false;
    console.log('[BLE][broadcast] advertising set to false');
    currentMode = null;
  }
}

// ---- TLV based one-shot broadcasts ----

async function ensureReady(): Promise<void> {
  const granted = await ensureBlePermissions();
  if (!granted) throw new Error('Bluetooth permissions not granted');
}

function bytesToNumberArray(bytes: Uint8Array): number[] {
  return Array.from(bytes);
}

async function startTlvBroadcast(frameBytes: Uint8Array, logLabel: string) {
  if (Platform.OS !== 'android' || !RNAdvertiser) {
    console.warn('[BLE][broadcast]', logLabel, 'fallback/no-op (android only with RNAdvertiser)');
    advertising = true;
    currentMode = null;
    return;
  }
  await ensureReady();
  const manufacturerId = 0xffff;
  if (typeof RNAdvertiser.setCompanyId === 'function') {
    RNAdvertiser.setCompanyId(manufacturerId);
  }
  const options = {
    includeDeviceName: false,
    includeTxPowerLevel: false,
    advertiseMode: RNAdvertiser.ADVERTISE_MODE_LOW_LATENCY ?? RNAdvertiser.ADVERTISE_MODE_LOW_POWER,
    txPowerLevel: RNAdvertiser.ADVERTISE_TX_POWER_HIGH ?? RNAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
    connectable: false,
    reportDelay: 0,
  } as const;
  console.log('[BLE][broadcast]', logLabel, 'len', frameBytes.length, 'options', options);
  const maybePromise = RNAdvertiser.broadcast(
    BLE_CONFIG.SERVICE_UUID,
    bytesToNumberArray(frameBytes),
    options
  );
  advertising = true;
  if (maybePromise && typeof maybePromise.then === 'function') {
    (maybePromise as Promise<any>).then(() => {
      console.log('[BLE][broadcast]', logLabel, 'native onStartSuccess');
    }).catch((e: any) => console.warn('[BLE][broadcast]', logLabel, 'native onStartFailure', e));
  }
}

export async function startRequestBroadcast(params: {
  letter: string;
  nonce: Uint8Array; // 4 bytes
  cardIdShort: string;
  autoStopMs?: number; // default 2000ms
}) {
  const { letter, nonce, cardIdShort, autoStopMs = 2000 } = params;
  const frame = AdvCodec.encode({
    opcode: AdvOpcode.REQUEST,
    letterCode: AdvCodec.letterToCode(letter),
    nonce,
    cardIdShort,
  });
  await startTlvBroadcast(frame, 'REQUEST');
  currentMode = 'REQUEST';
  if (autoStopMs > 0) setTimeout(() => { stopBroadcasting().catch(()=>{}); }, autoStopMs);
}

export async function startAcceptBroadcast(params: {
  letter: string;
  nonce: Uint8Array; // echo sender's nonce
  cardIdShort: string;
  autoStopMs?: number; // default 2000ms
}) {
  const { letter, nonce, cardIdShort, autoStopMs = 2000 } = params;
  const frame = AdvCodec.encode({
    opcode: AdvOpcode.ACCEPT,
    letterCode: AdvCodec.letterToCode(letter),
    nonce,
    cardIdShort,
  });
  await startTlvBroadcast(frame, 'ACCEPT');
  currentMode = 'ACCEPT';
  if (autoStopMs > 0) setTimeout(() => { stopBroadcasting().catch(()=>{}); }, autoStopMs);
}

