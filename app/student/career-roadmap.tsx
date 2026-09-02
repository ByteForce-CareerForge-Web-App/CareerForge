import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const GOALS_KEY = 'careerforge_career_goals';
const SKILLS_KEY = 'careerforge_skills';
const CV_KEY = 'careerforge_cv_improvements';
const EXPERIENCE_KEY = 'careerforge_experience';
const APPLICATIONS_KEY = 'careerforge_applications';

export default function CareerRoadmapScreen() {
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [cvImprovements, setCvImprovements] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const [
        savedGoals,
        savedSkills,
        savedCV,
        savedExperience,
        savedApplications,
      ] = await Promise.all([
        AsyncStorage.getItem(GOALS_KEY),
        AsyncStorage.getItem(SKILLS_KEY),
        AsyncStorage.getItem(CV_KEY),
        AsyncStorage.getItem(EXPERIENCE_KEY),
        AsyncStorage.getItem(APPLICATIONS_KEY),
      ]);

      setGoals(savedGoals ? JSON.parse(savedGoals) : []);
      setSkills(savedSkills ? JSON.parse(savedSkills) : []);
      setCvImprovements(savedCV ? JSON.parse(savedCV) : []);
      setExperience(savedExperience ? JSON.parse(savedExperience) : []);
      setApplications(
        savedApplications ? JSON.parse(savedApplications) : []
      );
    } catch (error) {
      console.log('Error loading roadmap progress:', error);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Set your career goals and build your profile.',
      route: '/student/profile',
      completed: goals.length > 0,
      icon: '👤',
    },
    {
      id: 2,
      title: 'Build Your Skills',
      description: 'Add the skills that will help you reach your career goals.',
      route: '/student/skills',
      completed: skills.length > 0,
      icon: '🛠️',
    },
    {
      id: 3,
      title: 'Improve Your CV',
      description: 'Strengthen your CV and make it employer-ready.',
      route: '/student/improve-cv',
      completed: cvImprovements.length > 0,
      icon: '📄',
    },
    {
      id: 4,
      title: 'Gain Experience',
      description: 'Add your experience and strengthen your employability.',
      route: '/student/experience',
      completed: experience.length > 0,
      icon: '💼',
    },
    {
      id: 5,
      title: 'Apply for Opportunities',
      description: 'Find opportunities and submit applications.',
      route: '/student/opportunities',
      completed: applications.length > 0,
      icon: '🚀',
    },
    {
      id: 6,
      title: 'Launch Your Career',
      description: 'You are ready to take the next step in your career.',
      route: '/student/launch-career',
      completed: false,
      icon: '🎯',
    },
  ];

  const completedSteps = steps.filter(
    (step) => step.completed
  ).length;

  const progress = Math.round(
    (completedSteps / steps.length) * 100
  );

  const currentStepIndex = steps.findIndex(
    (step) => !step.completed
  );

  const getStatus = (index: number) => {
    if (steps[index].completed) {
      return 'Completed';
    }

    if (index === currentStepIndex) {
      return 'Current';
    }

    return 'Upcoming';
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Completed') {
      return styles.completedBadge;
    }

    if (status === 'Current') {
      return styles.currentBadge;
    }

    return styles.upcomingBadge;
  };

  const getStatusTextStyle = (status: string) => {
    if (status === 'Completed') {
      return styles.completedText;
    }

    if (status === 'Current') {
      return styles.currentText;
    }

    return styles.upcomingText;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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

        <View>
          <Text style={styles.title}>My Career Roadmap</Text>
          <Text style={styles.subtitle}>
            Track your journey to career success
          </Text>
        </View>
      </View>

      {/* Career Goal */}
      <View style={styles.goalCard}>
        <Text style={styles.goalLabel}>YOUR CAREER GOAL</Text>

        <Text style={styles.goalTitle}>
          {goals.length > 0
            ? `${goals.length} career goal${
                goals.length > 1 ? 's' : ''
              } selected`
            : 'Build My Career'}
        </Text>

        <Text style={styles.goalDescription}>
          Complete each step to improve your employability.
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>
            Overall Progress
          </Text>

          <Text style={styles.progressPercentage}>
            {progress}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {completedSteps} of {steps.length} roadmap steps completed
        </Text>
      </View>

      {/* Roadmap */}
      <Text style={styles.roadmapTitle}>Your Roadmap</Text>

      <View style={styles.roadmap}>
        {steps.map((step, index) => {
          const status = getStatus(index);

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <View style={styles.stepRow}>
                {/* Timeline */}
                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.stepCircle,
                      status === 'Completed' &&
                        styles.completedCircle,
                      status === 'Current' &&
                        styles.currentCircle,
                    ]}
                  >
                    <Text style={styles.stepIcon}>
                      {status === 'Completed'
                        ? '✓'
                        : step.icon}
                    </Text>
                  </View>

                  {index < steps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        steps[index].completed &&
                          styles.completedLine,
                      ]}
                    />
                  )}
                </View>

                {/* Step Card */}
                <Pressable
                  style={[
                    styles.stepCard,
                    status === 'Current' &&
                      styles.currentStepCard,
                  ]}
                  onPress={() => router.push(step.route as any)}
                >
                  <View style={styles.stepTop}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>
                        STEP {step.id}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusStyle(status),
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          getStatusTextStyle(status),
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.stepTitle}>
                    {step.title}
                  </Text>

                  <Text style={styles.stepDescription}>
                    {step.description}
                  </Text>

                  {status === 'Current' && (
                    <Text style={styles.actionText}>
                      Tap to continue →
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Motivation */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationIcon}>💡</Text>

        <View style={styles.motivationContent}>
          <Text style={styles.motivationTitle}>
            Keep Going!
          </Text>

          <Text style={styles.motivationText}>
            Every step you complete brings you closer to your
            career goals.
          </Text>
        </View>
      </View>

      {/* Dashboard Button */}
      <Pressable
        style={styles.dashboardButton}
        onPress={() =>
          router.replace('/student/dashboard')
        }
      >
        <Text style={styles.dashboardButtonText}>
          Back to Dashboard
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    color: '#333333',
    marginTop: -4,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#171717',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 3,
  },

  goalCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },

  goalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E8E7FF',
    letterSpacing: 1,
  },

  goalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 7,
  },

  goalDescription: {
    fontSize: 14,
    color: '#EDEBFF',
    marginTop: 6,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  progressPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E9E9F2',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },

  progressText: {
    fontSize: 13,
    color: '#777777',
    marginTop: 10,
  },

  roadmapTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },

  roadmap: {
    marginBottom: 20,
  },

  stepWrapper: {
    position: 'relative',
  },

  stepRow: {
    flexDirection: 'row',
  },

  timeline: {
    width: 50,
    alignItems: 'center',
  },

  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9E9F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  completedCircle: {
    backgroundColor: '#6C63FF',
  },

  currentCircle: {
    backgroundColor: '#8B85FF',
  },

  stepIcon: {
    fontSize: 17,
    color: '#FFFFFF',
  },

  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#E1E1EA',
    marginVertical: 2,
  },

  completedLine: {
    backgroundColor: '#6C63FF',
  },

  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginLeft: 10,
    marginBottom: 14,
  },

  currentStepCard: {
    borderWidth: 2,
    borderColor: '#6C63FF',
  },

  stepTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepNumberContainer: {
    backgroundColor: '#F0F0F7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  stepNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  completedBadge: {
    backgroundColor: '#E7F7EE',
  },

  currentBadge: {
    backgroundColor: '#EAE8FF',
  },

  upcomingBadge: {
    backgroundColor: '#F0F0F0',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  completedText: {
    color: '#258A50',
  },

  currentText: {
    color: '#5B54D6',
  },

  upcomingText: {
    color: '#777777',
  },

  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
    marginTop: 12,
  },

  stepDescription: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 19,
    marginTop: 5,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 10,
  },

  motivationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E8',
    borderRadius: 16,
    padding: 17,
    marginTop: 4,
    marginBottom: 20,
  },

  motivationIcon: {
    fontSize: 25,
    marginRight: 12,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3D00',
  },

  motivationText: {
    fontSize: 13,
    color: '#756A2E',
    lineHeight: 18,
    marginTop: 4,
  },

  dashboardButton: {
    backgroundColor: '#222222',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});