import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsOfServiceScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Terms of Service</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Hosteller Terms of Service
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            Last updated: January 2024
          </Text>

          <View className="space-y-6">
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                1. Acceptance of Terms
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                By accessing and using Hosteller, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                2. Use License
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                Permission is granted to temporarily download one copy of Hosteller app per device 
                for personal, non-commercial transitory viewing only. This is the grant of a license, 
                not a transfer of title.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                3. User Account
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                When you create an account with us, you must provide information that is accurate, 
                complete, and current at all times. You are responsible for safeguarding the password 
                and for all activities that occur under your account.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                4. Prohibited Uses
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                You may not use our service for any unlawful purpose or to solicit others to perform 
                unlawful acts, to violate any international, federal, provincial, or state regulations, 
                rules, laws, or local ordinances.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                5. Service Availability
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                We reserve the right to withdraw or amend our service, and any service or material 
                we provide via the app, in our sole discretion without notice. We do not warrant 
                that our service will be uninterrupted, timely, secure, or error-free.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                6. Limitation of Liability
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                In no event shall Hosteller or its suppliers be liable for any damages arising out 
                of the use or inability to use the materials on Hosteller's app, even if authorized 
                representative has been notified of the possibility of such damage.
              </Text>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                7. Contact Information
              </Text>
              <Text className="text-gray-700 leading-6">
                If you have any questions about these Terms of Service, please contact us at:
              </Text>
              <Text className="text-blue-600 mt-2">legal@hosteller.com</Text>
            </View>
          </View>
        </View>

        <View className="bg-amber-50 rounded-lg p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text className="text-amber-900 font-semibold ml-2">Legal Notice</Text>
          </View>
          <Text className="text-amber-800 text-sm">
            These terms are for demonstration purposes only. Actual terms of service should be 
            drafted by qualified legal professionals to ensure proper legal protection.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
