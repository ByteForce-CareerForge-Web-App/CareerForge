import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EXPERIENCE_STORAGE_KEY = 'careerforge_experience';

const experienceTypes = [
  {
    id: 'internship',
    icon: '💼',
    title: 'Internships',
    description:
      'Gain workplace experience through internships and graduate programmes.',
  },
  {
    id: 'projects',
    icon: '🚀',
    title: 'Projects',
    description:
      'Build practical projects that demonstrate your technical and problem-solving abilities.',
  },
  {
    id: 'volunteering',
    icon: '🤝',
    title: 'Volunteering',
    description:
      'Develop valuable skills while contributing to your community.',
  },
  {
    id: 'work',
    icon: '🏢',
    title: 'Work Experience',
    description:
      'Add part-time, full-time, freelance, or other relevant work experience.',
  },
  {
    id: 'certifications',
    icon: '🏆',
    title: 'Certifications',
    description:
      'Earn recognised certifications that strengthen your professional profile.',
  },
  {
    id: 'extracurricular',
    icon: '⭐',
    title: 'Extracurricular Activities',
    description:
      'Showcase leadership, societies, sports, competitions, and other activities.',
  },
];

export default function ExperienceScreen() {
  const [selectedExperience, setSelectedExperience] =
    useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved experience whenever the screen opens
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadExperience = async () => {
        try {
          console.log('Loading saved experience...');

          const savedExperience =
            await AsyncStorage.getItem(
              EXPERIENCE_STORAGE_KEY
            );

          console.log(
            'Saved Experience:',
            savedExperience
          );

          if (!isActive) {
            return;
          }

          if (savedExperience) {
            const parsedExperience =
              JSON.parse(savedExperience);

            if (Array.isArray(parsedExperience)) {
              setSelectedExperience(parsedExperience);
            } else {
              setSelectedExperience([]);
            }
          } else {
            setSelectedExperience([]);
          }
        } catch (error) {
          console.log(
            'Error loading experience:',
            error
          );

          if (isActive) {
            setSelectedExperience([]);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadExperience();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Select / deselect experience
  const toggleExperience = (experienceId: string) => {
    setSelectedExperience((current) => {
      if (current.includes(experienceId)) {
        return current.filter(
          (id) => id !== experienceId
        );
      }

      return [...current, experienceId];
    });
  };

  // Save experience
  const saveExperience = async () => {
    console.log(
      'STEP 1: Save Experience button pressed'
    );

    if (selectedExperience.length === 0) {
      console.log(
        'STEP 2: No experience selected'
      );

      Alert.alert(
        'No Experience Selected',
        'Please select at least one experience type.'
      );

      return;
    }

    if (saving) {
      console.log('Already saving...');
      return;
    }

    console.log(
      'STEP 2: Selected experience:',
      selectedExperience
    );

    try {
      setSaving(true);

      console.log(
        'STEP 3: Saving to AsyncStorage...'
      );

      await AsyncStorage.setItem(
        EXPERIENCE_STORAGE_KEY,
        JSON.stringify(selectedExperience)
      );

      console.log(
        'STEP 4: AsyncStorage save successful'
      );

      setSaving(false);

      console.log(
        'STEP 5: Showing success alert'
      );

      Alert.alert(
        'Experience Saved',
        'Your experience profile has been updated.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('STEP 6: OK pressed');

              router.replace('/student/profile');
            },
          },
        ],
        {
          cancelable: false,
        }
      );

      console.log(
        'STEP 7: Alert should now be visible'
      );
    } catch (error) {
      console.log(
        'STEP ERROR:',
        error
      );

      setSaving(false);

      Alert.alert(
        'Save Error',
        'Something went wrong while saving your experience.'
      );
    }
  };

  const progressPercentage = Math.min(
    45 + selectedExperience.length * 8,
    93
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading experience...
        </Text>
      </View>
    );
  }

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
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💼</Text>
        </View>

        <Text style={styles.title}>
          Gain Experience
        </Text>

        <Text style={styles.subtitle}>
          Build practical experience that helps
          you become more confident and
          career-ready.
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>
              Experience Progress
            </Text>

            <Text style={styles.progressTitle}>
              Build your experience profile
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>
              {progressPercentage}
            </Text>

            <Text style={styles.progressPercent}>
              %
            </Text>
          </View>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressDescription}>
          The more relevant experience you build,
          the stronger your employability profile
          becomes.
        </Text>
      </View>

      {/* Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Experience Doesn't Only Mean Employment
          </Text>

          <Text style={styles.infoText}>
            Projects, volunteering, certifications,
            competitions, and extracurricular
            activities can all demonstrate valuable
            skills to employers.
          </Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.selectionHeader}>
        <Text style={styles.sectionTitle}>
          Build Your Experience
        </Text>

        <Text style={styles.selectedText}>
          {selectedExperience.length} selected
        </Text>
      </View>

      {/* Experience Cards */}
      <View style={styles.experienceContainer}>
        {experienceTypes.map((experience) => {
          const isSelected =
            selectedExperience.includes(
              experience.id
            );

          return (
            <Pressable
              key={experience.id}
              style={[
                styles.experienceCard,
                isSelected &&
                  styles.experienceCardSelected,
              ]}
              onPress={() =>
                toggleExperience(experience.id)
              }
            >
              <View
                style={[
                  styles.experienceIconContainer,
                  isSelected &&
                    styles.experienceIconContainerSelected,
                ]}
              >
                <Text style={styles.experienceIcon}>
                  {experience.icon}
                </Text>
              </View>

              <View style={styles.experienceContent}>
                <Text
                  style={[
                    styles.experienceTitle,
                    isSelected &&
                      styles.experienceTitleSelected,
                  ]}
                >
                  {experience.title}
                </Text>

                <Text
                  style={styles.experienceDescription}
                >
                  {experience.description}
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

      {/* Experience Checklist */}
      <Text style={styles.sectionTitle}>
        Experience Checklist
      </Text>

      <View style={styles.checklistCard}>
        <View style={styles.checklistRow}>
          <View style={styles.checkCircleComplete}>
            <Text style={styles.checkText}>
              ✓
            </Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Identify your experience
            </Text>

            <Text
              style={styles.checklistDescription}
            >
              Think about projects, work,
              volunteering and activities you
              have already completed.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCircleComplete}>
            <Text style={styles.checkText}>
              ✓
            </Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Highlight your skills
            </Text>

            <Text
              style={styles.checklistDescription}
            >
              Identify the skills you developed
              through each experience.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCirclePending}>
            <Text style={styles.pendingText}>
              !
            </Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Add practical experience
            </Text>

            <Text
              style={styles.checklistDescription}
            >
              Look for opportunities to gain more
              hands-on experience.
            </Text>
          </View>
        </View>

        <View style={styles.checklistRowLast}>
          <View style={styles.checkCirclePending}>
            <Text style={styles.pendingText}>
              !
            </Text>
          </View>

          <View style={styles.checklistContent}>
            <Text style={styles.checklistTitle}>
              Document your achievements
            </Text>

            <Text
              style={styles.checklistDescription}
            >
              Keep track of projects, results,
              certificates and accomplishments.
            </Text>
          </View>
        </View>
      </View>

      {/* Tip Card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>✨</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Experience Tip
          </Text>

          <Text style={styles.tipText}>
            Don't wait until you have a full-time
            job to build experience. A personal
            project or volunteer role can help you
            demonstrate real-world skills.
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[
          styles.saveButton,
          selectedExperience.length === 0 &&
            styles.saveButtonDisabled,
          saving && styles.saveButtonDisabled,
        ]}
        disabled={
          selectedExperience.length === 0 ||
          saving
        }
        onPress={saveExperience}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? 'Saving...'
            : 'Save Experience'}
        </Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footerText}>
        You can continue adding experience as you
        develop throughout your career journey.
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 15,
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

  progressCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  progressLabel: {
    color: '#C7D2FE',
    fontSize: 12,
    marginBottom: 5,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    maxWidth: 210,
  },

  progressCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  progressPercent: {
    color: '#E0E7FF',
    fontSize: 10,
    marginTop: -2,
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  progressDescription: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4F46E5',
  },

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },

  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  experienceContainer: {
    marginBottom: 12,
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  experienceCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  experienceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  experienceIconContainerSelected: {
    backgroundColor: '#E0E7FF',
  },

  experienceIcon: {
    fontSize: 24,
  },

  experienceContent: {
    flex: 1,
    paddingRight: 8,
  },

  experienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  experienceTitleSelected: {
    color: '#4F46E5',
  },

  experienceDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  checklistRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkCircleComplete: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checkCirclePending: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checkText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: 'bold',
  },

  pendingText: {
    color: '#B45309',
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

  tipCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  tipIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  saveButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  saveButtonText: {
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