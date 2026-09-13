import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGES_KEY = 'careerforge_alumni_messages';
const CHAT_MESSAGES_KEY =
  'careerforge_alumni_chat_messages';

type ChatMessage = {
  id: string;
  personId: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    personId?: string;
    initials?: string;
    name?: string;
    role?: string;
    company?: string;
  }>();

  const personId = params.personId || 'unknown';
  const initials = params.initials || 'CF';
  const name = params.name || 'Connection';
  const role = params.role || 'Professional';
  const company = params.company || '';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);
  const [sending, setSending] = useState(false);

  const loadChat = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(
        CHAT_MESSAGES_KEY
      );

      if (!saved) {
        setMessages([]);
        return;
      }

      const allMessages: ChatMessage[] =
        JSON.parse(saved);

      const personMessages = allMessages.filter(
        (item) => item.personId === personId
      );

      setMessages(personMessages);
    } catch (error) {
      console.log('Error loading chat:', error);
      setMessages([]);
    }
  }, [personId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const sendMessage = async () => {
    const trimmed = message.trim();

    if (!trimmed || sending) {
      return;
    }

    try {
      setSending(true);

      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        personId,
        sender: 'me',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const savedChat =
        await AsyncStorage.getItem(
          CHAT_MESSAGES_KEY
        );

      const allMessages: ChatMessage[] =
        savedChat
          ? JSON.parse(savedChat)
          : [];

      allMessages.push(newMessage);

      await AsyncStorage.setItem(
        CHAT_MESSAGES_KEY,
        JSON.stringify(allMessages)
      );

      setMessages((current) => [
        ...current,
        newMessage,
      ]);

      setMessage('');

      Keyboard.dismiss();

      // Update Messages conversation preview
      const savedConversations =
        await AsyncStorage.getItem(
          MESSAGES_KEY
        );

      let conversations: any[] =
        savedConversations
          ? JSON.parse(savedConversations)
          : [];

      const conversation = {
        personId,
        lastMessage: trimmed,
        timestamp: newMessage.timestamp,
        unread: 0,
      };

      const existingIndex =
        conversations.findIndex(
          (item) =>
            item.personId === personId
        );

      if (existingIndex >= 0) {
        conversations[existingIndex] =
          conversation;
      } else {
        conversations.push(conversation);
      }

      await AsyncStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.log(
        'Error sending message:',
        error
      );

      Alert.alert(
        'Message Error',
        'Unable to send the message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: ChatMessage;
  }) => {
    const isMine = item.sender === 'me';

    return (
      <View
        style={[
          styles.messageRow,
          isMine
            ? styles.myMessageRow
            : styles.theirMessageRow,
        ]}
      >
        {!isMine && (
          <View style={styles.smallAvatar}>
            <Text style={styles.smallAvatarText}>
              {initials}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myBubble
              : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine
                ? styles.myMessageText
                : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>

          <Text
            style={[
              styles.messageTime,
              isMine
                ? styles.myMessageTime
                : styles.theirMessageTime,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 0 : 20
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text
            style={styles.headerName}
            numberOfLines={1}
          >
            {name}
          </Text>

          <Text
            style={styles.headerRole}
            numberOfLines={1}
          >
            {role}
            {company
              ? ` • ${company}`
              : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            router.push({
              pathname:
                '/alumni/connection-profile',
              params: {
                personId,
                initials,
                name,
                role,
                company,
              },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.profileIcon}>
            •••
          </Text>
        </TouchableOpacity>
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.chatList}
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyChatContent
            : styles.chatContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyAvatar}>
              <Text
                style={styles.emptyAvatarText}
              >
                {initials}
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Start a conversation
            </Text>

            <Text style={styles.emptyText}>
              Send a message to {name} and
              start building your professional
              connection.
            </Text>
          </View>
        }
      />

      {/* MESSAGE INPUT */}
      <View style={styles.composerContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Write a message..."
            placeholderTextColor="#98A2B3"
            multiline
            maxLength={1000}
            textAlignVertical="center"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={
            !message.trim() || sending
          }
          activeOpacity={0.8}
        >
          <Text style={styles.sendText}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop:
      Platform.OS === 'ios' ? 50 : 38,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '300',
    lineHeight: 35,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  headerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  headerRole: {
    color: '#C8D5E5',
    fontSize: 11,
    marginTop: 3,
  },

  profileButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  chatList: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },

  emptyChatContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },

  myMessageRow: {
    justifyContent: 'flex-end',
  },

  theirMessageRow: {
    justifyContent: 'flex-start',
  },

  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  smallAvatarText: {
    color: '#1769AA',
    fontSize: 9,
    fontWeight: '800',
  },

  messageBubble: {
    maxWidth: '78%',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  myBubble: {
    backgroundColor: '#1769AA',
    borderBottomRightRadius: 5,
  },

  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  theirMessageText: {
    color: '#344054',
  },

  messageTime: {
    fontSize: 9,
    marginTop: 5,
    alignSelf: 'flex-end',
  },

  myMessageTime: {
    color: '#D7E8F7',
  },

  theirMessageTime: {
    color: '#98A2B3',
  },

  emptyState: {
    alignItems: 'center',
  },

  emptyAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyAvatarText: {
    color: '#1769AA',
    fontSize: 22,
    fontWeight: '800',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 8,
  },

  emptyText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 310,
  },

  composerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 25 : 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  inputContainer: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: '#F5F7FA',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginRight: 9,
  },

  input: {
    fontSize: 14,
    color: '#344054',
    minHeight: 44,
    maxHeight: 110,
    paddingTop: 10,
    paddingBottom: 10,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.45,
  },

  sendText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -3,
  },
});