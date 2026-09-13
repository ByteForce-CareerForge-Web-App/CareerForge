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
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type Candidate = {
  id: string;
  name: string;
  initials: string;
  qualification: string;
  skills: string;
  opportunity: string;
  match: number;
  defaultStatus: ApplicationStatus;
};

const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    initials: 'TM',
    qualification: 'BSc Data Science',
    skills: 'Python • SQL • Power BI',
    opportunity: 'Graduate Data Analyst',
    match: 92,
    defaultStatus: 'Shortlisted',
  },
  {
    id: '2',
    name: 'Aisha Naidoo',
    initials: 'AN',
    qualification: 'BSc Computer Science',
    skills: 'Python • Java • SQL',
    opportunity: 'Graduate Data Analyst',
    match: 88,
    defaultStatus: 'Under Review',
  },
  {
    id: '3',
    name: 'Liam Smith',
    initials: 'LS',
    qualification:
      'BSc Information Technology',
    skills: 'React • JavaScript • TypeScript',
    opportunity: 'Junior Frontend Developer',
    match: 95,
    defaultStatus: 'Shortlisted',
  },
  {
    id: '4',
    name: 'Zanele Dlamini',
    initials: 'ZD',
    qualification:
      'Diploma in Software Development',
    skills: 'Java • SQL • Git',
    opportunity:
      'Software Development Intern',
    match: 84,
    defaultStatus: 'Under Review',
  },
  {
    id: '5',
    name: 'Ethan Williams',
    initials: 'EW',
    qualification:
      'BSc Information Technology',
    skills: 'Networking • Linux • IT Support',
    opportunity: 'IT Support Graduate',
    match: 76,
    defaultStatus: 'Rejected',
  },
  {
    id: '6',
    name: 'Naledi Khumalo',
    initials: 'NK',
    qualification: 'BSc Data Science',
    skills:
      'Python • Machine Learning • Excel',
    opportunity: 'Graduate Data Analyst',
    match: 91,
    defaultStatus: 'Shortlisted',
  },
];

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

  const [statuses, setStatuses] =
    useState<
      Record<string, ApplicationStatus>
    >({});

  useFocusEffect(
    useCallback(() => {
      loadStatuses();
    }, [])
  );

  const loadStatuses = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      if (saved) {
        const parsed: Record<
          string,
          ApplicationStatus
        > = JSON.parse(saved);

        setStatuses(parsed);
      } else {
        setStatuses({});
      }
    } catch (error) {
      console.log(
        'Error loading candidate statuses:',
        error
      );
    }
  };

  const getCandidateStatus = (
    candidate: Candidate
  ): ApplicationStatus => {
    return (
      statuses[candidate.id] ??
      candidate.defaultStatus
    );
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
        matchesSearch && matchesFilter
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
        icon: 'checkmark-circle',
      };
    }

    if (status === 'Rejected') {
      return {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        icon: 'close-circle',
      };
    }

    if (status === 'Interview') {
      return {
        backgroundColor: '#DBEAFE',
        color: '#1D4ED8',
        icon: 'calendar',
      };
    }

    return {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
      icon: 'time',
    };
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
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
          <Ionicons
            name="arrow-back"
            size={17}
            color="#334155"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* STATS */}
        <View style={styles.statsRow}>
          <StatCard
            icon="people-outline"
            number={totalCandidates}
            label="Total Candidates"
          />

          <StatCard
            icon="checkmark-circle-outline"
            number={shortlistedCount}
            label="Shortlisted"
          />

          <StatCard
            icon="calendar-outline"
            number={interviewCount}
            label="Interviews"
          />
        </View>

        {/* SEARCH */}
        <View
          style={styles.searchContainer}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color="#64748B"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skill or qualification..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            blurOnSubmit
          />
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {filters.map((filter) => {
            const isActive =
              selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                style={
                  isActive
                    ? styles.filterActive
                    : styles.filterButton
                }
                onPress={() =>
                  setSelectedFilter(filter)
                }
              >
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#FFFFFF"
                    style={
                      styles.filterCheck
                    }
                  />
                )}

                <Text
                  style={
                    isActive
                      ? styles.filterActiveText
                      : styles.filterText
                  }
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            Candidate Pool
          </Text>

          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeText}>
              {filteredCandidates.length}
            </Text>

            <Text style={styles.resultBadgeLabel}>
              shown
            </Text>
          </View>
        </View>

        {/* CANDIDATES */}
        {filteredCandidates.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <View
              style={styles.emptyIconContainer}
            >
              <Ionicons
                name="search-outline"
                size={34}
                color="#64748B"
              />
            </View>

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
                  key={candidate.id}
                  style={
                    styles.candidateCard
                  }
                >
                  {/* CANDIDATE */}
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
                        style={styles.skills}
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
                      <Ionicons
                        name={
                          statusStyle.icon as any
                        }
                        size={12}
                        color={
                          statusStyle.color
                        }
                      />

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

                  {/* AI MATCH */}
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
                      <View
                        style={
                          styles.matchLabelContainer
                        }
                      >
                        <View
                          style={
                            styles.aiIconContainer
                          }
                        >
                          <Ionicons
                            name="sparkles-outline"
                            size={14}
                            color="#2563EB"
                          />
                        </View>

                        <Text
                          style={
                            styles.matchLabel
                          }
                        >
                          AI Match Score
                        </Text>
                      </View>

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

                    <View
                      style={
                        styles.opportunityRow
                      }
                    >
                      <Ionicons
                        name="briefcase-outline"
                        size={13}
                        color="#64748B"
                      />

                      <Text
                        style={
                          styles.opportunityText
                        }
                      >
                        Best match for:{' '}
                        {candidate.opportunity}
                      </Text>
                    </View>
                  </View>

                  {/* ACTIONS */}
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
                            name:
                              candidate.name,
                            opportunity:
                              candidate.opportunity,
                          },
                        })
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={15}
                        color="#FFFFFF"
                      />

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
                            opportunityTitle:
                              candidate.opportunity,
                          },
                        })
                      }
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={15}
                        color="#2563EB"
                      />

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

function StatCard({
  icon,
  number,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  number: number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <Text style={styles.statNumber}>
        {number}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
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

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },

  filterScroll: {
    marginBottom: 20,
  },

  filterContainer: {
    gap: 8,
  },

  filterActive: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterCheck: {
    marginRight: 4,
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

  resultBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  resultBadgeLabel: {
    fontSize: 11,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  matchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
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

  opportunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  opportunityText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    marginLeft: 5,
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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
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

  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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