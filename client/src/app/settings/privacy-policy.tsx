import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="pt-12 pb-6 px-4 border-b flex-row items-center" style={{ backgroundColor: colors.header, borderBottomColor: colors.border }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1" style={{ color: colors.text }}>Privacy Policy</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="rounded-lg p-6 shadow-sm mb-6" style={{ backgroundColor: colors.card }}>
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Hosteller Privacy Policy
          </Text>
          <Text className="text-sm mb-6" style={{ color: colors.textSecondary }}>
            Last updated: January 2024
          </Text>

          <View className="space-y-6">
            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                1. Information We Collect
              </Text>
              <Text className="leading-6 mb-4" style={{ color: colors.textSecondary }}>
                We collect information you provide directly to us, such as when you create an account, 
                update your profile, or contact us for support. This includes your name, email address, 
                phone number, and any other information you choose to provide.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                2. How We Use Your Information
              </Text>
              <Text className="leading-6 mb-4" style={{ color: colors.textSecondary }}>
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, send you technical notices and support messages, and communicate 
                with you about products, services, and promotional offers.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                3. Information Sharing
              </Text>
              <Text className="leading-6 mb-4" style={{ color: colors.textSecondary }}>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information 
                with trusted service providers who assist us in operating our platform.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                4. Data Security
              </Text>
              <Text className="leading-6 mb-4" style={{ color: colors.textSecondary }}>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                5. Your Rights
              </Text>
              <Text className="leading-6 mb-4" style={{ color: colors.textSecondary }}>
                You have the right to access, update, or delete your personal information. You may also 
                opt out of certain communications from us. To exercise these rights, please contact us 
                using the information provided below.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                6. Contact Us
              </Text>
              <Text className="leading-6" style={{ color: colors.textSecondary }}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text className="mt-2" style={{ color: colors.primary }}>privacy@hosteller.com</Text>
            </View>
          </View>
        </View>

        <View className="rounded-lg p-4 mb-6" style={{ backgroundColor: colors.primary + '15' }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text className="font-semibold ml-2" style={{ color: colors.primary }}>Important Note</Text>
          </View>
          <Text className="text-sm" style={{ color: colors.primary }}>
            This is a sample privacy policy for demonstration purposes. In a real application, 
            you should consult with legal professionals to ensure compliance with applicable laws.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
