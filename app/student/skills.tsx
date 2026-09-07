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

const SKILLS_STORAGE_KEY = 'careerforge_skills';

const skills = [
  {
    id: 'python',
    icon: '🐍',
    title: 'Python',
    description: 'Programming and data analysis',
  },
  {
    id: 'javascript',
    icon: '💻',
    title: 'JavaScript',
    description: 'Web and application development',
  },
  {
    id: 'data-analysis',
    icon: '📊',
    title: 'Data Analysis',
    description: 'Analyse data and find useful insights',
  },
  {
    id: 'communication',
    icon: '🗣️',
    title: 'Communication',
    description: 'Improve professional communication',
  },
  {
    id: 'problem-solving',
    icon: '🧩',
    title: 'Problem Solving',
    description: 'Develop analytical thinking skills',
  },
  {
    id: 'teamwork',
    icon: '🤝',
    title: 'Teamwork',
    description: 'Collaborate effectively with others',
  },
];

export default function SkillsScreen() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load previously saved skills whenever the screen opens
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadSkills = async () => {
        try {
          console.log('Loading saved skills...');

          const savedSkills = await AsyncStorage.getItem(
            SKILLS_STORAGE_KEY
          );

          console.log('Saved Skills:', savedSkills);

          if (!isActive) {
            return;
          }

          if (savedSkills) {
            const parsedSkills = JSON.parse(savedSkills);

            if (Array.isArray(parsedSkills)) {
              setSelectedSkills(parsedSkills);
            } else {
              setSelectedSkills([]);
            }
          } else {
            setSelectedSkills([]);
          }
        } catch (error) {
          console.log('Error loading skills:', error);

          if (isActive) {
            setSelectedSkills([]);
          }
        } finally {
          if (isActive) {
            setLoadingSkills(false);
          }
        }
      };

      loadSkills();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Select / deselect a skill
  const toggleSkill = (skillId: string) => {
    setSelectedSkills((currentSkills) => {
      if (currentSkills.includes(skillId)) {
        return currentSkills.filter((id) => id !== skillId);
      }

      return [...currentSkills, skillId];
    });
  };

  // Save skills
  const handleSave = async () => {
    console.log('STEP 1: Save Skills button pressed');

    if (selectedSkills.length === 0) {
      console.log('STEP 2: No skills selected');

      Alert.alert(
        'Select a Skill',
        'Please select at least one skill.'
      );

      return;
    }

    if (saving) {
      console.log('Already saving...');
      return;
    }

    console.log(
      'STEP 2: Selected skills:',
      selectedSkills
    );

    try {
      setSaving(true);

      console.log('STEP 3: Saving to AsyncStorage...');

      await AsyncStorage.setItem(
        SKILLS_STORAGE_KEY,
        JSON.stringify(selectedSkills)
      );

      console.log(
        'STEP 4: AsyncStorage save successful'
      );

      setSaving(false);

      console.log('STEP 5: Showing success alert');

      Alert.alert(
        'Skills Saved',
        'Your skills have been updated successfully.',
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

      console.log('STEP 7: Alert should now be visible');
    } catch (error) {
      console.log('STEP ERROR:', error);

      setSaving(false);

      Alert.alert(
        'Error',
        'Something went wrong while saving your skills.'
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
          <Text style={styles.icon}>📚</Text>
        </View>

        <Text style={styles.title}>
          Build Your Skills
        </Text>

        <Text style={styles.subtitle}>
          Select the skills you want to develop
          to become more career-ready.
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Roadmap Progress
          </Text>

          <Text style={styles.progressValue}>
            Step 2 of 6
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Selection Header */}
      <View style={styles.selectionHeader}>
        <Text style={styles.sectionTitle}>
          Skills to Develop
        </Text>

        <Text style={styles.selectedText}>
          {loadingSkills
            ? 'Loading...'
            : `${selectedSkills.length} selected`}
        </Text>
      </View>

      {/* Skills */}
      <View style={styles.skillsContainer}>
        {skills.map((skill) => {
          const isSelected = selectedSkills.includes(
            skill.id
          );

          return (
            <Pressable
              key={skill.id}
              style={[
                styles.skillCard,
                isSelected && styles.skillCardSelected,
              ]}
              onPress={() => toggleSkill(skill.id)}
            >
              {/* Skill Icon */}
              <View
                style={[
                  styles.skillIconContainer,
                  isSelected &&
                    styles.skillIconSelected,
                ]}
              >
                <Text style={styles.skillIcon}>
                  {skill.icon}
                </Text>
              </View>

              {/* Skill Information */}
              <View style={styles.skillContent}>
                <Text
                  style={[
                    styles.skillTitle,
                    isSelected &&
                      styles.skillTitleSelected,
                  ]}
                >
                  {skill.title}
                </Text>

                <Text style={styles.skillDescription}>
                  {skill.description}
                </Text>
              </View>

              {/* Checkbox */}
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

      {/* Career Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Career Tip
          </Text>

          <Text style={styles.tipText}>
            Focus on a combination of technical
            and soft skills. Employers value
            candidates who can solve problems
            and communicate effectively.
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[
          styles.continueButton,
          selectedSkills.length === 0 &&
            styles.continueButtonDisabled,
          saving && styles.continueButtonDisabled,
        ]}
        disabled={
          selectedSkills.length === 0 || saving
        }
        onPress={handleSave}
      >
        <Text style={styles.continueText}>
          {saving ? 'Saving...' : 'Save Skills'}
        </Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footerText}>
        You can update your skills later from
        your profile.
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

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
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
  },

  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  skillsContainer: {
    marginBottom: 10,
  },

  skillCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  skillIconSelected: {
    backgroundColor: '#E0E7FF',
  },

  skillIcon: {
    fontSize: 24,
  },

  skillContent: {
    flex: 1,
    paddingRight: 8,
  },

  skillTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  skillTitleSelected: {
    color: '#4F46E5',
  },

  skillDescription: {
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

  tipCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
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
    color: '#312E81',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4F46E5',
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