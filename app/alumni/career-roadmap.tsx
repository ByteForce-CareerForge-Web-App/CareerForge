import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type RoadmapStep = {
  step?: number;
  number?: number | string;
  title?: string;
  description?: string;
};

type CareerAnalysis = {
  target_role?: string;
  employability?: {
    score?: number;
    level?: string;
    overall_assessment?: string;
  };
  roadmap?: RoadmapStep[];
  recommendations?: string[];
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: CareerAnalysis;
};

type DisplayRoadmapStep = {
  number: string;
  title: string;
  description: string;
  status: 'Completed' | 'Current' | 'Upcoming';
  icon: string;
};

const ALUMNI_AI_RESULT_ENDPOINT =
  `${API_BASE_URL}/alumni/ai-analysis-result.php`;

const ALUMNI_AI_ANALYSIS_ENDPOINT =
  `${API_BASE_URL}/alumni/ai-analysis.php`;

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function getStepIcon(index: number): string {
  const icons = ['👤', '🛠️', '🤝', '💼', '🎓', '🚀'];

  return icons[index] || '📌';
}

function getStepStatus(
  index: number
): 'Completed' | 'Current' | 'Upcoming' {
  /*
   * The current AI roadmap does not yet store completion
   * information for individual roadmap steps.
   *
   * For now:
   * - Step 1 = Current
   * - Remaining steps = Upcoming
   *
   * This keeps the roadmap honest instead of claiming that
   * an AI-generated recommendation has already been completed.
   */
  if (index === 0) {
    return 'Current';
  }

  return 'Upcoming';
}

export default function CareerRoadmapScreen() {
  const [roadmapSteps, setRoadmapSteps] = useState<
    DisplayRoadmapStep[]
  >([]);

  const [recommendation, setRecommendation] = useState(
    'Continue developing your professional skills and experience to progress toward your career goals.'
  );

  const [targetRole, setTargetRole] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCareerRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      /*
       * First try to retrieve the latest Alumni AI analysis.
       */
      let response = await fetch(ALUMNI_AI_RESULT_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let responseText = await response.text();

      let result: ApiResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        console.log(
          'Invalid Alumni AI result response:',
          responseText
        );

        throw new Error(
          'The server returned an invalid response.'
        );
      }

      /*
       * If no analysis exists yet, generate one.
       */
      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        response = await fetch(ALUMNI_AI_ANALYSIS_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        responseText = await response.text();

        try {
          result = JSON.parse(responseText);
        } catch {
          console.log(
            'Invalid Alumni AI analysis response:',
            responseText
          );

          throw new Error(
            'The server returned an invalid response.'
          );
        }

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              'Unable to generate your career roadmap.'
          );
        }
      }

      const data = result.data;

      if (!data) {
        throw new Error(
          'No career analysis was returned.'
        );
      }

      setTargetRole(
        safeString(data.target_role)
      );

      /*
       * Convert the AI roadmap into the structure expected
       * by the existing UI.
       */
      const aiRoadmap = safeArray<RoadmapStep>(
        data.roadmap
      );

      const formattedRoadmap: DisplayRoadmapStep[] =
        aiRoadmap
          .map((step, index) => {
            const title = safeString(
              step?.title,
              `Career Development Step ${index + 1}`
            );

            const description = safeString(
              step?.description,
              'Continue developing your skills and experience to progress toward your career goals.'
            );

            return {
              number: String(
                step?.step ??
                  step?.number ??
                  index + 1
              ),
              title,
              description,
              status: getStepStatus(index),
              icon: getStepIcon(index),
            };
          })
          .filter(step => step.title.length > 0);

      setRoadmapSteps(formattedRoadmap);

      /*
       * Use the first AI recommendation for the
       * CareerForgeAI Recommendation card.
       */
      const recommendations = safeArray<unknown>(
        data.recommendations
      );

      const firstRecommendation =
        recommendations.find(
          item => typeof item === 'string' && item.trim()
        );

      if (typeof firstRecommendation === 'string') {
        setRecommendation(firstRecommendation);
      } else if (
        data.employability?.overall_assessment
      ) {
        setRecommendation(
          safeString(
            data.employability.overall_assessment
          )
        );
      }
    } catch (err) {
      console.error(
        'Error loading Alumni Career Roadmap:',
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load your career roadmap.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCareerRoadmap();
    }, [loadCareerRoadmap])
  );

  const completedSteps = roadmapSteps.filter(
    step => step.status === 'Completed'
  ).length;

  const progress =
    roadmapSteps.length > 0
      ? Math.round(
          (completedSteps / roadmapSteps.length) * 100
        )
      : 0;

  const currentStep =
    roadmapSteps.find(
      step => step.status === 'Current'
    ) || roadmapSteps[0];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />

        <Text style={styles.loadingTitle}>
          Building Your Career Roadmap
        </Text>

        <Text style={styles.loadingText}>
          CareerForgeAI is preparing your personalised
          professional journey...
        </Text>
      </View>
    );
  }

  if (error && roadmapSteps.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>
          Unable to Load Career Roadmap
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadCareerRoadmap}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backErrorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backErrorButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Career Roadmap
          </Text>

          <Text style={styles.subtitle}>
            Plan and track your professional journey
          </Text>

          {targetRole ? (
            <Text style={styles.targetRole}>
              AI roadmap for: {targetRole}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ‹
          </Text>
        </Pressable>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View>
            <Text style={styles.progressLabel}>
              Career Progress
            </Text>

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
          Follow your personalised CareerForgeAI roadmap
          to build your skills, experience and professional
          opportunities.
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
      {currentStep ? (
        <View style={styles.focusCard}>
          <Text style={styles.focusIcon}>
            🚀
          </Text>

          <View style={styles.focusTextContainer}>
            <Text style={styles.focusLabel}>
              CURRENT FOCUS
            </Text>

            <Text style={styles.focusTitle}>
              {currentStep.title}
            </Text>

            <Text style={styles.focusDescription}>
              {currentStep.description}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Roadmap */}
      <Text style={styles.sectionTitle}>
        Your Career Journey
      </Text>

      {roadmapSteps.length > 0 ? (
        <View style={styles.roadmapContainer}>
          {roadmapSteps.map((step, index) => (
            <View
              key={`${step.number}-${index}`}
              style={styles.stepRow}
            >
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

                {index <
                  roadmapSteps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      step.status ===
                        'Completed' &&
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
                  <Text style={styles.stepIcon}>
                    {step.icon}
                  </Text>

                  <View
                    style={styles.stepTitleContainer}
                  >
                    <Text style={styles.stepTitle}>
                      {step.title}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        step.status ===
                          'Completed' &&
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
                          step.status ===
                            'Completed' &&
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

                <Text
                  style={styles.stepDescription}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🧭
          </Text>

          <Text style={styles.emptyTitle}>
            Your roadmap is being prepared
          </Text>

          <Text style={styles.emptyText}>
            Complete your Alumni profile and experience
            information so CareerForgeAI can create a more
            personalised career roadmap.
          </Text>
        </View>
      )}

      {/* AI Recommendation */}
      <View style={styles.aiCard}>
        <Text style={styles.aiIcon}>
          ✨
        </Text>

        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>
            CareerForgeAI Recommendation
          </Text>

          <Text style={styles.aiText}>
            {recommendation}
          </Text>

          <Pressable
            style={styles.aiButton}
            onPress={() =>
              router.push('/alumni/networking')
            }
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
        onPress={() =>
          router.replace('/alumni/dashboard')
        }
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

  targetRole: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 6,
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 18,
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  errorIcon: {
    fontSize: 42,
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  backErrorButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  backErrorButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 1,
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
});
