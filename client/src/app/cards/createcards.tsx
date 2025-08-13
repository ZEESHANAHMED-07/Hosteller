import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig'

interface CardData {
  fullName: string;
  email: string;
  phone: string;
  field1: string; // company/destination/interests
  field2: string; // position/travelStyle/platform
  bio: string;
}

type CardType = 'business' | 'traveller' | 'social';

interface CardConfig {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  field1Label: string;
  field1Placeholder: string;
  field2Label: string;
  field2Placeholder: string;
  bioLabel: string;
  bioPlaceholder: string;
  buttonText: string;
  collection: string;
  tips: string[];
}

export default function CreateCardScreen() {
  const { type, edit, cardId } = useLocalSearchParams<{ type: CardType; edit?: string; cardId?: string }>();
  const isEditMode = edit === 'true' && cardId;
  const cardType: CardType = (type as CardType) || 'business';
  
  console.log('Edit Mode Debug:', { type, edit, cardId, isEditMode });
  
  const [formData, setFormData] = useState<CardData>({
    fullName: '',
    email: '',
    phone: '',
    field1: '',
    field2: '',
    bio: '',
  });

  const [errors, setErrors] = useState<Partial<CardData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  // Card configurations
  const cardConfigs: Record<CardType, CardConfig> = {
    business: {
      title: 'Create Your Business Card',
      subtitle: 'Professional networking made easy',
      icon: 'briefcase-outline',
      color: 'blue-500',
      field1Label: 'Company',
      field1Placeholder: 'Your Company Name',
      field2Label: 'Position',
      field2Placeholder: 'Your Job Title',
      bioLabel: 'Professional Summary',
      bioPlaceholder: 'Describe your professional expertise, skills, and what you do...',
      buttonText: 'CREATE BUSINESS CARD',
      collection: 'businessCards',
      tips: [
        '• Use your professional name as it appears on LinkedIn',
        '• Include your current job title and company',
        '• Write a compelling professional summary',
        '• Keep contact information up-to-date',
        '• Highlight your key skills and expertise'
      ]
    },
    traveller: {
      title: 'Create Your Traveller Card',
      subtitle: 'Connect with fellow adventurers',
      icon: 'earth',
      color: 'green-500',
      field1Label: 'Current Destination',
      field1Placeholder: 'Where are you traveling?',
      field2Label: 'Travel Style',
      field2Placeholder: 'Backpacking, Luxury, Adventure, etc.',
      bioLabel: 'Travel Bio',
      bioPlaceholder: 'Tell fellow travelers about your journey, interests, and travel experiences...',
      buttonText: 'CREATE TRAVELLER CARD',
      collection: 'travellerCards',
      tips: [
        '• Share your current or next destination',
        '• Mention your preferred travel style',
        '• Include interesting travel experiences',
        '• Be open about your travel plans',
        '• Connect with like-minded travelers'
      ]
    },
    social: {
      title: 'Create Your Social Card',
      subtitle: 'Make friends and build connections',
      icon: 'chatbubble-ellipses-outline',
      color: 'purple-500',
      field1Label: 'Interests',
      field1Placeholder: 'Your hobbies and interests',
      field2Label: 'Social Platform',
      field2Placeholder: 'Instagram, LinkedIn, Twitter, etc.',
      bioLabel: 'About Me',
      bioPlaceholder: 'Tell people about yourself, your interests, and what you enjoy doing...',
      buttonText: 'CREATE SOCIAL CARD',
      collection: 'socialCards',
      tips: [
        '• Share your genuine interests and hobbies',
        '• Mention your favorite social platforms',
        '• Be authentic and approachable',
        '• Include what makes you unique',
        '• Connect over shared interests'
      ]
    }
  };

  const config = cardConfigs[cardType];

  const validateForm = (): boolean => {
    const newErrors: Partial<CardData> = {};

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

    if (!formData.field1.trim()) {
      newErrors.field1 = `${config.field1Label} is required`;
    }

    if (!formData.field2.trim()) {
      newErrors.field2 = `${config.field2Label} is required`;
    }

    if (!formData.bio.trim()) {
      newErrors.bio = `${config.bioLabel} is required`;
    } else if (formData.bio.length < 10) {
      newErrors.bio = `${config.bioLabel} must be at least 10 characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (type && cardConfigs[type]) {
      // Valid card type, load existing data if in edit mode
      if (edit === 'true' && cardId) {
        loadCardData();
      }
    } else {
      // Invalid type, redirect back
      router.back();
    }
  }, [type, edit, cardId]);

  const loadCardData = async () => {
    if (!cardId || !type) return;
    
    setIsLoadingCard(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to edit your card.');
        router.replace('/sign-in');
        return;
      }
      // Read from users/{uid}/cards/{cardId}
      const cardDoc = await getDoc(doc(db, 'users', user.uid, 'cards', String(cardId)));
      
      if (cardDoc.exists()) {
        const cardData = cardDoc.data();
        // Map unified schema -> form fields
        // title -> fullName, socialLinks[0..1] -> field1/field2
        const links: string[] = Array.isArray(cardData.socialLinks) ? cardData.socialLinks : [];
        setFormData({
          fullName: cardData.title || '',
          email: cardData.email || '',
          phone: cardData.phone || '',
          field1: links[0] || '',
          field2: links[1] || '',
          bio: ''
        });
      } else {
        Alert.alert('Error', 'Card not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading card:', error);
      Alert.alert('Error', 'Failed to load card data');
      router.back();
    } finally {
      setIsLoadingCard(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to save your card.');
        router.replace('/sign-in');
        return;
      }

      // Map form -> unified schema
      const socialLinks = [formData.field1.trim(), formData.field2.trim()].filter(Boolean);
      const payload = {
        type: (String(type) as 'business' | 'traveller' | 'social'),
        title: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        socialLinks,
      } as const;

      if (edit === 'true' && cardId) {
        // Update users/{uid}/cards/{cardId}
        await updateDoc(doc(db, 'users', user.uid, 'cards', String(cardId)), {
          ...payload,
          updatedAt: serverTimestamp(),
        });

        Alert.alert(
          'Success!',
          `Your ${cardType} card has been updated successfully!`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Create users/{uid}/cards/{cardId}
        const docRef = await addDoc(collection(db, 'users', user.uid, 'cards'), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log('Document written with ID: ', docRef.id);
        
        Alert.alert(
          'Success!',
          `Your ${cardType} card has been created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving document: ', error);
      Alert.alert(
        'Error',
        `Failed to ${edit === 'true' ? 'update' : 'create'} card. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof CardData, value: string) => {
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
            <Text className="text-3xl font-bold text-gray-900 mb-2">{edit === 'true' ? config.title.replace('Create', 'Edit') : config.title}</Text>
            <Text className="text-gray-600 text-sm mt-1">{config.subtitle}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Preview Card */}
        <View className="px-4 py-6 bg-gray-100">
          <Text className="text-gray-900 font-bold text-2xl mb-6 text-center">CARD PREVIEW</Text>
          
          {/* Business Card Container with 1.75 aspect ratio */}
          <View className="items-center">
            <View 
              className="bg-white rounded-2xl shadow-2xl border border-gray-200"
              style={{
                width: '90%',
                maxWidth: 350,
                aspectRatio: 1.75,
                padding: 20,
              }}
            >
              {/* Card Content */}
              <View className="flex-1 justify-between">
                {/* Header Section */}
                <View className="flex-row items-start">
                  <View className={`w-12 h-12 bg-${config.color} rounded-xl items-center justify-center mr-3 shadow-sm`}>
                    <Ionicons name={config.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-lg leading-tight" numberOfLines={2}>
                      {formData.fullName || 'Your Full Name'}
                    </Text>
                    <Text className={`text-${config.color.replace('-500', '-600')} text-sm font-semibold mt-1`} numberOfLines={1}>
                      {formData.field2 || config.field2Placeholder}
                    </Text>
                    <Text className="text-gray-600 text-xs mt-0.5" numberOfLines={1}>
                      {formData.field1 || config.field1Placeholder}
                    </Text>
                  </View>
                </View>

                {/* Bio Section */}
                <View className="my-3">
                  <Text className="text-gray-700 text-xs leading-4" numberOfLines={3}>
                    {formData.bio || 'Your professional summary and expertise will appear here...'}
                  </Text>
                </View>

                {/* Contact Section */}
                <View className="border-t border-gray-200 pt-2">
                  <Text className="text-gray-800 text-xs mb-1" numberOfLines={1}>
                    📧 {formData.email || 'your@email.com'}
                  </Text>
                  <Text className="text-gray-800 text-xs" numberOfLines={1}>
                    📱 {formData.phone || '+1 (555) 123-4567'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="px-6 pb-8">
          <Text className="text-gray-800 font-bold text-xl mb-6">{cardType === 'business' ? '💼' : cardType === 'traveller' ? '✈️' : '👥'} {config.title.replace('Create Your ', '')}</Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.fullName ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
              <TextInput
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                placeholder="Enter your professional name"
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
            <Text className="text-gray-700 font-medium mb-2">Business Email</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
              <TextInput
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="your.name@company.com"
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
            <Text className="text-gray-700 font-medium mb-2">Business Phone</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
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

          {/* Field 1 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{config.field1Label}</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.field1 ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
              <TextInput
                value={formData.field1}
                onChangeText={(text) => updateField('field1', text)}
                placeholder={config.field1Placeholder}
                placeholderTextColor="#9CA3AF"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.field1 && (
              <Text className="text-red-500 text-sm mt-1">{errors.field1}</Text>
            )}
          </View>

          {/* Field 2 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{config.field2Label}</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.field2 ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
              <TextInput
                value={formData.field2}
                onChangeText={(text) => updateField('field2', text)}
                placeholder={config.field2Placeholder}
                placeholderTextColor="#9CA3AF"
                className="text-gray-900 text-base"
              />
            </View>
            {errors.field2 && (
              <Text className="text-red-500 text-sm mt-1">{errors.field2}</Text>
            )}
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">{config.bioLabel}</Text>
            <View className={`bg-white rounded-xl border-2 ${errors.bio ? 'border-red-300' : 'border-gray-200'} px-4 py-3 shadow-sm`}>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder={config.bioPlaceholder}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="text-gray-900 text-base min-h-[100px]"
              />
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {formData.bio.length}/300 characters
            </Text>
            {errors.bio && (
              <Text className="text-red-500 text-sm mt-1">{errors.bio}</Text>
            )}
          </View>

          {/* Submit Button */}
          <View className="bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-500 mb-4">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`${config.color === 'blue-500' ? 'bg-blue-600 border-blue-700' : config.color === 'green-500' ? 'bg-green-600 border-green-700' : 'bg-purple-600 border-purple-700'} rounded-2xl py-6 px-8 shadow-2xl border-2 ${
                isLoading ? 'opacity-70' : ''
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <>
                    <View className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    <Text className="text-white font-bold text-xl">Creating Card...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name={config.icon as any} size={24} color="white" />
                    <Text className="text-white font-bold text-xl ml-3">{isEditMode ? `UPDATE ${config.buttonText.split(' ')[1]} ${config.buttonText.split(' ')[2]}` : config.buttonText}</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View className={`mt-6 bg-${config.color.replace('-500', '-50')} rounded-xl p-4 border border-${config.color.replace('-500', '-200')}`}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={18} color={config.color === 'blue-500' ? '#3B82F6' : config.color === 'green-500' ? '#10B981' : '#8B5CF6'} />
              <Text className={`text-${config.color.replace('-500', '-800')} font-semibold text-base ml-2`}>{cardType === 'business' ? 'Professional' : cardType === 'traveller' ? 'Travel' : 'Social'} Tips</Text>
            </View>
            <Text className={`text-${config.color.replace('-500', '-700')} text-sm leading-6`}>
              {config.tips.join('\n')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}