import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function CareerRoadmap() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Career Roadmap</Text>
          <Text style={styles.headerSubtitle}>
            Your personalised career journey
          </Text>
        </View>
      </View>

      {/* Career Goal */}
      <View style={styles.goalCard}>
        <View style={styles.goalIconContainer}>
          <Text style={styles.goalIcon}>🎯</Text>
        </View>

        <View style={styles.goalContent}>
          <Text style={styles.goalLabel}>CAREER GOAL</Text>

          <Text style={styles.goalTitle}>
            Data Scientist
          </Text>

          <Text style={styles.goalDescription}>
            Build the skills and experience needed to
            start your career in data science.
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>
              Roadmap Progress
            </Text>

            <Text style={styles.progressSubtitle}>
              Keep moving forward!
            </Text>
          </View>

          <Text style={styles.progressPercentage}>
            45%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.progressHint}>
          4 of 9 milestones completed
        </Text>
      </View>

      {/* Roadmap */}
      <Text style={styles.sectionTitle}>
        Your Career Journey
      </Text>

      {/* Milestone 1 */}
      <View style={styles.milestoneRow}>
        <View style={styles.timeline}>
          <View style={styles.completedCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <View style={styles.timelineLineCompleted} />
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.completedLabel}>
            COMPLETED
          </Text>

          <Text style={styles.milestoneTitle}>
            Complete Your Profile
          </Text>

          <Text style={styles.milestoneDescription}>
            Add your education, skills, interests and
            career information to your CareerForgeAI profile.
          </Text>

          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              ✓ Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Milestone 2 */}
      <View style={styles.milestoneRow}>
        <View style={styles.timeline}>
          <View style={styles.completedCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <View style={styles.timelineLineCompleted} />
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.completedLabel}>
            COMPLETED
          </Text>

          <Text style={styles.milestoneTitle}>
            Identify Your Career Path
          </Text>

          <Text style={styles.milestoneDescription}>
            Explore careers that match your interests,
            qualifications and strengths.
          </Text>

          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              ✓ Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Milestone 3 */}
      <View style={styles.milestoneRow}>
        <View style={styles.timeline}>
          <View style={styles.completedCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <View style={styles.timelineLineCompleted} />
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.completedLabel}>
            COMPLETED
          </Text>

          <Text style={styles.milestoneTitle}>
            Build Technical Skills
          </Text>

          <Text style={styles.milestoneDescription}>
            Develop skills in Python, SQL, statistics,
            data visualisation and machine learning.
          </Text>

          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              ✓ Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Milestone 4 */}
      <View style={styles.milestoneRow}>
        <View style={styles.timeline}>
          <View style={styles.completedCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <View style={styles.timelineLineActive} />
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.completedLabel}>
            COMPLETED
          </Text>

          <Text style={styles.milestoneTitle}>
            Create Your CV
          </Text>

          <Text style={styles.milestoneDescription}>
            Build a professional CV that highlights your
            education, skills, projects and experience.
          </Text>

          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              ✓ Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Current Milestone */}
      <View style={styles.milestoneRow}>
        <View style={styles.timeline}>
          <View style={styles.currentCircle}>
            <Text style={styles.currentNumber}>5</Text>
          </View>

          <View style={styles.timelineLine} />
        </View>

        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <View>
              <Text style={styles.currentLabel}>
                CURRENT STEP
              </Text>

              <Text style={styles.milestoneTitle}>
                Gain Practical Experience
              </Text>
            </View>

            <Text style={styles.currentIcon}>🚀</Text>
          </View>

          <Text style={styles.milestoneDescription}>
            Gain real-world experience through internships,
            projects, volunteering or work opportunities.
          </Text>

          <View style={styles.actionBox}>
            <Text style={styles.actionBoxTitle}>
              Recommended Actions
            </Text>

            <Text style={styles.actionItem}>
              • Apply for relevant internships
            </Text>

            <Text style={styles.actionItem}>
              • Build data science projects
            </Text>

            <Text style={styles.actionItem}>
              • Participate in industry programmes
            </Text>
          </View>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              Explore Opportunities
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Upcoming Milestones */}
      <Text style={styles.sectionTitle}>
        Coming Up
      </Text>

      {/* Milestone 6 */}
      <View style={styles.upcomingCard}>
        <View style={styles.upcomingNumber}>
          <Text style={styles.upcomingNumberText}>6</Text>
        </View>

        <View style={styles.upcomingContent}>
          <Text style={styles.upcomingTitle}>
            Build Your Professional Network
          </Text>

          <Text style={styles.upcomingDescription}>
            Connect with alumni, mentors and industry
            professionals.
          </Text>
        </View>
      </View>

      {/* Milestone 7 */}
      <View style={styles.upcomingCard}>
        <View style={styles.upcomingNumber}>
          <Text style={styles.upcomingNumberText}>7</Text>
        </View>

        <View style={styles.upcomingContent}>
          <Text style={styles.upcomingTitle}>
            Prepare for Interviews
          </Text>

          <Text style={styles.upcomingDescription}>
            Practise interviews and develop your
            professional communication skills.
          </Text>
        </View>
      </View>

      {/* Milestone 8 */}
      <View style={styles.upcomingCard}>
        <View style={styles.upcomingNumber}>
          <Text style={styles.upcomingNumberText}>8</Text>
        </View>

        <View style={styles.upcomingContent}>
          <Text style={styles.upcomingTitle}>
            Apply for Graduate Roles
          </Text>

          <Text style={styles.upcomingDescription}>
            Find and apply for graduate opportunities
            that match your career goals.
          </Text>
        </View>
      </View>

      {/* Final Goal */}
      <View style={styles.finalCard}>
        <Text style={styles.finalIcon}>🏆</Text>

        <Text style={styles.finalTitle}>
          Start Your Career
        </Text>

        <Text style={styles.finalDescription}>
          Reach your career goal and begin your
          professional journey.
        </Text>
      </View>

      <View style={styles.bottomSpace} />
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
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  backText: {
    fontSize: 38,
    color: '#4F46E5',
    marginTop: -5,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  goalCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  goalIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  goalIcon: {
    fontSize: 27,
  },

  goalContent: {
    flex: 1,
  },

  goalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C7D2FE',
    letterSpacing: 1,
    marginBottom: 3,
  },

  goalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  goalDescription: {
    fontSize: 12,
    color: '#E0E7FF',
    lineHeight: 17,
    marginTop: 4,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  progressSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  progressPercentage: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
  },

  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  progressHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timeline: {
    width: 42,
    alignItems: 'center',
  },

  completedCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  timelineLineCompleted: {
    width: 3,
    flex: 1,
    backgroundColor: '#A5B4FC',
    minHeight: 20,
  },

  timelineLineActive: {
    width: 3,
    flex: 1,
    backgroundColor: '#A5B4FC',
    minHeight: 20,
  },

  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#CBD5E1',
    minHeight: 20,
  },

  milestoneCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  completedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },

  milestoneDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },

  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },

  currentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  currentNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  currentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    marginBottom: 16,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },

  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  currentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  currentIcon: {
    fontSize: 25,
  },

  actionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 13,
    marginTop: 13,
    marginBottom: 13,
  },

  actionBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  actionItem: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  upcomingNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  upcomingNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },

  upcomingContent: {
    flex: 1,
  },

  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },

  upcomingDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  finalCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  finalIcon: {
    fontSize: 35,
    marginBottom: 8,
  },

  finalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#312E81',
  },

  finalDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },
});

