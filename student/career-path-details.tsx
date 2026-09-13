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
import { Ionicons } from '@expo/vector-icons';

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

      Alert.alert(
        'Career Path Saved',
        `${title} has been added to your career paths.`
      );
    } catch (error) {
      console.log('Save career path error:', error);
      Alert.alert('Error', 'Could not save this career path.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
          <Ionicons
            name="chevron-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>Career Path</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>{icon}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.categoryBadge}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color="#2457E6"
            />

            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Key Skills */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="sparkles-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <Text style={styles.sectionTitle}>Key Skills</Text>
          </View>

          {skills.length > 0 ? (
            <View style={styles.chipContainer}>
              {skills.map((skill: string, index: number) => (
                <View
                  key={`${skill}-${index}`}
                  style={styles.skillChip}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color="#2457E6"
                  />

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

        {/* Career Roles */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="people-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Possible Career Roles
            </Text>
          </View>

          {roles.length > 0 ? (
            roles.map((role: string, index: number) => (
              <View
                key={`${role}-${index}`}
                style={styles.roleCard}
              >
                <View style={styles.roleIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color="#2457E6"
                  />
                </View>

                <Text style={styles.roleText}>{role}</Text>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A7AFBC"
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Career roles will be displayed here.
            </Text>
          )}
        </View>

        {/* Career Journey */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="map-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Your Career Journey
            </Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Build Your Skills
              </Text>

              <Text style={styles.stepDescription}>
                Develop the technical and professional skills required
                for this career path.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Gain Experience
              </Text>

              <Text style={styles.stepDescription}>
                Build practical experience through projects,
                internships, volunteering and other opportunities.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Explore Opportunities
              </Text>

              <Text style={styles.stepDescription}>
                Find opportunities that match your career goals and
                growing skill set.
              </Text>
            </View>
          </View>
        </View>

        {/* Save */}
        <Pressable
          style={[
            styles.saveButton,
            saved && styles.savedButton,
          ]}
          onPress={savePath}
        >
          <Ionicons
            name={saved ? 'checkmark-circle' : 'bookmark-outline'}
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.saveButtonText}>
            {saved
              ? 'Career Path Saved'
              : 'Save Career Path'}
          </Text>
        </Pressable>

        {/* Roadmap */}
        <Pressable
          style={styles.roadmapButton}
          onPress={() => router.push('/student/career-roadmap')}
        >
          <Ionicons
            name="map-outline"
            size={20}
            color="#2457E6"
          />

          <Text style={styles.roadmapButtonText}>
            View My Career Roadmap
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#2457E6"
          />
        </Pressable>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  header: {
    height: 100,
    backgroundColor: '#102A72',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heroCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  heroIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  heroIcon: {
    fontSize: 42,
  },

  title: {
    color: '#172A55',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    gap: 6,
  },

  categoryText: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '700',
  },

  description: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },

  section: {
    marginBottom: 26,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 19,
    fontWeight: '800',
    flex: 1,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  skillChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2F2',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  skillText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },

  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E2F2',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  roleIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roleText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9E2F2',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
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
    color: '#172A55',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  stepDescription: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },

  saveButton: {
    backgroundColor: '#2457E6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  savedButton: {
    backgroundColor: '#173FBD',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  roadmapButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2457E6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  roadmapButtonText: {
    color: '#2457E6',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
});
