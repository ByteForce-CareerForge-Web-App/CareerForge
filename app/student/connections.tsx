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

  // Selected person for LinkedIn-style profile view
  const [selectedPerson, setSelectedPerson] =
    useState<Person | null>(null);

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
      const storedConnections =
        await AsyncStorage.getItem(CONNECTIONS_KEY);

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

  /*
   * ==========================================================
   * LINKEDIN-STYLE PROFILE VIEW
   * ==========================================================
   */

  if (selectedPerson) {
    const person = selectedPerson;

    const isAlumni = person.role
      .toLowerCase()
      .includes('alumni');

    return (
      <View style={styles.container}>

        {/* Profile Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setSelectedPerson(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>
              Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Professional profile
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Profile Hero */}
          <View style={styles.profileHero}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {person.initials}
              </Text>
            </View>

            <Text style={styles.profileName}>
              {person.name}
            </Text>

            <Text style={styles.profileRole}>
              {person.programme}
            </Text>

            <Text style={styles.profileType}>
              {person.role}
            </Text>

            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>
                {isAlumni
                  ? 'CareerForgeAI Alumni'
                  : 'CareerForgeAI Student'}
              </Text>
            </View>
          </View>

          {/* Profile Actions */}
          <View style={styles.profileActions}>

            <Pressable
              style={styles.profileMessageButton}
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
              <Text style={styles.profileMessageText}>
                Message
              </Text>
            </Pressable>

            <Pressable
              style={styles.profileBackButton}
              onPress={() => setSelectedPerson(null)}
            >
              <Text style={styles.profileBackText}>
                Back to Network
              </Text>
            </Pressable>

          </View>

          {/* About */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>
              About
            </Text>

            <View style={styles.profileCard}>
              <Text style={styles.profileBodyText}>
                {person.name} is part of the CareerForgeAI
                professional network. Their profile helps
                students and alumni discover professional
                interests, career paths and networking
                opportunities.
              </Text>
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>
              Professional Information
            </Text>

            <View style={styles.profileCard}>

              <View style={styles.profileInfoRow}>
                <View style={styles.profileInfoIcon}>
                  <Text style={styles.profileInfoIconText}>
                    R
                  </Text>
                </View>

                <View style={styles.profileInfoContent}>
                  <Text style={styles.profileInfoLabel}>
                    Role
                  </Text>

                  <Text style={styles.profileInfoValue}>
                    {person.role}
                  </Text>
                </View>
              </View>

              <View style={styles.profileDivider} />

              <View style={styles.profileInfoRow}>
                <View style={styles.profileInfoIcon}>
                  <Text style={styles.profileInfoIconText}>
                    C
                  </Text>
                </View>

                <View style={styles.profileInfoContent}>
                  <Text style={styles.profileInfoLabel}>
                    Profession / Programme
                  </Text>

                  <Text style={styles.profileInfoValue}>
                    {person.programme}
                  </Text>
                </View>
              </View>

              <View style={styles.profileDivider} />

              <View style={styles.profileInfoRow}>
                <View style={styles.profileInfoIcon}>
                  <Text style={styles.profileInfoIconText}>
                    N
                  </Text>
                </View>

                <View style={styles.profileInfoContent}>
                  <Text style={styles.profileInfoLabel}>
                    Network
                  </Text>

                  <Text style={styles.profileInfoValue}>
                    CareerForgeAI
                  </Text>
                </View>
              </View>

            </View>
          </View>

          {/* Skills */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>
              Skills
            </Text>

            <View style={styles.profileCard}>
              <View style={styles.skillsContainer}>

                <View style={styles.skill}>
                  <Text style={styles.skillText}>
                    Communication
                  </Text>
                </View>

                <View style={styles.skill}>
                  <Text style={styles.skillText}>
                    Problem Solving
                  </Text>
                </View>

                <View style={styles.skill}>
                  <Text style={styles.skillText}>
                    Technology
                  </Text>
                </View>

                <View style={styles.skill}>
                  <Text style={styles.skillText}>
                    Professional Development
                  </Text>
                </View>

              </View>
            </View>
          </View>

          {/* Experience */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>
              Experience
            </Text>

            <View style={styles.profileCard}>

              <View style={styles.experienceHeader}>

                <View style={styles.experienceIcon}>
                  <Text style={styles.experienceIconText}>
                    CF
                  </Text>
                </View>

                <View style={styles.experienceContent}>
                  <Text style={styles.experienceTitle}>
                    CareerForgeAI Member
                  </Text>

                  <Text style={styles.experienceSubtitle}>
                    Professional Network
                  </Text>
                </View>

              </View>

              <Text style={styles.profileBodyText}>
                Developing professional connections,
                exploring career opportunities and
                building employability through the
                CareerForgeAI platform.
              </Text>

            </View>
          </View>

          {/* Networking */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>
              Networking
            </Text>

            <View style={styles.networkingCard}>
              <Text style={styles.networkingTitle}>
                Connected on CareerForgeAI
              </Text>

              <Text style={styles.networkingText}>
                You are connected with {person.name}.
                You can now message them and build your
                professional network.
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            CareerForgeAI Professional Network
          </Text>

        </ScrollView>
      </View>
    );
  }

  /*
   * ==========================================================
   * CONNECTIONS LIST
   * ==========================================================
   */

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Search */}
        <View style={styles.searchContainer}>

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
              <View
                key={person.id}
                style={styles.card}
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
                    {person.role} • {person.programme}
                  </Text>

                  <View style={styles.requestButtons}>

                    {/* View Profile */}
                    <Pressable
                      style={styles.requestProfileButton}
                      onPress={() =>
                        setSelectedPerson(person)
                      }
                    >
                      <Text style={styles.requestProfileText}>
                        View Profile
                      </Text>
                    </Pressable>

                    {/* Accept */}
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

                    {/* Decline */}
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

              <Text style={styles.emptyIcon}>
                👥
              </Text>

              <Text style={styles.emptyTitle}>
                No new people found
              </Text>

              <Text style={styles.emptyText}>
                Try another search or check back later.
              </Text>

            </View>
          ) : (
            availablePeople.map(person => {

              const pending =
                sentRequests.includes(person.id);

              return (
                <View
                  key={person.id}
                  style={styles.card}
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

                    <Text style={styles.programme}>
                      {person.programme}
                    </Text>

                    <View style={styles.peopleActions}>
                      <Pressable
                        style={styles.peopleProfileButton}
                        onPress={() => setSelectedPerson(person)}
                      >
                        <Text style={styles.peopleProfileText}>
                          View Profile
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.connectButton,
                          pending && styles.pendingButton,
                        ]}
                        onPress={() => sendRequest(person)}
                        disabled={pending}
                      >
                        <Text
                          style={[
                            styles.connectText,
                            pending && styles.pendingText,
                          ]}
                        >
                          {pending ? 'Pending' : 'Connect'}
                        </Text>
                      </Pressable>
                    </View>

                  </View>
                </View>
              );
            })
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

  /* People You May Know buttons */
  peopleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  peopleProfileButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginRight: 8,
  },

  peopleProfileText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '700',
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

  /* Connection Request buttons */
  requestButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    flexWrap: 'wrap',
  },

  requestProfileButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginRight: 8,
    marginBottom: 4,
  },

  requestProfileText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '700',
  },

  acceptButton: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
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
    marginBottom: 4,
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

  /* My Connections buttons */
  connectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  viewProfileButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginRight: 8,
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

  /*
   * ==========================================================
   * PROFILE VIEW STYLES
   * ==========================================================
   */

  profileHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  profileAvatarText: {
    color: '#1E4B7A',
    fontSize: 28,
    fontWeight: '800',
  },

  profileName: {
    color: '#0B1F3A',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },

  profileRole: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  profileType: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 13,
  },

  memberBadge: {
    backgroundColor: '#E8F0F8',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },

  memberBadgeText: {
    color: '#1E4B7A',
    fontSize: 11,
    fontWeight: '700',
  },

  profileActions: {
    flexDirection: 'row',
    marginBottom: 25,
  },

  profileMessageButton: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 10,
  },

  profileMessageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  profileBackButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
  },

  profileBackText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '700',
  },

  profileSection: {
    marginBottom: 22,
  },

  profileSectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  profileBodyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },

  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  profileInfoIconText: {
    color: '#1E4B7A',
    fontSize: 15,
    fontWeight: '800',
  },

  profileInfoContent: {
    flex: 1,
  },

  profileInfoLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },

  profileInfoValue: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '700',
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skill: {
    backgroundColor: '#EEF4FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  skillText: {
    color: '#1E4B7A',
    fontSize: 11,
    fontWeight: '700',
  },

  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  experienceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  experienceIconText: {
    color: '#1E4B7A',
    fontSize: 12,
    fontWeight: '800',
  },

  experienceContent: {
    flex: 1,
  },

  experienceTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  experienceSubtitle: {
    color: '#64748B',
    fontSize: 12,
  },

  networkingCard: {
    backgroundColor: '#EAF2F9',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D5E3EF',
  },

  networkingTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  networkingText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
    marginBottom: 10,
  },
});
