import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { router } from 'expo-router';

interface TravelerCard {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  createdAt?: any;
}

export default function MyCardsScreen() {
  const [cards, setCards] = useState<TravelerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setError(null);
      const q = query(collection(db, 'travelerCards'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: TravelerCard[] = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as TravelerCard[];
      setCards(data);
    } catch (err: any) {
      console.error('Error fetching cards:', err);
      setError('Failed to fetch cards. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  const handleDeleteCard = (cardId: string, cardName: string) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${cardName}" card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'travelerCards', cardId));
              setCards(prev => prev.filter(card => card.id !== cardId));
              Alert.alert('Success', 'Card deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          }
        },
      ]
    );
  };

  const handleEditCard = (cardId: string) => {
    // Navigate to edit screen
    console.log('Edit card:', cardId);
    // router.push(`/edit-card/${cardId}`);
  };

  const handleShareCard = (card: TravelerCard) => {
    console.log('Share card:', card.fullName);
    // Implement share functionality
  };

  const getCardGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-indigo-600',
    ];
    return gradients[index % gradients.length];
  };

  const renderItem = ({ item, index }: { item: TravelerCard; index: number }) => (
    <View className="mb-6">
      {/* Main Card */}
      <View className={`bg-gradient-to-br ${getCardGradient(index)} rounded-3xl p-6 shadow-xl`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl">{item.fullName}</Text>
              <Text className="text-white/80 text-sm">{item.country}</Text>
            </View>
          </View>
          
          {/* Card Actions */}
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleShareCard(item)}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="share-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEditCard(item.id)}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="pencil-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text className="text-white/90 text-sm mb-4 leading-5" numberOfLines={2}>
          {item.bio}
        </Text>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="mail" size={14} color="white" />
            <Text className="text-white/80 text-xs ml-1" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="call" size={14} color="white" />
            <Text className="text-white/80 text-xs ml-1">
              {item.phone}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Bar */}
      <View className="bg-white rounded-2xl mt-2 p-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => handleShareCard(item)}
            className="flex-row items-center bg-blue-50 px-4 py-2 rounded-xl flex-1 mr-2"
          >
            <Ionicons name="share-social" size={16} color="#3B82F6" />
            <Text className="text-blue-600 font-medium text-sm ml-2">Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleEditCard(item.id)}
            className="flex-row items-center bg-green-50 px-4 py-2 rounded-xl flex-1 mx-1"
          >
            <Ionicons name="create" size={16} color="#059669" />
            <Text className="text-green-600 font-medium text-sm ml-2">Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDeleteCard(item.id, item.fullName)}
            className="flex-row items-center bg-red-50 px-4 py-2 rounded-xl flex-1 ml-2"
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
            <Text className="text-red-600 font-medium text-sm ml-2">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">My Cards</Text>
          </View>
        </View>
        
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          <Text className="text-gray-600 font-medium">Loading your cards...</Text>
          <Text className="text-gray-500 text-sm mt-1">Please wait a moment</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">My Cards</Text>
          </View>
        </View>
        
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-red-600 font-semibold text-lg text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchCards}
            className="bg-blue-500 px-6 py-3 rounded-xl mt-4"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">My Cards</Text>
              <Text className="text-gray-600 text-sm mt-1">
                {cards.length} card{cards.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => console.log('Create new card')}
            className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#3B82F6" />
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
            Create your first travel card to start connecting with fellow travelers around the world
          </Text>
          <TouchableOpacity
            onPress={() => console.log('Navigate to create card')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-2xl shadow-lg"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">Create First Card</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      )}
    </View>
  );
}