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
      scrollViewRef.current?.scrollToEnd({
        animated: false,
      });
    }, 100);
  }, [messages.length]);

  const loadChat = async () => {
    try {
      setLoading(true);

      const storedMessages =
        await AsyncStorage.getItem(MESSAGES_KEY);

      const allMessages: ChatMessage[] = storedMessages
        ? JSON.parse(storedMessages)
        : [];

      const conversationMessages = allMessages.filter(
        (message) =>
          message.conversationId === conversationId
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

      const updatedConversations =
        allConversations.map((conversation) => {
          if (conversation.id === conversationId) {
            return {
              ...conversation,
              unread: 0,
            };
          }

          return conversation;
        });

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );
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
      const storedMessages =
        await AsyncStorage.getItem(MESSAGES_KEY);

      const allMessages: ChatMessage[] = storedMessages
        ? JSON.parse(storedMessages)
        : [];

      const updatedMessages = [
        ...allMessages,
        newMessage,
      ];

      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(updatedMessages)
      );

      setMessages((previous) => [
        ...previous,
        newMessage,
      ]);

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

  const updateConversationPreview = async (
    message: string
  ) => {
    try {
      const storedConversations =
        await AsyncStorage.getItem(CONVERSATIONS_KEY);

      const allConversations: Conversation[] =
        storedConversations
          ? JSON.parse(storedConversations)
          : [];

      const updatedConversations =
        allConversations.map((conversation) => {
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
        });

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.log(
        'Error updating conversation:',
        error
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

  const openCandidateProfile = () => {
    router.push({
      pathname: '/business/candidate-profile',
      params: {
        name: candidateName,
        fromChat: 'true',
        conversationId: conversationId,
        role: candidateRole,
        initials: candidateInitials,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerLabelWrapper}>
            <Text style={styles.headerLabel}>
              MESSAGES
            </Text>
          </View>
        </View>

        {/* TAP THIS AREA TO OPEN CANDIDATE PROFILE */}
        <Pressable
          style={styles.headerProfileRow}
          onPress={openCandidateProfile}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {candidateInitials}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {candidateName}
            </Text>

            <View style={styles.roleRow}>
              <View style={styles.onlineDot} />

              <Text style={styles.headerRole}>
                {candidateRole}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#9FB3CC"
          />
        </Pressable>

        <View style={styles.goldAccent} />
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
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
              <View style={styles.loadingIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={28}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Loading conversation
              </Text>

              <Text style={styles.emptyText}>
                Please wait while your messages are loaded.
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="chatbubble-outline"
                  size={29}
                  color="#2563EB"
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

                <View style={styles.conversationPill}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={11}
                    color="#7A8798"
                  />

                  <Text style={styles.dateText}>
                    Conversation
                  </Text>
                </View>

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

                      <View
                        style={[
                          styles.messageMeta,
                          isBusiness
                            ? styles.businessMeta
                            : styles.candidateMeta,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageTime,
                            isBusiness
                              ? styles.businessTime
                              : styles.candidateTime,
                          ]}
                        >
                          {formatTime(
                            item.timestamp
                          )}
                        </Text>

                        {isBusiness && (
                          <Ionicons
                            name={
                              item.read
                                ? 'checkmark-done'
                                : 'checkmark'
                            }
                            size={13}
                            color="#D9E8FF"
                          />
                        )}
                      </View>
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
            <View style={styles.inputIcon}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#7C8BA1"
              />
            </View>

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
                name="arrow-up"
                size={20}
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
    backgroundColor: '#F5F8FC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop:
      Platform.OS === 'ios' ? 54 : 38,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerLabelWrapper: {
    flex: 1,
  },

  headerLabel: {
    color: '#9FB3CC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
    borderWidth: 2,
    borderColor:
      'rgba(255,255,255,0.18)',
  },

  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  headerInfo: {
    flex: 1,
  },

  headerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    marginRight: 7,
  },

  headerRole: {
    color: '#C8D5E6',
    fontSize: 12,
    flexShrink: 1,
  },

  goldAccent: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 17,
  },

  keyboardContainer: {
    flex: 1,
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },

  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCE4EE',
  },

  conversationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 9,
  },

  dateText: {
    fontSize: 10,
    color: '#7A8798',
    fontWeight: '800',
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  messageRow: {
    width: '100%',
    marginBottom: 15,
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
    backgroundColor: '#E4EEFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 1,
  },

  smallAvatarText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 9,
    borderRadius: 18,
  },

  businessBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 5,
  },

  candidateBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    shadowColor: '#172033',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
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

  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },

  businessMeta: {
    alignSelf: 'flex-end',
  },

  candidateMeta: {
    alignSelf: 'flex-end',
  },

  messageTime: {
    fontSize: 9,
  },

  businessTime: {
    color: '#D9E8FF',
    marginRight: 3,
  },

  candidateTime: {
    color: '#8792A2',
  },

  emptyState: {
    flex: 1,
    minHeight: 430,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 42,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F0FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F0FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#D6E4F8',
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
    borderTopColor: '#E3E8EF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 18 : 10,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F4F8',
    borderRadius: 25,
    paddingLeft: 13,
    paddingRight: 6,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  inputIcon: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 1,
  },

  input: {
    flex: 1,
    color: '#172235',
    fontSize: 15,
    maxHeight: 110,
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 8,
    paddingLeft: 3,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  sendButtonDisabled: {
    backgroundColor: '#B8C7DB',
    shadowOpacity: 0,
    elevation: 0,
  },

  characterCount: {
    color: '#9AA4B2',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 3,
    marginRight: 6,
  },
});
