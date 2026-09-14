import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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

      const personMessages = allMessages
        .filter(
          (item) => item.personId === personId
        )
        .sort(
          (a, b) =>
            Number(a.id) - Number(b.id)
        );

      setMessages(personMessages);
    } catch (error) {
      console.log(
        'Error loading chat:',
        error
      );

      setMessages([]);
    }
  }, [personId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  /*
   * SAVE A MESSAGE
   */
  const saveMessage = async (
    newMessage: ChatMessage
  ) => {
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
  };

  /*
   * UPDATE THE CONVERSATION PREVIEW
   */
  const updateConversationPreview = async (
    lastMessage: string,
    timestamp: string,
    unread: number
  ) => {
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
      lastMessage,
      timestamp,
      unread,
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
  };

  /*
   * SEND MESSAGE
   */
  const sendMessage = async () => {
    const trimmed = message.trim();

    if (!trimmed || sending) {
      return;
    }

    try {
      setSending(true);

      const timestamp =
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        personId,
        sender: 'me',
        text: trimmed,
        timestamp,
      };

      await saveMessage(newMessage);

      setMessages((current) => [
        ...current,
        newMessage,
      ]);

      setMessage('');

      Keyboard.dismiss();

      await updateConversationPreview(
        trimmed,
        timestamp,
        0
      );

      /*
       * FRONTEND DEMO REPLY
       *
       * This gives the chat a real two-way
       * messaging experience while the backend
       * messaging system is being connected.
       *
       * It does NOT change your backend.
       */
      setTimeout(async () => {
        try {
          const replyTimestamp =
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

          const reply: ChatMessage = {
            id: `${Date.now() + 1}`,
            personId,
            sender: 'them',
            text:
              'Thanks for your message! I’ll get back to you shortly.',
            timestamp: replyTimestamp,
          };

          await saveMessage(reply);

          setMessages((current) => [
            ...current,
            reply,
          ]);

          await updateConversationPreview(
            reply.text,
            reply.timestamp,
            0
          );
        } catch (error) {
          console.log(
            'Error saving reply:',
            error
          );
        }
      }, 1200);
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

  /*
   * OPEN CONNECTION PROFILE
   */
  const openProfile = () => {
    Keyboard.dismiss();

    router.push({
      pathname:
        '/alumni/connection-profile',
      params: {
        personId,
        initials,
        name,
        role,
        company,

        /*
         * This tells the profile screen
         * where the user came from.
         */
        returnTo: 'chat',
      },
    });
  };

  /*
   * BACK TO CONNECTIONS / PREVIOUS SCREEN
   */
  const handleBack = () => {
    Keyboard.dismiss();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/alumni/connection-profile');
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: ChatMessage;
  }) => {
    const isMine =
      item.sender === 'me';

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
            <Text
              style={styles.smallAvatarText}
            >
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
        {/* BACK */}
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        {/* PROFILE AVATAR */}
        <Pressable
          style={styles.avatar}
          onPress={openProfile}
        >
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </Pressable>

        {/* NAME + ROLE */}
        <Pressable
          style={styles.headerInfo}
          onPress={openProfile}
        >
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
        </Pressable>

        {/* PROFILE */}
        <Pressable
          style={styles.profileButton}
          onPress={openProfile}
        >
          <Ionicons
            name="person-circle-outline"
            size={27}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* CHAT SUBHEADER */}
      <View style={styles.chatInfoBar}>
        <Ionicons
          name="lock-closed-outline"
          size={13}
          color="#1769AA"
        />

        <Text style={styles.chatInfoText}>
          Your professional conversation
        </Text>
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
            <Pressable
              style={styles.emptyAvatar}
              onPress={openProfile}
            >
              <Text
                style={styles.emptyAvatarText}
              >
                {initials}
              </Text>
            </Pressable>

            <Text style={styles.emptyTitle}>
              Start a conversation
            </Text>

            <Text style={styles.emptyText}>
              Send a message to {name} and
              start building your professional
              connection.
            </Text>

            <Pressable
              style={styles.viewProfileButton}
              onPress={openProfile}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color="#1769AA"
              />

              <Text
                style={styles.viewProfileText}
              >
                View Profile
              </Text>
            </Pressable>
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
            returnKeyType="default"
          />
        </View>

        <Pressable
          style={[
            styles.sendButton,
            !message.trim() &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={
            !message.trim() || sending
          }
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  /* HEADER */

  header: {
    backgroundColor: '#102A72',
    paddingTop:
      Platform.OS === 'ios' ? 50 : 38,
    paddingBottom: 15,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6B8FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#173FBD',
    fontSize: 13,
    fontWeight: '900',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 5,
    justifyContent: 'center',
  },

  headerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  headerRole: {
    color: '#C7D7FF',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* CHAT INFO */

  chatInfoBar: {
    height: 34,
    backgroundColor: '#E8F0FF',
    borderBottomWidth: 1,
    borderBottomColor: '#D5E1FA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  chatInfoText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 5,
  },

  /* CHAT */

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
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  smallAvatarText: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
  },

  messageBubble: {
    maxWidth: '78%',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  myBubble: {
    backgroundColor: '#2457E6',
    borderBottomRightRadius: 5,
  },

  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#DCE6FF',
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
    color: '#DCE7FF',
  },

  theirMessageTime: {
    color: '#98A2B3',
  },

  /* EMPTY STATE */

  emptyState: {
    alignItems: 'center',
  },

  emptyAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#6B8FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyAvatarText: {
    color: '#2457E6',
    fontSize: 24,
    fontWeight: '900',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 8,
  },

  emptyText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 310,
    marginBottom: 18,
  },

  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 11,
  },

  viewProfileText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },

  /* COMPOSER */

  composerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DCE6FF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 25 : 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  inputContainer: {
    flex: 1,
    minHeight: 47,
    maxHeight: 120,
    backgroundColor: '#F5F7FC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginRight: 9,
  },

  input: {
    fontSize: 14,
    color: '#172A55',
    minHeight: 44,
    maxHeight: 110,
    paddingTop: 10,
    paddingBottom: 10,
  },

  sendButton: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#173FBD',
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },
});
