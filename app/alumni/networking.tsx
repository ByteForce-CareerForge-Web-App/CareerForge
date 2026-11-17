import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  skills: string;
};

type ConnectionRequest = {
  connection_id: number;
  user_id: number;
  name: string;
  email?: string;
  role: string;
  status: string;
  initials: string;
  qualification?: string | null;
  graduation_year?: string | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
};

type ConnectionsResponse = {
  success: boolean;
  message: string;
  data?: {
    incoming_requests?: ConnectionRequest[];
    sent_requests?: ConnectionRequest[];
    connections?: ConnectionRequest[];
    people?: ConnectionRequest[];
  };
};

const NETWORKING_KEY = 'careerforge_alumni_connections';

export default function NetworkingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /*
   * --------------------------------------------------------------------------
   * Helpers
   * --------------------------------------------------------------------------
   */

  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      throw new Error('Your session has expired. Please log in again.');
    }

    return token;
  };

  const mapPerson = (person: ConnectionRequest): Person => {
    const company =
      person.company ||
      person.industry ||
      'CareerForge Professional';

    const role =
      person.position ||
      person.role ||
      'Professional';

    let skills = '';

    if (person.qualification) {
      skills = person.qualification;
    } else if (person.industry) {
      skills = person.industry;
    } else {
      skills = 'CareerForge Member';
    }

    return {
      id: String(person.user_id),
      initials: person.initials || getInitials(person.name),
      name: person.name,
      role,
      company,
      skills,
    };
  };

  const getInitials = (name: string): string => {
    const trimmedName = (name || '').trim();

    if (!trimmedName) {
      return '?';
    }

    const parts = trimmedName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0].substring(0, 1) +
      parts[parts.length - 1].substring(0, 1)
    ).toUpperCase();
  };

  /*
   * --------------------------------------------------------------------------
   * Load networking data from backend
   * --------------------------------------------------------------------------
   */

  const loadNetworkingData = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

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

      const responseText = await response.text();

      console.log(
        'Networking GET status:',
        response.status
      );

      console.log(
        'Networking GET response:',
        responseText
      );

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to load networking information.'
        );
      }

      const data = result.data || {};

      const backendPeople =
        (data.people || []).map(mapPerson);

      const backendConnections =
        (data.connections || []).map(mapPerson);

      setPeople(backendPeople);
      setConnections(backendConnections);
      setSentRequests(data.sent_requests || []);
      setIncomingRequests(data.incoming_requests || []);

      /*
       * Keep a small local cache so the existing app key remains useful,
       * but the backend is now the source of truth.
       */
      await AsyncStorage.setItem(
        NETWORKING_KEY,
        JSON.stringify(
          backendConnections.map((person) => person.id)
        )
      );
    } catch (error: any) {
      console.log(
        'Error loading networking data:',
        error
      );

      if (
        error?.message?.includes('session has expired')
      ) {
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
      } else {
        Alert.alert(
          'Networking Error',
          error?.message ||
            'Unable to load your professional network.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNetworkingData();
    }, [loadNetworkingData])
  );

  /*
   * --------------------------------------------------------------------------
   * Find request status
   * --------------------------------------------------------------------------
   */

  const getSentRequest = (personId: string) => {
    return sentRequests.find(
      (request) =>
        String(request.user_id) === String(personId)
    );
  };

  const getIncomingRequest = (personId: string) => {
    return incomingRequests.find(
      (request) =>
        String(request.user_id) === String(personId)
    );
  };

  /*
   * --------------------------------------------------------------------------
   * Send connection request
   * --------------------------------------------------------------------------
   */

  const sendConnectionRequest = async (
    person: Person
  ) => {
    try {
      setActionLoading(`connect-${person.id}`);

      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: Number(person.id),
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        'Networking POST status:',
        response.status
      );

      console.log(
        'Networking POST response:',
        responseText
      );

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to send connection request.'
        );
      }

      Alert.alert(
        'Request Sent',
        `Your connection request to ${person.name} has been sent.`
      );

      await loadNetworkingData();
    } catch (error: any) {
      console.log(
        'Error sending connection request:',
        error
      );

      Alert.alert(
        'Connection Request',
        error?.message ||
          'Unable to send the connection request.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Accept incoming connection request
   * --------------------------------------------------------------------------
   */

  const acceptConnectionRequest = async (
    request: ConnectionRequest
  ) => {
    try {
      setActionLoading(
        `accept-${request.connection_id}`
      );

      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            connection_id: request.connection_id,
            action: 'accept',
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        'Networking ACCEPT status:',
        response.status
      );

      console.log(
        'Networking ACCEPT response:',
        responseText
      );

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to accept connection request.'
        );
      }

      Alert.alert(
        'Connection Accepted',
        `You are now connected with ${request.name}.`
      );

      await loadNetworkingData();
    } catch (error: any) {
      console.log(
        'Error accepting connection request:',
        error
      );

      Alert.alert(
        'Connection Request',
        error?.message ||
          'Unable to accept this connection request.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Reject incoming connection request
   * --------------------------------------------------------------------------
   */

  const rejectConnectionRequest = async (
    request: ConnectionRequest
  ) => {
    try {
      setActionLoading(
        `reject-${request.connection_id}`
      );

      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            connection_id: request.connection_id,
            action: 'reject',
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        'Networking REJECT status:',
        response.status
      );

      console.log(
        'Networking REJECT response:',
        responseText
      );

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to reject connection request.'
        );
      }

      await loadNetworkingData();
    } catch (error: any) {
      console.log(
        'Error rejecting connection request:',
        error
      );

      Alert.alert(
        'Connection Request',
        error?.message ||
          'Unable to reject this connection request.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Remove accepted connection
   * --------------------------------------------------------------------------
   */

  const removeConnection = async (
    person: Person
  ) => {
    const connection = connections.find(
      (item) =>
        String(item.id) === String(person.id)
    );

    if (!connection) {
      return;
    }

    /*
     * We need the actual connection_id from the backend.
     * Reloading the API data gives us that relationship.
     */
    try {
      setActionLoading(`remove-${person.id}`);

      const token = await getAuthToken();

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

      const responseText = await response.text();

      let result: ConnectionsResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to retrieve connection information.'
        );
      }

      const backendConnection =
        (result.data?.connections || []).find(
          (item) =>
            String(item.user_id) ===
            String(person.id)
        );

      if (!backendConnection) {
        await loadNetworkingData();
        return;
      }

      Alert.alert(
        'Remove Connection',
        `Are you sure you want to remove ${person.name} from your network?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setActionLoading(null);
            },
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const deleteResponse =
                  await fetch(
                    `${API_BASE_URL}/connections.php`,
                    {
                      method: 'DELETE',
                      headers: {
                        'Content-Type':
                          'application/json',
                        Accept:
                          'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        connection_id:
                          backendConnection.connection_id,
                      }),
                    }
                  );

                const deleteText =
                  await deleteResponse.text();

                console.log(
                  'Networking DELETE status:',
                  deleteResponse.status
                );

                console.log(
                  'Networking DELETE response:',
                  deleteText
                );

                let deleteResult: ConnectionsResponse;

                try {
                  deleteResult =
                    JSON.parse(deleteText);
                } catch {
                  throw new Error(
                    'The server returned an invalid response.'
                  );
                }

                if (
                  !deleteResponse.ok ||
                  !deleteResult.success
                ) {
                  throw new Error(
                    deleteResult.message ||
                      'Failed to remove connection.'
                  );
                }

                Alert.alert(
                  'Connection Removed',
                  `${person.name} has been removed from your network.`
                );

                await loadNetworkingData();
              } catch (error: any) {
                console.log(
                  'Error removing connection:',
                  error
                );

                Alert.alert(
                  'Remove Connection',
                  error?.message ||
                    'Unable to remove this connection.'
                );
              } finally {
                setActionLoading(null);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.log(
        'Error finding connection:',
        error
      );

      Alert.alert(
        'Remove Connection',
        error?.message ||
          'Unable to remove this connection.'
      );

      setActionLoading(null);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Connect button handler
   * --------------------------------------------------------------------------
   */

  const handleConnect = (person: Person) => {
    const isConnected = connections.some(
      (connection) =>
        String(connection.id) === String(person.id)
    );

    if (isConnected) {
      removeConnection(person);
      return;
    }

    const incomingRequest =
      getIncomingRequest(person.id);

    if (incomingRequest) {
      Alert.alert(
        'Connection Request',
        `${person.name} wants to connect with you.`,
        [
          {
            text: 'Decline',
            style: 'cancel',
            onPress: () =>
              rejectConnectionRequest(
                incomingRequest
              ),
          },
          {
            text: 'Accept',
            onPress: () =>
              acceptConnectionRequest(
                incomingRequest
              ),
          },
        ]
      );

      return;
    }

    const sentRequest =
      getSentRequest(person.id);

    if (sentRequest) {
      Alert.alert(
        'Request Sent',
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

  /*
   * --------------------------------------------------------------------------
   * Open connection profile
   * --------------------------------------------------------------------------
   */

  const openProfile = (person: Person) => {
    const isConnected = connections.some(
      (connection) =>
        String(connection.id) === String(person.id)
    );

    if (!isConnected) {
      return;
    }

    router.push({
      pathname: '/alumni/connection-profile',
      params: {
        personId: person.id,
        initials: person.initials,
        name: person.name,
        role: person.role,
        company: person.company,
        skills: person.skills,
      },
    });
  };

  /*
   * --------------------------------------------------------------------------
   * Search
   * --------------------------------------------------------------------------
   */

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

  /*
   * --------------------------------------------------------------------------
   * Include incoming requests in the displayed people list.
   *
   * This allows the existing Connect button to become an Accept/Decline
   * interaction without changing the screen layout.
   * --------------------------------------------------------------------------
   */

  const incomingPeople: Person[] =
    incomingRequests.map(mapPerson);

  const displayedPeopleMap =
    new Map<string, Person>();

  filteredPeople.forEach((person) => {
    displayedPeopleMap.set(person.id, person);
  });

  incomingPeople.forEach((person) => {
    if (
      !displayedPeopleMap.has(person.id)
    ) {
      displayedPeopleMap.set(
        person.id,
        person
      );
    }
  });

  const displayedPeople = Array.from(
    displayedPeopleMap.values()
  ).filter((person) => {
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
  });

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
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              My Network
            </Text>

            <Text style={styles.subtitle}>
              Connect with graduates and professionals
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="people-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.introTitle}>
            Grow Your Professional Network
          </Text>

          <Text style={styles.introDescription}>
            Connect with CareerForge members, alumni and professionals
            to build meaningful career relationships.
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

        {/* Search */}
        <Text style={styles.sectionTitle}>
          Find Professionals
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#667085"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search people, skills or careers"
            placeholderTextColor="#98A2B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchQuery('')
              }
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

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="small"
              color="#1769AA"
            />

            <Text style={styles.loadingText}>
              Loading your network...
            </Text>
          </View>
        ) : (
          <>
            {/* Suggested Connections */}
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? 'Search Results'
                : 'Suggested Connections'}
            </Text>

            {displayedPeople.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="search-outline"
                  size={35}
                  color="#1769AA"
                />

                <Text style={styles.emptyTitle}>
                  No professionals found
                </Text>

                <Text style={styles.emptyText}>
                  Try searching for a different name, skill or career.
                </Text>
              </View>
            ) : (
              displayedPeople.map(
                (person) => {
                  const isConnected =
                    connections.some(
                      (connection) =>
                        String(
                          connection.id
                        ) ===
                        String(person.id)
                    );

                  const hasSentRequest =
                    !!getSentRequest(
                      person.id
                    );

                  const hasIncomingRequest =
                    !!getIncomingRequest(
                      person.id
                    );

                  const isActionLoading =
                    actionLoading ===
                    `connect-${person.id}` ||
                    actionLoading ===
                    `accept-${getIncomingRequest(person.id)?.connection_id}`;

                  return (
                    <View
                      style={styles.personCard}
                      key={person.id}
                    >
                      {/* Profile Area */}
                      <TouchableOpacity
                        style={
                          styles.personProfileArea
                        }
                        onPress={() =>
                          openProfile(person)
                        }
                        activeOpacity={
                          isConnected
                            ? 0.7
                            : 1
                        }
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
                            style={
                              styles.personCompany
                            }
                          >
                            {person.company}
                          </Text>

                          {isConnected && (
                            <Text
                              style={
                                styles.viewProfileText
                              }
                            >
                              Tap to view profile
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Connect Button */}
                      <TouchableOpacity
                        style={[
                          styles.connectButton,
                          isConnected &&
                            styles.connectedButton,
                          hasSentRequest &&
                            styles.requestSentButton,
                        ]}
                        onPress={() =>
                          handleConnect(
                            person
                          )
                        }
                        activeOpacity={0.8}
                        disabled={
                          !!actionLoading
                        }
                      >
                        {isActionLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={
                              isConnected ||
                              hasSentRequest
                                ? '#31834B'
                                : '#FFFFFF'
                            }
                          />
                        ) : (
                          <Text
                            style={[
                              styles.connectText,
                              isConnected &&
                                styles.connectedText,
                              hasSentRequest &&
                                styles.requestSentText,
                            ]}
                          >
                            {isConnected
                              ? '✓ Connected'
                              : hasSentRequest
                              ? 'Request Sent'
                              : hasIncomingRequest
                              ? 'Accept'
                              : 'Connect'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }
              )
            )}

            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <>
                <View
                  style={
                    styles.connectionsHeader
                  }
                >
                  <Text
                    style={styles.sectionTitle}
                  >
                    Connection Requests
                  </Text>

                  <Text
                    style={
                      styles.connectionCount
                    }
                  >
                    {incomingRequests.length}
                  </Text>
                </View>

                {incomingRequests.map(
                  (request) => (
                    <View
                      style={
                        styles.connectionCard
                      }
                      key={
                        request.connection_id
                      }
                    >
                      <View
                        style={
                          styles.connectionProfileArea
                        }
                      >
                        <View
                          style={
                            styles.connectionAvatar
                          }
                        >
                          <Text
                            style={
                              styles.connectionAvatarText
                            }
                          >
                            {request.initials}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.connectionInfo
                          }
                        >
                          <Text
                            style={
                              styles.connectionName
                            }
                          >
                            {request.name}
                          </Text>

                          <Text
                            style={
                              styles.connectionRole
                            }
                          >
                            {request.role}
                          </Text>

                          <Text
                            style={
                              styles.connectedLabel
                            }
                          >
                            Wants to connect
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.connectionActions
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.messageButton
                          }
                          onPress={() =>
                            acceptConnectionRequest(
                              request
                            )
                          }
                          activeOpacity={0.8}
                          disabled={
                            !!actionLoading
                          }
                        >
                          <Ionicons
                            name="checkmark-outline"
                            size={17}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.messageButtonText
                            }
                          >
                            Accept
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.removeButton
                          }
                          onPress={() =>
                            rejectConnectionRequest(
                              request
                            )
                          }
                          activeOpacity={0.8}
                          disabled={
                            !!actionLoading
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
                  )
                )}
              </>
            )}

            {/* Your Connections */}
            {connections.length > 0 && (
              <>
                <View
                  style={
                    styles.connectionsHeader
                  }
                >
                  <Text
                    style={styles.sectionTitle}
                  >
                    Your Connections
                  </Text>

                  <Text
                    style={
                      styles.connectionCount
                    }
                  >
                    {connections.length}
                  </Text>
                </View>

                {connections.map(
                  (person) => (
                    <View
                      style={
                        styles.connectionCard
                      }
                      key={person.id}
                    >
                      {/* Clickable Profile */}
                      <TouchableOpacity
                        style={
                          styles.connectionProfileArea
                        }
                        onPress={() =>
                          openProfile(
                            person
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={
                            styles.connectionAvatar
                          }
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
                          style={
                            styles.connectionInfo
                          }
                        >
                          <Text
                            style={
                              styles.connectionName
                            }
                          >
                            {person.name}
                          </Text>

                          <Text
                            style={
                              styles.connectionRole
                            }
                          >
                            {person.role}
                          </Text>

                          <Text
                            style={
                              styles.connectedLabel
                            }
                          >
                            ✓ Connected
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Actions */}
                      <View
                        style={
                          styles.connectionActions
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.messageButton
                          }
                          onPress={() =>
                            openProfile(
                              person
                            )
                          }
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="chatbubble-outline"
                            size={17}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.messageButtonText
                            }
                          >
                            Message
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.removeButton
                          }
                          onPress={() =>
                            removeConnection(
                              person
                            )
                          }
                          activeOpacity={0.8}
                          disabled={
                            !!actionLoading
                          }
                        >
                          <Text
                            style={
                              styles.removeButtonText
                            }
                          >
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )}
              </>
            )}
          </>
        )}

        {/* Networking Benefits */}
        <Text style={styles.sectionTitle}>
          Why Network?
        </Text>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIcon}>
            <Ionicons
              name="briefcase-outline"
              size={23}
              color="#1769AA"
            />
          </View>

          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>
              Discover Opportunities
            </Text>

            <Text
              style={
                styles.benefitDescription
              }
            >
              Learn about career opportunities through your
              professional network.
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIcon}>
            <Ionicons
              name="people-outline"
              size={23}
              color="#1769AA"
            />
          </View>

          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>
              Build Connections
            </Text>

            <Text
              style={
                styles.benefitDescription
              }
            >
              Meet professionals and alumni who can support
              your career journey.
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIcon}>
            <Ionicons
              name="trending-up-outline"
              size={23}
              color="#1769AA"
            />
          </View>

          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>
              Grow Your Career
            </Text>

            <Text
              style={
                styles.benefitDescription
              }
            >
              Expand your professional network and gain valuable
              industry knowledge.
            </Text>
          </View>
        </View>

        {/* Back to Dashboard */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() =>
            router.replace(
              '/alumni/dashboard'
            )
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.dashboardButtonText
            }
          >
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

  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: '#0B1F3A',
    fontWeight: '400',
    marginTop: -3,
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

  /* Introduction */

  introCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  introIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1F3A',
    textAlign: 'center',
    marginBottom: 8,
  },

  introDescription: {
    fontSize: 14,
    color: '#526579',
    textAlign: 'center',
    lineHeight: 21,
  },

  /* Stats */

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
    fontWeight: '800',
    color: '#1769AA',
  },

  statLabel: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E2E8F0',
  },

  /* Sections */

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 14,
  },

  /* Search */

  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#344054',
    marginLeft: 10,
  },

  /* People */

  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },

  personProfileArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '800',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  personRole: {
    fontSize: 13,
    color: '#526579',
    marginBottom: 2,
  },

  personCompany: {
    fontSize: 11,
    color: '#667085',
  },

  viewProfileText: {
    fontSize: 10,
    color: '#1769AA',
    fontWeight: '700',
    marginTop: 4,
  },

  connectButton: {
    backgroundColor: '#1769AA',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginLeft: 8,
  },

  connectedButton: {
    backgroundColor: '#E8F7EE',
    borderWidth: 1,
    borderColor: '#4CAF70',
  },

  requestSentButton: {
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

  requestSentText: {
    color: '#31834B',
  },

  /* Empty */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F3A',
    marginTop: 10,
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 19,
  },

  /* Loading */

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },

  loadingText: {
    fontSize: 13,
    color: '#667085',
    marginTop: 10,
  },

  /* Connections */

  connectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  connectionCount: {
    backgroundColor: '#E7EEF7',
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 14,
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1769AA',
  },

  connectionProfileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  connectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  connectionAvatarText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '800',
  },

  connectionInfo: {
    flex: 1,
  },

  connectionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  connectionRole: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 4,
  },

  connectedLabel: {
    fontSize: 11,
    color: '#31834B',
    fontWeight: '600',
  },

  connectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageButton: {
    flex: 1,
    backgroundColor: '#1769AA',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginRight: 8,
  },

  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  removeButton: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  removeButtonText: {
    color: '#C94A4A',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Benefits */

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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  benefitInfo: {
    flex: 1,
  },

  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 5,
  },

  benefitDescription: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 18,
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

