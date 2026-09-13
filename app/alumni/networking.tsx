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
import { API_BASE_URL } from '@/constants/api';

type RawPerson = {
  id?: string | number;
  user_id?: string | number;
  connection_id?: string | number;
  name?: string;
  role?: string;
  programme?: string;
  qualification?: string;
  company?: string;
  position?: string;
  industry?: string;
  skills?: string;
  initials?: string;
  status?: string;
};

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  skills: string;
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

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

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
};

const normalizePerson = (
  person: RawPerson,
  useConnectionId = false
): Person => {
  const name = String(person.name ?? 'CareerForge Member');

  const id = useConnectionId
    ? String(person.connection_id ?? person.id ?? '')
    : String(person.user_id ?? person.id ?? '');

  const role = String(person.role ?? 'Member');

  let company = '';

  if (person.company) {
    company = String(person.company);
  } else if (person.industry) {
    company = String(person.industry);
  } else if (person.position) {
    company = String(person.position);
  } else {
    company = 'CareerForge Professional';
  }

  const skills = String(
    person.skills ??
      person.qualification ??
      person.programme ??
      person.position ??
      ''
  );

  return {
    id,
    initials: String(person.initials ?? getInitials(name)),
    name,
    role,
    company,
    skills,
  };
};

export default function NetworkingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Person[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
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

      const text = await response.text();

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(text);
      } catch (error) {
        console.log(
          'Invalid connections response:',
          text
        );
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      if (!result.success) {
        throw new Error(
          result.message || 'Failed to load networking data.'
        );
      }

      const data = result.data || {};

      const incoming = (
        data.incoming_requests || []
      ).map((person) =>
        normalizePerson(person, true)
      );

      const sent = (
        data.sent_requests || []
      ).map((person) =>
        normalizePerson(person, false)
      );

      const connected = (
        data.connections || []
      ).map((person) =>
        normalizePerson(person, false)
      );

      const available = (
        data.people || []
      ).map((person) =>
        normalizePerson(person, false)
      );

      setIncomingRequests(incoming);
      setSentRequests(
        sent.map((person) => person.id)
      );
      setConnections(connected);
      setPeople(available);
    } catch (error) {
      console.log(
        'Error loading connections:',
        error
      );

      Alert.alert(
        'Networking Error',
        error instanceof Error
          ? error.message
          : 'Unable to load networking data.'
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

  const sendConnectionRequest = async (
    person: Person
  ) => {
    try {
      const token = await AsyncStorage.getItem(
        'authToken'
      );

      if (!token) {
        Alert.alert(
          'Session Expired',
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

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to send connection request.'
        );
      }

      Alert.alert(
        'Request Sent',
        `Your connection request has been sent to ${person.name}.`
      );

      await loadConnections();
    } catch (error) {
      console.log(
        'Error sending connection request:',
        error
      );

      Alert.alert(
        'Connection Error',
        error instanceof Error
          ? error.message
          : 'Unable to send connection request.'
      );
    }
  };

  const removeConnection = async (
    person: Person
  ) => {
    Alert.alert(
      'Disconnect',
      `Are you sure you want to disconnect from ${person.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                Alert.alert(
                  'Session Expired',
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
                    'Content-Type':
                      'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    connection_id:
                      Number(
                        person.id
                      ),
                  }),
                }
              );

              const result =
                await response.json();

              if (
                !response.ok ||
                !result.success
              ) {
                throw new Error(
                  result.message ||
                    'Unable to remove connection.'
                );
              }

              Alert.alert(
                'Disconnected',
                `You are no longer connected with ${person.name}.`
              );

              await loadConnections();
            } catch (error) {
              console.log(
                'Error removing connection:',
                error
              );

              Alert.alert(
                'Connection Error',
                error instanceof Error
                  ? error.message
                  : 'Unable to remove connection.'
              );
            }
          },
        },
      ]
    );
  };

  const handleConnect = (person: Person) => {
    const isConnected = connections.some(
      (connection) =>
        connection.id === person.id
    );

    const requestSent = sentRequests.includes(
      person.id
    );

    if (isConnected) {
      removeConnection(person);
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
      `Send a connection request to ${person.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: () =>
            sendConnectionRequest(person),
        },
      ]
    );
  };

  const handleAcceptRequest = async (
    request: Person
  ) => {
    try {
      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        Alert.alert(
          'Session Expired',
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
            action: 'accept',
            connection_id: Number(
              request.id
            ),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to accept connection request.'
        );
      }

      Alert.alert(
        'Connection Accepted',
        `You are now connected with ${request.name}.`
      );

      await loadConnections();
    } catch (error) {
      console.log(
        'Error accepting connection:',
        error
      );

      Alert.alert(
        'Connection Error',
        error instanceof Error
          ? error.message
          : 'Unable to accept connection request.'
      );
    }
  };

  const handleRejectRequest = async (
    request: Person
  ) => {
    Alert.alert(
      'Decline Request',
      `Are you sure you want to decline ${request.name}'s connection request?`,
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
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                Alert.alert(
                  'Session Expired',
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
                    'Content-Type':
                      'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    action: 'reject',
                    connection_id:
                      Number(
                        request.id
                      ),
                  }),
                }
              );

              const result =
                await response.json();

              if (
                !response.ok ||
                !result.success
              ) {
                throw new Error(
                  result.message ||
                    'Unable to decline connection request.'
                );
              }

              await loadConnections();
            } catch (error) {
              console.log(
                'Error declining connection:',
                error
              );

              Alert.alert(
                'Connection Error',
                error instanceof Error
                  ? error.message
                  : 'Unable to decline connection request.'
              );
            }
          },
        },
      ]
    );
  };

  const filteredPeople = people.filter(
    (person) => {
      const query =
        searchQuery.toLowerCase().trim();

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
        person.skills
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const connectedPeople = connections;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Networking
          </Text>

          <Text style={styles.subtitle}>
            Connect with graduates and professionals
          </Text>
        </View>
      </View>

      {/* Introduction */}
      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <Text style={styles.iconText}>🌐</Text>
        </View>

        <Text style={styles.introTitle}>
          Grow Your Professional Network
        </Text>

        <Text style={styles.introDescription}>
          Connect with CareerForge members, alumni and
          professionals to build meaningful career
          relationships.
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {connections.length}
          </Text>
          <Text style={styles.statLabel}>
            Connections
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {people.length}
          </Text>
          <Text style={styles.statLabel}>
            Professionals
          </Text>
        </View>
      </View>

      {/* Connection Requests */}
      {incomingRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Connection Requests
          </Text>

          {incomingRequests.map((request) => (
            <View
              style={styles.personCard}
              key={request.id}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {request.initials}
                </Text>
              </View>

              <View style={styles.personInfo}>
                <Text style={styles.personName}>
                  {request.name}
                </Text>

                <Text style={styles.personRole}>
                  {request.role}
                </Text>

                <Text style={styles.personCompany}>
                  {request.company}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() =>
                    handleAcceptRequest(
                      request
                    )
                  }
                >
                  <Text style={styles.connectText}>
                    Accept
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    handleRejectRequest(
                      request
                    )
                  }
                >
                  <Text
                    style={
                      styles.removeButtonText
                    }
                  >
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Search */}
      <Text style={styles.sectionTitle}>
        Find Professionals
      </Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>
          🔍
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search people, skills or careers"
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              setSearchQuery('')
            }
          >
            <Text style={styles.clearText}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Connections */}
      <Text style={styles.sectionTitle}>
        {searchQuery
          ? 'Search Results'
          : 'Suggested Connections'}
      </Text>

      {filteredPeople.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🔎
          </Text>

          <Text style={styles.emptyTitle}>
            No professionals found
          </Text>

          <Text style={styles.emptyText}>
            Try searching for a different name,
            skill or career.
          </Text>
        </View>
      ) : (
        filteredPeople.map((person) => {
          const isConnected =
            connections.some(
              (connection) =>
                connection.id ===
                person.id
            );

          const requestSent =
            sentRequests.includes(
              person.id
            );

          return (
            <View
              style={styles.personCard}
              key={person.id}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {person.initials}
                </Text>
              </View>

              <View style={styles.personInfo}>
                <Text style={styles.personName}>
                  {person.name}
                </Text>

                <Text style={styles.personRole}>
                  {person.role}
                </Text>

                <Text style={styles.personCompany}>
                  {person.company}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.connectButton,
                  isConnected &&
                    styles.connectedButton,
                ]}
                onPress={() =>
                  handleConnect(person)
                }
              >
                <Text
                  style={[
                    styles.connectText,
                    isConnected &&
                      styles.connectedText,
                  ]}
                >
                  {isConnected
                    ? '✓ Connected'
                    : requestSent
                    ? 'Pending'
                    : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* Your Connections */}
      {connectedPeople.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Your Connections
          </Text>

          {connectedPeople.map((person) => (
            <View
              style={styles.connectionCard}
              key={person.id}
            >
              <View
                style={styles.connectionAvatar}
              >
                <Text
                  style={
                    styles.connectionAvatarText
                  }
                >
                  {person.initials}
                </Text>
              </View>

              <View
                style={styles.connectionInfo}
              >
                <Text
                  style={styles.connectionName}
                >
                  {person.name}
                </Text>

                <Text
                  style={styles.connectionRole}
                >
                  {person.role}
                </Text>

                <Text
                  style={styles.connectedLabel}
                >
                  ✓ Connected
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() =>
                  removeConnection(person)
                }
              >
                <Text
                  style={styles.removeButtonText}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Networking Benefits */}
      <Text style={styles.sectionTitle}>
        Why Network?
      </Text>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>
          💼
        </Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Discover Opportunities
          </Text>

          <Text
            style={styles.benefitDescription}
          >
            Learn about career opportunities through
            your professional network.
          </Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>
          🤝
        </Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Build Connections
          </Text>

          <Text
            style={styles.benefitDescription}
          >
            Meet professionals and alumni who can
            support your career journey.
          </Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>
          🚀
        </Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Grow Your Career
          </Text>

          <Text
            style={styles.benefitDescription}
          >
            Expand your professional network and gain
            valuable industry knowledge.
          </Text>
        </View>
      </View>

      {/* Back to Dashboard */}
      <TouchableOpacity
        style={styles.dashboardButton}
        onPress={() =>
          router.replace('/alumni/dashboard')
        }
      >
        <Text
          style={styles.dashboardButtonText}
        >
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
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

  backText: {
    fontSize: 25,
    color: '#4F46E5',
    fontWeight: '600',
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#24243A',
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },

  introCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },

  introIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  iconText: {
    fontSize: 30,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24243A',
    textAlign: 'center',
    marginBottom: 8,
  },

  introDescription: {
    fontSize: 14,
    color: '#5F5F70',
    textAlign: 'center',
    lineHeight: 21,
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4F46E5',
  },

  statLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E5E5EA',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 14,
  },

  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#24243A',
  },

  clearText: {
    fontSize: 16,
    color: '#888888',
    marginLeft: 8,
  },

  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 3,
  },

  personRole: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 2,
  },

  personCompany: {
    fontSize: 11,
    color: '#888888',
  },

  connectButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  connectedButton: {
    backgroundColor: '#E8F7EE',
    borderWidth: 1,
    borderColor: '#4CAF70',
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  connectedText: {
    color: '#31834B',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },

  connectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  connectionAvatarText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },

  connectionInfo: {
    flex: 1,
  },

  connectionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 3,
  },

  connectionRole: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },

  connectedLabel: {
    fontSize: 11,
    color: '#31834B',
    fontWeight: '600',
  },

  removeButton: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  removeButtonText: {
    color: '#C94A4A',
    fontSize: 11,
    fontWeight: '700',
  },

  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  benefitIcon: {
    fontSize: 28,
    marginRight: 15,
  },

  benefitInfo: {
    flex: 1,
  },

  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 5,
  },

  benefitDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 18,
  },

  dashboardButton: {
    backgroundColor: '#6C63FF',
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

