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
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors, isDarkMode } = useTheme();
  const { type, edit, cardId } = useLocalSearchParams<{ type: CardType; edit?: string; cardId?: string }>();
  const isEditMode = edit === 'true' && cardId;
  const cardType: CardType = (type as CardType) || 'business';
  
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
      color: '#3B82F6',
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
      color: '#10B981',
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
      color: '#8B5CF6',
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
      if (edit === 'true' && cardId) {
        loadCardData();
      }
    } else {
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
      
      const cardDoc = await getDoc(doc(db, 'users', user.uid, 'cards', String(cardId)));
      
      if (cardDoc.exists()) {
        const cardData = cardDoc.data();
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

      const socialLinks = [formData.field1.trim(), formData.field2.trim()].filter(Boolean);
      const payload = {
        type: (String(type) as 'business' | 'traveller' | 'social'),
        title: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        socialLinks,
      } as const;

      if (edit === 'true' && cardId) {
        await updateDoc(doc(db, 'users', user.uid, 'cards', String(cardId)), {
          ...payload,
          updatedAt: serverTimestamp(),
        });

        Alert.alert(
          'Success!',
          `Your ${cardType} card has been updated successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'cards'), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log('Document written with ID: ', docRef.id);
        
        Alert.alert(
          'Success!',
          `Your ${cardType} card has been created successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoadingCard) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading card data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={wp('5%')} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {edit === 'true' ? config.title.replace('Create', 'Edit') : config.title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{config.subtitle}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Preview Card */}
        <View style={[styles.previewSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>CARD PREVIEW</Text>
          
          <View style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: config.color, elevation: isDarkMode ? 0 : 5 }]}>
              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Header Section */}
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: config.color }]}>
                    <Ionicons name={config.icon as any} size={wp('5%')} color="#FFFFFF" />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
                      {formData.fullName || 'Your Full Name'}
                    </Text>
                    <Text style={[styles.cardPosition, { color: config.color }]} numberOfLines={1}>
                      {formData.field2 || config.field2Placeholder}
                    </Text>
                    <Text style={[styles.cardCompany, { color: colors.textSecondary }]} numberOfLines={1}>
                      {formData.field1 || config.field1Placeholder}
                    </Text>
                  </View>
                </View>

                {/* Bio Section */}
                <View style={styles.cardBio}>
                  <Text style={[styles.cardBioText, { color: colors.textSecondary }]} numberOfLines={3}>
                    {formData.bio || 'Your professional summary and expertise will appear here...'}
                  </Text>
                </View>

                {/* Contact Section */}
                <View style={[styles.cardContact, { borderTopColor: colors.border }]}>
                  <Text style={[styles.contactText, { color: colors.text }]} numberOfLines={1}>
                    📧 {formData.email || 'your@email.com'}
                  </Text>
                  <Text style={[styles.contactText, { color: colors.text }]} numberOfLines={1}>
                    📱 {formData.phone || '+1 (555) 123-4567'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {cardType === 'business' ? '💼' : cardType === 'traveller' ? '✈️' : '👥'} {config.title.replace('Create Your ', '')}
          </Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.fullName && styles.inputError]}>
              <TextInput
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                placeholder="Enter your professional name"
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.email && styles.inputError]}>
              <TextInput
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="your.name@company.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.phone && styles.inputError]}>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Field 1 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{config.field1Label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.field1 && styles.inputError]}>
              <TextInput
                value={formData.field1}
                onChangeText={(text) => updateField('field1', text)}
                placeholder={config.field1Placeholder}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.field1 && (
              <Text style={styles.errorText}>{errors.field1}</Text>
            )}
          </View>

          {/* Field 2 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{config.field2Label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.field2 && styles.inputError]}>
              <TextInput
                value={formData.field2}
                onChangeText={(text) => updateField('field2', text)}
                placeholder={config.field2Placeholder}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.field2 && (
              <Text style={styles.errorText}>{errors.field2}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{config.bioLabel}</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }, errors.bio && styles.inputError]}>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder={config.bioPlaceholder}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[styles.textInput, styles.textArea, { color: colors.text }]}
              />
            </View>
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {formData.bio.length}/300 characters
            </Text>
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio}</Text>
            )}
          </View>

          {/* Submit Button */}
          <View style={[styles.submitSection, { backgroundColor: colors.card }]}> 
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitButton, { backgroundColor: config.color }, isLoading && styles.submitButtonDisabled]}
              activeOpacity={0.8}
            >
              <View style={styles.submitButtonContent}>
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={styles.submitSpinner} />
                    <Text style={styles.submitButtonText}>Creating Card...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name={config.icon as any} size={wp('5%')} color="white" />
                    <Text style={styles.submitButtonText}>
                      {isEditMode ? `UPDATE ${config.buttonText.split(' ')[1]} ${config.buttonText.split(' ')[2]}` : config.buttonText}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={[styles.tipsSection, { backgroundColor: config.color + '10', borderColor: config.color + '30' }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={wp('4.5%')} color={config.color} />
              <Text style={[styles.tipsTitle, { color: config.color }]}>
                {cardType === 'business' ? 'Professional' : cardType === 'traveller' ? 'Travel' : 'Social'} Tips
              </Text>
            </View>
            <Text style={[styles.tipsText, { color: config.color }]}>
              {config.tips.join('\n')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#F1F5F9',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  previewSection: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('3%'),
    backgroundColor: '#F1F5F9',
  },
  previewTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  cardContainer: {
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 350,
    aspectRatio: 1.75,
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  cardHeaderText: {
    flex: 1,
  },
  cardName: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: wp('5.5%'),
  },
  cardPosition: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    marginTop: hp('0.5%'),
  },
  cardCompany: {
    fontSize: wp('3%'),
    color: '#64748B',
    marginTop: hp('0.2%'),
  },
  cardBio: {
    marginVertical: hp('1.5%'),
  },
  cardBioText: {
    fontSize: wp('3%'),
    color: '#374151',
    lineHeight: wp('4%'),
  },
  cardContact: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: hp('1%'),
  },
  contactText: {
    fontSize: wp('3%'),
    color: '#1E293B',
    marginBottom: hp('0.3%'),
  },
  formSection: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('4%'),
  },
  formTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('3%'),
  },
  inputGroup: {
    marginBottom: hp('2.5%'),
  },
  inputLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp('1%'),
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textInput: {
    fontSize: wp('4%'),
    color: '#1E293B',
  },
  textAreaContainer: {
    minHeight: hp('12%'),
  },
  textArea: {
    minHeight: hp('10%'),
  },
  characterCount: {
    fontSize: wp('3%'),
    color: '#6B7280',
    marginTop: hp('0.5%'),
  },
  errorText: {
    fontSize: wp('3.5%'),
    color: '#EF4444',
    marginTop: hp('0.5%'),
  },
  submitSection: {
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    borderRadius: wp('4%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSpinner: {
    marginRight: wp('3%'),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '700',
    marginLeft: wp('2%'),
  },
  tipsSection: {
    marginTop: hp('3%'),
    borderRadius: wp('3%'),
    padding: wp('4%'),
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  tipsTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  tipsText: {
    fontSize: wp('3.5%'),
    lineHeight: wp('5%'),
  },
});
