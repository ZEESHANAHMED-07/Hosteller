import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';
import { ensureBlePermissions } from './utils/permissions';

export type ReadyAdvertPayload = {
  t: 'READY';
  uid: string; // receiver user id
  ts: number;  // epoch ms
};

export type ScannedPeer = {
  id: string;
  name: string | null;
  rssi: number;
  distanceMeters?: number;
  payload?: ReadyAdvertPayload;
  device: Device;
};

export type ScanCallbacks = {
  onUpdate?: (peers: ScannedPeer[]) => void;
  onError?: (e: unknown) => void;
};

export type ScanOptions = {
  // Approximate distance filter. Set to 100 to roughly target ~100m if possible.
  // BLE distance estimation is very rough and device dependent.
  maxDistanceMeters?: number;
  // Minimum RSSI to include (e.g., -90)
  minRssi?: number;
  // How long to scan in ms before auto-stop (0 = no auto-stop)
  timeoutMs?: number;
};

// Very rough distance estimation from RSSI. Assumes txPower -59 dBm at 1m.
function estimateDistanceFromRssi(rssi: number, measuredPower = -59): number {
  const ratio = (measuredPower - rssi) / (10 * 2); // path loss exponent ~2
  return Math.pow(10, ratio);
}

// Try to parse manufacturerData (base64) into our READY payload
function parseReadyPayloadFromManufacturerData(base64?: string): ReadyAdvertPayload | undefined {
  if (!base64) return undefined;
  try {
    const bytes = Buffer.from(base64, 'base64');
    // Many platforms include a 2-byte Company ID prefix in manufacturerData.
    // Our advertiser sets companyId=0xFFFF and then app payload bytes.
    const data = bytes.length >= 3 ? bytes.subarray(2) : bytes;
    
    // New format: single-letter (A-Z/a-z) indicates READY with that letter as name initial
    if (data.length === 1) {
      const code = data[0];
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (isLetter) {
        const letter = String.fromCharCode(code).toUpperCase();
        console.log('[BLE][scan] parsed single-letter READY payload', letter);
        return { t: 'READY', uid: letter, ts: Date.now() };
      }
    }
    // Backward compatible format: 'R' + UTF-8(name)
    if (data.length >= 1 && String.fromCharCode(data[0]) === 'R') {
      if (data.length > 1) {
        const name = Buffer.from(data.subarray(1)).toString('utf8');
        return { t: 'READY', uid: name, ts: Date.now() };
      }
      return { t: 'READY', uid: '', ts: Date.now() };
    }
    // Compact marker support: single byte 'R' indicates READY
    if (data.length === 1 && String.fromCharCode(data[0]) === 'R') {
      return { t: 'READY', uid: '', ts: Date.now() };
    }
    const json = bytes.toString('utf8');
    const parsed = JSON.parse(json);
    if (parsed && parsed.t === 'READY' && typeof parsed.uid === 'string') {
      return parsed as ReadyAdvertPayload;
    }
  } catch {
    // ignore non-json manufacturer data
  }
  return undefined;
}

export function startPeerScan(
  bleManager: BleManager,
  callbacks: ScanCallbacks = {},
  options: ScanOptions = {}
) {
  const peers: Record<string, ScannedPeer> = {};
  const { onUpdate, onError } = callbacks;
  const { maxDistanceMeters, minRssi = -95, timeoutMs = BLE_CONFIG.SCAN_TIMEOUT } = options;

  let timeoutId: any;
  let stopped = false;

  // Kick off asynchronously so callers don't need to await
  (async () => {
    try {
      console.log('[BLE][scan] requesting permissions...');
      const granted = await ensureBlePermissions();
      console.log('[BLE][scan] permissions granted?', granted);
      if (!granted) {
        onError?.(new Error('Bluetooth permissions not granted'));
        return;
      }
      if (stopped) return;
      console.log('[BLE][scan] starting device scan (low-latency, allowDuplicates)');
      bleManager.startDeviceScan(
        null,
        // Use low-latency to get results quicker and duplicates to keep RSSI fresh
        { allowDuplicates: true, scanMode: 2 /* ScanMode.LowLatency */ },
        (error, device) => {
          if (error) {
            onError?.(error);
            return;
          }
          if (!device) return;

          const rssi = device.rssi ?? -100;
          if (rssi < minRssi) return;

          const mfg = (device as any).manufacturerData as string | undefined;
          if (!mfg) {
            // Helpful debug to confirm scan is seeing the broadcaster at all
            console.log('[BLE][scan] device seen without manufacturerData', {
              id: device.id,
              name: device.name,
              rssi,
              serviceUUIDs: (device as any).serviceUUIDs,
            });
          }

          let payload = parseReadyPayloadFromManufacturerData(mfg);
          if (!payload) {
            // Fallback: if serviceUUIDs include our SERVICE_UUID, treat as READY
            const uuids: string[] | undefined = (device as any).serviceUUIDs;
            const target = BLE_CONFIG.SERVICE_UUID?.toLowerCase();
            const hasService = Array.isArray(uuids) && !!target && uuids.some(u => (u || '').toLowerCase() === target);
            if (hasService) {
              console.log('[BLE][scan] fallback READY via serviceUUID match for device', device.id);
              payload = { t: 'READY', uid: '', ts: Date.now() };
            } else {
              // Debug non-matching mfg to verify content length
              if (mfg) {
                try {
                  const bytes = Buffer.from(mfg, 'base64');
                  console.log('[BLE][scan] non-ready mfg len', bytes.length, 'firstByte', bytes[0]);
                } catch {}
              }
              return; // only list devices advertising READY (receivers)
            }
          }

          const distance = estimateDistanceFromRssi(rssi);
          if (typeof maxDistanceMeters === 'number' && distance > maxDistanceMeters) return;

          const entry: ScannedPeer = {
            id: device.id,
            name: device.name ?? null,
            rssi,
            distanceMeters: distance,
            payload,
            device,
          };
          peers[device.id] = entry;
          const list = Object.values(peers).sort((a, b) => (b.rssi - a.rssi));
          console.log('[BLE][scan] READY peers update count=', list.length);
          onUpdate?.(list);
        }
      );

      if (timeoutMs && timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          try { bleManager.stopDeviceScan(); } catch {}
        }, timeoutMs);
      }
    } catch (e) {
      onError?.(e);
    }
  })();

  return {
    stop: async () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        bleManager.stopDeviceScan();
      } catch (e) {
        onError?.(e);
      }
    },
  };
}

export async function connectAndSendCard(
  peer: ScannedPeer,
  cardDocId: string,
  senderName: string
): Promise<void> {
  // Build a TRAVEL_CARD packet the receiver will fetch from Firestore by docId
  const packet = BLEUtils.createPacket(cardDocId, senderName);
  const device = peer.device;

  let connected: Device | null = null;
  try {
    connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();

    const dataBytes = BLEUtils.stringToBytes(packet);
    const dataBase64 = Buffer.from(Uint8Array.from(dataBytes)).toString('base64');

    await connected.writeCharacteristicWithResponseForService(
      BLE_CONFIG.SERVICE_UUID,
      BLE_CONFIG.CHARACTERISTIC_UUID,
      dataBase64
    );
  } finally {
    try { await connected?.cancelConnection(); } catch {}
  }
}

