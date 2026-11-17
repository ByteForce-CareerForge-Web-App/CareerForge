import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
import { API_BASE_URL } from '@/constants/api';

type ApprovalType = 'Business' | 'Alumni' | 'Student';
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

type Approval = {
  id: string;
  request_id: number;
  user_id: number;
  name: string;
  type: ApprovalType;
  description: string;
  date: string;
  status: ApprovalStatus;
  email?: string;
  company_name?: string;
  registration_number?: string;
  industry?: string;
  website?: string;
  qualification?: string;
  graduation_year?: string | number;
  company?: string;
  position?: string;
  document_path?: string;
  ai_confidence?: string | number;
  admin_decision?: string;
};

type ApprovalsResponse = {
  success: boolean;
  message?: string;
  approvals: Approval[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

function AdminNavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.navItem,
        active && styles.navItemActive,
      ]}
    >
      <View
        style={[
          styles.navIconWrap,
          active && styles.navIconWrapActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={active ? '#2563EB' : '#64748B'}
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AdminApprovals() {
  const [approvals, setApprovals] =
    useState<Approval[]>([]);

  const [selectedFilter, setSelectedFilter] =
    useState<
      'All' | ApprovalType | ApprovalStatus
    >('All');

  const [search, setSearch] = useState('');

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadApprovals();
    }, [])
  );

  async function loadApprovals() {
    try {
      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/approvals.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const data: ApprovalsResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Unable to load approval requests.'
        );
      }

      setApprovals(
        Array.isArray(data.approvals)
          ? data.approvals
          : []
      );
    } catch (error) {
      console.error(
        'Admin approvals error:',
        error
      );

      Alert.alert(
        'Loading Error',
        'Unable to load the latest verification requests.'
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function updateApproval(
    approval: Approval,
    status: ApprovalStatus
  ) {
    if (status === 'Pending') {
      return;
    }

    try {
      setRefreshing(true);

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Session expired',
          'Please log in again.'
        );

        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/approvals.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: approval.type,
            request_id: approval.request_id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Unable to update the verification.'
        );
      }

      /*
       * Reload from MySQL so the screen always
       * reflects the real backend state.
       */

      await loadApprovals();

      Alert.alert(
        status === 'Approved'
          ? 'Approved'
          : 'Rejected',
        `${approval.name} has been ${status.toLowerCase()}.`
      );
    } catch (error) {
      console.error(
        'Update approval error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to update the verification request.'
      );
    } finally {
      setRefreshing(false);
    }
  }

  function handleApprove(
    approval: Approval
  ) {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve ${approval.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () =>
            updateApproval(
              approval,
              'Approved'
            ),
        },
      ]
    );
  }

  function handleReject(
    approval: Approval
  ) {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject ${approval.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            updateApproval(
              approval,
              'Rejected'
            ),
        },
      ]
    );
  }

  const filteredApprovals =
    approvals.filter((approval) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        approval.name
          .toLowerCase()
          .includes(searchValue) ||
        approval.type
          .toLowerCase()
          .includes(searchValue) ||
        approval.description
          .toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        selectedFilter === 'All' ||
        approval.type === selectedFilter ||
        approval.status === selectedFilter;

      return (
        matchesSearch && matchesFilter
      );
    });

  const pendingCount = approvals.filter(
    (approval) =>
      approval.status === 'Pending'
  ).length;

  const approvedCount = approvals.filter(
    (approval) =>
      approval.status === 'Approved'
  ).length;

  const rejectedCount = approvals.filter(
    (approval) =>
      approval.status === 'Rejected'
  ).length;

  const totalCount = approvals.length;

  const completionRate =
    totalCount > 0
      ? Math.round(
          (approvedCount / totalCount) * 100
        )
      : 0;

  function getTypeIcon(
    type: ApprovalType
  ): keyof typeof Ionicons.glyphMap {
    if (type === 'Business') {
      return 'business-outline';
    }

    if (type === 'Alumni') {
      return 'school-outline';
    }

    return 'person-outline';
  }

  function getTypeIconColor(
    type: ApprovalType
  ) {
    if (type === 'Business') {
      return '#2563EB';
    }

    if (type === 'Alumni') {
      return '#7C3AED';
    }

    return '#0F766E';
  }

  function getTypeBackground(
    type: ApprovalType
  ) {
    if (type === 'Business') {
      return '#EFF6FF';
    }

    if (type === 'Alumni') {
      return '#F5F3FF';
    }

    return '#F0FDFA';
  }

  function getTypeLabel(
    type: ApprovalType
  ) {
    if (type === 'Business') {
      return 'BUSINESS';
    }

    if (type === 'Alumni') {
      return 'ALUMNI';
    }

    return 'STUDENT';
  }

  function getStatusStyle(
    status: ApprovalStatus
  ) {
    if (status === 'Approved') {
      return styles.approvedBadge;
    }

    if (status === 'Rejected') {
      return styles.rejectedBadge;
    }

    return styles.pendingBadge;
  }

  function getStatusTextStyle(
    status: ApprovalStatus
  ) {
    if (status === 'Approved') {
      return styles.approvedText;
    }

    if (status === 'Rejected') {
      return styles.rejectedText;
    }

    return styles.pendingText;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        {/* HERO HEADER */}
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTopRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(
                    '/admin/dashboard'
                  );
                }
              }}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                REVIEW CENTRE
              </Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>
              ADMIN CONTROL
            </Text>

            <Text style={styles.heroTitle}>
              Verification Hub
            </Text>

            <Text style={styles.heroSubtitle}>
              Keep CareerForgeAI trusted by
              reviewing registrations,
              businesses and alumni.
            </Text>
          </View>

          <View style={styles.heroBottom}>
            <View>
              <Text style={styles.heroSmallLabel}>
                PENDING REVIEW
              </Text>

              <Text style={styles.heroPending}>
                {pendingCount}
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroMiniStat}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#93C5FD"
              />

              <View>
                <Text
                  style={styles.heroMiniValue}
                >
                  {completionRate}%
                </Text>

                <Text
                  style={styles.heroMiniLabel}
                >
                  approved
                </Text>
              </View>
            </View>

            <View style={styles.heroShield}>
              <Ionicons
                name="shield-checkmark"
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SUMMARY TITLE */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Verification overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current platform review activity
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Ionicons
              name="layers-outline"
              size={14}
              color="#2563EB"
            />

            <Text style={styles.totalBadgeText}>
              {totalCount} total
            </Text>
          </View>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIconBox,
                styles.pendingIconBox,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={21}
                color="#D97706"
              />
            </View>

            <View style={styles.summaryCardText}>
              <Text style={styles.summaryValue}>
                {pendingCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Pending
              </Text>
            </View>

            <View style={styles.summaryAccentPending} />
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIconBox,
                styles.approvedIconBox,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#15803D"
              />
            </View>

            <View style={styles.summaryCardText}>
              <Text style={styles.summaryValue}>
                {approvedCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Approved
              </Text>
            </View>

            <View style={styles.summaryAccentApproved} />
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIconBox,
                styles.rejectedIconBox,
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={21}
                color="#DC2626"
              />
            </View>

            <View style={styles.summaryCardText}>
              <Text style={styles.summaryValue}>
                {rejectedCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Rejected
              </Text>
            </View>

            <View style={styles.summaryAccentRejected} />
          </View>
        </View>

        {/* ATTENTION CARD */}
        {pendingCount > 0 && (
          <View style={styles.attentionCard}>
            <View style={styles.attentionIcon}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.attentionText}>
              <Text style={styles.attentionTitle}>
                Action required
              </Text>

              <Text style={styles.attentionSubtitle}>
                {pendingCount}{' '}
                verification request
                {pendingCount === 1
                  ? ''
                  : 's'} waiting for review.
              </Text>
            </View>

            <View style={styles.attentionArrow}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color="#2563EB"
              />
            </View>
          </View>
        )}

        {/* SEARCH */}
        <View style={styles.searchLabelRow}>
          <Text style={styles.searchLabel}>
            Find a request
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIconBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#2563EB"
            />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or type..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <Pressable
              style={styles.clearSearch}
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* FILTERS */}
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>
            Filter requests
          </Text>

          <Text style={styles.filterHint}>
            {selectedFilter === 'All'
              ? 'All requests'
              : selectedFilter}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {[
            'All',
            'Pending',
            'Business',
            'Alumni',
            'Student',
            'Approved',
            'Rejected',
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
                    | ApprovalType
                    | ApprovalStatus
                )
              }
            >
              {filter === 'Pending' && (
                <View
                  style={[
                    styles.filterDot,
                    {
                      backgroundColor:
                        selectedFilter ===
                        filter
                          ? '#FFFFFF'
                          : '#D97706',
                    },
                  ]}
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
            <View style={styles.resultsTitleRow}>
              <Text style={styles.resultsTitle}>
                Review queue
              </Text>

              {pendingCount > 0 && (
                <View style={styles.queueDot} />
              )}
            </View>

            <Text style={styles.resultsSubtitle}>
              Verification requests requiring
              attention
            </Text>
          </View>

          <View style={styles.resultsCountBox}>
            <Text style={styles.resultsCount}>
              {filteredApprovals.length}
            </Text>

            <Text style={styles.resultsCountLabel}>
              shown
            </Text>
          </View>
        </View>

        {/* APPROVAL CARDS */}
        {filteredApprovals.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyDecorOne} />
            <View style={styles.emptyDecorTwo} />

            <View style={styles.emptyIconBox}>
              <Ionicons
                name="search-outline"
                size={28}
                color="#2563EB"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No requests found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or
              selected filter.
            </Text>

            {(search.length > 0 ||
              selectedFilter !== 'All') && (
              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setSearch('');
                  setSelectedFilter('All');
                }}
              >
                <Text style={styles.resetButtonText}>
                  Clear filters
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredApprovals.map(
            (approval) => (
              <View
                key={approval.id}
                style={[
                  styles.approvalCard,
                  approval.status ===
                    'Pending' &&
                    styles.pendingCard,
                ]}
              >
                {/* CARD ACCENT */}
                <View
                  style={[
                    styles.cardAccent,
                    {
                      backgroundColor:
                        approval.status ===
                        'Pending'
                          ? '#F59E0B'
                          : approval.status ===
                            'Approved'
                          ? '#22C55E'
                          : '#EF4444',
                    },
                  ]}
                />

                {/* TOP */}
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor:
                          getTypeBackground(
                            approval.type
                          ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(
                        approval.type
                      )}
                      size={23}
                      color={getTypeIconColor(
                        approval.type
                      )}
                    />
                  </View>

                  <View
                    style={styles.nameContainer}
                  >
                    <View
                      style={
                        styles.typeLabelRow
                      }
                    >
                      <Text
                        style={styles.typeLabel}
                      >
                        {getTypeLabel(
                          approval.type
                        )}
                      </Text>

                      <View
                        style={
                          styles.typeLabelLine
                        }
                      />
                    </View>

                    <Text style={styles.name}>
                      {approval.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(
                        approval.status
                      ),
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            approval.status ===
                            'Approved'
                              ? '#15803D'
                              : approval.status ===
                                'Rejected'
                              ? '#B91C1C'
                              : '#D97706',
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        getStatusTextStyle(
                          approval.status
                        ),
                      ]}
                    >
                      {approval.status}
                    </Text>
                  </View>
                </View>

                {/* DESCRIPTION */}
                <View style={styles.infoBox}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={15}
                      color="#64748B"
                    />
                  </View>

                  <Text
                    style={styles.description}
                  >
                    {approval.description}
                  </Text>
                </View>

                {/* DATE */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#94A3B8"
                    />

                    <Text style={styles.date}>
                      Submitted {approval.date}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="finger-print-outline"
                      size={14}
                      color="#94A3B8"
                    />

                    <Text style={styles.requestId}>
                      {approval.id}
                    </Text>
                  </View>
                </View>

                {/* BUTTONS */}
                {approval.status ===
                  'Pending' && (
                  <View
                    style={styles.buttonRow}
                  >
                    <Pressable
                      style={
                        styles.rejectButton
                      }
                      onPress={() =>
                        handleReject(
                          approval
                        )
                      }
                      disabled={refreshing}
                    >
                      <Ionicons
                        name="close-outline"
                        size={18}
                        color="#B91C1C"
                      />

                      <Text
                        style={
                          styles.rejectButtonText
                        }
                      >
                        Reject
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.approveButton
                      }
                      onPress={() =>
                        handleApprove(
                          approval
                        )
                      }
                      disabled={refreshing}
                    >
                      <Ionicons
                        name="checkmark-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.approveButtonText
                        }
                      >
                        Approve
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* COMPLETED */}
                {approval.status !==
                  'Pending' && (
                  <View
                    style={
                      styles.completedRow
                    }
                  >
                    <View
                      style={[
                        styles.completedIcon,
                        {
                          backgroundColor:
                            approval.status ===
                            'Approved'
                              ? '#DCFCE7'
                              : '#FEE2E2',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          approval.status ===
                          'Approved'
                            ? 'checkmark'
                            : 'close'
                        }
                        size={15}
                        color={
                          approval.status ===
                          'Approved'
                            ? '#15803D'
                            : '#B91C1C'
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.completedText,
                        approval.status ===
                        'Approved'
                          ? styles.approvedText
                          : styles.rejectedText,
                      ]}
                    >
                      {approval.status ===
                      'Approved'
                        ? 'Verification approved'
                        : 'Verification rejected'}
                    </Text>

                    <Ionicons
                      name="checkmark-done-outline"
                      size={16}
                      color="#94A3B8"
                    />
                  </View>
                )}
              </View>
            )
          )
        )}

        {/* DASHBOARD BUTTON */}
        <Pressable
          style={styles.dashboardButton}
          onPress={() =>
            router.replace(
              '/admin/dashboard'
            )
          }
        >
          <View style={styles.dashboardIcon}>
            <Ionicons
              name="arrow-back-outline"
              size={17}
              color="#0B1F3A"
            />
          </View>

          <Text
            style={
              styles.dashboardButtonText
            }
          >
            Back to Admin Dashboard
          </Text>

          <Ionicons
            name="chevron-forward-outline"
            size={17}
            color="#94A3B8"
          />
        </Pressable>

        <View style={styles.footerSpace} />
      </ScrollView>

      {/* FIXED ADMIN BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <AdminNavItem
          icon="home-outline"
          label="Home"
          onPress={() =>
            router.replace(
              '/admin/dashboard'
            )
          }
        />

        <AdminNavItem
          icon="bar-chart-outline"
          label="Analytics"
          onPress={() =>
            router.replace(
              '/admin/analytics'
            )
          }
        />

        <AdminNavItem
          icon="people-outline"
          label="Users"
          onPress={() =>
            router.replace(
              '/admin/users'
            )
          }
        />

        <AdminNavItem
          icon="shield-checkmark-outline"
          label="Verifications"
          active
          onPress={() => {}}
        />
      </View>
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
    paddingBottom: 125,
  },

  /* HERO */

  hero: {
    backgroundColor: '#0B1F3A',
    borderRadius: 25,
    padding: 18,
    marginBottom: 21,
    overflow: 'hidden',
    position: 'relative',
  },

  heroGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2563EB',
    opacity: 0.16,
    right: -65,
    top: -55,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#60A5FA',
    opacity: 0.08,
    left: -40,
    bottom: -35,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF1C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },

  liveText: {
    color: '#D7E6FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroContent: {
    marginTop: 22,
  },

  heroEyebrow: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    color: '#C7D4E3',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 310,
  },

  heroBottom: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF18',
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroSmallLabel: {
    color: '#93A9C2',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroPending: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 2,
  },

  heroDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#FFFFFF20',
    marginHorizontal: 18,
  },

  heroMiniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroMiniValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  heroMiniLabel: {
    color: '#93A9C2',
    fontSize: 9,
    marginTop: 1,
  },

  heroShield: {
    marginLeft: 'auto',
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SECTION */

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
  },

  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 5,
  },

  totalBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },

  /* SUMMARY */

  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  summaryCard: {
    width: '31.7%',
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },

  summaryIconBox: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pendingIconBox: {
    backgroundColor: '#FFFBEB',
  },

  approvedIconBox: {
    backgroundColor: '#F0FDF4',
  },

  rejectedIconBox: {
    backgroundColor: '#FEF2F2',
  },

  summaryCardText: {
    marginTop: 8,
  },

  summaryValue: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '900',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  summaryAccentPending: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FEF3C7',
  },

  summaryAccentApproved: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
  },

  summaryAccentRejected: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FEE2E2',
  },

  /* ATTENTION */

  attentionCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  attentionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  attentionText: {
    flex: 1,
  },

  attentionTitle: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '900',
  },

  attentionSubtitle: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  attentionArrow: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SEARCH */

  searchLabelRow: {
    marginBottom: 8,
  },

  searchLabel: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  searchContainer: {
    height: 53,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 14,
  },

  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingHorizontal: 10,
  },

  clearSearch: {
    padding: 7,
  },

  /* FILTERS */

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  filterTitle: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  filterHint: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },

  filterContainer: {
    paddingBottom: 3,
  },

  filterButton: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexDirection: 'row',
  },

  filterButtonSelected: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  filterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  /* RESULTS */

  resultsHeader: {
    marginTop: 21,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultsTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '900',
  },

  queueDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginLeft: 7,
  },

  resultsSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },

  resultsCountBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    minWidth: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },

  resultsCount: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '900',
  },

  resultsCountLabel: {
    color: '#64748B',
    fontSize: 8,
    marginTop: 1,
  },

  /* APPROVAL CARD */

  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },

  pendingCard: {
    borderColor: '#FDE68A',
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },

  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  nameContainer: {
    flex: 1,
  },

  typeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  typeLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  typeLabelLine: {
    width: 18,
    height: 1,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
  },

  name: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  approvedBadge: {
    backgroundColor: '#DCFCE7',
  },

  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  pendingText: {
    color: '#A16207',
  },

  approvedText: {
    color: '#15803D',
  },

  rejectedText: {
    color: '#B91C1C',
  },

  /* INFO */

  infoBox: {
    marginTop: 14,
    padding: 11,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  description: {
    flex: 1,
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 4,
  },

  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '75%',
  },

  date: {
    color: '#94A3B8',
    fontSize: 9,
    marginLeft: 5,
  },

  requestId: {
    color: '#CBD5E1',
    fontSize: 8,
    marginLeft: 5,
  },

  /* BUTTONS */

  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 9,
  },

  rejectButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  rejectButtonText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '900',
  },

  approveButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  /* COMPLETED */

  completedRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  completedIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  completedText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 38,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },

  emptyDecorOne: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    right: -45,
    top: -40,
  },

  emptyDecorTwo: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#F5F3FF',
    left: -35,
    bottom: -35,
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '900',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },

  resetButton: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
  },

  resetButtonText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },

  /* DASHBOARD BUTTON */

  dashboardButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginTop: 10,
    flexDirection: 'row',
  },

  dashboardIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  dashboardButtonText: {
    flex: 1,
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '900',
  },

  footerSpace: {
    height: 20,
  },

  /* FIXED NAV */

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
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navItemActive: {
    backgroundColor: '#EFF6FF',
  },

  navIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconWrapActive: {
    backgroundColor: '#FFFFFF',
  },

  navLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  navLabelActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
});