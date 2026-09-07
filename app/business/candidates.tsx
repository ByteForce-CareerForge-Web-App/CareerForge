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
          style={styles.searchContainer}
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
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            Candidate Pool
          </Text>

          <Text style={styles.resultCount}>
            {filteredCandidates.length} shown
          </Text>
        </View>

        {/* Candidates */}
        {filteredCandidates.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
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
                  key={candidate.id}
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