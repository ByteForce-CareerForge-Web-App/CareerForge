
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type Application = {
  id: string;
  opportunityId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  appliedDate: string;
  status: string;
};

function formatApplicationStatus(status: unknown): string {
  const value = String(status || '').trim().toLowerCase();

  switch (value) {
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
      return 'Withdrawn';

    default:
      return 'Submitted';
  }
}

function formatOpportunityType(type: unknown): string {
  const value = String(type || '').trim();

  if (!value) {
    return 'Opportunity';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatApplicationDate(date: unknown): string {
  if (!date) {
    return 'Date not available';
  }

  const parsed = new Date(String(date));

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatSalary(salary: unknown): string {
  if (
    salary === null ||
    salary === undefined ||
    String(salary).trim() === ''
  ) {
    return 'Salary not specified';
  }

  return String(salary);
}

export default function MyApplications() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        await AsyncStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/applications.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const rawResponse =
        await response.text();

      let result: any;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Alumni applications non-JSON response:',
          rawResponse
        );

        throw new Error(
          `The server returned an invalid response. HTTP ${response.status}`
        );
      }

      console.log(
        'Alumni applications response:',
        result
      );

      if (response.status === 401) {
        await AsyncStorage.removeItem(
          'authToken'
        );

        await AsyncStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to load your applications.'
        );
      }

      const backendApplications =
        Array.isArray(result.data)
          ? result.data
          : [];

      const formattedApplications: Application[] =
        backendApplications.map(
          (application: any) => ({
            id: String(
              application.id ?? ''
            ),

            opportunityId: String(
              application.opportunity_id ?? ''
            ),

            title:
              application.title ||
              'Opportunity',

            company:
              application.company_name ||
              application.company ||
              'Company',

            location:
              application.location ||
              'Not specified',

            type:
              formatOpportunityType(
                application.type
              ),

            salary:
              formatSalary(
                application.salary
              ),

            appliedDate:
              formatApplicationDate(
                application.applied_at
              ),

            status:
              formatApplicationStatus(
                application.status
              ),
          })
        );

      setApplications(
        formattedApplications
      );
    } catch (error) {
      console.log(
        'Error loading alumni applications:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load your applications.'
      );

      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [loadApplications])
  );

  function getStatusStyle(status: string) {
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

      case 'Withdrawn':
        return styles.statusRejected;

      default:
        return styles.statusSubmitted;
    }
  }

  function getStatusTextStyle(status: string) {
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

      case 'Withdrawn':
        return styles.statusRejectedText;

      default:
        return styles.statusSubmittedText;
    }
  }

  function openOpportunity(
    application: Application
  ) {
    if (!application.opportunityId) {
      Alert.alert(
        'Opportunity Unavailable',
        'The opportunity ID for this application is unavailable.'
      );
      return;
    }

    router.push({
      pathname:
        '/alumni/opportunity-details',

      params: {
        id: application.opportunityId,

        title: application.title,

        company: application.company,

        location: application.location,

        type: application.type,

        salary: application.salary,

        match: 'Applied',

        description:
          'You have already applied for this opportunity.',

        skills: JSON.stringify([]),
      },
    });
  }

  function removeApplication(
    application: Application
  ) {
    Alert.alert(
      'Application History',
      'Applications are stored in CareerForge so that you can track their status. The current backend does not support permanently deleting an application from your history.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }

  function clearApplications() {
    if (applications.length === 0) {
      return;
    }

    Alert.alert(
      'Application History',
      'Your applications are stored in CareerForge so their progress can be tracked. The current backend does not support clearing application history.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }

  function renderApplication(
    application: Application
  ) {
    return (
      <View
        key={application.id}
        style={styles.card}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📄</Text>
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

        <View style={styles.detailsContainer}>
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

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#5B3FD1"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading your applications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    error &&
    error
      .toLowerCase()
      .includes('authentication')
  ) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.errorContainer
          }
        >
          <Text
            style={styles.errorIcon}
          >
            🔐
          </Text>

          <Text
            style={styles.errorTitle}
          >
            Session Expired
          </Text>

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace('/login')
            }
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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

          {applications.length > 0 && (
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

        {applications.length > 0 && (
          <TouchableOpacity
            onPress={clearApplications}
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
        {/* Backend Error */}
        {error !== '' && (
          <View
            style={styles.errorBanner}
          >
            <Text
              style={
                styles.errorBannerText
              }
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={
                loadApplications
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

          <View
            style={styles.statsRow}
          >
            <View
              style={styles.statItem}
            >
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

            <View
              style={styles.statItem}
            >
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

            <View
              style={styles.statItem}
            >
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

            <View
              style={styles.statItem}
            >
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
        {applications.length === 0 && (
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
              You haven't applied for any opportunities yet.
              Explore available opportunities and apply for
              positions that match your career goals.
            </Text>

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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B6B78',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },

  errorIcon: {
    fontSize: 42,
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 13,
    color: '#777784',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },

  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorBannerText: {
    color: '#991B1B',
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    color: '#5B3FD1',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
});

