import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
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

const CHAT_STORAGE_KEY = 'careerforge_chat_messages';

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

export default function ChatScreen() {
  const { name, role, initials, online } = useLocalSearchParams<{
    name?: string;
    role?: string;
    initials?: string;
    online?: string;
  }>();

  const contactName = name || 'Sarah Williams';
  const contactRole = role || 'Alumni • Data Analyst';
  const contactInitials = initials || 'SW';
  const isOnline = online !== 'false';

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);

      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          CHAT_STORAGE_KEY,
          JSON.stringify(defaultMessages)
        );
      }
    } catch (error) {
      console.log('Error loading chat:', error);
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    const message: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'me',
      time,
    };

    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setNewMessage('');

    try {
      await AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.log('Error saving message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
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

          {isOnline && <View style={styles.onlineDot} />}
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
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />

        <Pressable
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
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

  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
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