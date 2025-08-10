import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import { BLE_CONFIG, BLEUtils } from './utils/bleUtils';

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

  try {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        onError?.(error);
        return;
      }
      if (!device) return;

      const rssi = device.rssi ?? -100;
      if (rssi < minRssi) return;

      const payload = parseReadyPayloadFromManufacturerData((device as any).manufacturerData);
      if (!payload) return; // only list devices advertising READY (receivers)

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
      onUpdate?.(Object.values(peers).sort((a, b) => (b.rssi - a.rssi)));
    });

    let timeoutId: any;
    if (timeoutMs && timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        try {
          bleManager.stopDeviceScan();
        } catch {}
      }, timeoutMs);
    }

    return {
      stop: async () => {
        if (timeoutId) clearTimeout(timeoutId);
        try {
          bleManager.stopDeviceScan();
        } catch (e) {
          onError?.(e);
        }
      },
    };
  } catch (e) {
    onError?.(e);
    return {
      stop: async () => {
        try { bleManager.stopDeviceScan(); } catch {}
      },
    };
  }
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

