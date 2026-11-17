
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
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';

const experienceTypes = [
  {
    id: 'internship',
    icon: 'briefcase-outline' as const,
    title: 'Internships',
    description:
      'Gain workplace experience through internships and graduate programmes.',
  },
  {
    id: 'projects',
    icon: 'rocket-outline' as const,
    title: 'Projects',
    description:
      'Build practical projects that demonstrate your technical and problem-solving abilities.',
  },
  {
    id: 'volunteering',
    icon: 'people-outline' as const,
    title: 'Volunteering',
    description:
      'Develop valuable skills while contributing to your community.',
  },
  {
    id: 'work',
    icon: 'business-outline' as const,
    title: 'Work Experience',
    description:
      'Add part-time, full-time, freelance, or other relevant work experience.',
  },
  {
    id: 'certifications',
    icon: 'ribbon-outline' as const,
    title: 'Certifications',
    description:
      'Earn recognised certifications that strengthen your professional profile.',
  },
  {
    id: 'extracurricular',
    icon: 'star-outline' as const,
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadExperience = async () => {
        try {
          const authToken =
            await AsyncStorage.getItem('authToken');

          if (!authToken) {
            if (isActive) {
              setSelectedExperience([]);
              setLoading(false);
            }

            Alert.alert(
              'Session Expired',
              'Please log in again.'
            );

            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/experience.php`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
              },
            }
          );

          const result = await response.json();

          console.log(
            'Experience API response:',
            result
          );

          if (!isActive) {
            return;
          }

          if (
            response.ok &&
            result?.success &&
            result?.data
          ) {
            const selected =
              result.data
                .selected_experience_types;

            if (Array.isArray(selected)) {
              setSelectedExperience(selected);
            } else {
              setSelectedExperience([]);
            }
          } else {
            console.log(
              'Failed to load experience:',
              result?.message
            );

            setSelectedExperience([]);

            if (response.status === 401) {
              Alert.alert(
                'Session Expired',
                'Please log in again.'
              );
            }
          }
        } catch (error) {
          console.log(
            'Error loading experience:',
            error
          );

          if (isActive) {
            setSelectedExperience([]);

            Alert.alert(
              'Connection Error',
              'Unable to load your experience. Please check your connection and try again.'
            );
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

  const saveExperience = async () => {
    if (selectedExperience.length === 0) {
      Alert.alert(
        'No Experience Selected',
        'Please select at least one experience type.'
      );

      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const authToken =
        await AsyncStorage.getItem('authToken');

      if (!authToken) {
        setSaving(false);

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/experience.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experience_types: selectedExperience,
          }),
        }
      );

      const result = await response.json();

      console.log(
        'Save experience API response:',
        result
      );

      if (
        response.ok &&
        result?.success
      ) {
        const savedExperience =
          result?.data
            ?.selected_experience_types;

        if (Array.isArray(savedExperience)) {
          setSelectedExperience(savedExperience);
        }

        setSaving(false);

        Alert.alert(
          'Experience Saved',
          'Your experience profile has been updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/student/profile');
              },
            },
          ],
          {
            cancelable: false,
          }
        );

        return;
      }

      setSaving(false);

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      Alert.alert(
        'Save Error',
        result?.message ||
          'Something went wrong while saving your experience.'
      );
    } catch (error) {
      console.log('Save error:', error);

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
        <View style={styles.loadingIcon}>
          <Ionicons
            name="briefcase-outline"
            size={26}
            color="#2457E6"
          />
        </View>

        <Text style={styles.loadingText}>
          Loading your experience...
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
        <View style={styles.backIconBox}>
          <Ionicons
            name="chevron-back"
            size={20}
            color="#2457E6"
          />
        </View>

        <Text style={styles.backText}>
          Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <View style={styles.iconInner}>
            <Ionicons
              name="briefcase-outline"
              size={27}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.headerBadge}>
          <View style={styles.headerBadgeDot} />
          <Text style={styles.headerBadgeText}>
            YOUR CAREER PROFILE
          </Text>
        </View>

        <Text style={styles.title}>
          My Experience
        </Text>

        <Text style={styles.subtitle}>
          Build your experience profile with the
          projects, skills, activities and
          achievements that represent you.
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressGlowOne} />
        <View style={styles.progressGlowTwo} />

        <View style={styles.progressHeader}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressLabel}>
              EXPERIENCE PROGRESS
            </Text>

            <Text style={styles.progressTitle}>
              Build your experience profile
            </Text>

            <Text style={styles.progressSmallText}>
              {selectedExperience.length === 0
                ? 'Start by selecting your experience'
                : `${selectedExperience.length} experience ${
                    selectedExperience.length === 1
                      ? 'area'
                      : 'areas'
                  } selected`}
            </Text>
          </View>

          <View style={styles.progressCircleOuter}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>
                {progressPercentage}
              </Text>

              <Text style={styles.progressPercent}>
                %
              </Text>
            </View>
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
        <View style={styles.infoIconContainer}>
          <Ionicons
            name="bulb-outline"
            size={22}
            color="#2457E6"
          />
        </View>

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
        <View>
          <Text style={styles.sectionEyebrow}>
            YOUR EXPERIENCE
          </Text>

          <Text style={styles.sectionTitle}>
            Build Your Experience
          </Text>
        </View>

        <View style={styles.selectedBadge}>
          <Text style={styles.selectedNumber}>
            {selectedExperience.length}
          </Text>

          <Text style={styles.selectedText}>
            selected
          </Text>
        </View>
      </View>

      {/* Experience Cards */}
      <View style={styles.experienceContainer}>
        {experienceTypes.map((experience, index) => {
          const isSelected =
            selectedExperience.includes(
              experience.id
            );

          const iconColors = [
            '#2457E6',
            '#2878C8',
            '#173FBD',
            '#3E62D0',
            '#4C7DFF',
            '#3765D5',
          ];

          const iconColor =
            iconColors[index % iconColors.length];

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
                <Ionicons
                  name={experience.icon}
                  size={24}
                  color={
                    isSelected
                      ? '#FFFFFF'
                      : iconColor
                  }
                />
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

      {/* Experience Checklist */}
      <View style={styles.sectionStandaloneHeader}>
        <Text style={styles.sectionEyebrow}>
          NEXT STEPS
        </Text>

        <Text style={styles.sectionTitle}>
          Experience Checklist
        </Text>
      </View>

      <View style={styles.checklistCard}>
        <View style={styles.checklistRow}>
          <View style={styles.checkCircleComplete}>
            <Ionicons
              name="checkmark"
              size={15}
              color="#15803D"
            />
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
            <Ionicons
              name="checkmark"
              size={15}
              color="#15803D"
            />
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
            <Ionicons
              name="alert-outline"
              size={15}
              color="#B45309"
            />
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
            <Ionicons
              name="alert-outline"
              size={15}
              color="#B45309"
            />
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
        <View style={styles.tipIconContainer}>
          <Ionicons
            name="sparkles-outline"
            size={21}
            color="#2457E6"
          />
        </View>

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

      {/* Save / Add Button */}
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
        <View style={styles.saveButtonIcon}>
          <Ionicons
            name={
              saving
                ? 'hourglass-outline'
                : 'add-circle-outline'
            }
            size={21}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.saveButtonText}>
          {saving
            ? 'Saving...'
            : 'Save Experience'}
        </Text>

        {!saving &&
          selectedExperience.length > 0 && (
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          )}
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
    backgroundColor: '#F4F7FC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E4ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  loadingText: {
    color: '#64748B',
    fontSize: 15,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backIconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#E4ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  backText: {
    fontSize: 15,
    color: '#2457E6',
    fontWeight: '700',
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 66,
    height: 66,
    borderRadius: 19,
    backgroundColor: '#DDE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  iconInner: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4C7DFF',
    marginRight: 6,
  },

  headerBadgeText: {
    color: '#4C6FD8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  progressCard: {
    backgroundColor: '#102A72',
    borderRadius: 21,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  progressGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76,125,255,0.18)',
    right: -55,
    top: -65,
  },

  progressGlowTwo: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: 'rgba(36,87,230,0.24)',
    left: -40,
    bottom: -55,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  progressTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  progressLabel: {
    color: '#AFC4FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    maxWidth: 220,
    lineHeight: 22,
  },

  progressSmallText: {
    color: '#C9D7FF',
    fontSize: 11,
    marginTop: 6,
  },

  progressCircleOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(76,125,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: '#6B8FFF',
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  progressPercent: {
    color: '#DCE6FF',
    fontSize: 9,
    marginTop: -2,
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#173FBD',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#6B8FFF',
    borderRadius: 10,
  },

  progressDescription: {
    color: '#DCE6FF',
    fontSize: 12,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#D6E2FF',
  },

  infoIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173FBD',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#3760B5',
  },

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: '#4C6FD8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172A55',
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4ECFF',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 1,
  },

  selectedNumber: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },

  selectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  experienceContainer: {
    marginBottom: 16,
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7F2',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  experienceCardSelected: {
    backgroundColor: '#F0F4FF',
    borderColor: '#2457E6',
    borderWidth: 2,
    elevation: 3,
  },

  experienceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  experienceIconContainerSelected: {
    backgroundColor: '#2457E6',
  },

  experienceContent: {
    flex: 1,
    paddingRight: 8,
  },

  experienceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 4,
  },

  experienceTitleSelected: {
    color: '#173FBD',
  },

  experienceDescription: {
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
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  sectionStandaloneHeader: {
    marginBottom: 13,
  },

  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E0E7F2',
    marginBottom: 18,
    elevation: 1,
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
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checkCirclePending: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E7F2',
  },

  tipIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2457E6',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  saveButton: {
    minHeight: 55,
    borderRadius: 16,
    backgroundColor: '#2457E6',
    paddingHorizontal: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },

  saveButtonDisabled: {
    backgroundColor: '#B8C4D8',
    shadowOpacity: 0,
    elevation: 0,
  },

  saveButtonIcon: {
    marginRight: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});

