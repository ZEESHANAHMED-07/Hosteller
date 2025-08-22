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

// Avoid importing native BLE module at top-level to prevent web/SSR crashes
type BleManager = any;
import { Platform } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { BLE_ERRORS } from '../../components/ble/utils/bleUtils';
import { startPeerScan, ScannedPeer } from '../../components/ble/scanner';
import { sendCardId } from '../../components/ble/connection';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const [bleManager] = useState<BleManager | null>(() => {
    if (Platform.OS === 'web') return null;
    try {
      const { BleManager: Manager } = require('react-native-ble-plx');
      return new Manager();
    } catch (e) {
      console.warn('[BLE] module not available', e);
      return null;
    }
  });
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
        try { bleManager?.destroy(); } catch {}
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
      if (!bleManager) {
        console.warn('[BLE] Not supported on web');
        return;
      }
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
      if (!bleManager) {
        Alert.alert('Not supported', 'BLE scanning is not available on web.');
        return;
      }
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
      className={`rounded-2xl p-6 mb-4 shadow-lg border ${!selectedPeer ? 'opacity-50' : ''}`}
      style={{ backgroundColor: colors.card, borderColor: selectedCard?.id === item.id ? colors.primary : colors.border }}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.surface }}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: colors.text }}>{item.title}</Text>
          <Text className="text-sm" style={{ color: colors.primary }}>{item.type}</Text>
        </View>
        {selectedCard?.id === item.id && (
          <View className="flex-row items-center">
            <Ionicons name="paper-plane" size={16} color={colors.primary} />
            <Text className="text-sm ml-2" style={{ color: colors.primary }}>Ready to Send</Text>
          </View>
        )}
      </View>
      
      <Text className="mb-4" style={{ color: colors.textSecondary }} numberOfLines={2}>
        {item.socialLinks ? item.socialLinks.join(', ') : ''}
      </Text>
      
      <View className="flex-row justify-between">
        <Text className="text-sm" style={{ color: colors.textSecondary }}>📧 {item.email}</Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>📱 {item.phone}</Text>
      </View>
      
      {true && (
        <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <View className="flex-row items-center justify-center">
            <Ionicons name="send" size={16} color={colors.primary} />
            <Text className="font-medium ml-2" style={{ color: colors.primary }}>Tap to Send to selected user</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPeer = ({ item }: { item: ScannedPeer }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeer(item)}
      className={`rounded-2xl p-4 mb-3 border`}
      style={{ backgroundColor: colors.card, borderColor: selectedPeer?.id === item.id ? colors.primary : colors.border }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="radio" size={20} color={colors.primary} />
          </View>
          <View>
            <Text className="font-semibold" style={{ color: colors.text }}>{
              (item.payload?.uid?.trim()?.charAt(0) || item.name?.trim()?.charAt(0) || 'U').toUpperCase()
            }</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>RSSI {item.rssi} dBm {item.distanceMeters ? `· ~${item.distanceMeters.toFixed(1)}m` : ''}</Text>
          </View>
        </View>
        {selectedPeer?.id === item.id && (
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          className="pt-12 pb-6 px-4"
          style={{ backgroundColor: colors.header, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>Share Cards</Text>
          </View>
        </View>
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4" style={{ color: colors.textSecondary }}>Loading your cards...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="pt-12 pb-6 px-4"
        style={{ backgroundColor: colors.header, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>Share Cards</Text>
              <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>Scan others nearby, then choose a card to send</Text>
            </View>
          </View>
          <View />
        </View>
        {/* Centered Scan toggle */}
        <View className="mt-3 items-center">
          <TouchableOpacity
            onPress={toggleScan}
            className={`px-6 py-3 rounded-full shadow`}
            style={{ backgroundColor: isScanning ? colors.primary : colors.border }}
          >
            <Text className="text-white font-semibold">
              {isScanning ? 'Stop Scanning' : 'Scan Others Nearby'}
            </Text>
          </TouchableOpacity>
          {!!peers.length && (
            <Text className="mt-2" style={{ color: colors.textSecondary }}>Found {peers.length} user{peers.length === 1 ? '' : 's'}</Text>
          )}
        </View>
      </View>

      {/* Status Bar */}
      {transmissionStatus && (
        <View className="px-4 py-3" style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View className="flex-row items-center">
            <Ionicons name="radio" size={16} color={colors.primary} />
            <Text className="font-medium ml-2" style={{ color: colors.text }}>{transmissionStatus}</Text>
          </View>
        </View>
      )}

      {/* Content: Either peers list or cards list */}
      {selectedPeer ? (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View
            className="pt-12 pb-6 px-4 shadow-sm"
            style={{ backgroundColor: colors.header, borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setSelectedPeer(null)}
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View>
                  <Text className="text-2xl font-bold" style={{ color: colors.text }}>Send Card</Text>
                  <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {cards.length} card{cards.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/cards/createtypes')}
                style={{
                  backgroundColor: colors.primary,
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
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: 6, fontSize: 14 }}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {cards.length === 0 ? (
            <View className="flex-1 items-center justify-center px-4">
              <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6" style={{ backgroundColor: colors.surface }}>
                <Ionicons name="albums-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text className="font-bold text-xl mb-2" style={{ color: colors.text }}>No Cards Yet</Text>
              <Text className="text-center mb-8 leading-6" style={{ color: colors.textSecondary }}>
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
              <Text style={{ color: colors.textSecondary }}>Press "Scan Others Nearby" to discover receivers</Text>
            </View>
          )}
        />
      )}

      {/* Instructions */}
      <View className="p-4" style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text className="font-medium ml-2" style={{ color: colors.text }}>How it works</Text>
        </View>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          1) Tap "Scan Others Nearby" and select a user. 2) Choose one of your cards to send it to them.
        </Text>
      </View>
    </View>
  );
}