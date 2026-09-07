import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PATHS_KEY = 'careerforge_saved_career_paths';

export default function CareerPathDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    category?: string;
    icon?: string;
    description?: string;
    skills?: string;
    roles?: string;
  }>();

  const [saved, setSaved] = useState(false);

  const title = params.title || 'Career Path';
  const category = params.category || 'Career';
  const icon = params.icon || '🚀';
  const description =
    params.description ||
    'Explore this career pathway and discover the skills and roles that can help you build your career.';

  const skills = useMemo(() => {
    try {
      return params.skills ? JSON.parse(params.skills) : [];
    } catch {
      return [];
    }
  }, [params.skills]);

  const roles = useMemo(() => {
    try {
      return params.roles ? JSON.parse(params.roles) : [];
    } catch {
      return [];
    }
  }, [params.roles]);

  const savePath = async () => {
    try {
      const existing = await AsyncStorage.getItem(SAVED_PATHS_KEY);
      const savedPaths = existing ? JSON.parse(existing) : [];

      const path = {
        id: params.id || Date.now().toString(),
        title,
        category,
        icon,
        description,
        skills,
        roles,
      };

      const alreadySaved = savedPaths.some(
        (item: any) => item.id === path.id
      );

      if (!alreadySaved) {
        savedPaths.push(path);
        await AsyncStorage.setItem(
          SAVED_PATHS_KEY,
          JSON.stringify(savedPaths)
        );
      }

      setSaved(true);
      Alert.alert('Career Path Saved', `${title} has been added to your career paths.`);
    } catch (error) {
      console.log('Save career path error:', error);
      Alert.alert('Error', 'Could not save this career path.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/career-pathways');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Career Path</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{icon}</Text>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Skills</Text>

          {skills.length > 0 ? (
            <View style={styles.chipContainer}>
              {skills.map((skill: string, index: number) => (
                <View key={`${skill}-${index}`} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Skills will be added as you progress through this pathway.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possible Career Roles</Text>

          {roles.length > 0 ? (
            roles.map((role: string, index: number) => (
              <View key={`${role}-${index}`} style={styles.roleCard}>
                <View style={styles.roleIcon}>
                  <Text>💼</Text>
                </View>

                <Text style={styles.roleText}>{role}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Career roles will be displayed here.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Career Journey</Text>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Build Your Skills</Text>
              <Text style={styles.stepDescription}>
                Develop the technical and professional skills required for
                this career path.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Gain Experience</Text>
              <Text style={styles.stepDescription}>
                Build practical experience through projects, internships,
                volunteering and other opportunities.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Explore Opportunities</Text>
              <Text style={styles.stepDescription}>
                Find opportunities that match your career goals and growing
                skill set.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, saved && styles.savedButton]}
          onPress={savePath}
        >
          <Text style={styles.saveButtonText}>
            {saved ? '✓ Career Path Saved' : '☆ Save Career Path'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.roadmapButton}
          onPress={() => router.push('/student/career-roadmap')}
        >
          <Text style={styles.roadmapButtonText}>
            View My Career Roadmap →
          </Text>
        </Pressable>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    height: 100,
    backgroundColor: '#0B1F3A',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 36,
    marginTop: -4,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  content: {
    padding: 20,
  },

  heroCard: {
    backgroundColor: '#0B1F3A',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },

  heroIcon: {
    fontSize: 58,
    marginBottom: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },

  categoryText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '700',
  },

  description: {
    color: '#E8EEF7',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  skillChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  skillText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '600',
  },

  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E7EF',
  },

  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roleText: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '600',
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E7EF',
  },

  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  stepDescription: {
    color: '#657286',
    fontSize: 13,
    lineHeight: 19,
  },

  saveButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  savedButton: {
    backgroundColor: '#173A63',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  roadmapButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0B1F3A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  roadmapButtonText: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyText: {
    color: '#657286',
    fontSize: 14,
    lineHeight: 20,
  },
});