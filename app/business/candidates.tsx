import React, {
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type Candidate = {
  id: string;
  applicationId: number;
  studentId: number;
  name: string;
  initials: string;
  qualification: string;
  skills: string;
  opportunity: string;
  match: number;
  status: ApplicationStatus;
};

type ApplicationResponse = {
  id: number;
  application_id?: number;
  student_id: number;
  opportunity_id: number;
  title?: string;
  opportunity_title?: string;
  student_name?: string;
  candidate_name?: string;
  qualification?: string | null;
  status?: string;
  status_label?: string;
  applied_at?: string;
};

type CandidateProfileResponse = {
  success: boolean;
  data?: {
    application_id?: number;
    student_id?: number;
    opportunity_id?: number;

    name?: string;
    email?: string;
    qualification?: string | null;

    skills?: string[];

    opportunity?: string;

    applied?: string;
    applied_at?: string;

    status?: string;

    ai_match?: number;

    employability_score?: number | null;
  };
};

const filters = [
  'All',
  'Shortlisted',
  'Under Review',
  'Interview',
  'Rejected',
];

export default function CandidatesScreen() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const getStatus = (
    status?: string
  ): ApplicationStatus => {
    const normalized =
      String(status ?? '')
        .toLowerCase()
        .trim();

    if (
      normalized === 'shortlisted'
    ) {
      return 'Shortlisted';
    }

    if (
      normalized === 'interview'
    ) {
      return 'Interview';
    }

    if (
      normalized === 'rejected'
    ) {
      return 'Rejected';
    }

    return 'Under Review';
  };

  const getInitials = (
    name: string
  ) => {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const loadCandidates = async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        router.replace('/login');
        return;
      }

      /*
       * Get the business's applications.
       *
       * We leave applications.php completely
       * untouched because it is already used by
       * the Applications and Manage Opportunities
       * functionality.
       */
      const applicationsResponse =
        await fetch(
          `${API_BASE_URL}/business/applications.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

      const applicationsJson =
        await applicationsResponse.json();

      if (
        applicationsResponse.status ===
        401
      ) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      if (
        !applicationsResponse.ok ||
        applicationsJson.success !== true
      ) {
        throw new Error(
          applicationsJson.message ||
            'Unable to load candidates.'
        );
      }

      const applications: ApplicationResponse[] =
        Array.isArray(
          applicationsJson.data
        )
          ? applicationsJson.data
          : Array.isArray(
              applicationsJson.applications
            )
          ? applicationsJson.applications
          : [];

      /*
       * Get the full candidate information
       * from candidate-profile.php.
       *
       * IMPORTANT:
       *
       * candidate-profile.php returns:
       *
       * data.name
       * data.qualification
       * data.skills
       * data.opportunity
       * data.ai_match
       *
       * It does NOT return:
       *
       * data.candidate.name
       *
       * Therefore we read directly from profileData.
       */
      const candidateResults =
        await Promise.all(
          applications.map(
            async (application) => {
              const applicationId =
                Number(
                  application.id ??
                    application.application_id
                );

              if (
                !Number.isInteger(
                  applicationId
                )
              ) {
                return null;
              }

              try {
                const profileResponse =
                  await fetch(
                    `${API_BASE_URL}/business/candidate-profile.php?application_id=${applicationId}`,
                    {
                      method: 'GET',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        Accept:
                          'application/json',
                      },
                    }
                  );

                const profileJson: CandidateProfileResponse =
                  await profileResponse.json();

                if (
                  profileResponse.status ===
                  401
                ) {
                  return null;
                }

                if (
                  !profileResponse.ok ||
                  profileJson.success !== true
                ) {
                  throw new Error(
                    'Unable to load candidate profile.'
                  );
                }

                const profileData =
                  profileJson.data;

                /*
                 * candidate-profile.php returns
                 * the name directly as data.name.
                 */
                const candidateName =
                  profileData?.name ||
                  application.student_name ||
                  application.candidate_name ||
                  'Candidate';

                const qualification =
                  profileData?.qualification ||
                  application.qualification ||
                  'Qualification not provided';

                /*
                 * candidate-profile.php returns
                 * skills as an array of strings:
                 *
                 * ["PHP", "JavaScript", "SQL"]
                 *
                 * So we do NOT use skill.name here.
                 */
                const skills =
                  Array.isArray(
                    profileData?.skills
                  )
                    ? profileData.skills
                        .filter(
                          (
                            skill
                          ): skill is string =>
                            typeof skill ===
                            'string' &&
                            skill.trim() !== ''
                        )
                        .join(' • ')
                    : '';

                /*
                 * candidate-profile.php returns
                 * the opportunity title directly
                 * as data.opportunity.
                 */
                const opportunityTitle =
                  profileData?.opportunity ||
                  application.title ||
                  application.opportunity_title ||
                  'Opportunity';

                const match =
                  Number(
                    profileData?.ai_match ??
                      0
                  );

                return {
                  id: String(
                    application.student_id
                  ),

                  applicationId,

                  studentId: Number(
                    application.student_id
                  ),

                  name: candidateName,

                  initials:
                    getInitials(
                      candidateName
                    ),

                  qualification,

                  skills:
                    skills ||
                    'No skills listed',

                  opportunity:
                    opportunityTitle,

                  match: Math.max(
                    0,
                    Math.min(
                      100,
                      Math.round(match)
                    )
                  ),

                  status: getStatus(
                    profileData?.status ||
                      application.status
                  ),
                } as Candidate;

              } catch (error) {
                console.log(
                  'Error loading candidate profile:',
                  error
                );

                /*
                 * If candidate-profile.php fails
                 * for one candidate, keep that
                 * candidate visible using whatever
                 * information applications.php
                 * provides.
                 */
                const candidateName =
                  application.student_name ||
                  application.candidate_name ||
                  'Candidate';

                return {
                  id: String(
                    application.student_id
                  ),

                  applicationId,

                  studentId: Number(
                    application.student_id
                  ),

                  name: candidateName,

                  initials:
                    getInitials(
                      candidateName
                    ),

                  qualification:
                    application.qualification ||
                    'Qualification not provided',

                  skills:
                    'No skills listed',

                  opportunity:
                    application.title ||
                    application.opportunity_title ||
                    'Opportunity',

                  match: 0,

                  status: getStatus(
                    application.status
                  ),
                } as Candidate;
              }
            }
          )
        );

      const validCandidates =
        candidateResults.filter(
          (
            candidate
          ): candidate is Candidate =>
            candidate !== null
        );

      setCandidates(
        validCandidates
      );

    } catch (error) {
      console.log(
        'Error loading candidates:',
        error
      );

      Alert.alert(
        'Unable to Load Candidates',
        error instanceof Error
          ? error.message
          : 'Something went wrong while loading candidates.'
      );

      setCandidates([]);

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCandidates();
    }, [])
  );

  const getCandidateStatus = (
    candidate: Candidate
  ): ApplicationStatus => {
    return candidate.status;
  };

  const filteredCandidates =
    candidates.filter((candidate) => {
      const status =
        getCandidateStatus(candidate);

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        candidate.name
          .toLowerCase()
          .includes(searchValue) ||
        candidate.qualification
          .toLowerCase()
          .includes(searchValue) ||
        candidate.skills
          .toLowerCase()
          .includes(searchValue) ||
        candidate.opportunity
          .toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        selectedFilter === 'All' ||
        status === selectedFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  const totalCandidates =
    candidates.length;

  const shortlistedCount =
    candidates.filter(
      (candidate) =>
        getCandidateStatus(candidate) ===
        'Shortlisted'
    ).length;

  const interviewCount =
    candidates.filter(
      (candidate) =>
        getCandidateStatus(candidate) ===
        'Interview'
    ).length;

  const getStatusStyle = (
    status: ApplicationStatus
  ) => {
    if (status === 'Shortlisted') {
      return {
        backgroundColor: '#DCFCE7',
        color: '#166534',
      };
    }

    if (status === 'Rejected') {
      return {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
      };
    }

    if (status === 'Interview') {
      return {
        backgroundColor: '#DBEAFE',
        color: '#1D4ED8',
      };
    }

    return {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Candidates
          </Text>

          <Text style={styles.headerSubtitle}>
            Discover and manage potential
            candidates
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                '/business/dashboard'
              );
            }
          }}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {totalCandidates}
            </Text>

            <Text style={styles.statLabel}>
              Total Candidates
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {shortlistedCount}
            </Text>

            <Text style={styles.statLabel}>
              Shortlisted
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {interviewCount}
            </Text>

            <Text style={styles.statLabel}>
              Interviews
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          style={
            styles.searchContainer
          }
        >
          <Text style={styles.searchIcon}>
            🔍
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skill or qualification..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {filters.map((filter) => (
            <Pressable
              key={filter}
              style={
                selectedFilter === filter
                  ? styles.filterActive
                  : styles.filterButton
              }
              onPress={() =>
                setSelectedFilter(filter)
              }
            >
              <Text
                style={
                  selectedFilter === filter
                    ? styles.filterActiveText
                    : styles.filterText
                }
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results Header */}
        <View
          style={styles.resultsHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Candidate Pool
          </Text>

          <Text
            style={styles.resultCount}
          >
            {filteredCandidates.length}{' '}
            shown
          </Text>
        </View>

        {/* Candidates */}
        {loading ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyIcon}
            >
              ⏳
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              Loading candidates...
            </Text>

            <Text
              style={styles.emptyText}
            >
              Please wait while we load
              the candidate pool.
            </Text>
          </View>
        ) : filteredCandidates.length ===
          0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyIcon}
            >
              🔎
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No candidates found
            </Text>

            <Text
              style={styles.emptyText}
            >
              Try changing your search or
              filter.
            </Text>
          </View>
        ) : (
          filteredCandidates.map(
            (candidate) => {
              const status =
                getCandidateStatus(
                  candidate
                );

              const statusStyle =
                getStatusStyle(status);

              return (
                <View
                  key={
                    candidate.applicationId
                  }
                  style={
                    styles.candidateCard
                  }
                >
                  {/* Candidate */}
                  <View
                    style={styles.topRow}
                  >
                    <View
                      style={styles.avatar}
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {candidate.initials}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.candidateInfo
                      }
                    >
                      <Text
                        style={
                          styles.candidateName
                        }
                      >
                        {candidate.name}
                      </Text>

                      <Text
                        style={
                          styles.qualification
                        }
                      >
                        {
                          candidate.qualification
                        }
                      </Text>

                      <Text
                        style={
                          styles.skills
                        }
                      >
                        {candidate.skills}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusStyle.backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusStyle.color,
                          },
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  {/* AI Match */}
                  <View
                    style={
                      styles.matchContainer
                    }
                  >
                    <View
                      style={
                        styles.matchHeader
                      }
                    >
                      <Text
                        style={
                          styles.matchLabel
                        }
                      >
                        🤖 AI Match Score
                      </Text>

                      <Text
                        style={
                          styles.matchScore
                        }
                      >
                        {candidate.match}%
                      </Text>
                    </View>

                    <View
                      style={
                        styles.progressBackground
                      }
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${candidate.match}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.opportunityText
                      }
                    >
                      Best match for:{' '}
                      {candidate.opportunity}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View
                    style={styles.actionRow}
                  >
                    <Pressable
                      style={
                        styles.viewButton
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            '/business/candidate-profile',
                          params: {
                            applicationId:
                              String(
                                candidate.applicationId
                              ),
                            studentId:
                              String(
                                candidate.studentId
                              ),
                            name:
                              candidate.name,
                            opportunity:
                              candidate.opportunity,
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.viewButtonText
                        }
                      >
                        View Profile
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.applicationButton
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            '/business/applications',
                          params: {
                            applicationId:
                              String(
                                candidate.applicationId
                              ),
                            studentId:
                              String(
                                candidate.studentId
                              ),
                            opportunityTitle:
                              candidate.opportunity,
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.applicationButtonText
                        }
                      >
                        View Application
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            }
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerInfo: {
    flex: 1,
    paddingRight: 10,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },

  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2563EB',
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },

  filterScroll: {
    marginBottom: 20,
  },

  filterContainer: {
    gap: 8,
  },

  filterActive: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
  },

  filterActiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
  },

  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  resultCount: {
    fontSize: 12,
    color: '#64748B',
  },

  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  candidateInfo: {
    flex: 1,
  },

  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  qualification: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },

  skills: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },

  matchContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },

  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  matchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  matchScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },

  opportunityText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 7,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  applicationButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },

  applicationButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },
});