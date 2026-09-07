import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

const CAREER_GOALS_STORAGE_KEY =
  'careerforge_career_goals';

const goals = [
  {
    id: 'employment',
    icon: '💼',
    title: 'Find a Job',
    description:
      'Find graduate and entry-level opportunities',
  },
  {
    id: 'internship',
    icon: '🎓',
    title: 'Find an Internship',
    description:
      'Gain practical experience in my field',
  },
  {
    id: 'career',
    icon: '🚀',
    title: 'Build My Career',
    description:
      'Plan and develop my long-term career',
  },
  {
    id: 'skills',
    icon: '📚',
    title: 'Improve My Skills',
    description:
      'Develop skills that employers are looking for',
  },
  {
    id: 'mentor',
    icon: '🤝',
    title: 'Find a Mentor',
    description:
      'Connect with experienced professionals',
  },
  {
    id: 'cv',
    icon: '📄',
    title: 'Improve My CV',
    description:
      'Create a stronger CV and professional profile',
  },
  {
    id: 'career-change',
    icon: '🔄',
    title: 'Change Careers',
    description:
      'Explore a new career path',
  },
  {
    id: 'entrepreneurship',
    icon: '💡',
    title: 'Start a Business',
    description:
      'Explore entrepreneurship and business ideas',
  },
];

export default function CareerGoalsScreen() {
  const params = useLocalSearchParams();

  const isRegistration =
    params.mode === 'registration';

  const [selectedGoals, setSelectedGoals] =
    useState<string[]>([]);

  const [loadingGoals, setLoadingGoals] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadCareerGoals = async () => {
        try {
          const savedGoals =
            await AsyncStorage.getItem(
              CAREER_GOALS_STORAGE_KEY
            );

          if (savedGoals) {
            const parsedGoals =
              JSON.parse(savedGoals);

            if (
              isActive &&
              Array.isArray(parsedGoals)
            ) {
              setSelectedGoals(parsedGoals);
            }
          } else {
            if (isActive) {
              setSelectedGoals([]);
            }
          }
        } catch {
          if (isActive) {
            setSelectedGoals([]);
          }
        } finally {
          if (isActive) {
            setLoadingGoals(false);
          }
        }
      };

      loadCareerGoals();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((currentGoals) => {
      if (currentGoals.includes(goalId)) {
        return currentGoals.filter(
          (id) => id !== goalId
        );
      }

      return [...currentGoals, goalId];
    });
  };

  const handleSave = async () => {
    if (selectedGoals.length === 0) {
      return;
    }

    try {
      await AsyncStorage.setItem(
        CAREER_GOALS_STORAGE_KEY,
        JSON.stringify(selectedGoals)
      );

      Alert.alert(
        'Career Goals Saved',
        isRegistration
          ? 'Your career goals have been saved. Continue with your student registration.'
          : 'Your career goals have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isRegistration) {
                router.replace({
                  pathname: '/student-register',
                  params: {
                    goals: selectedGoals.join(','),
                  },
                });
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert(
        'Error',
        'Unable to save your career goals. Please try again.'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ←
            </Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>
              CAREER PLANNING
            </Text>

            <Text style={styles.title}>
              What are your career goals?
            </Text>

            <Text style={styles.subtitle}>
              Select one or more goals to help us
              personalise your CareerForgeAI
              experience.
            </Text>
          </View>
        </View>

        {/* Selection Counter */}
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionText}>
            {loadingGoals
              ? 'Loading your goals...'
              : selectedGoals.length === 0
              ? 'Select your goals'
              : `${selectedGoals.length} ${
                  selectedGoals.length === 1
                    ? 'goal'
                    : 'goals'
                } selected`}
          </Text>
        </View>

        {/* Career Goals */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => {
            const isSelected =
              selectedGoals.includes(goal.id);

            return (
              <Pressable
                key={goal.id}
                style={({ pressed }) => [
                  styles.goalCard,
                  isSelected &&
                    styles.goalCardSelected,
                  pressed &&
                    styles.goalCardPressed,
                ]}
                onPress={() =>
                  toggleGoal(goal.id)
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    isSelected &&
                      styles.iconContainerSelected,
                  ]}
                >
                  <Text style={styles.icon}>
                    {goal.icon}
                  </Text>
                </View>

                <View style={styles.goalContent}>
                  <Text
                    style={[
                      styles.goalTitle,
                      isSelected &&
                        styles.goalTitleSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>

                  <Text
                    style={styles.goalDescription}
                  >
                    {goal.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    isSelected &&
                      styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Text style={styles.checkmark}>
                      ✓
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            selectedGoals.length === 0 &&
              styles.saveButtonDisabled,
            pressed &&
              selectedGoals.length > 0 &&
              styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={selectedGoals.length === 0}
        >
          <Text style={styles.saveText}>
            Save Career Goals
          </Text>

          <Text style={styles.saveArrow}>
            →
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          You can update your career goals later
          from your profile.
        </Text>
      </ScrollView>
    </View>
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

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  backText: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '600',
    marginTop: -2,
  },

  headerTextContainer: {
    paddingRight: 5,
  },

  eyebrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 35,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#E2E8F0',
  },

  selectionContainer: {
    marginBottom: 14,
    paddingHorizontal: 3,
  },

  selectionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  goalsContainer: {
    marginBottom: 12,
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1EA',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalCardSelected: {
    borderColor: '#0B1F3A',
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },

  goalCardPressed: {
    opacity: 0.82,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  iconContainerSelected: {
    backgroundColor: '#E2E8F0',
  },

  icon: {
    fontSize: 24,
  },

  goalContent: {
    flex: 1,
    paddingRight: 8,
  },

  goalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  goalTitleSelected: {
    color: '#0B1F3A',
  },

  goalDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },

  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  saveArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },

  footerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
    paddingHorizontal: 15,
  },
});