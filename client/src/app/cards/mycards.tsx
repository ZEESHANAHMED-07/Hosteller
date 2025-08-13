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
import { db, auth } from '../config/firebaseConfig';
import { router } from 'expo-router';

interface Card {
  id: string;
  title: string;
  email: string;
  phone: string;
  socialLinks: string[];
  type: 'business' | 'traveller' | 'social';
  createdAt?: any;
}

export default function MyCardsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setCards([]);
        setError(null);
        return;
      }

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

  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.title}" card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Sign in required');
                return;
              }
              await deleteDoc(doc(db, 'users', user.uid, 'cards', card.id));
              setCards(prev => prev.filter(c => c.id !== card.id));
              Alert.alert('Success', 'Card deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          }
        },
      ]
    );
  };

  const handleEditCard = (card: Card) => {
    // Navigate to create card screen with edit mode and card type
    router.push(`/cards/createcards?type=${card.type}&edit=true&cardId=${card.id}`);
  };

  const handleShareCard = (card: Card) => {
    // Simple share functionality - you can implement actual sharing later
    Alert.alert(
      'Share Card',
      `Share ${card.title}'s ${card.type} card`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            console.log('Sharing card:', card);
            // Here you can implement actual sharing functionality
            // like sharing via SMS, email, or social media
          }
        }
      ]
    );
  };
  
  const getCardTypeInfo = (type: string) => {
    switch (type) {
      case 'business':
        return { icon: 'briefcase-outline', color: 'blue', label: 'Business' };
      case 'traveller':
        return { icon: 'earth', color: 'green', label: 'Traveller' };
      case 'social':
        return { icon: 'chatbubble-ellipses-outline', color: 'purple', label: 'Social' };
      default:
        return { icon: 'card', color: 'gray', label: 'Card' };
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'business':
        return { backgroundColor: '#3B82F6' }; // blue-500
      case 'traveller':
        return { backgroundColor: '#10B981' }; // green-500
      case 'social':
        return { backgroundColor: '#8B5CF6' }; // purple-500
      default:
        return { backgroundColor: '#6B7280' }; // gray-500
    }
  };

  const renderItem = ({ item, index }: { item: Card; index: number }) => {
    const typeInfo = getCardTypeInfo(item.type);
    
    return (
      <View className="mb-4">
        {/* Enhanced Card Design */}
        <View style={[getCardStyle(item.type), { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }]}>
          {/* Card Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name={typeInfo.icon as any} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.title}</Text>
                <Text className="text-white/90 text-sm" numberOfLines={1}>{item.socialLinks?.[0] || ''}</Text>
                <View className="flex-row items-center mt-1">
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                    <Text className="text-white text-xs font-medium">{typeInfo.label}</Text>
                  </View>
                </View>
              </View>
            </View>
          
            {/* Quick Actions */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => handleShareCard(item)}
                style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
              >
                <Ionicons name="share-outline" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEditCard(item)}
                style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="pencil-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Social links preview */}
          {item.socialLinks?.length ? (
            <View className="mb-3">
              <Text className="text-white/90 text-xs" numberOfLines={2}>
                {item.socialLinks.slice(0, 2).join('  •  ')}
              </Text>
            </View>
          ) : null}
          
          {/* Contact Info */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="mail-outline" size={12} color="white" />
              <Text className="text-white/80 text-xs ml-1 flex-1" numberOfLines={1}>
                {item.email}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={12} color="white" />
              <Text className="text-white/80 text-xs ml-1">
                {item.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Action Bar */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, marginTop: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => handleShareCard(item)}
              className={`flex-row items-center ${typeInfo.color === 'blue' ? 'bg-blue-50' : typeInfo.color === 'green' ? 'bg-green-50' : 'bg-purple-50'} px-3 py-2 rounded-lg flex-1 mr-1`}
            >
              <Ionicons name="share-social" size={14} color={typeInfo.color === 'blue' ? '#1D4ED8' : typeInfo.color === 'green' ? '#059669' : '#7C3AED'} />
              <Text className={`${typeInfo.color === 'blue' ? 'text-blue-700' : typeInfo.color === 'green' ? 'text-green-700' : 'text-purple-700'} font-medium text-xs ml-1`}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleEditCard(item)}
              className="flex-row items-center bg-gray-50 px-3 py-2 rounded-lg flex-1 mx-1"
            >
              <Ionicons name="create-outline" size={14} color="#6B7280" />
              <Text className="text-gray-700 font-medium text-xs ml-1">Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleDeleteCard(item)}
              className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg flex-1 ml-1"
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text className="text-red-700 font-medium text-xs ml-1">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
    );
  };

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