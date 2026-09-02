import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CV_IMPROVEMENTS_STORAGE_KEY = 'careerforge_cv_improvements';

export default function ImproveCVScreen() {
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const focusAreas = [
    {
      id: 'personal',
      icon: '👤',
      title: 'Personal Information',
      description:
        'Make your contact and profile information professional.',
    },
    {
      id: 'summary',
      icon: '📝',
      title: 'Professional Summary',
      description:
        'Create a strong introduction that highlights your value.',
    },
    {
      id: 'skills',
      icon: '💡',
      title: 'Skills',
      description:
        'Highlight the skills that match your career goals.',
    },
    {
      id: 'education',
      icon: '🎓',
      title: 'Education',
      description:
        'Present your qualifications and academic achievements.',
    },
    {
      id: 'experience',
      icon: '💼',
      title: 'Experience',
      description:
        'Showcase internships, projects, volunteering and work experience.',
    },
    {
      id: 'projects',
      icon: '🚀',
      title: 'Projects & Achievements',
      description:
        'Show employers what you have built and accomplished.',
    },
  ];

  // Load previously saved improvements whenever this screen opens
  useFocusEffect(
    useCallback(() => {
      const loadSavedImprovements = async () => {
        try {
          console.log('Loading saved CV improvements...');

          const saved = await AsyncStorage.getItem(
            CV_IMPROVEMENTS_STORAGE_KEY
          );

          if (saved) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
              setSelectedFocus(parsed);
              console.log(
                'Saved CV improvements loaded:',
                parsed
              );
            }
          }
        } catch (error) {
          console.log(
            'Error loading CV improvements:',
            error
          );
        }
      };

      loadSavedImprovements();
    }, [])
  );

  const toggleFocus = (focusId: string) => {
    setSelectedFocus((current) => {
      if (current.includes(focusId)) {
        return current.filter((id) => id !== focusId);
      }

      return [...current, focusId];
    });
  };

  const handleSave = async () => {
    console.log('STEP 1: Save Improvements button pressed');

    if (selectedFocus.length === 0) {
      console.log('STEP 2: No improvement areas selected');

      Alert.alert(
        'Select an Area',
        'Please select at least one area you would like to improve.'
      );

      return;
    }

    if (saving) {
      console.log('Already saving...');
      return;
    }

    console.log(
      'STEP 2: Selected improvement areas:',
      selectedFocus
    );

    try {
      setSaving(true);

      console.log(
        'STEP 3: Saving CV improvements to AsyncStorage...'
      );

      await AsyncStorage.setItem(
        CV_IMPROVEMENTS_STORAGE_KEY,
        JSON.stringify(selectedFocus)
      );

      console.log(
        'STEP 4: AsyncStorage save successful'
      );

      setSaving(false);

      console.log(
        'STEP 5: Showing success alert'
      );

      Alert.alert(
        'CV Improvements Saved',
        'Your selected CV improvement areas have been saved successfully.',
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
      console.log('STEP ERROR:', error);

      setSaving(false);

      Alert.alert(
        'Error',
        'Something went wrong while saving your CV improvements.'
      );
    }
  };

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
          <Text style={styles.icon}>📄</Text>
        </View>

        <Text style={styles.title}>Improve Your CV</Text>

        <Text style={styles.subtitle}>
          Strengthen your CV and make it more attractive to
          employers and graduate opportunities.
        </Text>
      </View>

      {/* CV Score */}
      <View style={styles.scoreCard}>
        <View>
          <Text style={styles.scoreLabel}>CV Readiness</Text>

          <Text style={styles.score}>72%</Text>

          <Text style={styles.scoreDescription}>
            Your CV has a good foundation.
          </Text>
        </View>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreCircleText}>72</Text>
          <Text style={styles.scoreCirclePercent}>%</Text>
        </View>
      </View>

      {/* Improvement Message */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>✨</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Make Your CV Stand Out
          </Text>

          <Text style={styles.infoText}>
            Select the areas you would like to improve. You can
            work through them one at a time.
          </Text>
        </View>
      </View>

      {/* Focus Areas */}
      <View style={styles.selectionHeader}>
        <Text style={styles.sectionTitle}>
          Areas to Improve
        </Text>

        <Text style={styles.selectedText}>
          {selectedFocus.length} selected
        </Text>
      </View>

      <View style={styles.focusContainer}>
        {focusAreas.map((area) => {
          const isSelected = selectedFocus.includes(area.id);

          return (
            <Pressable
              key={area.id}
              style={[
                styles.focusCard,
                isSelected && styles.focusCardSelected,
              ]}
              onPress={() => toggleFocus(area.id)}
            >
              <View
                style={[
                  styles.focusIconContainer,
                  isSelected && styles.focusIconSelected,
                ]}
              >
                <Text style={styles.focusIcon}>
                  {area.icon}
                </Text>
              </View>

              <View style={styles.focusContent}>
                <Text
                  style={[
                    styles.focusTitle,
                    isSelected && styles.focusTitleSelected,
                  ]}
                >
                  {area.title}
                </Text>

                <Text style={styles.focusDescription}>
                  {area.description}
                </Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* CV Checklist */}
      <Text style={styles.sectionTitle}>
        CV Checklist
      </Text>

      <View style={styles.checklistCard}>
        <View style={styles.checklistRow}>
          <View style={styles.checkCircleComplete}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <Text style={styles.checklistText}>
            Contact information included
          </Text>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCircleComplete}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <Text style={styles.checklistText}>
            Education information added
          </Text>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCirclePending}>
            <Text style={styles.pendingText}>!</Text>
          </View>

          <Text style={styles.checklistText}>
            Professional summary needs improvement
          </Text>
        </View>

        <View style={styles.checklistRow}>
          <View style={styles.checkCirclePending}>
            <Text style={styles.pendingText}>!</Text>
          </View>

          <Text style={styles.checklistText}>
            Add more project achievements
          </Text>
        </View>
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            CV Tip
          </Text>

          <Text style={styles.tipText}>
            Tailor your CV to the type of role you are applying
            for. Highlight the skills and experiences that are
            most relevant to that opportunity.
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[
          styles.continueButton,
          (selectedFocus.length === 0 || saving) &&
            styles.continueButtonDisabled,
        ]}
        disabled={selectedFocus.length === 0 || saving}
        onPress={handleSave}
      >
        <Text style={styles.continueText}>
          {saving ? 'Saving...' : 'Save Improvements'}
        </Text>
      </Pressable>

      <Text style={styles.footerText}>
        You can continue improving your CV from your profile.
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

  scoreCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  scoreLabel: {
    color: '#E0E7FF',
    fontSize: 13,
    marginBottom: 5,
  },

  score: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
  },

  scoreDescription: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 3,
  },

  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreCircleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  scoreCirclePercent: {
    color: '#E0E7FF',
    fontSize: 10,
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

  focusContainer: {
    marginBottom: 12,
  },

  focusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  focusCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  focusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  focusIconSelected: {
    backgroundColor: '#E0E7FF',
  },

  focusIcon: {
    fontSize: 24,
  },

  focusContent: {
    flex: 1,
    paddingRight: 8,
  },

  focusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  focusTitleSelected: {
    color: '#4F46E5',
  },

  focusDescription: {
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
    alignItems: 'center',
    marginBottom: 14,
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

  checklistText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
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

  continueButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  continueText: {
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

