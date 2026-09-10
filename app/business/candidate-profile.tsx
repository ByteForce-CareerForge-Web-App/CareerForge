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
import AsyncStorage from '@react-native-async-storage/async-storage';

const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type CandidateData = {
  id: string;
  name: string;
  qualification: string;
  applied: string;
  email: string;
  education: string;
  institution: string;
  graduation: string;
  skills: string[];
  experienceTitle: string;
  experienceDuration: string;
  experienceDescription: string;
  aiMatch: string;
};

const candidates: CandidateData[] = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    qualification: 'BSc Data Science',
    applied: '2 days ago',
    email: 'thabo.mokoena@example.com',
    education:
      'Bachelor of Science in Data Science',
    institution:
      'Richfield Graduate Institute of Technology',
    graduation: 'Expected Graduation: 2027',
    skills: [
      'Python',
      'SQL',
      'Power BI',
      'Data Analysis',
      'Machine Learning',
      'Excel',
    ],
    experienceTitle: 'Data Analytics Intern',
    experienceDuration: '6 months experience',
    experienceDescription:
      'Assisted with data analysis, dashboard development and reporting using Python, SQL and Power BI.',
    aiMatch: '92%',
  },

  {
    id: '2',
    name: 'Aisha Naidoo',
    qualification: 'BSc Computer Science',
    applied: '3 days ago',
    email: 'aisha.naidoo@example.com',
    education:
      'Bachelor of Science in Computer Science',
    institution:
      'Richfield Graduate Institute of Technology',
    graduation: 'Expected Graduation: 2027',
    skills: [
      'Python',
      'Java',
      'SQL',
      'React',
      'Git',
      'Problem Solving',
    ],
    experienceTitle: 'Software Development Intern',
    experienceDuration: '4 months experience',
    experienceDescription:
      'Worked on web applications and assisted with software development projects using Java, React and SQL.',
    aiMatch: '89%',
  },

  {
    id: '3',
    name: 'Liam Smith',
    qualification:
      'BSc Information Technology',
    applied: '4 days ago',
    email: 'liam.smith@example.com',
    education:
      'Bachelor of Science in Information Technology',
    institution:
      'Richfield Graduate Institute of Technology',
    graduation: 'Expected Graduation: 2027',
    skills: [
      'React',
      'JavaScript',
      'TypeScript',
      'HTML',
      'CSS',
      'Git',
    ],
    experienceTitle: 'Junior Web Developer',
    experienceDuration: '8 months experience',
    experienceDescription:
      'Developed responsive web interfaces and assisted with frontend development using React and JavaScript.',
    aiMatch: '94%',
  },

  {
    id: '4',
    name: 'Zanele Dlamini',
    qualification:
      'Diploma in Software Development',
    applied: '5 days ago',
    email: 'zanele.dlamini@example.com',
    education:
      'Diploma in Software Development',
    institution:
      'Richfield Graduate Institute of Technology',
    graduation: 'Completed 2026',
    skills: [
      'Java',
      'SQL',
      'HTML',
      'CSS',
      'JavaScript',
      'Software Development',
    ],
    experienceTitle: 'Software Development Intern',
    experienceDuration: '5 months experience',
    experienceDescription:
      'Supported software development projects and assisted with database and application development tasks.',
    aiMatch: '84%',
  },

  {
    id: '5',
    name: 'Ethan Williams',
    qualification:
      'BSc Information Technology',
    applied: '1 week ago',
    email: 'ethan.williams@example.com',
    education:
      'Bachelor of Science in Information Technology',
    institution:
      'Richfield Graduate Institute of Technology',
    graduation: 'Expected Graduation: 2027',
    skills: [
      'Networking',
      'Python',
      'SQL',
      'IT Support',
      'Troubleshooting',
      'Windows',
    ],
    experienceTitle: 'IT Support Assistant',
    experienceDuration: '7 months experience',
    experienceDescription:
      'Provided technical support, assisted with troubleshooting and helped maintain computer systems and networks.',
    aiMatch: '78%',
  },
];

export default function CandidateProfileScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    opportunity?: string;
  }>();

  const candidateName =
    typeof params.name === 'string'
      ? params.name
      : 'Thabo Mokoena';

  const opportunity =
    typeof params.opportunity === 'string'
      ? params.opportunity
      : 'Graduate Data Analyst';

  const candidate =
    candidates.find(
      (item) => item.name === candidateName
    ) ?? candidates[0];

  const [status, setStatus] =
    useState<ApplicationStatus>(
      'Under Review'
    );

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [candidate.id])
  );

  const loadStatus = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      if (!saved) {
        setStatus(
          candidate.id === '1' ||
            candidate.id === '3'
            ? 'Shortlisted'
            : candidate.id === '5'
            ? 'Rejected'
            : 'Under Review'
        );
        return;
      }

      const savedStatuses: Record<
        string,
        ApplicationStatus
      > = JSON.parse(saved);

      const defaultStatus =
        candidate.id === '1' ||
        candidate.id === '3'
          ? 'Shortlisted'
          : candidate.id === '5'
          ? 'Rejected'
          : 'Under Review';

      setStatus(
        savedStatuses[candidate.id] ??
          defaultStatus
      );
    } catch (error) {
      console.log(
        'Error loading candidate status:',
        error
      );
    }
  };

  const saveStatus = async (
    newStatus: ApplicationStatus
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

      savedStatuses[candidate.id] =
        newStatus;

      await AsyncStorage.setItem(
        APPLICATION_STATUS_KEY,
        JSON.stringify(savedStatuses)
      );

      setStatus(newStatus);
    } catch (error) {
      console.log(
        'Error saving candidate status:',
        error
      );
    }
  };

  const handleShortlist = () => {
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
          onPress: () => {
            saveStatus('Shortlisted');

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
          onPress: () => {
            saveStatus('Interview');

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
          onPress: () => {
            saveStatus('Rejected');

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
          onPress: () => {
            saveStatus('Under Review');

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

  const statusColors = getStatusColors();

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

        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Candidate Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
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
          <Text style={styles.sectionTitle}>
            Applied Position
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Opportunity
            </Text>

            <Text style={styles.infoValue}>
              {opportunity}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>
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

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>
              Applied
            </Text>

            <Text style={styles.infoValue}>
              {candidate.applied}
            </Text>
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Education
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>
              {candidate.education}
            </Text>

            <Text style={styles.secondaryText}>
              {candidate.institution}
            </Text>

            <Text style={styles.secondaryText}>
              {candidate.graduation}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Skills
          </Text>

          <View style={styles.skillsContainer}>
            {candidate.skills.map(
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
            )}
          </View>
        </View>

        {/* AI Match */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>
            🤖 AI Candidate Match
          </Text>

          <Text style={styles.aiScore}>
            {candidate.aiMatch}
          </Text>

          <View
            style={styles.matchBarBackground}
          >
            <View
              style={[
                styles.matchBar,
                {
                  width:
                    `${parseFloat(candidate.aiMatch)}%`,
                },
              ]}
            />
          </View>

          <Text
            style={styles.aiDescription}
          >
            This candidate is a strong match
            for the opportunity based on
            their skills, qualification and
            career profile.
          </Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Experience
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>
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
          <Text style={styles.sectionTitle}>
            Recruitment Actions
          </Text>

          {status === 'Under Review' && (
            <>
              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={
                  handleShortlist
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
                onPress={handleReject}
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

          {status === 'Shortlisted' && (
            <>
              <Pressable
                style={
                  styles.interviewButton
                }
                onPress={
                  handleInterview
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
                onPress={handleReject}
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

          {status === 'Interview' && (
            <Pressable
              style={
                styles.rejectButton
              }
              onPress={handleReject}
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

          {status === 'Rejected' && (
            <Pressable
              style={styles.reviewButton}
              onPress={
                handleReconsider
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
});