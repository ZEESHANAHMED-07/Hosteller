import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

export default function MakeCardScreen() {
  const user = auth.currentUser;

  // New schema fields
  // users/{uid}/cards/{cardId}
  // { type: 'personal' | 'work' | 'social', title: string, phone: string, email: string, socialLinks: string[] }
  const [type, setType] = useState('personal');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [socialLinksCsv, setSocialLinksCsv] = useState(''); // comma-separated in UI
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!auth.currentUser) return Alert.alert('Error', 'You must be logged in');
    if (!title.trim()) return Alert.alert('Error', 'Enter card title');
    if (!type.trim()) return Alert.alert('Error', 'Enter card type');
    // Very light validation
    const emailVal = email.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) return Alert.alert('Error', 'Invalid email');
    const phoneVal = phone.trim();

    setLoading(true);
    try {
      const socialLinks = socialLinksCsv
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'cards'), {
        type: type.trim().toLowerCase(),
        title: title.trim(),
        phone: phoneVal,
        email: emailVal,
        socialLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Card created!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      console.error('[CARD][create] error', err);
      Alert.alert('Error', err?.message ? String(err.message) : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Create Card</Text>
            <Text className="text-gray-600 text-sm mt-1">Signed in: {user?.displayName || user?.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Type</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={type} onChangeText={setType} placeholder="personal | work | social" placeholderTextColor="#9CA3AF" autoCapitalize="none" className="text-gray-900 text-base" />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Title</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={title} onChangeText={setTitle} placeholder="e.g. My Personal Card" placeholderTextColor="#9CA3AF" className="text-gray-900 text-base" />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Phone</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={phone} onChangeText={setPhone} placeholder="9999999999" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" className="text-gray-900 text-base" />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Email</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={email} onChangeText={setEmail} placeholder="personal@email.com" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" className="text-gray-900 text-base" />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Social Links (comma separated)</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={socialLinksCsv} onChangeText={setSocialLinksCsv} placeholder="https://twitter.com/you, https://linkedin.com/in/you" placeholderTextColor="#9CA3AF" autoCapitalize="none" className="text-gray-900 text-base" />
          </View>
        </View>

        <TouchableOpacity onPress={onSave} disabled={loading} className={`bg-blue-600 rounded-xl py-4 ${loading ? 'opacity-70' : ''}`}>
          <Text className="text-center text-white font-semibold text-lg">Save Card</Text>
        </TouchableOpacity>
        {/* Spacer to ensure button is not covered */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
