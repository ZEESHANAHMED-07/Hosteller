import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../config/firebaseConfig';

export default function CreateCardScreen() {
  useEffect(() => {
    const user = auth.currentUser;
    // If logged in, go to the actual create screen; else, go to sign-in.
    if (user) {
      router.replace('/cards/make');
    } else {
      router.replace('/sign-in');
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-600 mt-3">Preparing card creator...</Text>
    </View>
  );
}