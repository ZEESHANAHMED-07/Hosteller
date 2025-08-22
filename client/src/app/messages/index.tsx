import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageContact {
  id: string;
  name: string;
  location: string;
  lastMessage: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  lastSeen?: string;
}

const messageContacts: MessageContact[] = [
  { 
    id: '1', 
    name: 'Alex Chen', 
    location: 'Bangkok, Thailand', 
    lastMessage: 'Thanks for sharing your card! 🙏', 
    time: '5m ago', 
    avatar: 'A', 
    isOnline: true, 
    unreadCount: 2 
  },
  { 
    id: '2', 
    name: 'Maria Rodriguez', 
    location: 'Barcelona, Spain', 
    lastMessage: 'Would love to meet up for coffee ☕', 
    time: '1h ago', 
    avatar: 'M', 
    isOnline: false, 
    unreadCount: 0,
    lastSeen: 'last seen 45 minutes ago'
  },
  { 
    id: '3', 
    name: 'David Kim', 
    location: 'Seoul, South Korea', 
    lastMessage: 'Check out this amazing hostel!', 
    time: '3h ago', 
    avatar: 'D', 
    isOnline: true, 
    unreadCount: 1 
  },
  { 
    id: '4', 
    name: 'Sarah Johnson', 
    location: 'Tokyo, Japan', 
    lastMessage: 'The ramen here is incredible! 🍜', 
    time: '1d ago', 
    avatar: 'S', 
    isOnline: false, 
    unreadCount: 0,
    lastSeen: 'last seen yesterday'
  },
  { 
    id: '5', 
    name: 'Ahmed Hassan', 
    location: 'Dubai, UAE', 
    lastMessage: 'Safe travels! Let me know when you arrive', 
    time: '2d ago', 
    avatar: 'A', 
    isOnline: true, 
    unreadCount: 0 
  },
];

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors, isDarkMode } = useTheme();

  const filteredContacts = messageContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarColor = (name: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.header} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={wp('6%')} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="add" size={wp('6%')} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={wp('4.5%')} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={wp('15%')} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery ? 'Try a different search term' : 'Start connecting with travelers to begin chatting'}
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact, index) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.messageItem,
                index === filteredContacts.length - 1 && styles.lastMessageItem,
                { borderBottomColor: colors.border }
              ]}
              onPress={() => console.log(`Opening chat with ${contact.name}`)}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(contact.name) }]}>
                  <Text style={styles.avatarText}>{contact.avatar}</Text>
                </View>
                {contact.isOnline && <View style={[styles.onlineIndicator, { borderColor: colors.card }]} />}
              </View>

              {/* Message Content */}
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.messageTime, { color: colors.textSecondary }]}>{contact.time}</Text>
                </View>
                
                <Text style={[styles.contactLocation, { color: colors.textSecondary }]}>{contact.location}</Text>
                
                <View style={styles.lastMessageRow}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      { color: colors.textSecondary },
                      contact.unreadCount > 0 && [styles.unreadMessage, { color: colors.text }]
                    ]} 
                    numberOfLines={1}
                  >
                    {contact.lastMessage}
                  </Text>
                  {contact.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                {!contact.isOnline && contact.lastSeen && (
                  <Text style={[styles.lastSeen, { color: colors.textSecondary }]}>{contact.lastSeen}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Ionicons name="chatbubble" size={wp('6%')} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: hp('6%'),
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#111827',
  },
  headerAction: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: wp('5%'),
    paddingHorizontal: wp('4%'),
    height: hp('5.5%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#111827',
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  lastMessageItem: {
    borderBottomWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp('3%'),
  },
  avatar: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp('4%'),
    height: wp('4%'),
    backgroundColor: '#10B981',
    borderRadius: wp('2%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.3%'),
  },
  contactName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#111827',
  },
  messageTime: {
    fontSize: wp('3.2%'),
    color: '#9CA3AF',
  },
  contactLocation: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: hp('0.5%'),
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    flex: 1,
    marginRight: wp('2%'),
  },
  unreadMessage: {
    color: '#111827',
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: wp('3%'),
    color: '#9CA3AF',
    marginTop: hp('0.3%'),
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: wp('2.5%'),
    minWidth: wp('5%'),
    height: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('1.5%'),
  },
  unreadText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
    paddingHorizontal: wp('8%'),
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#374151',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  emptySubtitle: {
    fontSize: wp('3.8%'),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  fab: {
    position: 'absolute',
    bottom: hp('3%'),
    right: wp('6%'),
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#25D366',
    borderRadius: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
