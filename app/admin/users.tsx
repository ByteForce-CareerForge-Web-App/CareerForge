import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  const suspendedCount = users.filter(
    (user) => user.status === 'Suspended'
  ).length;

  function getRoleIcon(
    role: UserRole
  ): keyof typeof Ionicons.glyphMap {
    if (role === 'Student') {
      return 'school-outline';
    }

    if (role === 'Alumni') {
      return 'briefcase-outline';
    }

    return 'business-outline';
  }

  function getRoleColor(role: UserRole) {
    if (role === 'Student') {
      return '#2457E6';
    }

    if (role === 'Alumni') {
      return '#7C3AED';
    }

    return '#D97706';
  }

  function getRoleBackground(role: UserRole) {
    if (role === 'Student') {
      return '#EAF1FF';
    }

    if (role === 'Alumni') {
      return '#F5F3FF';
    }

    return '#FFF7ED';
  }

  function getInitials(name: string) {
    const words = name.split(' ');

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
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
              <Ionicons
                name="chevron-back"
                size={23}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.headerIcon}>
              <Ionicons
                name="people-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.headerEyebrow}>
              <View style={styles.headerDot} />

              <Text style={styles.headerEyebrowText}>
                ADMIN CONTROL
              </Text>
            </View>

            <Text style={styles.headerTitle}>
              User Management
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage CareerForgeAI platform users
            </Text>
          </View>
        </View>

        {/* QUICK SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#2457E6"
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              Platform access
            </Text>

            <Text style={styles.summaryText}>
              {activeCount} accounts are currently active
            </Text>
          </View>

          <View style={styles.summaryStatus}>
            <View style={styles.summaryStatusDot} />

            <Text style={styles.summaryStatusText}>
              Healthy
            </Text>
          </View>
        </View>

        {/* STATISTICS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              User Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Account distribution across the platform
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="stats-chart-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="people-outline"
                  size={21}
                  color="#2457E6"
                />
              </View>

              <View style={styles.statMiniBadge}>
                <Ionicons
                  name="arrow-up"
                  size={11}
                  color="#16A34A"
                />

                <Text style={styles.statMiniText}>
                  Users
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.statValue}>
                {users.length}
              </Text>

              <Text style={styles.statLabel}>
                Total Users
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIcon,
                  styles.studentIcon,
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={21}
                  color="#2457E6"
                />
              </View>
            </View>

            <View>
              <Text style={styles.statValue}>
                {studentCount}
              </Text>

              <Text style={styles.statLabel}>
                Students
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIcon,
                  styles.alumniIcon,
                ]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={21}
                  color="#7C3AED"
                />
              </View>
            </View>

            <View>
              <Text style={styles.statValue}>
                {alumniCount}
              </Text>

              <Text style={styles.statLabel}>
                Alumni
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIcon,
                  styles.businessIcon,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={21}
                  color="#D97706"
                />
              </View>
            </View>

            <View>
              <Text style={styles.statValue}>
                {businessCount}
              </Text>

              <Text style={styles.statLabel}>
                Businesses
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT STATUS */}
        <View style={styles.statusOverview}>
          <View style={styles.statusOverviewHeader}>
            <View>
              <Text style={styles.statusOverviewTitle}>
                Account Status
              </Text>

              <Text style={styles.statusOverviewSubtitle}>
                Current access levels
              </Text>
            </View>

            <Ionicons
              name="pulse-outline"
              size={21}
              color="#2457E6"
            />
          </View>

          <View style={styles.statusNumbers}>
            <View style={styles.statusNumberBlock}>
              <View style={styles.statusNumberTop}>
                <View style={styles.greenDot} />

                <Text style={styles.statusNumberLabel}>
                  Active
                </Text>
              </View>

              <Text style={styles.statusNumberValue}>
                {activeCount}
              </Text>
            </View>

            <View style={styles.statusDivider} />

            <View style={styles.statusNumberBlock}>
              <View style={styles.statusNumberTop}>
                <View style={styles.redDot} />

                <Text style={styles.statusNumberLabel}>
                  Suspended
                </Text>
              </View>

              <Text style={styles.statusNumberValue}>
                {suspendedCount}
              </Text>
            </View>
          </View>

          <View style={styles.statusBar}>
            <View
              style={[
                styles.statusBarActive,
                {
                  width:
                    users.length > 0
                      ? `${(activeCount / users.length) * 100}%`
                      : '0%',
                },
              ]}
            />

            <View
              style={[
                styles.statusBarSuspended,
                {
                  width:
                    users.length > 0
                      ? `${(suspendedCount / users.length) * 100}%`
                      : '0%',
                },
              ]}
            />
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Find Users
            </Text>

            <Text style={styles.sectionSubtitle}>
              Search and filter platform accounts
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* FILTERS */}
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
              {filter !== 'All' && (
                <Ionicons
                  name={
                    filter === 'Student'
                      ? 'school-outline'
                      : filter === 'Alumni'
                      ? 'briefcase-outline'
                      : filter === 'Business'
                      ? 'business-outline'
                      : filter === 'Active'
                      ? 'checkmark-circle-outline'
                      : 'pause-circle-outline'
                  }
                  size={14}
                  color={
                    selectedFilter === filter
                      ? '#FFFFFF'
                      : '#64748B'
                  }
                />
              )}

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

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>
              Platform Users
            </Text>

            <Text style={styles.resultsSubtitle}>
              Manage account access below
            </Text>
          </View>

          <View style={styles.resultsCountBadge}>
            <Text style={styles.resultsCount}>
              {filteredUsers.length}
            </Text>

            <Text style={styles.resultsCountLabel}>
              results
            </Text>
          </View>
        </View>

        {/* USER LIST */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={28}
                color="#2457E6"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No users found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>

            {(search.length > 0 ||
              selectedFilter !== 'All') && (
              <Pressable
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearch('');
                  setSelectedFilter('All');
                }}
              >
                <Text style={styles.clearFiltersText}>
                  Clear filters
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View
              key={user.id}
              style={styles.userCard}
            >
              {/* USER INFORMATION */}
              <View style={styles.userTop}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        getRoleBackground(user.role),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: getRoleColor(user.role),
                      },
                    ]}
                  >
                    {getInitials(user.name)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text
                    style={styles.userName}
                    numberOfLines={1}
                  >
                    {user.name}
                  </Text>

                  <Text
                    style={styles.userEmail}
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>

                  <View style={styles.roleRow}>
                    <View
                      style={[
                        styles.roleIcon,
                        {
                          backgroundColor:
                            getRoleBackground(
                              user.role
                            ),
                        },
                      ]}
                    >
                      <Ionicons
                        name={getRoleIcon(user.role)}
                        size={13}
                        color={getRoleColor(
                          user.role
                        )}
                      />
                    </View>

                    <Text
                      style={[
                        styles.userRole,
                        {
                          color: getRoleColor(
                            user.role
                          ),
                        },
                      ]}
                    >
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
                  <View
                    style={[
                      styles.statusDot,
                      user.status === 'Active'
                        ? styles.activeDot
                        : styles.suspendedDot,
                    ]}
                  />

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

              {/* USER META */}
              <View style={styles.userMeta}>
                <View style={styles.joinedRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="#94A3B8"
                  />

                  <Text style={styles.joined}>
                    Joined {user.joined}
                  </Text>
                </View>

                <View style={styles.userIdBadge}>
                  <Text style={styles.userIdText}>
                    ID: {user.id}
                  </Text>
                </View>
              </View>

              {/* ACTION */}
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
                <Ionicons
                  name={
                    user.status === 'Active'
                      ? 'pause-circle-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={18}
                  color={
                    user.status === 'Active'
                      ? '#B91C1C'
                      : '#FFFFFF'
                  }
                />

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

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={
                    user.status === 'Active'
                      ? '#B91C1C'
                      : '#FFFFFF'
                  }
                  style={styles.actionArrow}
                />
              </Pressable>
            </View>
          ))
        )}

        {/* BACK TO DASHBOARD */}
        <Pressable
          style={styles.dashboardButton}
          onPress={() =>
            router.replace('/admin/dashboard')
          }
        >
          <Ionicons
            name="arrow-back-outline"
            size={17}
            color="#0B1F3A"
          />

          <Text style={styles.dashboardButtonText}>
            Back to Admin Dashboard
          </Text>
        </Pressable>

        <View style={styles.footerSpace} />
      </ScrollView>

      {/* STATIC ADMIN BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <AdminNavItem
          icon="home-outline"
          label="Home"
          active={false}
          onPress={() =>
            router.replace('/admin/dashboard')
          }
        />

        <AdminNavItem
          icon="bar-chart-outline"
          label="Analytics"
          active={false}
          onPress={() =>
            router.replace('/admin/analytics')
          }
        />

        <AdminNavItem
          icon="people-outline"
          label="Users"
          active={true}
          onPress={() =>
            router.replace('/admin/users')
          }
        />

        <AdminNavItem
          icon="shield-checkmark-outline"
          label="Verifications"
          active={false}
          onPress={() =>
            router.replace('/admin/approvals')
          }
        />
      </View>
    </View>
  );
}

function AdminNavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.navItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.navIconWrapper,
          active &&
            styles.navIconWrapperActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            active
              ? '#2457E6'
              : '#64748B'
          }
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          active &&
            styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 16,
    paddingBottom: 125,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 23,
    padding: 17,
    paddingBottom: 21,
    marginBottom: 14,
    minHeight: 150,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    marginTop: 14,
  },

  headerEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },

  headerEyebrowText: {
    color: '#AFC4E8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C7D4E3',
    fontSize: 12,
    marginTop: 4,
  },

  /* SUMMARY */

  summaryCard: {
    minHeight: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 5,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  summaryText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  summaryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  summaryStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },

  summaryStatusText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '800',
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 21,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* STATS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentIcon: {
    backgroundColor: '#EAF1FF',
  },

  alumniIcon: {
    backgroundColor: '#F5F3FF',
  },

  businessIcon: {
    backgroundColor: '#FFF7ED',
  },

  statMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },

  statMiniText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 2,
  },

  statValue: {
    color: '#0B1F3A',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },

  statLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  /* ACCOUNT STATUS */

  statusOverview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  statusOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusOverviewTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  statusOverviewSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  statusNumbers: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 14,
  },

  statusNumberBlock: {
    flex: 1,
  },

  statusDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 15,
  },

  statusNumberTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  redDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },

  statusNumberLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },

  statusNumberValue: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },

  statusBar: {
    height: 9,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  statusBarActive: {
    height: '100%',
    backgroundColor: '#16A34A',
  },

  statusBarSuspended: {
    height: '100%',
    backgroundColor: '#DC2626',
  },

  /* SEARCH */

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 9,
  },

  clearButton: {
    padding: 4,
  },

  /* FILTERS */

  filterContainer: {
    paddingTop: 11,
    paddingBottom: 2,
  },

  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  filterButtonSelected: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  /* RESULTS */

  resultsHeader: {
    marginTop: 20,
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultsTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  resultsSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  resultsCountBadge: {
    backgroundColor: '#EAF1FF',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultsCount: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '900',
  },

  resultsCountLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 3,
  },

  /* USER CARD */

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  userTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '900',
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  userEmail: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userRole: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* STATUS */

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  suspendedBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeDot: {
    backgroundColor: '#15803D',
  },

  suspendedDot: {
    backgroundColor: '#B91C1C',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  activeText: {
    color: '#15803D',
  },

  suspendedText: {
    color: '#B91C1C',
  },

  /* USER META */

  userMeta: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  joined: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 5,
  },

  userIdBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 5,
  },

  userIdText: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '600',
  },

  /* ACTION */

  statusButton: {
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    flexDirection: 'row',
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
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },

  suspendButtonText: {
    color: '#B91C1C',
  },

  activateButtonText: {
    color: '#FFFFFF',
  },

  actionArrow: {
    position: 'absolute',
    right: 13,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingVertical: 38,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 5,
  },

  clearFiltersButton: {
    marginTop: 14,
    backgroundColor: '#EAF1FF',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  clearFiltersText: {
    color: '#2457E6',
    fontSize: 11,
    fontWeight: '800',
  },

  /* DASHBOARD */

  dashboardButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    flexDirection: 'row',
  },

  dashboardButtonText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },

  footerSpace: {
    height: 25,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,

    shadowColor: '#172033',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 12,
    zIndex: 100,
  },

  navItem: {
    flex: 1,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconWrapper: {
    width: 40,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  navIconWrapperActive: {
    backgroundColor: '#EAF1FF',
  },

  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  navLabelActive: {
    color: '#2457E6',
    fontWeight: '900',
  },
});