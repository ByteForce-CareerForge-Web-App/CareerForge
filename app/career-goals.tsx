import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function CareerGoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    {
      id: 'employment',
      icon: '💼',
      title: 'Find a Job',
      description: 'Find graduate and entry-level opportunities',
    },
    {
      id: 'internship',
      icon: '🎓',
      title: 'Find an Internship',
      description: 'Gain practical experience in my field',
    },
    {
      id: 'career',
      icon: '🚀',
      title: 'Build My Career',
      description: 'Plan and develop my long-term career',
    },
    {
      id: 'skills',
      icon: '📚',
      title: 'Improve My Skills',
      description: 'Develop skills that employers are looking for',
    },
    {
      id: 'mentor',
      icon: '🤝',
      title: 'Find a Mentor',
      description: 'Connect with experienced professionals',
    },
    {
      id: 'cv',
      icon: '📄',
      title: 'Improve My CV',
      description: 'Create a stronger CV and professional profile',
    },
    {
      id: 'career-change',
      icon: '🔄',
      title: 'Change Careers',
      description: 'Explore a new career path',
    },
    {
      id: 'entrepreneurship',
      icon: '💡',
      title: 'Start a Business',
      description: 'Explore entrepreneurship and business ideas',
    },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((current) => {
      if (current.includes(goalId)) {
        return current.filter((id) => id !== goalId);
      }

      return [...current, goalId];
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      return;
    }

    // Frontend-only for now.
    // Backend/database connection will be added later.
    router.push('/student-register');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
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
          <Text style={styles.title}>
            What are your career goals?
          </Text>

          <Text style={styles.subtitle}>
            Select one or more goals to help us personalise
            your CareerForgeAI experience.
          </Text>
        </View>

        {/* Selection Counter */}
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionText}>
            {selectedGoals.length === 0
              ? 'Select your goals'
              : `${selectedGoals.length} ${
                  selectedGoals.length === 1 ? 'goal' : 'goals'
                } selected`}
          </Text>
        </View>

        {/* Goals */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);

            return (
              <Pressable
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  <Text style={styles.icon}>{goal.icon}</Text>
                </View>

                <View style={styles.goalContent}>
                  <Text
                    style={[
                      styles.goalTitle,
                      isSelected && styles.goalTitleSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>

                  <Text style={styles.goalDescription}>
                    {goal.description}
                  </Text>
                </View>

                {/* Selection Indicator */}
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

        {/* Continue Button */}
        <Pressable
          style={[
            styles.continueButton,
            selectedGoals.length === 0 &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          You can update your career goals later from your profile.
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
    padding: 22,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 35,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
  },

  selectionContainer: {
    marginBottom: 15,
  },

  selectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },

  goalsContainer: {
    marginBottom: 20,
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  iconContainerSelected: {
    backgroundColor: '#E0E7FF',
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
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  goalTitleSelected: {
    color: '#4F46E5',
  },

  goalDescription: {
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

  continueButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
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
    marginTop: 15,
  },
});

