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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';

type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string | null;
  match?: string | null;
  description: string;
  skills: string[];
  deadline?: string | null;
};

export default function AlumniOpportunities() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  const [search, setSearch] =
    useState('');

  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /*
  |--------------------------------------------------------------------------
  | LOAD ALUMNI OPPORTUNITIES
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [])
  );

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/opportunities.php`,
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
        }
      );

      const rawResponse =
        await response.text();

      let result;

      try {
        result =
          JSON.parse(rawResponse);
      } catch {
        console.log(
          'Alumni opportunities non-JSON response:',
          rawResponse
        );

        throw new Error(
          `Server returned an invalid response. HTTP ${response.status}`
        );
      }

      console.log(
        'Alumni opportunities API response:',
        result
      );

      if (response.status === 401) {
        await AsyncStorage.removeItem(
          'authToken'
        );

        await AsyncStorage.removeItem(
          'user'
        );

        router.replace('/login');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to load opportunities.'
        );
      }

      const formattedOpportunities:
        Opportunity[] =
        Array.isArray(result.data)
          ? result.data.map(
              (opportunity: any) => ({
                id: String(
                  opportunity.id
                ),

                title:
                  opportunity.title ||
                  'Opportunity',

                company:
                  opportunity.company ||
                  'Company',

                location:
                  opportunity.location ||
                  'Not specified',

                type:
                  opportunity.type ||
                  'Opportunity',

                salary:
                  opportunity.salary ??
                  null,

                match:
                  opportunity.match ??
                  null,

                description:
                  opportunity.description ||
                  'No description provided.',

                skills:
                  Array.isArray(
                    opportunity.skills
                  )
                    ? opportunity.skills
                    : [],

                deadline:
                  opportunity.deadline ??
                  null,
              })
            )
          : [];

      setOpportunities(
        formattedOpportunities
      );

    } catch (error) {
      console.log(
        'Error loading alumni opportunities:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load opportunities.'
      );

      setOpportunities([]);

    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER OPPORTUNITIES
  |--------------------------------------------------------------------------
  */

  const filteredOpportunities =
    opportunities.filter(
      (opportunity) => {

        const searchValue =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !searchValue ||
          opportunity.title
            .toLowerCase()
            .includes(searchValue) ||
          opportunity.company
            .toLowerCase()
            .includes(searchValue) ||
          opportunity.location
            .toLowerCase()
            .includes(searchValue) ||
          opportunity.description
            .toLowerCase()
            .includes(searchValue) ||
          opportunity.skills.some(
            (skill) =>
              skill
                .toLowerCase()
                .includes(searchValue)
          );

        let matchesFilter = true;

        if (
          selectedFilter ===
          'Full-time'
        ) {
          matchesFilter =
            opportunity.type
              .toLowerCase()
              .includes('full');
        }

        if (
          selectedFilter ===
          'Remote'
        ) {
          matchesFilter =
            opportunity.location
              .toLowerCase()
              .includes('remote');
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | OPEN OPPORTUNITY
  |--------------------------------------------------------------------------
  */

  const openOpportunity = (
    opportunity: Opportunity
  ) => {
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
          opportunity.salary ||
          'Not specified',

        match:
          opportunity.match ||
          '',

        description:
          opportunity.description,

        skills:
          opportunity.skills.join(','),

        deadline:
          opportunity.deadline ||
          '',
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <Text
              style={styles.backText}
            >
              ←
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              Opportunities
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Find your next career opportunity
            </Text>
          </View>
        </View>

        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />

          <Text
            style={styles.loadingText}
          >
            Loading opportunities...
          </Text>
        </View>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ←
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={styles.headerTitle}
          >
            Opportunities
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Find your next career opportunity
          </Text>
        </View>

        {/* Saved Opportunities Button */}
        <TouchableOpacity
          onPress={() =>
            router.push(
              '/alumni/saved-opportunities'
            )
          }
          style={
            styles.savedButton
          }
        >
          <Text
            style={
              styles.savedButtonText
            }
          >
            ♥
          </Text>

          <Text
            style={
              styles.savedButtonLabel
            }
          >
            Saved
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* Search */}
        <View
          style={
            styles.searchContainer
          }
        >
          <Text
            style={styles.searchIcon}
          >
            ⌕
          </Text>

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search opportunities"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* AI Recommendation Banner */}
        <View style={styles.aiCard}>

          <View style={styles.aiIcon}>
            <Text
              style={
                styles.aiIconText
              }
            >
              ✦
            </Text>
          </View>

          <View style={styles.aiInfo}>

            <Text style={styles.aiTitle}>
              AI Recommended Opportunities
            </Text>

            <Text
              style={
                styles.aiDescription
              }
            >
              These opportunities have been selected based on your
              professional profile and career interests.
            </Text>

          </View>

        </View>

        {/* Filters */}
        <View style={styles.filterRow}>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'All' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'All'
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter ===
                  'All' &&
                  styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'Full-time' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'Full-time'
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter ===
                  'Full-time' &&
                  styles.filterTextActive,
              ]}
            >
              Full-time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter ===
                'Remote' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setSelectedFilter(
                'Remote'
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter ===
                  'Remote' &&
                  styles.filterTextActive,
              ]}
            >
              Remote
            </Text>
          </TouchableOpacity>

        </View>

        {/* Section */}
        <Text
          style={styles.sectionTitle}
        >
          Recommended for You
        </Text>

        {/* Error */}
        {error ? (
          <View
            style={
              styles.messageCard
            }
          >
            <Text
              style={
                styles.messageTitle
              }
            >
              Unable to load opportunities
            </Text>

            <Text
              style={
                styles.messageText
              }
            >
              {error}
            </Text>

            <TouchableOpacity
              style={
                styles.retryButton
              }
              onPress={
                loadOpportunities
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredOpportunities.length ===
          0 ? (
          <View
            style={
              styles.messageCard
            }
          >
            <Text
              style={
                styles.messageTitle
              }
            >
              No Opportunities Found
            </Text>

            <Text
              style={
                styles.messageText
              }
            >
              {opportunities.length ===
              0
                ? 'There are currently no open opportunities available.'
                : 'No opportunities match your search or selected filter.'}
            </Text>
          </View>
        ) : (
          /* Opportunity Cards */
          filteredOpportunities.map(
            (opportunity) => (
              <TouchableOpacity
                key={
                  opportunity.id
                }
                style={
                  styles.opportunityCard
                }
                onPress={() =>
                  openOpportunity(
                    opportunity
                  )
                }
              >

                {/* Card Header */}
                <View
                  style={
                    styles.cardHeader
                  }
                >

                  <View
                    style={
                      styles.companyIcon
                    }
                  >
                    <Text
                      style={
                        styles.companyIconText
                      }
                    >
                      {opportunity.company.charAt(
                        0
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.cardTitleContainer
                    }
                  >
                    <Text
                      style={
                        styles.jobTitle
                      }
                    >
                      {
                        opportunity.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.companyName
                      }
                    >
                      {
                        opportunity.company
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.matchBadge
                    }
                  >
                    <Text
                      style={
                        styles.matchText
                      }
                    >
                      {opportunity.match ||
                        '—'}
                    </Text>

                    <Text
                      style={
                        styles.matchLabel
                      }
                    >
                      match
                    </Text>
                  </View>

                </View>

                {/* Location */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  📍 {opportunity.location}
                </Text>

                {/* Employment Type */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  💼 {opportunity.type}
                </Text>

                {/* Salary */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  💰{' '}
                  {opportunity.salary ||
                    'Not specified'}
                </Text>

                {/* Skills */}
                <View
                  style={
                    styles.skillsContainer
                  }
                >
                  {opportunity.skills.map(
                    (skill) => (
                      <View
                        key={skill}
                        style={
                          styles.skillBadge
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

                <View
                  style={
                    styles.viewContainer
                  }
                >
                  <Text
                    style={
                      styles.viewText
                    }
                  >
                    View Opportunity →
                  </Text>
                </View>

              </TouchableOpacity>
            )
          )
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 24,
    color: '#4F46E5',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#24243A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  savedButton: {
    minWidth: 52,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },

  savedButtonText: {
    fontSize: 17,
    color: '#4F46E5',
    lineHeight: 18,
  },

  savedButtonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 2,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  searchIcon: {
    fontSize: 24,
    color: '#64748B',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#24243A',
  },

  aiCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 18,
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  aiInfo: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 4,
  },

  aiDescription: {
    fontSize: 12,
    color: '#5F5F70',
    lineHeight: 18,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9E5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6C63FF',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  filterTextActive: {
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 14,
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  companyIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C63FF',
  },

  cardTitleContainer: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 13,
    color: '#777777',
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  matchText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },

  matchLabel: {
    fontSize: 8,
    color: '#15803D',
  },

  detailText: {
    fontSize: 13,
    color: '#5F5F70',
    marginBottom: 7,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 7,
  },

  skillBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  skillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  viewContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEF5',
    marginTop: 10,
    paddingTop: 12,
  },

  viewText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },

  messageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    textAlign: 'center',
    marginBottom: 7,
  },

  messageText: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 15,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

