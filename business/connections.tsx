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
import { Ionicons } from '@expo/vector-icons';

type Person = {
  id: string;
  name: string;
  role: string;
  programme?: string;
  initials: string;
  email?: string;
  connectedAt?: string;
};

const PEOPLE_KEY = 'careerforge_connection_people';
const REQUESTS_KEY = 'careerforge_connection_requests';
const SENT_KEY = 'careerforge_sent_requests';

const CONNECTIONS_KEY =
  'careerforge_business_connections';

const LEGACY_CONNECTIONS_KEY =
  'careerforge_connections';

const defaultPeople: Person[] = [
  {
    id: 'demo-sarah',
    name: 'Sarah Williams',
    role: 'Alumni',
    programme: 'Data Analyst',
    initials: 'SW',
  },
  {
    id: 'demo-michael',
    name: 'Michael Naidoo',
    role: 'Student',
    programme: 'BSc Data Science',
    initials: 'MN',
  },
  {
    id: 'demo-jessica',
    name: 'Jessica Smith',
    role: 'Alumni',
    programme: 'Software Developer',
    initials: 'JS',
  },
  {
    id: 'demo-daniel',
    name: 'Daniel Kumar',
    role: 'Alumni',
    programme: 'Business Analyst',
    initials: 'DK',
  },
];

export default function BusinessConnectionsScreen() {
  const [people, setPeople] =
    useState<Person[]>(defaultPeople);

  const [requests, setRequests] =
    useState<Person[]>([]);

  const [sentRequests, setSentRequests] =
    useState<string[]>([]);

  const [connections, setConnections] =
    useState<Person[]>([]);

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const normalisePerson = (
    person: any
  ): Person => {
    const name =
      person?.name || 'Professional Connection';

    const initials =
      person?.initials ||
      name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return {
      id:
        person?.id ||
        `connection-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`,
      name,
      role:
        person?.role ||
        'Professional Connection',
      programme:
        person?.programme ||
        person?.applied ||
        'Professional Network',
      initials,
      email: person?.email || undefined,
      connectedAt:
        person?.connectedAt ||
        new Date().toISOString(),
    };
  };

  const loadConnections = async () => {
    try {
      const storedPeople =
        await AsyncStorage.getItem(PEOPLE_KEY);

      const storedRequests =
        await AsyncStorage.getItem(REQUESTS_KEY);

      const storedSent =
        await AsyncStorage.getItem(SENT_KEY);

      const storedBusinessConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      const storedLegacyConnections =
        await AsyncStorage.getItem(
          LEGACY_CONNECTIONS_KEY
        );

      if (storedPeople) {
        try {
          const parsedPeople = JSON.parse(
            storedPeople
          );

          setPeople(
            parsedPeople.map(normalisePerson)
          );
        } catch {
          setPeople(defaultPeople);
        }
      }

      if (storedRequests) {
        try {
          const parsedRequests =
            JSON.parse(storedRequests);

          setRequests(
            parsedRequests.map(normalisePerson)
          );
        } catch {
          setRequests([]);
        }
      } else {
        const defaultRequest =
          normalisePerson({
            ...defaultPeople[3],
          });

        const defaultRequests = [
          defaultRequest,
        ];

        setRequests(defaultRequests);

        await AsyncStorage.setItem(
          REQUESTS_KEY,
          JSON.stringify(defaultRequests)
        );
      }

      if (storedSent) {
        try {
          setSentRequests(
            JSON.parse(storedSent)
          );
        } catch {
          setSentRequests([]);
        }
      }

      const businessConnections: Person[] =
        storedBusinessConnections
          ? JSON.parse(
              storedBusinessConnections
            ).map(normalisePerson)
          : [];

      const legacyConnections: Person[] =
        storedLegacyConnections
          ? JSON.parse(
              storedLegacyConnections
            ).map(normalisePerson)
          : [];

      const combinedConnections: Person[] = [];

      [
        ...businessConnections,
        ...legacyConnections,
      ].forEach((person) => {
        const normalised =
          normalisePerson(person);

        const exists =
          combinedConnections.some(
            (existing) =>
              existing.id === normalised.id &&
              existing.name === normalised.name
          );

        if (!exists) {
          combinedConnections.push(
            normalised
          );
        }
      });

      setConnections(
        combinedConnections
      );
    } catch (error) {
      console.log(
        'Error loading connections:',
        error
      );
    }
  };

  const saveConnections = async (
    updated: Person[]
  ) => {
    try {
      await AsyncStorage.setItem(
        CONNECTIONS_KEY,
        JSON.stringify(
          updated.map(normalisePerson)
        )
      );
    } catch (error) {
      console.log(
        'Error saving connections:',
        error
      );
    }
  };

  const sendRequest = async (
    person: Person
  ) => {
    if (
      sentRequests.includes(person.id)
    ) {
      return;
    }

    const updatedSent = [
      ...sentRequests,
      person.id,
    ];

    setSentRequests(updatedSent);

    try {
      await AsyncStorage.setItem(
        SENT_KEY,
        JSON.stringify(updatedSent)
      );

      Alert.alert(
        'Connection Request Sent',
        `Your connection request has been sent to ${person.name}.`
      );
    } catch (error) {
      console.log(
        'Error sending request:',
        error
      );
    }
  };

  const acceptRequest = async (
    person: Person
  ) => {
    const updatedRequests =
      requests.filter(
        (item) =>
          !(
            item.id === person.id &&
            item.name === person.name
          )
      );

    const normalised =
      normalisePerson(person);

    const alreadyConnected =
      connections.some(
        (item) =>
          item.id === normalised.id &&
          item.name === normalised.name
      );

    const updatedConnections =
      alreadyConnected
        ? connections
        : [
            ...connections,
            normalised,
          ];

    setRequests(updatedRequests);
    setConnections(
      updatedConnections
    );

    try {
      await AsyncStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(updatedRequests)
      );

      await saveConnections(
        updatedConnections
      );

      Alert.alert(
        'Connection Added',
        `${person.name} has been added to your connections.`
      );
    } catch (error) {
      console.log(
        'Error accepting request:',
        error
      );
    }
  };

  const declineRequest = async (
    person: Person
  ) => {
    const updatedRequests =
      requests.filter(
        (item) =>
          !(
            item.id === person.id &&
            item.name === person.name
          )
      );

    setRequests(updatedRequests);

    try {
      await AsyncStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(updatedRequests)
      );

      Alert.alert(
        'Request Declined',
        `The connection request from ${person.name} was declined.`
      );
    } catch (error) {
      console.log(
        'Error declining request:',
        error
      );
    }
  };

  const isConnected = (
    person: Person
  ) => {
    return connections.some(
      (connection) =>
        connection.id === person.id &&
        connection.name === person.name
    );
  };

  const filteredPeople =
    people.filter((person) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        person.name
          .toLowerCase()
          .includes(searchText) ||
        person.role
          .toLowerCase()
          .includes(searchText) ||
        (person.programme || '')
          .toLowerCase()
          .includes(searchText)
      );
    });

  const availablePeople =
    filteredPeople.filter(
      (person) =>
        !isConnected(person) &&
        !requests.some(
          (request) =>
            request.id === person.id &&
            request.name === person.name
        )
    );

  const openProfile = (person: Person) => {
    router.push({
      pathname: '/business/candidate-profile',
      params: {
        name: person.name,
        opportunity: person.programme || person.role,
      },
    });
  };

  const openMessage = (
    person: Person
  ) => {
    router.push({
      pathname: '/business/chat',
      params: {
        conversationId:
          person.id,
        name: person.name,
        role:
          person.role ||
          'Professional Connection',
        initials:
          person.initials,
        online: 'true',
      },
    });
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              PROFESSIONAL NETWORK
            </Text>

            <Text style={styles.headerTitle}>
              Connections
            </Text>

            <Text style={styles.headerSubtitle}>
              Build your professional network
            </Text>
          </View>
        </View>

        <View style={styles.headerAccent} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* CONNECTION REQUESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionIconBlue}>
                <Ionicons
                  name="person-add-outline"
                  size={18}
                  color="#2563EB"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Connection Requests
                </Text>

                <Text style={styles.sectionSubtitle}>
                  People waiting for your response
                </Text>
              </View>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {requests.length}
              </Text>
            </View>
          </View>

          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={26}
                  color="#64748B"
                />
              </View>

              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>
                  No connection requests
                </Text>

                <Text style={styles.emptyText}>
                  You do not have any pending
                  connection requests.
                </Text>
              </View>
            </View>
          ) : (
            requests.map((person) => (
              <View
                key={`${person.id}-${person.name}`}
                style={styles.personCard}
              >
                <View style={styles.personTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {person.initials}
                    </Text>
                  </View>

                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>
                      {person.name}
                    </Text>

                    <View style={styles.roleRow}>
                      <Ionicons
                        name="briefcase-outline"
                        size={13}
                        color="#64748B"
                      />

                      <Text style={styles.personRole}>
                        {person.role}
                      </Text>
                    </View>

                    <View style={styles.programmeRow}>
                      <Ionicons
                        name="school-outline"
                        size={13}
                        color="#94A3B8"
                      />

                      <Text
                        style={
                          styles.personProgramme
                        }
                      >
                        {person.programme ||
                          'Professional Connection'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.requestButtons}>
                  <Pressable
                    style={styles.declineButton}
                    onPress={() =>
                      declineRequest(person)
                    }
                  >
                    <Ionicons
                      name="close-outline"
                      size={17}
                      color="#475569"
                    />

                    <Text style={styles.declineText}>
                      Decline
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.acceptButton}
                    onPress={() =>
                      acceptRequest(person)
                    }
                  >
                    <Ionicons
                      name="checkmark-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text style={styles.acceptText}>
                      Accept
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* PEOPLE YOU MAY KNOW */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionIconGold}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color="#B88A17"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  People You May Know
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Expand your professional network
                </Text>
              </View>
            </View>
          </View>

          {availablePeople.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={25}
                  color="#64748B"
                />
              </View>

              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>
                  No people found
                </Text>

                <Text style={styles.emptyText}>
                  Try searching for someone else.
                </Text>
              </View>
            </View>
          ) : (
            availablePeople.map((person) => {
              const requestSent =
                sentRequests.includes(
                  person.id
                );

              return (
                <View
                  key={`${person.id}-${person.name}`}
                  style={styles.personCard}
                >
                  <View style={styles.personTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {person.initials}
                      </Text>
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {person.name}
                      </Text>

                      <View style={styles.roleRow}>
                        <Ionicons
                          name="briefcase-outline"
                          size={13}
                          color="#64748B"
                        />

                        <Text style={styles.personRole}>
                          {person.role}
                        </Text>
                      </View>

                      <View style={styles.programmeRow}>
                        <Ionicons
                          name="school-outline"
                          size={13}
                          color="#94A3B8"
                        />

                        <Text
                          style={
                            styles.personProgramme
                          }
                        >
                          {person.programme ||
                            'Professional Connection'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={[
                      styles.connectButton,
                      requestSent &&
                        styles.requestSentButton,
                    ]}
                    disabled={requestSent}
                    onPress={() =>
                      sendRequest(person)
                    }
                  >
                    <Ionicons
                      name={
                        requestSent
                          ? 'time-outline'
                          : 'person-add-outline'
                      }
                      size={17}
                      color={
                        requestSent
                          ? '#64748B'
                          : '#FFFFFF'
                      }
                    />

                    <Text
                      style={[
                        styles.connectText,
                        requestSent &&
                          styles.requestSentText,
                      ]}
                    >
                      {requestSent
                        ? 'Request Sent'
                        : 'Connect'}
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* MY CONNECTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionIconGreen}>
                <Ionicons
                  name="people-circle-outline"
                  size={19}
                  color="#059669"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  My Connections
                </Text>

                <Text style={styles.sectionSubtitle}>
                  People in your professional network
                </Text>
              </View>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {connections.length}
              </Text>
            </View>
          </View>

          {connections.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={26}
                  color="#64748B"
                />
              </View>

              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>
                  No connections yet
                </Text>

                <Text style={styles.emptyText}>
                  Start connecting with students
                  and alumni to build your
                  professional network.
                </Text>
              </View>
            </View>
          ) : (
            connections.map((person) => (
              <View
                key={`${person.id}-${person.name}`}
                style={styles.personCard}
              >
                <View style={styles.personTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {person.initials}
                    </Text>
                  </View>

                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>
                      {person.name}
                    </Text>

                    <View style={styles.roleRow}>
                      <Ionicons
                        name="briefcase-outline"
                        size={13}
                        color="#64748B"
                      />

                      <Text style={styles.personRole}>
                        {person.role}
                      </Text>
                    </View>

                    <View style={styles.programmeRow}>
                      <Ionicons
                        name="school-outline"
                        size={13}
                        color="#94A3B8"
                      />

                      <Text
                        style={
                          styles.personProgramme
                        }
                      >
                        {person.programme ||
                          'Professional Connection'}
                      </Text>
                    </View>

                    {person.email && (
                      <View style={styles.emailRow}>
                        <Ionicons
                          name="mail-outline"
                          size={12}
                          color="#94A3B8"
                        />

                        <Text
                          style={
                            styles.personEmail
                          }
                        >
                          {person.email}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={styles.connectedBadge}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#15803D"
                  />

                  <Text
                    style={
                      styles.connectedBadgeText
                    }
                  >
                    Connected
                  </Text>
                </View>

                <View
                  style={styles.connectionButtons}
                >
                  <Pressable
                    style={styles.viewButton}
                    onPress={() =>
                      openProfile(person)
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={17}
                      color="#334155"
                    />

                    <Text style={styles.viewText}>
                      View Profile
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#94A3B8"
                    />
                  </Pressable>

                  <Pressable
                    style={styles.messageButton}
                    onPress={() =>
                      openMessage(person)
                    }
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.messageText}
                    >
                      Message
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9FB3CC',
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  headerAccent: {
    height: 3,
    width: 48,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 14,
    marginLeft: 54,
  },

  /* CONTENT */

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  /* SEARCH */

  searchContainer: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 23,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  searchIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    marginLeft: 9,
  },

  clearButton: {
    padding: 5,
  },

  /* SECTIONS */

  section: {
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sectionIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionIconGold: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionIconGreen: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0ECFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },

  countText: {
    color: '#1E4B7A',
    fontSize: 12,
    fontWeight: '800',
  },

  /* PERSON CARD */

  personCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  personTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: '#D5E2F2',
  },

  avatarText: {
    color: '#1E4B7A',
    fontSize: 15,
    fontWeight: '900',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  personRole: {
    color: '#475569',
    fontSize: 12,
    marginLeft: 5,
  },

  programmeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  personProgramme: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 5,
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  personEmail: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 5,
  },

  /* REQUEST BUTTONS */

  requestButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },

  declineButton: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  declineText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },

  acceptButton: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* CONNECT */

  connectButton: {
    height: 42,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 15,
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  requestSentButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  requestSentText: {
    color: '#64748B',
  },

  /* CONNECTION STATUS */

  connectedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 12,
  },

  connectedBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  /* CONNECTION BUTTONS */

  connectionButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  viewButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  viewText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },

  messageButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  messageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* EMPTY STATES */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  emptyContent: {
    flex: 1,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  bottomSpace: {
    height: 20,
  },
});