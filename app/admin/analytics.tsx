import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAnalytics() {
  const stats = [
    {
      label: 'Total Users',
      value: '1,708',
      change: '+12%',
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: 'Students',
      value: '1,248',
      change: '+9%',
      icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: 'Alumni',
      value: '386',
      change: '+7%',
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: 'Businesses',
      value: '74',
      change: '+14%',
      icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  const userDistribution = [
    {
      label: 'Students',
      value: 73,
      count: '1,248',
      icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: 'Alumni',
      value: 23,
      count: '386',
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
    },
    {
      label: 'Businesses',
      value: 4,
      count: '74',
      icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
    },
  ];

  const opportunityStats = [
    {
      label: 'Total Opportunities',
      value: '192',
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'blue',
    },
    {
      label: 'Approved',
      value: '146',
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'green',
    },
    {
      label: 'Pending',
      value: '32',
      icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'orange',
    },
    {
      label: 'Rejected',
      value: '14',
      icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'red',
    },
  ];

  const applicationStats = [
    {
      label: 'Total Applications',
      value: '229',
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'blue',
    },
    {
      label: 'Under Review',
      value: '84',
      icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'orange',
    },
    {
      label: 'Shortlisted',
      value: '61',
      icon: 'star-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'purple',
    },
    {
      label: 'Successful',
      value: '38',
      icon: 'checkmark-done-outline' as keyof typeof Ionicons.glyphMap,
      tone: 'green',
    },
  ];

  const activity = [
    {
      icon: 'person-add-outline' as keyof typeof Ionicons.glyphMap,
      title: 'New student registered',
      description: 'Michael Naidoo joined the platform',
      time: '10 min ago',
    },
    {
      icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Business approval completed',
      description: 'TechNova Solutions was approved',
      time: '32 min ago',
    },
    {
      icon: 'briefcase-outline' as keyof typeof Ionicons.glyphMap,
      title: 'New opportunity posted',
      description: 'Junior Data Analyst was submitted',
      time: '1 hour ago',
    },
    {
      icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Alumni profile completed',
      description: 'Amanda Naidoo completed her profile',
      time: '2 hours ago',
    },
    {
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Application submitted',
      description:
        'A student applied for Software Developer Intern',
      time: '3 hours ago',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
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
            <Ionicons
              name="chevron-back"
              size={23}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <View style={styles.headerEyebrow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerEyebrowText}>
                ADMIN INSIGHTS
              </Text>
            </View>

            <Text style={styles.headerTitle}>
              Platform Analytics
            </Text>

            <Text style={styles.headerSubtitle}>
              Monitor CareerForgeAI performance
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* QUICK INSIGHT */}
        <View style={styles.insightBanner}>
          <View style={styles.insightIcon}>
            <Ionicons
              name="trending-up-outline"
              size={23}
              color="#2457E6"
            />
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Platform growth is healthy
            </Text>

            <Text style={styles.insightText}>
              User activity and opportunity listings are
              continuing to increase.
            </Text>
          </View>

          <View style={styles.insightArrow}>
            <Ionicons
              name="arrow-up"
              size={17}
              color="#16A34A"
            />
          </View>
        </View>

        {/* PLATFORM OVERVIEW */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Platform Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current platform statistics
            </Text>
          </View>

          <View style={styles.sectionBadge}>
            <Ionicons
              name="pulse-outline"
              size={14}
              color="#2457E6"
            />
            <Text style={styles.sectionBadgeText}>
              Live
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={styles.statCard}
            >
              <View style={styles.statTop}>
                <View style={styles.statIcon}>
                  <Ionicons
                    name={stat.icon}
                    size={21}
                    color="#2457E6"
                  />
                </View>

                <View style={styles.changeBadge}>
                  <Ionicons
                    name="trending-up"
                    size={12}
                    color="#16A34A"
                  />

                  <Text style={styles.changeText}>
                    {stat.change}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.statValue}>
                  {stat.value}
                </Text>

                <Text style={styles.statLabel}>
                  {stat.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* USER DISTRIBUTION */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              User Distribution
            </Text>

            <Text style={styles.sectionSubtitle}>
              Breakdown by account type
            </Text>
          </View>

          <View style={styles.sectionIconCircle}>
            <Ionicons
              name="pie-chart-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.distributionCard}>
          <View style={styles.distributionIntro}>
            <View>
              <Text style={styles.distributionTotal}>
                1,708
              </Text>

              <Text style={styles.distributionTotalLabel}>
                Registered users
              </Text>
            </View>

            <View style={styles.distributionTrend}>
              <Ionicons
                name="arrow-up"
                size={13}
                color="#16A34A"
              />

              <Text style={styles.distributionTrendText}>
                12% this month
              </Text>
            </View>
          </View>

          {userDistribution.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.distributionRow,
                index === userDistribution.length - 1 &&
                  styles.distributionRowLast,
              ]}
            >
              <View style={styles.distributionHeader}>
                <View style={styles.distributionLeft}>
                  <View style={styles.distributionIcon}>
                    <Ionicons
                      name={item.icon}
                      size={17}
                      color="#2457E6"
                    />
                  </View>

                  <View>
                    <Text style={styles.distributionLabel}>
                      {item.label}
                    </Text>

                    <Text style={styles.distributionSmallText}>
                      {item.count} users
                    </Text>
                  </View>
                </View>

                <Text style={styles.distributionCount}>
                  {item.value}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.value}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* OPPORTUNITIES */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Opportunity Statistics
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current opportunity listings
            </Text>
          </View>

          <View style={styles.sectionIconCircle}>
            <Ionicons
              name="briefcase-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {opportunityStats.map((item) => (
            <View
              key={item.label}
              style={styles.smallStatCard}
            >
              <View
                style={[
                  styles.smallIcon,
                  item.tone === 'green' &&
                    styles.smallIconGreen,
                  item.tone === 'orange' &&
                    styles.smallIconOrange,
                  item.tone === 'red' &&
                    styles.smallIconRed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    item.tone === 'green'
                      ? '#16A34A'
                      : item.tone === 'orange'
                      ? '#D97706'
                      : item.tone === 'red'
                      ? '#DC2626'
                      : '#2457E6'
                  }
                />
              </View>

              <Text style={styles.smallStatValue}>
                {item.value}
              </Text>

              <Text style={styles.smallStatLabel}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* APPLICATIONS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Application Statistics
            </Text>

            <Text style={styles.sectionSubtitle}>
              Track the application pipeline
            </Text>
          </View>

          <View style={styles.sectionIconCircle}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {applicationStats.map((item) => (
            <View
              key={item.label}
              style={styles.smallStatCard}
            >
              <View
                style={[
                  styles.smallIcon,
                  item.tone === 'green' &&
                    styles.smallIconGreen,
                  item.tone === 'orange' &&
                    styles.smallIconOrange,
                  item.tone === 'purple' &&
                    styles.smallIconPurple,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    item.tone === 'green'
                      ? '#16A34A'
                      : item.tone === 'orange'
                      ? '#D97706'
                      : item.tone === 'purple'
                      ? '#7C3AED'
                      : '#2457E6'
                  }
                />
              </View>

              <Text style={styles.smallStatValue}>
                {item.value}
              </Text>

              <Text style={styles.smallStatLabel}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* PLATFORM PERFORMANCE */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Platform Performance
            </Text>

            <Text style={styles.sectionSubtitle}>
              Key indicators and success rates
            </Text>
          </View>

          <View style={styles.sectionIconCircle}>
            <Ionicons
              name="speedometer-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.performanceCard}>
          {/* PROFILE COMPLETION */}
          <View style={styles.performanceRow}>
            <View style={styles.performanceIcon}>
              <Ionicons
                name="person-circle-outline"
                size={21}
                color="#2457E6"
              />
            </View>

            <View style={styles.performanceTextContainer}>
              <Text style={styles.performanceTitle}>
                Profile Completion
              </Text>

              <Text style={styles.performanceDescription}>
                Users with completed profiles
              </Text>
            </View>

            <Text style={styles.performanceValue}>
              78%
            </Text>
          </View>

          <View style={styles.performanceBarBackground}>
            <View
              style={[
                styles.performanceBarFill,
                { width: '78%' },
              ]}
            />
          </View>

          {/* APPROVAL RATE */}
          <View style={styles.performanceRow}>
            <View style={styles.performanceIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#16A34A"
              />
            </View>

            <View style={styles.performanceTextContainer}>
              <Text style={styles.performanceTitle}>
                Opportunity Approval Rate
              </Text>

              <Text style={styles.performanceDescription}>
                Opportunities approved by admin
              </Text>
            </View>

            <Text
              style={[
                styles.performanceValue,
                styles.performanceValueGreen,
              ]}
            >
              76%
            </Text>
          </View>

          <View style={styles.performanceBarBackground}>
            <View
              style={[
                styles.performanceBarFill,
                styles.performanceBarGreen,
                { width: '76%' },
              ]}
            />
          </View>

          {/* SUCCESS RATE */}
          <View style={styles.performanceRow}>
            <View style={styles.performanceIcon}>
              <Ionicons
                name="trophy-outline"
                size={21}
                color="#D97706"
              />
            </View>

            <View style={styles.performanceTextContainer}>
              <Text style={styles.performanceTitle}>
                Application Success Rate
              </Text>

              <Text style={styles.performanceDescription}>
                Successful applications
              </Text>
            </View>

            <Text
              style={[
                styles.performanceValue,
                styles.performanceValueOrange,
              ]}
            >
              17%
            </Text>
          </View>

          <View
            style={[
              styles.performanceBarBackground,
              styles.performanceBarLast,
            ]}
          >
            <View
              style={[
                styles.performanceBarFill,
                styles.performanceBarOrange,
                { width: '17%' },
              ]}
            />
          </View>
        </View>

        {/* PERFORMANCE SUMMARY */}
        <View style={styles.performanceSummary}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="analytics-outline"
              size={22}
              color="#2457E6"
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              Overall platform health
            </Text>

            <Text style={styles.summaryDescription}>
              CareerForgeAI is showing positive activity across
              users, opportunities and applications.
            </Text>
          </View>

          <View style={styles.healthBadge}>
            <Text style={styles.healthBadgeText}>
              Healthy
            </Text>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Activity
            </Text>

            <Text style={styles.sectionSubtitle}>
              Latest platform events
            </Text>
          </View>

          <View style={styles.sectionIconCircle}>
            <Ionicons
              name="time-outline"
              size={18}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.activityCard}>
          {activity.map((item, index) => (
            <View
              key={`${item.title}-${index}`}
              style={[
                styles.activityRow,
                index === activity.length - 1 &&
                  styles.activityRowLast,
              ]}
            >
              <View style={styles.activityIcon}>
                <Ionicons
                  name={item.icon}
                  size={19}
                  color="#2457E6"
                />
              </View>

              <View style={styles.activityContent}>
                <View style={styles.activityTitleRow}>
                  <Text style={styles.activityTitle}>
                    {item.title}
                  </Text>

                  <View style={styles.activityDot} />
                </View>

                <Text style={styles.activityDescription}>
                  {item.description}
                </Text>

                <View style={styles.activityTimeRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="#94A3B8"
                  />

                  <Text style={styles.activityTime}>
                    {item.time}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      {/* ADMIN BOTTOM NAVIGATION */}
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
          active={true}
          onPress={() =>
            router.replace('/admin/analytics')
          }
        />

        <AdminNavItem
          icon="people-outline"
          label="Users"
          active={false}
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
          active && styles.navIconWrapperActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={active ? '#2457E6' : '#64748B'}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingBottom: 125,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  liveDot: {
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
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* INSIGHT BANNER */

  insightBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  insightIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  insightContent: {
    flex: 1,
    paddingRight: 8,
  },

  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  insightText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    marginTop: 3,
  },

  insightArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SECTIONS */

  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  sectionBadgeText: {
    color: '#2457E6',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MAIN STAT CARDS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },

  statCard: {
    width: '48%',
    height: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
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
    alignItems: 'center',
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 3,
  },

  changeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },

  statValue: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  /* DISTRIBUTION */

  distributionCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  distributionIntro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  distributionTotal: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  distributionTotalLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  distributionTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },

  distributionTrendText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '800',
    marginLeft: 4,
  },

  distributionRow: {
    marginTop: 17,
    marginBottom: 1,
  },

  distributionRowLast: {
    marginBottom: 0,
  },

  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  distributionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  distributionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  distributionSmallText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  distributionCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E8EDF4',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2457E6',
    borderRadius: 10,
  },

  /* SMALL STAT CARDS */

  smallStatCard: {
    width: '48%',
    height: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
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

  smallIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallIconGreen: {
    backgroundColor: '#ECFDF3',
  },

  smallIconOrange: {
    backgroundColor: '#FFF7ED',
  },

  smallIconRed: {
    backgroundColor: '#FEF2F2',
  },

  smallIconPurple: {
    backgroundColor: '#F5F3FF',
  },

  smallStatValue: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  smallStatLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
  },

  /* PERFORMANCE */

  performanceCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 9,
  },

  performanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  performanceTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  performanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  performanceDescription: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },

  performanceValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#2457E6',
  },

  performanceValueGreen: {
    color: '#16A34A',
  },

  performanceValueOrange: {
    color: '#D97706',
  },

  performanceBarBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 19,
  },

  performanceBarLast: {
    marginBottom: 3,
  },

  performanceBarFill: {
    height: '100%',
    backgroundColor: '#2457E6',
    borderRadius: 10,
  },

  performanceBarGreen: {
    backgroundColor: '#16A34A',
  },

  performanceBarOrange: {
    backgroundColor: '#D97706',
  },

  /* PERFORMANCE SUMMARY */

  performanceSummary: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E5FF',
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  summaryContent: {
    flex: 1,
    paddingRight: 7,
  },

  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  summaryDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
    marginTop: 3,
  },

  healthBadge: {
    backgroundColor: '#ECFDF3',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  healthBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
  },

  /* ACTIVITY */

  activityCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  activityRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  activityRowLast: {
    borderBottomWidth: 0,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginLeft: 5,
  },

  activityDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },

  activityTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 4,
  },

  /* BOTTOM NAVIGATION */

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

  footerSpace: {
    height: 25,
  },
});