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
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const OPPORTUNITIES_KEY =
  'careerforge_business_opportunities';

const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type Opportunity = {
  id: string;
  title: string;
  type: string;
  description?: string;
  skills?: string;
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

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

const defaultOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Graduate Data Analyst',
    type: 'Graduate Job',
    location: 'Durban, KwaZulu-Natal',
    arrangement: 'Hybrid',
    applications: 94,
    shortlisted: 8,
    deadline: '30 September 2026',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Junior Frontend Developer',
    type: 'Internship',
    location: 'Johannesburg, Gauteng',
    arrangement: 'Remote',
    applications: 67,
    shortlisted: 5,
    deadline: '15 October 2026',
    status: 'Active',
  },
  {
    id: '3',
    title: 'Software Development Intern',
    type: 'Internship',
    location: 'Cape Town, Western Cape',
    arrangement: 'On-site',
    applications: 68,
    shortlisted: 5,
    deadline: '10 September 2026',
    status: 'Active',
  },
  {
    id: '4',
    title: 'IT Support Graduate',
    type: 'Graduate Job',
    location: 'Durban, KwaZulu-Natal',
    arrangement: 'On-site',
    applications: 42,
    shortlisted: 0,
    deadline: '20 August 2026',
    status: 'Closed',
  },
];

export default function ManageOpportunitiesScreen() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [])
  );

  const loadOpportunities = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(
          OPPORTUNITIES_KEY
        );

      const savedStatuses =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      const applicationStatuses: Record<
        string,
        ApplicationStatus
      > = savedStatuses
        ? JSON.parse(savedStatuses)
        : {};

      const savedOpportunities: Opportunity[] =
        saved ? JSON.parse(saved) : [];

      const savedMap = new Map(
        savedOpportunities.map(
          (opportunity) => [
            opportunity.id,
            opportunity,
          ]
        )
      );

      const mergedOpportunities: Opportunity[] = [
        ...defaultOpportunities.map(
          (opportunity) => {
            const savedVersion =
              savedMap.get(
                opportunity.id
              );

            return savedVersion
              ? {
                  ...opportunity,
                  ...savedVersion,
                }
              : opportunity;
          }
        ),

        ...savedOpportunities.filter(
          (opportunity) =>
            !defaultOpportunities.some(
              (defaultOpportunity) =>
                defaultOpportunity.id ===
                opportunity.id
            )
        ),
      ];

      setOpportunities(
        mergedOpportunities
      );
    } catch (error) {
      console.log(
        'Error loading opportunities:',
        error
      );

      setOpportunities(
        defaultOpportunities
      );
    }
  };

  const saveOpportunities = async (
    updated: Opportunity[]
  ) => {
    try {
      await AsyncStorage.setItem(
        OPPORTUNITIES_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log(
        'Error saving opportunities:',
        error
      );
    }
  };

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
            const updated: Opportunity[] =
              opportunities.map(
                (opportunity): Opportunity =>
                  opportunity.id === id
                    ? {
                        ...opportunity,
                        status: 'Closed',
                      }
                    : opportunity
              );

            setOpportunities(updated);

            await saveOpportunities(
              updated
            );
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
      (total, opportunity) =>
        total + opportunity.applications,
      0
    );

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.headerTop}>

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
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.headerInfo}>
              <Text style={styles.headerEyebrow}>
                RECRUITMENT
              </Text>

              <Text style={styles.headerTitle}>
                Manage Opportunities
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage your posted graduate
                opportunities.
              </Text>
            </View>

          </View>

          <View style={styles.headerAccent} />

        </View>

        {/* SUMMARY */}
        <View style={styles.summaryRow}>

          <View style={styles.summaryCard}>

            <View style={styles.summaryIconBlue}>
              <Ionicons
                name="briefcase-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <Text style={styles.summaryValue}>
              {activeCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Active Opportunities
            </Text>

            <View style={styles.summaryAccentBlue} />

          </View>

          <View style={styles.summaryCard}>

            <View style={styles.summaryIconGold}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#B88912"
              />
            </View>

            <Text style={styles.summaryValue}>
              {totalApplications}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Applications
            </Text>

            <View style={styles.summaryAccentGold} />

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

          <View style={styles.postTextContainer}>
            <Text style={styles.postButtonText}>
              Post New Opportunity
            </Text>

            <Text style={styles.postButtonSubtext}>
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
        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionEyebrow}>
              POSTED ROLES
            </Text>

            <Text style={styles.sectionTitle}>
              Your Opportunities
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {opportunities.length}
            </Text>

            <Text style={styles.countLabel}>
              total
            </Text>
          </View>

        </View>

        {/* OPPORTUNITIES */}
        {opportunities.map(
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
              <View style={styles.cardTop}>

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

                <View style={styles.jobInfo}>

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

                  <View style={styles.typeRow}>
                    <View style={styles.typeDot} />

                    <Text style={styles.jobType}>
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
              <View style={styles.detailsContainer}>

                <DetailRow
                  icon="location-outline"
                  value={opportunity.location}
                />

                <DetailRow
                  icon="laptop-outline"
                  value={opportunity.arrangement}
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
              <View style={styles.statsContainer}>

                <View style={styles.statBlock}>

                  <View style={styles.statIconBlue}>
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color="#2563EB"
                    />
                  </View>

                  <View>
                    <Text
                      style={styles.smallStatValue}
                    >
                      {opportunity.applications}
                    </Text>

                    <Text
                      style={styles.smallStatLabel}
                    >
                      Applications
                    </Text>
                  </View>

                </View>

                <View style={styles.statsDivider} />

                <View style={styles.statBlock}>

                  <View style={styles.statIconGold}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#B88912"
                    />
                  </View>

                  <View>
                    <Text
                      style={styles.smallStatValue}
                    >
                      {opportunity.shortlisted}
                    </Text>

                    <Text
                      style={styles.smallStatLabel}
                    >
                      Shortlisted
                    </Text>
                  </View>

                </View>

              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>

                <Pressable
                  style={styles.viewButton}
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
                    onPress={() =>
                      handleCloseOpportunity(
                        opportunity.id
                      )
                    }
                  >
                    <Ionicons
                      name="close-outline"
                      size={17}
                      color="#DC2626"
                    />

                    <Text
                      style={
                        styles.closeButtonText
                      }
                    >
                      Close
                    </Text>
                  </Pressable>
                )}

              </View>

            </View>
          )
        )}

        <View style={styles.bottomSpace} />

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
          <View style={styles.navIconContainer}>
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
          <View style={styles.navIconContainer}>
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
          <View style={styles.navIconContainer}>
            <Text style={styles.profileNavIcon}>
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
        last && styles.detailRowLast,
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