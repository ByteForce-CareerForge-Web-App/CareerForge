import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';

type ChatMessage = {
  id: string;
  conversationId: string;
  sender: 'business' | 'candidate';
  senderId: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type ApiMessage = {
  id?: string | number;
  conversation_id?: string | number;
  sender_id?: string | number;
  message?: string;
  created_at?: string;
  read_at?: string | null;
};

export default function BusinessChatScreen() {
  const params = useLocalSearchParams<{
    conversationId?: string;
    recipientId?: string;
    userId?: string;
    name?: string;
    role?: string;
    initials?: string;
    online?: string;
  }>();

  const conversationId = params.conversationId || '';

  /*
   * Connections now sends recipientId.
   *
   * userId is kept as a fallback so older navigation links
   * continue working.
   */
  const recipientUserId =
    params.recipientId || params.userId || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] =
    useState(conversationId);

  const scrollViewRef = useRef<ScrollView>(null);

  const candidateName = params.name || 'Candidate';

  const candidateRole =
    params.role || 'Professional Connection';

  const candidateInitials = useMemo(() => {
    if (params.initials) {
      return params.initials;
    }

    return candidateName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [candidateName, params.initials]);

  useEffect(() => {
    setCurrentConversationId(conversationId);
    loadChat();
  }, [conversationId, recipientUserId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: false,
      });
    }, 100);
  }, [messages.length]);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const getCurrentUserId = async (): Promise<string> => {
    try {
      const storedUser = await AsyncStorage.getItem('user');

      if (!storedUser) {
        return '';
      }

      const user = JSON.parse(storedUser);

      return String(user?.id ?? user?.user_id ?? '');
    } catch (error) {
      console.log('Error reading current user:', error);
      return '';
    }
  };

  const formatApiMessages = async (
    apiMessages: ApiMessage[],
    fallbackConversationId: string
  ): Promise<ChatMessage[]> => {
    const currentUserId = await getCurrentUserId();

    return apiMessages.map((item, index) => {
      const senderId = String(item.sender_id ?? '');

      return {
        id: String(
          item.id ?? `${fallbackConversationId}-${index}`
        ),
        conversationId: String(
          item.conversation_id ?? fallbackConversationId
        ),
        sender:
          senderId === currentUserId
            ? 'business'
            : 'candidate',
        senderId,
        message: String(item.message ?? ''),
        timestamp:
          item.created_at || new Date().toISOString(),
        read: !!item.read_at,
      };
    });
  };

  const loadConversation = async (
    targetConversationId: string,
    token: string
  ) => {
    if (!targetConversationId) {
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/messages.php?conversation_id=${encodeURIComponent(
        targetConversationId
      )}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || 'Unable to load the conversation.'
      );
    }

    const apiMessages: ApiMessage[] =
      data?.data?.messages || [];

    const formattedMessages =
      await formatApiMessages(
        apiMessages,
        targetConversationId
      );

    setMessages(formattedMessages);
    setCurrentConversationId(targetConversationId);

    await markConversationRead(targetConversationId);
  };

  const loadChat = async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication required',
          'Please log in again to access your messages.'
        );

        setMessages([]);
        return;
      }

      /*
       * Existing conversation.
       */
      if (conversationId) {
        await loadConversation(
          conversationId,
          token
        );

        return;
      }

      /*
       * New conversation.
       *
       * Connections gives us recipientId, but there is
       * no conversation yet. The conversation is created
       * when the first message is sent.
       */
      setMessages([]);
      setCurrentConversationId('');
    } catch (error) {
      console.log('Error loading chat:', error);

      Alert.alert(
        'Unable to load messages',
        error instanceof Error
          ? error.message
          : 'Something went wrong while loading the conversation.'
      );

      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markConversationRead = async (
    targetConversationId: string
  ) => {
    if (!targetConversationId) {
      return;
    }

    try {
      const token = await getAuthToken();

      if (!token) {
        return;
      }

      await fetch(`${API_BASE_URL}/messages.php`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          conversation_id: Number(
            targetConversationId
          ),
        }),
      });
    } catch (error) {
      console.log(
        'Error marking conversation as read:',
        error
      );
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) {
      return;
    }

    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication required',
          'Please log in again before sending a message.'
        );
        return;
      }

      /*
       * FIRST MESSAGE
       *
       * When Business Connections opens this screen,
       * it sends recipientId instead of conversationId.
       *
       * messages.php creates the conversation automatically.
       */
      if (!currentConversationId) {
        if (!recipientUserId) {
          Alert.alert(
            'Unable to send',
            'This conversation does not have a valid recipient.'
          );

          return;
        }

        console.log(
          'SENDING FIRST MESSAGE TO USER:',
          recipientUserId
        );

        const response = await fetch(
          `${API_BASE_URL}/messages.php`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              recipient_id: Number(recipientUserId),
              message: trimmedMessage,
            }),
          }
        );

        const data = await response.json();

        console.log(
          'SEND MESSAGE API STATUS:',
          response.status
        );

        console.log(
          'SEND MESSAGE API RESPONSE:',
          JSON.stringify(data)
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to send the message.'
          );
        }

        const returnedMessage: ApiMessage =
          data?.data?.message || {};

        /*
         * messages.php normally returns conversation_id
         * directly in data. We also support nested shapes.
         */
        const returnedConversationId = String(
          data?.data?.conversation_id ??
            data?.data?.conversation?.id ??
            returnedMessage.conversation_id ??
            ''
        );

        if (!returnedConversationId) {
          /*
           * The backend accepted the message but did not
           * return the conversation ID.
           *
           * Do not create a fake conversation ID.
           */
          setText('');

          Alert.alert(
            'Message sent',
            'Your message was sent successfully.'
          );

          return;
        }

        /*
         * We now have the real database conversation ID.
         */
        setCurrentConversationId(
          returnedConversationId
        );

        setText('');

        /*
         * Reload directly from the database.
         *
         * This makes the UI match the backend exactly and
         * ensures the conversation/messages are stored correctly.
         */
        await loadConversation(
          returnedConversationId,
          token
        );

        return;
      }

      /*
       * EXISTING CONVERSATION
       */
      console.log(
        'SENDING MESSAGE TO CONVERSATION:',
        currentConversationId
      );

      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            conversation_id: Number(
              currentConversationId
            ),
            message: trimmedMessage,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'SEND MESSAGE API STATUS:',
        response.status
      );

      console.log(
        'SEND MESSAGE API RESPONSE:',
        JSON.stringify(data)
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to send the message.'
        );
      }

      setText('');

      /*
       * Reload from backend so both participants and
       * timestamps/messages stay synchronized.
       */
      await loadConversation(
        currentConversationId,
        token
      );
    } catch (error) {
      console.log('Error sending message:', error);

      Alert.alert(
        'Message failed',
        error instanceof Error
          ? error.message
          : 'Your message could not be sent. Please try again.'
      );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    router.replace('/business/messages');
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {candidateInitials}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {candidateName}
          </Text>

          <Text style={styles.headerRole}>
            {candidateRole}
          </Text>
        </View>
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 90 : 20
        }
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({
              animated: true,
            })
          }
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                Loading conversation...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubble-outline"
                  size={30}
                  color="#1D6FEA"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Start the conversation
              </Text>

              <Text style={styles.emptyText}>
                Send a message to {candidateName}.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.dateDivider}>
                <View style={styles.dividerLine} />

                <Text style={styles.dateText}>
                  Conversation
                </Text>

                <View style={styles.dividerLine} />
              </View>

              {messages.map((item) => {
                const isBusiness =
                  item.sender === 'business';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageRow,
                      isBusiness
                        ? styles.businessRow
                        : styles.candidateRow,
                    ]}
                  >
                    {!isBusiness && (
                      <View style={styles.smallAvatar}>
                        <Text
                          style={
                            styles.smallAvatarText
                          }
                        >
                          {candidateInitials}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.messageBubble,
                        isBusiness
                          ? styles.businessBubble
                          : styles.candidateBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isBusiness
                            ? styles.businessMessageText
                            : styles.candidateMessageText,
                        ]}
                      >
                        {item.message}
                      </Text>

                      <Text
                        style={[
                          styles.messageTime,
                          isBusiness
                            ? styles.businessTime
                            : styles.candidateTime,
                        ]}
                      >
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* COMPOSER */}
        <View style={styles.composerWrapper}>
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor="#8A96A8"
              multiline
              maxLength={1000}
              style={styles.input}
              textAlignVertical="center"
              returnKeyType="default"
            />

            <Pressable
              onPress={sendMessage}
              disabled={!text.trim()}
              style={[
                styles.sendButton,
                !text.trim() &&
                  styles.sendButtonDisabled,
              ]}
            >
              <Ionicons
                name="send"
                size={19}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <Text style={styles.characterCount}>
            {text.length}/1000
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D6FEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  headerInfo: {
    flex: 1,
  },

  headerName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  headerRole: {
    color: '#C8D5E6',
    fontSize: 12,
    marginTop: 3,
  },

  keyboardContainer: {
    flex: 1,
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    padding: 18,
    paddingBottom: 20,
  },

  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE3EA',
  },

  dateText: {
    fontSize: 11,
    color: '#7A8798',
    fontWeight: '700',
    marginHorizontal: 10,
    textTransform: 'uppercase',
  },

  messageRow: {
    width: '100%',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  businessRow: {
    justifyContent: 'flex-end',
  },

  candidateRow: {
    justifyContent: 'flex-start',
  },

  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  smallAvatarText: {
    color: '#1D6FEA',
    fontSize: 10,
    fontWeight: '800',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 17,
  },

  businessBubble: {
    backgroundColor: '#1D6FEA',
    borderBottomRightRadius: 5,
  },

  candidateBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E1E6ED',
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  businessMessageText: {
    color: '#FFFFFF',
  },

  candidateMessageText: {
    color: '#182334',
  },

  messageTime: {
    fontSize: 9,
    marginTop: 5,
    textAlign: 'right',
  },

  businessTime: {
    color: '#D9E8FF',
  },

  candidateTime: {
    color: '#8792A2',
  },

  emptyState: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E7F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    color: '#172235',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#718096',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  composerWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E6ED',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F4F8',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: 48,
  },

  input: {
    flex: 1,
    color: '#172235',
    fontSize: 15,
    maxHeight: 110,
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 8,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1D6FEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  sendButtonDisabled: {
    backgroundColor: '#AFC3DE',
  },

  characterCount: {
    color: '#9AA4B2',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 3,
    marginRight: 6,
  },
});