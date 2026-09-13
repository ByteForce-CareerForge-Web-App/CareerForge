import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  online: boolean;
  lastMessage: string;
  time: string;
};

const MESSAGES_KEY = 'careerforge_messages';

const defaultConversations: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Williams',
    role: 'Alumni • Data Analyst',
    initials: 'SW',
    online: true,
    lastMessage:
      'Hi! I would be happy to help with your career journey.',
    time: '10:32 AM',
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student • BSc Data Science',
    initials: 'MN',
    online: true,
    lastMessage:
      'Have you applied for the internship yet?',
    time: 'Yesterday',
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Alumni • Software Developer',
    initials: 'JS',
    online: false,
    lastMessage:
      'Good luck with your application!',
    time: 'Monday',
  },
  {
    id: '4',
    name: 'Daniel Kumar',
    role: 'Alumni • Business Analyst',
    initials: 'DK',
    online: false,
    lastMessage:
      'Let me know if you need any advice.',
    time: 'Sunday',
  },
];

export default function MessagesScreen() {
  const [conversations, setConversations] =
    useState<Conversation[]>(defaultConversations);

  const [search, setSearch] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_KEY);

      if (stored) {
        setConversations(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          MESSAGES_KEY,
          JSON.stringify(defaultConversations)
        );
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  const openConversation = (conversation: Conversation) => {
    router.push({
      pathname: '/student/chat',
      params: {
        name: conversation.name,
        role: conversation.role,
        initials: conversation.initials,
        online: conversation.online ? 'true' : 'false',
      },
    });
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      `${conversation.name} ${conversation.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const onlineCount = conversations.filter(
    (conversation) => conversation.online
  ).length;

  const renderConversation = ({
    item,
  }: {
    item: Conversation;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.conversationCard,
        pressed && styles.conversationPressed,
      ]}
      onPress={() => openConversation(item)}
    >
      {/* Avatar */}
      <View style={styles.avatarOuter}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.initials}
          </Text>
        </View>

        {item.online && <View style={styles.onlineDot} />}
      </View>

      {/* Conversation information */}
      <View style={styles.conversationInfo}>
        <View style={styles.nameRow}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.time}>
            {item.time}
          </Text>
        </View>

        <View style={styles.roleRow}>
          <Ionicons
            name={
              item.role.startsWith('Alumni')
                ? 'school-outline'
                : 'person-outline'
            }
            size={12}
            color="#4C7DFF"
          />

          <Text style={styles.role}>
            {item.role}
          </Text>
        </View>

        <View style={styles.messagePreviewRow}>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="#A4B2C5"
          />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlowOne} />
        <View style={styles.headerGlowTwo} />

        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/student/dashboard');
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#172A55"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              CAREERFORGEAI
            </Text>

            <Text style={styles.headerTitle}>
              Messages
            </Text>

            <Text style={styles.headerSubtitle}>
              Stay connected with your network
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="chatbubbles"
              size={22}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Header summary */}
        <View style={styles.headerSummary}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="people-outline"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryNumber}>
              {conversations.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Conversations
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryIcon}>
            <View style={styles.summaryOnlineDot} />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryNumber}>
              {onlineCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Online now
            </Text>
          </View>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <Ionicons
              name="search"
              size={19}
              color="#2457E6"
            />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* Section heading */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              YOUR NETWORK
            </Text>

            <Text style={styles.sectionTitle}>
              Conversations
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {filteredConversations.length}
            </Text>
          </View>
        </View>

        {/* Conversation list */}
        {filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={36}
                  color="#2457E6"
                />
              </View>
            </View>

            <Text style={styles.emptyTitle}>
              No conversations found
            </Text>

            <Text style={styles.emptyText}>
              We couldn't find anyone matching
              {'\n'}
              "{search}".
            </Text>

            <Pressable
              style={styles.clearSearchButton}
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.clearSearchButtonText}>
                Clear Search
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  /* ---------------- HEADER ---------------- */

  header: {
    backgroundColor: '#102A72',
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: 'hidden',
  },

  headerGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#2457E6',
    opacity: 0.45,
    right: -65,
    top: -75,
  },

  headerGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4C7DFF',
    opacity: 0.22,
    left: -55,
    bottom: -70,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  backButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#9DB7FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    color: '#C8D5F4',
    fontSize: 11,
    marginTop: 3,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5D83F3',
  },

  /* ---------------- HEADER SUMMARY ---------------- */

  headerSummary: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 17,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(76,125,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  summaryText: {
    flex: 1,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  summaryLabel: {
    color: '#BFD0F3',
    fontSize: 9,
    marginTop: 1,
    fontWeight: '600',
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 12,
  },

  summaryOnlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#B8EFC9',
  },

  /* ---------------- CONTENT ---------------- */

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  /* ---------------- SEARCH ---------------- */

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE5F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    color: '#172A55',
    fontSize: 14,
    paddingVertical: 0,
  },

  clearButton: {
    padding: 8,
  },

  /* ---------------- SECTION ---------------- */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 11,
  },

  sectionEyebrow: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  countBadge: {
    minWidth: 31,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadgeText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '900',
  },

  /* ---------------- LIST ---------------- */

  list: {
    paddingBottom: 30,
  },

  conversationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#DCE5F3',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  conversationPressed: {
    backgroundColor: '#F7F9FF',
    transform: [{ scale: 0.985 }],
  },

  /* ---------------- AVATAR ---------------- */

  avatarOuter: {
    width: 58,
    height: 58,
    marginRight: 13,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DDE8FF',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    bottom: 2,
  },

  /* ---------------- CONVERSATION ---------------- */

  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: '#172A55',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },

  time: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 8,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  role: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 4,
  },

  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  lastMessage: {
    color: '#475569',
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },

  /* ---------------- EMPTY ---------------- */

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 38,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F3',
    marginTop: 4,
  },

  emptyIconOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#F1F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
  },

  emptyIconContainer: {
    width: 61,
    height: 61,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '900',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  clearSearchButton: {
    marginTop: 20,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: '#2457E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },
});
