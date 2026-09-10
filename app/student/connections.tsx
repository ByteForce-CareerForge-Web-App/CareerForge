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

type Person = {
  id: string;
  name: string;
  role: string;
  programme: string;
  initials: string;
};

const PEOPLE_KEY = 'careerforge_connection_people';
const REQUESTS_KEY = 'careerforge_connection_requests';
const SENT_KEY = 'careerforge_sent_requests';
const CONNECTIONS_KEY = 'careerforge_connections';

const defaultPeople: Person[] = [
  {
    id: '1',
    name: 'Sarah Williams',
    role: 'Alumni',
    programme: 'Data Analyst',
    initials: 'SW',
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student',
    programme: 'BSc Data Science',
    initials: 'MN',
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Alumni',
    programme: 'Software Developer',
    initials: 'JS',
  },
  {
    id: '4',
    name: 'Daniel Kumar',
    role: 'Alumni',
    programme: 'Business Analyst',
    initials: 'DK',
  },
];

export default function ConnectionsScreen() {
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [requests, setRequests] = useState<Person[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [connections, setConnections] = useState<Person[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const loadConnections = async () => {
    try {
      const storedPeople = await AsyncStorage.getItem(PEOPLE_KEY);
      const storedRequests = await AsyncStorage.getItem(REQUESTS_KEY);
      const storedSent = await AsyncStorage.getItem(SENT_KEY);
      const storedConnections = await AsyncStorage.getItem(CONNECTIONS_KEY);

      if (storedPeople) {
        setPeople(JSON.parse(storedPeople));
      } else {
        await AsyncStorage.setItem(
          PEOPLE_KEY,
          JSON.stringify(defaultPeople)
        );
      }

      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      } else {
        // Give the demo one incoming request
        const initialRequest = [defaultPeople[3]];
        setRequests(initialRequest);
        await AsyncStorage.setItem(
          REQUESTS_KEY,
          JSON.stringify(initialRequest)
        );
      }

      if (storedSent) {
        setSentRequests(JSON.parse(storedSent));
      }

      if (storedConnections) {
        setConnections(JSON.parse(storedConnections));
      }
    } catch (error) {
      console.log('Error loading connections:', error);
    }
  };

  const saveConnections = async (updated: Person[]) => {
    setConnections(updated);

    await AsyncStorage.setItem(
      CONNECTIONS_KEY,
      JSON.stringify(updated)
    );
  };

  const sendRequest = async (person: Person) => {
    if (sentRequests.includes(person.id)) {
      return;
    }

    const updatedSent = [...sentRequests, person.id];

    setSentRequests(updatedSent);

    await AsyncStorage.setItem(
      SENT_KEY,
      JSON.stringify(updatedSent)
    );

    Alert.alert(
      'Connection Request Sent',
      `Your connection request was sent to ${person.name}.`
    );
  };

  const acceptRequest = async (person: Person) => {
    const updatedRequests = requests.filter(
      item => item.id !== person.id
    );

    const alreadyConnected = connections.some(
      item => item.id === person.id
    );

    const updatedConnections = alreadyConnected
      ? connections
      : [...connections, person];

    setRequests(updatedRequests);

    await AsyncStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(updatedRequests)
    );

    await saveConnections(updatedConnections);

    Alert.alert(
      'Connected!',
      `You are now connected with ${person.name}.`
    );
  };

  const declineRequest = async (person: Person) => {
    const updatedRequests = requests.filter(
      item => item.id !== person.id
    );

    setRequests(updatedRequests);

    await AsyncStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(updatedRequests)
    );

    Alert.alert(
      'Request Declined',
      `The connection request from ${person.name} was declined.`
    );
  };

  const isConnected = (id: string) => {
    return connections.some(person => person.id === id);
  };

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.programme.toLowerCase().includes(search.toLowerCase()) ||
    person.role.toLowerCase().includes(search.toLowerCase())
  );

  const availablePeople = filteredPeople.filter(
    person =>
      !isConnected(person.id) &&
      !requests.some(request => request.id === person.id)
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
          <Text style={styles.headerTitle}>Connections</Text>
          <Text style={styles.headerSubtitle}>
            Build your professional network
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔎</Text>

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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Connection Requests
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {requests.length}
                </Text>
              </View>
            </View>

            {requests.map(person => (
              <View key={person.id} style={styles.card}>

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
                    {person.role} • {person.programme}
                  </Text>

                  <View style={styles.requestButtons}>
                    <Pressable
                      style={styles.acceptButton}
                      onPress={() => acceptRequest(person)}
                    >
                      <Text style={styles.acceptText}>
                        Accept
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.declineButton}
                      onPress={() => declineRequest(person)}
                    >
                      <Text style={styles.declineText}>
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

          {availablePeople.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>
                No new people found
              </Text>
              <Text style={styles.emptyText}>
                Try another search or check back later.
              </Text>
            </View>
          ) : (
            availablePeople.map(person => {
              const pending = sentRequests.includes(person.id);

              return (
                <View key={person.id} style={styles.card}>

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

                    <Text style={styles.programme}>
                      {person.programme}
                    </Text>

                    <Pressable
                      disabled={pending}
                      onPress={() => sendRequest(person)}
                      style={[
                        styles.connectButton,
                        pending && styles.pendingButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.connectText,
                          pending && styles.pendingText,
                        ]}
                      >
                        {pending ? 'Request Sent' : '+ Connect'}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              My Connections
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {connections.length}
              </Text>
            </View>
          </View>

          {connections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🤝</Text>

              <Text style={styles.emptyTitle}>
                No connections yet
              </Text>

              <Text style={styles.emptyText}>
                Start connecting with students and alumni
                to grow your professional network.
              </Text>
            </View>
          ) : (
            connections.map(person => (
  <View
    key={person.id}
    style={styles.connectionCard}
  >
    {/* Avatar */}
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {person.initials}
      </Text>
    </View>

    {/* Person information + actions */}
    <View style={styles.personInfo}>
      <Text style={styles.personName}>
        {person.name}
      </Text>

      <Text style={styles.personRole}>
        {person.role}
      </Text>

      <Text style={styles.programme}>
        {person.programme}
      </Text>

      {/* Connection Actions */}
      <View style={styles.connectionActions}>

        {/* View Profile */}
        <Pressable
          style={styles.viewProfileButton}
          onPress={() =>
            Alert.alert(
              'Profile',
              `${person.name}\n\n${person.role} • ${person.programme}`
            )
          }
        >
          <Text style={styles.viewProfileText}>
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
                conversationId: person.id,
                name: person.name,
                role: `${person.role} • ${person.programme}`,
                initials: person.initials,
                online: 'true',
              },
            })
          }
        >
          <Text style={styles.messageText}>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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