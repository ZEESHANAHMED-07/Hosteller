import { Link, useRouter } from 'expo-router';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
// Removed LinearGradient import to fix BVLinearGradient error
import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, useEffect, useState, useCallback } from 'react';
// import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useAuthContext } from '../providers/AuthProvider';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';


export default function Page() {
  const { user } = useAuthContext();
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigateToSettings = () => {
    router.push('/settings/index');
  };

  // Simulate data loading
  const loadData = useCallback(async () => {
    // Simulate API calls or data fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDataLoaded(true);
  }, []);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setDataLoaded(false);
    
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadData();
    
    setRefreshing(false);
  }, [loadData]);

  // Check if this is the first time user is seeing the welcome message
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (user?.uid) {
        try {
          const hasSeenWelcome = await AsyncStorage.getItem(`welcome_shown_${user.uid}`);
          if (!hasSeenWelcome) {
            setIsFirstTime(true);
            setShowWelcome(true);
            // Mark as shown
            await AsyncStorage.setItem(`welcome_shown_${user.uid}`, 'true');
          }
        } catch (error) {
          console.log('Error checking welcome status:', error);
        }
      }
      
      // Load initial data
      await loadData();
      
    };

    checkFirstTimeUser();
  }, [user?.uid, loadData]);

  // Get username from email (part before @)
  const getUsername = (email: string | null | undefined) => {
    if (!email) return 'User';
    return email.split('@')[0];
  };

  // Custom loading components (no external skeleton library)
  const WelcomeSkeleton = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') }}>
        <View style={[styles.skeletonBox, { width: wp('12%'), height: wp('12%'), borderRadius: wp('6%'), marginRight: wp('4%') }]} />
        <View style={{ flex: 1 }}>
          <View style={[styles.skeletonBox, { width: wp('40%'), height: wp('4%'), marginBottom: hp('0.5%') }]} />
          <View style={[styles.skeletonBox, { width: wp('25%'), height: wp('3%') }]} />
        </View>
      </View>
      <View style={[styles.skeletonBox, { height: hp('8%'), borderRadius: wp('3%') }]} />
    </View>
  );

  const QuickActionsSkeleton = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp('1%') }}>
      <View style={{ flex: 1, marginHorizontal: wp('1.5%') }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={[styles.actionCard, styles.skeletonCard]}>
            <View style={[styles.skeletonBox, { width: wp('10%'), height: wp('10%'), borderRadius: wp('5%'), marginBottom: hp('1%') }]} />
            <View style={[styles.skeletonBox, { width: wp('20%'), height: wp('3.5%'), marginBottom: hp('0.5%') }]} />
            <View style={[styles.skeletonBox, { width: wp('30%'), height: wp('3%') }]} />
          </View>
        ))}
      </View>
      <View style={{ flex: 1, marginHorizontal: wp('1.5%') }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={[styles.actionCard, styles.skeletonCard]}>
            <View style={[styles.skeletonBox, { width: wp('10%'), height: wp('10%'), borderRadius: wp('5%'), marginBottom: hp('1%') }]} />
            <View style={[styles.skeletonBox, { width: wp('20%'), height: wp('3.5%'), marginBottom: hp('0.5%') }]} />
            <View style={[styles.skeletonBox, { width: wp('30%'), height: wp('3%') }]} />
          </View>
        ))}
      </View>
    </View>
  );

  const ActivitySkeleton = () => (
    <View style={styles.activityCard}>
      {[1, 2].map((item) => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'center', padding: wp('4%') }}>
          <View style={[styles.skeletonBox, { width: wp('8%'), height: wp('8%'), borderRadius: wp('4%'), marginRight: wp('3%') }]} />
          <View style={{ flex: 1 }}>
            <View style={[styles.skeletonBox, { width: wp('30%'), height: wp('3.5%'), marginBottom: hp('0.5%') }]} />
            <View style={[styles.skeletonBox, { width: wp('50%'), height: wp('3%') }]} />
          </View>
          <View style={[styles.skeletonBox, { width: wp('12%'), height: wp('3%') }]} />
        </View>
      ))}
      <View style={{ padding: wp('4%') }}>
        <View style={[styles.skeletonBox, { width: wp('25%'), height: wp('3.5%'), alignSelf: 'center' }]} />
      </View>
    </View>
  );

  const StatsSkeleton = () => (
    <View style={[styles.statsCard, { backgroundColor: '#fff' }]}>
      <View style={[styles.skeletonBox, { width: wp('40%'), height: wp('4%'), marginBottom: hp('2%') }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={{ alignItems: 'center' }}>
            <View style={[styles.skeletonBox, { width: wp('12%'), height: wp('5%'), marginBottom: hp('0.5%') }]} />
            <View style={[styles.skeletonBox, { width: wp('15%'), height: wp('3%') }]} />
          </View>
        ))}
      </View>
    </View>
  );


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appTitle, { color: colors.text }]}>Hosteller</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Share. Connect. Travel.</Text>
          </View>
          <TouchableOpacity
            onPress={navigateToSettings}
            style={[styles.settingsButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={wp('5%')} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.textSecondary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.section}>
          {!dataLoaded ? (
            <WelcomeSkeleton />
          ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {isFirstTime && showWelcome ? (
              // First-time welcome message
              <View>
                <View style={styles.row}>
                  <View style={[styles.welcomeAvatar, { backgroundColor: isDarkMode ? '#F59E0B22' : '#FEF3C7' }]}>
                    <Ionicons name="sparkles" size={wp('7%')} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.firstTimeWelcome, { color: colors.text }]}>Welcome to TravelConnect!</Text>
                    <Text style={[styles.username, { color: colors.primary }]}>Hello, {getUsername(user?.displayName || user?.email)}! 👋</Text>
                    <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>We're excited to have you join our travel community</Text>
                  </View>
                </View>

                <View style={styles.firstTimeGradientBox}>
                  <Text style={styles.gradientTitle}>Let's get you started!</Text>
                  <Text style={styles.gradientSub}>
                    Create your first travel card and start connecting with fellow travelers
                  </Text>
                </View>
              </View>
            ) : (
              // Regular welcome back message
              <View>
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#3B82F622' : '#DBEAFE' }]}>
                    <Ionicons name="person" size={wp('6%')} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcome, { color: colors.text }]}>Welcome back!</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{getUsername(user?.displayName || user?.email)}</Text>
                  </View>
                </View>

                <View style={styles.gradientBox}>
                  <Text style={styles.gradientTitle}>Ready to explore?</Text>
                  <Text style={styles.gradientSub}>
                    Connect with fellow travelers and share your journey
                  </Text>
                </View>
              </View>
            )}
          </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

          {!dataLoaded ? (
            <QuickActionsSkeleton />
          ) : (
          <View style={styles.quickActions}>
            <View style={styles.actionColumn}>
              {quickActionData.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? `${item.color}22` : item.bg }]}> 
                    <Ionicons name={item.icon} size={wp('6%')} color={item.color} />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actionColumn}>
              {quickActionData.slice(3, 6).map((item, index) => (
                <TouchableOpacity
                  key={index + 3}
                  style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? `${item.color}22` : item.bg }]}> 
                    <Ionicons name={item.icon} size={wp('6%')} color={item.color} />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.section}>
          {!dataLoaded ? (
            <StatsSkeleton />
          ) : (
          <View style={styles.statsCard}>
            <Text style={[styles.statsTitle, { color: '#fff' }]}>Your Travel Network</Text>

            <View style={styles.statsRow}>
              {statsData.map((stat, idx) => (
                <View key={idx} style={{ alignItems: 'center' }}>
                  <Text style={[styles.statsNumber, { color: '#fff' }]}>{stat.value}</Text>
                  <Text style={[styles.statsLabel, { color: '#C7D2FE' }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

interface QuickAction {
  title: string;
  desc: string;
  icon: IconName;
  bg: string;
  color: string;
  route?: '/cards' | '/sharing' | '/connections' | string;
}

interface Activity {
  title: string;
  desc: string;
  icon: IconName;
  bg: string;
  color: string;
  time: string;
}

const quickActionData: QuickAction[] = [
  { title: 'Cards', desc: 'Manage your cards', icon: 'card-outline', bg: '#DBEAFE', color: '#3B82F6', route: '/cards' },
  { title: 'Share Contact', desc: 'Share your details with travelers', icon: 'add-circle-outline', bg: '#D1FAE5', color: '#059669', route: '/sharing' },
  { title: 'Find Travelers', desc: 'Discover nearby travelers', icon: 'people-outline', bg: '#EDE9FE', color: '#7C3AED' },
  { title: 'My Connections', desc: 'View shared cards', icon: 'link-outline', bg: '#F3E8FF', color: '#8B5CF6', route: '/connections' },
  { title: 'My Location', desc: 'Update your current location', icon: 'location-outline', bg: '#FFEDD5', color: '#EA580C' },
  { title: 'Messages', desc: 'Chat with connections', icon: 'chatbubbles-outline', bg: '#FCE7F3', color: '#DB2777', route: '/messages' },
];

const recentActivity: Activity[] = [
  { title: 'New connection', desc: 'Someone saved your contact', icon: 'person-add', bg: '#DBEAFE', color: '#3B82F6', time: '2h ago' },
  { title: 'Location updated', desc: 'Now visible to nearby travelers', icon: 'location', bg: '#D1FAE5', color: '#059669', time: '1d ago' },
];


const statsData = [
  { value: '12', label: 'Connections' },
  { value: '5', label: 'Countries' },
  { value: '28', label: 'Interactions' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    backgroundColor: '#fff',
    paddingTop: hp('6%'),
    paddingBottom: hp('3%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: wp('6%'), fontWeight: 'bold', color: '#111827' },
  subTitle: { color: '#4B5563', fontSize: wp('3.5%'), marginTop: hp('0.5%') },
  settingsButton: {
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#F3F4F6',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { paddingHorizontal: wp('4%'), marginBottom: hp('2%') },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') },
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#DBEAFE',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  welcome: { fontSize: wp('4.5%'), fontWeight: '600', color: '#111827' },
  email: { color: '#4B5563', fontSize: wp('3.5%') },
  firstTimeWelcome: { 
    fontSize: wp('5%'), 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: hp('0.5%')
  },
  username: { 
    fontSize: wp('4%'), 
    fontWeight: '600', 
    color: '#3B82F6',
    marginBottom: hp('0.5%')
  },
  welcomeDesc: { 
    color: '#6B7280', 
    fontSize: wp('3.3%'),
    lineHeight: wp('4.5%')
  },
  welcomeAvatar: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#FEF3C7',
    borderRadius: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  firstTimeGradientBox: { 
    backgroundColor: '#10B981', 
    borderRadius: wp('3%'), 
    padding: wp('4%'),
    marginTop: hp('1.5%')
  },
  gradientBox: { backgroundColor: '#3B82F6', borderRadius: wp('3%'), padding: wp('4%') },
  gradientTitle: { color: '#fff', fontWeight: '500', marginBottom: hp('0.5%') },
  gradientSub: { color: '#BFDBFE', fontSize: wp('3.5%') },
  sectionTitle: { color: '#374151', fontWeight: '600', fontSize: wp('4.5%'), marginBottom: hp('1%') },
  quickActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: wp('1%'),
  },
  actionColumn: { 
    flex: 1, 
    marginHorizontal: wp('1.5%'),
    maxWidth: wp('47%'),
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: hp('1.5%'),
    height: hp('14%'),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  actionIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  actionTitle: { 
    fontWeight: '500', 
    color: '#111827', 
    marginBottom: hp('0.5%'),
    fontSize: wp('3.8%'),
    lineHeight: wp('4.5%'),
  },
  actionDesc: { 
    color: '#4B5563', 
    fontSize: wp('3.2%'),
    lineHeight: wp('4%'),
    flexShrink: 1,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: wp('4%') },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityIcon: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  activityTitle: { fontWeight: '500', color: '#111827' },
  activityDesc: { color: '#6B7280', fontSize: wp('3.2%') },
  activityTime: { color: '#9CA3AF', fontSize: wp('2.8%') },
  viewAll: { color: '#2563EB', fontWeight: '500', textAlign: 'center' },
  statsCard: {
    backgroundColor: '#6366F1',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  statsTitle: { color: '#fff', fontWeight: '600', fontSize: wp('4.5%'), marginBottom: hp('2%') },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsNumber: { color: '#fff', fontSize: wp('6%'), fontWeight: 'bold' },
  statsLabel: { color: '#C7D2FE', fontSize: wp('3.2%') },
  skeletonBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonCard: {
    opacity: 0.7,
  },
});
