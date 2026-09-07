import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function AdminDashboard() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back 👋
          </Text>

          <Text style={styles.name}>
            Admin
          </Text>

          <Text style={styles.subtitle}>
            CareerForgeAI Administration
          </Text>
        </View>

        <Pressable
          style={styles.notificationButton}
          onPress={() =>
            router.push('/admin/notifications')
          }
        >
          <Text style={styles.notificationIcon}>
            🔔
          </Text>
        </Pressable>
      </View>

      {/* Overview */}
      <Text style={styles.sectionTitle}>
        Platform Overview
      </Text>

      <View style={styles.statsGrid}>
        {/* Students */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎓</Text>

          <Text style={styles.statValue}>
            1,248
          </Text>

          <Text style={styles.statLabel}>
            Students
          </Text>
        </View>

        {/* Alumni */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👨‍🎓</Text>

          <Text style={styles.statValue}>
            386
          </Text>

          <Text style={styles.statLabel}>
            Alumni
          </Text>
        </View>

        {/* Businesses */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏢</Text>

          <Text style={styles.statValue}>
            74
          </Text>

          <Text style={styles.statLabel}>
            Businesses
          </Text>
        </View>

        {/* Opportunities */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💼</Text>

          <Text style={styles.statValue}>
            192
          </Text>

          <Text style={styles.statLabel}>
            Opportunities
          </Text>
        </View>
      </View>

      {/* Pending Approvals */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Pending Approvals
        </Text>

        <Pressable
          onPress={() =>
            router.push('/admin/approvals')
          }
        >
          <Text style={styles.viewAll}>
            View All
          </Text>
        </Pressable>
      </View>

      <View style={styles.approvalCard}>
        <View style={styles.approvalIcon}>
          <Text>🏢</Text>
        </View>

        <View style={styles.approvalInfo}>
          <Text style={styles.approvalTitle}>
            Business Verifications
          </Text>

          <Text style={styles.approvalDescription}>
            6 businesses waiting for approval
          </Text>
        </View>

        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            6
          </Text>
        </View>
      </View>

      <View style={styles.approvalCard}>
        <View style={styles.approvalIcon}>
          <Text>🎓</Text>
        </View>

        <View style={styles.approvalInfo}>
          <Text style={styles.approvalTitle}>
            Alumni Verification
          </Text>

          <Text style={styles.approvalDescription}>
            4 certificates waiting for review
          </Text>
        </View>

        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            4
          </Text>
        </View>
      </View>

      {/* Management */}
      <Text style={styles.sectionTitle}>
        Management
      </Text>

      <View style={styles.actionGrid}>

        {/* User Management */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/admin/users')
          }
        >
          <Text style={styles.actionIcon}>
            👥
          </Text>

          <Text style={styles.actionTitle}>
            User
          </Text>

          <Text style={styles.actionTitle}>
            Management
          </Text>
        </Pressable>

        {/* Approvals */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/admin/approvals')
          }
        >
          <Text style={styles.actionIcon}>
            ✅
          </Text>

          <Text style={styles.actionTitle}>
            Verification
          </Text>

          <Text style={styles.actionTitle}>
            Approvals
          </Text>
        </Pressable>

        {/* Opportunities */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/admin/opportunities')
          }
        >
          <Text style={styles.actionIcon}>
            💼
          </Text>

          <Text style={styles.actionTitle}>
            Opportunity
          </Text>

          <Text style={styles.actionTitle}>
            Management
          </Text>
        </Pressable>

        {/* Analytics */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/admin/analytics')
          }
        >
          <Text style={styles.actionIcon}>
            📊
          </Text>

          <Text style={styles.actionTitle}>
            Platform
          </Text>

          <Text style={styles.actionTitle}>
            Analytics
          </Text>
        </Pressable>

        {/* Badges & Credits */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/admin/rewards')
          }
        >
          <Text style={styles.actionIcon}>
            🏆
          </Text>

          <Text style={styles.actionTitle}>
            Badges &
          </Text>

          <Text style={styles.actionTitle}>
            Credits
          </Text>
        </Pressable>

      </View>

      {/* Platform Activity */}
      <Text style={styles.sectionTitle}>
        Recent Activity
      </Text>

      <View style={styles.activityCard}>
        <View style={styles.activityIcon}>
          <Text>🏢</Text>
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>
            New business registration
          </Text>

          <Text style={styles.activityDescription}>
            TechNova Solutions submitted a verification request.
          </Text>

          <Text style={styles.activityTime}>
            10 minutes ago
          </Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityIcon}>
          <Text>🎓</Text>
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>
            Alumni certificate uploaded
          </Text>

          <Text style={styles.activityDescription}>
            A new alumni verification requires review.
          </Text>

          <Text style={styles.activityTime}>
            32 minutes ago
          </Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityIcon}>
          <Text>💼</Text>
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>
            New opportunity posted
          </Text>

          <Text style={styles.activityDescription}>
            Junior Data Analyst opportunity was published.
          </Text>

          <Text style={styles.activityTime}>
            1 hour ago
          </Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={() =>
          router.replace('/login')
        }
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 45,
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greeting: {
    color: '#DCE6F2',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#B8C8DB',
    fontSize: 12,
    marginTop: 4,
  },

  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    fontSize: 21,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  statIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  statValue: {
    color: '#0B1F3A',
    fontSize: 24,
    fontWeight: '800',
  },

  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAll: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    flexDirection: 'row',
    alignItems: 'center',
  },

  approvalIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  approvalInfo: {
    flex: 1,
  },

  approvalTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  approvalDescription: {
    color: '#64748B',
    fontSize: 12,
  },

  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  actionCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    justifyContent: 'center',
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  actionTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    flexDirection: 'row',
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  activityDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },

  activityTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  logoutButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  logoutText: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
  },
});