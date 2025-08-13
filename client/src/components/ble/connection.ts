import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { BLE_CONFIG } from './utils/bleUtils';

const bleManager = new BleManager();

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
  return new Promise((resolve, reject) => {
    let found = false;
    // Start scanning for devices advertising our Service UUID
    bleManager.startDeviceScan([serviceUuid], null, async (error, device) => {
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
              char.monitor((err, c) => {
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


