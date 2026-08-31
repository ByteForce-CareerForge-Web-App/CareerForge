import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function StudentDashboard() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name}>Student</Text>
        </View>

        <View style={styles.headerButtons}>
          {/* Notifications */}
          <Pressable
            style={styles.notificationButton}
            onPress={() => router.push('/student/notification')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>

          {/* Profile */}
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Employability Score */}
      <View style={styles.scoreCard}>
        <View>
          <Text style={styles.scoreLabel}>Employability Score</Text>
          <Text style={styles.score}>82%</Text>
          <Text style={styles.scoreDescription}>
            You're on the right track!
          </Text>
        </View>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreCircleText}>82</Text>
          <Text style={styles.scoreCirclePercent}>%</Text>
        </View>
      </View>

      {/* Career Credits */}
      <View style={styles.creditCard}>
        <View>
          <Text style={styles.creditLabel}>Career Credits</Text>
          <Text style={styles.creditAmount}>240 ⭐</Text>
        </View>

        <Text style={styles.creditDescription}>
          Keep completing activities to earn more.
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionGrid}>

        {/* AI Career Assistant */}
      <Pressable
        style={styles.actionCard}
        onPress={() => router.push('/student/career-roadmap')}
      >
        <Text style={styles.actionIcon}>🧭</Text>
        <Text style={styles.actionTitle}>Career</Text>
        <Text style={styles.actionTitle}>Roadmap</Text>
      </Pressable>

        {/* Career Roadmap */}
        <Pressable style={styles.actionCard}>
          <Text style={styles.actionIcon}>🧭</Text>
          <Text style={styles.actionTitle}>Career</Text>
          <Text style={styles.actionTitle}>Roadmap</Text>
        </Pressable>

        {/* Improve CV */}
        <Pressable style={styles.actionCard}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionTitle}>Improve</Text>
          <Text style={styles.actionTitle}>My CV</Text>
        </Pressable>

        {/* Opportunities */}
        <Pressable style={styles.actionCard}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionTitle}>Find</Text>
          <Text style={styles.actionTitle}>Opportunities</Text>
        </Pressable>
      </View>

      {/* Recommended Opportunities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Opportunities</Text>

        <Pressable>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <Pressable style={styles.opportunityCard}>
        <View style={styles.opportunityIcon}>
          <Text>💻</Text>
        </View>

        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>
            Junior Software Developer
          </Text>

          <Text style={styles.company}>
            Technology Solutions
          </Text>

          <Text style={styles.location}>
            📍 Durban • Full Time
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.opportunityCard}>
        <View style={styles.opportunityIcon}>
          <Text>📊</Text>
        </View>

        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>
            Graduate Data Analyst
          </Text>

          <Text style={styles.company}>
            Digital Analytics Group
          </Text>

          <Text style={styles.location}>
            📍 Johannesburg • Hybrid
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.opportunityCard}>
        <View style={styles.opportunityIcon}>
          <Text>📈</Text>
        </View>

        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>
            Business Analyst Intern
          </Text>

          <Text style={styles.company}>
            Future Consulting
          </Text>

          <Text style={styles.location}>
            📍 Cape Town • Internship
          </Text>
        </View>
      </Pressable>

      {/* Career Progress */}
      <Text style={styles.sectionTitle}>Career Progress</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Profile Completion
          </Text>

          <Text style={styles.progressValue}>80%</Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.progressHint}>
          Complete your profile to improve opportunity matches.
        </Text>
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.logoutText}>Logout</Text>
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
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },

  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationIcon: {
    fontSize: 22,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 23,
  },

  scoreCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  scoreLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 5,
  },

  score: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
  },

  scoreDescription: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 3,
  },

  scoreCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreCircleText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },

  scoreCirclePercent: {
    color: '#E0E7FF',
    fontSize: 10,
  },

  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  creditLabel: {
    color: '#64748B',
    fontSize: 13,
  },

  creditAmount: {
    color: '#0F172A',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 3,
  },

  creditDescription: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 7,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 13,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  actionIcon: {
    fontSize: 27,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAll: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  opportunityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  opportunityInfo: {
    flex: 1,
  },

  opportunityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  company: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },

  location: {
    fontSize: 12,
    color: '#64748B',
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  progressHint: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
});

