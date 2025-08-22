import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function SharingIndexScreen() {
  const { colors } = useTheme();
  const handleReceive = () => {
    // Navigate to receiver (scanner)
    router.push('/sharing/receiver');
  };

  const handleSend = () => {
    // Navigate to sender (broadcaster)
    router.push('/sharing/sender');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="pt-12 pb-6 px-4 shadow-sm"
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
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>Share Contacts</Text>
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>Connect with fellow travelers</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-4 py-8">
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="people" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>
              Connect Instantly
            </Text>
            <Text className="text-center leading-6 px-4" style={{ color: colors.textSecondary }}>
              Share your travel card or receive one from a fellow explorer
            </Text>
          </View>

          {/* Main Action Cards */}
          <View className="space-y-4 mb-8">
            {/* Receive Card */}
            <TouchableOpacity
              onPress={handleReceive}
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="scan" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>Receive</Text>
                  <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                    Scan a QR code or get contact info from another traveler
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
              
              <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code" size={16} color={colors.primary} />
                    <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
                      QR Code Scanner
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="radio" size={16} color={colors.primary} />
                    <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
                      NFC Ready
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Send Card */}
            <TouchableOpacity
              onPress={handleSend}
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="share" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>Send</Text>
                  <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                    Share your travel card with other explorers nearby
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
              
              <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                    <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
                      Generate QR
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="send" size={16} color={colors.primary} />
                    <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
                      Instant Share
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View className="rounded-2xl p-6 mb-6 shadow-lg" style={{ backgroundColor: colors.primary }}>
            <View className="flex-row items-center mb-4">
              <Ionicons name="stats-chart" size={24} color="white" />
              <Text className="text-white font-semibold text-lg ml-3">Your Sharing Stats</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">24</Text>
                <Text style={{ color: '#E5E7EB' }} className="text-sm">Cards Shared</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">18</Text>
                <Text style={{ color: '#E5E7EB' }} className="text-sm">Cards Received</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">42</Text>
                <Text style={{ color: '#E5E7EB' }} className="text-sm">Connections</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-lg" style={{ color: colors.text }}>Recent Activity</Text>
              <TouchableOpacity>
                <Text className="font-medium text-sm" style={{ color: colors.primary }}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="arrow-down" size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: colors.text }}>Received card from Sarah</Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>2 hours ago • Bali, Indonesia</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="arrow-up" size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: colors.text }}>Shared card with Marco</Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>5 hours ago • Rome, Italy</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: colors.text }}>Connected with Alex</Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>1 day ago • Tokyo, Japan</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View
            className="mt-6 rounded-2xl p-6 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={20} color={colors.primary} />
              <Text className="font-semibold text-lg ml-2" style={{ color: colors.text }}>Pro Tips</Text>
            </View>
            <View className="space-y-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>• Keep your phone's NFC enabled for quick sharing</Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>• Update your card regularly with current location</Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>• Use QR codes in crowded places for easy scanning</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}