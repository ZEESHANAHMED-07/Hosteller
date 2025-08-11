import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';
import { db } from '../config/firebaseConfig';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // optional display name
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sanitizeUsername = (raw: string) => raw.trim();

  const friendlyAuthError = (code?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Username is already taken. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Invalid username format.';
      case 'auth/weak-password':
        return 'Passkey is too weak. Use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return undefined;
    }
  };

  const onSignup = async () => {
    console.log('[AUTH][signup] click', { rawEmail: email, rawUsername: username, rawPassLen: password?.length ?? 0 });
    const e = email.trim();
    const p = password.trim();
    const u = sanitizeUsername(username);
    if (!e) return Alert.alert('Error', 'Enter a valid email');
    if (p.length < 6) {
      console.log('[AUTH][signup] validation failed: passkey too short');
      return Alert.alert('Error', 'Passkey must be at least 6 characters');
    }
    setLoading(true);
    try {
      console.log('[AUTH][signup] creating user', { email: e });
      const cred = await createUserWithEmailAndPassword(auth, e, p);
      const user = cred.user;
      console.log('[AUTH][signup] user created', { uid: user?.uid });
      const displayName = u || e.split('@')[0];
      await updateProfile(user, { displayName });
      console.log('[AUTH][signup] profile updated');
      await setDoc(doc(db, 'users', user.uid), {
        email: e,
        username: displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('[AUTH][signup] profile doc written');
      Alert.alert('Success', 'Account created!', [{ text: 'Continue', onPress: () => router.replace('/') }]);
    } catch (err: any) {
      console.error('[AUTH][signup] error', { code: err?.code, message: err?.message, raw: err });
      const msg = friendlyAuthError(err?.code) || (err?.message ? String(err.message) : 'Unknown error');
      Alert.alert('Signup Error', msg);
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
            <Text className="text-2xl font-bold text-gray-900">Sign Up</Text>
            <Text className="text-gray-600 text-sm mt-1">Create your account with email and password</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 py-8">
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Email</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" className="text-gray-900 text-base" />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Password</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3 flex-row items-center">
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} autoCapitalize="none" className="text-gray-900 text-base flex-1" />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-500 text-xs mt-2">Password must be at least 6 characters.</Text>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Display name (optional)</Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput value={username} onChangeText={setUsername} placeholder="e.g. Soumo" placeholderTextColor="#9CA3AF" autoCapitalize="words" className="text-gray-900 text-base" />
          </View>
        </View>

        <TouchableOpacity onPress={onSignup} disabled={loading} className={`bg-blue-600 rounded-xl py-4 ${loading ? 'opacity-70' : ''}`}>
          <Text className="text-center text-white font-semibold text-lg">Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}