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
  Alert,
} from 'react-native';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type Application = {
  id: string;
  name: string;
  initials: string;
  opportunity: string;
  qualification: string;
  status: ApplicationStatus;
  applied: string;
};

const defaultApplications: Application[] = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    initials: 'TM',
    opportunity: 'Graduate Data Analyst',
    qualification: 'BSc Data Science',
    status: 'Shortlisted',
    applied: '2 days ago',
  },
  {
    id: '2',
    name: 'Aisha Naidoo',
    initials: 'AN',
    opportunity: 'Graduate Data Analyst',
    qualification: 'BSc Computer Science',
    status: 'Under Review',
    applied: '3 days ago',
  },
  {
    id: '3',
    name: 'Liam Smith',
    initials: 'LS',
    opportunity: 'Junior Frontend Developer',
    qualification: 'BSc Information Technology',
    status: 'Shortlisted',
    applied: '4 days ago',
  },
  {
    id: '4',
    name: 'Zanele Dlamini',
    initials: 'ZD',
    opportunity: 'Software Development Intern',
    qualification:
      'Diploma in Software Development',
    status: 'Under Review',
    applied: '5 days ago',
  },
  {
    id: '5',
    name: 'Ethan Williams',
    initials: 'EW',
    opportunity: 'IT Support Graduate',
    qualification:
      'BSc Information Technology',
    status: 'Rejected',
    applied: '1 week ago',
  },
];

export default function ApplicationsScreen() {
  const {
    opportunityId,
    opportunityTitle,
  } = useLocalSearchParams<{
    opportunityId?: string;
    opportunityTitle?: string;
  }>();

  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const [applications, setApplications] =
    useState<Application[]>(
      defaultApplications
    );

  useFocusEffect(
    useCallback(() => {
      loadApplicationStatuses();
    }, [])
  );

  const loadApplicationStatuses =
    async () => {
      try {
        const saved =
          await AsyncStorage.getItem(
            APPLICATION_STATUS_KEY
          );

        if (!saved) {
          setApplications(
            defaultApplications
          );
          return;
        }

        const savedStatuses: Record<
          string,
          ApplicationStatus
        > = JSON.parse(saved);

        const updatedApplications =
          defaultApplications.map(
            (application) => ({
              ...application,
              status:
                savedStatuses[
                  application.id
                ] ??
                application.status,
            })
          );

        setApplications(
          updatedApplications
        );
      } catch (error) {
        console.log(
          'Error loading application statuses:',
          error
        );

        setApplications(
          defaultApplications
        );
      }
    };

  const saveApplicationStatus =
    async (
      applicationId: string,
      status: ApplicationStatus
    ) => {
      try {
        const saved =
          await AsyncStorage.getItem(
            APPLICATION_STATUS_KEY
          );

        const savedStatuses: Record<
          string,
          ApplicationStatus
        > = saved
          ? JSON.parse(saved)
          : {};

        savedStatuses[applicationId] =
          status;

        await AsyncStorage.setItem(
          APPLICATION_STATUS_KEY,
          JSON.stringify(
            savedStatuses
          )
        );
      } catch (error) {
        console.log(
          'Error saving application status:',
          error
        );
      }
    };

  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    const updatedApplications =
      applications.map(
        (application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
              }
            : application
      );

    setApplications(
      updatedApplications
    );

    await saveApplicationStatus(
      applicationId,
      status
    );
  };

  const handleShortlist = (
    application: Application
  ) => {
    Alert.alert(
      'Shortlist Candidate',
      `Are you sure you want to shortlist ${application.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Shortlist',
          onPress: () =>
            updateApplicationStatus(
              application.id,
              'Shortlisted'
            ),
        },
      ]
    );
  };

  const handleReject = (
    application: Application
  ) => {
    Alert.alert(
      'Reject Candidate',
      `Are you sure you want to reject ${application.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            updateApplicationStatus(
              application.id,
              'Rejected'
            ),
        },
      ]
    );
  };

  const handleInterview = (
    application: Application
  ) => {
    Alert.alert(
      'Move to Interview',
      `Move ${application.name} to the interview stage?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () =>
            updateApplicationStatus(
              application.id,
              'Interview'
            ),
        },
      ]
    );
  };

  const opportunityApplications =
    opportunityTitle
      ? applications.filter(
          (application) =>
            application.opportunity ===
            opportunityTitle
        )
      : applications;

  const filteredApplications =
    selectedFilter === 'All'
      ? opportunityApplications
      : opportunityApplications.filter(
          (application) =>
            application.status ===
            selectedFilter
        );

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

  const totalApplications =
    opportunityApplications.length;

  const shortlistedCount =
    opportunityApplications.filter(
      (application) =>
        application.status ===
        'Shortlisted'
    ).length;

  const interviewCount =
    opportunityApplications.filter(
      (application) =>
        application.status ===
        'Interview'
    ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Applications
          </Text>

          <Text style={styles.headerSubtitle}>
            {opportunityTitle
              ? `Applications for ${opportunityTitle}`
              : 'Review and manage candidate applications'}
          </Text>

          {opportunityId && (
            <Text style={styles.opportunityId}>
              Opportunity ID: {opportunityId}
            </Text>
          )}
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

          <Text style={styles.backButtonText}>
            Back
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* SELECTED OPPORTUNITY */}
        {opportunityTitle && (
          <View
            style={
              styles.selectedOpportunity
            }
          >
            <View
              style={styles.selectedIcon}
            >
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.selectedInfo}
            >
              <Text
                style={styles.selectedLabel}
              >
                SELECTED OPPORTUNITY
              </Text>

              <Text
                style={styles.selectedTitle}
              >
                {opportunityTitle}
              </Text>
            </View>
          </View>
        )}

        {/* SUMMARY */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="document-text-outline"
            value={totalApplications}
            label="Applications"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            value={shortlistedCount}
            label="Shortlisted"
          />

          <SummaryCard
            icon="calendar-outline"
            value={interviewCount}
            label="Interviews"
          />
        </View>

        {/* FILTERS */}
        <View
          style={styles.filterContainer}
        >
          {[
            'All',
            'Under Review',
            'Shortlisted',
            'Interview',
            'Rejected',
          ].map((filter) => (
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
              {selectedFilter === filter && (
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
                  selectedFilter === filter
                    ? styles.filterActiveText
                    : styles.filterText
                }
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* APPLICATIONS HEADER */}
        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {opportunityTitle
              ? 'Candidate Applications'
              : 'Recent Applications'}
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {filteredApplications.length}
            </Text>
          </View>
        </View>

        {/* APPLICATIONS */}
        {filteredApplications.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="document-outline"
                size={34}
                color="#64748B"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No applications yet
            </Text>

            <Text style={styles.emptyText}>
              {opportunityTitle
                ? `No candidates have applied for "${opportunityTitle}" yet.`
                : 'There are no applications to display.'}
            </Text>
          </View>
        ) : (
          filteredApplications.map(
            (application) => {
              const statusStyle =
                getStatusStyle(
                  application.status
                );

              return (
                <View
                  key={application.id}
                  style={
                    styles.applicationCard
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
                        {application.initials}
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
                        {application.name}
                      </Text>

                      <Text
                        style={
                          styles.opportunity
                        }
                      >
                        {
                          application.opportunity
                        }
                      </Text>

                      <Text
                        style={
                          styles.qualification
                        }
                      >
                        {
                          application.qualification
                        }
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
                        {application.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.divider}
                  />

                  {/* BOTTOM */}
                  <View
                    style={styles.bottomRow}
                  >
                    <View style={styles.appliedContainer}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color="#94A3B8"
                      />

                      <Text
                        style={
                          styles.appliedText
                        }
                      >
                        Applied{' '}
                        {application.applied}
                      </Text>
                    </View>

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
                              application.name,
                            opportunity:
                              application.opportunity,
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.viewButtonText
                        }
                      >
                        View Candidate
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#2563EB"
                      />
                    </Pressable>
                  </View>

                  {/* ACTIONS */}
                  <View
                    style={styles.actionRow}
                  >
                    {application.status ===
                      'Under Review' && (
                      <>
                        <Pressable
                          style={
                            styles.shortlistButton
                          }
                          onPress={() =>
                            handleShortlist(
                              application
                            )
                          }
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={15}
                            color="#166534"
                          />

                          <Text
                            style={
                              styles.shortlistText
                            }
                          >
                            Shortlist
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.rejectButton
                          }
                          onPress={() =>
                            handleReject(
                              application
                            )
                          }
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={15}
                            color="#991B1B"
                          />

                          <Text
                            style={
                              styles.rejectText
                            }
                          >
                            Reject
                          </Text>
                        </Pressable>
                      </>
                    )}

                    {application.status ===
                      'Shortlisted' && (
                      <>
                        <Pressable
                          style={
                            styles.interviewButton
                          }
                          onPress={() =>
                            handleInterview(
                              application
                            )
                          }
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={15}
                            color="#1D4ED8"
                          />

                          <Text
                            style={
                              styles.interviewText
                            }
                          >
                            Move to Interview
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.rejectButton
                          }
                          onPress={() =>
                            handleReject(
                              application
                            )
                          }
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={15}
                            color="#991B1B"
                          />

                          <Text
                            style={
                              styles.rejectText
                            }
                          >
                            Reject
                          </Text>
                        </Pressable>
                      </>
                    )}

                    {application.status ===
                      'Interview' && (
                      <Pressable
                        style={
                          styles.rejectButton
                        }
                        onPress={() =>
                          handleReject(
                            application
                          )
                        }
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={15}
                          color="#991B1B"
                        />

                        <Text
                          style={
                            styles.rejectText
                          }
                        >
                          Reject
                        </Text>
                      </Pressable>
                    )}

                    {application.status ===
                      'Rejected' && (
                      <Pressable
                        style={
                          styles.reviewButton
                        }
                        onPress={() =>
                          updateApplicationStatus(
                            application.id,
                            'Under Review'
                          )
                        }
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={15}
                          color="#92400E"
                        />

                        <Text
                          style={
                            styles.reviewText
                          }
                        >
                          Reconsider
                        </Text>
                      </Pressable>
                    )}
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

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <Text
        style={styles.summaryNumber}
      >
        {value}
      </Text>

      <Text
        style={styles.summaryLabel}
      >
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
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    paddingRight: 10,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  opportunityId: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 3,
  },

  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  selectedOpportunity: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  selectedIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  selectedInfo: {
    flex: 1,
  },

  selectedLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },

  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
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
    fontSize: 13,
    fontWeight: '600',
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  filterText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },

  sectionHeader: {
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

  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 7,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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

  opportunity: {
    fontSize: 13,
    color: '#2563EB',
    marginTop: 3,
    fontWeight: '600',
  },

  qualification: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  appliedText: {
    fontSize: 12,
    color: '#64748B',
  },

  viewButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  shortlistButton: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  shortlistText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },

  rejectButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  rejectText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },

  interviewButton: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  interviewText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },

  reviewButton: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  reviewText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
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
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },
});