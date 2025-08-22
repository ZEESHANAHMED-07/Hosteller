import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: 1,
      question: 'How do I create a new card?',
      answer: 'To create a new card, go to the Cards section and tap the "+" button. Choose your card type (Business, Traveller, or Social) and fill in your information.',
      expanded: false,
    },
    {
      id: 2,
      question: 'How can I share my card with others?',
      answer: 'You can share your card by tapping the share button on any of your cards. This will generate a QR code or shareable link that others can use to save your contact information.',
      expanded: false,
    },
    {
      id: 3,
      question: 'Can I customize my card design?',
      answer: 'Yes! Each card type comes with multiple design templates. You can customize colors, fonts, and layout to match your personal or business branding.',
      expanded: false,
    },
    {
      id: 4,
      question: 'How do I edit my profile information?',
      answer: 'Go to Settings > Profile > Edit Profile to update your personal information, bio, and contact details.',
      expanded: false,
    },
    {
      id: 5,
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data. Your information is stored securely and is never shared with third parties without your consent.',
      expanded: false,
    },
  ]);

  const toggleFAQ = (id: number) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = () => {
    Toast.show({
      type: 'success',
      text1: 'Contact Support',
      text2: 'Opening email client...',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Help Center</Text>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-900"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="px-4 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity 
              className="bg-white rounded-lg p-4 flex-1 min-w-[45%] shadow-sm"
              onPress={handleContactSupport}
            >
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="mail" size={20} color="#3B82F6" />
              </View>
              <Text className="font-semibold text-gray-900 mb-1">Contact Support</Text>
              <Text className="text-sm text-gray-600">Get help from our team</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-lg p-4 flex-1 min-w-[45%] shadow-sm"
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Video Tutorials',
                text2: 'Coming soon!',
                position: 'top',
                visibilityTime: 2000,
              })}
            >
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="play-circle" size={20} color="#10B981" />
              </View>
              <Text className="font-semibold text-gray-900 mb-1">Video Tutorials</Text>
              <Text className="text-sm text-gray-600">Watch how-to videos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View className="px-4 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </Text>
          
          {filteredFAQs.length === 0 ? (
            <View className="bg-white rounded-lg p-6 shadow-sm items-center">
              <Ionicons name="search" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No results found</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            <View className="bg-white rounded-lg shadow-sm overflow-hidden">
              {filteredFAQs.map((faq, index) => (
                <View key={faq.id}>
                  <TouchableOpacity
                    className="px-4 py-4 flex-row items-center justify-between"
                    onPress={() => toggleFAQ(faq.id)}
                  >
                    <Text className="flex-1 font-medium text-gray-900 pr-4">
                      {faq.question}
                    </Text>
                    <Ionicons 
                      name={faq.expanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                  
                  {faq.expanded && (
                    <View className="px-4 pb-4 border-t border-gray-100">
                      <Text className="text-gray-700 leading-6 pt-3">
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                  
                  {index < filteredFAQs.length - 1 && (
                    <View className="border-b border-gray-100" />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Still Need Help */}
        <View className="px-4 pb-8">
          <View className="bg-blue-50 rounded-lg p-6">
            <Text className="text-lg font-bold text-blue-900 mb-2">
              Still need help?
            </Text>
            <Text className="text-blue-800 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </Text>
            <TouchableOpacity 
              className="bg-blue-600 rounded-lg py-3 px-6 self-start"
              onPress={handleContactSupport}
            >
              <Text className="text-white font-semibold">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
