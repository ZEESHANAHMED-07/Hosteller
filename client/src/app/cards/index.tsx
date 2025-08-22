import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ComponentProps } from 'react';
import { StatCardsSkeleton, CardTypesSkeleton, MyCardsSkeleton, TipsSkeleton } from '../../components/CardsSkeleton';
import { useTheme } from '../../contexts/ThemeContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface CardType {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  bgColor: string;
  route: string;
  features: string[];
}

interface QuickStat {
  label: string;
  value: string;
  icon: IconName;
  color: string;
}

const cardTypes: CardType[] = [
  {
    id: 'business',
    title: 'Business Card',
    description: 'Professional networking for work connections',
    icon: 'briefcase-outline',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    route: '/cards/createcards?type=business',
    features: ['Professional info', 'Company details', 'Contact methods']
  },
  {
    id: 'traveller',
    title: 'Traveller Card',
    description: 'Connect with fellow travelers worldwide',
    icon: 'airplane-outline',
    color: '#10B981',
    bgColor: '#D1FAE5',
    route: '/cards/createcards?type=traveller',
    features: ['Travel plans', 'Destinations', 'Social links']
  },
  {
    id: 'social',
    title: 'Social Card',
    description: 'Personal connections and social networking',
    icon: 'people-outline',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    route: '/cards/createcards?type=social',
    features: ['Social media', 'Interests', 'Personal info']
  }
];

const quickStats: QuickStat[] = [
  { label: 'Total Cards', value: '3', icon: 'card-outline', color: '#3B82F6' },
  { label: 'Shared Today', value: '12', icon: 'share-outline', color: '#10B981' },
  { label: 'Connections', value: '28', icon: 'link-outline', color: '#F59E0B' }
];

export default function CardsScreen() {
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setDataLoaded(true);
    }, 1000);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setDataLoaded(false);
    
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDataLoaded(true);
    setRefreshing(false);
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleHome} style={[styles.backButton, { backgroundColor: colors.surface }]} > 
            <Ionicons name="arrow-back" size={wp('6%')} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Cards</Text>
            <Text style={[styles.headerSubtitle, { color: colors.primary }]}>Manage your travel cards</Text>
          </View>
          <TouchableOpacity 
            style={[styles.headerAction, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/cards/createtypes')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={wp('6%')} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
          {!dataLoaded ? (
            <StatCardsSkeleton />
          ) : (
            <View style={styles.statsRow}>
              {quickStats.map((stat, index) => (
                <View
                  key={index}
                  style={[
                    styles.statCard,
                    { backgroundColor: colors.card, borderColor: colors.border, elevation: isDarkMode ? 0 : 2, shadowOpacity: isDarkMode ? 0 : 0.05 },
                  ]}
                >
                  <View style={[styles.statIcon, { backgroundColor: isDarkMode ? `${stat.color}22` : `${stat.color}20` }]}> 
                    <Ionicons name={stat.icon} size={wp('5%')} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Card Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Create New Card</Text>
          {!dataLoaded ? (
            <CardTypesSkeleton />
          ) : (
            cardTypes.map((cardType, index) => (
              <TouchableOpacity
                key={cardType.id}
                style={[
                  styles.cardTypeItem,
                  { backgroundColor: colors.card, borderColor: colors.border, elevation: isDarkMode ? 0 : 1, shadowOpacity: isDarkMode ? 0 : 0.03 },
                ]}
                onPress={() => router.push(cardType.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.cardTypeIcon, { backgroundColor: isDarkMode ? `${cardType.color}22` : cardType.bgColor }]}> 
                  <Ionicons name={cardType.icon} size={wp('6%')} color={cardType.color} />
                </View>
                
                <View style={styles.cardTypeContent}>
                  <Text style={[styles.cardTypeTitle, { color: colors.text }]}>{cardType.title}</Text>
                  <Text style={[styles.cardTypeDescription, { color: colors.textSecondary }]}>{cardType.description}</Text>
                  
                  <View style={styles.cardTypeFeatures}>
                    {cardType.features.map((feature, idx) => (
                      <Text key={idx} style={[styles.featureText, { color: colors.textSecondary }]}>• {feature}</Text>
                    ))}
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={wp('5%')} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* My Cards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Cards</Text>
          {!dataLoaded ? (
            <MyCardsSkeleton />
          ) : (
            <TouchableOpacity
              style={[
                styles.myCardsButton,
                { backgroundColor: colors.surface, borderColor: colors.border, elevation: isDarkMode ? 0 : 2, shadowOpacity: isDarkMode ? 0 : 0.05 },
              ]}
              onPress={() => router.push('/cards/mycards')}
              activeOpacity={0.7}
            >
              <View style={[styles.myCardsIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="albums" size={wp('6%')} color="#FFFFFF" />
              </View>
              
              <View style={[styles.myCardsContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: wp('3%') }]}> 
                <Text style={[styles.myCardsTitle, { color: colors.text }]}>View All Cards</Text>
                <Text style={[styles.myCardsDescription, { color: colors.textSecondary }]}>Manage, edit and share your existing cards</Text>
                
                <View style={styles.myCardsStats}>
                  <View style={styles.myCardsStat}>
                    <Text style={[styles.myCardsStatValue, { color: colors.primary }]}>3</Text>
                    <Text style={[styles.myCardsStatLabel, { color: colors.textSecondary }]}>Active</Text>
                  </View>
                  <View style={styles.myCardsStat}>
                    <Text style={[styles.myCardsStatValue, { color: colors.primary }]}>12</Text>
                    <Text style={[styles.myCardsStatLabel, { color: colors.textSecondary }]}>Shared</Text>
                  </View>
                  <View style={styles.myCardsStat}>
                    <Text style={[styles.myCardsStatValue, { color: colors.primary }]}>28</Text>
                    <Text style={[styles.myCardsStatLabel, { color: colors.textSecondary }]}>Views</Text>
                  </View>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={wp('5%')} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Pro Tips */}
        <View style={styles.section}>
          {!dataLoaded ? (
            <TipsSkeleton />
          ) : (
            <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border, elevation: isDarkMode ? 0 : 2, shadowOpacity: isDarkMode ? 0 : 0.05 }]}> 
              <View style={styles.tipsHeader}>
                <View style={[styles.tipsIcon, { backgroundColor: isDarkMode ? '#F59E0B22' : '#FEF3C7' }]}> 
                  <Ionicons name="bulb" size={wp('5%')} color="#F59E0B" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Pro Tips</Text>
              </View>
              
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={[styles.tipNumber, { backgroundColor: isDarkMode ? '#3B82F622' : '#DBEAFE' }]}> 
                    <Text style={styles.tipNumberText}>1</Text>
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Create different cards for different occasions and audiences</Text>
                </View>
                
                <View style={styles.tipItem}>
                  <View style={[styles.tipNumber, { backgroundColor: isDarkMode ? '#3B82F622' : '#DBEAFE' }]}> 
                    <Text style={styles.tipNumberText}>2</Text>
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Keep your information updated and relevant to your current travels</Text>
                </View>
                
                <View style={styles.tipItem}>
                  <View style={[styles.tipNumber, { backgroundColor: isDarkMode ? '#3B82F622' : '#DBEAFE' }]}> 
                    <Text style={styles.tipNumberText}>3</Text>
                  </View>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Use engaging visuals and clear descriptions to make connections</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: wp('4%'),
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: hp('0.5%'),
  },
  headerAction: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('2%'),
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    alignItems: 'center',
    marginHorizontal: wp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  statValue: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.5%'),
  },
  statLabel: {
    fontSize: wp('3%'),
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardTypeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTypeIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  cardTypeContent: {
    flex: 1,
  },
  cardTypeTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.5%'),
  },
  cardTypeDescription: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    marginBottom: hp('1%'),
    lineHeight: wp('5%'),
  },
  cardTypeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  featureText: {
    fontSize: wp('3%'),
    fontWeight: '500',
  },
  myCardsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myCardsIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  myCardsContent: {
    flex: 1,
  },
  myCardsTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.5%'),
  },
  myCardsDescription: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    marginBottom: hp('1%'),
    lineHeight: wp('5%'),
  },
  myCardsStats: {
    flexDirection: 'row',
  },
  myCardsStat: {
    alignItems: 'center',
    marginRight: wp('6%'),
  },
  myCardsStatValue: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#3B82F6',
  },
  myCardsStatLabel: {
    fontSize: wp('3%'),
    color: '#64748B',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  tipsIcon: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  tipsTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
  },
  tipsList: {
    gap: hp('1.5%'),
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
    marginTop: hp('0.2%'),
  },
  tipNumberText: {
    fontSize: wp('3%'),
    fontWeight: '700',
    color: '#3B82F6',
  },
  tipText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#64748B',
    lineHeight: wp('5%'),
  },
});