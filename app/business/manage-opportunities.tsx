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
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const updatedOpportunities =
      mergedOpportunities;

    setOpportunities(
      updatedOpportunities
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
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
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Manage Opportunities
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your posted graduate
            opportunities.
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>
            💼
          </Text>

          <Text style={styles.summaryValue}>
            {activeCount}
          </Text>

          <Text style={styles.summaryLabel}>
            Active Opportunities
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>
            📋
          </Text>

          <Text style={styles.summaryValue}>
            {totalApplications}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Applications
          </Text>
        </View>
      </View>

      {/* Post New Opportunity */}
      <Pressable
        style={styles.postButton}
        onPress={() =>
          router.push(
            '/business/post-opportunity'
          )
        }
      >
        <Text style={styles.postButtonIcon}>
          ＋
        </Text>

        <Text style={styles.postButtonText}>
          Post New Opportunity
        </Text>
      </Pressable>

      {/* Opportunities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Your Opportunities
        </Text>

        <Text style={styles.countText}>
          {opportunities.length} total
        </Text>
      </View>

      {opportunities.map(
        (opportunity) => (
          <View
            style={
              styles.opportunityCard
            }
            key={opportunity.id}
          >
            {/* Card Header */}
            <View style={styles.cardTop}>
              <View style={styles.jobIcon}>
                <Text
                  style={
                    styles.jobIconText
                  }
                >
                  💼
                </Text>
              </View>

              <View
                style={styles.jobInfo}
              >
                <Text
                  style={styles.jobTitle}
                >
                  {opportunity.title}
                </Text>

                <Text
                  style={styles.jobType}
                >
                  {opportunity.type}
                </Text>
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

            {/* Details */}
            <View
              style={
                styles.detailsContainer
              }
            >
              <Text style={styles.detail}>
                📍 {opportunity.location}
              </Text>

              <Text style={styles.detail}>
                🏠 {opportunity.arrangement}
              </Text>

              <Text style={styles.detail}>
                📅 Deadline:{' '}
                {opportunity.deadline}
              </Text>

              {opportunity.positions && (
                <Text
                  style={styles.detail}
                >
                  👥 Positions:{' '}
                  {opportunity.positions}
                </Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View
                style={styles.smallStat}
              >
                <Text
                  style={
                    styles.smallStatValue
                  }
                >
                  {opportunity.applications}
                </Text>

                <Text
                  style={
                    styles.smallStatLabel
                  }
                >
                  Applications
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.smallStat}
              >
                <Text
                  style={
                    styles.smallStatValue
                  }
                >
                  {opportunity.shortlisted}
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

            {/* Actions */}
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
                <Text
                  style={
                    styles.viewButtonText
                  }
                >
                  View Applications
                </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 18,
  },

  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
  },

  summaryIcon: {
    fontSize: 20,
    marginBottom: 7,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },

  postButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  postButtonIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    marginRight: 7,
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  countText: {
    color: '#64748B',
    fontSize: 12,
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jobIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  jobIconText: {
    fontSize: 21,
  },

  jobInfo: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  jobType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  activeBadge: {
    backgroundColor: '#ECFDF5',
  },

  closedBadge: {
    backgroundColor: '#F1F5F9',
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  activeText: {
    color: '#059669',
  },

  closedText: {
    color: '#64748B',
  },

  detailsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  detail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 7,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },

  smallStat: {
    flex: 1,
    alignItems: 'center',
  },

  smallStatValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  smallStatLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
  },

  closeButton: {
    paddingHorizontal: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 11,
    justifyContent: 'center',
  },

  closeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },

  bottomSpace: {
    height: 20,
  },
});