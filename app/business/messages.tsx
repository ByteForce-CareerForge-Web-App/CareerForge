import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '@/constants/api';

type ChatMessage = {
  id: string;
  conversationId: string;
  sender: 'business' | 'candidate';
  message: string;
  timestamp: string;
  read: boolean;
};

type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  userId: string;
  qualification?: string;
  company?: string;
  position?: string;
  industry?: string;
};

type MessagesResponse = {
  success?: boolean;
  message?: string;
  data?: {
    conversations?: any[];
    conversation_id?: number | string;
    participants?: any[];
    messages?: any[];
  };
};

export default function BusinessMessagesScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    role?: string;
    initials?: string;
    conversationId?: string;
    userId?: string;
  }>();

  const selectedName = params.name ? String(params.name) : '';
  const selectedRole = params.role ? String(params.role) : '';
  const selectedInitials = params.initials
    ? String(params.initials)
    : '';

  const selectedConversationId = params.conversationId
    ? String(params.conversationId)
    : '';

  const selectedUserId = params.userId
    ? String(params.userId)
    : '';

  const hasSelectedPerson = !!selectedName;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getInitials = (name: string) => {
    if (!name) return '?';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const formatTimestamp = (value: string) => {
    if (!value) return '';

    const date = new Date(
      value.includes('T')
        ? value
        : value.replace(' ', 'T')
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const now = new Date();

    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (sameDay) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
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
      day: '2-digit',
      month: 'short',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Load conversations from backend
  |--------------------------------------------------------------------------
  */

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        setConversations([]);
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

      const result: MessagesResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to load conversations.'
        );
      }

      const backendConversations =
        result.data?.conversations || [];

      const mappedConversations: Conversation[] =
        backendConversations.map((conversation: any) => {
          const name =
            conversation.other_name ||
            'Unknown User';

          return {
            id: String(
              conversation.conversation_id
            ),
            userId: String(
              conversation.other_user_id
            ),
            name,
            role:
              conversation.other_role ||
              'Professional Connection',
            initials: getInitials(name),
            lastMessage:
              conversation.last_message ||
              'No messages yet.',
            timestamp: formatTimestamp(
              conversation.last_message_time ||
                conversation.updated_at ||
                ''
            ),
            unread: Number(
              conversation.unread_count || 0
            ),
            qualification:
              conversation.qualification ||
              undefined,
            company:
              conversation.company ||
              undefined,
            position:
              conversation.position ||
              undefined,
            industry:
              conversation.industry ||
              undefined,
          };
        });

      setConversations(mappedConversations);
    } catch (error) {
      console.error(
        'Load business conversations error:',
        error
      );

      setConversations([]);

      Alert.alert(
        'Messages',
        error instanceof Error
          ? error.message
          : 'Unable to load messages.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load messages for selected conversation
  |--------------------------------------------------------------------------
  */

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        const token =
          await AsyncStorage.getItem('authToken');

        if (!token || !conversationId) {
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

        const result: MessagesResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              'Failed to load conversation.'
          );
        }

        const backendMessages =
          result.data?.messages || [];

        const currentUserRaw =
          await AsyncStorage.getItem('user');

        let currentUserId = '';

        if (currentUserRaw) {
          try {
            const currentUser =
              JSON.parse(currentUserRaw);

            currentUserId = String(
              currentUser?.id || ''
            );
          } catch {
            currentUserId = '';
          }
        }

        const mappedMessages: ChatMessage[] =
          backendMessages.map((item: any) => ({
            id: String(item.id),
            conversationId: String(
              item.conversation_id
            ),
            sender:
              String(item.sender_id) ===
              currentUserId
                ? 'business'
                : 'candidate',
            message: String(
              item.message || ''
            ),
            timestamp: formatTimestamp(
              item.created_at || ''
            ),
            read: !!item.read_at,
          }));

        setMessages(mappedMessages);

        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({
            animated: false,
          });
        });
      } catch (error) {
        console.error(
          'Load business chat error:',
          error
        );

        setMessages([]);

        Alert.alert(
          'Messages',
          error instanceof Error
            ? error.message
            : 'Unable to load conversation.'
        );
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Mark conversation as read
  |--------------------------------------------------------------------------
  */

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      try {
        const token =
          await AsyncStorage.getItem('authToken');

        if (!token || !conversationId) return;

        await fetch(
          `${API_BASE_URL}/messages.php`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              conversation_id: Number(
                conversationId
              ),
            }),
          }
        );

        setConversations(prev =>
          prev.map(conversation =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unread: 0,
                }
              : conversation
          )
        );
      } catch (error) {
        console.error(
          'Mark conversation read error:',
          error
        );
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Initial / focus loading
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  /*
  |--------------------------------------------------------------------------
  | Selected conversation loading
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      markConversationRead(
        selectedConversationId
      );
    } else {
      setMessages([]);
    }
  }, [
    selectedConversationId,
    loadMessages,
    markConversationRead,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Current conversation
  |--------------------------------------------------------------------------
  */

  const currentConversation = useMemo(() => {
    if (selectedConversationId) {
      return conversations.find(
        conversation =>
          conversation.id ===
          selectedConversationId
      );
    }

    if (selectedName) {
      return {
        id: '',
        userId: selectedUserId,
        name: selectedName,
        role:
          selectedRole ||
          'Professional Connection',
        initials:
          selectedInitials ||
          getInitials(selectedName),
        lastMessage: '',
        timestamp: '',
        unread: 0,
      };
    }

    return undefined;
  }, [
    conversations,
    selectedConversationId,
    selectedName,
    selectedRole,
    selectedInitials,
    selectedUserId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async () => {
    const trimmedMessage =
      messageText.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    try {
      setSending(true);

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Messages',
          'You are not logged in.'
        );
        return;
      }

      let targetConversationId =
        selectedConversationId;

      let recipientId =
        currentConversation?.userId ||
        selectedUserId;

      /*
      |----------------------------------------------------------------------
      | New conversation
      |----------------------------------------------------------------------
      */

      if (!targetConversationId) {
        if (!recipientId) {
          Alert.alert(
            'Messages',
            'The recipient could not be identified.'
          );
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/messages.php`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              recipient_id: Number(
                recipientId
              ),
              message: trimmedMessage,
            }),
          }
        );

        const result: MessagesResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              'Failed to send message.'
          );
        }

        const newConversationId =
          result.data?.conversation_id;

        const newMessage =
          result.data?.message;

        if (newConversationId) {
          targetConversationId = String(
            newConversationId
          );
        }

        if (newMessage) {
          const currentUserRaw =
            await AsyncStorage.getItem('user');

          let currentUserId = '';

          if (currentUserRaw) {
            try {
              const currentUser =
                JSON.parse(currentUserRaw);

              currentUserId = String(
                currentUser?.id || ''
              );
            } catch {
              currentUserId = '';
            }
          }

          setMessages(prev => [
            ...prev,
            {
              id: String(newMessage.id),
              conversationId:
                String(
                  newMessage.conversation_id
                ),
              sender:
                String(
                  newMessage.sender_id
                ) === currentUserId
                  ? 'business'
                  : 'candidate',
              message:
                String(
                  newMessage.message ||
                    trimmedMessage
                ),
              timestamp:
                formatTimestamp(
                  newMessage.created_at ||
                    ''
                ),
              read: !!newMessage.read_at,
            },
          ]);
        }

        setMessageText('');

        await loadConversations();

        return;
      }

      /*
      |----------------------------------------------------------------------
      | Existing conversation
      |----------------------------------------------------------------------
      */

      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            conversation_id: Number(
              targetConversationId
            ),
            message: trimmedMessage,
          }),
        }
      );

      const result: MessagesResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to send message.'
        );
      }

      const newMessage =
        result.data?.message;

      if (newMessage) {
        const currentUserRaw =
          await AsyncStorage.getItem('user');

        let currentUserId = '';

        if (currentUserRaw) {
          try {
            const currentUser =
              JSON.parse(currentUserRaw);

            currentUserId = String(
              currentUser?.id || ''
            );
          } catch {
            currentUserId = '';
          }
        }

        setMessages(prev => [
          ...prev,
          {
            id: String(newMessage.id),
            conversationId:
              String(
                newMessage.conversation_id
              ),
            sender:
              String(
                newMessage.sender_id
              ) === currentUserId
                ? 'business'
                : 'candidate',
            message:
              String(
                newMessage.message ||
                  trimmedMessage
              ),
            timestamp:
              formatTimestamp(
                newMessage.created_at || ''
              ),
            read: !!newMessage.read_at,
          },
        ]);
      }

      setMessageText('');

      await loadConversations();

      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });
      });
    } catch (error) {
      console.error(
        'Send business message error:',
        error
      );

      Alert.alert(
        'Messages',
        error instanceof Error
          ? error.message
          : 'Unable to send message.'
      );
    } finally {
      setSending(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open conversation
  |--------------------------------------------------------------------------
  */

  const openConversation = (
    conversation: Conversation
  ) => {
    router.push({
      pathname: '/business/chat',
      params: {
        conversationId:
          conversation.id,
        userId: conversation.userId,
        name: conversation.name,
        role: conversation.role,
        initials: conversation.initials,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Filter / unread count
  |--------------------------------------------------------------------------
  */

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + conversation.unread,
        0
      ),
    [conversations]
  );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Messages
          </Text>

          <Text style={styles.headerSubtitle}>
            Connect with candidates and
            professionals
          </Text>
        </View>

        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {totalUnread}
            </Text>
          </View>
        )}
      </View>

      {!hasSelectedPerson ? (
        <ScrollView
          style={styles.inbox}
          contentContainerStyle={
            styles.inboxContent
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                Loading messages...
              </Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={34}
                  color="#666"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No messages yet
              </Text>

              <Text style={styles.emptyText}>
                Your conversations with
                candidates and professionals
                will appear here.
              </Text>

              <Pressable
                style={styles.backButton}
                onPress={() =>
                  router.push(
                    '/business/connections'
                  )
                }
              >
                <Text style={styles.backButtonText}>
                  Find Connections
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Conversations
              </Text>

              {conversations.map(
                conversation => (
                  <Pressable
                    key={conversation.id}
                    style={styles.conversationCard}
                    onPress={() =>
                      openConversation(
                        conversation
                      )
                    }
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {
                          conversation.initials
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.conversationContent
                      }
                    >
                      <View
                        style={
                          styles.conversationTop
                        }
                      >
                        <Text
                          style={
                            styles.name
                          }
                          numberOfLines={1}
                        >
                          {
                            conversation.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.timestamp
                          }
                        >
                          {
                            conversation.timestamp
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.role
                        }
                        numberOfLines={1}
                      >
                        {
                          conversation.role
                        }
                      </Text>

                      <View
                        style={
                          styles.messageRow
                        }
                      >
                        <Text
                          style={[
                            styles.lastMessage,
                            conversation.unread >
                            0 &&
                              styles.unreadMessage,
                          ]}
                          numberOfLines={1}
                        >
                          {
                            conversation.lastMessage
                          }
                        </Text>

                        {conversation.unread >
                          0 && (
                          <View
                            style={
                              styles.unreadBadge
                            }
                          >
                            <Text
                              style={
                                styles.unreadBadgeText
                              }
                            >
                              {
                                conversation.unread
                              }
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#999"
                    />
                  </Pressable>
                )
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backIcon}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#111"
              />
            </Pressable>

            <View style={styles.chatAvatar}>
              <Text
                style={styles.chatAvatarText}
              >
                {currentConversation?.initials ||
                  selectedInitials ||
                  getInitials(selectedName)}
              </Text>
            </View>

            <View
              style={styles.chatHeaderInfo}
            >
              <Text
                style={styles.chatName}
                numberOfLines={1}
              >
                {currentConversation?.name ||
                  selectedName}
              </Text>

              <Text
                style={styles.chatRole}
                numberOfLines={1}
              >
                {currentConversation?.role ||
                  selectedRole ||
                  'Professional Connection'}
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({
                animated: false,
              })
            }
          >
            {messages.length === 0 ? (
              <View style={styles.chatEmpty}>
                <Ionicons
                  name="chatbubble-outline"
                  size={32}
                  color="#999"
                />

                <Text
                  style={
                    styles.chatEmptyTitle
                  }
                >
                  Start the conversation
                </Text>

                <Text
                  style={
                    styles.chatEmptyText
                  }
                >
                  Send a message to begin
                  chatting.
                </Text>
              </View>
            ) : (
              messages.map(message => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubbleWrapper,
                    message.sender ===
                      'business'
                      ? styles.businessMessageWrapper
                      : styles.candidateMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.sender ===
                        'business'
                        ? styles.businessBubble
                        : styles.candidateBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.sender ===
                          'business'
                          ? styles.businessMessageText
                          : styles.candidateMessageText,
                      ]}
                    >
                      {message.message}
                    </Text>

                    <Text
                      style={[
                        styles.messageTime,
                        message.sender ===
                          'business'
                          ? styles.businessMessageTime
                          : styles.candidateMessageTime,
                      ]}
                    >
                      {message.timestamp}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              style={styles.input}
              maxLength={5000}
              editable={!sending}
              onSubmitEditing={event => {
                if (
                  Platform.OS !== 'ios' &&
                  !event.nativeEvent.text
                ) {
                  return;
                }

                sendMessage();
              }}
            />

            <Pressable
              style={[
                styles.sendButton,
                (!messageText.trim() ||
                  sending) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={
                !messageText.trim() ||
                sending
              }
            >
              <Ionicons
                name="send"
                size={20}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#777',
  },

  headerBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 8,
  },

  headerBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  inbox: {
    flex: 1,
  },

  inboxContent: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  conversationContent: {
    flex: 1,
    minWidth: 0,
  },

  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginRight: 10,
  },

  timestamp: {
    fontSize: 11,
    color: '#999',
  },

  role: {
    marginTop: 3,
    fontSize: 12,
    color: '#777',
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: '#777',
    marginRight: 8,
  },

  unreadMessage: {
    color: '#111',
    fontWeight: '600',
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 80,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#777',
    textAlign: 'center',
  },

  backButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111',
  },

  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  chatContainer: {
    flex: 1,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  backIcon: {
    padding: 5,
    marginRight: 5,
  },

  chatAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  chatAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  chatHeaderInfo: {
    flex: 1,
  },

  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  chatRole: {
    marginTop: 2,
    fontSize: 12,
    color: '#777',
  },

  messages: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  messagesContent: {
    padding: 16,
    paddingBottom: 25,
  },

  messageBubbleWrapper: {
    width: '100%',
    marginBottom: 10,
  },

  businessMessageWrapper: {
    alignItems: 'flex-end',
  },

  candidateMessageWrapper: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  businessBubble: {
    backgroundColor: '#111',
    borderBottomRightRadius: 4,
  },

  candidateBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  businessMessageText: {
    color: '#fff',
  },

  candidateMessageText: {
    color: '#111',
  },

  messageTime: {
    marginTop: 5,
    fontSize: 9,
  },

  businessMessageTime: {
    color: '#bbb',
    textAlign: 'right',
  },

  candidateMessageTime: {
    color: '#999',
  },

  chatEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },

  chatEmptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  chatEmptyText: {
    marginTop: 5,
    fontSize: 13,
    color: '#888',
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: 21,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14,
    color: '#111',
    marginRight: 8,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },
});

