import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOALS_KEY = 'careerforge_career_goals';
const SKILLS_KEY = 'careerforge_skills';
const CV_KEY = 'careerforge_cv_improvements';
const EXPERIENCE_KEY = 'careerforge_experience';
const APPLICATIONS_KEY = 'careerforge_applications';

const COLORS = {
  primary: '#2457E6',
  primaryDark: '#173FBD',
  deepBlue: '#102A72',
  navy: '#172A55',
  lightBlue: '#E8F0FF',
  paleBlue: '#F3F6FF',
  background: '#F5F7FC',
  white: '#FFFFFF',
  text: '#27313F',
  secondaryText: '#667085',
  muted: '#98A2B3',
  border: '#E1E7F0',
  green: '#258A50',
  greenLight: '#E7F7EE',
};

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

  const safelyParseArray = <T,>(
    value: string | null
  ): T[] => {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.log('Error parsing stored roadmap data:', error);
      return [];
    }
  };

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

      setGoals(safelyParseArray<string>(savedGoals));
      setSkills(safelyParseArray<string>(savedSkills));
      setCvImprovements(
        safelyParseArray<string>(savedCV)
      );
      setExperience(
        safelyParseArray<string>(savedExperience)
      );
      setApplications(
        safelyParseArray<any>(savedApplications)
      );
    } catch (error) {
      console.log(
        'Error loading roadmap progress:',
        error
      );

      setGoals([]);
      setSkills([]);
      setCvImprovements([]);
      setExperience([]);
      setApplications([]);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description:
        'Set your career goals and build your profile.',
      route: '/student/profile',
      completed: goals.length > 0,
      icon: 'person-outline',
    },
    {
      id: 2,
      title: 'Build Your Skills',
      description:
        'Add the skills that will help you reach your career goals.',
      route: '/student/skills',
      completed: skills.length > 0,
      icon: 'construct-outline',
    },
    {
      id: 3,
      title: 'Improve Your CV',
      description:
        'Strengthen your CV and make it employer-ready.',
      route: '/student/improve-cv',
      completed: cvImprovements.length > 0,
      icon: 'document-text-outline',
    },
    {
      id: 4,
      title: 'Gain Experience',
      description:
        'Add your experience and strengthen your employability.',
      route: '/student/experience',
      completed: experience.length > 0,
      icon: 'briefcase-outline',
    },
    {
      id: 5,
      title: 'Apply for Opportunities',
      description:
        'Find opportunities and submit applications.',
      route: '/student/opportunities',
      completed: applications.length > 0,
      icon: 'rocket-outline',
    },
    {
      id: 6,
      title: 'Launch Your Career',
      description:
        'You are ready to take the next step in your career.',
      route: '/student/launch-career',
      completed: false,
      icon: 'flag-outline',
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
    <SafeAreaView style={styles.safeArea}>
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
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.primary}
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              My Career Roadmap
            </Text>

            <Text style={styles.subtitle}>
              Track your journey to career success
            </Text>
          </View>
        </View>

        {/* Career Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalTop}>
            <View style={styles.goalIcon}>
              <Ionicons
                name="flag-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.goalLabel}>
              YOUR CAREER GOAL
            </Text>
          </View>

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
            <View style={styles.progressTitleRow}>
              <View style={styles.progressIcon}>
                <Ionicons
                  name="trending-up-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.sectionTitle}>
                Overall Progress
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {progress}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {completedSteps} of {steps.length} roadmap steps
            completed
          </Text>
        </View>

        {/* Roadmap */}
        <View style={styles.roadmapHeading}>
          <Text style={styles.roadmapTitle}>
            Your Roadmap
          </Text>

          <View style={styles.progressSmallBadge}>
            <Text style={styles.progressSmallText}>
              {completedSteps}/{steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.roadmap}>
          {steps.map((step, index) => {
            const status = getStatus(index);

            return (
              <View
                key={step.id}
                style={styles.stepWrapper}
              >
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
                      {status === 'Completed' ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Ionicons
                          name={step.icon as any}
                          size={19}
                          color={
                            status === 'Current'
                              ? '#FFFFFF'
                              : '#8B94A3'
                          }
                        />
                      )}
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
                    onPress={() =>
                      router.push(step.route as any)
                    }
                  >
                    <View style={styles.stepTop}>
                      <View
                        style={
                          styles.stepNumberContainer
                        }
                      >
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
                        {status === 'Completed' && (
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color={COLORS.green}
                          />
                        )}

                        {status === 'Current' && (
                          <Ionicons
                            name="radio-button-on"
                            size={12}
                            color={COLORS.primary}
                          />
                        )}

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

                    <Text
                      style={styles.stepDescription}
                    >
                      {step.description}
                    </Text>

                    {status === 'Current' && (
                      <View style={styles.actionRow}>
                        <Text style={styles.actionText}>
                          Tap to continue
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={COLORS.primary}
                        />
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationIcon}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#B7791F"
            />
          </View>

          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>
              Keep Going!
            </Text>

            <Text style={styles.motivationText}>
              Every step you complete brings you closer to
              your career goals.
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
          <Ionicons
            name="grid-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.dashboardButtonText}>
            Back to Dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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

  headerTextContainer: {
    flex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.navy,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  goalCard: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 19,
    padding: 21,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CFDBF8',
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  goalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },

  goalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 12,
  },

  goalDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 6,
  },

  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
  },

  progressPercentage: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E8ECF3',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  progressText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 10,
  },

  roadmapHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  roadmapTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navy,
  },

  progressSmallBadge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  progressSmallText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
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
    backgroundColor: '#E9ECF1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  completedCircle: {
    backgroundColor: COLORS.green,
  },

  currentCircle: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#DCE2EC',
    marginVertical: 2,
  },

  completedLine: {
    backgroundColor: COLORS.green,
  },

  stepCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 17,
    marginLeft: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.035,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  currentStepCard: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.paleBlue,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  stepTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepNumberContainer: {
    backgroundColor: '#F0F3F8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  stepNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondaryText,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  completedBadge: {
    backgroundColor: COLORS.greenLight,
  },

  currentBadge: {
    backgroundColor: COLORS.lightBlue,
  },

  upcomingBadge: {
    backgroundColor: '#F1F3F5',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  completedText: {
    color: COLORS.green,
  },

  currentText: {
    color: COLORS.primaryDark,
  },

  upcomingText: {
    color: '#777777',
  },

  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 12,
  },

  stepDescription: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 19,
    marginTop: 5,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  motivationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E8',
    borderRadius: 16,
    padding: 17,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3E7BD',
  },

  motivationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF1C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A3D00',
  },

  motivationText: {
    fontSize: 13,
    color: '#756A2E',
    lineHeight: 18,
    marginTop: 4,
  },

  dashboardButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.deepBlue,
    shadowOpacity: 0.15,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  dashboardButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
