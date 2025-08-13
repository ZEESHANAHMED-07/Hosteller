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
import { getAuth } from 'firebase/auth';
import { BLE_ERRORS } from '../../components/ble/utils/bleUtils';
import { startPeerScan, ScannedPeer } from '../../components/ble/scanner';
import { sendCardId } from '../../components/ble/connection';
import { router } from 'expo-router';

interface Card {
  id: string;
  type: string;
  title: string;
  email: string;
  phone: string;
  socialLinks?: string[];
  createdAt?: any;
  updatedAt?: any;
}


export default function BLESenderScreen() {
  const [bleManager] = useState(() => new BleManager());
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transmissionStatus, setTransmissionStatus] = useState<string>('');
  const [peers, setPeers] = useState<ScannedPeer[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedPeer, setSelectedPeer] = useState<ScannedPeer | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
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

  // Refresh cards each time a peer is selected
  useEffect(() => {
    if (selectedPeer) {
      setIsLoading(true);
      fetchCards();
    }
  }, [selectedPeer]);

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
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not signed in');
      const qRef = query(
        collection(db, 'users', user.uid, 'cards'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(qRef);
      const rows: Card[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title || '',
          email: data.email || '',
          phone: data.phone || '',
          socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
          type: data.type || 'business',
          createdAt: data.createdAt,
        };
      });
      setCards(rows);
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
                const display = (p: ScannedPeer) => {
                  const ch = (p.payload?.uid?.trim()?.charAt(0) || p.name?.trim()?.charAt(0) || 'U');
                  return ch.toUpperCase();
                };
                const summary = list.map(p => `${display(p)}(${p.id.slice(-4)}) rssi=${p.rssi}`).join(', ');
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

  const pickPeerAndSend = async (card: Card) => {
    if (!selectedPeer) return;
    if (isSending) {
      console.log('[sender] send in progress, ignoring tap');
      return;
    }
    try {
      setIsSending(true);
      setTransmissionStatus('Sending card...');
      await scanCtlRef.current?.stop();
      setIsScanning(false);
      setSelectedCard(card);
      console.log('[sender] sending cardId to device', selectedPeer.id, card.id);
      await sendCardId(selectedPeer.device, card.id, card.title, { disconnectAfter: true });
      setTransmissionStatus('Card shared successfully!');
      Alert.alert('Success', `Travel card "${card.title}" has been shared!`);
      setSelectedPeer(null);
      setSelectedCard(null);
    } catch (e) {
      console.error('Send error', e);
      Alert.alert('Error', 'Failed to send card');
    } finally {
      setIsSending(false);
    }
  };

  const renderCard = ({ item }: { item: Card }) => (
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
          <Text className="text-xl font-bold text-gray-900">{item.title}</Text>
          <Text className="text-blue-600 text-sm">{item.type}</Text>
        </View>
        {selectedCard?.id === item.id && (
          <View className="flex-row items-center">
            <Ionicons name="paper-plane" size={16} color="#3B82F6" />
            <Text className="text-blue-600 text-sm ml-2">Ready to Send</Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-700 mb-4" numberOfLines={2}>
        {item.socialLinks ? item.socialLinks.join(', ') : ''}
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
            <Text className="text-gray-900 font-semibold">{
              (item.payload?.uid?.trim()?.charAt(0) || item.name?.trim()?.charAt(0) || 'U').toUpperCase()
            }</Text>
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
        <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Header */}
          <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setSelectedPeer(null)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
                >
                  <Ionicons name="arrow-back" size={20} color="#374151" />
                </TouchableOpacity>
                <View>
                  <Text className="text-2xl font-bold text-gray-900">Send Card</Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {cards.length} card{cards.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/cards/createtypes')}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="add" size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6, fontSize: 14 }}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {cards.length === 0 ? (
            <View className="flex-1 items-center justify-center px-4">
              <View className="w-24 h-24 bg-gray-100 rounded-3xl items-center justify-center mb-6">
                <Ionicons name="albums-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-bold text-xl mb-2">No Cards Yet</Text>
              <Text className="text-gray-600 text-center mb-8 leading-6">
                Create your first card to start networking and connecting with people around the world
              </Text>
            </View>
          ) : (
            <FlatList
              data={cards}
              renderItem={renderCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            />
          )}
        </View>
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