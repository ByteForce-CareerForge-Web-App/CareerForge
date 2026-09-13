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
        backgroundColor: '#ECFDF5',
        color: '#047857',
        icon: 'checkmark-circle',
      };
    }

    if (status === 'Rejected') {
      return {
        backgroundColor: '#FFF1F2',
        color: '#BE123C',
        icon: 'close-circle',
      };
    }

    if (status === 'Interview') {
      return {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        icon: 'calendar',
      };
    }

    return {
      backgroundColor: '#FFF8E7',
      color: '#A16207',
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
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backCircle}
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
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons
              name="people-outline"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>
              Applications
            </Text>

            <View style={styles.liveBadge}>
              <View
                style={styles.liveDot}
              />

              <Text style={styles.liveText}>
                ACTIVE
              </Text>
            </View>
          </View>

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
              style={styles.selectedAccent}
            />

            <View
              style={styles.selectedIcon}
            >
              <Ionicons
                name="briefcase-outline"
                size={21}
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

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#94A3B8"
            />
          </View>
        )}

        {/* SUMMARY */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="document-text-outline"
            value={totalApplications}
            label="Applications"
            accent="blue"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            value={shortlistedCount}
            label="Shortlisted"
            accent="green"
          />

          <SummaryCard
            icon="calendar-outline"
            value={interviewCount}
            label="Interviews"
            accent="gold"
          />
        </View>

        {/* FILTER SECTION */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <View>
              <Text style={styles.filterTitle}>
                Application Status
              </Text>

              <Text style={styles.filterSubtitle}>
                Filter candidates by stage
              </Text>
            </View>

            <Ionicons
              name="options-outline"
              size={20}
              color="#64748B"
            />
          </View>

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
                    size={13}
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
        </View>

        {/* APPLICATIONS HEADER */}
        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              {opportunityTitle
                ? 'Candidate Applications'
                : 'Recent Applications'}
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Review candidate profiles and update their stage
            </Text>
          </View>

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
            <View
              style={styles.emptyIconContainer}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#2563EB"
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
                  {/* CARD TOP */}
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

                      <View
                        style={
                          styles.roleRow
                        }
                      >
                        <Ionicons
                          name="briefcase-outline"
                          size={13}
                          color="#2563EB"
                        />

                        <Text
                          style={
                            styles.opportunity
                          }
                        >
                          {
                            application.opportunity
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.qualificationRow
                        }
                      >
                        <Ionicons
                          name="school-outline"
                          size={13}
                          color="#94A3B8"
                        />

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

                  {/* APPLICATION META */}
                  <View
                    style={styles.bottomRow}
                  >
                    <View
                      style={
                        styles.appliedContainer
                      }
                    >
                      <View
                        style={
                          styles.metaIcon
                        }
                      >
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#64748B"
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.metaLabel
                          }
                        >
                          APPLICATION
                        </Text>

                        <Text
                          style={
                            styles.appliedText
                          }
                        >
                          Applied{' '}
                          {application.applied}
                        </Text>
                      </View>
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
                        name="arrow-forward"
                        size={15}
                        color="#FFFFFF"
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
                            color="#047857"
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
                            color="#BE123C"
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
                            color="#BE123C"
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
                          color="#BE123C"
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
                          color="#A16207"
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
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  accent: 'blue' | 'green' | 'gold';
}) {
  const accentStyles = {
    blue: {
      iconBackground: '#EFF6FF',
      iconColor: '#2563EB',
      numberColor: '#0B1F3A',
      accentBar: '#2563EB',
    },
    green: {
      iconBackground: '#ECFDF5',
      iconColor: '#047857',
      numberColor: '#0B1F3A',
      accentBar: '#10B981',
    },
    gold: {
      iconBackground: '#FFF8E7',
      iconColor: '#A16207',
      numberColor: '#0B1F3A',
      accentBar: '#D4A72C',
    },
  };

  const current =
    accentStyles[accent];

  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryAccentBar,
          {
            backgroundColor:
              current.accentBar,
          },
        ]}
      />

      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              current.iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={current.iconColor}
        />
      </View>

      <Text
        style={[
          styles.summaryNumber,
          {
            color: current.numberColor,
          },
        ]}
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
    backgroundColor: '#F5F8FC',
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    width: '100%',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },

  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.7,
  },

  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#CBD5E1',
    marginTop: 7,
    maxWidth: '92%',
  },

  opportunityId: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 5,
  },

  /* =========================
     CONTENT
  ========================= */

  content: {
    padding: 18,
    paddingBottom: 45,
  },

  /* =========================
     SELECTED OPPORTUNITY
  ========================= */

  selectedOpportunity: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3EAF3',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
    overflow: 'hidden',
  },

  selectedAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#D4A72C',
  },

  selectedIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 12,
  },

  selectedInfo: {
    flex: 1,
  },

  selectedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },

  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginTop: 4,
  },

  /* =========================
     SUMMARY
  ========================= */

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  summaryCard: {
    flex: 1,
    minHeight: 116,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    overflow: 'hidden',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  summaryAccentBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  summaryNumber: {
    fontSize: 23,
    fontWeight: '800',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },

  /* =========================
     FILTERS
  ========================= */

  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  filterSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterActive: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },

  /* =========================
     SECTION HEADER
  ========================= */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    maxWidth: 270,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 17,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* =========================
     APPLICATION CARD
  ========================= */

  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D6E5FF',
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  candidateInfo: {
    flex: 1,
    paddingRight: 4,
  },

  candidateName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  opportunity: {
    fontSize: 12,
    color: '#2563EB',
    marginLeft: 5,
    fontWeight: '700',
    flexShrink: 1,
  },

  qualificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  qualification: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 5,
    flexShrink: 1,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 13,
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 112,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 14,
  },

  /* =========================
     META / VIEW
  ========================= */

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  metaIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  metaLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  appliedText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },

  viewButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  viewButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* =========================
     ACTIONS
  ========================= */

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  shortlistButton: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },

  shortlistText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '800',
  },

  rejectButton: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },

  rejectText: {
    color: '#BE123C',
    fontSize: 11,
    fontWeight: '800',
  },

  interviewButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  interviewText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },

  reviewButton: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  reviewText: {
    color: '#A16207',
    fontSize: 11,
    fontWeight: '800',
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3EAF3',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
});