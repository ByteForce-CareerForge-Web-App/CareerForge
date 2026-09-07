import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function LaunchCareerScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚀</Text>
        </View>

        <Text style={styles.title}>Launch Your Career</Text>

        <Text style={styles.subtitle}>
          You have built your foundation. Now put your skills,
          experience, and confidence into action.
        </Text>
      </View>

      {/* Celebration Card */}
      <View style={styles.celebrationCard}>
        <View style={styles.celebrationIcon}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </View>

        <Text style={styles.celebrationTitle}>
          You're Career-Ready!
        </Text>

        <Text style={styles.celebrationText}>
          Completing your roadmap is an important milestone.
          Keep learning, applying, networking, and growing.
        </Text>
      </View>

      {/* Career Readiness */}
      <View style={styles.readinessCard}>
        <View style={styles.readinessHeader}>
          <View>
            <Text style={styles.readinessLabel}>
              Career Readiness
            </Text>

            <Text style={styles.readinessTitle}>
              Your employability profile
            </Text>
          </View>

          <Text style={styles.readinessPercentage}>
            82%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.readinessDescription}>
          Your profile shows strong potential. Continue
          improving your skills and gaining relevant experience.
        </Text>
      </View>

      {/* Final Checklist */}
      <Text style={styles.sectionTitle}>
        Final Career Checklist
      </Text>

      <View style={styles.checklistCard}>
        <View style={styles.checklistRow}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Complete your profile
            </Text>

            <Text style={styles.checklistDescription}>
              Make sure your education, skills and career goals
              are up to date.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Keep your CV updated
            </Text>

            <Text style={styles.checklistDescription}>
              Update your CV whenever you gain new skills,
              experience or achievements.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Build professional experience
            </Text>

            <Text style={styles.checklistDescription}>
              Continue working on projects, internships and
              other practical opportunities.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Apply for opportunities
            </Text>

            <Text style={styles.checklistDescription}>
              Regularly search and apply for roles that match
              your skills and career goals.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRowLast}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Prepare for interviews
            </Text>

            <Text style={styles.checklistDescription}>
              Practise communicating your skills, achievements
              and career goals with confidence.
            </Text>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <Text style={styles.sectionTitle}>
        Your Next Steps
      </Text>

      <View style={styles.nextStepCard}>
        <View style={styles.nextStepIcon}>
          <Text style={styles.nextStepEmoji}>🎯</Text>
        </View>

        <View style={styles.nextStepContent}>
          <Text style={styles.nextStepTitle}>
            Set Career Goals
          </Text>

          <Text style={styles.nextStepText}>
            Continue setting short-term and long-term goals
            for your professional development.
          </Text>
        </View>
      </View>

      <View style={styles.nextStepCard}>
        <View style={styles.nextStepIcon}>
          <Text style={styles.nextStepEmoji}>🤝</Text>
        </View>

        <View style={styles.nextStepContent}>
          <Text style={styles.nextStepTitle}>
            Build Your Network
          </Text>

          <Text style={styles.nextStepText}>
            Connect with alumni, mentors, students and
            employers to grow your professional network.
          </Text>
        </View>
      </View>

      <View style={styles.nextStepCard}>
        <View style={styles.nextStepIcon}>
          <Text style={styles.nextStepEmoji}>📈</Text>
        </View>

        <View style={styles.nextStepContent}>
          <Text style={styles.nextStepTitle}>
            Keep Improving
          </Text>

          <Text style={styles.nextStepText}>
            Keep learning new skills and improving your
            employability throughout your career.
          </Text>
        </View>
      </View>

      {/* Motivation Card */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationIcon}>🌟</Text>

        <View style={styles.motivationContent}>
          <Text style={styles.motivationTitle}>
            Your Career Journey Starts Here
          </Text>

          <Text style={styles.motivationText}>
            There is no single path to success. Stay curious,
            keep building, and take every opportunity to grow.
          </Text>
        </View>
      </View>

      {/* Dashboard Button */}
      <Pressable
        style={styles.dashboardButton}
        onPress={() => router.replace('/student/dashboard')}
      >
        <Text style={styles.dashboardButtonText}>
          Return to Dashboard
        </Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footerText}>
        CareerForgeAI — Empowering you to build your future.
      </Text>
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
    paddingBottom: 45,
  },

  backButton: {
    marginBottom: 22,
  },

  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  icon: {
    fontSize: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  celebrationCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 17,
  },

  celebrationIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  celebrationEmoji: {
    fontSize: 35,
  },

  celebrationTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  celebrationText: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  readinessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  readinessLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },

  readinessTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  readinessPercentage: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    width: '82%',
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  readinessDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },

  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 19,
  },

  checklistRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checkText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: 'bold',
  },

  checklistContent: {
    flex: 1,
  },

  checklistTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 3,
  },

  checklistDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  nextStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  nextStepEmoji: {
    fontSize: 23,
  },

  nextStepContent: {
    flex: 1,
  },

  nextStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  nextStepText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  motivationCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 18,
  },

  motivationIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 5,
  },

  motivationText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4F46E5',
  },

  dashboardButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});