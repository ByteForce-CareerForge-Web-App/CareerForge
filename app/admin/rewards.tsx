import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'careerforge_admin_reward_users';
const BADGES_KEY = 'careerforge_admin_badges';

type UserRole = 'Student' | 'Alumni' | 'Business';

type UserReward = {
  id: string;
  name: string;
  role: UserRole;
  credits: number;
  badges: string[];
};

type Badge = {
  id: string;
  name: string;
  icon: string;
  credits: number;
  description: string;
};

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'career-ready',
    name: 'Career Ready',
    icon: '🎯',
    credits: 50,
    description: 'Completed key career preparation activities.',
  },
  {
    id: 'cv-champion',
    name: 'CV Champion',
    icon: '📄',
    credits: 40,
    description: 'Built and improved a professional CV.',
  },
  {
    id: 'networking-pro',
    name: 'Networking Pro',
    icon: '🤝',
    credits: 50,
    description: 'Actively builds professional connections.',
  },
  {
    id: 'opportunity-seeker',
    name: 'Opportunity Seeker',
    icon: '💼',
    credits: 30,
    description: 'Actively explores career opportunities.',
  },
  {
    id: 'career-explorer',
    name: 'Career Explorer',
    icon: '🧭',
    credits: 30,
    description: 'Explores career pathways and options.',
  },
  {
    id: 'graduate-achiever',
    name: 'Graduate Achiever',
    icon: '🏆',
    credits: 100,
    description: 'Recognised for strong graduate achievement.',
  },
];

const DEFAULT_USERS: UserReward[] = [
  {
    id: '1',
    name: 'Sarah Adams',
    role: 'Student',
    credits: 180,
    badges: ['Career Ready', 'CV Champion'],
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student',
    credits: 120,
    badges: ['Career Explorer'],
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Student',
    credits: 250,
    badges: ['Career Ready', 'Networking Pro'],
  },
  {
    id: '4',
    name: 'David Williams',
    role: 'Alumni',
    credits: 320,
    badges: ['Networking Pro', 'Graduate Achiever'],
  },
  {
    id: '5',
    name: 'Amanda Naidoo',
    role: 'Alumni',
    credits: 210,
    badges: ['Career Ready', 'Opportunity Seeker'],
  },
  {
    id: '6',
    name: 'TechNova Solutions',
    role: 'Business',
    credits: 90,
    badges: ['Opportunity Seeker'],
  },
];

export default function AdminRewards() {
  const [users, setUsers] = useState<UserReward[]>([]);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);

  const [activeSection, setActiveSection] =
    useState<'users' | 'badges'>('users');

  const [search, setSearch] = useState('');
  const [filter, setFilter] =
    useState<'All' | 'Student' | 'Alumni' | 'Business'>('All');

  // Credits modal
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [creditMode, setCreditMode] = useState<'add' | 'remove'>('add');
  const [selectedUser, setSelectedUser] = useState<UserReward | null>(null);
  const [creditAmount, setCreditAmount] = useState('');

  // Badge modal
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [badgeTargetUser, setBadgeTargetUser] =
    useState<UserReward | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      const storedBadges = await AsyncStorage.getItem(BADGES_KEY);

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        await AsyncStorage.setItem(
          USERS_KEY,
          JSON.stringify(DEFAULT_USERS)
        );
        setUsers(DEFAULT_USERS);
      }

      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        await AsyncStorage.setItem(
          BADGES_KEY,
          JSON.stringify(DEFAULT_BADGES)
        );
        setBadges(DEFAULT_BADGES);
      }
    } catch (error) {
      console.log('Error loading rewards:', error);
    }
  };

  const saveUsers = async (updatedUsers: UserReward[]) => {
    try {
      setUsers(updatedUsers);
      await AsyncStorage.setItem(
        USERS_KEY,
        JSON.stringify(updatedUsers)
      );
    } catch (error) {
      console.log('Error saving users:', error);
    }
  };

  const openCreditModal = (
    user: UserReward,
    mode: 'add' | 'remove'
  ) => {
    setSelectedUser(user);
    setCreditMode(mode);
    setCreditAmount('');
    setCreditModalVisible(true);
  };

  const submitCredits = async () => {
    if (!selectedUser) return;

    const amount = Number(creditAmount.trim());

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid positive number.'
      );
      return;
    }

    const wholeAmount = Math.floor(amount);

    const updatedUsers = users.map((user) => {
      if (user.id !== selectedUser.id) {
        return user;
      }

      return {
        ...user,
        credits:
          creditMode === 'add'
            ? user.credits + wholeAmount
            : Math.max(0, user.credits - wholeAmount),
      };
    });

    await saveUsers(updatedUsers);

    setCreditModalVisible(false);
    setCreditAmount('');
    setSelectedUser(null);

    Alert.alert(
      'Success',
      `${wholeAmount} credits ${
        creditMode === 'add' ? 'added to' : 'removed from'
      } ${selectedUser.name}.`
    );
  };

  const openBadgeModal = (user: UserReward) => {
    setBadgeTargetUser(user);
    setBadgeModalVisible(true);
  };

  const awardBadge = async (badge: Badge) => {
    if (!badgeTargetUser) return;

    const alreadyHasBadge = badgeTargetUser.badges.includes(
      badge.name
    );

    if (alreadyHasBadge) {
      Alert.alert(
        'Already Awarded',
        `${badgeTargetUser.name} already has the ${badge.name} badge.`
      );
      return;
    }

    const updatedUsers = users.map((user) => {
      if (user.id !== badgeTargetUser.id) {
        return user;
      }

      return {
        ...user,
        badges: [...user.badges, badge.name],
        credits: user.credits + badge.credits,
      };
    });

    await saveUsers(updatedUsers);

    setBadgeModalVisible(false);
    setBadgeTargetUser(null);

    Alert.alert(
      'Badge Awarded',
      `${badge.name} has been awarded to ${badgeTargetUser.name}.\n\n+${badge.credits} credits`
    );
  };

  const removeBadge = (
    user: UserReward,
    badgeName: string
  ) => {
    Alert.alert(
      'Remove Badge',
      `Remove "${badgeName}" from ${user.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const badge = badges.find(
              (item) => item.name === badgeName
            );

            const updatedUsers = users.map((item) => {
              if (item.id !== user.id) {
                return item;
              }

              return {
                ...item,
                badges: item.badges.filter(
                  (name) => name !== badgeName
                ),
                credits: Math.max(
                  0,
                  item.credits - (badge?.credits ?? 0)
                ),
              };
            });

            await saveUsers(updatedUsers);

            Alert.alert(
              'Badge Removed',
              `${badgeName} was removed from ${user.name}.`
            );
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' || user.role === filter;

    return matchesSearch && matchesFilter;
  });

  const totalCredits = users.reduce(
    (sum, user) => sum + user.credits,
    0
  );

  const totalBadges = users.reduce(
    (sum, user) => sum + user.badges.length,
    0
  );

  const students = users.filter(
    (user) => user.role === 'Student'
  ).length;

  const alumni = users.filter(
    (user) => user.role === 'Alumni'
  ).length;

  const businesses = users.filter(
    (user) => user.role === 'Business'
  ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/admin/dashboard');
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Badges & Credits</Text>
          <Text style={styles.headerSubtitle}>
            Manage rewards and achievements
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* SUMMARY */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⭐</Text>
            <Text style={styles.summaryValue}>
              {totalCredits}
            </Text>
            <Text style={styles.summaryLabel}>
              Total Credits
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🏅</Text>
            <Text style={styles.summaryValue}>
              {totalBadges}
            </Text>
            <Text style={styles.summaryLabel}>
              Badges Awarded
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>👥</Text>
            <Text style={styles.summaryValue}>
              {users.length}
            </Text>
            <Text style={styles.summaryLabel}>
              Reward Users
            </Text>
          </View>
        </View>

        {/* ROLE BREAKDOWN */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>
            Reward Users
          </Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Students
            </Text>
            <Text style={styles.breakdownValue}>
              {students}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Alumni
            </Text>
            <Text style={styles.breakdownValue}>
              {alumni}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Businesses
            </Text>
            <Text style={styles.breakdownValue}>
              {businesses}
            </Text>
          </View>
        </View>

        {/* SECTION SWITCHER */}
        <View style={styles.switcher}>
          <Pressable
            style={[
              styles.switchButton,
              activeSection === 'users' &&
                styles.switchButtonActive,
            ]}
            onPress={() => setActiveSection('users')}
          >
            <Text
              style={[
                styles.switchText,
                activeSection === 'users' &&
                  styles.switchTextActive,
              ]}
            >
              User Rewards
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.switchButton,
              activeSection === 'badges' &&
                styles.switchButtonActive,
            ]}
            onPress={() => setActiveSection('badges')}
          >
            <Text
              style={[
                styles.switchText,
                activeSection === 'badges' &&
                  styles.switchTextActive,
              ]}
            >
              Badge Library
            </Text>
          </Pressable>
        </View>

        {/* USER REWARDS */}
        {activeSection === 'users' && (
          <>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search users..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {[
                'All',
                'Student',
                'Alumni',
                'Business',
              ].map((item) => (
                <Pressable
                  key={item}
                  onPress={() =>
                    setFilter(
                      item as
                        | 'All'
                        | 'Student'
                        | 'Alumni'
                        | 'Business'
                    )
                  }
                  style={[
                    styles.filterButton,
                    filter === item &&
                      styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {filteredUsers.map((user) => (
              <View
                key={user.id}
                style={styles.userCard}
              >
                <View style={styles.userTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.name}
                    </Text>

                    <Text style={styles.userRole}>
                      {user.role}
                    </Text>
                  </View>

                  <View style={styles.creditBox}>
                    <Text style={styles.creditValue}>
                      {user.credits}
                    </Text>
                    <Text style={styles.creditLabel}>
                      credits
                    </Text>
                  </View>
                </View>

                {/* BADGES */}
                <View style={styles.badgeSection}>
                  <Text style={styles.badgeSectionTitle}>
                    Earned Badges
                  </Text>

                  {user.badges.length === 0 ? (
                    <Text style={styles.noBadges}>
                      No badges yet
                    </Text>
                  ) : (
                    <View style={styles.badgesWrap}>
                      {user.badges.map((badgeName) => {
                        const badge = badges.find(
                          (item) =>
                            item.name === badgeName
                        );

                        return (
                          <View
                            key={badgeName}
                            style={styles.badgeChip}
                          >
                            <Text style={styles.badgeIcon}>
                              {badge?.icon ?? '🏅'}
                            </Text>

                            <Text style={styles.badgeName}>
                              {badgeName}
                            </Text>

                            <Pressable
                              onPress={() =>
                                removeBadge(
                                  user,
                                  badgeName
                                )
                              }
                              style={
                                styles.removeBadgeButton
                              }
                            >
                              <Text
                                style={
                                  styles.removeBadgeText
                                }
                              >
                                ×
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* ACTIONS */}
                <View style={styles.actionsRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.addButton,
                    ]}
                    onPress={() =>
                      openCreditModal(user, 'add')
                    }
                  >
                    <Text
                      style={styles.addButtonText}
                    >
                      + Credits
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.removeButton,
                    ]}
                    onPress={() =>
                      openCreditModal(
                        user,
                        'remove'
                      )
                    }
                  >
                    <Text
                      style={styles.removeButtonText}
                    >
                      − Credits
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.badgeButton,
                    ]}
                    onPress={() =>
                      openBadgeModal(user)
                    }
                  >
                    <Text
                      style={styles.badgeButtonText}
                    >
                      + Badge
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {filteredUsers.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🔎</Text>
                <Text style={styles.emptyTitle}>
                  No users found
                </Text>
                <Text style={styles.emptyText}>
                  Try a different search or filter.
                </Text>
              </View>
            )}
          </>
        )}

        {/* BADGE LIBRARY */}
        {activeSection === 'badges' && (
          <>
            <Text style={styles.libraryIntro}>
              Available badges that administrators can award
              to users.
            </Text>

            {badges.map((badge) => (
              <View
                key={badge.id}
                style={styles.libraryCard}
              >
                <View style={styles.libraryIcon}>
                  <Text style={styles.libraryIconText}>
                    {badge.icon}
                  </Text>
                </View>

                <View style={styles.libraryInfo}>
                  <Text style={styles.libraryName}>
                    {badge.name}
                  </Text>

                  <Text style={styles.libraryDescription}>
                    {badge.description}
                  </Text>

                  <Text style={styles.libraryCredits}>
                    +{badge.credits} credits
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* CREDIT MODAL */}
      <Modal
        visible={creditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCreditModalVisible(false)
        }
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {creditMode === 'add'
                ? 'Add Credits'
                : 'Remove Credits'}
            </Text>

            <Text style={styles.modalSubtitle}>
              {selectedUser?.name}
            </Text>

            <TextInput
              value={creditAmount}
              onChangeText={setCreditAmount}
              placeholder="Enter amount"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              autoFocus
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                ]}
                onPress={() =>
                  setCreditModalVisible(false)
                }
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  creditMode === 'add'
                    ? styles.confirmAddButton
                    : styles.confirmRemoveButton,
                ]}
                onPress={submitCredits}
              >
                <Text
                  style={styles.confirmButtonText}
                >
                  {creditMode === 'add'
                    ? 'Add'
                    : 'Remove'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* BADGE MODAL */}
      <Modal
        visible={badgeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setBadgeModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.badgeModalCard}>
            <Text style={styles.modalTitle}>
              Award Badge
            </Text>

            <Text style={styles.modalSubtitle}>
              {badgeTargetUser?.name}
            </Text>

            <ScrollView
              style={styles.badgeModalList}
              showsVerticalScrollIndicator={false}
            >
              {badges.map((badge) => {
                const alreadyHas =
                  badgeTargetUser?.badges.includes(
                    badge.name
                  );

                return (
                  <Pressable
                    key={badge.id}
                    style={[
                      styles.badgeOption,
                      alreadyHas &&
                        styles.badgeOptionDisabled,
                    ]}
                    disabled={alreadyHas}
                    onPress={() =>
                      awardBadge(badge)
                    }
                  >
                    <Text style={styles.badgeOptionIcon}>
                      {badge.icon}
                    </Text>

                    <View
                      style={styles.badgeOptionInfo}
                    >
                      <Text
                        style={
                          styles.badgeOptionName
                        }
                      >
                        {badge.name}
                      </Text>

                      <Text
                        style={
                          styles.badgeOptionDescription
                        }
                      >
                        {badge.description}
                      </Text>

                      <Text
                        style={
                          styles.badgeOptionCredits
                        }
                      >
                        +{badge.credits} credits
                      </Text>
                    </View>

                    <Text
                      style={
                        alreadyHas
                          ? styles.alreadyText
                          : styles.awardText
                      }
                    >
                      {alreadyHas
                        ? '✓ Earned'
                        : 'Award'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={styles.closeButton}
              onPress={() =>
                setBadgeModalVisible(false)
              }
            >
              <Text style={styles.closeButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0F172A',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    marginTop: 3,
    fontSize: 13,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  summaryIcon: {
    fontSize: 22,
    marginBottom: 5,
  },

  summaryValue: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  breakdownLabel: {
    color: '#475569',
    fontSize: 14,
  },

  breakdownValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  switcher: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  switchButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 9,
  },

  switchButtonActive: {
    backgroundColor: '#0F172A',
  },

  switchText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },

  switchTextActive: {
    color: '#FFFFFF',
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },

  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  filterButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },

  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  userRole: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  creditBox: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  creditValue: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },

  creditLabel: {
    color: '#64748B',
    fontSize: 9,
  },

  badgeSection: {
    marginTop: 15,
  },

  badgeSectionTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },

  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingLeft: 9,
    paddingRight: 5,
    paddingVertical: 5,
  },

  badgeIcon: {
    fontSize: 13,
    marginRight: 4,
  },

  badgeName: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },

  removeBadgeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  removeBadgeText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 17,
  },

  noBadges: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 15,
  },

  actionButton: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  addButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  addButtonText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },

  removeButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  removeButtonText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },

  badgeButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  badgeButtonText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  libraryIntro: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },

  libraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  libraryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  libraryIconText: {
    fontSize: 24,
  },

  libraryInfo: {
    flex: 1,
  },

  libraryName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  libraryDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  libraryCredits: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },

  badgeModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 16,
    marginBottom: 15,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },

  modalButton: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#F1F5F9',
  },

  cancelButtonText: {
    color: '#475569',
    fontWeight: '800',
  },

  confirmAddButton: {
    backgroundColor: '#15803D',
  },

  confirmRemoveButton: {
    backgroundColor: '#DC2626',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  badgeModalList: {
    marginBottom: 12,
  },

  badgeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 9,
  },

  badgeOptionDisabled: {
    opacity: 0.55,
  },

  badgeOptionIcon: {
    fontSize: 27,
    marginRight: 11,
  },

  badgeOptionInfo: {
    flex: 1,
  },

  badgeOptionName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  badgeOptionDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  badgeOptionCredits: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },

  awardText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },

  alreadyText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },

  closeButton: {
    backgroundColor: '#0F172A',
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});