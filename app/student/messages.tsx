import AsyncStorage from '@react-native-async-storage/async-storage';
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
    lastMessage: 'Hi! I would be happy to help with your career journey.',
    time: '10:32 AM',
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student • BSc Data Science',
    initials: 'MN',
    online: true,
    lastMessage: 'Have you applied for the internship yet?',
    time: 'Yesterday',
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Alumni • Software Developer',
    initials: 'JS',
    online: false,
    lastMessage: 'Good luck with your application!',
    time: 'Monday',
  },
  {
    id: '4',
    name: 'Daniel Kumar',
    role: 'Alumni • Business Analyst',
    initials: 'DK',
    online: false,
    lastMessage: 'Let me know if you need any advice.',
    time: 'Sunday',
  },
];

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(
    defaultConversations
  );
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

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderConversation = ({
    item,
  }: {
    item: Conversation;
  }) => (
    <Pressable
      style={styles.conversationCard}
      onPress={() => openConversation(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.initials}</Text>

        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.role}>{item.role}</Text>

        <Text
          style={styles.lastMessage}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/dashboard');
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            Connect with your network
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Conversations */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Conversations
        </Text>

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
            <Text style={styles.emptyIcon}>💬</Text>

            <Text style={styles.emptyTitle}>
              No conversations found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for another student or alumni.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#416697',
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  backIcon: {
    fontSize: 24,
    color: '#0B1F3A',
    fontWeight: '600',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 3,
  },

  searchContainer: {
    margin: 18,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#0B1F3A',
    fontSize: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },

  list: {
    paddingBottom: 30,
  },

  conversationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
    position: 'relative',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  onlineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    bottom: 1,
  },

  conversationInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },

  time: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 8,
  },

  role: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  lastMessage: {
    color: '#475569',
    fontSize: 12,
    marginTop: 6,
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});