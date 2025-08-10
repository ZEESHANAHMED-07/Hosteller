import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SharingIndexScreen() {
  const handleReceive = () => {
    // Navigate to receiver (scanner)
    router.push('/sharing/receiver');
  };

  const handleSend = () => {
    // Navigate to sender (broadcaster)
    router.push('/sharing/sender');
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Share Contacts</Text>
            <Text className="text-gray-600 text-sm mt-1">Connect with fellow travelers</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-4 py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg">
              <Ionicons name="people" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Connect Instantly
            </Text>
            <Text className="text-gray-600 text-center leading-6 px-4">
              Share your travel card or receive one from a fellow explorer
            </Text>
          </View>

          {/* Main Action Cards */}
          <View className="space-y-4 mb-8">
            {/* Receive Card */}
            <TouchableOpacity
              onPress={handleReceive}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="scan" size={32} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">Receive</Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    Scan a QR code or get contact info from another traveler
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
              
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code" size={16} color="#059669" />
                    <Text className="text-green-700 text-sm font-medium ml-2">QR Code Scanner</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="radio" size={16} color="#059669" />
                    <Text className="text-green-700 text-sm font-medium ml-2">NFC Ready</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Send Card */}
            <TouchableOpacity
              onPress={handleSend}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="share" size={32} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">Send</Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    Share your travel card with other explorers nearby
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
              
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code-outline" size={16} color="#3B82F6" />
                    <Text className="text-blue-700 text-sm font-medium ml-2">Generate QR</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="send" size={16} color="#3B82F6" />
                    <Text className="text-blue-700 text-sm font-medium ml-2">Instant Share</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Ionicons name="stats-chart" size={24} color="white" />
              <Text className="text-white font-semibold text-lg ml-3">Your Sharing Stats</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">24</Text>
                <Text className="text-indigo-200 text-sm">Cards Shared</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">18</Text>
                <Text className="text-indigo-200 text-sm">Cards Received</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">42</Text>
                <Text className="text-indigo-200 text-sm">Connections</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-semibold text-lg">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="arrow-down" size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Received card from Sarah</Text>
                  <Text className="text-gray-500 text-sm">2 hours ago • Bali, Indonesia</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="arrow-up" size={16} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Shared card with Marco</Text>
                  <Text className="text-gray-500 text-sm">5 hours ago • Rome, Italy</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people" size={16} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Connected with Alex</Text>
                  <Text className="text-gray-500 text-sm">1 day ago • Tokyo, Japan</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={20} color="#D97706" />
              <Text className="text-amber-800 font-semibold text-lg ml-2">Pro Tips</Text>
            </View>
            <View className="space-y-2">
              <Text className="text-amber-700 text-sm">• Keep your phone's NFC enabled for quick sharing</Text>
              <Text className="text-amber-700 text-sm">• Update your card regularly with current location</Text>
              <Text className="text-amber-700 text-sm">• Use QR codes in crowded places for easy scanning</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}