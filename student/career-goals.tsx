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
import { Ionicons } from '@expo/vector-icons';

const CAREER_GOALS_STORAGE_KEY =
  'careerforge_career_goals';

const goals = [
  {
    id: 'employment',
    icon: 'briefcase-outline',
    title: 'Find a Job',
    description:
      'Find graduate and entry-level opportunities',
  },
  {
    id: 'internship',
    icon: 'school-outline',
    title: 'Find an Internship',
    description:
      'Gain practical experience in my field',
  },
  {
    id: 'career',
    icon: 'rocket-outline',
    title: 'Build My Career',
    description:
      'Plan and develop my long-term career',
  },
  {
    id: 'skills',
    icon: 'book-outline',
    title: 'Improve My Skills',
    description:
      'Develop skills that employers are looking for',
  },
  {
    id: 'mentor',
    icon: 'people-outline',
    title: 'Find a Mentor',
    description:
      'Connect with experienced professionals',
  },
  {
    id: 'cv',
    icon: 'document-text-outline',
    title: 'Improve My CV',
    description:
      'Create a stronger CV and professional profile',
  },
  {
    id: 'career-change',
    icon: 'swap-horizontal-outline',
    title: 'Change Careers',
    description:
      'Explore a new career path',
  },
  {
    id: 'entrepreneurship',
    icon: 'bulb-outline',
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
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color="#2457E6"
              />
            </Pressable>

            <View style={styles.studentBadge}>
              <Ionicons
                name="school-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.studentBadgeText}>
                STUDENT
              </Text>
            </View>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="flag-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.eyebrow}>
            CAREERFORGEAI
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

        {/* =========================
            SELECTION STATUS
        ========================= */}

        <View style={styles.selectionContainer}>
          <View style={styles.selectionLeft}>
            <View style={styles.selectionIcon}>
              <Ionicons
                name={
                  selectedGoals.length > 0
                    ? 'checkmark-circle-outline'
                    : 'options-outline'
                }
                size={18}
                color="#2457E6"
              />
            </View>

            <View>
              <Text style={styles.selectionEyebrow}>
                YOUR SELECTION
              </Text>

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
          </View>

          {selectedGoals.length > 0 && (
            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>
                {selectedGoals.length}
              </Text>
            </View>
          )}
        </View>

        {/* =========================
            GOALS
        ========================= */}

        <View style={styles.goalsHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              CHOOSE WHAT MATTERS TO YOU
            </Text>

            <Text style={styles.goalsTitle}>
              Career Goals
            </Text>
          </View>

          <Ionicons
            name="navigate-outline"
            size={21}
            color="#2457E6"
          />
        </View>

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
                  <Ionicons
                    name={goal.icon as any}
                    size={23}
                    color={
                      isSelected
                        ? '#FFFFFF'
                        : '#2457E6'
                    }
                  />
                </View>

                <View style={styles.goalContent}>
                  <View style={styles.goalTitleRow}>
                    <Text
                      style={[
                        styles.goalTitle,
                        isSelected &&
                          styles.goalTitleSelected,
                      ]}
                    >
                      {goal.title}
                    </Text>

                    {isSelected && (
                      <View style={styles.selectedLabel}>
                        <Text style={styles.selectedLabelText}>
                          SELECTED
                        </Text>
                      </View>
                    )}
                  </View>

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
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#FFFFFF"
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* =========================
            SAVE BUTTON
        ========================= */}

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
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.saveText}>
            Save Career Goals
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </Pressable>

        {/* =========================
            FOOTER INFO
        ========================= */}

        <View style={styles.footerInfo}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#94A3B8"
          />

          <Text style={styles.footerText}>
            You can update your career goals later
            from your profile.
          </Text>
        </View>

        <Text style={styles.footerBrand}>
          CareerForgeAI • Empowering your career journey
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 45,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    backgroundColor: '#102A72',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 23,
    marginBottom: 17,
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  studentBadge: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 6,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  eyebrow: {
    color: '#C9D8FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 35,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#E8F0FF',
  },

  /* =========================
     SELECTION
  ========================= */

  selectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D9E2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 1,
  },

  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  selectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  selectionEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#2457E6',
    marginBottom: 3,
  },

  selectionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172A55',
  },

  selectionCount: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionCountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* =========================
     GOALS HEADER
  ========================= */

  goalsHeader: {
    paddingHorizontal: 3,
    marginBottom: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#2457E6',
    marginBottom: 3,
  },

  goalsTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172A55',
  },

  /* =========================
     GOAL CARDS
  ========================= */

  goalsContainer: {
    marginBottom: 9,
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2F2',
    borderRadius: 18,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 1,
  },

  goalCardSelected: {
    borderColor: '#2457E6',
    borderWidth: 2,
    backgroundColor: '#F3F6FF',
  },

  goalCardPressed: {
    opacity: 0.82,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconContainerSelected: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  goalContent: {
    flex: 1,
    paddingRight: 7,
  },

  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  goalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172A55',
    flexShrink: 1,
  },

  goalTitleSelected: {
    color: '#173FBD',
  },

  selectedLabel: {
    backgroundColor: '#DCE7FF',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginLeft: 7,
  },

  selectedLabelText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#2457E6',
    letterSpacing: 0.4,
  },

  goalDescription: {
    fontSize: 11,
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
    marginLeft: 6,
  },

  checkboxSelected: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  /* =========================
     SAVE
  ========================= */

  saveButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 5,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginHorizontal: 9,
  },

  /* =========================
     FOOTER
  ========================= */

  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
  },

  footerText: {
    flex: 1,
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 5,
    textAlign: 'center',
  },

  footerBrand: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 19,
  },
});
