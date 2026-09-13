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

  /*
   * Creates a consistent connection object.
   * This is important because connections can
   * come from different parts of the frontend.
   */
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

      /*
       * Combine both sources but identify a person
       * using BOTH id and name.
       */
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

  /*
   * VIEW PROFILE
   *
   * Candidate Profile already knows how to find
   * the real candidate using the name.
   *
   * Therefore we pass the name for EVERY connection.
   */
  const openProfile = (person: Person) => {
  router.push({
    pathname: '/business/candidate-profile',
    params: {
      name: person.name,
      opportunity: person.programme || person.role,
    },
  });
};

  /*
   * MESSAGE
   *
   * Every connection uses the same Messages route.
   */
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
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
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
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#64748B"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* CONNECTION REQUESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Connection Requests
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {requests.length}
              </Text>
            </View>
          </View>

          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No connection requests
              </Text>

              <Text style={styles.emptyText}>
                You do not have any pending
                connection requests.
              </Text>
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

                    <Text style={styles.personRole}>
                      {person.role}
                    </Text>

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

                <View style={styles.requestButtons}>
                  <Pressable
                    style={styles.declineButton}
                    onPress={() =>
                      declineRequest(person)
                    }
                  >
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
          <Text style={styles.sectionTitle}>
            People You May Know
          </Text>

          {availablePeople.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No people found
              </Text>

              <Text style={styles.emptyText}>
                Try searching for someone else.
              </Text>
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

                      <Text style={styles.personRole}>
                        {person.role}
                      </Text>

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
            <Text style={styles.sectionTitle}>
              My Connections
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {connections.length}
              </Text>
            </View>
          </View>

          {connections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No connections yet
              </Text>

              <Text style={styles.emptyText}>
                Start connecting with students
                and alumni to build your
                professional network.
              </Text>
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

                    <Text style={styles.personRole}>
                      {person.role}
                    </Text>

                    <Text
                      style={
                        styles.personProgramme
                      }
                    >
                      {person.programme ||
                        'Professional Connection'}
                    </Text>

                    {person.email && (
                      <Text
                        style={styles.personEmail}
                      >
                        {person.email}
                      </Text>
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
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    marginLeft: 9,
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
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0ECFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
    paddingHorizontal: 7,
  },

  countText: {
    color: '#1E4B7A',
    fontSize: 12,
    fontWeight: '800',
  },

  personCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  personTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 15,
    fontWeight: '900',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  personRole: {
    color: '#475569',
    fontSize: 13,
    marginTop: 3,
  },

  personProgramme: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },

  personEmail: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },

  connectedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
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

  requestButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  declineButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },

  acceptButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  connectButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
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

  connectionButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  viewButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  viewText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },

  messageButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  messageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },
});
