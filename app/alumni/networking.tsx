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
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NETWORKING_KEY = 'careerforge_alumni_connections';

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  skills: string;
};

const people: Person[] = [
  {
    id: 'jordan-daniels',
    initials: 'JD',
    name: 'Jordan Daniels',
    role: 'Software Developer',
    company: 'Technology Professional',
    skills: 'React, JavaScript, Software Development',
  },
  {
    id: 'sarah-mokoena',
    initials: 'SM',
    name: 'Sarah Mokoena',
    role: 'Data Analyst',
    company: 'Data & Analytics',
    skills: 'Python, SQL, Data Analysis',
  },
  {
    id: 'thabo-ndlovu',
    initials: 'TN',
    name: 'Thabo Ndlovu',
    role: 'Project Manager',
    company: 'Business & Technology',
    skills: 'Project Management, Leadership, Agile',
  },
  {
    id: 'amanda-khumalo',
    initials: 'AK',
    name: 'Amanda Khumalo',
    role: 'UX/UI Designer',
    company: 'Digital Design',
    skills: 'Figma, UX Design, UI Design',
  },
  {
    id: 'michael-naidoo',
    initials: 'MN',
    name: 'Michael Naidoo',
    role: 'Cybersecurity Analyst',
    company: 'Information Security',
    skills: 'Cybersecurity, Networking, Security',
  },
];

export default function NetworkingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<string[]>([]);

  const loadConnections = useCallback(async () => {
    try {
      const savedConnections =
        await AsyncStorage.getItem(NETWORKING_KEY);

      if (savedConnections) {
        setConnections(JSON.parse(savedConnections));
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.log('Error loading connections:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [loadConnections])
  );

  const saveConnections = async (
    updatedConnections: string[]
  ) => {
    try {
      await AsyncStorage.setItem(
        NETWORKING_KEY,
        JSON.stringify(updatedConnections)
      );

      setConnections(updatedConnections);
    } catch (error) {
      console.log('Error saving connections:', error);
    }
  };

  const handleConnect = (person: Person) => {
    const isConnected = connections.includes(person.id);

    if (isConnected) {
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
            onPress: () => {
              const updatedConnections =
                connections.filter(
                  (id) => id !== person.id
                );

              saveConnections(updatedConnections);
            },
          },
        ]
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
          onPress: () => {
            const updatedConnections = [
              ...connections,
              person.id,
            ];

            saveConnections(updatedConnections);

            Alert.alert(
              'Connection Added',
              `You are now connected with ${person.name}.`
            );
          },
        },
      ]
    );
  };

  const openProfile = (person: Person) => {
    if (!connections.includes(person.id)) {
      return;
    }

    router.push({
      pathname: '/alumni/connection-profile',
      params: {
        id: person.id,
        initials: person.initials,
        name: person.name,
        role: person.role,
        company: person.company,
        skills: person.skills,
      },
    });
  };

  const filteredPeople = people.filter((person) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      person.name.toLowerCase().includes(query) ||
      person.role.toLowerCase().includes(query) ||
      person.company.toLowerCase().includes(query) ||
      person.skills.toLowerCase().includes(query)
    );
  });

  const connectedPeople = people.filter((person) =>
    connections.includes(person.id)
  );

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
            <Text style={styles.title}>My Network</Text>

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

        {/* Suggested Connections */}
        <Text style={styles.sectionTitle}>
          {searchQuery
            ? 'Search Results'
            : 'Suggested Connections'}
        </Text>

        {filteredPeople.length === 0 ? (
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
          filteredPeople.map((person) => {
            const isConnected =
              connections.includes(person.id);

            return (
              <View
                style={styles.personCard}
                key={person.id}
              >
                {/* Profile Area */}
                <TouchableOpacity
                  style={styles.personProfileArea}
                  onPress={() => openProfile(person)}
                  activeOpacity={isConnected ? 0.7 : 1}
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

                    {isConnected && (
                      <Text style={styles.viewProfileText}>
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
                  ]}
                  onPress={() =>
                    handleConnect(person)
                  }
                  activeOpacity={0.8}
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
            <View style={styles.connectionsHeader}>
              <Text style={styles.sectionTitle}>
                Your Connections
              </Text>

              <Text style={styles.connectionCount}>
                {connectedPeople.length}
              </Text>
            </View>

            {connectedPeople.map((person) => (
              <View
                style={styles.connectionCard}
                key={person.id}
              >
                {/* Clickable Profile */}
                <TouchableOpacity
                  style={styles.connectionProfileArea}
                  onPress={() =>
                    openProfile(person)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.connectionAvatar}>
                    <Text
                      style={
                        styles.connectionAvatarText
                      }
                    >
                      {person.initials}
                    </Text>
                  </View>

                  <View style={styles.connectionInfo}>
                    <Text style={styles.connectionName}>
                      {person.name}
                    </Text>

                    <Text style={styles.connectionRole}>
                      {person.role}
                    </Text>

                    <Text style={styles.connectedLabel}>
                      ✓ Connected
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.connectionActions}>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() =>
                      openProfile(person)
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text style={styles.messageButtonText}>
                      Message
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      handleConnect(person)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removeButtonText}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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

            <Text style={styles.benefitDescription}>
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

            <Text style={styles.benefitDescription}>
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

            <Text style={styles.benefitDescription}>
              Expand your professional network and gain valuable
              industry knowledge.
            </Text>
          </View>
        </View>

        {/* Back to Dashboard */}
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

  connectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  connectedText: {
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
