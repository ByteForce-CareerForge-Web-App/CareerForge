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

const MESSAGES_KEY = 'careerforge_business_messages';
const CONVERSATIONS_KEY = 'careerforge_business_conversations';

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
};

export default function BusinessChatScreen() {
  const params = useLocalSearchParams<{
    conversationId?: string;
    name?: string;
    role?: string;
    initials?: string;
  }>();

  const conversationId = params.conversationId || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

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
    loadChat();
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages.length]);

  const loadChat = async () => {
    try {
      setLoading(true);

      const storedMessages = await AsyncStorage.getItem(MESSAGES_KEY);

      const allMessages: ChatMessage[] = storedMessages
        ? JSON.parse(storedMessages)
        : [];

      const conversationMessages = allMessages.filter(
        (message) => message.conversationId === conversationId
      );

      setMessages(conversationMessages);

      // Mark candidate messages as read when opening the chat
      const updatedMessages = allMessages.map((message) => {
        if (
          message.conversationId === conversationId &&
          message.sender === 'candidate'
        ) {
          return {
            ...message,
            read: true,
          };
        }

        return message;
      });

      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(updatedMessages)
      );

      await markConversationRead();
    } catch (error) {
      console.log('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationRead = async () => {
    try {
      const storedConversations =
        await AsyncStorage.getItem(CONVERSATIONS_KEY);

      if (!storedConversations) {
        return;
      }

      const allConversations: Conversation[] =
        JSON.parse(storedConversations);

      const updatedConversations = allConversations.map(
        (conversation) => {
          if (conversation.id === conversationId) {
            return {
              ...conversation,
              unread: 0,
            };
          }

          return conversation;
        }
      );

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.log('Error marking conversation as read:', error);
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!conversationId) {
      Alert.alert(
        'Unable to send',
        'This conversation does not have a valid conversation ID.'
      );
      return;
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      conversationId,
      sender: 'business',
      message: trimmedMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    try {
      const storedMessages = await AsyncStorage.getItem(MESSAGES_KEY);

      const allMessages: ChatMessage[] = storedMessages
        ? JSON.parse(storedMessages)
        : [];

      const updatedMessages = [...allMessages, newMessage];

      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(updatedMessages)
      );

      setMessages((previous) => [...previous, newMessage]);
      setText('');

      await updateConversationPreview(trimmedMessage);
    } catch (error) {
      console.log('Error sending message:', error);

      Alert.alert(
        'Message failed',
        'Your message could not be saved. Please try again.'
      );
    }
  };

  const updateConversationPreview = async (message: string) => {
    try {
      const storedConversations =
        await AsyncStorage.getItem(CONVERSATIONS_KEY);

      const allConversations: Conversation[] =
        storedConversations
          ? JSON.parse(storedConversations)
          : [];

      const updatedConversations = allConversations.map(
        (conversation) => {
          if (conversation.id === conversationId) {
            return {
              ...conversation,
              name: candidateName,
              role: candidateRole,
              initials: candidateInitials,
              lastMessage: message,
              timestamp: 'Now',
              unread: 0,
            };
          }

          return conversation;
        }
      );

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.log('Error updating conversation:', error);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
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
                const isBusiness = item.sender === 'business';

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
                        <Text style={styles.smallAvatarText}>
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
                !text.trim() && styles.sendButtonDisabled,
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