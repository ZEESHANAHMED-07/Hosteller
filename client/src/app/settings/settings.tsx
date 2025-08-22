import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeContext';

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
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b"
      style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.primary + '20' }}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: colors.text }}>{title}</Text>
        {subtitle && (
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        )}
      </View>
      
      {rightComponent && <View className="mr-2">{rightComponent}</View>}
      
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const { colors } = useTheme();
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold uppercase tracking-wide px-4 mb-2" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
      <View className="rounded-lg mx-4 shadow-sm overflow-hidden" style={{ backgroundColor: colors.card }}>
        {children}
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive',  onPress: async () => {
            try { await signOut(auth); } catch {}
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

  // Profile Functions
  const handleEditProfile = () => {
    router.push('/settings/edit-profile');
  };

  const handleChangeAvatar = () => {
    Toast.show({
      type: 'info',
      text1: 'Change Avatar',
      text2: 'Avatar changing feature coming soon!',
      position: 'top',
      visibilityTime: 3000,
    });
  };

  // Preferences Functions
  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    Toast.show({
      type: 'success',
      text1: 'Notifications',
      text2: value ? 'Notifications enabled' : 'Notifications disabled',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleDarkModeToggle = (value: boolean) => {
    toggleDarkMode();
    Toast.show({
      type: 'success',
      text1: 'Theme Changed',
      text2: value ? 'Dark mode enabled' : 'Light mode enabled',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleLocationToggle = (value: boolean) => {
    setLocationServices(value);
    Toast.show({
      type: 'success',
      text1: 'Location Services',
      text2: value ? 'Location services enabled' : 'Location services disabled',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleLanguageSelect = (language: { code: string; name: string }) => {
    setSelectedLanguage(language.name);
    setShowLanguageModal(false);
    Toast.show({
      type: 'success',
      text1: 'Language Changed',
      text2: `Language set to ${language.name}`,
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // Privacy & Security Functions
  const handlePrivacyPolicy = () => {
    router.push('/settings/privacy-policy');
  };

  const handleTermsOfService = () => {
    router.push('/settings/terms-of-service');
  };

  const handleBiometricAuth = () => {
    setBiometricAuth(!biometricAuth);
    Toast.show({
      type: 'success',
      text1: 'Biometric Authentication',
      text2: !biometricAuth ? 'Biometric auth enabled' : 'Biometric auth disabled',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // Support Functions
  const handleHelpCenter = () => {
    router.push('/settings/help-center');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@hosteller.com?subject=Support Request')
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Email Opened',
          text2: 'Opening your email app...',
          position: 'top',
          visibilityTime: 2000,
        });
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not open email app',
          position: 'top',
          visibilityTime: 3000,
        });
      });
  };

  const handleRateApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Thank You!',
      text2: 'Opening app store for rating...',
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="pt-12 pb-6 px-4 border-b" style={{ backgroundColor: colors.header, borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Settings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Profile Section */}
        <SettingsSection title="Profile">
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          <SettingItem
            icon="camera-outline"
            title="Change Avatar"
            subtitle="Update your profile picture"
            onPress={handleChangeAvatar}
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
                onValueChange={handleNotificationsToggle}
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
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#E5E7EB', true: colors.primary }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
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
                onValueChange={handleLocationToggle}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={locationServices ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle={selectedLanguage}
            onPress={() => setShowLanguageModal(true)}
          />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & Security">
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Terms of Service"
            onPress={handleTermsOfService}
          />
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle={biometricAuth ? 'Enabled' : 'Use fingerprint or face ID'}
            onPress={handleBiometricAuth}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={handleHelpCenter}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            onPress={handleContactSupport}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            onPress={handleRateApp}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b"
            style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={18} color="#F97316" />
            </View>
            <Text className="text-orange-600 text-base font-medium flex-1">Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            style={{ backgroundColor: colors.card }}
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
          <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="rounded-t-3xl max-h-96" style={{ backgroundColor: colors.surface }}>
            <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView className="max-h-80">
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  className="flex-row items-center px-4 py-3 border-b"
                  style={{ borderBottomColor: colors.border }}
                  onPress={() => handleLanguageSelect(language)}
                >
                  <Text className="text-base flex-1" style={{ color: colors.text }}>{language.name}</Text>
                  {selectedLanguage === language.name && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Toast Message Component */}
      <Toast />
    </View>
  );
}