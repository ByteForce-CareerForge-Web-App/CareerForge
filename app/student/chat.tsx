import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '@/constants/api';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

type BackendMessage = {
  id: number | string;
  conversation_id: number | string;
  sender_id: number | string;
  message: string;
  created_at: string;
  read_at?: string | null;
};

type ChatResponse = {
  success?: boolean;
  message?: string;
  data?: {
    conversation_id?: number | string;
    participants?: Array<{
      user_id: number | string;
      name?: string;
      role?: string;
    }>;
    messages?: BackendMessage[];
  };
};

export default function ChatScreen() {
  const {
    conversationId: initialConversationId,
    userId,
    name,
    role,
    initials,
    online,
  } = useLocalSearchParams<{
    conversationId?: string;
    userId?: string;
    name?: string;
    role?: string;
    initials?: string;
    online?: string;
  }>();

  const contactName = name || 'CareerForge Member';
  const contactRole = role || 'CareerForge User';
  const contactInitials = initials || 'CF';
  const isOnline = online === 'true';

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId
      ? String(initialConversationId)
      : null
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Get authentication information
  |--------------------------------------------------------------------------
  */

  const getAuthData = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const storedUser = await AsyncStorage.getItem('user');

    if (!token) {
      throw new Error('Authentication token not found.');
    }

    let currentUserId: string | null = null;

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user?.id !== undefined && user?.id !== null) {
          currentUserId = String(user.id);
        } else if (
          user?.user_id !== undefined &&
          user?.user_id !== null
        ) {
          currentUserId = String(user.user_id);
        }
      } catch (error) {
        console.log('Error parsing stored user:', error);
      }
    }

    if (!currentUserId) {
      throw new Error('Current user information not found.');
    }

    return {
      token,
      currentUserId,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Format message time
  |--------------------------------------------------------------------------
  */

  const formatMessageTime = (createdAt: string) => {
    if (!createdAt) {
      return '';
    }

    const date = new Date(
      createdAt.includes('T')
        ? createdAt
        : createdAt.replace(' ', 'T')
    );

    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Load conversation messages
  |--------------------------------------------------------------------------
  */

  const loadMessages = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const { token, currentUserId } =
          await getAuthData();

        /*
         * If there is no conversation yet, there is
         * nothing to load.
         */
        if (!conversationId) {
          setMessages([]);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/messages.php?conversation_id=${encodeURIComponent(
            conversationId
          )}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const result: ChatResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              'Unable to load conversation.'
          );
        }

        const backendMessages =
          result.data?.messages || [];

        /*
         * The backend becomes the source of truth.
         * We replace the local list rather than appending,
         * which prevents duplicates during polling.
         */
        const formattedMessages: Message[] =
          backendMessages.map((item) => ({
            id: String(item.id),
            text: item.message,
            sender:
              String(item.sender_id) === currentUserId
                ? 'me'
                : 'them',
            time: formatMessageTime(item.created_at),
          }));

        setMessages(formattedMessages);
      } catch (error: any) {
        console.log(
          'Error loading conversation:',
          error
        );

        /*
         * Don't repeatedly show an Alert during polling.
         * The initial load can show an error to the user.
         */
        if (showLoader) {
          Alert.alert(
            'Unable to load messages',
            error?.message ||
              'Something went wrong while loading the conversation.'
          );
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [conversationId]
  );

  /*
  |--------------------------------------------------------------------------
  | Load messages whenever screen is focused
  |--------------------------------------------------------------------------
  |
  | The interval allows two logged-in users to see new
  | messages without manually refreshing the screen.
  |
  */

  useFocusEffect(
    useCallback(() => {
      let interval: ReturnType<typeof setInterval> | null =
        null;

      const startChat = async () => {
        await loadMessages(true);

        interval = setInterval(() => {
          loadMessages(false);
        }, 3000);
      };

      startChat();

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [loadMessages])
  );

  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    if (!conversationId && !userId) {
      Alert.alert(
        'Unable to send message',
        'No recipient was provided for this conversation.'
      );
      return;
    }

    try {
      setSending(true);

      const { token, currentUserId } =
        await getAuthData();

      const requestBody: {
        message: string;
        conversation_id?: number;
        recipient_id?: number;
      } = {
        message: trimmedMessage,
      };

      /*
       * Existing conversation:
       * send using conversation_id.
       */
      if (conversationId) {
        requestBody.conversation_id =
          Number(conversationId);
      } else {
        /*
         * First message:
         * send using recipient_id.
         *
         * The backend creates the conversation.
         */
        requestBody.recipient_id = Number(userId);
      }

      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result: ChatResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to send message.'
        );
      }

      /*
       * If this was the first message, the backend
       * returns the newly created conversation ID.
       */
      if (
        result.data?.conversation_id !== undefined &&
        result.data?.conversation_id !== null
      ) {
        setConversationId(
          String(result.data.conversation_id)
        );
      }

      setNewMessage('');

      /*
       * Reload immediately so the message appears
       * from the backend rather than relying on local state.
       */
      if (
        result.data?.conversation_id !== undefined &&
        result.data?.conversation_id !== null
      ) {
        const newConversationId = String(
          result.data.conversation_id
        );

        const refreshedResponse = await fetch(
          `${API_BASE_URL}/messages.php?conversation_id=${encodeURIComponent(
            newConversationId
          )}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const refreshedResult: ChatResponse =
          await refreshedResponse.json();

        if (
          refreshedResponse.ok &&
          refreshedResult.success
        ) {
          const backendMessages =
            refreshedResult.data?.messages || [];

          const formattedMessages: Message[] =
            backendMessages.map((item) => ({
              id: String(item.id),
              text: item.message,
              sender:
                String(item.sender_id) === currentUserId
                  ? 'me'
                  : 'them',
              time: formatMessageTime(
                item.created_at
              ),
            }));

          setMessages(formattedMessages);
        }
      }
    } catch (error: any) {
      console.log(
        'Error sending message:',
        error
      );

      Alert.alert(
        'Message not sent',
        error?.message ||
          'Something went wrong while sending your message.'
      );
    } finally {
      setSending(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render message
  |--------------------------------------------------------------------------
  */

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    const isMine = item.sender === 'me';

    return (
      <View
        style={[
          styles.messageRow,
          isMine && styles.myMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myMessageBubble
              : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine && styles.myMessageText,
            ]}
          >
            {item.text}
          </Text>

          <Text
            style={[
              styles.messageTime,
              isMine && styles.myMessageTime,
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 10 : 0
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/messages');
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {contactInitials}
          </Text>

          {isOnline && (
            <View style={styles.onlineDot} />
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {contactName}
          </Text>

          <Text style={styles.headerRole}>
            {isOnline ? 'Online' : contactRole}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#0B1F3A"
          />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 &&
              styles.emptyMessagesList,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No messages yet
              </Text>

              <Text style={styles.emptyText}>
                Start the conversation by sending a
                message below.
              </Text>
            </View>
          }
        />
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!sending}
        />

        <Pressable
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={
            !newMessage.trim() || sending
          }
        >
          {sending ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.sendIcon}>
              ➤
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    height: 100,
    paddingTop: 42,
    paddingHorizontal: 16,
    backgroundColor: '#0B1F3A',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '400',
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  avatarText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  onlineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    right: -1,
    bottom: 1,
    borderWidth: 2,
    borderColor: '#0B1F3A',
  },

  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },

  headerName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  headerRole: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
  },

  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 14,
  },

  myMessageRow: {
    justifyContent: 'flex-end',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
  },

  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
  },

  myMessageBubble: {
    backgroundColor: '#0B1F3A',
    borderBottomRightRadius: 5,
  },

  messageText: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  messageTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 5,
  },

  myMessageTime: {
    color: '#CBD5E1',
    textAlign: 'right',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: '#0F172A',
    fontSize: 15,
    marginRight: 8,
  },

  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  sendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});