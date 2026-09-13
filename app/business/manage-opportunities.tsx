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
import { API_BASE_URL } from '../../constants/api';

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


const formatOpportunityType = (
  type: string
) => {
  switch (type) {
    case 'internship':
      return 'Internship';

    case 'graduate_program':
      return 'Graduate Program';

    case 'job':
      return 'Graduate Job';

    case 'learnership':
      return 'Learnership';

    case 'volunteer':
      return 'Volunteer';

    case 'other':
      return 'Other';

    default:
      return type;
  }
};


const formatArrangement = (
  arrangement: string | null | undefined
) => {
  if (!arrangement) {
    return 'Not specified';
  }

  switch (arrangement) {
    case 'on-site':
      return 'On-site';

    case 'hybrid':
      return 'Hybrid';

    case 'remote':
      return 'Remote';

    default:
      return arrangement;
  }
};


const formatDeadline = (
  deadline: string | null | undefined
) => {
  if (!deadline) {
    return 'Not specified';
  }

  const date = new Date(
    `${deadline}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return date.toLocaleDateString(
    'en-ZA',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
};


const formatOpportunity = (
  opportunity: any
): Opportunity => {
  const skills = Array.isArray(
    opportunity.skills
  )
    ? opportunity.skills
        .map(
          (skill: any) =>
            skill?.name
        )
        .filter(Boolean)
        .join(', ')
    : '';

  return {
    id: String(opportunity.id),
    title:
      opportunity.title ?? '',
    type:
      formatOpportunityType(
        opportunity.type ?? ''
      ),
    description:
      opportunity.description ?? '',
    skills,
    location:
      opportunity.location ||
      'Not specified',
    arrangement:
      formatArrangement(
        opportunity.work_arrangement
      ),
    applications:
      Number(
        opportunity.applications ?? 0
      ),
    shortlisted:
      Number(
        opportunity.shortlisted ?? 0
      ),
    deadline:
      formatDeadline(
        opportunity.deadline
      ),
    positions:
      opportunity.positions !== null &&
      opportunity.positions !== undefined
        ? String(
            opportunity.positions
          )
        : '',
    qualification:
      opportunity.minimum_qualification ??
      '',
    status:
      opportunity.status === 'open'
        ? 'Active'
        : 'Closed',
    createdAt:
      opportunity.created_at ??
      '',
  };
};


export default function ManageOpportunitiesScreen() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);


  const loadOpportunities =
    useCallback(async () => {
      try {

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          router.replace('/login');
          return;
        }


        const response =
          await fetch(
            `${API_BASE_URL}/business/opportunities.php`,
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


        const result =
          await response.json();


        if (
          response.status === 401
        ) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          router.replace('/login');
          return;
        }


        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Unable to load opportunities.'
          );
        }


        const data =
          Array.isArray(result.data)
            ? result.data
            : [];


        const formatted =
          data.map(
            formatOpportunity
          );


        setOpportunities(
          formatted
        );

      } catch (error) {

        console.log(
          'Error loading business opportunities:',
          error
        );

        Alert.alert(
          'Unable to Load Opportunities',
          error instanceof Error
            ? error.message
            : 'Unable to load your opportunities.'
        );

        setOpportunities([]);
      }
    }, []);


  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [loadOpportunities])
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
                router.replace('/login');
                return;
              }


              const response =
                await fetch(
                  `${API_BASE_URL}/business/opportunities.php`,
                  {
                    method: 'PUT',
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                      'Content-Type':
                        'application/json',
                    },
                    body: JSON.stringify({
                      opportunity_id:
                        Number(id),
                      action: 'close',
                    }),
                  }
                );


              const result =
                await response.json();


              if (
                response.status === 401
              ) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                router.replace('/login');
                return;
              }


              if (
                !response.ok ||
                !result.success
              ) {
                throw new Error(
                  result.message ||
                    'Unable to close opportunity.'
                );
              }


              Alert.alert(
                'Opportunity Closed',
                'The opportunity has been closed successfully.'
              );


              await loadOpportunities();

            } catch (error) {

              console.log(
                'Error closing opportunity:',
                error
              );

              Alert.alert(
                'Unable to Close Opportunity',
                error instanceof Error
                  ? error.message
                  : 'Unable to close the opportunity.'
              );
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
      (total, opportunity) =>
        total +
        opportunity.applications,
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
