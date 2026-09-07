import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

export default function AdminAnalytics() {
  const stats = [
    {
      label: 'Total Users',
      value: '1,708',
      change: '+12%',
      icon: '👥',
    },
    {
      label: 'Students',
      value: '1,248',
      change: '+9%',
      icon: '🎓',
    },
    {
      label: 'Alumni',
      value: '386',
      change: '+7%',
      icon: '👨‍💼',
    },
    {
      label: 'Businesses',
      value: '74',
      change: '+14%',
      icon: '🏢',
    },
  ];

  const userDistribution = [
    { label: 'Students', value: 73, count: '1,248' },
    { label: 'Alumni', value: 23, count: '386' },
    { label: 'Businesses', value: 4, count: '74' },
  ];

  const opportunityStats = [
    {
      label: 'Total Opportunities',
      value: '192',
      icon: '💼',
    },
    {
      label: 'Approved',
      value: '146',
      icon: '✅',
    },
    {
      label: 'Pending',
      value: '32',
      icon: '⏳',
    },
    {
      label: 'Rejected',
      value: '14',
      icon: '❌',
    },
  ];

  const applicationStats = [
    {
      label: 'Total Applications',
      value: '229',
      icon: '📄',
    },
    {
      label: 'Under Review',
      value: '84',
      icon: '🔍',
    },
    {
      label: 'Shortlisted',
      value: '61',
      icon: '⭐',
    },
    {
      label: 'Successful',
      value: '38',
      icon: '🎉',
    },
  ];

  const activity = [
    {
      icon: '👤',
      title: 'New student registered',
      description: 'Michael Naidoo joined the platform',
      time: '10 min ago',
    },
    {
      icon: '🏢',
      title: 'Business approval completed',
      description: 'TechNova Solutions was approved',
      time: '32 min ago',
    },
    {
      icon: '💼',
      title: 'New opportunity posted',
      description: 'Junior Data Analyst was submitted',
      time: '1 hour ago',
    },
    {
      icon: '🎓',
      title: 'Alumni profile completed',
      description: 'Amanda Naidoo completed her profile',
      time: '2 hours ago',
    },
    {
      icon: '📄',
      title: 'Application submitted',
      description: 'A student applied for Software Developer Intern',
      time: '3 hours ago',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Platform Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Monitor CareerForgeAI performance
            </Text>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <Text style={styles.sectionSubtitle}>Current statistics</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIcon}>
                  <Text>{stat.icon}</Text>
                </View>

                <Text style={styles.changeText}>{stat.change}</Text>
              </View>

              <Text style={styles.statValue}>{stat.value}</Text>

              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* User Distribution */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Distribution</Text>
          <Text style={styles.sectionSubtitle}>By account type</Text>
        </View>

        <View style={styles.card}>
          {userDistribution.map((item) => (
            <View key={item.label} style={styles.distributionRow}>
              <View style={styles.distributionHeader}>
                <Text style={styles.distributionLabel}>
                  {item.label}
                </Text>

                <Text style={styles.distributionCount}>
                  {item.count} ({item.value}%)
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.value}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Opportunities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Opportunity Statistics</Text>
          <Text style={styles.sectionSubtitle}>Current listings</Text>
        </View>

        <View style={styles.statsGrid}>
          {opportunityStats.map((item) => (
            <View key={item.label} style={styles.smallStatCard}>
              <View style={styles.smallIcon}>
                <Text style={styles.smallIconText}>{item.icon}</Text>
              </View>

              <Text style={styles.smallStatValue}>{item.value}</Text>

              <Text style={styles.smallStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Applications */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Application Statistics</Text>
          <Text style={styles.sectionSubtitle}>Application pipeline</Text>
        </View>

        <View style={styles.statsGrid}>
          {applicationStats.map((item) => (
            <View key={item.label} style={styles.smallStatCard}>
              <View style={styles.smallIcon}>
                <Text style={styles.smallIconText}>{item.icon}</Text>
              </View>

              <Text style={styles.smallStatValue}>{item.value}</Text>

              <Text style={styles.smallStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Platform Performance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Performance</Text>
          <Text style={styles.sectionSubtitle}>Key indicators</Text>
        </View>

        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <View>
              <Text style={styles.performanceTitle}>
                Profile Completion
              </Text>
              <Text style={styles.performanceDescription}>
                Users with completed profiles
              </Text>
            </View>

            <Text style={styles.performanceValue}>78%</Text>
          </View>

          <View style={styles.performanceBarBackground}>
            <View
              style={[
                styles.performanceBarFill,
                { width: '78%' },
              ]}
            />
          </View>

          <View style={styles.performanceRow}>
            <View>
              <Text style={styles.performanceTitle}>
                Opportunity Approval Rate
              </Text>
              <Text style={styles.performanceDescription}>
                Opportunities approved by admin
              </Text>
            </View>

            <Text style={styles.performanceValue}>76%</Text>
          </View>

          <View style={styles.performanceBarBackground}>
            <View
              style={[
                styles.performanceBarFill,
                { width: '76%' },
              ]}
            />
          </View>

          <View style={styles.performanceRow}>
            <View>
              <Text style={styles.performanceTitle}>
                Application Success Rate
              </Text>
              <Text style={styles.performanceDescription}>
                Successful applications
              </Text>
            </View>

            <Text style={styles.performanceValue}>17%</Text>
          </View>

          <View style={styles.performanceBarBackground}>
            <View
              style={[
                styles.performanceBarFill,
                { width: '17%' },
              ]}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>Latest platform events</Text>
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
                <Text>{item.icon}</Text>
              </View>

              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {item.title}
                </Text>

                <Text style={styles.activityDescription}>
                  {item.description}
                </Text>

                <Text style={styles.activityTime}>
                  {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 24,
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

  backText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
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

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0B1F3A',
    marginTop: 12,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  distributionRow: {
    marginBottom: 17,
  },

  distributionRowLast: {
    marginBottom: 0,
  },

  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  distributionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  distributionCount: {
    fontSize: 12,
    color: '#64748B',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
  },

  smallStatCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallIconText: {
    fontSize: 18,
  },

  smallStatValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0B1F3A',
    marginTop: 10,
  },

  smallStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  performanceCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 3,
  },

  performanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  performanceDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    maxWidth: 245,
  },

  performanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  performanceBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },

  performanceBarFill: {
    height: '100%',
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
  },

  activityCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  activityRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  activityRowLast: {
    borderBottomWidth: 0,
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  activityDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },

  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 5,
  },

  footerSpace: {
    height: 20,
  },
});