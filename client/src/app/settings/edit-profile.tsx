import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    jobTitle: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load profile data',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'First name and last name are required',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...profileData,
        username: `${profileData.firstName} ${profileData.lastName}`,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await updateProfile(user, {
        displayName: `${profileData.firstName} ${profileData.lastName}`,
      });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been saved successfully',
        position: 'top',
        visibilityTime: 3000,
      });

      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save profile changes',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    Toast.show({
      type: 'info',
      text1: 'Change Avatar',
      text2: 'Photo selection feature coming soon!',
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
          </View>
          
          <TouchableOpacity
            onPress={saveProfile}
            disabled={saving || loading}
            className={`bg-blue-600 rounded-lg px-4 py-2 ${saving || loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-semibold">
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View className="bg-white mx-4 mt-6 rounded-lg p-6 shadow-sm items-center">
          <View className="relative">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center">
              <Ionicons name="person" size={40} color="#9CA3AF" />
            </View>
            <TouchableOpacity 
              className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2"
              onPress={handleChangeAvatar}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm mt-3">Tap to change profile photo</Text>
        </View>

        {/* Personal Information */}
        <View className="bg-white mx-4 mt-6 rounded-lg shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="font-semibold text-gray-900">Personal Information</Text>
          </View>
          
          <View className="p-4 space-y-4">
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">First Name *</Text>
                <TextInput
                  value={profileData.firstName}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                  className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Last Name *</Text>
                <TextInput
                  value={profileData.lastName}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                  className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Phone</Text>
              <TextInput
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Bio</Text>
              <TextInput
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={3}
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                value={profileData.location}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                placeholder="City, Country"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Professional Information */}
        <View className="bg-white mx-4 mt-6 rounded-lg shadow-sm overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="font-semibold text-gray-900">Professional Information</Text>
          </View>
          
          <View className="p-4 space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Company</Text>
              <TextInput
                value={profileData.company}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, company: text }))}
                placeholder="Company name"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Job Title</Text>
              <TextInput
                value={profileData.jobTitle}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, jobTitle: text }))}
                placeholder="Your job title"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Website</Text>
              <TextInput
                value={profileData.website}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, website: text }))}
                placeholder="https://yourwebsite.com"
                keyboardType="url"
                autoCapitalize="none"
                className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>

      <Toast />
    </View>
  );
}
