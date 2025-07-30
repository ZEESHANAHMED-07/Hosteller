import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { SignOutButton } from '@/components/SignOutButton';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
}) => (
  <TouchableOpacity
    className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
      <Ionicons name={icon} size={18} color="#3B82F6" />
    </View>
    
    <View className="flex-1">
      <Text className="text-gray-900 text-base font-medium">{title}</Text>
      {subtitle && (
        <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
      )}
    </View>
    
    {rightComponent && <View className="mr-2">{rightComponent}</View>}
    
    {showArrow && !rightComponent && (
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);

const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View className="mb-6">
    <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wide px-4 mb-2">
      {title}
    </Text>
    <View className="bg-white rounded-lg mx-4 shadow-sm overflow-hidden">
      {children}
    </View>
  </View>
);

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const { signOut } = useAuth()

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive',  onPress: async () => {
            await signOut() 
          } },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <SettingsSection title="Profile">
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => console.log('Edit Profile')}
          />
          <SettingItem
            icon="camera-outline"
            title="Change Avatar"
            subtitle="Update your profile picture"
            onPress={() => console.log('Change Avatar')}
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="location-outline"
            title="Location Services"
            subtitle="Allow app to access your location"
            rightComponent={
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={locationServices ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => console.log('Language')}
          />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & Security">
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            onPress={() => console.log('Privacy Policy')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Terms of Service"
            onPress={() => console.log('Terms of Service')}
          />
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            onPress={() => console.log('Biometric')}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => console.log('Help Center')}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            onPress={() => console.log('Contact Support')}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            onPress={() => console.log('Rate App')}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={18} color="#F97316" />
            </View>
            <Text className="text-orange-600 text-base font-medium flex-1">Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 bg-white"
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </View>
            <Text className="text-red-600 text-base font-medium flex-1">Delete Account</Text>
          </TouchableOpacity>
        </SettingsSection>    

        {/* Version Info */}
        <View className="px-4 py-6">
          <Text className="text-center text-gray-400 text-sm">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}