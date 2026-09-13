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
  Alert,
} from 'react-native';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type Application = {
  id: string;
  opportunityId: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  appliedDate: string;
  status: string;
  description: string;
  deadline: string;
};

export default function MyApplications() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FORMAT STATUS
  |--------------------------------------------------------------------------
  */

  function formatStatus(status: string) {
    const normalized =
      status
        ?.toLowerCase()
        .replace(/_/g, ' ')
        .trim();

    switch (normalized) {
      case 'submitted':
        return 'Submitted';

      case 'reviewing':
      case 'under review':
        return 'Under Review';

      case 'shortlisted':
        return 'Shortlisted';

      case 'interview':
        return 'Interview';

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      case 'withdrawn':
        return 'Rejected';

      default:
        return 'Submitted';
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  function formatDate(dateValue: string) {
    if (!dateValue) {
      return 'Not specified';
    }

    const date = new Date(
      dateValue
    );

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      'en-ZA',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD APPLICATIONS
  |--------------------------------------------------------------------------
  */

  const loadApplications =
    useCallback(async () => {
      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          router.replace('/login');

          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/alumni/applications.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
          }
        );

        const rawResponse =
          await response.text();

        let result: any;

        try {
          result = JSON.parse(
            rawResponse
          );
        } catch {
          console.log(
            'Alumni applications non-JSON response:',
            rawResponse
          );

          Alert.alert(
            'Applications Error',
            `The server returned an unexpected response. HTTP ${response.status}`
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATION ERROR
        |--------------------------------------------------------------------------
        */

        if (response.status === 401) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          Alert.alert(
            'Session Expired',
            'Please log in again.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace(
                    '/login'
                  ),
              },
            ]
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | SERVER ERROR
        |--------------------------------------------------------------------------
        */

        if (
          !response.ok ||
          !result.success
        ) {
          Alert.alert(
            'Applications Error',
            result.message ||
              'Could not load your applications.'
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | MAP BACKEND APPLICATIONS
        |--------------------------------------------------------------------------
        */

        const backendApplications =
          Array.isArray(result.data)
            ? result.data
            : [];

        const mappedApplications: Application[] =
          backendApplications.map(
            (application: any) => ({
              id: String(
                application.id
              ),

              opportunityId: Number(
                application.opportunity_id
              ),

              title:
                application.title ||
                'Opportunity',

              company:
                application.company_name ||
                'Company',

              location:
                application.location ||
                'Location',

              type:
                application.type ||
                'Opportunity',

              salary:
                application.salary ||
                'Not specified',

              appliedDate:
                formatDate(
                  application.applied_at
                ),

              status:
                formatStatus(
                  application.status
                ),

              description:
                application.description ||
                'Explore this opportunity and discover whether it is a good match for your career goals.',

              deadline:
                application.deadline ||
                'Not specified',
            })
          );

        setApplications(
          mappedApplications
        );
      } catch (error) {
        console.log(
          'Error loading alumni applications:',
          error
        );

        Alert.alert(
          'Applications Error',
          'Could not connect to the server. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | REFRESH WHEN SCREEN OPENS
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [loadApplications])
  );

  /*
  |--------------------------------------------------------------------------
  | STATUS STYLES
  |--------------------------------------------------------------------------
  */

  function getStatusStyle(
    status: string
  ) {
    switch (status) {
      case 'Submitted':
        return styles.statusSubmitted;

      case 'Under Review':
        return styles.statusReview;

      case 'Shortlisted':
        return styles.statusShortlisted;

      case 'Interview':
        return styles.statusInterview;

      case 'Accepted':
        return styles.statusAccepted;

      case 'Rejected':
        return styles.statusRejected;

      default:
        return styles.statusSubmitted;
    }
  }

  function getStatusTextStyle(
    status: string
  ) {
    switch (status) {
      case 'Submitted':
        return styles.statusSubmittedText;

      case 'Under Review':
        return styles.statusReviewText;

      case 'Shortlisted':
        return styles.statusShortlistedText;

      case 'Interview':
        return styles.statusInterviewText;

      case 'Accepted':
        return styles.statusAcceptedText;

      case 'Rejected':
        return styles.statusRejectedText;

      default:
        return styles.statusSubmittedText;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN OPPORTUNITY
  |--------------------------------------------------------------------------
  */

  function openOpportunity(
    application: Application
  ) {
    router.push({
      pathname:
        '/alumni/opportunity-details',

      params: {
        id: String(
          application.opportunityId
        ),

        title:
          application.title,

        company:
          application.company,

        location:
          application.location,

        type:
          application.type,

        salary:
          application.salary,

        match: 'Applied',

        description:
          application.description,

        skills: JSON.stringify([]),

        deadline:
          application.deadline,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE APPLICATION
  |--------------------------------------------------------------------------
  */

  function removeApplication(
    application: Application
  ) {
    Alert.alert(
      'Remove Application',
      `Remove "${application.title}" from your application history?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Remove',
          style: 'destructive',

          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              const response =
                await fetch(
                  `${API_BASE_URL}/alumni/applications.php`,
                  {
                    method: 'DELETE',

                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type':
                        'application/json',
                    },

                    body: JSON.stringify({
                      application_id:
                        Number(
                          application.id
                        ),
                    }),
                  }
                );

              const rawResponse =
                await response.text();

              let result: any;

              try {
                result = JSON.parse(
                  rawResponse
                );
              } catch {
                Alert.alert(
                  'Remove Failed',
                  `The server returned an unexpected response. HTTP ${response.status}`
                );

                return;
              }

              if (
                response.status ===
                401
              ) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                Alert.alert(
                  'Session Expired',
                  'Please log in again.',
                  [
                    {
                      text: 'OK',
                      onPress: () =>
                        router.replace(
                          '/login'
                        ),
                    },
                  ]
                );

                return;
              }

              if (
                !response.ok ||
                !result.success
              ) {
                Alert.alert(
                  'Remove Failed',
                  result.message ||
                    'The application could not be removed.'
                );

                return;
              }

              /*
              |--------------------------------------------------------------------------
              | UPDATE SCREEN AFTER SUCCESS
              |--------------------------------------------------------------------------
              */

              setApplications(
                (current) =>
                  current.filter(
                    (item) =>
                      item.id !==
                      application.id
                  )
              );
            } catch (error) {
              console.log(
                'Error removing alumni application:',
                error
              );

              Alert.alert(
                'Remove Failed',
                'Could not connect to the server. Please try again.'
              );
            }
          },
        },
      ]
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAR ALL APPLICATIONS
  |--------------------------------------------------------------------------
  */

  function clearApplications() {
    if (
      applications.length === 0
    ) {
      return;
    }

    Alert.alert(
      'Clear Applications',
      'Are you sure you want to remove all applications from your history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Clear All',
          style: 'destructive',

          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem(
                  'authToken'
                );

              if (!token) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                router.replace(
                  '/login'
                );

                return;
              }

              const response =
                await fetch(
                  `${API_BASE_URL}/alumni/applications.php`,
                  {
                    method: 'DELETE',

                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type':
                        'application/json',
                    },

                    body: JSON.stringify({
                      clear_all: true,
                    }),
                  }
                );

              const rawResponse =
                await response.text();

              let result: any;

              try {
                result = JSON.parse(
                  rawResponse
                );
              } catch {
                Alert.alert(
                  'Clear Failed',
                  `The server returned an unexpected response. HTTP ${response.status}`
                );

                return;
              }

              if (
                response.status ===
                401
              ) {
                await AsyncStorage.removeItem(
                  'authToken'
                );

                await AsyncStorage.removeItem(
                  'user'
                );

                Alert.alert(
                  'Session Expired',
                  'Please log in again.',
                  [
                    {
                      text: 'OK',
                      onPress: () =>
                        router.replace(
                          '/login'
                        ),
                    },
                  ]
                );

                return;
              }

              if (
                !response.ok ||
                !result.success
              ) {
                Alert.alert(
                  'Clear Failed',
                  result.message ||
                    'Your applications could not be cleared.'
                );

                return;
              }

              setApplications([]);
            } catch (error) {
              console.log(
                'Error clearing alumni applications:',
                error
              );

              Alert.alert(
                'Clear Failed',
                'Could not connect to the server. Please try again.'
              );
            }
          },
        },
      ]
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER APPLICATION
  |--------------------------------------------------------------------------
  */

  function renderApplication(
    application: Application
  ) {
    return (
      <View
        key={application.id}
        style={styles.card}
      >
        <View style={styles.cardTopRow}>
          <View
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>
              📄
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(
                application.status
              ),
            ]}
          >
            <Text
              style={[
                styles.statusText,
                getStatusTextStyle(
                  application.status
                ),
              ]}
            >
              {application.status}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          {application.title}
        </Text>

        <Text style={styles.company}>
          {application.company}
        </Text>

        <View
          style={
            styles.detailsContainer
          }
        >
          <Text style={styles.detail}>
            📍 {application.location}
          </Text>

          <Text style={styles.detail}>
            💼 {application.type}
          </Text>
        </View>

        <Text style={styles.salary}>
          {application.salary}
        </Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>
            Applied
          </Text>

          <Text style={styles.date}>
            {application.appliedDate}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              openOpportunity(
                application
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.viewButtonText
              }
            >
              View Opportunity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              removeApplication(
                application
              )
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.removeButtonText
              }
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | APPLICATION COUNTS
  |--------------------------------------------------------------------------
  */

  const submittedCount =
    applications.filter(
      (application) =>
        application.status ===
        'Submitted'
    ).length;

  const reviewCount =
    applications.filter(
      (application) =>
        application.status ===
        'Under Review'
    ).length;

  const shortlistedCount =
    applications.filter(
      (application) =>
        application.status ===
          'Shortlisted' ||
        application.status ===
          'Interview'
    ).length;

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTitleContainer
          }
        >
          <Text
            style={styles.headerTitle}
          >
            My Applications
          </Text>

          {applications.length >
            0 && (
            <View
              style={styles.countBadge}
            >
              <Text
                style={styles.countText}
              >
                {applications.length}
              </Text>
            </View>
          )}
        </View>

        {applications.length >
          0 && (
          <TouchableOpacity
            onPress={
              clearApplications
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.clearText}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Summary */}

        <View
          style={styles.summaryCard}
        >
          <Text
            style={styles.summaryTitle}
          >
            Application Overview
          </Text>

          <Text
            style={styles.summaryText}
          >
            Keep track of the opportunities you've applied
            for and monitor your application progress.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={styles.statNumber}
              >
                {applications.length}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Total
              </Text>
            </View>

            <View
              style={styles.statDivider}
            />

            <View style={styles.statItem}>
              <Text
                style={styles.statNumber}
              >
                {submittedCount}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Submitted
              </Text>
            </View>

            <View
              style={styles.statDivider}
            />

            <View style={styles.statItem}>
              <Text
                style={styles.statNumber}
              >
                {reviewCount}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Reviewing
              </Text>
            </View>

            <View
              style={styles.statDivider}
            />

            <View style={styles.statItem}>
              <Text
                style={styles.statNumber}
              >
                {shortlistedCount}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Progress
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State */}

        {applications.length ===
          0 && (
          <View
            style={styles.emptyState}
          >
            <View
              style={
                styles.emptyIconContainer
              }
            >
              <Text
                style={styles.emptyIcon}
              >
                📄
              </Text>
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No Applications Yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              {loading
                ? 'Loading your applications...'
                : "You haven't applied for any opportunities yet. Explore available opportunities and apply for positions that match your career goals."}
            </Text>

            {!loading && (
              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={() =>
                  router.push(
                    '/alumni/opportunities'
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Explore Opportunities
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Applications */}

        {applications.length > 0 && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Your Applications
            </Text>

            {applications.map(
              renderApplication
            )}
          </>
        )}

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EF',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#5B3FD1',
    marginTop: -5,
  },

  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#202124',
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#5B3FD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  clearText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  summaryCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4C1D95',
    marginBottom: 6,
  },

  summaryText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6D28D9',
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B3FD1',
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 10,
    color: '#6B28D9',
    fontWeight: '600',
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#DDD6FE',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEF4',
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 23,
  },

  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  statusSubmitted: {
    backgroundColor: '#EDE9FE',
  },

  statusSubmittedText: {
    color: '#5B3FD1',
  },

  statusReview: {
    backgroundColor: '#FEF3C7',
  },

  statusReviewText: {
    color: '#B45309',
  },

  statusShortlisted: {
    backgroundColor: '#DCFCE7',
  },

  statusShortlistedText: {
    color: '#15803D',
  },

  statusInterview: {
    backgroundColor: '#DBEAFE',
  },

  statusInterviewText: {
    color: '#1D4ED8',
  },

  statusAccepted: {
    backgroundColor: '#DCFCE7',
  },

  statusAcceptedText: {
    color: '#15803D',
  },

  statusRejected: {
    backgroundColor: '#FEE2E2',
  },

  statusRejectedText: {
    color: '#B91C1C',
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  company: {
    fontSize: 14,
    color: '#5B3FD1',
    fontWeight: '600',
    marginBottom: 10,
  },

  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },

  detail: {
    fontSize: 12,
    color: '#6B6B78',
  },

  salary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 12,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  dateLabel: {
    fontSize: 11,
    color: '#888895',
    marginRight: 6,
  },

  date: {
    fontSize: 11,
    color: '#555563',
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#5B3FD1',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  removeButton: {
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginTop: 2,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    color: '#777784',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#5B3FD1',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});

