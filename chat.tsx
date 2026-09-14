import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

type ChatStore = Record<string, Message[]>;

const CHAT_STORAGE_KEY = 'careerforge_chat_messages_v2';

const COLORS = {
  primary: '#2457E6',
  primaryDark: '#173FBD',
  deepBlue: '#102A72',
  navy: '#172A55',
  lightBlue: '#E8F0FF',
  paleBlue: '#F3F6FF',
  background: '#F5F7FC',
  white: '#FFFFFF',
  text: '#27313F',
  secondaryText: '#667085',
  muted: '#98A2B3',
  border: '#E1E7F0',
};

const defaultMessages: Message[] = [
  {
    id: '1',
    text: 'Hi! I would be happy to help with your career journey.',
    sender: 'them',
    time: '10:28 AM',
  },
  {
    id: '2',
    text: 'Thank you! I would like some advice about finding internships.',
    sender: 'me',
    time: '10:30 AM',
  },
  {
    id: '3',
    text: 'Of course! I recommend focusing on opportunities that match your skills and career goals.',
    sender: 'them',
    time: '10:32 AM',
  },
];

const getInitialMessages = (
  conversationId: string
): Message[] => {
  if (conversationId === '1') {
    return defaultMessages;
  }

  return [];
};

export default function ChatScreen() {
  const {
    conversationId,
    name,
    role,
    initials,
    online,
  } = useLocalSearchParams<{
    conversationId?: string;
    name?: string;
    role?: string;
    initials?: string;
    online?: string;
  }>();

  const contactName = name || 'Sarah Williams';

  const contactRole =
    role || 'Alumni • Data Analyst';

  const contactInitials =
    initials || 'SW';

  const isOnline =
    online !== 'false';

  const chatId =
    conversationId ||
    contactName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [newMessage, setNewMessage] =
    useState('');

  useEffect(() => {
    loadChat();
  }, [chatId]);

  const loadChat = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          CHAT_STORAGE_KEY
        );

      let chatStore: ChatStore = {};

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (
            parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed)
          ) {
            chatStore = parsed;
          }
        } catch {
          chatStore = {};
        }
      }

      if (
        Object.prototype.hasOwnProperty.call(
          chatStore,
          chatId
        )
      ) {
        setMessages(
          chatStore[chatId] || []
        );
        return;
      }

      const initialMessages =
        getInitialMessages(chatId);

      chatStore[chatId] =
        initialMessages;

      await AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chatStore)
      );

      setMessages(initialMessages);
    } catch (error) {
      console.log(
        'Error loading chat:',
        error
      );

      setMessages(
        getInitialMessages(chatId)
      );
    }
  };

  const sendMessage = async () => {
    const trimmedMessage =
      newMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    const now = new Date();

    const time =
      now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });

    const message: Message = {
      id:
        `${chatId}-${Date.now()}`,
      text: trimmedMessage,
      sender: 'me',
      time,
    };

    const updatedMessages = [
      ...messages,
      message,
    ];

    setMessages(updatedMessages);
    setNewMessage('');

    try {
      const stored =
        await AsyncStorage.getItem(
          CHAT_STORAGE_KEY
        );

      let chatStore: ChatStore = {};

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (
            parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed)
          ) {
            chatStore = parsed;
          }
        } catch {
          chatStore = {};
        }
      }

      chatStore[chatId] =
        updatedMessages;

      await AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chatStore)
      );

      const verify =
        await AsyncStorage.getItem(
          CHAT_STORAGE_KEY
        );

      console.log(
        'Chat saved:',
        chatId,
        verify
      );
    } catch (error) {
      console.log(
        'Error saving message:',
        error
      );
    }
  };

  /*
   * Open this person's profile.
   *
   * The profile itself lives inside
   * student/connections.tsx, so we pass
   * the person's information to that screen.
   */
  const openProfile = () => {
    router.push({
      pathname: '/student/connections',
      params: {
        openProfile: 'true',
        returnTo: 'chat',
        conversationId: chatId,
        personId: conversationId || chatId,
        name: contactName,
        role: contactRole.split(' • ')[0] || 'Student',
        programme:
          contactRole.split(' • ')[1] || contactRole,
        initials: contactInitials,
        online: isOnline ? 'true' : 'false',
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/connections');
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    const isMine =
      item.sender === 'me';

    return (
      <View
        style={[
          styles.messageRow,
          isMine &&
            styles.myMessageRow,
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
              isMine &&
                styles.myMessageText,
            ]}
          >
            {item.text}
          </Text>

          <Text
            style={[
              styles.messageTime,
              isMine &&
                styles.myMessageTime,
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios'
          ? 10
          : 0
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.primary}
          />
        </Pressable>

        {/* Entire contact header opens profile */}
        <Pressable
          style={styles.contactHeader}
          onPress={openProfile}
        >
          <View
            style={styles.avatarContainer}
          >
            <Text
              style={styles.avatarText}
            >
              {contactInitials}
            </Text>

            {isOnline && (
              <View
                style={styles.onlineDot}
              />
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={styles.headerName}
              numberOfLines={1}
            >
              {contactName}
            </Text>

            <View
              style={styles.statusRow}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isOnline
                        ? '#258A50'
                        : COLORS.muted,
                  },
                ]}
              />

              <Text
                style={styles.headerRole}
                numberOfLines={1}
              >
                {isOnline
                  ? 'Online'
                  : contactRole}
              </Text>
            </View>
          </View>

          <View style={styles.profileArrow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderMessage}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.messagesList
        }
        ListEmptyComponent={
          <View
            style={styles.emptyChat}
          >
            <View
              style={
                styles.emptyChatIconContainer
              }
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={30}
                color={COLORS.primary}
              />
            </View>

            <Text
              style={styles.emptyChatTitle}
            >
              Start a conversation
            </Text>

            <Text
              style={styles.emptyChatText}
            >
              Send a message to{' '}
              {contactName} to start
              chatting.
            </Text>
          </View>
        }
      />

      {/* Message Input */}
      <View
        style={styles.inputContainer}
      >
        <View
          style={styles.inputWrapper}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.muted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
        </View>

        <Pressable
          style={[
            styles.sendButton,
            !newMessage.trim() &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={19}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 96,
    paddingTop: 38,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  contactHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 3,
  },

  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  avatarText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },

  onlineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#258A50',
    right: -1,
    bottom: 1,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  headerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  headerRole: {
    color: COLORS.secondaryText,
    fontSize: 12,
    fontWeight: '500',
  },

  profileArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
    flexGrow: 1,
  },

  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },

  myMessageRow: {
    justifyContent: 'flex-end',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1,
  },

  theirMessageBubble: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 5,
  },

  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 5,
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  messageText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: COLORS.white,
  },

  messageTime: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  myMessageTime: {
    color: '#DCE6FF',
    textAlign: 'right',
  },

  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 45,
  },

  emptyChatIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyChatTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },

  emptyChatText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  inputWrapper: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    backgroundColor: '#F4F7FC',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#DCE3EF',
    justifyContent: 'center',
    marginRight: 8,
  },

  input: {
    minHeight: 44,
    maxHeight: 98,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: COLORS.text,
    fontSize: 15,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  sendButtonDisabled: {
    backgroundColor: '#D9DEE5',
    shadowOpacity: 0,
    elevation: 0,
  },
});
