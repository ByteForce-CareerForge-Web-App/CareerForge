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
  useLocalSearchParams,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../constants/api';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type Candidate = {
  applicationId: string;
  name: string;
  email: string;
  qualification: string;
  opportunity: string;
  applied: string;
  status: ApplicationStatus;
  education: string;
  institution: string;
  graduation: string;
  skills: string[];
  experienceTitle: string;
  experienceDuration: string;
  experienceDescription: string;
  aiMatch: string;
};

export default function CandidateProfileScreen() {
  const params = useLocalSearchParams<{
    applicationId?: string;
    application_id?: string;
    name?: string;
    opportunity?: string;
  }>();

  const applicationId =
    typeof params.applicationId === 'string'
      ? params.applicationId
      : typeof params.application_id === 'string'
      ? params.application_id
      : '';

  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [status, setStatus] =
    useState<ApplicationStatus>('Under Review');

  const [loading, setLoading] =
    useState(true);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const loadCandidate = useCallback(
    async () => {
      if (!applicationId) {
        setLoading(false);

        Alert.alert(
          'Candidate Profile',
          'No application was selected.'
        );

        return;
      }

      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem('authToken');

        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/business/candidate-profile.php?application_id=${encodeURIComponent(
            applicationId
          )}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result =
          await response.json();

        console.log(
          'Candidate Profile API response:',
          result
        );

        if (response.status === 401) {
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
              'Unable to load candidate profile.'
          );
        }

        const data = result.data;

        const qualification =
          data.qualification ||
          'Not provided';

        const institution =
          data.campus ||
          'Richfield Graduate Institute of Technology';

        const graduationYear =
          data.graduation_year;

        const graduation =
          graduationYear
            ? `Expected Graduation: ${graduationYear}`
            : 'Graduation information not provided';

        const experienceTitle =
          data.current_position ||
          'No current position provided';

        const experienceDuration =
          data.current_company
            ? `Currently at ${data.current_company}`
            : 'Experience information not provided';

        const experienceDescription =
          data.bio ||
          'No additional experience description has been provided by the candidate.';

        const mappedCandidate: Candidate = {
          applicationId: String(
            data.application_id
          ),

          name:
            data.name ||
            params.name ||
            'Candidate',

          email:
            data.email ||
            'Email not provided',

          qualification,

          opportunity:
            data.opportunity ||
            params.opportunity ||
            'Opportunity',

          applied:
            data.applied ||
            'Not available',

          status:
            data.status ||
            'Under Review',

          education:
            qualification,

          institution,

          graduation,

          skills:
            Array.isArray(data.skills)
              ? data.skills
              : [],

          experienceTitle,

          experienceDuration,

          experienceDescription,

          aiMatch:
            `${Number(
              data.ai_match ?? 0
            )}%`,
        };

        setCandidate(
          mappedCandidate
        );

        setStatus(
          mappedCandidate.status
        );

      } catch (error) {
        console.log(
          'Error loading candidate profile:',
          error
        );

        Alert.alert(
          'Unable to Load Candidate',
          error instanceof Error
            ? error.message
            : 'Unable to load candidate profile.'
        );

      } finally {
        setLoading(false);
      }
    },
    [
      applicationId,
      params.name,
      params.opportunity,
    ]
  );

  useFocusEffect(
    useCallback(() => {
      loadCandidate();
    }, [loadCandidate])
  );

  const updateApplicationStatus =
    async (
      newStatus:
        | 'reviewing'
        | 'shortlisted'
        | 'interview'
        | 'rejected'
    ) => {
      if (
        !candidate ||
        updatingStatus
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/business/applications.php`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              application_id:
                candidate.applicationId,
              status: newStatus,
            }),
          }
        );

        const result =
          await response.json();

        console.log(
          'Update candidate status response:',
          result
        );

        if (response.status === 401) {
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
              'Unable to update candidate status.'
          );
        }

        const statusMap:
          Record<
            string,
            ApplicationStatus
          > = {
            reviewing: 'Under Review',
            shortlisted: 'Shortlisted',
            interview: 'Interview',
            rejected: 'Rejected',
          };

        setStatus(
          statusMap[newStatus]
        );

        setCandidate(
          (current) =>
            current
              ? {
                  ...current,
                  status:
                    statusMap[newStatus],
                }
              : current
        );

      } catch (error) {
        console.log(
          'Error updating candidate status:',
          error
        );

        Alert.alert(
          'Update Failed',
          error instanceof Error
            ? error.message
            : 'Unable to update candidate status.'
        );

      } finally {
        setUpdatingStatus(false);
      }
    };

  const handleShortlist = () => {
    if (!candidate) {
      return;
    }

    Alert.alert(
      'Shortlist Candidate',
      `Are you sure you want to shortlist ${candidate.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Shortlist',
          onPress: async () => {
            await updateApplicationStatus(
              'shortlisted'
            );

            Alert.alert(
              'Candidate Shortlisted',
              `${candidate.name} has been shortlisted successfully.`
            );
          },
        },
      ]
    );
  };

  const handleInterview = () => {
    if (!candidate) {
      return;
    }

    Alert.alert(
      'Move to Interview',
      `Move ${candidate.name} to the interview stage?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: async () => {
            await updateApplicationStatus(
              'interview'
            );

            Alert.alert(
              'Interview Stage',
              `${candidate.name} has been moved to the interview stage.`
            );
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!candidate) {
      return;
    }

    Alert.alert(
      'Reject Candidate',
      `Are you sure you want to reject ${candidate.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateApplicationStatus(
              'rejected'
            );

            Alert.alert(
              'Candidate Rejected',
              `${candidate.name} has been rejected.`
            );
          },
        },
      ]
    );
  };

  const handleReconsider = () => {
    if (!candidate) {
      return;
    }

    Alert.alert(
      'Reconsider Candidate',
      `Move ${candidate.name} back to Under Review?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reconsider',
          onPress: async () => {
            await updateApplicationStatus(
              'reviewing'
            );

            Alert.alert(
              'Candidate Reconsidered',
              `${candidate.name} is now under review again.`
            );
          },
        },
      ]
    );
  };

  const getStatusColors = () => {
    switch (status) {
      case 'Shortlisted':
        return {
          backgroundColor: '#DCFCE7',
          color: '#166534',
        };

      case 'Interview':
        return {
          backgroundColor: '#DBEAFE',
          color: '#1D4ED8',
        };

      case 'Rejected':
        return {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
        };

      default:
        return {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
        };
    }
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={styles.loadingText}
        >
          Loading candidate profile...
        </Text>
      </View>
    );
  }

  if (!candidate) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={styles.errorTitle}
        >
          Candidate Profile
        </Text>

        <Text
          style={styles.errorText}
        >
          Unable to load this candidate.
        </Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text
            style={styles.errorButtonText}
          >
            ← Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const statusColors =
    getStatusColors();

  const matchPercentage =
    Math.min(
      100,
      Math.max(
        0,
        parseFloat(candidate.aiMatch)
      )
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                '/business/applications'
              );
            }
          }}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Candidate Profile
        </Text>

        <View
          style={{ width: 60 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Candidate Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              {candidate.name
                .split(' ')
                .map(
                  (name) => name[0]
                )
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {candidate.name}
          </Text>

          <Text style={styles.email}>
            {candidate.email}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusColors.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusColors.color,
                },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* Applied Position */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Applied Position
          </Text>

          <View style={styles.infoCard}>
            <Text
              style={styles.infoLabel}
            >
              Opportunity
            </Text>

            <Text
              style={styles.infoValue}
            >
              {candidate.opportunity}
            </Text>

            <View
              style={styles.divider}
            />

            <Text
              style={styles.infoLabel}
            >
              Application Status
            </Text>

            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    statusColors.color,
                },
              ]}
            >
              {status}
            </Text>

            <View
              style={styles.divider}
            />

            <Text
              style={styles.infoLabel}
            >
              Applied
            </Text>

            <Text
              style={styles.infoValue}
            >
              {candidate.applied}
            </Text>
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Education
          </Text>

          <View style={styles.infoCard}>
            <Text
              style={styles.infoValue}
            >
              {candidate.education}
            </Text>

            <Text
              style={styles.secondaryText}
            >
              {candidate.institution}
            </Text>

            <Text
              style={styles.secondaryText}
            >
              {candidate.graduation}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Skills
          </Text>

          <View
            style={styles.skillsContainer}
          >
            {candidate.skills.length >
            0 ? (
              candidate.skills.map(
                (skill) => (
                  <View
                    key={skill}
                    style={styles.skill}
                  >
                    <Text
                      style={
                        styles.skillText
                      }
                    >
                      {skill}
                    </Text>
                  </View>
                )
              )
            ) : (
              <Text
                style={styles.secondaryText}
              >
                No skills added yet.
              </Text>
            )}
          </View>
        </View>

        {/* AI Match */}
        <View style={styles.aiCard}>
          <Text
            style={styles.aiTitle}
          >
            🤖 AI Candidate Match
          </Text>

          <Text
            style={styles.aiScore}
          >
            {candidate.aiMatch}
          </Text>

          <View
            style={
              styles.matchBarBackground
            }
          >
            <View
              style={[
                styles.matchBar,
                {
                  width: `${matchPercentage}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.aiDescription
            }
          >
            This candidate is a strong match
            for the opportunity based on
            their skills, qualification and
            career profile.
          </Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Experience
          </Text>

          <View style={styles.infoCard}>
            <Text
              style={styles.infoValue}
            >
              {candidate.experienceTitle}
            </Text>

            <Text
              style={styles.secondaryText}
            >
              {candidate.experienceDuration}
            </Text>

            <Text
              style={styles.description}
            >
              {
                candidate.experienceDescription
              }
            </Text>
          </View>
        </View>

        {/* Recruitment Actions */}
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Recruitment Actions
          </Text>

          {status ===
            'Under Review' && (
            <>
              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={
                  handleShortlist
                }
                disabled={
                  updatingStatus
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  ✓ Shortlist Candidate
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.rejectButton
                }
                onPress={
                  handleReject
                }
                disabled={
                  updatingStatus
                }
              >
                <Text
                  style={
                    styles.rejectButtonText
                  }
                >
                  Reject Candidate
                </Text>
              </Pressable>
            </>
          )}

          {status ===
            'Shortlisted' && (
            <>
              <Pressable
                style={
                  styles.interviewButton
                }
                onPress={
                  handleInterview
                }
                disabled={
                  updatingStatus
                }
              >
                <Text
                  style={
                    styles.interviewButtonText
                  }
                >
                  📅 Move to Interview
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.rejectButton
                }
                onPress={
                  handleReject
                }
                disabled={
                  updatingStatus
                }
              >
                <Text
                  style={
                    styles.rejectButtonText
                  }
                >
                  Reject Candidate
                </Text>
              </Pressable>
            </>
          )}

          {status ===
            'Interview' && (
            <Pressable
              style={
                styles.rejectButton
              }
              onPress={
                handleReject
              }
              disabled={
                updatingStatus
              }
            >
              <Text
                style={
                  styles.rejectButtonText
                }
              >
                Reject Candidate
              </Text>
            </Pressable>
          )}

          {status ===
            'Rejected' && (
            <Pressable
              style={styles.reviewButton}
              onPress={
                handleReconsider
              }
              disabled={
                updatingStatus
              }
            >
              <Text
                style={styles.reviewText}
              >
                ↻ Reconsider Candidate
              </Text>
            </Pressable>
          )}
        </View>
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

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  name: {
    fontSize: 23,
    fontWeight: '700',
    color: '#0F172A',
  },

  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  statusValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },

  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  aiCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3730A3',
  },

  aiScore: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 8,
  },

  matchBarBackground: {
    height: 7,
    backgroundColor: '#C7D2FE',
    borderRadius: 10,
    marginTop: 5,
    overflow: 'hidden',
  },

  matchBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  aiDescription: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 19,
    marginTop: 10,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  interviewButton: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  interviewButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },

  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },

  reviewButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  reviewText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  errorButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});