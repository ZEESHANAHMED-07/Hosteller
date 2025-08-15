// BLE Configuration and Utility Functions
import { Buffer } from 'buffer';

// BLE Service and Characteristic UUIDs
export const BLE_CONFIG = {
  SERVICE_UUID: '12345678-1234-1234-1234-123456789abc',
  CHARACTERISTIC_UUID: '87654321-4321-4321-4321-cba987654321',
  DEVICE_NAME_PREFIX: 'TravelCard_',
  SCAN_TIMEOUT: 10000, // 10 seconds
  CONNECTION_TIMEOUT: 5000, // 5 seconds
};

// String to Byte conversion utilities
export class BLEUtils {
  /**
   * Convert string to byte array for BLE transmission
   */
  static stringToBytes(str: string): number[] {
    const buffer = Buffer.from(str, 'utf8');
    return Array.from(buffer);
  }

  /**
   * Convert byte array to string from BLE reception
   */
  static bytesToString(bytes: number[]): string {
    const buffer = Buffer.from(bytes);
    return buffer.toString('utf8');
  }

  /**
   * Convert string to base64 encoded bytes (alternative method)
   */
  static stringToBase64Bytes(str: string): number[] {
    const base64 = Buffer.from(str, 'utf8').toString('base64');
    return Array.from(Buffer.from(base64, 'utf8'));
  }

  /**
   * Convert base64 bytes to string
   */
  static base64BytesToString(bytes: number[]): string {
    const base64String = Buffer.from(bytes).toString('utf8');
    return Buffer.from(base64String, 'base64').toString('utf8');
  }

  /**
   * Chunk data for BLE transmission (BLE has MTU limits)
   */
  static chunkData(data: string, chunkSize: number = 20): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Create device name with random suffix
   */
  static createDeviceName(cardName: string): string {
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${BLE_CONFIG.DEVICE_NAME_PREFIX}${cardName}_${suffix}`;
  }

  /**
   * Validate if string is a valid Firestore document ID
   */
  static isValidDocId(docId: string): boolean {
    // Firestore doc IDs are typically 20 characters long and alphanumeric
    const docIdRegex = /^[a-zA-Z0-9]{20}$/;
    return docIdRegex.test(docId) || docId.length > 0; // Allow custom IDs too
  }

  /**
   * Create transmission packet with metadata
   */
  static createPacket(docId: string, senderName: string): string {
    const packet = {
      type: 'TRAVEL_CARD',
      docId: docId,
      sender: senderName,
      timestamp: Date.now(),
      version: '1.0'
    };
    return JSON.stringify(packet);
  }

  /**
   * Parse received packet
   */
  static parsePacket(packetString: string): {
    type: string;
    docId: string;
    sender: string;
    timestamp: number;
    version: string;
  } | null {
    try {
      const packet = JSON.parse(packetString);
      if (packet.type === 'TRAVEL_CARD' && packet.docId) {
        return packet;
      }
      return null;
    } catch (error) {
      console.error('Error parsing packet:', error);
      return null;
    }
  }
}

// BLE Permission utilities
export const BLE_PERMISSIONS = {
  android: [
    'android.permission.BLUETOOTH',
    'android.permission.BLUETOOTH_ADMIN',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.BLUETOOTH_SCAN',
    'android.permission.BLUETOOTH_ADVERTISE',
    'android.permission.BLUETOOTH_CONNECT',
  ],
  ios: [
    'NSBluetoothAlwaysUsageDescription',
    'NSBluetoothPeripheralUsageDescription',
  ]
};

// Error messages
export const BLE_ERRORS = {
  BLUETOOTH_OFF: 'Bluetooth is turned off. Please enable Bluetooth.',
  PERMISSION_DENIED: 'Bluetooth permissions denied. Please grant permissions.',
  CONNECTION_FAILED: 'Failed to connect to device.',
  TRANSMISSION_FAILED: 'Failed to transmit data.',
  SCAN_TIMEOUT: 'Scan timeout. No devices found.',
  INVALID_DATA: 'Invalid data received.',
};

// ----- Advertising-only protocol (TLV over Manufacturer Data) -----
export enum AdvOpcode {
  REQUEST = 0x01,
  ACCEPT = 0x02,
  ACK = 0x03,
}

export type AdvFrame = {
  version: number; // currently 1
  opcode: AdvOpcode;
  letterCode: number; // 0..25 maps to A..Z
  nonce: Uint8Array; // 4 bytes
  cardIdShort: string; // compact representation (<= 16 bytes recommended)
};

export const AdvConfig = {
  version: 0x01,
  // Max bytes for cardIdShort inside manufacturer payload to keep within adv length
  maxCardIdBytes: 16,
};

export class AdvCodec {
  static letterToCode(letter: string): number {
    const c = (letter || 'A').trim().toUpperCase().charCodeAt(0);
    if (isNaN(c)) return 0;
    const code = c - 65;
    return code >= 0 && code < 26 ? code : 0;
  }

  static codeToLetter(code: number): string {
    const c = Math.max(0, Math.min(25, code | 0));
    return String.fromCharCode(65 + c);
  }

  static randomNonce(): Uint8Array {
    const arr = new Uint8Array(4);
    for (let i = 0; i < 4; i++) arr[i] = Math.floor(Math.random() * 256);
    return arr;
  }

  static toBytes(str: string): Uint8Array {
    return Uint8Array.from(BLEUtils.stringToBytes(str));
  }

  static fromBytes(bytes: Uint8Array): string {
    return BLEUtils.bytesToString(Array.from(bytes));
  }

  static bytesToBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64');
  }

  static base64ToBytes(b64: string): Uint8Array {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }

  /**
   * Encode a frame into Manufacturer Data bytes: [ver, opcode, letter, n0, n1, n2, n3, id...]
   */
  static encode(frame: Omit<AdvFrame, 'version'> & { version?: number }): Uint8Array {
    const ver = (frame.version ?? AdvConfig.version) & 0xff;
    const opcode = frame.opcode & 0xff;
    const letter = frame.letterCode & 0xff;
    const nonce = frame.nonce?.length === 4 ? frame.nonce : AdvCodec.randomNonce();
    const idBytesFull = AdvCodec.toBytes(frame.cardIdShort || '');
    const idBytes = idBytesFull.length > AdvConfig.maxCardIdBytes
      ? idBytesFull.slice(0, AdvConfig.maxCardIdBytes)
      : idBytesFull;
    const out = new Uint8Array(7 + idBytes.length);
    out[0] = ver; out[1] = opcode; out[2] = letter;
    out.set(nonce, 3);
    out.set(idBytes, 7);
    return out;
  }

  static decode(bytes: Uint8Array): AdvFrame | null {
    if (!bytes || bytes.length < 7) return null;
    const version = bytes[0];
    const opcode = bytes[1] as AdvOpcode;
    const letterCode = bytes[2];
    const nonce = bytes.slice(3, 7);
    const cardIdShort = AdvCodec.fromBytes(bytes.slice(7));
    return { version, opcode, letterCode, nonce, cardIdShort };
  }
}