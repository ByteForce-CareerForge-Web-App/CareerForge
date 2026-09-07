import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function StudentDashboard() {
  const employabilityScore = 82;
  const profileCompletion = 80;

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22C55E';
    if (score >= 50) return '#EAB308';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(employabilityScore);
  const progressColor = getScoreColor(profileCompletion);

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
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/student/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Employability Score */}
      <View style={styles.scoreCard}>
        <View>
          <Text style={styles.scoreLabel}>Employability Score</Text>

          <Text style={styles.score}>
            {employabilityScore}%
          </Text>

          <Text style={styles.scoreDescription}>
            You're on the right track!
          </Text>
        </View>

        <View
          style={[
            styles.scoreCircle,
            {
              borderColor: scoreColor,
            },
          ]}
        >
          <Text style={styles.scoreCircleText}>
            {employabilityScore}
          </Text>

          <Text
            style={[
              styles.scoreCirclePercent,
              {
                color: scoreColor,
              },
            ]}
          >
            %
          </Text>
        </View>
      </View>

      {/* Career Credits */}
      <View style={styles.creditCard}>
        <View>
          <Text style={styles.creditLabel}>
            Career Credits
          </Text>

          <Text style={styles.creditAmount}>
            240 ⭐
          </Text>
        </View>

        <Text style={styles.creditDescription}>
          Keep completing activities to earn more.
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionGrid}>

        {/* AI Career Assistant */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/ai-career-assistant')
          }
        >
          <Text style={styles.actionIcon}>🤖</Text>

          <Text style={styles.actionTitle}>
            AI Career
          </Text>

          <Text style={styles.actionTitle}>
            Assistant
          </Text>
        </Pressable>

        {/* Career Roadmap */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/career-roadmap')
          }
        >
          <Text style={styles.actionIcon}>🧭</Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Roadmap
          </Text>
        </Pressable>


        {/* Find Opportunities */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/opportunities')
          }
        >
          <Text style={styles.actionIcon}>🔍</Text>

          <Text style={styles.actionTitle}>
            Find
          </Text>

          <Text style={styles.actionTitle}>
            Opportunities
          </Text>
        </Pressable>

        {/* My Applications */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/applications')
          }
        >
          <Text style={styles.actionIcon}>📋</Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Applications
          </Text>
        </Pressable>

        {/* Saved Opportunities */}
          <Pressable
            style={styles.actionCard}
            onPress={() =>
              router.push('/student/saved-opportunities')
            }
          >
            <Text style={styles.actionIcon}>🔖</Text>

            <Text style={styles.actionTitle}>
              Saved
            </Text>

            <Text style={styles.actionTitle}>
              Opportunities
            </Text>
          </Pressable>

        {/* Career Goals */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/career-goals')
          }
        >
          <Text style={styles.actionIcon}>🎯</Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Goals
          </Text>
        </Pressable>

        {/* Connections */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/connections')
          }
        >
          <Text style={styles.actionIcon}>🤝</Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Connections
          </Text>
        </Pressable>

        {/* Messages */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/messages')
          }
        >
          <Text style={styles.actionIcon}>💬</Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Messages
          </Text>
        </Pressable>

        {/* Social Feed */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/social-feed')
          }
        >
          <Text style={styles.actionIcon}>📰</Text>

          <Text style={styles.actionTitle}>
            Social
          </Text>

          <Text style={styles.actionTitle}>
            Feed
          </Text>
        </Pressable>

        {/* Career Pathways */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push('/student/career-pathways')
          }
        >
          <Text style={styles.actionIcon}>🧭</Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Pathways
          </Text>
        </Pressable>
      </View>


             {/* My Career Paths + Events */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 25,
        }}
      >
        {/* My Career Paths */}
        <Pressable
          style={{
            width: '48%',
            minHeight: 120,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: '#D9E1EA',
            justifyContent: 'center',
            shadowColor: '#0B1F3A',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.07,
            shadowRadius: 7,
            elevation: 2,
          }}
          onPress={() =>
            router.push('/student/my-career-paths')
          }
        >
          <Text style={styles.actionIcon}>⭐</Text>

          <Text style={styles.actionTitle}>
            My Career
          </Text>

          <Text style={styles.actionTitle}>
            Paths
          </Text>
        </Pressable>

        {/* Events */}
        <Pressable
          style={{
            width: '48%',
            minHeight: 120,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: '#D9E1EA',
            justifyContent: 'center',
            shadowColor: '#0B1F3A',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.07,
            shadowRadius: 7,
            elevation: 2,
          }}
          onPress={() =>
            router.push('/student/events')
          }
        >
          <Text style={styles.actionIcon}>📅</Text>

          <Text style={styles.actionTitle}>
            Events
          </Text>
        </Pressable>
      </View>

      {/* Recommended Opportunities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recommended Opportunities
        </Text>

        <Pressable
          onPress={() =>
            router.push('/student/opportunities')
          }
        >
          <Text style={styles.viewAll}>
            View All
          </Text>
        </Pressable>
      </View>

      {/* Opportunity 1 */}
      <Pressable
        style={styles.opportunityCard}
        onPress={() =>
          router.push('/student/opportunities')
        }
      >
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

      {/* Opportunity 2 */}
      <Pressable
        style={styles.opportunityCard}
        onPress={() =>
          router.push('/student/opportunities')
        }
      >
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

      {/* Opportunity 3 */}
      <Pressable
        style={styles.opportunityCard}
        onPress={() =>
          router.push('/student/opportunities')
        }
      >
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
      <Text style={styles.sectionTitle}>
        Career Progress
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Profile Completion
          </Text>

          <Text
            style={[
              styles.progressValue,
              {
                color: progressColor,
              },
            ]}
          >
            {profileCompletion}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${profileCompletion}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>

        <Text style={styles.progressHint}>
          Complete your profile to improve
          opportunity matches.
        </Text>
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

  /* Header */
  header: {
    backgroundColor: '#416697',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: 0.2,
  },

  name: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E3FF',
  },

  notificationIcon: {
    fontSize: 20,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  profileIcon: {
    fontSize: 21,
  },

  /* Employability Score */
  scoreCard: {
    backgroundColor: '#1e5397',
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },

  score: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  scoreDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 3,
  },

  scoreCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreCircleText: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '800',
  },

  scoreCirclePercent: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* Career Credits */
  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginBottom: 25,
  },

  creditLabel: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '600',
  },

  creditAmount: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 3,
  },

  creditDescription: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 7,
  },

  /* Sections */
  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAll: {
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Quick Actions */
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
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

    careerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  smallActionCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    justifyContent: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
    lineHeight: 19,
  },

  /* Opportunities */
  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  opportunityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0B1F3A',
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
    color: '#0B1F3A',
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

  /* Career Progress */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
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
    color: '#0B1F3A',
  },

  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  progressHint: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },

  /* Logout */
  logoutButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  logoutText: {
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 15,
  },
});