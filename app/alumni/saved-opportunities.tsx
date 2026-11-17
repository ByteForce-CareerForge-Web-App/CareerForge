import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/constants/api';

type Opportunity = {
  id: string;
  savedId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  match: string;
  description?: string;
  skills?: string[];
};

export default function SavedOpportunities() {
  const [
    savedOpportunities,
    setSavedOpportunities,
  ] = useState<Opportunity[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const loadSavedOpportunities =
    useCallback(async () => {
      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          router.replace('/login');

          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/alumni/saved-opportunities.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
          }
        );

        const rawResponse =
          await response.text();

        let result: any;

        try {
          result = JSON.parse(
            rawResponse
          );
        } catch {
          console.log(
            'Saved opportunities non-JSON response:',
            rawResponse
          );

          Alert.alert(
            'Saved Opportunities Error',
            `The server returned an unexpected response. HTTP ${response.status}`
          );

          return;
        }

        if (response.status === 401) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          Alert.alert(
            'Session Expired',
            'Please log in again.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace(
                    '/login'
                  ),
              },
            ]
          );

          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          Alert.alert(
            'Saved Opportunities Error',
            result.message ||
              'Could not load your saved opportunities.'
          );

          return;
        }

        const backendOpportunities =
          Array.isArray(result.data)
            ? result.data
            : [];

        const mappedOpportunities: Opportunity[] =
          backendOpportunities.map(
            (opportunity: any) => ({
              id: String(
                opportunity.id
              ),

              savedId: String(
                opportunity.saved_id
              ),

              title:
                opportunity.title ||
                'Opportunity',

              company:
                opportunity.company_name ||
                'Company',

              location:
                opportunity.location ||
                'Location',

              type:
                opportunity.type ||
                'Opportunity',

              salary:
                opportunity.salary ||
                'Not specified',

              match: 'Saved',

              description:
                opportunity.description ||
                'Explore this opportunity and discover whether it is a good match for your career goals.',

              skills:
                Array.isArray(
                  opportunity.skills
                )
                  ? opportunity.skills
                  : [],
            })
          );

        setSavedOpportunities(
          mappedOpportunities
        );
      } catch (error) {
        console.log(
          'Error loading saved opportunities:',
          error
        );

        Alert.alert(
          'Saved Opportunities Error',
          'Could not connect to the server. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedOpportunities();
    }, [loadSavedOpportunities])
  );

  function getOpportunityId(
    opportunity: Opportunity
  ) {
    return opportunity.id;
  }

  function getSkills(
    opportunity: Opportunity
  ): string[] {
    if (
      Array.isArray(
        opportunity.skills
      )
    ) {
      return opportunity.skills;
    }

    return [];
  }

  async function removeOpportunity(
    opportunity: Opportunity
  ) {
    Alert.alert(
      'Remove Saved Opportunity',
      `Remove "${opportunity.title}" from your saved opportunities?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              const response =
                await fetch(
                  `${API_BASE_URL}/alumni/saved-opportunities.php`,
                  {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type':
                        'application/json',
                    },
                    body: JSON.stringify({
                      saved_id:
                        Number(
                          opportunity.savedId
                        ),
                    }),
                  }
                );

              const rawResponse =
                await response.text();

              let result: any;

              try {
                result = JSON.parse(
                  rawResponse
                );
              } catch {
                Alert.alert(
                  'Remove Failed',
                  `The server returned an unexpected response. HTTP ${response.status}`
                );

                return;
              }

              if (
                response.status ===
                401
              ) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              if (
                !response.ok ||
                !result.success
              ) {
                Alert.alert(
                  'Remove Failed',
                  result.message ||
                    'The opportunity could not be removed.'
                );

                return;
              }

              setSavedOpportunities(
                (current) =>
                  current.filter(
                    (item) =>
                      item.savedId !==
                      opportunity.savedId
                  )
              );
            } catch (error) {
              console.log(
                'Error removing saved opportunity:',
                error
              );

              Alert.alert(
                'Remove Failed',
                'Could not connect to the server. Please try again.'
              );
            }
          },
        },
      ]
    );
  }

  function openOpportunity(
    opportunity: Opportunity
  ) {
    router.push({
      pathname:
        '/alumni/opportunity-details',

      params: {
        id: opportunity.id,

        title:
          opportunity.title,

        company:
          opportunity.company,

        location:
          opportunity.location,

        type:
          opportunity.type,

        salary:
          opportunity.salary,

        match:
          opportunity.match,

        description:
          opportunity.description ||
          'This opportunity matches your professional profile and career interests.',

        skills: JSON.stringify(
          getSkills(opportunity)
        ),
      },
    });
  }

  function clearAllSaved() {
    if (
      savedOpportunities.length ===
      0
    ) {
      return;
    }

    Alert.alert(
      'Clear Saved Opportunities',
      'Are you sure you want to remove all saved opportunities?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              const response =
                await fetch(
                  `${API_BASE_URL}/alumni/saved-opportunities.php`,
                  {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type':
                        'application/json',
                    },
                    body: JSON.stringify({
                      clear_all: true,
                    }),
                  }
                );

              const rawResponse =
                await response.text();

              let result: any;

              try {
                result = JSON.parse(
                  rawResponse
                );
              } catch {
                Alert.alert(
                  'Clear Failed',
                  `The server returned an unexpected response. HTTP ${response.status}`
                );

                return;
              }

              if (
                response.status ===
                401
              ) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              if (
                !response.ok ||
                !result.success
              ) {
                Alert.alert(
                  'Clear Failed',
                  result.message ||
                    'Your saved opportunities could not be cleared.'
                );

                return;
              }

              setSavedOpportunities(
                []
              );
            } catch (error) {
              console.log(
                'Error clearing saved opportunities:',
                error
              );

              Alert.alert(
                'Clear Failed',
                'Could not connect to the server. Please try again.'
              );
            }
          },
        },
      ]
    );
  }

  function renderOpportunity(
    opportunity: Opportunity
  ) {
    const skills =
      getSkills(opportunity);

    return (
      <View
        key={getOpportunityId(
          opportunity
        )}
        style={styles.card}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>
              💼
            </Text>
          </View>

          <View
            style={styles.matchBadge}
          >
            <Text
              style={styles.matchText}
            >
              {opportunity.match}
            </Text>
          </View>
        </View>

        {/* Information */}
        <Text style={styles.title}>
          {opportunity.title}
        </Text>

        <Text style={styles.company}>
          {opportunity.company}
        </Text>

        <View
          style={styles.detailsRow}
        >
          <Text style={styles.detail}>
            📍 {opportunity.location}
          </Text>

          <Text style={styles.detail}>
            💼 {opportunity.type}
          </Text>
        </View>

        <Text style={styles.salary}>
          {opportunity.salary}
        </Text>

        {/* Skills */}
        {skills.length > 0 && (
          <View
            style={
              styles.skillsContainer
            }
          >
            {skills
              .slice(0, 4)
              .map(
                (
                  skill,
                  index
                ) => (
                  <View
                    key={`${skill}-${index}`}
                    style={
                      styles.skillTag
                    }
                  >
                    <Text
                      style={
                        styles.skillText
                      }
                    >
                      {skill}
                    </Text>
                  </View>
                )
              )}
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              openOpportunity(
                opportunity
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.viewButtonText
              }
            >
              View Opportunity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              removeOpportunity(
                opportunity
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.removeButtonText
              }
            >
              ♥
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTitleContainer
          }
        >
          <Text
            style={styles.headerTitle}
          >
            Saved Opportunities
          </Text>

          {savedOpportunities.length >
            0 && (
            <View
              style={styles.countBadge}
            >
              <Text
                style={styles.countText}
              >
                {
                  savedOpportunities.length
                }
              </Text>
            </View>
          )}
        </View>

        {savedOpportunities.length >
          0 && (
          <TouchableOpacity
            onPress={
              clearAllSaved
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.clearText}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Intro */}
        <View
          style={styles.introCard}
        >
          <Text
            style={styles.introIcon}
          >
            🔖
          </Text>

          <View
            style={styles.introContent}
          >
            <Text
              style={styles.introTitle}
            >
              Your Saved Opportunities
            </Text>

            <Text
              style={styles.introText}
            >
              Keep track of opportunities
              you're interested in and come
              back to them when you're ready.
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {savedOpportunities.length ===
          0 && (
          <View
            style={styles.emptyState}
          >
            <View
              style={
                styles.emptyIconContainer
              }
            >
              <Text
                style={styles.emptyIcon}
              >
                🔖
              </Text>
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No Saved Opportunities
            </Text>

            <Text
              style={styles.emptyText}
            >
              {loading
                ? 'Loading your saved opportunities...'
                : "You haven't saved any opportunities yet. Explore available opportunities and tap the save button to keep them here."}
            </Text>

            {!loading && (
              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={() =>
                  router.push(
                    '/alumni/opportunities'
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Explore Opportunities
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Saved Opportunities */}
        {savedOpportunities.length >
          0 && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              {
                savedOpportunities.length
              }{' '}
              {savedOpportunities.length ===
              1
                ? 'Saved Opportunity'
                : 'Saved Opportunities'}
            </Text>

            {savedOpportunities.map(
              renderOpportunity
            )}
          </>
        )}

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EF',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#5B3FD1',
    marginTop: -5,
  },

  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#202124',
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#5B3FD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  clearText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  introCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  introIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4C1D95',
    marginBottom: 4,
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6D28D9',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEF4',
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 23,
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  matchText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  company: {
    fontSize: 14,
    color: '#5B3FD1',
    fontWeight: '600',
    marginBottom: 10,
  },

  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },

  detail: {
    fontSize: 12,
    color: '#6B6B78',
  },

  salary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 12,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 15,
  },

  skillTag: {
    backgroundColor: '#F3F0FF',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  skillText: {
    color: '#5B3FD1',
    fontSize: 10,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#5B3FD1',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  removeButton: {
    width: 45,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#5B3FD1',
    fontSize: 19,
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    color: '#777784',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#5B3FD1',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});

