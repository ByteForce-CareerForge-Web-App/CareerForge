import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
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
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/dashboard');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          My Career Paths
        </Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🧭</Text>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Your Career Paths
            </Text>

            <Text style={styles.introDescription}>
              Career pathways you've saved will appear here.
            </Text>
          </View>
        </View>

        {/* Count */}
        <View style={styles.countRow}>
          <Text style={styles.sectionTitle}>
            Saved Pathways
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {savedPaths.length}
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {savedPaths.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🧭</Text>

            <Text style={styles.emptyTitle}>
              No Career Paths Yet
            </Text>

            <Text style={styles.emptyDescription}>
              Explore different career pathways and save the
              ones that interest you.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() =>
                router.push('/student/career-pathways')
              }
            >
              <Text style={styles.exploreButtonText}>
                Explore Career Pathways
              </Text>
            </Pressable>
          </View>
        ) : (
          savedPaths.map((path) => (
            <View
              key={path.id}
              style={styles.pathCard}
            >
              <Pressable
                style={styles.pathMain}
                onPress={() => openPath(path)}
              >
                <View style={styles.pathIconContainer}>
                  <Text style={styles.pathIcon}>
                    {path.icon}
                  </Text>
                </View>

                <View style={styles.pathInfo}>
                  <Text style={styles.pathTitle}>
                    {path.title}
                  </Text>

                  <Text style={styles.pathCategory}>
                    {path.category}
                  </Text>

                  <Text
                    style={styles.pathDescription}
                    numberOfLines={2}
                  >
                    {path.description}
                  </Text>
                </View>
              </Pressable>

              {/* Skills */}
              {path.skills?.length > 0 && (
                <View style={styles.skillsContainer}>
                  {path.skills
                    .slice(0, 3)
                    .map((skill, index) => (
                      <View
                        key={`${skill}-${index}`}
                        style={styles.skillChip}
                      >
                        <Text style={styles.skillText}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.viewButton}
                  onPress={() => openPath(path)}
                >
                  <Text style={styles.viewButtonText}>
                    View Path
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.removeButton}
                  onPress={() => removePath(path.id)}
                >
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
          <Pressable
            style={styles.browseButton}
            onPress={() =>
              router.push('/student/career-pathways')
            }
          >
            <Text style={styles.browseButtonText}>
              + Explore More Career Paths
            </Text>
          </Pressable>
        )}

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

  introCard: {
    backgroundColor: '#0B1F3A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  introIcon: {
    fontSize: 42,
    marginRight: 15,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 5,
  },

  introDescription: {
    color: '#DCE6F2',
    fontSize: 13,
    lineHeight: 19,
  },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '800',
  },

  countBadge: {
    marginLeft: 10,
    backgroundColor: '#0B1F3A',
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  emptyIcon: {
    fontSize: 54,
    marginBottom: 14,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },

  emptyDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },

  exploreButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  pathMain: {
    flexDirection: 'row',
  },

  pathIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  pathIcon: {
    fontSize: 31,
  },

  pathInfo: {
    flex: 1,
  },

  pathTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },

  pathCategory: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },

  pathDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },

  skillChip: {
    backgroundColor: '#F0F4F9',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  skillText: {
    color: '#0B1F3A',
    fontSize: 11,
    fontWeight: '600',
  },

  cardActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  removeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  removeButtonText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  browseButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0B1F3A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
  },

  browseButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },
});