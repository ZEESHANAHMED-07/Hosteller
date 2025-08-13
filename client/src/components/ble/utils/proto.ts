// BLE Protocol utilities for packing/unpacking payloads

/**
 * Packs BLE payload: version (1), code (3), flags (1), letter (1) => Uint8Array(6)
 */
export function packPayload(version: number, code: string, flags: number, letter: string): Uint8Array {
  if (typeof code !== 'string' || code.length !== 6) throw new Error('code must be 6 hex chars');
  if (typeof letter !== 'string' || letter.length !== 1) throw new Error('letter must be 1 char');
  const buf = new Uint8Array(6);
  buf[0] = version & 0xff;
  // code: 3 bytes hex string (6 chars)
  for (let i = 0; i < 3; ++i) {
    buf[1 + i] = parseInt(code.substr(i * 2, 2), 16);
  }
  buf[4] = flags & 0xff;
  buf[5] = letter.charCodeAt(0) & 0xff;
  return buf;
}

/**
 * Unpacks BLE payload Uint8Array(6) => { version, code, flags, letter }
 */
export function unpackPayload(buf: Uint8Array) {
  if (!(buf instanceof Uint8Array) || buf.length !== 6) throw new Error('payload must be 6 bytes');
  const version = buf[0];
  const code = [...buf.slice(1, 4)].map(b => b.toString(16).padStart(2, '0')).join('');
  const flags = buf[4];
  const letter = String.fromCharCode(buf[5]);
  return { version, code, flags, letter };
}

/**
 * Generates a random 3-byte (6 hex chars) code
 */
export function randomCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
