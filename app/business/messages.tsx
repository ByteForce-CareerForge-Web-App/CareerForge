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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

const MESSAGES_KEY =
  'careerforge_business_messages';

const CONVERSATIONS_KEY =
  'careerforge_business_conversations';

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'demo-sipho',
    name: 'Sipho Dlamini',
    role: 'Graduate Data Analyst',
    initials: 'SD',
    lastMessage:
      'Thank you for the opportunity.',
    timestamp: 'Today',
    unread: 1,
  },
  {
    id: 'demo-nomvula',
    name: 'Nomvula Zulu',
    role: 'Software Developer',
    initials: 'NZ',
    lastMessage:
      'I would like to discuss the position.',
    timestamp: 'Yesterday',
    unread: 1,
  },
  {
    id: 'demo-lethiwe',
    name: 'Lethiwe Khumalo',
    role: 'Data Analyst',
    initials: 'LK',
    lastMessage:
      'Thank you for getting back to me.',
    timestamp: 'Mon',
    unread: 0,
  },
];

export default function BusinessMessagesScreen() {
  const params = useLocalSearchParams();

  const selectedName =
    typeof params.name === 'string'
      ? params.name
      : '';

  const selectedRole =
    typeof params.role === 'string'
      ? params.role
      : '';

  const selectedInitials =
    typeof params.initials === 'string'
      ? params.initials
      : selectedName
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'CF';

  const selectedConversationId =
    typeof params.conversationId === 'string'
      ? params.conversationId
      : '';

  const hasSelectedPerson =
    !!selectedName;

  const [conversations, setConversations] =
    useState<Conversation[]>(
      DEMO_CONVERSATIONS
    );

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [messageText, setMessageText] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const scrollViewRef =
    useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const storedConversations =
        await AsyncStorage.getItem(
          CONVERSATIONS_KEY
        );

      const storedMessages =
        await AsyncStorage.getItem(
          MESSAGES_KEY
        );

      if (storedConversations) {
        try {
          const parsed =
            JSON.parse(storedConversations);

          setConversations(parsed);
        } catch {
          setConversations(
            DEMO_CONVERSATIONS
          );
        }
      } else {
        await AsyncStorage.setItem(
          CONVERSATIONS_KEY,
          JSON.stringify(
            DEMO_CONVERSATIONS
          )
        );

        setConversations(
          DEMO_CONVERSATIONS
        );
      }

      if (storedMessages) {
        try {
          setMessages(
            JSON.parse(storedMessages)
          );
        } catch {
          setMessages([]);
        }
      }
    } catch (error) {
      console.log(
        'Error loading messages:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const saveMessages = async (
    updatedMessages: ChatMessage[]
  ) => {
    try {
      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.log(
        'Error saving messages:',
        error
      );
    }
  };

  const saveConversations = async (
    updatedConversations: Conversation[]
  ) => {
    try {
      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(
          updatedConversations
        )
      );
    } catch (error) {
      console.log(
        'Error saving conversations:',
        error
      );
    }
  };

  useEffect(() => {
    if (!hasSelectedPerson) {
      return;
    }

    const conversationId =
      selectedConversationId ||
      `conversation-${selectedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

    const existing =
      conversations.find(
        (conversation) =>
          conversation.id ===
          conversationId
      );

    if (existing) {
      return;
    }

    const newConversation: Conversation = {
      id: conversationId,
      name: selectedName,
      role:
        selectedRole ||
        'Professional Connection',
      initials: selectedInitials,
      lastMessage:
        'Start a conversation',
      timestamp: 'Now',
      unread: 0,
    };

    const updated = [
      ...conversations,
      newConversation,
    ];

    setConversations(updated);
    saveConversations(updated);
  }, [
    hasSelectedPerson,
    selectedName,
    selectedRole,
    selectedInitials,
    selectedConversationId,
  ]);

  const currentConversationId =
    selectedConversationId ||
    (hasSelectedPerson
      ? `conversation-${selectedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`
      : '');

  const currentMessages =
    useMemo(() => {
      if (!currentConversationId) {
        return [];
      }

      return messages.filter(
        (message) =>
          message.conversationId ===
          currentConversationId
      );
    }, [
      messages,
      currentConversationId,
    ]);

  useEffect(() => {
    if (!hasSelectedPerson) {
      return;
    }

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [
    currentMessages.length,
    hasSelectedPerson,
  ]);

  const sendMessage = async () => {
    const trimmed =
      messageText.trim();

    if (!trimmed || !currentConversationId) {
      return;
    }

    Keyboard.dismiss();

    const newMessage: ChatMessage = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
      conversationId:
        currentConversationId,
      sender: 'business',
      message: trimmed,
      timestamp:
        new Date().toISOString(),
      read: true,
    };

    const updatedMessages = [
      ...messages,
      newMessage,
    ];

    setMessages(updatedMessages);
    setMessageText('');

    await saveMessages(
      updatedMessages
    );

    const updatedConversations =
      conversations.map(
        (conversation) =>
          conversation.id ===
          currentConversationId
            ? {
                ...conversation,
                lastMessage: trimmed,
                timestamp: 'Now',
                unread: 0,
              }
            : conversation
      );

    setConversations(
      updatedConversations
    );

    await saveConversations(
      updatedConversations
    );
  };

  const openConversation = (
    conversation: Conversation
  ) => {
    router.push({
      pathname: '/business/chat',
      params: {
        conversationId:
          conversation.id,
        name: conversation.name,
        role: conversation.role,
        initials: conversation.initials,
      },
    });
  };

  const openCompanyProfile = () => {
    Keyboard.dismiss();

    router.replace(
      '/business/company-profile'
    );
  };

  const goBack = () => {
    Keyboard.dismiss();

    if (hasSelectedPerson) {
      router.replace(
        '/business/messages'
      );
    } else {
      router.replace(
        '/business/dashboard'
      );
    }
  };

  const unreadTotal =
    conversations.reduce(
      (total, conversation) =>
        total + conversation.unread,
      0
    );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={goBack}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              {hasSelectedPerson
                ? 'PROFESSIONAL CHAT'
                : 'COMMUNICATION'}
            </Text>

            <Text style={styles.headerTitle}>
              {hasSelectedPerson
                ? selectedName
                : 'Messages'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {hasSelectedPerson
                ? selectedRole ||
                  'Professional Connection'
                : 'Connect and communicate with candidates'}
            </Text>
          </View>

          {hasSelectedPerson && (
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {selectedInitials}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerAccent} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 0
            : 20
        }
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >

          {/* CONNECTIONS SHORTCUT */}
          <Pressable
            style={styles.connectionsCard}
            onPress={() =>
              router.push(
                '/business/connections'
              )
            }
          >
            <View
              style={styles.connectionsIcon}
            >
              <Ionicons
                name="people-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.connectionsInfo}
            >
              <Text
                style={styles.connectionsTitle}
              >
                Connections
              </Text>

              <Text
                style={
                  styles.connectionsSubtitle
                }
              >
                Manage your professional network
              </Text>
            </View>

            <View style={styles.cardArrow}>
              <Ionicons
                name="chevron-forward"
                size={17}
                color="#64748B"
              />
            </View>
          </Pressable>

          {/* ACTIVE CHAT */}
          {hasSelectedPerson ? (
            <>
              <View
                style={styles.selectedCard}
              >
                <View
                  style={styles.selectedAvatar}
                >
                  <Text
                    style={
                      styles.selectedAvatarText
                    }
                  >
                    {selectedInitials}
                  </Text>
                </View>

                <View
                  style={styles.selectedInfo}
                >
                  <View
                    style={
                      styles.selectedNameRow
                    }
                  >
                    <Text
                      style={styles.selectedName}
                      numberOfLines={1}
                    >
                      {selectedName}
                    </Text>

                    <View
                      style={
                        styles.availableBadge
                      }
                    >
                      <View
                        style={
                          styles.onlineDot
                        }
                      />

                      <Text
                        style={
                          styles.availableText
                        }
                      >
                        Available
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.selectedRole}
                    numberOfLines={1}
                  >
                    {selectedRole ||
                      'Professional Connection'}
                  </Text>
                </View>
              </View>

              {/* CHAT */}
              <View
                style={styles.chatSection}
              >
                {currentMessages.length ===
                0 ? (
                  <View
                    style={
                      styles.emptyChat
                    }
                  >
                    <View
                      style={
                        styles.emptyChatIcon
                      }
                    >
                      <Ionicons
                        name="chatbubbles-outline"
                        size={27}
                        color="#2563EB"
                      />
                    </View>

                    <Text
                      style={
                        styles.emptyChatTitle
                      }
                    >
                      Start the conversation
                    </Text>

                    <Text
                      style={
                        styles.emptyChatText
                      }
                    >
                      Send a message to{' '}
                      {selectedName} about
                      the opportunity.
                    </Text>
                  </View>
                ) : (
                  currentMessages.map(
                    (message) => (
                      <View
                        key={message.id}
                        style={[
                          styles.messageBubbleRow,
                          message.sender ===
                            'business' &&
                            styles.businessRow,
                        ]}
                      >
                        {message.sender ===
                          'candidate' && (
                          <View
                            style={
                              styles.smallAvatar
                            }
                          >
                            <Text
                              style={
                                styles.smallAvatarText
                              }
                            >
                              {selectedInitials}
                            </Text>
                          </View>
                        )}

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
                              styles.bubbleText,
                              message.sender ===
                                'business' &&
                                styles.businessBubbleText,
                            ]}
                          >
                            {message.message}
                          </Text>

                          <View
                            style={
                              styles.bubbleFooter
                            }
                          >
                            <Text
                              style={[
                                styles.bubbleTime,
                                message.sender ===
                                  'business' &&
                                  styles.businessBubbleTime,
                              ]}
                            >
                              {formatMessageTime(
                                message.timestamp
                              )}
                            </Text>

                            {message.sender ===
                              'business' && (
                              <Ionicons
                                name="checkmark-done"
                                size={13}
                                color="#DBEAFE"
                              />
                            )}
                          </View>
                        </View>
                      </View>
                    )
                  )
                )}
              </View>
            </>
          ) : (
            <>
              {/* INBOX HEADER */}
              <View
                style={styles.inboxHeader}
              >
                <View>
                  <Text
                    style={styles.sectionTitle}
                  >
                    Conversations
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Your recent candidate messages
                  </Text>
                </View>

                <View
                  style={styles.unreadBadge}
                >
                  <Ionicons
                    name="mail-unread-outline"
                    size={14}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.unreadBadgeText
                    }
                  >
                    {unreadTotal} unread
                  </Text>
                </View>
              </View>

              {/* CONVERSATIONS */}
              {conversations.map(
                (conversation) => (
                  <Pressable
                    key={conversation.id}
                    style={[
                      styles.messageCard,
                      conversation.unread > 0 &&
                        styles.unreadMessageCard,
                    ]}
                    onPress={() =>
                      openConversation(
                        conversation
                      )
                    }
                  >
                    <View
                      style={[
                        styles.avatar,
                        conversation.unread > 0 &&
                          styles.unreadAvatar,
                      ]}
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {conversation.initials}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.messageContent
                      }
                    >
                      <View
                        style={
                          styles.messageTopRow
                        }
                      >
                        <Text
                          style={
                            styles.messageName
                          }
                          numberOfLines={1}
                        >
                          {conversation.name}
                        </Text>

                        <Text
                          style={
                            styles.messageTime
                          }
                        >
                          {
                            conversation.timestamp
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.messageRole
                        }
                        numberOfLines={1}
                      >
                        {conversation.role}
                      </Text>

                      <Text
                        style={[
                          styles.messagePreview,
                          conversation.unread >
                            0 &&
                            styles.unreadPreview,
                        ]}
                        numberOfLines={1}
                      >
                        {
                          conversation.lastMessage
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.conversationArrow
                      }
                    >
                      {conversation.unread >
                        0 && (
                        <View
                          style={
                            styles.unreadDot
                          }
                        />
                      )}

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#94A3B8"
                      />
                    </View>
                  </Pressable>
                )
              )}
            </>
          )}

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>

        {/* MESSAGE COMPOSER */}
        {hasSelectedPerson && (
          <View
            style={styles.composerContainer}
          >
            <View
              style={styles.inputContainer}
            >
              <TextInput
                value={messageText}
                onChangeText={
                  setMessageText
                }
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                style={styles.messageInput}
                multiline
                maxLength={1000}
                returnKeyType="default"
              />

              <Text
                style={styles.characterCount}
              >
                {messageText.length}/1000
              </Text>
            </View>

            <Pressable
              style={[
                styles.sendButton,
                !messageText.trim() &&
                  styles.sendButtonDisabled,
              ]}
              disabled={
                !messageText.trim()
              }
              onPress={sendMessage}
            >
              <Ionicons
                name="arrow-up"
                size={21}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>

        {/* HOME */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/dashboard'
            )
          }
        >
          <View
            style={styles.navIconContainer}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#64748B"
            />
          </View>

          <Text style={styles.navLabel}>
            Home
          </Text>
        </Pressable>

        {/* MESSAGES */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/messages'
            )
          }
        >
          <View
            style={[
              styles.navIconContainer,
              styles.navIconContainerActive,
            ]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <Text
            style={[
              styles.navLabel,
              styles.navLabelActive,
            ]}
          >
            Messages
          </Text>

          {unreadTotal > 0 && (
            <View
              style={styles.navUnreadBadge}
            >
              <Text
                style={
                  styles.navUnreadText
                }
              >
                {unreadTotal}
              </Text>
            </View>
          )}
        </Pressable>

        {/* PROFILE */}
        <Pressable
          style={styles.navItem}
          onPress={openCompanyProfile}
        >
          <View
            style={styles.navIconContainer}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color="#64748B"
            />
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatMessageTime(
  timestamp: string
) {
  try {
    const date =
      new Date(timestamp);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  flex: {
    flex: 1,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#9FB3CC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 3,
  },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#D4A72C',
  },

  headerAvatarText: {
    color: '#1E4B7A',
    fontSize: 11,
    fontWeight: '900',
  },

  headerAccent: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 14,
    marginLeft: 54,
  },

  /* CONTENT */

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 100,
  },

  /* CONNECTIONS */

  connectionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  connectionsIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  connectionsInfo: {
    flex: 1,
  },

  connectionsTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  connectionsSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SELECTED CHAT */

  selectedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5F7',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  selectedAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D5E2F2',
  },

  selectedAvatarText: {
    color: '#1E4B7A',
    fontSize: 14,
    fontWeight: '900',
  },

  selectedInfo: {
    flex: 1,
  },

  selectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedName: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },

  selectedRole: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 7,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },

  availableText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },

  /* CHAT */

  chatSection: {
    marginBottom: 10,
  },

  emptyChat: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },

  emptyChatIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyChatTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyChatText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  messageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 11,
    paddingRight: 35,
  },

  businessRow: {
    justifyContent: 'flex-end',
    paddingRight: 0,
    paddingLeft: 35,
  },

  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  smallAvatarText: {
    color: '#1E4B7A',
    fontSize: 9,
    fontWeight: '900',
  },

  messageBubble: {
    maxWidth: '78%',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  candidateBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 5,
  },

  businessBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 5,
  },

  bubbleText: {
    color: '#0F172A',
    fontSize: 13,
    lineHeight: 19,
  },

  businessBubbleText: {
    color: '#FFFFFF',
  },

  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
    gap: 3,
  },

  bubbleTime: {
    color: '#94A3B8',
    fontSize: 9,
  },

  businessBubbleTime: {
    color: '#DBEAFE',
  },

  /* INBOX */

  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  unreadBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  /* MESSAGE CARDS */

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 7,
    elevation: 1,
  },

  unreadMessageCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FBFDFF',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D5E2F2',
  },

  unreadAvatar: {
    borderColor: '#93C5FD',
    backgroundColor: '#DBEAFE',
  },

  avatarText: {
    color: '#1E4B7A',
    fontSize: 14,
    fontWeight: '900',
  },

  messageContent: {
    flex: 1,
  },

  messageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  messageName: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },

  messageTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 8,
  },

  messageRole: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  messagePreview: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  unreadPreview: {
    color: '#334155',
    fontWeight: '700',
  },

  conversationArrow: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 6,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },

  /* COMPOSER */

  composerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  inputContainer: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    paddingLeft: 13,
    paddingRight: 8,
    paddingVertical: 7,
  },

  messageInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    maxHeight: 75,
    paddingTop: 4,
    paddingBottom: 4,
  },

  characterCount: {
    color: '#94A3B8',
    fontSize: 8,
    textAlign: 'right',
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },

  bottomSpace: {
    height: 20,
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingBottom: 4,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    position: 'relative',
  },

  navIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainerActive: {
    backgroundColor: '#EFF6FF',
  },

  navLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },

  navUnreadBadge: {
    position: 'absolute',
    top: 3,
    right: 30,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4A72C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  navUnreadText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});