import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CardManagementScreen() {
  const handleCreateCard = () => {
    router.push('/cards/createcards');
  };

  const handleMyCards = () => {
    router.push('/cards/mycards');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">My Travel Cards</Text>
            <Text className="text-gray-600 text-sm mt-1">Manage your digital identity</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="notifications-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-4 py-8">
          <View className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 shadow-xl mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white font-bold text-xl mb-1">Welcome Back!</Text>
                <Text className="text-blue-100 text-sm">Ready to connect with travelers?</Text>
              </View>
              <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
                <Ionicons name="card" size={32} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">3</Text>
                <Text className="text-blue-200 text-xs">Active Cards</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">127</Text>
                <Text className="text-blue-200 text-xs">Connections</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">15</Text>
                <Text className="text-blue-200 text-xs">Countries</Text>
              </View>
            </View>
          </View>

          {/* Main Action Buttons */}
          <View className="mb-8">
            <Text className="text-gray-800 font-bold text-xl mb-6">Quick Actions</Text>
            
            <View className="space-y-4">
              {/* Create Cards Button */}
              <TouchableOpacity
                onPress={handleCreateCard}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="add-circle" size={32} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">Create Cards</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      Design new travel cards for different destinations
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
                
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-green-700 text-sm font-medium">✨ Easy templates</Text>
                    <Text className="text-green-700 text-sm font-medium">🎨 Custom designs</Text>
                    <Text className="text-green-700 text-sm font-medium">⚡ Quick setup</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* My Cards Button */}
              <TouchableOpacity
                onPress={handleMyCards}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="albums" size={32} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">My Cards</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      View, edit, and manage your existing travel cards
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
                
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-blue-700 text-sm font-medium">📝 Edit anytime</Text>
                    <Text className="text-blue-700 text-sm font-medium">📊 View stats</Text>
                    <Text className="text-blue-700 text-sm font-medium">🔄 Share easily</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Home Button */}
              <TouchableOpacity
                onPress={handleHome}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-gradient-to-br from-gray-400 to-slate-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="home" size={32} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">Home</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      Go back to the main screen
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Cards Preview */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-bold text-xl">Recent Cards</Text>
              <TouchableOpacity onPress={handleMyCards}>
                <Text className="text-blue-600 font-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              {/* Card 1 */}
              <View className="bg-gradient-to-br from-orange-400 to-red-500 w-72 rounded-2xl p-6 mr-4 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white font-bold text-lg">Adventure Explorer</Text>
                    <Text className="text-orange-100 text-sm">Backpacking Card</Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Ionicons className="mountain" size={24} color="white" />
                  </View>
                </View>
                <Text className="text-orange-100 text-sm mb-3">
                  "Love hiking mountains and exploring remote places..."
                </Text>
                <Text className="text-white/80 text-xs">Last shared: 2 hours ago</Text>
              </View>

              {/* Card 2 */}
              <View className="bg-gradient-to-br from-teal-400 to-blue-500 w-72 rounded-2xl p-6 mr-4 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white font-bold text-lg">City Explorer</Text>
                    <Text className="text-teal-100 text-sm">Urban Travel Card</Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Ionicons name="business" size={24} color="white" />
                  </View>
                </View>
                <Text className="text-teal-100 text-sm mb-3">
                  "Passionate about discovering hidden city gems..."
                </Text>
                <Text className="text-white/80 text-xs">Last shared: 1 day ago</Text>
              </View>

              {/* Card 3 */}
              <View className="bg-gradient-to-br from-purple-400 to-pink-500 w-72 rounded-2xl p-6 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white font-bold text-lg">Beach Lover</Text>
                    <Text className="text-purple-100 text-sm">Coastal Card</Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Ionicons name="sunny" size={24} color="white" />
                  </View>
                </View>
                <Text className="text-purple-100 text-sm mb-3">
                  "Always chasing sunsets and perfect waves..."
                </Text>
                <Text className="text-white/80 text-xs">Last shared: 3 days ago</Text>
              </View>
            </ScrollView>
          </View>

          {/* Quick Tips */}
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 font-bold text-lg">Pro Tips</Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-blue-600 text-xs font-bold">1</Text>
                </View>
                <Text className="text-gray-700 text-sm flex-1">Create different cards for different travel styles (adventure, luxury, budget)</Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-green-600 text-xs font-bold">2</Text>
                </View>
                <Text className="text-gray-700 text-sm flex-1">Keep your cards updated with current location and travel plans</Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-purple-600 text-xs font-bold">3</Text>
                </View>
                <Text className="text-gray-700 text-sm flex-1">Use eye-catching designs to make memorable first impressions</Text>
              </View>
            </View>
          </View>

          {/* Feature Highlights */}
          <View className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
            <Text className="text-indigo-900 font-bold text-lg mb-4 text-center">Why Use Travel Cards?</Text>
            
            <View className="flex-row flex-wrap justify-between">
              <View className="items-center w-1/3 mb-4">
                <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="flash" size={24} color="#4F46E5" />
                </View>
                <Text className="text-indigo-800 text-sm font-medium text-center">Instant</Text>
                <Text className="text-indigo-600 text-xs text-center">Quick sharing</Text>
              </View>
              
              <View className="items-center w-1/3 mb-4">
                <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
                </View>
                <Text className="text-indigo-800 text-sm font-medium text-center">Secure</Text>
                <Text className="text-indigo-600 text-xs text-center">Safe contacts</Text>
              </View>
              
              <View className="items-center w-1/3 mb-4">
                <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="globe" size={24} color="#4F46E5" />
                </View>
                <Text className="text-indigo-800 text-sm font-medium text-center">Global</Text>
                <Text className="text-indigo-600 text-xs text-center">Worldwide use</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}