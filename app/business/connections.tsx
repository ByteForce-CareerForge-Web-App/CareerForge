import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type RawPerson = {
  id?: string | number;
  user_id?: string | number;
  connection_id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  programme?: string;
  qualification?: string;
  company?: string;
  position?: string;
  industry?: string;
  initials?: string;
  status?: string;
};

type Person = {
  id: string;
  connectionId?: string;
  name: string;
  email?: string;
  role: string;
  programme: string;
  initials: string;
  company?: string;
  position?: string;
  industry?: string;
  status?: string;
};

type ConnectionsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    incoming_requests?: RawPerson[];
    sent_requests?: RawPerson[];
    connections?: RawPerson[];
    people?: RawPerson[];
  };
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const normalizePerson = (
  person: RawPerson,
  useConnectionId = false
): Person => {
  const userId = String(person.user_id ?? person.id ?? '');
  const connectionId = person.connection_id
    ? String(person.connection_id)
    : undefined;

  const name = String(person.name ?? 'CareerForge Member');

  let programme = String(person.programme ?? '');

  if (!programme && person.qualification) {
    programme = String(person.qualification);
  }

  if (!programme && person.position && person.company) {
    programme = `${person.position} at ${person.company}`;
  }

  if (!programme && person.company) {
    programme = String(person.company);
  }

  if (!programme && person.industry) {
    programme = String(person.industry);
  }

  if (!programme) {
    programme = 'CareerForge Member';
  }

  return {
    id: useConnectionId && connectionId ? connectionId : userId,
    connectionId,
    name,
    email: person.email,
    role: String(person.role ?? 'Member'),
    programme,
    initials: String(person.initials ?? getInitials(name)),
    company: person.company
      ? String(person.company)
      : undefined,
    position: person.position
      ? String(person.position)
      : undefined,
    industry: person.industry
      ? String(person.industry)
      : undefined,
    status: person.status
      ? String(person.status)
      : undefined,
  };
};

export default function BusinessConnectionsScreen() {
  const [connections, setConnections] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Person[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session Required',
          'Please log in again to view your connections.'
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}/connections.php`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const rawText = await response.text();

      let data: ConnectionsResponse = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Invalid connections response:', rawText);

        Alert.alert(
          'Connection Error',
          'The server returned an invalid response.'
        );

        return;
      }

      if (!response.ok || data.success === false) {
        Alert.alert(
          'Connection Error',
          data.message ?? 'Unable to load connections.'
        );
        return;
      }

      const incoming = Array.isArray(data.data?.incoming_requests)
        ? data.data.incoming_requests.map((person) =>
            normalizePerson(person, true)
            )
        : [];

        const sent = Array.isArray(data.data?.sent_requests)
        ? data.data.sent_requests.map((person) =>
            normalizePerson(person)
            )
        : [];

        const connected = Array.isArray(data.data?.connections)
        ? data.data.connections.map((person) =>
            normalizePerson(person)
            )
        : [];

        const availablePeople = Array.isArray(data.data?.people)
        ? data.data.people.map((person) =>
            normalizePerson(person)
            )
        : [];

      setIncomingRequests(incoming);
      setSentRequests(sent.map((person) => person.id));
      setConnections(connected);
      setPeople(availablePeople);
    } catch (error) {
      console.error('Load connections error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to the CareerForge server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [loadConnections])
  );

  const sendConnectionRequest = async (person: Person) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session Required',
          'Please log in again.'
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}/connections.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          receiver_id: Number(person.id),
        }),
      });

      const rawText = await response.text();

      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Invalid POST response:', rawText);

        Alert.alert(
          'Error',
          'The server returned an invalid response.'
        );
        return;
      }

      if (!response.ok || data.success === false) {
        Alert.alert(
          'Unable to Connect',
          data.message ?? 'The connection request could not be sent.'
        );
        return;
      }

      setSentRequests((previous) => [
        ...previous,
        String(person.id),
      ]);

      Alert.alert(
        'Request Sent',
        `Your connection request was sent to ${person.name}.`
      );

      await loadConnections();
    } catch (error) {
      console.error('Send connection request error:', error);

      Alert.alert(
        'Error',
        'Unable to send the connection request.'
      );
    }
  };

  const handleConnect = (person: Person) => {
    const isConnected = connections.some(
      (connection) => connection.id === person.id
    );

    const requestSent = sentRequests.includes(person.id);

    if (isConnected) {
      Alert.alert(
        'Already Connected',
        `You are already connected with ${person.name}.`
      );
      return;
    }

    if (requestSent) {
      Alert.alert(
        'Request Pending',
        `Your connection request to ${person.name} is still pending.`
      );
      return;
    }

    Alert.alert(
      'Connect',
      `Would you like to connect with ${person.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: () => sendConnectionRequest(person),
        },
      ]
    );
  };

  const handleAcceptRequest = async (request: Person) => {
    if (!request.connectionId) {
      Alert.alert(
        'Error',
        'The connection request ID is missing.'
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session Required',
          'Please log in again.'
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}/connections.php`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          connection_id: Number(request.connectionId),
          action: 'accept',
        }),
      });

      const rawText = await response.text();

      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Invalid accept response:', rawText);

        Alert.alert(
          'Error',
          'The server returned an invalid response.'
        );
        return;
      }

      if (!response.ok || data.success === false) {
        Alert.alert(
          'Unable to Accept',
          data.message ?? 'The connection request could not be accepted.'
        );
        return;
      }

      Alert.alert(
        'Connected',
        `You are now connected with ${request.name}.`
      );

      await loadConnections();
    } catch (error) {
      console.error('Accept connection error:', error);

      Alert.alert(
        'Error',
        'Unable to accept the connection request.'
      );
    }
  };

  const handleRejectRequest = async (request: Person) => {
    if (!request.connectionId) {
      Alert.alert(
        'Error',
        'The connection request ID is missing.'
      );
      return;
    }

    Alert.alert(
      'Decline Request',
      `Decline the connection request from ${request.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');

              if (!token) {
                Alert.alert(
                  'Session Required',
                  'Please log in again.'
                );
                return;
              }

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
                    connection_id: Number(request.connectionId),
                    action: 'reject',
                  }),
                }
              );

              const rawText = await response.text();

              let data: any = {};

              try {
                data = JSON.parse(rawText);
              } catch {
                console.error(
                  'Invalid reject response:',
                  rawText
                );

                Alert.alert(
                  'Error',
                  'The server returned an invalid response.'
                );
                return;
              }

              if (!response.ok || data.success === false) {
                Alert.alert(
                  'Unable to Decline',
                  data.message ??
                    'The connection request could not be declined.'
                );
                return;
              }

              await loadConnections();
            } catch (error) {
              console.error(
                'Reject connection error:',
                error
              );

              Alert.alert(
                'Error',
                'Unable to decline the connection request.'
              );
            }
          },
        },
      ]
    );
  };

  const removeConnection = (person: Person) => {
    if (!person.connectionId) {
      Alert.alert(
        'Error',
        'The connection ID is missing.'
      );
      return;
    }

    Alert.alert(
      'Remove Connection',
      `Are you sure you want to remove ${person.name} from your connections?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(
                'authToken'
              );

              if (!token) {
                Alert.alert(
                  'Session Required',
                  'Please log in again.'
                );
                return;
              }

              const response = await fetch(
                `${API_BASE_URL}/connections.php`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    connection_id: Number(
                      person.connectionId
                    ),
                  }),
                }
              );

              const rawText = await response.text();

              let data: any = {};

              try {
                data = JSON.parse(rawText);
              } catch {
                console.error(
                  'Invalid remove response:',
                  rawText
                );

                Alert.alert(
                  'Error',
                  'The server returned an invalid response.'
                );
                return;
              }

              if (!response.ok || data.success === false) {
                Alert.alert(
                  'Unable to Remove',
                  data.message ??
                    'The connection could not be removed.'
                );
                return;
              }

              await loadConnections();
            } catch (error) {
              console.error(
                'Remove connection error:',
                error
              );

              Alert.alert(
                'Error',
                'Unable to remove the connection.'
              );
            }
          },
        },
      ]
    );
  };

  const filteredPeople = people.filter((person) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      person.name,
      person.role,
      person.programme,
      person.company,
      person.position,
      person.industry,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query)
      );
  });

  const connectedPeople = connections;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Connections</Text>
            <Text style={styles.headerSubtitle}>
              Build your professional network
            </Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>🤝</Text>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Grow Your Network
            </Text>

            <Text style={styles.introText}>
              Connect with students, alumni and professionals
              to build meaningful career relationships.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {connections.length}
            </Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {people.length}
            </Text>
            <Text style={styles.statLabel}>Professionals</Text>
          </View>
        </View>

        {/* Connection Requests */}
        {incomingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Connection Requests
              </Text>

              <View style={styles.requestBadge}>
                <Text style={styles.requestBadgeText}>
                  {incomingRequests.length}
                </Text>
              </View>
            </View>

            {incomingRequests.map((person) => (
              <View
                key={`request-${person.id}`}
                style={styles.requestCard}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {person.initials}
                  </Text>
                </View>

                <View style={styles.personInfo}>
                  <Text
                    style={styles.personName}
                    numberOfLines={1}
                  >
                    {person.name}
                  </Text>

                  <Text
                    style={styles.personRole}
                    numberOfLines={1}
                  >
                    {person.role}
                  </Text>

                  <Text
                    style={styles.personCompany}
                    numberOfLines={1}
                  >
                    {person.programme}
                  </Text>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() =>
                      handleAcceptRequest(person)
                    }
                  >
                    <Text style={styles.acceptButtonText}>
                      Accept
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() =>
                      handleRejectRequest(person)
                    }
                  >
                    <Text style={styles.declineButtonText}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Suggested Connections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Suggested Connections
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>
                Loading connections...
              </Text>
            </View>
          ) : filteredPeople.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>
                No people found
              </Text>
              <Text style={styles.emptyText}>
                Try searching for another professional.
              </Text>
            </View>
          ) : (
            filteredPeople.map((person) => {
              const isConnected = connections.some(
                (connection) =>
                  connection.id === person.id
              );

              const isPending = sentRequests.includes(
                person.id
              );

              return (
                <View
                  key={`person-${person.id}`}
                  style={styles.personCard}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {person.initials}
                    </Text>
                  </View>

                  <View style={styles.personInfo}>
                    <Text
                      style={styles.personName}
                      numberOfLines={1}
                    >
                      {person.name}
                    </Text>

                    <Text
                      style={styles.personRole}
                      numberOfLines={1}
                    >
                      {person.role}
                    </Text>

                    <Text
                      style={styles.personCompany}
                      numberOfLines={1}
                    >
                      {person.programme}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.connectButton,
                      isConnected &&
                        styles.connectedButton,
                      isPending &&
                        styles.pendingButton,
                    ]}
                    onPress={() =>
                      handleConnect(person)
                    }
                  >
                    <Text
                      style={[
                        styles.connectButtonText,
                        isConnected &&
                          styles.connectedButtonText,
                        isPending &&
                          styles.pendingButtonText,
                      ]}
                    >
                      {isConnected
                        ? '✓ Connected'
                        : isPending
                        ? 'Pending'
                        : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Your Connections */}
        {connectedPeople.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Connections
              </Text>

              <Text style={styles.connectionCount}>
                {connectedPeople.length}
              </Text>
            </View>

            {connectedPeople.map((person) => (
              <View
                key={`connected-${person.id}`}
                style={styles.connectionCard}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {person.initials}
                  </Text>
                </View>

                <View style={styles.personInfo}>
                  <Text
                    style={styles.personName}
                    numberOfLines={1}
                  >
                    {person.name}
                  </Text>

                  <Text
                    style={styles.personRole}
                    numberOfLines={1}
                  >
                    {person.role}
                  </Text>

                  <Text
                    style={styles.personCompany}
                    numberOfLines={1}
                  >
                    {person.programme}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    removeConnection(person)
                  }
                >
                  <Text style={styles.removeButtonText}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Why Network */}
        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>
            Why Build Your Network?
          </Text>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>💼</Text>
            <Text style={styles.benefitText}>
              Discover talented graduates and professionals
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <Text style={styles.benefitText}>
              Build meaningful professional relationships
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <Text style={styles.benefitText}>
              Create opportunities for collaboration
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🌱</Text>
            <Text style={styles.benefitText}>
              Support the growth of emerging talent
            </Text>
          </View>
        </View>

        {/* Back to Dashboard */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() =>
            router.replace('/business/dashboard')
          }
        >
          <Text style={styles.dashboardButtonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 22,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 30,
    color: '#111827',
    lineHeight: 32,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  introIconText: {
    fontSize: 25,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  searchContainer: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 24,
  },

  searchIcon: {
    fontSize: 24,
    color: '#6B7280',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  section: {
    marginBottom: 26,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  requestBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  requestBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  connectionCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#6B7280',
  },

  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
  },

  personInfo: {
    flex: 1,
    minWidth: 0,
  },

  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  personRole: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },

  personCompany: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  connectButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 8,
  },

  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  connectedButton: {
    backgroundColor: '#ECFDF5',
  },

  connectedButtonText: {
    color: '#047857',
  },

  pendingButton: {
    backgroundColor: '#FEF3C7',
  },

  pendingButtonText: {
    color: '#92400E',
  },

  requestActions: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },

  acceptButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  declineButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  declineButtonText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },

  removeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    marginLeft: 8,
  },

  removeButtonText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  whyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },

  whyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  benefitIcon: {
    fontSize: 17,
    width: 30,
  },

  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },

  dashboardButton: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});