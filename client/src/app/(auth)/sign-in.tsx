import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const friendlyAuthError = (code?: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return undefined;
    }
  };

  const onLogin = async () => {
    const e = email.trim();
    const p = password.trim();
    if (!e || !p) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, e, p);
      if (!cred.user.emailVerified) {
        router.replace('/(auth)/verify');
        return;
      }
      // Ensure profile exists (created only after verification)
      try {
        const u = cred.user;
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            email: u.email || e,
            username: u.displayName || (e.split('@')[0]),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } else {
          // touch updatedAt
          await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
        }
      } catch (pf) {
        console.warn('[AUTH][signin] ensure profile failed', pf);
      }
      router.replace('/');
    } catch (err: any) {
      const msg = friendlyAuthError(err?.code) || (err?.message ? String(err.message) : 'Unknown error');
      Alert.alert('Login Error', msg);
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
            <Text className="text-2xl font-bold text-gray-900">Sign In</Text>
            <Text className="text-gray-600 text-sm mt-1">Use your email and password</Text>
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
          <Text className="text-gray-500 text-xs mt-2">Forgot password? We can add reset next.</Text>
        </View>

        <TouchableOpacity onPress={onLogin} disabled={loading} className={`bg-blue-600 rounded-xl py-4 ${loading ? 'opacity-70' : ''}`}>
          <Text className="text-center text-white font-semibold text-lg">Login</Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">No account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}