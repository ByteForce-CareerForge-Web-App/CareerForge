import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AlumniDashboard() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.title}>Alumni Dashboard</Text>
        </View>

        <View style={styles.headerActions}>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/alumni/notifications')}
            activeOpacity={0.8}
          >
            <Text style={styles.notificationIcon}>🔔</Text>

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              router.push({
                pathname: '/alumni/profile',
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.profileText}>A</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Professional Profile */}
      <View style={styles.profileCard}>

        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>

        <View style={styles.profileInfo}>

          <Text style={styles.profileName}>
            Professional Profile
          </Text>

          <Text style={styles.profileDescription}>
            Build and showcase your professional journey.
          </Text>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.navigate('/alumni/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>
              View Profile
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      {/* Career Insights */}
      <TouchableOpacity
        style={styles.insightsCard}
        onPress={() => router.push('/alumni/career-insights')}
        activeOpacity={0.8}
      >

        <View style={styles.insightsIcon}>
          <Text style={styles.insightsIconText}>✦</Text>
        </View>

        <View style={styles.insightsInfo}>

          <Text style={styles.insightsTitle}>
            Career Insights
          </Text>

          <Text style={styles.insightsDescription}>
            View your employability score, career recommendations,
            skills analysis and AI-powered career insights.
          </Text>

          <Text style={styles.insightsButton}>
            View Career Insights →
          </Text>

        </View>
      </TouchableOpacity>

      {/* Quick Action Grid */}
      <View style={styles.grid}>

        {/* Mentor Students */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/mentor-students')}
        >
          <Text style={styles.actionIcon}>🤝</Text>

          <Text style={styles.actionTitle}>
            Mentor Students
          </Text>

          <Text style={styles.actionDescription}>
            Guide students with your experience.
          </Text>

          <Text style={styles.cardLink}>
            Mentor Students →
          </Text>
        </TouchableOpacity>

        {/* Career Roadmap */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/career-roadmap')}
        >
          <Text style={styles.actionIcon}>🧭</Text>

          <Text style={styles.actionTitle}>
            Career Roadmap
          </Text>

          <Text style={styles.actionDescription}>
            Plan your professional growth and track your career journey.
          </Text>

          <Text style={styles.cardLink}>
            View Roadmap →
          </Text>
        </TouchableOpacity>

        {/* Networking */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/networking')}
        >
          <Text style={styles.actionIcon}>🌐</Text>

          <Text style={styles.actionTitle}>
            Networking
          </Text>

          <Text style={styles.actionDescription}>
            Connect with graduates and professionals.
          </Text>

          <Text style={styles.cardLink}>
            Start Networking →
          </Text>
        </TouchableOpacity>

        {/* Share Experience */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/share-experience')}
        >
          <Text style={styles.actionIcon}>💡</Text>

          <Text style={styles.actionTitle}>
            Share Experience
          </Text>

          <Text style={styles.actionDescription}>
            Share advice and career knowledge.
          </Text>

          <Text style={styles.cardLink}>
            Share Your Story →
          </Text>
        </TouchableOpacity>

        {/* Opportunities */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/opportunities')}
        >
          <Text style={styles.actionIcon}>💼</Text>

          <Text style={styles.actionTitle}>
            Opportunities
          </Text>

          <Text style={styles.actionDescription}>
            Discover jobs and career opportunities.
          </Text>

          <Text style={styles.cardLink}>
            Explore Jobs →
          </Text>
        </TouchableOpacity>

        {/* My Applications */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/alumni/my-applications')}
        >
          <Text style={styles.actionIcon}>📄</Text>

          <Text style={styles.actionTitle}>
            My Applications
          </Text>

          <Text style={styles.actionDescription}>
            Track the opportunities you've applied for and monitor your progress.
          </Text>

          <Text style={styles.cardLink}>
            View Applications →
          </Text>
        </TouchableOpacity>

      </View>

      {/* Community */}
      <Text style={styles.sectionTitle}>
        CareerForge Community
      </Text>

      <View style={styles.communityCard}>

        <Text style={styles.communityTitle}>
          Support the next generation
        </Text>

        <Text style={styles.communityDescription}>
          Connect with students, provide mentorship, share your career
          experience and help graduates become more employable.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/alumni/networking')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Connect With Students
          </Text>
        </TouchableOpacity>

      </View>

      {/* Recommended Opportunities */}
      <Text style={styles.sectionTitle}>
        Recommended Opportunities
      </Text>

      <View style={styles.opportunityCard}>

        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>
            Explore Opportunities
          </Text>

          <Text style={styles.opportunityDescription}>
            Find opportunities that match your professional interests.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => router.push('/alumni/opportunities')}
          activeOpacity={0.8}
        >
          <Text style={styles.smallButtonText}>
            Explore
          </Text>
        </TouchableOpacity>

      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace('/login')}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>
          Log Out
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },

  greeting: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#24243A',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 22,
  },

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    elevation: 2,
  },

  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  profileIconText: {
    fontSize: 25,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 5,
  },

  profileDescription: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 19,
    marginBottom: 12,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },

  outlineButtonText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 14,
  },

  /* Career Insights */

  insightsCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  insightsIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  insightsInfo: {
    flex: 1,
  },

  insightsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 5,
  },

  insightsDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4338CA',
  },

  insightsButton: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 9,
  },

  /* Quick Actions */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    minHeight: 175,
    elevation: 2,
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 7,
  },

  actionDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
  },

  cardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 12,
  },

  /* Community */

  communityCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
  },

  communityTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 8,
  },

  communityDescription: {
    fontSize: 14,
    color: '#5F5F70',
    lineHeight: 21,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Opportunities */

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },

  opportunityInfo: {
    marginBottom: 5,
  },

  opportunityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 6,
  },

  opportunityDescription: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 19,
    marginBottom: 15,
  },

  smallButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Logout */

  logoutButton: {
    borderWidth: 1,
    borderColor: '#DD4444',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  logoutText: {
    color: '#DD4444',
    fontSize: 14,
    fontWeight: '600',
  },

});
