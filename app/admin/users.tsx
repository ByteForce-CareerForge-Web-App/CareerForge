import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

type UserRole = 'Student' | 'Alumni' | 'Business';
type UserStatus = 'Active' | 'Suspended';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
};

const USERS_STORAGE_KEY = 'careerforge_admin_users';

const DEFAULT_USERS: User[] = [
  {
    id: 'student-1',
    name: 'Sarah Adams',
    email: 'sarah.adams@student.com',
    role: 'Student',
    status: 'Active',
    joined: '3 September 2026',
  },
  {
    id: 'student-2',
    name: 'Michael Naidoo',
    email: 'michael.naidoo@student.com',
    role: 'Student',
    status: 'Active',
    joined: '2 September 2026',
  },
  {
    id: 'student-3',
    name: 'Jessica Smith',
    email: 'jessica.smith@student.com',
    role: 'Student',
    status: 'Suspended',
    joined: '30 August 2026',
  },
  {
    id: 'alumni-1',
    name: 'David Williams',
    email: 'david.williams@alumni.com',
    role: 'Alumni',
    status: 'Active',
    joined: '1 September 2026',
  },
  {
    id: 'alumni-2',
    name: 'Amanda Naidoo',
    email: 'amanda.naidoo@alumni.com',
    role: 'Alumni',
    status: 'Active',
    joined: '29 August 2026',
  },
  {
    id: 'alumni-3',
    name: 'Jason Pillay',
    email: 'jason.pillay@alumni.com',
    role: 'Alumni',
    status: 'Suspended',
    joined: '27 August 2026',
  },
  {
    id: 'business-1',
    name: 'TechNova Solutions',
    email: 'contact@technova.com',
    role: 'Business',
    status: 'Active',
    joined: '3 September 2026',
  },
  {
    id: 'business-2',
    name: 'DataEdge Analytics',
    email: 'hello@dataedge.com',
    role: 'Business',
    status: 'Active',
    joined: '1 September 2026',
  },
  {
    id: 'business-3',
    name: 'FutureTech Africa',
    email: 'info@futuretech.com',
    role: 'Business',
    status: 'Suspended',
    joined: '28 August 2026',
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  const [selectedFilter, setSelectedFilter] =
    useState<'All' | UserRole | UserStatus>('All');

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  async function loadUsers() {
    try {
      const stored = await AsyncStorage.getItem(
        USERS_STORAGE_KEY
      );

      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          USERS_STORAGE_KEY,
          JSON.stringify(DEFAULT_USERS)
        );

        setUsers(DEFAULT_USERS);
      }
    } catch (error) {
      console.log('Error loading users:', error);
    }
  }

  async function updateUserStatus(
    id: string,
    status: UserStatus
  ) {
    try {
      const updatedUsers = users.map((user) =>
        user.id === id
          ? { ...user, status }
          : user
      );

      setUsers(updatedUsers);

      await AsyncStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(updatedUsers)
      );

      const user = users.find(
        (item) => item.id === id
      );

      if (user) {
        Alert.alert(
          status === 'Active'
            ? 'User Activated'
            : 'User Suspended',
          `${user.name} is now ${status.toLowerCase()}.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to update the user status.'
      );
    }
  }

  function handleStatusChange(user: User) {
    const newStatus: UserStatus =
      user.status === 'Active'
        ? 'Suspended'
        : 'Active';

    Alert.alert(
      newStatus === 'Suspended'
        ? 'Suspend User'
        : 'Activate User',
      `Are you sure you want to ${newStatus.toLowerCase()} ${user.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text:
            newStatus === 'Suspended'
              ? 'Suspend'
              : 'Activate',
          style:
            newStatus === 'Suspended'
              ? 'destructive'
              : 'default',
          onPress: () =>
            updateUserStatus(
              user.id,
              newStatus
            ),
        },
      ]
    );
  }

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      user.name
        .toLowerCase()
        .includes(searchText) ||
      user.email
        .toLowerCase()
        .includes(searchText) ||
      user.role
        .toLowerCase()
        .includes(searchText);

    const matchesFilter =
      selectedFilter === 'All' ||
      user.role === selectedFilter ||
      user.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const studentCount = users.filter(
    (user) => user.role === 'Student'
  ).length;

  const alumniCount = users.filter(
    (user) => user.role === 'Alumni'
  ).length;

  const businessCount = users.filter(
    (user) => user.role === 'Business'
  ).length;

  const activeCount = users.filter(
    (user) => user.status === 'Active'
  ).length;

  function getRoleIcon(role: UserRole) {
    if (role === 'Student') {
      return '🎓';
    }

    if (role === 'Alumni') {
      return '👨‍🎓';
    }

    return '🏢';
  }

  function getInitials(name: string) {
    const words = name.split(' ');

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/admin/dashboard');
              }
            }}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              User Management
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage CareerForgeAI platform users
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>

            <Text style={styles.statValue}>
              {users.length}
            </Text>

            <Text style={styles.statLabel}>
              Total Users
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎓</Text>

            <Text style={styles.statValue}>
              {studentCount}
            </Text>

            <Text style={styles.statLabel}>
              Students
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👨‍🎓</Text>

            <Text style={styles.statValue}>
              {alumniCount}
            </Text>

            <Text style={styles.statLabel}>
              Alumni
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏢</Text>

            <Text style={styles.statValue}>
              {businessCount}
            </Text>

            <Text style={styles.statLabel}>
              Businesses
            </Text>
          </View>
        </View>

        {/* Active Users */}
        <View style={styles.activeBanner}>
          <View>
            <Text style={styles.activeTitle}>
              Active Accounts
            </Text>

            <Text style={styles.activeSubtitle}>
              Users currently able to access the platform
            </Text>
          </View>

          <Text style={styles.activeNumber}>
            {activeCount}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {[
            'All',
            'Student',
            'Alumni',
            'Business',
            'Active',
            'Suspended',
          ].map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter &&
                  styles.filterButtonSelected,
              ]}
              onPress={() =>
                setSelectedFilter(
                  filter as
                    | 'All'
                    | UserRole
                    | UserStatus
                )
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                    styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Users heading */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Platform Users
          </Text>

          <Text style={styles.resultsCount}>
            {filteredUsers.length} users
          </Text>
        </View>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔍
            </Text>

            <Text style={styles.emptyTitle}>
              No users found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View
              key={user.id}
              style={styles.userCard}
            >
              {/* User information */}
              <View style={styles.userTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(user.name)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.name}
                  </Text>

                  <Text style={styles.userEmail}>
                    {user.email}
                  </Text>

                  <View style={styles.roleRow}>
                    <Text style={styles.roleIcon}>
                      {getRoleIcon(user.role)}
                    </Text>

                    <Text style={styles.userRole}>
                      {user.role}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    user.status === 'Active'
                      ? styles.activeBadge
                      : styles.suspendedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      user.status === 'Active'
                        ? styles.activeText
                        : styles.suspendedText,
                    ]}
                  >
                    {user.status}
                  </Text>
                </View>
              </View>

              {/* Joined */}
              <Text style={styles.joined}>
                Joined: {user.joined}
              </Text>

              {/* Action */}
              <Pressable
                style={[
                  styles.statusButton,
                  user.status === 'Active'
                    ? styles.suspendButton
                    : styles.activateButton,
                ]}
                onPress={() =>
                  handleStatusChange(user)
                }
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    user.status === 'Active'
                      ? styles.suspendButtonText
                      : styles.activateButtonText,
                  ]}
                >
                  {user.status === 'Active'
                    ? 'Suspend User'
                    : 'Activate User'}
                </Text>
              </Pressable>
            </View>
          ))
        )}

        {/* Back */}
        <Pressable
          style={styles.dashboardButton}
          onPress={() =>
            router.replace('/admin/dashboard')
          }
        >
          <Text style={styles.dashboardButtonText}>
            ← Back to Admin Dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backText: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '700',
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C7D4E3',
    fontSize: 12,
    marginTop: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  statIcon: {
    fontSize: 23,
    marginBottom: 6,
  },

  statValue: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '800',
  },

  statLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },

  activeBanner: {
    backgroundColor: '#0B1F3A',
    borderRadius: 17,
    padding: 16,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  activeSubtitle: {
    color: '#C7D4E3',
    fontSize: 11,
    marginTop: 4,
  },

  activeNumber: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  searchContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 13,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  filterContainer: {
    paddingBottom: 5,
  },

  filterButton: {
    paddingHorizontal: 15,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  filterButtonSelected: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  resultsHeader: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultsTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  resultsCount: {
    color: '#64748B',
    fontSize: 12,
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  userTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  userEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  roleIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  userRole: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  suspendedBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  activeText: {
    color: '#15803D',
  },

  suspendedText: {
    color: '#B91C1C',
  },

  joined: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 12,
  },

  statusButton: {
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  suspendButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  activateButton: {
    backgroundColor: '#0B1F3A',
  },

  statusButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  suspendButtonText: {
    color: '#B91C1C',
  },

  activateButtonText: {
    color: '#FFFFFF',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  dashboardButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  dashboardButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },
});