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
  ActivityIndicator,
} from 'react-native';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '@/constants/api';

type BackendSkill = {
  id: number;
  name: string;
};

type BackendOpportunity = {
  id: number;
  title: string;
  description?: string;
  type: string;
  location: string;
  work_arrangement: string;
  positions: number;
  minimum_qualification: string;
  deadline: string;
  status: string;
  created_at?: string;
  applications: number;
  shortlisted: number;
  skills?: BackendSkill[];
};

type Opportunity = {
  id: string;
  title: string;
  type: string;
  description?: string;
  skills?: BackendSkill[];
  location: string;
  arrangement: string;
  applications: number;
  shortlisted: number;
  deadline: string;
  positions?: string;
  qualification?: string;
  status: 'Active' | 'Closed';
  createdAt?: string;
};

const formatOpportunityType = (
  type: string
): string => {
  switch (type) {
    case 'internship':
      return 'Internship';

    case 'graduate_program':
      return 'Graduate Job';

    case 'learnership':
      return 'Learnership';

    case 'job':
      return 'Job';

    case 'volunteer':
      return 'Volunteer';

    case 'other':
      return 'Other';

    default:
      return type
        ? type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )
        : 'Opportunity';
  }
};

const formatArrangement = (
  arrangement: string
): string => {
  switch (arrangement) {
    case 'on-site':
      return 'On-site';

    case 'hybrid':
      return 'Hybrid';

    case 'remote':
      return 'Remote';

    default:
      return arrangement
        ? arrangement
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )
        : 'Not specified';
  }
};

const formatDeadline = (
  deadline: string
): string => {
  if (!deadline) {
    return 'No deadline';
  }

  const parts = deadline.split('-');

  if (parts.length !== 3) {
    return deadline;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthIndex =
    Number(month) - 1;

  if (
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return deadline;
  }

  return `${Number(day)} ${monthNames[monthIndex]} ${year}`;
};

const mapOpportunity = (
  opportunity: BackendOpportunity
): Opportunity => {
  return {
    id: String(opportunity.id),

    title:
      opportunity.title ?? 'Untitled Opportunity',

    type: formatOpportunityType(
      opportunity.type
    ),

    description:
      opportunity.description ?? '',

    skills:
      Array.isArray(opportunity.skills)
        ? opportunity.skills
        : [],

    location:
      opportunity.location ?? 'Not specified',

    arrangement:
      formatArrangement(
        opportunity.work_arrangement
      ),

    applications:
      Number(opportunity.applications) || 0,

    shortlisted:
      Number(opportunity.shortlisted) || 0,

    deadline:
      formatDeadline(
        opportunity.deadline
      ),

    positions:
      opportunity.positions !== undefined &&
      opportunity.positions !== null
        ? String(opportunity.positions)
        : undefined,

    qualification:
      opportunity.minimum_qualification ??
      '',

    status:
      opportunity.status === 'closed'
        ? 'Closed'
        : 'Active',

    createdAt:
      opportunity.created_at,
  };
};

export default function ManageOpportunitiesScreen() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isClosing, setIsClosing] =
    useState<string | null>(null);

  const loadOpportunities =
    async () => {
      try {
        setIsLoading(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          Alert.alert(
            'Session Expired',
            'Please log in again.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace('/'),
              },
            ]
          );

          return;
        }

        const url =
          `${API_BASE_URL}/business/opportunities.php`;

        console.log(
          'Loading business opportunities from:',
          url
        );

        const response =
          await fetch(url, {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${token}`,
              Accept:
                'application/json',
            },
          });

        const rawText =
          await response.text();

        console.log(
          'Business opportunities HTTP status:',
          response.status
        );

        console.log(
          'Business opportunities response:',
          rawText
        );

        let data: any;

        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `The server returned an invalid response.\n\n${rawText.substring(
              0,
              300
            )}`
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              `Unable to load opportunities. HTTP ${response.status}`
          );
        }

        const backendData =
          Array.isArray(data.data)
            ? data.data
            : [];

        const mappedOpportunities =
          backendData.map(
            (
              opportunity: BackendOpportunity
            ) =>
              mapOpportunity(
                opportunity
              )
          );

        setOpportunities(
          mappedOpportunities
        );

      } catch (error) {
        console.error(
          'Error loading business opportunities:',
          error
        );

        Alert.alert(
          'Unable to Load Opportunities',
          error instanceof Error
            ? error.message
            : 'Something went wrong while loading your opportunities.'
        );

        setOpportunities([]);

      } finally {
        setIsLoading(false);
      }
    };

  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [])
  );

  const handleCloseOpportunity = (
    id: string
  ) => {
    Alert.alert(
      'Close Opportunity',
      'Are you sure you want to close this opportunity?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                Alert.alert(
                  'Session Expired',
                  'Please log in again.'
                );

                return;
              }

              setIsClosing(id);

              const url =
                `${API_BASE_URL}/business/opportunities.php`;

              console.log(
                'Closing opportunity:',
                id
              );

              const response =
                await fetch(url, {
                  method: 'PUT',
                  headers: {
                    'Content-Type':
                      'application/json',
                    Authorization:
                      `Bearer ${token}`,
                    Accept:
                      'application/json',
                  },
                  body: JSON.stringify({
                    opportunity_id:
                      Number(id),
                    action: 'close',
                  }),
                });

              const rawText =
                await response.text();

              console.log(
                'Close opportunity HTTP status:',
                response.status
              );

              console.log(
                'Close opportunity response:',
                rawText
              );

              let data: any;

              try {
                data =
                  JSON.parse(rawText);
              } catch {
                throw new Error(
                  'The server returned an invalid response.'
                );
              }

              if (
                !response.ok ||
                !data.success
              ) {
                throw new Error(
                  data.message ||
                    'Unable to close opportunity.'
                );
              }

              /*
              |--------------------------------------------------------------------------
              | REFRESH FROM DATABASE
              |--------------------------------------------------------------------------
              */

              await loadOpportunities();

              Alert.alert(
                'Opportunity Closed',
                data.message ||
                  'The opportunity has been closed successfully.'
              );

            } catch (error) {
              console.error(
                'Error closing opportunity:',
                error
              );

              Alert.alert(
                'Unable to Close Opportunity',
                error instanceof Error
                  ? error.message
                  : 'Something went wrong while closing the opportunity.'
              );

            } finally {
              setIsClosing(null);
            }
          },
        },
      ]
    );
  };

  const activeCount =
    opportunities.filter(
      (opportunity) =>
        opportunity.status === 'Active'
    ).length;

  const totalApplications =
    opportunities.reduce(
      (
        total,
        opportunity
      ) =>
        total +
        opportunity.applications,
      0
    );

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.headerTop}>

            <Pressable
              style={styles.backButton}
              onPress={() => {
                if (
                  router.canGoBack()
                ) {
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

            <View style={styles.headerInfo}>
              <Text
                style={
                  styles.headerEyebrow
                }
              >
                RECRUITMENT
              </Text>

              <Text
                style={styles.headerTitle}
              >
                Manage Opportunities
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Manage your posted graduate
                opportunities.
              </Text>
            </View>

          </View>

          <View
            style={styles.headerAccent}
          />

        </View>

        {/* SUMMARY */}
        <View style={styles.summaryRow}>

          <View
            style={styles.summaryCard}
          >

            <View
              style={
                styles.summaryIconBlue
              }
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <Text
              style={styles.summaryValue}
            >
              {activeCount}
            </Text>

            <Text
              style={styles.summaryLabel}
            >
              Active Opportunities
            </Text>

            <View
              style={
                styles.summaryAccentBlue
              }
            />

          </View>

          <View
            style={styles.summaryCard}
          >

            <View
              style={
                styles.summaryIconGold
              }
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#B88912"
              />
            </View>

            <Text
              style={styles.summaryValue}
            >
              {totalApplications}
            </Text>

            <Text
              style={styles.summaryLabel}
            >
              Total Applications
            </Text>

            <View
              style={
                styles.summaryAccentGold
              }
            />

          </View>

        </View>

        {/* POST NEW OPPORTUNITY */}
        <Pressable
          style={styles.postButton}
          onPress={() =>
            router.push(
              '/business/post-opportunity'
            )
          }
        >
          <View style={styles.postIcon}>
            <Ionicons
              name="add"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.postTextContainer
            }
          >
            <Text
              style={
                styles.postButtonText
              }
            >
              Post New Opportunity
            </Text>

            <Text
              style={
                styles.postButtonSubtext
              }
            >
              Create a new graduate opportunity
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </Pressable>

        {/* SECTION HEADER */}
        <View
          style={styles.sectionHeader}
        >

          <View>
            <Text
              style={
                styles.sectionEyebrow
              }
            >
              POSTED ROLES
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              Your Opportunities
            </Text>
          </View>

          <View
            style={styles.countBadge}
          >
            <Text
              style={styles.countText}
            >
              {opportunities.length}
            </Text>

            <Text
              style={styles.countLabel}
            >
              total
            </Text>
          </View>

        </View>

        {/* LOADING */}
        {isLoading && (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text
              style={styles.loadingText}
            >
              Loading your opportunities...
            </Text>
          </View>
        )}

        {/* EMPTY STATE */}
        {!isLoading &&
          opportunities.length === 0 && (
            <View
              style={
                styles.emptyContainer
              }
            >
              <View
                style={styles.emptyIcon}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={30}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                No Opportunities Yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                You have not posted any
                opportunities yet. Create your
                first opportunity to start
                connecting with graduate talent.
              </Text>
            </View>
          )}

        {/* OPPORTUNITIES */}
        {!isLoading &&
          opportunities.map(
            (opportunity) => (
              <View
                style={[
                  styles.opportunityCard,
                  opportunity.status ===
                    'Closed' &&
                    styles.closedOpportunityCard,
                ]}
                key={opportunity.id}
              >

                {/* CARD TOP */}
                <View
                  style={styles.cardTop}
                >

                  <View
                    style={[
                      styles.jobIcon,
                      opportunity.status ===
                        'Closed' &&
                        styles.closedJobIcon,
                    ]}
                  >
                    <Ionicons
                      name="briefcase-outline"
                      size={21}
                      color={
                        opportunity.status ===
                        'Closed'
                          ? '#64748B'
                          : '#2563EB'
                      }
                    />
                  </View>

                  <View
                    style={styles.jobInfo}
                  >

                    <Text
                      style={[
                        styles.jobTitle,
                        opportunity.status ===
                          'Closed' &&
                          styles.closedJobTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {opportunity.title}
                    </Text>

                    <View
                      style={styles.typeRow}
                    >
                      <View
                        style={
                          styles.typeDot
                        }
                      />

                      <Text
                        style={
                          styles.jobType
                        }
                      >
                        {opportunity.type}
                      </Text>
                    </View>

                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      opportunity.status ===
                        'Active'
                        ? styles.activeBadge
                        : styles.closedBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        opportunity.status ===
                          'Active'
                          ? styles.activeDot
                          : styles.closedDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        opportunity.status ===
                          'Active'
                          ? styles.activeText
                          : styles.closedText,
                      ]}
                    >
                      {opportunity.status}
                    </Text>
                  </View>

                </View>

                {/* DETAILS */}
                <View
                  style={
                    styles.detailsContainer
                  }
                >

                  <DetailRow
                    icon="location-outline"
                    value={
                      opportunity.location
                    }
                  />

                  <DetailRow
                    icon="laptop-outline"
                    value={
                      opportunity.arrangement
                    }
                  />

                  <DetailRow
                    icon="calendar-outline"
                    value={`Deadline: ${opportunity.deadline}`}
                    last={
                      !opportunity.positions
                    }
                  />

                  {opportunity.positions && (
                    <DetailRow
                      icon="people-outline"
                      value={`Positions: ${opportunity.positions}`}
                      last
                    />
                  )}

                </View>

                {/* STATS */}
                <View
                  style={
                    styles.statsContainer
                  }
                >

                  <View
                    style={styles.statBlock}
                  >

                    <View
                      style={
                        styles.statIconBlue
                      }
                    >
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color="#2563EB"
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.smallStatValue
                        }
                      >
                        {
                          opportunity.applications
                        }
                      </Text>

                      <Text
                        style={
                          styles.smallStatLabel
                        }
                      >
                        Applications
                      </Text>
                    </View>

                  </View>

                  <View
                    style={
                      styles.statsDivider
                    }
                  />

                  <View
                    style={styles.statBlock}
                  >

                    <View
                      style={
                        styles.statIconGold
                      }
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color="#B88912"
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.smallStatValue
                        }
                      >
                        {
                          opportunity.shortlisted
                        }
                      </Text>

                      <Text
                        style={
                          styles.smallStatLabel
                        }
                      >
                        Shortlisted
                      </Text>
                    </View>

                  </View>

                </View>

                {/* ACTIONS */}
                <View
                  style={styles.actions}
                >

                  <Pressable
                    style={
                      styles.viewButton
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/business/applications',
                        params: {
                          opportunityId:
                            opportunity.id,
                          opportunityTitle:
                            opportunity.title,
                        },
                      })
                    }
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#2563EB"
                    />

                    <Text
                      style={
                        styles.viewButtonText
                      }
                    >
                      View Applications
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color="#2563EB"
                    />
                  </Pressable>

                  {opportunity.status ===
                    'Active' && (
                    <Pressable
                      style={
                        styles.closeButton
                      }
                      disabled={
                        isClosing ===
                        opportunity.id
                      }
                      onPress={() =>
                        handleCloseOpportunity(
                          opportunity.id
                        )
                      }
                    >
                      {isClosing ===
                      opportunity.id ? (
                        <ActivityIndicator
                          size="small"
                          color="#DC2626"
                        />
                      ) : (
                        <Ionicons
                          name="close-outline"
                          size={17}
                          color="#DC2626"
                        />
                      )}

                      <Text
                        style={
                          styles.closeButtonText
                        }
                      >
                        {isClosing ===
                        opportunity.id
                          ? 'Closing...'
                          : 'Close'}
                      </Text>
                    </Pressable>
                  )}

                </View>

              </View>
            )
          )}

        <View
          style={styles.bottomSpace}
        />

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/dashboard'
            )
          }
        >
          <View
            style={
              styles.navIconContainer
            }
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#64748B"
            />
          </View>

          <Text style={styles.navLabel}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/messages'
            )
          }
        >
          <View
            style={
              styles.navIconContainer
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color="#64748B"
            />
          </View>

          <Text style={styles.navLabel}>
            Messages
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              '/business/company-profile'
            )
          }
        >
          <View
            style={
              styles.navIconContainer
            }
          >
            <Text
              style={
                styles.profileNavIcon
              }
            >
              AT
            </Text>
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

function DetailRow({
  icon,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last &&
          styles.detailRowLast,
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color="#64748B"
      />

      <Text style={styles.detail}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 21,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerInfo: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#D4A72C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  headerAccent: {
    width: 44,
    height: 3,
    borderRadius: 5,
    backgroundColor: '#D4A72C',
    marginTop: 16,
  },

  /* SUMMARY */

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  summaryIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  summaryIconGold: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },

  summaryAccentBlue: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 42,
    height: 3,
    backgroundColor: '#2563EB',
  },

  summaryAccentGold: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 42,
    height: 3,
    backgroundColor: '#D4A72C',
  },

  /* POST */

  postButton: {
    marginHorizontal: 16,
    marginTop: 13,
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#2563EB',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  postIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  postTextContainer: {
    flex: 1,
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  postButtonSubtext: {
    color: '#DCE9FF',
    fontSize: 10,
    marginTop: 2,
  },

  /* SECTION */

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 23,
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionEyebrow: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  countText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    marginRight: 4,
  },

  countLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },

  /* LOADING */

  loadingContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    minHeight: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  /* EMPTY */

  emptyContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 26,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },

  /* OPPORTUNITY CARD */

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.045,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  closedOpportunityCard: {
    opacity: 0.88,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  jobIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  closedJobIcon: {
    backgroundColor: '#F1F5F9',
  },

  jobInfo: {
    flex: 1,
    paddingRight: 7,
  },

  jobTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  closedJobTitle: {
    color: '#475569',
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D4A72C',
    marginRight: 6,
  },

  jobType: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#ECFDF5',
  },

  closedBadge: {
    backgroundColor: '#F1F5F9',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeDot: {
    backgroundColor: '#10B981',
  },

  closedDot: {
    backgroundColor: '#94A3B8',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  activeText: {
    color: '#059669',
  },

  closedText: {
    color: '#64748B',
  },

  /* DETAILS */

  detailsContainer: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detail: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  /* STATS */

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  statBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  statIconBlue: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconGold: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },

  smallStatLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },

  statsDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },

  /* ACTIONS */

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  viewButton: {
    flex: 1,
    minHeight: 43,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  viewButtonText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },

  closeButton: {
    minHeight: 43,
    paddingHorizontal: 13,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  closeButtonText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 95,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingBottom: 4,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    elevation: 12,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },

  navIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileNavIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '900',
  },

  navLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});