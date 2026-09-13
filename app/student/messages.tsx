import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '@/constants/api';

type BackendConversation = {
  conversation_id?: string | number;
  other_user_id?: string | number;
  other_name?: string;
  other_email?: string;
  other_role?: string;
  qualification?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
  last_message?: string | null;
  last_message_time?: string | null;
  unread_count?: string | number;
};

type Conversation = {
  id: string;
  userId: string;
  name: string;
  role: string;
  initials: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
};

type MessagesResponse = {
  success?: boolean;
  message?: string;
  data?: {
    conversations?: BackendConversation[];
  };
};

const getInitials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'CF';
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const getRoleDescription = (
  conversation: BackendConversation
): string => {
  const role = String(conversation.other_role ?? 'Member');

  if (role === 'student') {
    if (conversation.qualification) {
      return `Student • ${conversation.qualification}`;
    }

    return 'Student';
  }

  if (role === 'alumni') {
    if (
      conversation.position &&
      conversation.company
    ) {
      return `Alumni • ${conversation.position}`;
    }

    if (conversation.qualification) {
      return `Alumni • ${conversation.qualification}`;
    }

    return 'Alumni';
  }

  if (role === 'business') {
    if (conversation.company) {
      return `Business • ${conversation.company}`;
    }

    if (conversation.industry) {
      return `Business • ${conversation.industry}`;
    }

    return 'Business';
  }

  if (role === 'admin') {
    return 'Admin';
  }

  return 'CareerForge Member';
};

const formatTime = (
  dateValue?: string | null
): string => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(
    dateValue.replace(' ', 'T')
  );

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], {
    weekday: 'long',
  });
};

export default function MessagesScreen() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/student/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const responseText = await response.text();

        console.log(
          'MESSAGES API STATUS:',
          response.status
        );

        console.log(
          'MESSAGES API RESPONSE:',
          responseText
        );

        let data: MessagesResponse;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.log(
            'MESSAGES API JSON PARSE ERROR:',
            error
          );

          throw new Error(
            `Messages API did not return JSON. Response starts with: ${responseText.substring(
              0,
              500
            )}`
          );
        }

      if (!response.ok || data.success === false) {
        console.log(
          'Messages API error:',
          data.message
        );

        setConversations([]);
        return;
      }

      const backendConversations =
        Array.isArray(
          data.data?.conversations
        )
          ? data.data.conversations
          : [];

      const mappedConversations =
        backendConversations.map(
          (conversation): Conversation => {
            const name = String(
              conversation.other_name ??
                'CareerForge Member'
            );

            return {
              id: String(
                conversation.conversation_id ?? ''
              ),

              userId: String(
                conversation.other_user_id ?? ''
              ),

              name,

              role: getRoleDescription(
                conversation
              ),

              initials: getInitials(name),

              /*
               * The current backend does not yet have
               * a true real-time online-status system.
               * Keep this false until we implement one.
               */
              online: false,

              lastMessage: String(
                conversation.last_message ??
                  'No messages yet.'
              ),

              time: formatTime(
                conversation.last_message_time
              ),

              unreadCount: Number(
                conversation.unread_count ?? 0
              ),
            };
          }
        );

      setConversations(
        mappedConversations.filter(
          (conversation) =>
            conversation.id &&
            conversation.userId
        )
      );

    } catch (error) {
      console.log(
        'Error loading conversations:',
        error
      );

      setConversations([]);

    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const openConversation = (
    conversation: Conversation
  ) => {
    router.push({
      pathname: '/student/chat',
      params: {
        conversationId: conversation.id,
        userId: conversation.userId,
        name: conversation.name,
        role: conversation.role,
        initials: conversation.initials,
        online: conversation.online
          ? 'true'
          : 'false',
      },
    });
  };

  const filteredConversations =
    conversations.filter((conversation) =>
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
        <Text style={styles.avatarText}>
          {item.initials}
        </Text>

        {item.online && (
          <View style={styles.onlineDot} />
        )}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.time}>
            {item.time}
          </Text>
        </View>

        <Text style={styles.role}>
          {item.role}
        </Text>

        <View style={styles.lastMessageRow}>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99
                  ? '99+'
                  : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
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
              router.replace(
                '/student/dashboard'
              );
            }
          }}
        >
          <Text style={styles.backIcon}>
            ←
          </Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>
            Messages
          </Text>

          <Text style={styles.headerSubtitle}>
            Connect with your network
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>
          🔍
        </Text>

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

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator
              size="small"
              color="#0B1F3A"
            />

            <Text style={styles.loadingText}>
              Loading conversations...
            </Text>
          </View>
        ) : filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              💬
            </Text>

            <Text style={styles.emptyTitle}>
              {search.trim()
                ? 'No conversations found'
                : 'No conversations yet'}
            </Text>

            <Text style={styles.emptyText}>
              {search.trim()
                ? 'Try searching for another student, alumni, or business.'
                : 'Connect with people in your network to start messaging.'}
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

  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  lastMessage: {
    color: '#475569',
    fontSize: 12,
    flex: 1,
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  loadingState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
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

