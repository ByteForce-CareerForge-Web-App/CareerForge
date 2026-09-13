import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const NETWORKING_KEY = 'careerforge_alumni_connections';
const MESSAGES_KEY = 'careerforge_alumni_messages';

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
};

type Conversation = {
  personId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
};

const people: Person[] = [
  {
    id: 'jordan-daniels',
    initials: 'JD',
    name: 'Jordan Daniels',
    role: 'Software Developer',
    company: 'Technology Professional',
  },
  {
    id: 'sarah-mokoena',
    initials: 'SM',
    name: 'Sarah Mokoena',
    role: 'Data Analyst',
    company: 'Data & Analytics',
  },
  {
    id: 'thabo-ndlovu',
    initials: 'TN',
    name: 'Thabo Ndlovu',
    role: 'Project Manager',
    company: 'Business & Technology',
  },
  {
    id: 'amanda-khumalo',
    initials: 'AK',
    name: 'Amanda Khumalo',
    role: 'UX/UI Designer',
    company: 'Digital Design',
  },
  {
    id: 'michael-naidoo',
    initials: 'MN',
    name: 'Michael Naidoo',
    role: 'Cybersecurity Analyst',
    company: 'Information Security',
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadMessages = useCallback(async () => {
    try {
      const savedConnections =
        await AsyncStorage.getItem(NETWORKING_KEY);

      if (savedConnections) {
        setConnections(JSON.parse(savedConnections));
      } else {
        setConnections([]);
      }

      const savedMessages =
        await AsyncStorage.getItem(MESSAGES_KEY);

      if (savedMessages) {
        setConversations(JSON.parse(savedMessages));
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const connectedPeople = people.filter((person) =>
    connections.includes(person.id)
  );

  const getConversation = (
    personId: string
  ): Conversation | undefined => {
    return conversations.find(
      (conversation) =>
        conversation.personId === personId
    );
  };

  const openChat = async (person: Person) => {
    router.push({
      pathname: '/alumni/chat',
      params: {
        personId: person.id,
        initials: person.initials,
        name: person.name,
        role: person.role,
        company: person.company,
      },
    });
  };

  const filteredPeople = connectedPeople.filter(
    (person) => {
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
          .includes(query)
      );
    }
  );

  const sortedPeople = [...filteredPeople].sort(
    (a, b) => {
      const conversationA = getConversation(a.id);
      const conversationB = getConversation(b.id);

      if (conversationA && !conversationB) {
        return -1;
      }

      if (!conversationA && conversationB) {
        return 1;
      }

      return 0;
    }
  );

  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total + conversation.unread,
    0
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
              {connectedPeople.length}
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

        {sortedPeople.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={34}
                color="#1769AA"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No conversations yet
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

                    {conversation && (
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
        {connectedPeople.length > 0 && (
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
