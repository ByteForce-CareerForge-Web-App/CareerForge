import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const CV_IMPROVEMENTS_KEY = 'careerforge_cv_improvements';

type ImprovementStatus = 'pending' | 'completed';

type ImprovementItem = {
  id: string;
  status: ImprovementStatus;
};

const focusAreas = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Improve the way your contact and personal details are presented.',
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    description: 'Create a stronger introduction that highlights your career direction.',
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Highlight relevant technical and professional skills for your target roles.',
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Present your qualifications and academic achievements more effectively.',
  },
  {
    id: 'experience',
    title: 'Experience',
    description: 'Improve how your work, internship and volunteering experience is described.',
  },
  {
    id: 'projects',
    title: 'Projects & Achievements',
    description: 'Showcase projects and achievements that demonstrate your abilities.',
  },
];

export default function CVImprovementPlanScreen() {
  const [improvementPlan, setImprovementPlan] = useState<ImprovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadImprovementPlan = useCallback(async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem(CV_IMPROVEMENTS_KEY);

      if (!stored) {
        setImprovementPlan([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setImprovementPlan([]);
        return;
      }

      // Supports the older format:
      // ["summary", "skills"]
      //
      // and the newer format:
      // [
      //   { id: "summary", status: "pending" },
      //   { id: "skills", status: "completed" }
      // ]

      const normalized: ImprovementItem[] = parsed
        .map((item: unknown) => {
          if (typeof item === 'string') {
            return {
              id: item,
              status: 'pending' as ImprovementStatus,
            };
          }

          if (
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            typeof (item as { id?: unknown }).id === 'string'
          ) {
            const typedItem = item as {
              id: string;
              status?: unknown;
            };

            return {
              id: typedItem.id,
              status:
                typedItem.status === 'completed'
                  ? ('completed' as ImprovementStatus)
                  : ('pending' as ImprovementStatus),
            };
          }

          return null;
        })
        .filter((item): item is ImprovementItem => item !== null);

      setImprovementPlan(normalized);
    } catch (error) {
      console.error('Failed to load CV improvement plan:', error);
      Alert.alert(
        'Error',
        'Unable to load your CV improvement plan.'
      );
      setImprovementPlan([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadImprovementPlan();
    }, [loadImprovementPlan])
  );

    const getArea = (id: string) => {
      return focusAreas.find((area) => area.id === id);
    };


    const handleAISuggestions = (areaId: string) => {
    const area = focusAreas.find(item => item.id === areaId);

    if (!area) {
      Alert.alert(
        'Error',
        'Unable to identify this CV improvement area.'
      );
      return;
    }

    router.push({
      pathname: '/student/ai-career-assistant',
      params: {
        area: area.id,
        source: 'cv-improvement',
      },
    });
  };



  const completedCount = improvementPlan.filter(
    (item) => item.status === 'completed'
  ).length;

  const totalCount = improvementPlan.length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Your CV Improvement Plan</Text>
            <Text style={styles.subtitle}>
              Focus on the areas that can make your CV stronger.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Loading your improvement plan...
            </Text>
          </View>
        ) : improvementPlan.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📄</Text>

            <Text style={styles.emptyTitle}>
              No improvement areas selected
            </Text>

            <Text style={styles.emptyText}>
              Choose the areas of your CV that you would like to improve
              before creating your improvement plan.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.replace('/student/improve-cv')}
            >
              <Text style={styles.primaryButtonText}>
                Choose Improvement Areas
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>
                    Your Progress
                  </Text>
                  <Text style={styles.progressSubtitle}>
                    {completedCount} of {totalCount} completed
                  </Text>
                </View>

                <Text style={styles.progressPercentage}>
                  {totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0}
                  %
                </Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${
                        totalCount > 0
                          ? (completedCount / totalCount) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Areas to Improve
            </Text>

            {improvementPlan.map((item) => {
              const area = getArea(item.id);

              if (!area) {
                return null;
              }

              const completed = item.status === 'completed';

              return (
                <View key={item.id} style={styles.improvementCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.iconText}>
                        {completed ? '✓' : '!'}
                      </Text>
                    </View>

                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>
                        {area.title}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          completed
                            ? styles.completedBadge
                            : styles.pendingBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            completed
                              ? styles.completedText
                              : styles.pendingText,
                          ]}
                        >
                          {completed
                            ? '✓ Completed'
                            : '🔴 Needs improvement'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.cardDescription}>
                    {area.description}
                  </Text>

                  {!completed && (
                    <Pressable
                      style={styles.aiButton}
                      onPress={() => handleAISuggestions(item.id)}
                    >
                      <Text style={styles.aiButtonText}>
                        Get AI Suggestions →
                      </Text>
                    </Pressable>
                  )}

                  {completed && (
                    <View style={styles.completedMessage}>
                      <Text style={styles.completedMessageText}>
                        This improvement has been completed.
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.replace('/student/improve-cv')}
            >
              <Text style={styles.secondaryButtonText}>
                Edit Improvement Areas
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 32,
    color: '#6D28D9',
    lineHeight: 36,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#17132A',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777281',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777281',
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E9E5F2',
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#211A2D',
  },

  progressSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#85808D',
  },

  progressPercentage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7C3AED',
  },

  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EDE9FE',
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#211A2D',
    marginBottom: 14,
  },

  improvementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9E5F2',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#7C3AED',
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#211A2D',
    marginBottom: 7,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  pendingBadge: {
    backgroundColor: '#FFF4E5',
  },

  completedBadge: {
    backgroundColor: '#EAF8EF',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  pendingText: {
    color: '#B45309',
  },

  completedText: {
    color: '#15803D',
  },

  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777281',
    marginTop: 15,
    marginBottom: 16,
  },

  aiButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  completedMessage: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
  },

  completedMessageText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E5F2',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#211A2D',
    textAlign: 'center',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777281',
    textAlign: 'center',
    marginBottom: 22,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
});

