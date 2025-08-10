import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { startBroadcasting, stopBroadcasting, isAdvertising as getAdvertising } from '../../components/ble/broadcaster';
import { router } from 'expo-router';

// Receiver screen only toggles broadcasting; no card or scanning logic here.

export default function BLEReceiverScreen() {
  const [scanStatus, setScanStatus] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Initialize current advertising state when screen mounts
  // (native advertiser may set this outside React's state)
  // No scanning or BLE manager setup here.

  useEffect(() => {
    setIsBroadcasting(getAdvertising());
  }, []);

  const onToggleBroadcast = async () => {
    try {
      if (!isBroadcasting) {
        // TODO: replace with actual authenticated user id
        const userId = 'debug-user-id';
        await startBroadcasting(userId);
        setIsBroadcasting(true);
        setScanStatus('Receiving On — You are visible to others nearby.');
      } else {
        await stopBroadcasting();
        setIsBroadcasting(false);
        setScanStatus('Receiving Off');
      }
    } catch (e) {
      Alert.alert('Broadcast Error', 'Failed to toggle receiving.');
    }
  };

  // Scanning logic intentionally removed; will be handled on a separate screen/flow

  // stopScanning removed

  // Receiving connections removed from this screen

  // showReceivedCard removed

  // cleanup removed

  // renderScannedDevice removed

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Receive Cards</Text>
            <Text className="text-gray-600 text-sm mt-1">Let others find you and send cards</Text>
          </View>
        </View>
        <View />
      </View>
      {/* Centered Receiving toggle */}
      <View className="mt-3 items-center">
        <TouchableOpacity
          onPress={onToggleBroadcast}
          className={`${isBroadcasting ? 'bg-blue-600' : 'bg-gray-300'} px-6 py-3 rounded-full shadow`}
        >
          <Text className="text-white font-semibold">
            {isBroadcasting ? 'Receiving On' : 'Receiving Off'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Status Bar */}
    {scanStatus !== '' && (
      <View className="bg-blue-50 px-4 py-3 border-b border-blue-100">
        <View className="flex-row items-center justify-center">
          <Ionicons name={isBroadcasting ? 'radio' : 'pause-circle'} size={16} color={isBroadcasting ? '#2563EB' : '#6B7280'} />
          <Text className={`font-medium ml-2 ${isBroadcasting ? 'text-blue-700' : 'text-gray-600'}`}>{scanStatus}</Text>
        </View>
      </View>
    )}

    {/* Main Content */}
    <View className="flex-1 px-4 py-6 items-center justify-center">
      <View className={`w-full rounded-2xl p-6 ${isBroadcasting ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <View className="items-center">
          <Ionicons name={isBroadcasting ? 'radio' : 'pause'} size={48} color="#FFFFFF" />
          <Text className="text-white font-bold text-xl mt-3">
            {isBroadcasting ? 'Receiving On' : 'Receiving Off'}
          </Text>
          <Text className="text-white/90 mt-2 text-center">
            {isBroadcasting
              ? 'You are visible to others. Keep this screen open to receive cards.'
              : 'You are not visible to others. Toggle Receiving to start.'}
          </Text>
        </View>
      </View>

      </View>

      {/* Instructions */}
      <View className="bg-white p-4 border-t border-gray-100">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={16} color="#059669" />
          <Text className="text-green-800 font-medium ml-2">How to receive</Text>
        </View>
        <Text className="text-gray-600 text-sm">
          Turn on Receiving to broadcast yourself. Others nearby can find you and send their travel cards to you.
        </Text>
      </View>
    </View>
  );
}