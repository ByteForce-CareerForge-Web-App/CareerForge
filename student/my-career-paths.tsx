import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PATHS_KEY = 'careerforge_saved_career_paths';

type CareerPath = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  skills: string[];
  roles: string[];
};

export default function MyCareerPathsScreen() {
  const [savedPaths, setSavedPaths] = useState<CareerPath[]>([]);

  const loadSavedPaths = async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_PATHS_KEY);

      if (stored) {
        setSavedPaths(JSON.parse(stored));
      } else {
        setSavedPaths([]);
      }
    } catch (error) {
      console.log('Load saved career paths error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedPaths();
    }, [])
  );

  const removePath = async (id: string) => {
    try {
      const updatedPaths = savedPaths.filter(
        (path) => path.id !== id
      );

      await AsyncStorage.setItem(
        SAVED_PATHS_KEY,
        JSON.stringify(updatedPaths)
      );

      setSavedPaths(updatedPaths);

      Alert.alert(
        'Career Path Removed',
        'The career path has been removed from your saved paths.'
      );
    } catch (error) {
      console.log('Remove career path error:', error);
    }
  };

  const openPath = (path: CareerPath) => {
    router.push({
      pathname: '/student/career-path-details',
      params: {
        id: path.id,
        title: path.title,
        category: path.category,
        icon: path.icon,
        description: path.description,
        skills: JSON.stringify(path.skills),
        roles: JSON.stringify(path.roles),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerShapeOne} />
        <View style={styles.headerShapeTwo} />

        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/student/dashboard');
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#172A55"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              CAREERFORGEAI
            </Text>

            <Text style={styles.headerTitle}>
              My Career Paths
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="compass-outline"
              size={23}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.headerBottom}>
          <View style={styles.headerBottomIcon}>
            <Ionicons
              name="bookmark"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <View>
            <Text style={styles.headerBottomNumber}>
              {savedPaths.length}
            </Text>

            <Text style={styles.headerBottomLabel}>
              Saved career pathways
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <Ionicons
              name="navigate-outline"
              size={28}
              color="#2457E6"
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introEyebrow}>
              YOUR CAREER DIRECTION
            </Text>

            <Text style={styles.introTitle}>
              Your Career Paths
            </Text>

            <Text style={styles.introDescription}>
              Keep track of career pathways that match
              your interests, skills and future goals.
            </Text>
          </View>
        </View>

        {/* Section heading */}
        <View style={styles.countRow}>
          <View>
            <Text style={styles.sectionEyebrow}>
              SAVED FOR LATER
            </Text>

            <Text style={styles.sectionTitle}>
              Saved Pathways
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {savedPaths.length}
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {savedPaths.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="compass-outline"
                  size={39}
                  color="#2457E6"
                />
              </View>
            </View>

            <Text style={styles.emptyEyebrow}>
              START EXPLORING
            </Text>

            <Text style={styles.emptyTitle}>
              No Career Paths Yet
            </Text>

            <Text style={styles.emptyDescription}>
              Explore different career pathways and save
              the ones that interest you. Your saved paths
              will be available here.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.exploreButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() =>
                router.push('/student/career-pathways')
              }
            >
              <Ionicons
                name="search-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.exploreButtonText}>
                Explore Career Pathways
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        ) : (
          savedPaths.map((path, index) => (
            <View
              key={path.id}
              style={styles.pathCard}
            >
              {/* Path header */}
              <Pressable
                style={({ pressed }) => [
                  styles.pathMain,
                  pressed && styles.pathPressed,
                ]}
                onPress={() => openPath(path)}
              >
                <View style={styles.pathIconColumn}>
                  <View style={styles.pathIconContainer}>
                    <Text style={styles.pathIcon}>
                      {path.icon}
                    </Text>
                  </View>

                  {index < savedPaths.length - 1 && (
                    <View style={styles.pathConnector} />
                  )}
                </View>

                <View style={styles.pathInfo}>
                  <View style={styles.savedLabel}>
                    <Ionicons
                      name="bookmark"
                      size={10}
                      color="#2457E6"
                    />

                    <Text style={styles.savedLabelText}>
                      SAVED PATHWAY
                    </Text>
                  </View>

                  <Text
                    style={styles.pathTitle}
                    numberOfLines={2}
                  >
                    {path.title}
                  </Text>

                  <View style={styles.categoryRow}>
                    <View style={styles.categoryDot} />

                    <Text style={styles.pathCategory}>
                      {path.category}
                    </Text>
                  </View>

                  <Text
                    style={styles.pathDescription}
                    numberOfLines={3}
                  >
                    {path.description}
                  </Text>
                </View>
              </Pressable>

              {/* Skills */}
              {path.skills?.length > 0 && (
                <View style={styles.skillsSection}>
                  <View style={styles.skillsHeader}>
                    <Ionicons
                      name="sparkles-outline"
                      size={14}
                      color="#2457E6"
                    />

                    <Text style={styles.skillsTitle}>
                      Key Skills
                    </Text>
                  </View>

                  <View style={styles.skillsContainer}>
                    {path.skills
                      .slice(0, 3)
                      .map((skill, skillIndex) => (
                        <View
                          key={`${skill}-${skillIndex}`}
                          style={styles.skillChip}
                        >
                          <Text style={styles.skillText}>
                            {skill}
                          </Text>
                        </View>
                      ))}

                    {path.skills.length > 3 && (
                      <View style={styles.moreSkillChip}>
                        <Text style={styles.moreSkillText}>
                          +{path.skills.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.viewButton,
                    pressed && styles.pressedButton,
                  ]}
                  onPress={() => openPath(path)}
                >
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text style={styles.viewButtonText}>
                    View Path
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removePressed,
                  ]}
                  onPress={() => removePath(path.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color="#64748B"
                  />

                  <Text style={styles.removeButtonText}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Browse More */}
        {savedPaths.length > 0 && (
          <View style={styles.browseSection}>
            <View style={styles.browseLine} />

            <View style={styles.browseHeader}>
              <View style={styles.browseIcon}>
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color="#2457E6"
                />
              </View>

              <View style={styles.browseTextContainer}>
                <Text style={styles.browseTitle}>
                  Keep Exploring
                </Text>

                <Text style={styles.browseDescription}>
                  Discover more career directions that
                  could match your goals.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.browseButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() =>
                router.push('/student/career-pathways')
              }
            >
              <Text style={styles.browseButtonText}>
                Explore More Career Paths
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#2457E6"
              />
            </Pressable>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  /* ---------------- HEADER ---------------- */

  header: {
    backgroundColor: '#102A72',
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: 'hidden',
  },

  headerShapeOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#2457E6',
    opacity: 0.42,
    right: -65,
    top: -80,
  },

  headerShapeTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4C7DFF',
    opacity: 0.18,
    left: -55,
    bottom: -60,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#9DB7FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5E83EF',
  },

  headerBottom: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBottomIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(76,125,255,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerBottomNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  headerBottomLabel: {
    color: '#C4D1EE',
    fontSize: 10,
    marginTop: 1,
    fontWeight: '600',
  },

  /* ---------------- CONTENT ---------------- */

  content: {
    padding: 18,
  },

  /* ---------------- INTRO ---------------- */

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F3',
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 22,
  },

  introIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  introTextContainer: {
    flex: 1,
  },

  introEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  introTitle: {
    color: '#172A55',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },

  introDescription: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 17,
  },

  /* ---------------- SECTION ---------------- */

  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionEyebrow: {
    color: '#2457E6',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  countBadge: {
    minWidth: 32,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  countText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '900',
  },

  /* ---------------- EMPTY ---------------- */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F3',
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 2,
  },

  emptyIconOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F1F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyEyebrow: {
    color: '#2457E6',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 5,
  },

  emptyTitle: {
    color: '#172A55',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },

  emptyDescription: {
    color: '#64748B',
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 21,
  },

  exploreButton: {
    height: 45,
    backgroundColor: '#2457E6',
    borderRadius: 13,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* ---------------- PATH CARD ---------------- */

  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#DCE5F3',
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  pathMain: {
    flexDirection: 'row',
  },

  pathPressed: {
    opacity: 0.82,
  },

  pathIconColumn: {
    width: 61,
    alignItems: 'center',
    marginRight: 12,
  },

  pathIconContainer: {
    width: 57,
    height: 57,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#D5E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pathIcon: {
    fontSize: 29,
  },

  pathConnector: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: '#DCE7FA',
    marginTop: 5,
  },

  pathInfo: {
    flex: 1,
  },

  savedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  savedLabelText: {
    color: '#2457E6',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginLeft: 4,
  },

  pathTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4C7DFF',
    marginRight: 6,
  },

  pathCategory: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '700',
  },

  pathDescription: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 7,
  },

  /* ---------------- SKILLS ---------------- */

  skillsSection: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },

  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  skillsTitle: {
    color: '#172A55',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 5,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  skillChip: {
    backgroundColor: '#F1F5FF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DFE8FA',
  },

  skillText: {
    color: '#2457E6',
    fontSize: 9.5,
    fontWeight: '700',
  },

  moreSkillChip: {
    backgroundColor: '#E8F0FF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  moreSkillText: {
    color: '#173FBD',
    fontSize: 9.5,
    fontWeight: '800',
  },

  /* ---------------- ACTIONS ---------------- */

  cardActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },

  viewButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#2457E6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  removeButton: {
    flex: 0.72,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E0EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  removePressed: {
    backgroundColor: '#EEF2F7',
  },

  removeButtonText: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* ---------------- BROWSE ---------------- */

  browseSection: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#DCE5F3',
  },

  browseLine: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2457E6',
    marginBottom: 15,
  },

  browseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  browseIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  browseTextContainer: {
    flex: 1,
  },

  browseTitle: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '900',
  },

  browseDescription: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 3,
  },

  browseButton: {
    height: 43,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: '#D5E2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  browseButtonText: {
    color: '#2457E6',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
