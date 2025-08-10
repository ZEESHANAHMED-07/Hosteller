import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BleManager, Device } from 'react-native-ble-plx';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { BLE_ERRORS } from '../../components/ble/utils/bleUtils';
import { startPeerScan, connectAndSendCard, ScannedPeer } from '../../components/ble/scanner';
import { router } from 'expo-router';

interface TravelerCard {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
}

export default function BLESenderScreen() {
  const [bleManager] = useState(() => new BleManager());
  const [cards, setCards] = useState<TravelerCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TravelerCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transmissionStatus, setTransmissionStatus] = useState<string>('');
  const [peers, setPeers] = useState<ScannedPeer[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedPeer, setSelectedPeer] = useState<ScannedPeer | null>(null);
  const scanCtlRef = React.useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    initializeBLE();
    fetchCards();
    return () => {
      (async () => {
        try { await scanCtlRef.current?.stop(); } catch {}
        try { bleManager.destroy(); } catch {}
      })();
    };
  }, []);

  const initializeBLE = async () => {
    try {
      const state = await bleManager.state();
      if (state !== 'PoweredOn') {
        Alert.alert('Bluetooth Error', BLE_ERRORS.BLUETOOTH_OFF);
        return;
      }
    } catch (error) {
      console.error('BLE initialization error:', error);
      Alert.alert('Error', 'Failed to initialize Bluetooth');
    }
  };

  const fetchCards = async () => {
    try {
      const q = query(collection(db, 'travelerCards'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: TravelerCard[] = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as TravelerCard[];
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      Alert.alert('Error', 'Failed to fetch cards');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScan = async () => {
    try {
      if (!isScanning) {
        console.log('[BLE][scan] starting scan...');
        setTransmissionStatus('Scanning for receivers nearby...');
        const ctl = startPeerScan(
          bleManager,
          {
            onUpdate: (list) => {
              setPeers(list);
              try {
                const summary = list.map(p => `${p.name || 'User'}(${p.id.slice(-4)}) rssi=${p.rssi}`).join(', ');
                console.log(`[BLE][scan] peers=${list.length}:`, summary || '(none)');
              } catch {}
            },
            onError: e => console.warn('[BLE][scan] error', e),
          },
          { maxDistanceMeters: 100, minRssi: -95, timeoutMs: 10000 }
        );
        scanCtlRef.current = ctl;
        setIsScanning(true);
      } else {
        console.log('[BLE][scan] stopping scan...');
        await scanCtlRef.current?.stop();
        scanCtlRef.current = null;
        setIsScanning(false);
        setTransmissionStatus('');
      }
    } catch (e) {
      Alert.alert('Scan Error', 'Unable to start/stop scanning');
    }
  };

  const pickPeerAndSend = async (card: TravelerCard) => {
    if (!selectedPeer) return;
    try {
      setTransmissionStatus('Sending card...');
      await scanCtlRef.current?.stop();
      setIsScanning(false);
      setSelectedCard(card);
      await connectAndSendCard(selectedPeer, card.id, card.fullName);
      setTransmissionStatus('Card shared successfully!');
      Alert.alert('Success', `Travel card "${card.fullName}" has been shared!`);
      setSelectedPeer(null);
      setSelectedCard(null);
    } catch (e) {
      console.error('Send error', e);
      Alert.alert('Error', 'Failed to send card');
    }
  };

  // removed obsolete sendCardData (handled by connectAndSendCard)

  // cleanup moved into effect return

  const renderCard = ({ item }: { item: TravelerCard }) => (
    <TouchableOpacity
      onPress={() => pickPeerAndSend(item)}
      disabled={!selectedPeer}
      className={`bg-white rounded-2xl p-6 mb-4 shadow-lg border ${
        selectedCard?.id === item.id ? 'border-blue-500' : 'border-gray-100'
      } ${!selectedPeer ? 'opacity-50' : ''}`}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mr-4">
          <Ionicons name="person" size={32} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">{item.fullName}</Text>
          <Text className="text-blue-600 text-sm">{item.country}</Text>
        </View>
        {selectedCard?.id === item.id && (
          <View className="flex-row items-center">
            <Ionicons name="paper-plane" size={16} color="#3B82F6" />
            <Text className="text-blue-600 text-sm ml-2">Ready to Send</Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-700 mb-4" numberOfLines={2}>
        {item.bio}
      </Text>
      
      <View className="flex-row justify-between">
        <Text className="text-gray-500 text-sm">📧 {item.email}</Text>
        <Text className="text-gray-500 text-sm">📱 {item.phone}</Text>
      </View>
      
      {true && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row items-center justify-center">
            <Ionicons name="send" size={16} color="#3B82F6" />
            <Text className="text-blue-600 font-medium ml-2">Tap to Send to selected user</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPeer = ({ item }: { item: ScannedPeer }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeer(item)}
      className={`bg-white rounded-2xl p-4 mb-3 border ${selectedPeer?.id === item.id ? 'border-blue-500' : 'border-gray-100'}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-3">
            <Ionicons name="radio" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-gray-900 font-semibold">{item.name || 'Nearby User'}</Text>
            <Text className="text-gray-500 text-xs">RSSI {item.rssi} dBm {item.distanceMeters ? `· ~${item.distanceMeters.toFixed(1)}m` : ''}</Text>
          </View>
        </View>
        {selectedPeer?.id === item.id && (
          <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
        <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Share Cards</Text>
          </View>
        </View>
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading your cards...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
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
              <Text className="text-2xl font-bold text-gray-900">Share Cards</Text>
              <Text className="text-gray-600 text-sm mt-1">Scan others nearby, then choose a card to send</Text>
            </View>
          </View>
          <View />
        </View>
        {/* Centered Scan toggle */}
        <View className="mt-3 items-center">
          <TouchableOpacity
            onPress={toggleScan}
            className={`${isScanning ? 'bg-blue-600' : 'bg-gray-300'} px-6 py-3 rounded-full shadow`}
          >
            <Text className="text-white font-semibold">
              {isScanning ? 'Stop Scanning' : 'Scan Others Nearby'}
            </Text>
          </TouchableOpacity>
          {!!peers.length && (
            <Text className="text-gray-600 mt-2">Found {peers.length} user{peers.length === 1 ? '' : 's'}</Text>
          )}
        </View>
      </View>

      {/* Status Bar */}
      {transmissionStatus && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-100">
          <View className="flex-row items-center">
            <Ionicons name="radio" size={16} color="#3B82F6" />
            <Text className="text-blue-700 font-medium ml-2">{transmissionStatus}</Text>
          </View>
        </View>
      )}

      {/* Content: Either peers list or cards list */}
      {selectedPeer ? (
        cards.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <View className="w-24 h-24 bg-gray-100 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="albums-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-xl mb-2">No Cards Available</Text>
            <Text className="text-gray-600 text-center mb-8">
              Create some travel cards first to share them with other travelers
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/cards/createcards')}
              className="bg-blue-500 px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-semibold text-lg">Create First Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <FlatList
          data={peers}
          renderItem={renderPeer}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center px-4 mt-24">
              <Text className="text-gray-600">Press "Scan Others Nearby" to discover receivers</Text>
            </View>
          )}
        />
      )}

      {/* Instructions */}
      <View className="bg-white p-4 border-t border-gray-100">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={16} color="#3B82F6" />
          <Text className="text-blue-800 font-medium ml-2">How it works</Text>
        </View>
        <Text className="text-gray-600 text-sm">
          1) Tap "Scan Others Nearby" and select a user. 2) Choose one of your cards to send it to them.
        </Text>
      </View>
    </View>
  );
}