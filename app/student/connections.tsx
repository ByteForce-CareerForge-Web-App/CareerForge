import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';

type Person = {
  id: string;
  name: string;
  role: string;
  programme: string;
  initials: string;
};

type RawPerson = {
  id?: string | number;
  user_id?: string | number;
  connection_id?: string | number;
  name?: string | null;
  role?: string | null;
  programme?: string | null;
  qualification?: string | null;
  initials?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
  status?: string | null;
};

type ConnectionsResponse = {
  success: boolean;
  message?: string;
  data?: {
    incoming_requests?: RawPerson[];
    sent_requests?: RawPerson[];
    connections?: RawPerson[];
    people?: RawPerson[];
  };
};

export default function ConnectionsScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [requests, setRequests] = useState<Person[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [connections, setConnections] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  /*
   * Convert the backend connection/person structure
   * into the structure expected by the existing UI.
   *
   * IMPORTANT:
   * - For normal people/connections, id = user_id
   * - For incoming requests, id = connection_id
   *
   * This allows the UI to continue using person.id without
   * changing N's design.
   */
  const normalizePerson = (
    person: RawPerson,
    useConnectionId = false
  ): Person | null => {
    const userId = person.user_id ?? person.id;
    const connectionId = person.connection_id ?? person.id;

    const selectedId = useConnectionId
      ? connectionId
      : userId;

    if (
      selectedId === undefined ||
      selectedId === null
    ) {
      return null;
    }

    const name = String(person.name ?? 'CareerForge User');

    let programme = '';

    if (person.programme) {
      programme = String(person.programme);
    } else if (person.qualification) {
      programme = String(person.qualification);
    } else if (person.company && person.position) {
      programme = `${person.position} at ${person.company}`;
    } else if (person.company) {
      programme = String(person.company);
    } else if (person.industry) {
      programme = String(person.industry);
    } else {
      programme = 'CareerForge Member';
    }

    const role = String(person.role ?? 'Member');

    const initials =
      person.initials && String(person.initials).trim()
        ? String(person.initials)
        : getInitials(name);

    return {
      id: String(selectedId),
      name,
      role,
      programme,
      initials,
    };
  };

  const normalizePeople = (
    list: RawPerson[] | undefined,
    useConnectionId = false
  ): Person[] => {
    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map(person =>
        normalizePerson(person, useConnectionId)
      )
      .filter(
        (person): person is Person =>
          person !== null
      );
  };

  const loadConnections = async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to view your connections.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result: ConnectionsResponse =
        await response.json();

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to load connections.'
        );
      }

      const data = result.data || {};

      /*
       * Incoming requests need connection_id because
       * Accept/Decline operates on the connection record.
       */
      const incomingRequests = normalizePeople(
        data.incoming_requests,
        true
      );

      /*
       * Sent requests only need the target user's ID
       * because the UI uses this to determine whether
       * "Request Sent" should be displayed.
       */
      const sent = normalizePeople(
        data.sent_requests,
        false
      );

      /*
       * Accepted connections use the other person's
       * user_id.
       */
      const connected = normalizePeople(
        data.connections,
        false
      );

      /*
       * People available to connect with use user_id.
       */
      const available = normalizePeople(
        data.people,
        false
      );

      setRequests(incomingRequests);
      setConnections(connected);
      setPeople(available);

      setSentRequests(
        sent.map(person => String(person.id))
      );
    } catch (error) {
      console.log(
        'Error loading connections:',
        error
      );

      Alert.alert(
        'Unable to Load Connections',
        'Something went wrong while loading your connections. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (person: Person) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            receiver_id: Number(person.id),
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to send connection request.'
        );
      }

      setSentRequests(prev => {
        if (prev.includes(String(person.id))) {
          return prev;
        }

        return [
          ...prev,
          String(person.id),
        ];
      });

      Alert.alert(
        'Connection Request Sent',
        `Your connection request was sent to ${person.name}.`
      );
    } catch (error) {
      console.log(
        'Error sending connection request:',
        error
      );

      Alert.alert(
        'Request Failed',
        error instanceof Error
          ? error.message
          : 'Unable to send the connection request.'
      );
    }
  };

  const acceptRequest = async (person: Person) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again.'
        );
        return;
      }

      /*
       * person.id is connection_id for incoming requests.
       */
      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            action: 'accept',
            connection_id: Number(person.id),
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to accept connection request.'
        );
      }

      await loadConnections();

      Alert.alert(
        'Connected!',
        `You are now connected with ${person.name}.`
      );
    } catch (error) {
      console.log(
        'Error accepting connection request:',
        error
      );

      Alert.alert(
        'Unable to Accept',
        error instanceof Error
          ? error.message
          : 'Unable to accept the connection request.'
      );
    }
  };

  const declineRequest = async (person: Person) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again.'
        );
        return;
      }

      /*
       * person.id is connection_id for incoming requests.
       */
      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            action: 'reject',
            connection_id: Number(person.id),
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to decline connection request.'
        );
      }

      setRequests(prev =>
        prev.filter(
          item => item.id !== person.id
        )
      );

      Alert.alert(
        'Request Declined',
        `The connection request from ${person.name} was declined.`
      );
    } catch (error) {
      console.log(
        'Error declining connection request:',
        error
      );

      Alert.alert(
        'Unable to Decline',
        error instanceof Error
          ? error.message
          : 'Unable to decline the connection request.'
      );
    }
  };

  const isConnected = (id: string) => {
    return connections.some(
      person =>
        String(person.id) === String(id)
    );
  };

  const filteredPeople = people.filter(person => {
    const name = String(person.name ?? '');
    const programme = String(
      person.programme ?? ''
    );
    const role = String(person.role ?? '');

    const searchValue =
      search.toLowerCase();

    return (
      name.toLowerCase().includes(searchValue) ||
      programme
        .toLowerCase()
        .includes(searchValue) ||
      role.toLowerCase().includes(searchValue)
    );
  });

  const availablePeople =
    filteredPeople.filter(
      person =>
        !isConnected(person.id) &&
        !requests.some(
          request =>
            String(request.id) ===
            String(person.id)
        )
    );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>
            Connections
          </Text>

          <Text style={styles.headerSubtitle}>
            Build your professional network
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Search */}
        <View
          style={styles.searchContainer}
        >
          <Text style={styles.searchIcon}>
            🔎
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people, roles or programmes..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Connection Requests */}
        {requests.length > 0 && (
          <View style={styles.section}>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Connection Requests
              </Text>

              <View style={styles.badge}>
                <Text
                  style={styles.badgeText}
                >
                  {requests.length}
                </Text>
              </View>
            </View>

            {requests.map(person => (
              <View
                key={person.id}
                style={styles.card}
              >

                <View style={styles.avatar}>
                  <Text
                    style={styles.avatarText}
                  >
                    {person.initials}
                  </Text>
                </View>

                <View
                  style={styles.personInfo}
                >
                  <Text
                    style={styles.personName}
                  >
                    {person.name}
                  </Text>

                  <Text
                    style={styles.personRole}
                  >
                    {person.role} • {person.programme}
                  </Text>

                  <View
                    style={
                      styles.requestButtons
                    }
                  >
                    <Pressable
                      style={
                        styles.acceptButton
                      }
                      onPress={() =>
                        acceptRequest(person)
                      }
                    >
                      <Text
                        style={
                          styles.acceptText
                        }
                      >
                        Accept
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.declineButton
                      }
                      onPress={() =>
                        declineRequest(person)
                      }
                    >
                      <Text
                        style={
                          styles.declineText
                        }
                      >
                        Decline
                      </Text>
                    </Pressable>
                  </View>
                </View>

              </View>
            ))}
          </View>
        )}

        {/* People You May Know */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            People You May Know
          </Text>

          {loading && people.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyIcon}
              >
                👥
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                Loading connections...
              </Text>

              <Text
                style={styles.emptyText}
              >
                Finding people you can connect with.
              </Text>
            </View>
          ) : availablePeople.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyIcon}
              >
                👥
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                No new people found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Try another search or check back later.
              </Text>
            </View>
          ) : (
            availablePeople.map(person => {
              const pending =
                sentRequests.includes(
                  String(person.id)
                );

              return (
                <View
                  key={person.id}
                  style={styles.card}
                >

                  <View
                    style={styles.avatar}
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {person.initials}
                    </Text>
                  </View>

                  <View
                    style={styles.personInfo}
                  >
                    <Text
                      style={
                        styles.personName
                      }
                    >
                      {person.name}
                    </Text>

                    <Text
                      style={
                        styles.personRole
                      }
                    >
                      {person.role}
                    </Text>

                    <Text
                      style={styles.programme}
                    >
                      {person.programme}
                    </Text>

                    <Pressable
                      disabled={pending}
                      onPress={() =>
                        sendRequest(person)
                      }
                      style={[
                        styles.connectButton,
                        pending &&
                          styles.pendingButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.connectText,
                          pending &&
                            styles.pendingText,
                        ]}
                      >
                        {pending
                          ? 'Request Sent'
                          : '+ Connect'}
                      </Text>
                    </Pressable>
                  </View>

                </View>
              );
            })
          )}
        </View>

        {/* My Connections */}
        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              My Connections
            </Text>

            <View
              style={styles.countBadge}
            >
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {connections.length}
              </Text>
            </View>
          </View>

          {connections.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyIcon}
              >
                🤝
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                No connections yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Start connecting with students and alumni
                to grow your professional network.
              </Text>
            </View>
          ) : (
            connections.map(person => (
              <View
                key={person.id}
                style={
                  styles.connectionCard
                }
              >
                {/* Avatar */}
                <View
                  style={styles.avatar}
                >
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {person.initials}
                  </Text>
                </View>

                {/* Person information + actions */}
                <View
                  style={styles.personInfo}
                >
                  <Text
                    style={
                      styles.personName
                    }
                  >
                    {person.name}
                  </Text>

                  <Text
                    style={
                      styles.personRole
                    }
                  >
                    {person.role}
                  </Text>

                  <Text
                    style={styles.programme}
                  >
                    {person.programme}
                  </Text>

                  {/* Connection Actions */}
                  <View
                    style={
                      styles.connectionActions
                    }
                  >

                    {/* View Profile */}
                    <Pressable
                      style={
                        styles.viewProfileButton
                      }
                      onPress={() =>
                        Alert.alert(
                          'Profile',
                          `${person.name}\n\n${person.role} • ${person.programme}`
                        )
                      }
                    >
                      <Text
                        style={
                          styles.viewProfileText
                        }
                      >
                        View Profile
                      </Text>
                    </Pressable>

                    {/* Message */}
                    <Pressable
                      style={styles.messageButton}
                      onPress={() =>
                        router.push({
                          pathname: '/student/chat',
                          params: {
                            userId: person.id,
                            name: person.name,
                            role: `${person.role} • ${person.programme}`,
                            initials: person.initials,
                            online: 'true',
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.messageText
                        }
                      >
                        💬 Message
                      </Text>
                    </Pressable>

                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const getInitials = (
  name: string
): string => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'CF';
  }

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#416697',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 32,
    marginTop: -3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 3,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1EA',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 25,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0B1F3A',
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
  },

  badge: {
    backgroundColor: '#EF4444',
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  countBadge: {
    backgroundColor: '#E2E8F0',
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  countBadgeText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  avatarText: {
    color: '#1E4B7A',
    fontSize: 16,
    fontWeight: '800',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  personRole: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 3,
  },

  programme: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
  },

  connectButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 9,
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  pendingButton: {
    backgroundColor: '#E2E8F0',
  },

  pendingText: {
    color: '#64748B',
  },

  requestButtons: {
    flexDirection: 'row',
    marginTop: 7,
    gap: 8,
  },

  acceptButton: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  declineButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  declineText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  connectedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  connectedText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  connectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },

  viewProfileButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  viewProfileText: {
    color: '#0B1F3A',
    fontSize: 11,
    fontWeight: '700',
  },

  messageButton: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  messageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

