import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function CareerRoadmapScreen() {
  const roadmapSteps = [
    {
      number: '1',
      title: 'Build Your Professional Profile',
      description:
        'Keep your professional profile updated with your qualifications, experience, skills and achievements.',
      status: 'Completed',
      icon: '👤',
    },
    {
      number: '2',
      title: 'Strengthen Your Skills',
      description:
        'Identify important skills in your industry and continue developing both technical and professional capabilities.',
      status: 'Current',
      icon: '🛠️',
    },
    {
      number: '3',
      title: 'Grow Your Professional Network',
      description:
        'Connect with professionals, alumni and industry leaders to expand your career opportunities.',
      status: 'Upcoming',
      icon: '🤝',
    },
    {
      number: '4',
      title: 'Explore Career Opportunities',
      description:
        'Discover jobs, projects, mentorship opportunities and other professional opportunities aligned with your goals.',
      status: 'Upcoming',
      icon: '💼',
    },
    {
      number: '5',
      title: 'Become a Career Mentor',
      description:
        'Use your professional experience to support students and graduates who are beginning their careers.',
      status: 'Upcoming',
      icon: '🎓',
    },
  ];

  const completedSteps = roadmapSteps.filter(
    step => step.status === 'Completed'
  ).length;

  const progress = Math.round(
    (completedSteps / roadmapSteps.length) * 100
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Career Roadmap</Text>
          <Text style={styles.subtitle}>
            Plan and track your professional journey
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View>
            <Text style={styles.progressLabel}>Career Progress</Text>
            <Text style={styles.progressPercentage}>
              {progress}%
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>
              {completedSteps}/{roadmapSteps.length}
            </Text>
          </View>
        </View>

        <Text style={styles.progressDescription}>
          Keep building your skills, connections and professional
          experience to move forward in your career.
        </Text>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {/* Current Focus */}
      <View style={styles.focusCard}>
        <Text style={styles.focusIcon}>🚀</Text>

        <View style={styles.focusTextContainer}>
          <Text style={styles.focusLabel}>CURRENT FOCUS</Text>
          <Text style={styles.focusTitle}>
            Strengthen Your Skills
          </Text>
          <Text style={styles.focusDescription}>
            Continue developing the skills that will help you progress
            in your chosen career.
          </Text>
        </View>
      </View>

      {/* Roadmap */}
      <Text style={styles.sectionTitle}>Your Career Journey</Text>

      <View style={styles.roadmapContainer}>
        {roadmapSteps.map((step, index) => (
          <View key={step.number} style={styles.stepRow}>
            {/* Timeline */}
            <View style={styles.timeline}>
              <View
                style={[
                  styles.stepCircle,
                  step.status === 'Completed' &&
                    styles.completedCircle,
                  step.status === 'Current' &&
                    styles.currentCircle,
                ]}
              >
                <Text style={styles.stepNumber}>
                  {step.status === 'Completed'
                    ? '✓'
                    : step.number}
                </Text>
              </View>

              {index < roadmapSteps.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    step.status === 'Completed' &&
                      styles.completedLine,
                  ]}
                />
              )}
            </View>

            {/* Step Card */}
            <View
              style={[
                styles.stepCard,
                step.status === 'Current' &&
                  styles.currentStepCard,
              ]}
            >
              <View style={styles.stepHeader}>
                <Text style={styles.stepIcon}>{step.icon}</Text>

                <View style={styles.stepTitleContainer}>
                  <Text style={styles.stepTitle}>
                    {step.title}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      step.status === 'Completed' &&
                        styles.completedBadge,
                      step.status === 'Current' &&
                        styles.currentBadge,
                      step.status === 'Upcoming' &&
                        styles.upcomingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        step.status === 'Completed' &&
                          styles.completedStatusText,
                        step.status === 'Current' &&
                          styles.currentStatusText,
                        step.status === 'Upcoming' &&
                          styles.upcomingStatusText,
                      ]}
                    >
                      {step.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.stepDescription}>
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Recommendation */}
      <View style={styles.aiCard}>
        <Text style={styles.aiIcon}>✨</Text>

        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>
            CareerForgeAI Recommendation
          </Text>

          <Text style={styles.aiText}>
            Build your professional network by connecting with
            industry professionals and mentoring students. Strong
            connections can create opportunities for collaboration,
            referrals and career growth.
          </Text>

          <Pressable
            style={styles.aiButton}
            onPress={() => router.push('/alumni/networking')}
          >
            <Text style={styles.aiButtonText}>
              Grow My Network →
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Dashboard Button */}
      <Pressable
        style={styles.dashboardButton}
        onPress={() => router.replace('/alumni/dashboard')}
      >
        <Text style={styles.dashboardButtonText}>
          Back to Alumni Dashboard
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  backButtonText: {
    fontSize: 32,
    color: '#4F46E5',
    marginTop: -4,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },

  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4F46E5',
  },

  progressCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressCircleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
  },

  progressDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    marginTop: 14,
    marginBottom: 14,
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  focusCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 26,
  },

  focusIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  focusTextContainer: {
    flex: 1,
  },

  focusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1,
    marginBottom: 4,
  },

  focusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },

  focusDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 18,
  },

  roadmapContainer: {
    marginBottom: 24,
  },

  stepRow: {
    flexDirection: 'row',
  },

  timeline: {
    width: 46,
    alignItems: 'center',
  },

  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  completedCircle: {
    backgroundColor: '#22C55E',
  },

  currentCircle: {
    backgroundColor: '#4F46E5',
  },

  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  timelineLine: {
    width: 3,
    flex: 1,
    minHeight: 95,
    backgroundColor: '#D1D5DB',
  },

  completedLine: {
    backgroundColor: '#22C55E',
  },

  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginLeft: 10,
    marginBottom: 16,
    elevation: 1,
  },

  currentStepCard: {
    borderWidth: 1,
    borderColor: '#6366F1',
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  stepIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  stepTitleContainer: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 7,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  currentBadge: {
    backgroundColor: '#EEF2FF',
  },

  upcomingBadge: {
    backgroundColor: '#F3F4F6',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  completedStatusText: {
    color: '#15803D',
  },

  currentStatusText: {
    color: '#4F46E5',
  },

  upcomingStatusText: {
    color: '#6B7280',
  },

  stepDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 12,
  },

  aiCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },

  aiIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },

  aiText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  aiButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  dashboardButton: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});