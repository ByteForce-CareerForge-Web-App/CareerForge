import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

type RecentApplication = {
  application_id: number;
  opportunity_id: number;
  status: string;
  cv_path?: string | null;
  cover_letter?: string | null;
  notes?: string | null;
  applied_at: string;

  opportunity_title?: string;
  opportunity_type?: string;

  student_id: number;
  student_name?: string;
  student_email?: string;

  qualification?: string | null;
  graduation_year?: number | string | null;
  current_company?: string | null;
  current_position?: string | null;
};

type BusinessDashboardData = {
  company_name?: string;
  dashboard?: {
    stats?: {
      active_opportunities?: number;
      total_applications?: number;
      shortlisted?: number;
      interviews?: number;
    };
    recent_applications?: RecentApplication[];
  };
};

type BusinessDashboardResponse = {
  success: boolean;
  message?: string;
  data?: BusinessDashboardData;
};

export default function BusinessDashboard() {
  const [activeJobs, setActiveJobs] = useState(0);
  const [totalApplications, setTotalApplications] =
    useState(0);
  const [shortlisted, setShortlisted] = useState(0);
  const [interviews, setInterviews] = useState(0);

  const [companyName, setCompanyName] =
    useState('ABC Technologies');

  const [recentApplications, setRecentApplications] =
    useState<RecentApplication[]>([]);

  /*
   * -------------------------------------------------------
   * LOAD BUSINESS DASHBOARD FROM BACKEND
   * -------------------------------------------------------
   */
  const loadDashboardData = useCallback(
    async () => {
      try {
        const token =
          await AsyncStorage.getItem('authToken');

        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/profiles/business.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const result: BusinessDashboardResponse =
          await response.json();

        console.log(
          'Business dashboard response:',
          result
        );

        /*
         * ---------------------------------------------------
         * AUTHENTICATION ERROR
         * ---------------------------------------------------
         */
        if (response.status === 401) {
          await AsyncStorage.removeItem(
            'authToken'
          );
          await AsyncStorage.removeItem('user');

          router.replace('/login');
          return;
        }

        /*
         * ---------------------------------------------------
         * API ERROR
         * ---------------------------------------------------
         */
        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          console.log(
            'Business dashboard API error:',
            result.message
          );

          return;
        }

        const data = result.data;

        const stats = data.dashboard?.stats;

        /*
         * ---------------------------------------------------
         * COMPANY PROFILE
         * ---------------------------------------------------
         */
        if (data.company_name) {
          setCompanyName(
            data.company_name
          );
        }

        /*
         * ---------------------------------------------------
         * DASHBOARD STATISTICS
         * ---------------------------------------------------
         */

        setActiveJobs(
          Number(
            stats?.active_opportunities ?? 0
          )
        );

        setTotalApplications(
          Number(
            stats?.total_applications ?? 0
          )
        );

        setShortlisted(
          Number(
            stats?.shortlisted ?? 0
          )
        );

        setInterviews(
          Number(
            stats?.interviews ?? 0
          )
        );

        /*
         * ---------------------------------------------------
         * RECENT APPLICATIONS
         * ---------------------------------------------------
         */

        setRecentApplications(
          Array.isArray(
            data.dashboard?.recent_applications
          )
            ? data.dashboard
                ?.recent_applications ?? []
            : []
        );
      } catch (error) {
        console.log(
          'Error loading dashboard data:',
          error
        );
      }
    },
    []
  );

  /*
   * Reload whenever dashboard gets focus.
   */
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const stats = [
    {
      label: 'Active Opportunities',
      value: activeJobs.toString(),
      icon: '▣',
      accent: '#2563EB',
      iconBackground: '#EFF6FF',
    },
    {
      label: 'Total Applications',
      value: totalApplications.toString(),
      icon: '▤',
      accent: '#D4A72C',
      iconBackground: '#FFF8E7',
    },
    {
      label: 'Shortlisted',
      value: shortlisted.toString(),
      icon: '☆',
      accent: '#2563EB',
      iconBackground: '#EFF6FF',
    },
    {
      label: 'Interviews',
      value: interviews.toString(),
      icon: '□',
      accent: '#D4A72C',
      iconBackground: '#FFF8E7',
    },
  ];

  const openCompanyProfile = () => {
    router.replace('/business/company-profile');
  };

  /*
   * -------------------------------------------------------
   * OPEN REAL CANDIDATE APPLICATION
   * -------------------------------------------------------
   */
  const openCandidate = (
    application: RecentApplication
  ) => {
    router.push({
      pathname:
        '/business/candidate-profile',
      params: {
        name:
          application.student_name ||
          'Candidate',

        opportunity:
          application.opportunity_title ||
          'Opportunity',

        studentId:
          String(
            application.student_id
          ),

        opportunityId:
          String(
            application.opportunity_id
          ),

        applicationId:
          String(
            application.application_id
          ),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerAccent} />

          <View style={styles.headerTop}>
            {/* COMPANY PROFILE */}
            <Pressable
              style={styles.profileArea}
              onPress={openCompanyProfile}
              android_ripple={{
                color: '#1E40AF',
              }}
            >
              <View style={styles.companyAvatar}>
                <Text style={styles.avatarText}>
                  {getInitials(companyName)}
                </Text>
              </View>

              <View style={styles.companyInfo}>
                <Text style={styles.greeting}>
                  Good morning
                </Text>

                <Text
                  style={styles.companyName}
                  numberOfLines={1}
                >
                  {companyName}
                </Text>

                <Text style={styles.profileHint}>
                  View company profile
                </Text>
              </View>
            </Pressable>

            {/* NOTIFICATIONS */}
            <Pressable
              style={styles.notificationButton}
              onPress={() =>
                router.push(
                  '/business/notifications'
                )
              }
              hitSlop={10}
            >
              <Text
                style={styles.notificationIcon}
              >
                🔔
              </Text>

              <View
                style={styles.notificationDot}
              />
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleAccent} />

            <View style={styles.titleContent}>
              <Text style={styles.headerTitle}>
                Business Dashboard
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage opportunities, applications and
                candidates.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* STATISTICS */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View
                style={styles.statCard}
                key={stat.label}
              >
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        stat.iconBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statIconText,
                      {
                        color: stat.accent,
                      },
                    ]}
                  >
                    {stat.icon}
                  </Text>
                </View>

                <Text
                  style={styles.statValue}
                >
                  {stat.value}
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  {stat.label}
                </Text>

                <View
                  style={[
                    styles.statAccent,
                    {
                      backgroundColor:
                        stat.accent,
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Quick Actions
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  Get things done faster
                </Text>
              </View>

              <View style={styles.sectionBadge}>
                <Text
                  style={styles.sectionBadgeText}
                >
                  BUSINESS
                </Text>
              </View>
            </View>

            <View
              style={styles.actionsGrid}
            >
              <ActionButton
                icon="+"
                title="Post Opportunity"
                onPress={() =>
                  router.push(
                    '/business/post-opportunity'
                  )
                }
              />

              <ActionButton
                icon="▣"
                title="Manage Opportunities"
                onPress={() =>
                  router.push(
                    '/business/manage-opportunities'
                  )
                }
              />

              <ActionButton
                icon="○"
                title="View Candidates"
                onPress={() =>
                  router.push(
                    '/business/candidates'
                  )
                }
              />

              <ActionButton
                icon="▤"
                title="Applications"
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              />
            </View>
          </View>

          {/* RECRUITMENT OVERVIEW */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Recruitment Overview
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Track your current hiring activity
                </Text>
              </View>

              <View
                style={styles.overviewIcon}
              >
                <Text
                  style={styles.overviewIconText}
                >
                  ↗
                </Text>
              </View>
            </View>

            <View
              style={styles.overviewList}
            >
              <OverviewRow
                label="Active opportunities"
                value={activeJobs}
                accent="#2563EB"
                onPress={() =>
                  router.push(
                    '/business/manage-opportunities'
                  )
                }
              />

              <View
                style={styles.overviewDivider}
              />

              <OverviewRow
                label="Applications received"
                value={totalApplications}
                accent="#D4A72C"
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              />

              <View
                style={styles.overviewDivider}
              />

              <OverviewRow
                label="Candidates shortlisted"
                value={shortlisted}
                accent="#2563EB"
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              />

              <View
                style={styles.overviewDivider}
              />

              <OverviewRow
                label="Candidates in interview"
                value={interviews}
                accent="#D4A72C"
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              />
            </View>
          </View>

          {/* RECENT APPLICATIONS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Recent Applications
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  Your latest candidate activity
                </Text>
              </View>

              <Pressable
                style={styles.seeAllButton}
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              >
                <Text style={styles.seeAll}>
                  See all
                </Text>

                <Text
                  style={styles.seeAllArrow}
                >
                  →
                </Text>
              </Pressable>
            </View>

            {recentApplications.length > 0 ? (
              recentApplications
                .slice(0, 3)
                .map((application) => (
                  <CandidateRow
                    key={
                      application.application_id
                    }
                    initials={getInitials(
                      application.student_name ||
                        'Candidate'
                    )}
                    name={
                      application.student_name ||
                      'Candidate'
                    }
                    title={
                      application.opportunity_title ||
                      'Opportunity'
                    }

                    /*
                     * The current business dashboard
                     * endpoint does not return an AI
                     * match percentage.
                     */
                    match="—"

                    onPress={() =>
                      openCandidate(
                        application
                      )
                    }
                  />
                ))
            ) : (
              <View
                style={
                  styles.emptyApplications
                }
              >
                <Text
                  style={
                    styles.emptyApplicationsText
                  }
                >
                  No applications received yet.
                </Text>
              </View>
            )}
          </View>

          {/* COMPANY PROFILE SHORTCUT */}
          <View style={styles.profileShortcut}>
            <View
              style={
                styles.profileShortcutIcon
              }
            >
              <Text
                style={
                  styles.profileShortcutInitials
                }
              >
                {getInitials(companyName)}
              </Text>
            </View>

            <View
              style={
                styles.profileShortcutContent
              }
            >
              <View
                style={styles.profileLabelRow}
              >
                <Text
                  style={
                    styles.profileShortcutTitle
                  }
                >
                  {companyName}
                </Text>

                <View
                  style={styles.profileStatus}
                >
                  <View
                    style={styles.profileStatusDot}
                  />

                  <Text
                    style={styles.profileStatusText}
                  >
                    Active
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.profileShortcutText
                }
              >
                Keep your company information
                up to date.
              </Text>
            </View>

            <Pressable
              style={
                styles.profileShortcutButton
              }
              onPress={openCompanyProfile}
            >
              <Text
                style={
                  styles.profileShortcutButtonText
                }
              >
                View
              </Text>
            </Pressable>
          </View>

          {/* LOGOUT */}
          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              await AsyncStorage.removeItem(
                'authToken'
              );

              await AsyncStorage.removeItem(
                'user'
              );

              router.replace('/login');
            }}
          >
            <Text style={styles.logoutIcon}>
              ↪
            </Text>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {/* HOME */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/dashboard'
            )
          }
        >
          <View
            style={[
              styles.navIconContainer,
              styles.navIconContainerActive,
            ]}
          >
            <Text
              style={[
                styles.navIcon,
                styles.navIconActive,
              ]}
            >
              ⌂
            </Text>
          </View>

          <Text
            style={[
              styles.navLabel,
              styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* MESSAGES */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/messages'
            )
          }
        >
          <View
            style={styles.navIconContainer}
          >
            <Text style={styles.navIcon}>
              ◇
            </Text>
          </View>

          <Text style={styles.navLabel}>
            Messages
          </Text>
        </Pressable>

        {/* PROFILE */}
        <Pressable
          style={styles.navItem}
          onPress={openCompanyProfile}
        >
          <View
            style={styles.navIconContainer}
          >
            <Text
              style={styles.profileNavIcon}
            >
              {getInitials(companyName)}
            </Text>
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- HELPERS ---------------- */

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'AT';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`
    .toUpperCase();
}

/* ---------------- ACTION BUTTON ---------------- */

function ActionButton({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionButton}
      onPress={onPress}
      android_ripple={{
        color: '#E8F0FF',
      }}
    >
      <View
        style={styles.actionIconContainer}
      >
        <Text style={styles.actionIcon}>
          {icon}
        </Text>
      </View>

      <Text style={styles.actionText}>
        {title}
      </Text>

      <Text style={styles.actionArrow}>
        →
      </Text>
    </Pressable>
  );
}

/* ---------------- OVERVIEW ROW ---------------- */

function OverviewRow({
  label,
  value,
  accent,
  onPress,
}: {
  label: string;
  value: number;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.overviewRow}
      onPress={onPress}
    >
      <View style={styles.overviewLeft}>
        <View
          style={[
            styles.overviewIndicator,
            {
              backgroundColor: accent,
            },
          ]}
        />

        <Text
          style={styles.overviewLabel}
        >
          {label}
        </Text>
      </View>

      <View
        style={styles.overviewRight}
      >
        <Text
          style={[
            styles.overviewValue,
            {
              color: accent,
            },
          ]}
        >
          {value}
        </Text>

        <Text
          style={styles.overviewArrow}
        >
          ›
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------------- CANDIDATE ROW ---------------- */

function CandidateRow({
  initials,
  name,
  title,
  match,
  onPress,
}: {
  initials: string;
  name: string;
  title: string;
  match: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.candidateRow}
      onPress={onPress}
    >
      <View
        style={styles.candidateAvatar}
      >
        <Text
          style={
            styles.candidateAvatarText
          }
        >
          {initials}
        </Text>
      </View>

      <View
        style={styles.candidateInfo}
      >
        <Text
          style={styles.candidateName}
        >
          {name}
        </Text>

        <Text
          style={styles.candidateTitle}
        >
          {title}
        </Text>
      </View>

      <View style={styles.matchContainer}>
        <Text style={styles.match}>
          {match}
        </Text>

        <Text style={styles.matchLabel}>
          match
        </Text>
      </View>

      <Text
        style={styles.candidateArrow}
      >
        ›
      </Text>
    </Pressable>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  scrollContent: {
    paddingBottom: 25,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 30,
    overflow: 'hidden',
  },

  headerAccent: {
    position: 'absolute',
    right: -35,
    top: -45,
    width: 145,
    height: 145,
    borderRadius: 75,
    backgroundColor: '#16365F',
    opacity: 0.8,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 14,
    borderRadius: 14,
    minHeight: 62,
    overflow: 'hidden',
  },

  companyAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F83E8',
  },

  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  companyInfo: {
    marginLeft: 12,
    flex: 1,
  },

  greeting: {
    color: '#B8C7D9',
    fontSize: 12,
  },

  companyName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },

  profileHint: {
    color: '#8DB7F5',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },

  /* NOTIFICATIONS */

  notificationButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#172F52',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#244467',
  },

  notificationIcon: {
    fontSize: 20,
  },

  notificationDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    borderWidth: 1,
    borderColor: '#172F52',
  },

  /* TITLE */

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  titleAccent: {
    width: 4,
    height: 52,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    marginRight: 12,
  },

  titleContent: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#BFD0E5',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },

  /* CONTENT */

  content: {
    padding: 20,
    marginTop: -8,
  },

  /* STATISTICS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    alignItems: 'center',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
    overflow: 'hidden',
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  statIconText: {
    fontSize: 22,
    fontWeight: '800',
  },

  statValue: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },

  statAccent: {
    width: 28,
    height: 3,
    borderRadius: 3,
    marginTop: 11,
  },

  /* GENERAL CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.035,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#7B8798',
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionBadge: {
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },

  /* QUICK ACTIONS */

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  actionButton: {
    width: '48%',
    minHeight: 66,
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    padding: 11,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },

  actionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EDF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  actionIcon: {
    fontSize: 17,
    color: '#2563EB',
    fontWeight: '800',
  },

  actionText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },

  actionArrow: {
    fontSize: 15,
    color: '#94A3B8',
    marginLeft: 3,
  },

  /* RECRUITMENT OVERVIEW */

  overviewIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overviewIconText: {
    color: '#B78B19',
    fontSize: 17,
    fontWeight: '800',
  },

  overviewList: {
    marginTop: 12,
  },

  overviewRow: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  overviewIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 10,
  },

  overviewLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  overviewRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewValue: {
    fontSize: 17,
    fontWeight: '800',
  },

  overviewArrow: {
    fontSize: 22,
    color: '#A3ADBA',
    marginLeft: 8,
    marginTop: -2,
  },

  overviewDivider: {
    height: 1,
    backgroundColor: '#EEF1F5',
    marginLeft: 17,
  },

  /* RECENT APPLICATIONS */

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
  },

  seeAll: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 11,
  },

  seeAllArrow: {
    color: '#2563EB',
    fontSize: 13,
    marginLeft: 4,
  },

  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    paddingVertical: 5,
    borderRadius: 12,
  },

  candidateAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  candidateAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  candidateInfo: {
    flex: 1,
  },

  candidateName: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },

  candidateTitle: {
    color: '#8A96A6',
    fontSize: 11,
    marginTop: 3,
  },

  matchContainer: {
    alignItems: 'center',
    marginRight: 6,
  },

  match: {
    color: '#047857',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },

  matchLabel: {
    color: '#94A3B8',
    fontSize: 8,
    marginTop: 2,
  },

  candidateArrow: {
    color: '#A3ADBA',
    fontSize: 22,
  },

  emptyApplications: {
    alignItems: 'center',
    paddingVertical: 22,
  },

  emptyApplicationsText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },

  /* PROFILE SHORTCUT */

  profileShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.035,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  profileShortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A72C',
  },

  profileShortcutInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  profileShortcutContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  profileLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  profileShortcutTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },

  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
  },

  profileStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },

  profileStatusText: {
    color: '#047857',
    fontSize: 8,
    fontWeight: '800',
  },

  profileShortcutText: {
    color: '#7B8798',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },

  profileShortcutButton: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },

  profileShortcutButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* LOGOUT */

  logoutButton: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1E6ED',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },

  logoutIcon: {
    fontSize: 17,
    marginRight: 7,
    color: '#64748B',
  },

  logoutText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 90,
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingBottom: 4,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },

  navIconContainer: {
    width: 42,
    height: 33,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainerActive: {
    backgroundColor: '#EFF6FF',
  },

  navIcon: {
    fontSize: 20,
    color: '#7B8798',
    fontWeight: '700',
  },

  navIconActive: {
    color: '#2563EB',
  },

  profileNavIcon: {
    fontSize: 10,
    color: '#7B8798',
    fontWeight: '900',
  },

  navLabel: {
    fontSize: 9,
    color: '#7B8798',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
});