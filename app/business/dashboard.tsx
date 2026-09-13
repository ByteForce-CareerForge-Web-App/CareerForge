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

const OPPORTUNITIES_KEY =
  'careerforge_business_opportunities';

const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type Opportunity = {
  id: string;
  title?: string;
  company?: string;
  status?: string;
  [key: string]: any;
};

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

export default function BusinessDashboard() {
  const [activeJobs, setActiveJobs] = useState(4);
  const [totalApplications, setTotalApplications] =
    useState(229);
  const [shortlisted, setShortlisted] = useState(18);
  const [interviews, setInterviews] = useState(6);

  const [companyName, setCompanyName] =
    useState('ABC Technologies');

  const loadDashboardData = async () => {
    try {
      /* ---------------- COMPANY PROFILE ---------------- */

      const companySaved =
        await AsyncStorage.getItem(
          'careerforge_business_profile'
        );

      if (companySaved) {
        const profile = JSON.parse(companySaved);

        if (profile.companyName) {
          setCompanyName(profile.companyName);
        }
      }

      /* ---------------- OPPORTUNITIES ---------------- */

      const opportunitiesSaved =
        await AsyncStorage.getItem(
          OPPORTUNITIES_KEY
        );

      if (opportunitiesSaved) {
        const opportunities: Opportunity[] =
          JSON.parse(opportunitiesSaved);

        if (opportunities.length > 0) {
          const active = opportunities.filter(
            (opportunity) => {
              const status =
                String(
                  opportunity.status || ''
                )
                  .trim()
                  .toLowerCase();

              return status !== 'closed';
            }
          );

          setActiveJobs(active.length);
        }
      }

      /* ---------------- APPLICATION STATUSES ---------------- */

      const statusesSaved =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      if (statusesSaved) {
        const statuses = JSON.parse(
          statusesSaved
        );

        if (
          statuses &&
          typeof statuses === 'object' &&
          !Array.isArray(statuses)
        ) {
          const statusValues =
            Object.values(statuses).filter(
              (status): status is ApplicationStatus =>
                typeof status === 'string'
            );

          if (statusValues.length > 0) {
            setTotalApplications(
              statusValues.length
            );

            setShortlisted(
              statusValues.filter(
                (status) =>
                  status === 'Shortlisted' ||
                  status === 'Interview'
              ).length
            );

            setInterviews(
              statusValues.filter(
                (status) =>
                  status === 'Interview'
              ).length
            );
          }
        }
      }
    } catch (error) {
      console.log(
        'Error loading dashboard data:',
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const stats = [
    {
      label: 'Active Opportunities',
      value: activeJobs.toString(),
      icon: '▣',
    },
    {
      label: 'Total Applications',
      value: totalApplications.toString(),
      icon: '▤',
    },
    {
      label: 'Shortlisted',
      value: shortlisted.toString(),
      icon: '☆',
    },
    {
      label: 'Interviews',
      value: interviews.toString(),
      icon: '□',
    },
  ];

  const openCompanyProfile = () => {
    router.replace('/business/company-profile');
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

          <Text style={styles.headerTitle}>
            Business Dashboard
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage opportunities, applications and
            candidates.
          </Text>
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
                  style={styles.statIcon}
                >
                  <Text
                    style={
                      styles.statIconText
                    }
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
              </View>
            ))}
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

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
                title="Manage Jobs"
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
            </View>

            <View
              style={styles.overviewList}
            >
              <OverviewRow
                label="Active opportunities"
                value={activeJobs}
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
              <Text
                style={styles.sectionTitle}
              >
                Recent Applications
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    '/business/applications'
                  )
                }
              >
                <Text style={styles.seeAll}>
                  See all
                </Text>
              </Pressable>
            </View>

            <CandidateRow
              initials="SD"
              name="Sipho Dlamini"
              title="Graduate Data Analyst"
              match="94%"
              onPress={() =>
                router.push({
                  pathname:
                    '/business/candidate-profile',
                  params: {
                    name: 'Sipho Dlamini',
                    opportunity:
                      'Graduate Data Analyst',
                  },
                })
              }
            />

            <CandidateRow
              initials="NZ"
              name="Nomvula Zulu"
              title="Graduate Data Analyst"
              match="91%"
              onPress={() =>
                router.push({
                  pathname:
                    '/business/candidate-profile',
                  params: {
                    name: 'Nomvula Zulu',
                    opportunity:
                      'Graduate Data Analyst',
                  },
                })
              }
            />

            <CandidateRow
              initials="LK"
              name="Lethiwe Khumalo"
              title="Junior Frontend Developer"
              match="87%"
              onPress={() =>
                router.push({
                  pathname:
                    '/business/candidate-profile',
                  params: {
                    name: 'Lethiwe Khumalo',
                    opportunity:
                      'Junior Frontend Developer',
                  },
                })
              }
            />
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
              <Text
                style={
                  styles.profileShortcutTitle
                }
              >
                {companyName}
              </Text>

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
            onPress={() =>
              router.replace('/login')
            }
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
    </Pressable>
  );
}

/* ---------------- OVERVIEW ROW ---------------- */

function OverviewRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.overviewRow}
      onPress={onPress}
    >
      <Text
        style={styles.overviewLabel}
      >
        {label}
      </Text>

      <View
        style={styles.overviewRight}
      >
        <Text
          style={styles.overviewValue}
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

      <Text style={styles.match}>
        {match}
      </Text>

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
    backgroundColor: '#F8FAFC',
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
    color: '#CBD5E1',
    fontSize: 12,
  },

  companyName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },

  profileHint: {
    color: '#93C5FD',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },

  /* NOTIFICATIONS */

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#172B4D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 21,
  },

  notificationDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 25,
  },

  headerSubtitle: {
    color: '#BFDBFE',
    fontSize: 14,
    marginTop: 6,
  },

  /* CONTENT */

  content: {
    padding: 20,
    marginTop: -10,
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
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statIconText: {
    fontSize: 20,
    color: '#2563EB',
    fontWeight: '800',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  /* GENERAL CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* QUICK ACTIONS */

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  actionButton: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
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
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
    flex: 1,
  },

  /* RECRUITMENT OVERVIEW */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overviewList: {
    marginTop: 9,
  },

  overviewRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 16,
    color: '#0B1F3A',
    fontWeight: '800',
  },

  overviewArrow: {
    fontSize: 22,
    color: '#94A3B8',
    marginLeft: 8,
    marginTop: -2,
  },

  overviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  /* RECENT APPLICATIONS */

  seeAll: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },

  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 2,
  },

  candidateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
  },

  candidateTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },

  match: {
    color: '#047857',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },

  candidateArrow: {
    color: '#94A3B8',
    fontSize: 22,
  },

  /* PROFILE SHORTCUT */

  profileShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileShortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
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

  profileShortcutTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  profileShortcutText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  profileShortcutButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },

  profileShortcutButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  /* LOGOUT */

  logoutButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },

  logoutIcon: {
    fontSize: 17,
    marginRight: 7,
    color: '#0B1F3A',
  },

  logoutText: {
    color: '#0B1F3A',
    fontSize: 15,
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
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingBottom: 4,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },

  navIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainerActive: {
    backgroundColor: '#EFF6FF',
  },

  navIcon: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
  },

  navIconActive: {
    color: '#2563EB',
  },

  profileNavIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '900',
  },

  navLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
});