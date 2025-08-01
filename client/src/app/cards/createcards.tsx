import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'

interface TravelerData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
}

export default function CreateCardScreen() {
  const [formData, setFormData] = useState<TravelerData>({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    bio: '',
  });

  const [errors, setErrors] = useState<Partial<TravelerData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<TravelerData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Save to Firebase Firestore
      const docRef = await addDoc(collection(db, 'travelerCards'), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        country: formData.country.trim(),
        bio: formData.bio.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });

      console.log('Document written with ID: ', docRef.id);
      
      Alert.alert(
        'Success!',
        'Your traveler card has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert(
        'Error', 
        'Failed to create card. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof TravelerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Create Your Card</Text>
            <Text className="text-gray-600 text-sm mt-1">Share your travel story</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Preview Card */}
        <View className="px-4 py-6">
          <Text className="text-gray-700 font-semibold text-lg mb-4">Card Preview</Text>
          <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-xl">
                  {formData.fullName || 'Your Name'}
                </Text>
                <Text className="text-blue-100 text-sm">
                  {formData.country || 'Your Country'}
                </Text>
              </View>
            </View>
            <Text className="text-white/90 text-sm mb-3">
              {formData.bio || 'Tell fellow travelers about yourself...'}
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-blue-100 text-xs">
                📧 {formData.email || 'your@email.com'}
              </Text>
              <Text className="text-blue-100 text-xs">
                📱 {formData.phone || '+1234567890'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="px-4 pb-8">
          <Text className="text-gray-700 font-semibold text-lg mb-4">Your Details</Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.fullName ? 'border-red-300' : 'border-gray-200'} px-4 py-3`}>
              <TextInput
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.fullName && (
              <Text className="text-red-500 text-sm mt-1">{errors.fullName}</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} px-4 py-3`}>
              <TextInput
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'} px-4 py-3`}>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.phone && (
              <Text className="text-red-500 text-sm mt-1">{errors.phone}</Text>
            )}
          </View>

          {/* Country */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Country</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.country ? 'border-red-300' : 'border-gray-200'} px-4 py-3`}>
              <TextInput
                value={formData.country}
                onChangeText={(text) => updateField('country', text)}
                placeholder="United States"
                placeholderTextColor="#9CA3AF"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.country && (
              <Text className="text-red-500 text-sm mt-1">{errors.country}</Text>
            )}
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Bio</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.bio ? 'border-red-300' : 'border-gray-200'} px-4 py-3`}>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="Tell fellow travelers about yourself, your interests, and travel experiences..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="text-gray-900 text-base min-h-[100px]"
              />
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {formData.bio.length}/200 characters
            </Text>
            {errors.bio && (
              <Text className="text-red-500 text-sm mt-1">{errors.bio}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl py-4 px-6 shadow-lg ${
              isLoading ? 'opacity-70' : ''
            }`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <>
                  <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <Text className="text-white font-semibold text-lg">Creating Card...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="card" size={20} color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-lg ml-2">Create My Card</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Tips */}
          <View className="mt-6 bg-blue-50 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb" size={16} color="#3B82F6" />
              <Text className="text-blue-800 font-medium ml-2">Tips for a great card</Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
              • Use your real name to build trust{'\n'}
              • Write an engaging bio about your travel interests{'\n'}
              • Include accurate contact information{'\n'}
              • Mention your travel style and preferences
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}