import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  // API level detection: treat Android 12+ (SDK 31+) specially
  const sdkInt = (Platform as any).Version ?? 0;
  const isAndroid12Plus = Number(sdkInt) >= 31;

  // Build required permission list
  const perms: string[] = [];
  if (isAndroid12Plus) {
    perms.push(
      'android.permission.BLUETOOTH_ADVERTISE',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT'
    );
  } else {
    // Older Android needs location for BLE operations visibility
    perms.push(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION!,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!
    );
  }

  const results = await PermissionsAndroid.requestMultiple(perms as any);
  return Object.values(results).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
}
