import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  qualification: string;
  industry: string;
};

type Conversation = {
  conversationId: number;
  personId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
};

type BackendConversation = {
  conversation_id: number;
  created_at?: string;
  updated_at?: string;
  other_user_id: number;
  other_name: string;
  other_email?: string;
  other_role: string;
  last_message?: string | null;
  last_message_time?: string | null;
  unread_count?: number;
  qualification?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
};

type BackendConnection = {
  connection_id?: number;
  user_id: number;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  initials?: string;
  qualification?: string | null;
  graduation_year?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
};

type ConnectionsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    incoming_requests?: BackendConnection[];
    sent_requests?: BackendConnection[];
    connections?: BackendConnection[];
    people?: BackendConnection[];
  } | null;
};

type MessagesResponse = {
  success?: boolean;
  message?: string;
  data?: {
    conversations?: BackendConversation[];
  } | null;
};

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'CF';
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
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
    day: 'numeric',
    month: 'short',
  });
}

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  /*
   * These are the actual accepted connections from
   * connections.php.
   */
  const [connections, setConnections] = useState<Person[]>([]);

  /*
   * Keep the real database connection count separate
   * from the people displayed on the screen.
   */
  const [connectionCount, setConnectionCount] =
    useState(0);

  /*
   * These are the actual conversations returned by
   * messages.php.
   */
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  /*
   * Keep the backend conversation people separately so
   * existing chats can always be displayed.
   */
  const [conversationPeople, setConversationPeople] =
    useState<Person[]>([]);

  const [loading, setLoading] = useState(true);

  const getAuthToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem('authToken');
  };

  const handleUnauthorized = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');

    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  /*
   * ---------------------------------------------------------
   * LOAD ACCEPTED CONNECTIONS
   * ---------------------------------------------------------
   *
   * connections.php returns:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: {
   *     incoming_requests: [],
   *     sent_requests: [],
   *     connections: [],
   *     people: []
   *   }
   * }
   *
   * Therefore the accepted connections are:
   *
   * response.data.connections
   */
  const loadConnections = async (
    token: string
  ): Promise<Person[]> => {
    const response = await fetch(
      `${API_BASE_URL}/connections.php`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const rawResponse = await response.text();

    let data: ConnectionsResponse;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      console.log(
        'Connections backend returned non-JSON:',
        rawResponse
      );

      throw new Error(
        'The connections server returned an invalid response.'
      );
    }

    if (response.status === 401) {
      await handleUnauthorized();
      throw new Error('SESSION_EXPIRED');
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message ||
          'Unable to load your professional connections.'
      );
    }

    /*
     * IMPORTANT:
     * The real accepted connections are inside:
     *
     * data.data.connections
     */
    const backendConnections =
      Array.isArray(data.data?.connections)
        ? data.data.connections
        : [];

    /*
     * This is the real number of accepted connections.
     *
     * Do NOT calculate this later from a merged array.
     */
    setConnectionCount(
      backendConnections.length
    );

    return backendConnections
      .filter(
        (connection) =>
          connection.user_id !== undefined &&
          connection.user_id !== null &&
          Number(connection.user_id) > 0
      )
      .map((connection) => {
        const role =
          connection.position ||
          connection.role ||
          'Professional';

        const company =
          connection.company ||
          connection.industry ||
          'CareerForge Network';

        return {
          id: String(connection.user_id),

          initials:
            connection.initials ||
            getInitials(
              connection.name || 'CareerForge'
            ),

          name:
            connection.name ||
            'CareerForge Connection',

          role,

          company,

          qualification:
            connection.qualification || '',

          industry:
            connection.industry || '',
        };
      });
  };

  /*
   * ---------------------------------------------------------
   * LOAD REAL CONVERSATIONS
   * ---------------------------------------------------------
   *
   * messages.php returns:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: {
   *     conversations: [...]
   *   }
   * }
   *
   * Therefore conversations are:
   *
   * response.data.conversations
   */
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        setLoading(false);

        Alert.alert(
          'Session Expired',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      /*
       * -------------------------------------------------------
       * LOAD ACCEPTED CONNECTIONS
       * -------------------------------------------------------
       */
      try {
        const backendConnections =
          await loadConnections(token);

        setConnections(backendConnections);
      } catch (connectionError) {
        if (
          connectionError instanceof Error &&
          connectionError.message ===
            'SESSION_EXPIRED'
        ) {
          return;
        }

        console.log(
          'Error loading connections:',
          connectionError
        );

        setConnections([]);
        setConnectionCount(0);
      }

      /*
       * -------------------------------------------------------
       * LOAD ACTUAL CONVERSATIONS
       * -------------------------------------------------------
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

      const rawResponse = await response.text();

      let data: MessagesResponse;

      try {
        data = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Messages backend returned non-JSON:',
          rawResponse
        );

        throw new Error(
          'The messages server returned an invalid response.'
        );
      }

      if (response.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            'Unable to load your conversations.'
        );
      }

      /*
       * IMPORTANT:
       *
       * messages.php returns conversations inside:
       *
       * data.data.conversations
       */
      const backendConversations =
        Array.isArray(data.data?.conversations)
          ? data.data.conversations
          : [];

      /*
       * -------------------------------------------------------
       * MAP CONVERSATIONS
       * -------------------------------------------------------
       */
      const mappedConversations: Conversation[] =
        backendConversations
          .filter(
            (conversation) =>
              conversation.other_user_id !==
                undefined &&
              conversation.other_user_id !== null &&
              Number(conversation.other_user_id) > 0 &&
              conversation.conversation_id !==
                undefined &&
              conversation.conversation_id !== null
          )
          .map((conversation) => ({
            conversationId: Number(
              conversation.conversation_id
            ),

            personId: String(
              conversation.other_user_id
            ),

            lastMessage:
              conversation.last_message ||
              'No messages yet',

            timestamp: formatTimestamp(
              conversation.last_message_time ||
                conversation.updated_at ||
                conversation.created_at
            ),

            unread: Number(
              conversation.unread_count || 0
            ),
          }));

      setConversations(mappedConversations);

      /*
       * -------------------------------------------------------
       * MAP PEOPLE FROM ACTUAL CONVERSATIONS
       * -------------------------------------------------------
       *
       * This means chats returned by messages.php are
       * guaranteed to appear, even if something about the
       * connection response is temporarily unavailable.
       */
      const mappedConversationPeople: Person[] =
        backendConversations
          .filter(
            (conversation) =>
              conversation.other_user_id !==
                undefined &&
              conversation.other_user_id !== null &&
              Number(conversation.other_user_id) > 0
          )
          .map((conversation) => {
            const role =
              conversation.position ||
              conversation.other_role ||
              'Professional';

            const company =
              conversation.company ||
              conversation.industry ||
              'CareerForge Network';

            return {
              id: String(
                conversation.other_user_id
              ),

              initials: getInitials(
                conversation.other_name ||
                  'CareerForge'
              ),

              name:
                conversation.other_name ||
                'CareerForge Connection',

              role,

              company,

              qualification:
                conversation.qualification || '',

              industry:
                conversation.industry || '',
            };
          });

      setConversationPeople(
        mappedConversationPeople
      );
    } catch (error) {
      console.log(
        'Error loading messages:',
        error
      );

      if (
        error instanceof Error &&
        error.message === 'SESSION_EXPIRED'
      ) {
        return;
      }

      setConversations([]);
      setConversationPeople([]);

      Alert.alert(
        'Messages Error',
        error instanceof Error
          ? error.message
          : 'Unable to load your conversations.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  /*
   * ---------------------------------------------------------
   * FIND CONVERSATION FOR A PERSON
   * ---------------------------------------------------------
   */
  const getConversation = (
    personId: string
  ): Conversation | undefined => {
    return conversations.find(
      (conversation) =>
        String(conversation.personId) ===
        String(personId)
    );
  };

  /*
   * ---------------------------------------------------------
   * OPEN CHAT
   * ---------------------------------------------------------
   */
  const openChat = (person: Person) => {
    if (!person.id || !/^\d+$/.test(person.id)) {
      Alert.alert(
        'Message Error',
        'Unable to identify this connection.'
      );

      return;
    }

    const conversation =
      getConversation(person.id);

    router.push({
      pathname: '/alumni/chat',
      params: {
        personId: person.id,

        initials: person.initials,

        name: person.name,

        role: person.role,

        company: person.company,

        ...(person.qualification
          ? {
              qualification:
                person.qualification,
            }
          : {}),

        ...(person.industry
          ? {
              industry: person.industry,
            }
          : {}),

        /*
         * Existing conversation gets its real ID.
         *
         * If there is no conversation yet, chat.tsx can
         * create one when the first message is sent.
         */
        ...(conversation
          ? {
              conversationId: String(
                conversation.conversationId
              ),
            }
          : {}),
      },
    });
  };

  /*
   * ---------------------------------------------------------
   * MERGE PEOPLE FOR DISPLAY
   * ---------------------------------------------------------
   *
   * Accepted connections come first.
   *
   * Existing conversation participants are then added if
   * they are not already in the connection list.
   *
   * IMPORTANT:
   * This merged list is ONLY for display.
   *
   * The Connections statistic still uses connectionCount,
   * which comes directly from connections.php.
   */
  const allPeople = (() => {
    const merged = new Map<string, Person>();

    connections.forEach((person) => {
      merged.set(person.id, person);
    });

    conversationPeople.forEach((person) => {
      if (!merged.has(person.id)) {
        merged.set(person.id, person);
      }
    });

    return Array.from(merged.values());
  })();

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */
  const filteredPeople =
    allPeople.filter((person) => {
      const query = searchQuery
        .toLowerCase()
        .trim();

      if (!query) {
        return true;
      }

      return (
        person.name
          .toLowerCase()
          .includes(query) ||
        person.role
          .toLowerCase()
          .includes(query) ||
        person.company
          .toLowerCase()
          .includes(query) ||
        person.qualification
          .toLowerCase()
          .includes(query) ||
        person.industry
          .toLowerCase()
          .includes(query)
      );
    });

  /*
   * ---------------------------------------------------------
   * SORT
   * ---------------------------------------------------------
   *
   * Existing conversations first.
   *
   * Unread conversations come before read conversations.
   *
   * People without conversations are then sorted
   * alphabetically.
   */
  const sortedPeople = [...filteredPeople].sort(
    (a, b) => {
      const conversationA =
        getConversation(a.id);

      const conversationB =
        getConversation(b.id);

      if (conversationA && !conversationB) {
        return -1;
      }

      if (!conversationA && conversationB) {
        return 1;
      }

      if (conversationA && conversationB) {
        const unreadA =
          conversationA.unread;

        const unreadB =
          conversationB.unread;

        if (
          unreadA > 0 &&
          unreadB === 0
        ) {
          return -1;
        }

        if (
          unreadA === 0 &&
          unreadB > 0
        ) {
          return 1;
        }

        /*
         * Keep conversations ordered by their actual
         * backend position.
         */
        const indexA =
          conversations.findIndex(
            (conversation) =>
              conversation.personId === a.id
          );

        const indexB =
          conversations.findIndex(
            (conversation) =>
              conversation.personId === b.id
          );

        if (
          indexA !== -1 &&
          indexB !== -1 &&
          indexA !== indexB
        ) {
          return indexA - indexB;
        }
      }

      return a.name.localeCompare(b.name);
    }
  );

  /*
   * ---------------------------------------------------------
   * REAL UNREAD COUNT
   * ---------------------------------------------------------
   */
  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total + conversation.unread,
    0
  );

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#0B1F3A"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Messages
            </Text>

            <Text style={styles.subtitle}>
              Stay connected with your network
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={25}
              color="#1769AA"
            />

            {totalUnread > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {totalUnread > 9
                    ? '9+'
                    : totalUnread}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>
              Your Conversations
            </Text>

            <Text style={styles.summaryText}>
              Message your professional connections
              and grow meaningful relationships.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {connectionCount}
            </Text>

            <Text style={styles.statLabel}>
              Connections
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {conversations.length}
            </Text>

            <Text style={styles.statLabel}>
              Conversations
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {totalUnread}
            </Text>

            <Text style={styles.statLabel}>
              Unread
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#667085"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#98A2B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#98A2B3"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Conversations */}
        <Text style={styles.sectionTitle}>
          Conversations
        </Text>

        {loading ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={34}
                color="#1769AA"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Loading conversations...
            </Text>

            <Text style={styles.emptyText}>
              Your conversations are being loaded.
            </Text>
          </View>
        ) : sortedPeople.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={34}
                color="#1769AA"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No connections yet
            </Text>

            <Text style={styles.emptyText}>
              Connect with professionals from your
              network to start a conversation.
            </Text>

            <TouchableOpacity
              style={styles.networkButton}
              onPress={() =>
                router.push('/alumni/networking')
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.networkButtonText}>
                Explore My Network
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedPeople.map((person) => {
            const conversation =
              getConversation(person.id);

            return (
              <TouchableOpacity
                key={person.id}
                style={styles.messageCard}
                onPress={() => openChat(person)}
                activeOpacity={0.75}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {person.initials}
                    </Text>
                  </View>

                  <View
                    style={styles.onlineIndicator}
                  />
                </View>

                {/* Message Information */}
                <View style={styles.messageInfo}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.personName,
                        conversation &&
                          conversation.unread > 0 &&
                          styles.unreadName,
                      ]}
                      numberOfLines={1}
                    >
                      {person.name}
                    </Text>

                    {conversation &&
                      conversation.timestamp && (
                        <Text style={styles.timestamp}>
                          {conversation.timestamp}
                        </Text>
                      )}
                  </View>

                  <Text
                    style={styles.personRole}
                    numberOfLines={1}
                  >
                    {person.role}
                    {person.company
                      ? ` • ${person.company}`
                      : ''}
                  </Text>

                  <View style={styles.previewRow}>
                    <Text
                      style={[
                        styles.lastMessage,
                        conversation &&
                          conversation.unread > 0 &&
                          styles.unreadMessage,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation
                        ? conversation.lastMessage
                        : 'Start a conversation'}
                    </Text>

                    {conversation &&
                      conversation.unread > 0 && (
                        <View
                          style={styles.unreadBadge}
                        >
                          <Text
                            style={
                              styles.unreadBadgeText
                            }
                          >
                            {conversation.unread >
                            9
                              ? '9+'
                              : conversation.unread}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                {/* Arrow */}
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#98A2B3"
                />
              </TouchableOpacity>
            );
          })
        )}

        {/* Start Networking */}
        {connectionCount > 0 && (
          <TouchableOpacity
            style={styles.networkingCard}
            onPress={() =>
              router.push('/alumni/networking')
            }
            activeOpacity={0.8}
          >
            <View style={styles.networkingIcon}>
              <Ionicons
                name="people-outline"
                size={23}
                color="#1769AA"
              />
            </View>

            <View style={styles.networkingInfo}>
              <Text style={styles.networkingTitle}>
                Grow Your Network
              </Text>

              <Text
                style={styles.networkingText}
              >
                Connect with more alumni and
                professionals.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#1769AA"
            />
          </TouchableOpacity>
        )}

        {/* Dashboard */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() =>
            router.replace('/alumni/dashboard')
          }
          activeOpacity={0.8}
        >
          <Text style={styles.dashboardButtonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  subtitle: {
    fontSize: 13,
    color: '#667085',
    marginTop: 4,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D64545',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Summary */

  summaryCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 5,
  },

  summaryText: {
    fontSize: 12,
    color: '#526579',
    lineHeight: 18,
  },

  /* Stats */

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1769AA',
  },

  statLabel: {
    fontSize: 11,
    color: '#667085',
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
  },

  /* Search */

  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#344054',
    marginLeft: 10,
  },

  /* Sections */

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 14,
  },

  /* Message Cards */

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 13,
  },

  avatar: {
    width: 53,
    height: 53,
    borderRadius: 27,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '800',
  },

  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF70',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    right: -1,
    bottom: 1,
  },

  messageInfo: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  personName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  unreadName: {
    fontWeight: '800',
  },

  timestamp: {
    fontSize: 10,
    color: '#98A2B3',
    marginLeft: 8,
  },

  personRole: {
    fontSize: 11,
    color: '#667085',
    marginBottom: 5,
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastMessage: {
    flex: 1,
    fontSize: 12,
    color: '#667085',
  },

  unreadMessage: {
    color: '#344054',
    fontWeight: '700',
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Empty */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 18,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },

  networkButton: {
    backgroundColor: '#1769AA',
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  networkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Networking */

  networkingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    elevation: 2,
  },

  networkingIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  networkingInfo: {
    flex: 1,
  },

  networkingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  networkingText: {
    fontSize: 11,
    color: '#667085',
  },

  /* Dashboard */

  dashboardButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});