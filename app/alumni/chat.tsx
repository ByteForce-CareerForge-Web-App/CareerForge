
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type ChatMessage = {
  id: string;
  personId: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
};

type BackendMessage = {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  sender_name?: string;
  sender_role?: string;
};

type BackendConversation = {
  conversation_id: number;
  created_at: string;
  updated_at: string;
  other_user_id: number;
  other_name: string;
  other_email: string;
  other_role: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  qualification?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] =
    useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * GET AUTH TOKEN
   */
  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem(
      'authToken'
    );

    return token;
  };

  /*
   * FORMAT BACKEND DATE/TIME
   */
  const formatTimestamp = (
    value: string
  ): string => {
    if (!value) {
      return '';
    }

    const date = new Date(
      value.replace(' ', 'T')
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /*
   * CONVERT BACKEND MESSAGE TO FRONTEND MESSAGE
   */
  const mapBackendMessage = (
    item: BackendMessage,
    currentUserId: number
  ): ChatMessage => {
    return {
      id: String(item.id),
      personId,
      sender:
        Number(item.sender_id) ===
        Number(currentUserId)
          ? 'me'
          : 'them',
      text: item.message,
      timestamp: formatTimestamp(
        item.created_at
      ),
    };
  };

  /*
   * GET CURRENT USER ID
   */
  const getCurrentUserId = async (): Promise<
    number | null
  > => {
    try {
      const savedUser =
        await AsyncStorage.getItem('user');

      if (!savedUser) {
        return null;
      }

      const user = JSON.parse(savedUser);

      const id = Number(user?.id);

      return Number.isFinite(id) ? id : null;
    } catch (error) {
      console.log(
        'Error getting current user:',
        error
      );

      return null;
    }
  };

  /*
   * LOAD THE CONVERSATION
   *
   * First gets all conversations and finds
   * the conversation belonging to this person.
   *
   * If no conversation exists yet, the chat
   * simply remains empty until the first message
   * is sent.
   */
  const loadChat = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      const currentUserId =
        await getCurrentUserId();

      if (!currentUserId) {
        Alert.alert(
          'Session Error',
          'Unable to identify your account. Please log in again.'
        );

        router.replace('/login');
        return;
      }

      /*
       * Load all conversations.
       */
      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawText = await response.text();

      let result: any;

      try {
        result = JSON.parse(rawText);
      } catch (parseError) {
        console.log(
          'Messages API returned invalid JSON:',
          rawText
        );

        throw new Error(
          'The messaging server returned an invalid response.'
        );
      }

      if (response.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to load conversations.'
        );
      }

      const conversations: BackendConversation[] =
        Array.isArray(
          result?.data?.conversations
        )
          ? result.data.conversations
          : [];

      /*
       * Find the conversation with this person.
       */
      const matchingConversation =
        conversations.find(
          (conversation) =>
            Number(
              conversation.other_user_id
            ) === Number(personId)
        );

      if (!matchingConversation) {
        /*
         * No conversation exists yet.
         */
        setConversationId(null);
        setMessages([]);
        return;
      }

      const currentConversationId = Number(
        matchingConversation.conversation_id
      );

      setConversationId(
        currentConversationId
      );

      /*
       * Load the actual messages.
       */
      const conversationResponse =
        await fetch(
          `${API_BASE_URL}/messages.php?conversation_id=${currentConversationId}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const conversationRawText =
        await conversationResponse.text();

      let conversationResult: any;

      try {
        conversationResult =
          JSON.parse(
            conversationRawText
          );
      } catch (parseError) {
        console.log(
          'Conversation API returned invalid JSON:',
          conversationRawText
        );

        throw new Error(
          'The conversation server returned an invalid response.'
        );
      }

      if (
        conversationResponse.status ===
        401
      ) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      if (
        !conversationResponse.ok ||
        !conversationResult.success
      ) {
        throw new Error(
          conversationResult.message ||
            'Unable to load the conversation.'
        );
      }

      const backendMessages: BackendMessage[] =
        Array.isArray(
          conversationResult?.data?.messages
        )
          ? conversationResult.data.messages
          : [];

      const mappedMessages =
        backendMessages.map(
          (item) =>
            mapBackendMessage(
              item,
              currentUserId
            )
        );

      setMessages(mappedMessages);
    } catch (error) {
      console.log(
        'Error loading chat:',
        error
      );

      Alert.alert(
        'Message Error',
        error instanceof Error
          ? error.message
          : 'Unable to load the conversation. Please try again.'
      );

      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

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

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      const currentUserId =
        await getCurrentUserId();

      if (!currentUserId) {
        Alert.alert(
          'Session Error',
          'Unable to identify your account. Please log in again.'
        );

        router.replace('/login');
        return;
      }

      /*
       * If a conversation already exists,
       * use conversation_id.
       *
       * Otherwise use recipient_id and the
       * backend will create the conversation.
       */
      const body: {
        conversation_id?: number;
        recipient_id?: number;
        message: string;
      } = {
        message: trimmed,
      };

      if (conversationId) {
        body.conversation_id =
          conversationId;
      } else {
        const numericPersonId =
          Number(personId);

        if (
          !Number.isFinite(
            numericPersonId
          ) ||
          numericPersonId <= 0
        ) {
          Alert.alert(
            'Message Error',
            'Unable to identify this connection.'
          );

          return;
        }

        body.recipient_id =
          numericPersonId;
      }

      const response = await fetch(
        `${API_BASE_URL}/messages.php`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const rawText = await response.text();

      let result: any;

      try {
        result = JSON.parse(rawText);
      } catch (parseError) {
        console.log(
          'Send message API returned invalid JSON:',
          rawText
        );

        throw new Error(
          'The messaging server returned an invalid response.'
        );
      }

      if (response.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to send the message.'
        );
      }

      /*
       * The backend returns the conversation ID
       * and the newly created message.
       */
      const returnedConversationId =
        Number(
          result?.data?.conversation_id
        );

      if (
        Number.isFinite(
          returnedConversationId
        ) &&
        returnedConversationId > 0
      ) {
        setConversationId(
          returnedConversationId
        );
      }

      const backendMessage: BackendMessage =
        result?.data?.message;

      if (backendMessage) {
        const newMessage =
          mapBackendMessage(
            backendMessage,
            currentUserId
          );

        setMessages((current) => [
          ...current,
          newMessage,
        ]);
      }

      setMessage('');

      Keyboard.dismiss();
    } catch (error) {
      console.log(
        'Error sending message:',
        error
      );

      Alert.alert(
        'Message Error',
        error instanceof Error
          ? error.message
          : 'Unable to send the message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * MARK MESSAGES AS READ
   */
  const markMessagesAsRead =
    useCallback(async () => {
      if (!conversationId) {
        return;
      }

      try {
        const token =
          await getAuthToken();

        if (!token) {
          return;
        }

        await fetch(
          `${API_BASE_URL}/messages.php`,
          {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type':
                'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              conversation_id:
                conversationId,
            }),
          }
        );
      } catch (error) {
        console.log(
          'Error marking messages as read:',
          error
        );
      }
    }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      markMessagesAsRead();
    }
  }, [
    conversationId,
    markMessagesAsRead,
  ]);

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
      router.replace(
        '/alumni/connection-profile'
      );
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
              {loading
                ? 'Loading conversation...'
                : 'Start a conversation'}
            </Text>

            {!loading && (
              <>
                <Text style={styles.emptyText}>
                  Send a message to {name} and
                  start building your professional
                  connection.
                </Text>

                <Pressable
                  style={
                    styles.viewProfileButton
                  }
                  onPress={openProfile}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color="#1769AA"
                  />

                  <Text
                    style={
                      styles.viewProfileText
                    }
                  >
                    View Profile
                  </Text>
                </Pressable>
              </>
            )}
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

