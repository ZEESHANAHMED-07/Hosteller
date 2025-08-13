import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CreateTypesScreen() {
  const handleBusinessCard = () => {
    router.push('/cards/createcards?type=business');
  };

  const handleTravellerCard = () => {
    router.push('/cards/createcards?type=traveller');
  };

  const handleSocialCard = () => {
    router.push('/cards/createcards?type=social');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={handleBack}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">CREATE CARD</Text>
            <Text className="text-blue-600 font-semibold text-base mt-1">Choose your card type</Text>
          </View>
          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* CARD TYPES Section */}
        <View className="px-6 py-6">
          <View className="mb-8">
            <View className="space-y-6">
              {/* Business Card */}
              <TouchableOpacity
                onPress={handleBusinessCard}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="briefcase-outline" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">BUSINESS CARD</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      Professional networking for business travelers
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
                
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-blue-700 text-sm font-medium">💼 Professional</Text>
                    <Text className="text-blue-700 text-sm font-medium">🤝 Networking</Text>
                    <Text className="text-blue-700 text-sm font-medium">📈 Business</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Traveller Card */}
              <TouchableOpacity
                onPress={handleTravellerCard}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-green-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="earth" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">TRAVELLER CARD</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      Connect with fellow adventurers and explorers
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
                
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-green-700 text-sm font-medium">🌍 Adventure</Text>
                    <Text className="text-green-700 text-sm font-medium">🎒 Backpacking</Text>
                    <Text className="text-green-700 text-sm font-medium">📍 Explore</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Social Card */}
              <TouchableOpacity
                onPress={handleSocialCard}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-purple-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                    <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">SOCIAL CARD</Text>
                    <Text className="text-gray-600 text-sm leading-5">
                      Make friends and build social connections
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
                
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-purple-700 text-sm font-medium">👥 Social</Text>
                    <Text className="text-purple-700 text-sm font-medium">🎉 Fun</Text>
                    <Text className="text-purple-700 text-sm font-medium">💬 Connect</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
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
        </View>
      </ScrollView>
    </View>
  );
}
