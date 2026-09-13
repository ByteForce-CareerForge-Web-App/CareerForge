import React, { useCallback, useState } from 'react';
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

const CONNECTIONS_KEY =
  'careerforge_business_connections';

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
  aiMatch: number;
};

type Connection = {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  connectedAt: string;
};

const candidates: CandidateData[] = [
  {
    id: '1',
    name: 'Thabo Mokoena',
    qualification: 'BSc Data Science',
    applied: 'Data Analytics Intern',
    email: 'thabo.mokoena@example.com',
    education: 'Bachelor of Science in Data Science',
    institution: 'Richfield Graduate Institute of Technology',
    graduation: 'Expected 2027',
    skills: [
      'Python',
      'SQL',
      'Power BI',
      'Data Analysis',
      'Machine Learning',
      'Excel',
    ],
    experienceTitle: 'Data Analytics Intern',
    experienceDuration: '6 months',
    experienceDescription:
      'Worked with data analysis, reporting and dashboard development.',
    aiMatch: 92,
  },
  {
    id: '2',
    name: 'Aisha Naidoo',
    qualification: 'BSc Computer Science',
    applied: 'Software Development Intern',
    email: 'aisha.naidoo@example.com',
    education: 'Bachelor of Science in Computer Science',
    institution: 'Richfield Graduate Institute of Technology',
    graduation: 'Expected 2027',
    skills: [
      'Python',
      'Java',
      'SQL',
      'React',
      'Git',
      'Problem Solving',
    ],
    experienceTitle: 'Software Development Intern',
    experienceDuration: '4 months',
    experienceDescription:
      'Assisted with software development and frontend application projects.',
    aiMatch: 89,
  },
  {
    id: '3',
    name: 'Liam Smith',
    qualification: 'BSc IT',
    applied: 'Junior Web Developer',
    email: 'liam.smith@example.com',
    education: 'Bachelor of Science in Information Technology',
    institution: 'Richfield Graduate Institute of Technology',
    graduation: 'Expected 2027',
    skills: [
      'React',
      'JavaScript',
      'TypeScript',
      'HTML',
      'CSS',
      'Git',
    ],
    experienceTitle: 'Junior Web Developer',
    experienceDuration: '8 months',
    experienceDescription:
      'Developed responsive web interfaces and assisted with frontend development.',
    aiMatch: 94,
  },
  {
    id: '4',
    name: 'Zanele Dlamini',
    qualification: 'Diploma Software Development',
    applied: 'Software Development Intern',
    email: 'zanele.dlamini@example.com',
    education: 'Diploma in Software Development',
    institution: 'Richfield Graduate Institute of Technology',
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
    experienceDuration: '5 months',
    experienceDescription:
      'Supported development tasks and worked on software development projects.',
    aiMatch: 84,
  },
  {
    id: '5',
    name: 'Ethan Williams',
    qualification: 'BSc IT',
    applied: 'IT Support Assistant',
    email: 'ethan.williams@example.com',
    education: 'Bachelor of Science in Information Technology',
    institution: 'Richfield Graduate Institute of Technology',
    graduation: 'Expected 2027',
    skills: [
      'Networking',
      'Python',
      'SQL',
      'IT Support',
      'Troubleshooting',
      'Windows',
    ],
    experienceTitle: 'IT Support Assistant',
    experienceDuration: '7 months',
    experienceDescription:
      'Provided technical support and assisted with troubleshooting and networking.',
    aiMatch: 78,
  },
];

export default function CandidateProfileScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    opportunity?: string;
  }>();

  const [status, setStatus] =
    useState<ApplicationStatus>('Under Review');

  const [isConnected, setIsConnected] =
    useState(false);

  const candidate =
    candidates.find(
      (item) => item.name === params.name
    ) || candidates[0];

  useFocusEffect(
    useCallback(() => {
      loadCandidateData();
    }, [candidate.id])
  );

  const loadCandidateData = async () => {
    try {
      const storedStatuses =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      if (storedStatuses) {
        const parsedStatuses: Record<
          string,
          ApplicationStatus
        > = JSON.parse(storedStatuses);

        const defaultStatus =
          candidate.id === '1' || candidate.id === '3'
            ? 'Shortlisted'
            : candidate.id === '5'
              ? 'Rejected'
              : 'Under Review';

        setStatus(
          parsedStatuses[candidate.id] ||
            defaultStatus
        );
      } else {
        const defaultStatus =
          candidate.id === '1' || candidate.id === '3'
            ? 'Shortlisted'
            : candidate.id === '5'
              ? 'Rejected'
              : 'Under Review';

        setStatus(defaultStatus);
      }

      const storedConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      if (storedConnections) {
        const connections: Connection[] =
          JSON.parse(storedConnections);

        setIsConnected(
          connections.some(
            (connection) =>
              connection.id === candidate.id
          )
        );
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.log(
        'Error loading candidate data:',
        error
      );
    }
  };

  const saveStatus = async (
    newStatus: ApplicationStatus
  ) => {
    try {
      const stored =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      const statuses: Record<
        string,
        ApplicationStatus
      > = stored
        ? JSON.parse(stored)
        : {};

      statuses[candidate.id] = newStatus;

      await AsyncStorage.setItem(
        APPLICATION_STATUS_KEY,
        JSON.stringify(statuses)
      );

      setStatus(newStatus);
    } catch (error) {
      console.log(
        'Error saving application status:',
        error
      );
    }
  };

  const handleConnect = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      const connections: Connection[] =
        stored ? JSON.parse(stored) : [];

      if (
        connections.some(
          (connection) =>
            connection.id === candidate.id
        )
      ) {
        setIsConnected(true);
        return;
      }

      const newConnection: Connection = {
        id: candidate.id,
        name: candidate.name,
        role: candidate.applied,
        initials: candidate.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        email: candidate.email,
        connectedAt: new Date().toISOString(),
      };

      const updatedConnections = [
        ...connections,
        newConnection,
      ];

      await AsyncStorage.setItem(
        CONNECTIONS_KEY,
        JSON.stringify(updatedConnections)
      );

      setIsConnected(true);

      Alert.alert(
        'Connection Sent',
        `You are now connected with ${candidate.name}.`
      );
    } catch (error) {
      console.log(
        'Error saving connection:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to save the connection.'
      );
    }
  };

  const handleMessage = () => {
    router.push({
      pathname: '/business/chat',
      params: {
        conversationId: candidate.id,
        name: candidate.name,
        role: candidate.applied,
        initials: candidate.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      },
    });
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
          onPress: async () => {
            await saveStatus('Shortlisted');

            Alert.alert(
              'Candidate Shortlisted',
              `${candidate.name} has been shortlisted.`
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
          onPress: async () => {
            await saveStatus('Interview');

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
          onPress: async () => {
            await saveStatus('Rejected');

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
          onPress: async () => {
            await saveStatus('Under Review');

            Alert.alert(
              'Candidate Reconsidered',
              `${candidate.name} is now Under Review.`
            );
          },
        },
      ]
    );
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'Shortlisted':
        return styles.statusShortlisted;
      case 'Interview':
        return styles.statusInterview;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusReview;
    }
  };

  const getStatusTextStyle = () => {
    switch (status) {
      case 'Shortlisted':
        return styles.statusTextShortlisted;
      case 'Interview':
        return styles.statusTextInterview;
      case 'Rejected':
        return styles.statusTextRejected;
      default:
        return styles.statusTextReview;
    }
  };

  const getMatchColor = () => {
    if (candidate.aiMatch >= 90) {
      return '#16A34A';
    }

    if (candidate.aiMatch >= 80) {
      return '#2563EB';
    }

    return '#D4A72C';
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.replace('/business/candidates')
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              CANDIDATE REVIEW
            </Text>

            <Text style={styles.headerTitle}>
              Candidate Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Review candidate information
            </Text>
          </View>

        </View>

        <View style={styles.headerAccent} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* PROFILE HERO */}
        <View style={styles.profileCard}>

          <View style={styles.profileTopRow}>

            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {candidate.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileIdentity}>
              <Text style={styles.candidateName}>
                {candidate.name}
              </Text>

              <Text style={styles.candidateEmail}>
                {candidate.email}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  getStatusStyle(),
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        getStatusTextStyle().color,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusBadgeText,
                    getStatusTextStyle(),
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>

          </View>

          <View style={styles.profileDivider} />

          <View style={styles.connectionActions}>

            <Pressable
              style={[
                styles.connectButton,
                isConnected &&
                  styles.connectedButton,
              ]}
              onPress={handleConnect}
            >
              <Ionicons
                name={
                  isConnected
                    ? 'checkmark-circle'
                    : 'person-add-outline'
                }
                size={18}
                color={
                  isConnected
                    ? '#15803D'
                    : '#FFFFFF'
                }
              />

              <Text
                style={[
                  styles.connectButtonText,
                  isConnected &&
                    styles.connectedButtonText,
                ]}
              >
                {isConnected
                  ? 'Connected'
                  : 'Connect'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#2563EB"
              />

              <Text style={styles.messageButtonText}>
                Message
              </Text>
            </Pressable>

          </View>
        </View>

        {/* APPLICATION */}
        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                APPLICATION
              </Text>

              <Text style={styles.sectionTitle}>
                Applied Position
              </Text>
            </View>

            <View style={styles.goldAccentIcon}>
              <Ionicons
                name="briefcase-outline"
                size={19}
                color="#B88912"
              />
            </View>
          </View>

          <InfoRow
            icon="briefcase-outline"
            label="Opportunity"
            value={
              params.opportunity ||
              candidate.applied
            }
          />

          <InfoRow
            icon="checkmark-circle-outline"
            label="Application Status"
            value={status}
          />

          <InfoRow
            icon="calendar-outline"
            label="Applied"
            value="Recently"
            last
          />

        </View>

        {/* EDUCATION */}
        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                BACKGROUND
              </Text>

              <Text style={styles.sectionTitle}>
                Education
              </Text>
            </View>

            <View style={styles.blueAccentIcon}>
              <Ionicons
                name="school-outline"
                size={19}
                color="#2563EB"
              />
            </View>
          </View>

          <Text style={styles.educationTitle}>
            {candidate.education}
          </Text>

          <View style={styles.detailLine}>
            <Ionicons
              name="business-outline"
              size={15}
              color="#64748B"
            />

            <Text style={styles.educationInstitution}>
              {candidate.institution}
            </Text>
          </View>

          <View style={styles.graduationPill}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#2563EB"
            />

            <Text style={styles.educationGraduation}>
              {candidate.graduation}
            </Text>
          </View>

        </View>

        {/* SKILLS */}
        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                CAPABILITIES
              </Text>

              <Text style={styles.sectionTitle}>
                Skills
              </Text>
            </View>

            <View style={styles.blueAccentIcon}>
              <Ionicons
                name="layers-outline"
                size={19}
                color="#2563EB"
              />
            </View>
          </View>

          <View style={styles.skillsContainer}>
            {candidate.skills.map((skill) => (
              <View
                key={skill}
                style={styles.skillChip}
              >
                <View style={styles.skillDot} />

                <Text style={styles.skillText}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>

        </View>

        {/* AI MATCH */}
        <View style={styles.aiCard}>

          <View style={styles.aiHeader}>

            <View style={styles.aiIcon}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={styles.aiHeaderText}>
              <Text style={styles.aiEyebrow}>
                AI INSIGHT
              </Text>

              <Text style={styles.aiTitle}>
                Candidate Match
              </Text>

              <Text style={styles.aiSubtitle}>
                Compatibility with this opportunity
              </Text>
            </View>

            <View style={styles.aiScoreContainer}>
              <Text
                style={[
                  styles.aiScore,
                  {
                    color: getMatchColor(),
                  },
                ]}
              >
                {candidate.aiMatch}%
              </Text>

              <Text style={styles.aiScoreLabel}>
                MATCH
              </Text>
            </View>

          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${candidate.aiMatch}%`,
                  backgroundColor: getMatchColor(),
                },
              ]}
            />
          </View>

          <View style={styles.aiInsightBox}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#2563EB"
            />

            <Text style={styles.aiDescription}>
              This score is based on the candidate's
              skills, education and experience.
            </Text>
          </View>

        </View>

        {/* EXPERIENCE */}
        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                PROFESSIONAL HISTORY
              </Text>

              <Text style={styles.sectionTitle}>
                Experience
              </Text>
            </View>

            <View style={styles.goldAccentIcon}>
              <Ionicons
                name="briefcase-outline"
                size={19}
                color="#B88912"
              />
            </View>
          </View>

          <Text style={styles.experienceTitle}>
            {candidate.experienceTitle}
          </Text>

          <View style={styles.durationRow}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#2563EB"
            />

            <Text style={styles.experienceDuration}>
              {candidate.experienceDuration}
            </Text>
          </View>

          <Text style={styles.experienceDescription}>
            {candidate.experienceDescription}
          </Text>

        </View>

        {/* RECRUITMENT ACTIONS */}
        <View style={styles.actionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                NEXT STEP
              </Text>

              <Text style={styles.sectionTitle}>
                Recruitment Actions
              </Text>
            </View>
          </View>

          {status === 'Under Review' && (
            <>
              <Pressable
                style={styles.primaryAction}
                onPress={handleShortlist}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.primaryActionText}>
                  Shortlist Candidate
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                style={styles.dangerAction}
                onPress={handleReject}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={19}
                  color="#DC2626"
                />

                <Text style={styles.dangerActionText}>
                  Reject Candidate
                </Text>
              </Pressable>
            </>
          )}

          {status === 'Shortlisted' && (
            <>
              <Pressable
                style={styles.primaryAction}
                onPress={handleInterview}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.primaryActionText}>
                  Move to Interview
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                style={styles.dangerAction}
                onPress={handleReject}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={19}
                  color="#DC2626"
                />

                <Text style={styles.dangerActionText}>
                  Reject Candidate
                </Text>
              </Pressable>
            </>
          )}

          {status === 'Interview' && (
            <Pressable
              style={styles.dangerAction}
              onPress={handleReject}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color="#DC2626"
              />

              <Text style={styles.dangerActionText}>
                Reject Candidate
              </Text>
            </Pressable>
          )}

          {status === 'Rejected' && (
            <Pressable
              style={styles.secondaryAction}
              onPress={handleReconsider}
            >
              <Ionicons
                name="refresh-outline"
                size={19}
                color="#2563EB"
              />

              <Text style={styles.secondaryActionText}>
                Reconsider Candidate
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#2563EB"
              />
            </Pressable>
          )}

        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace('/business/dashboard')
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
            router.replace('/business/messages')
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
            router.replace('/business/company-profile')
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

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.lastInfoRow,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 18,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#D4A72C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  headerAccent: {
    width: 42,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    marginTop: 16,
  },

  /* SCROLL */

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingTop: 15,
    paddingBottom: 30,
  },

  /* PROFILE */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 23,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F1F5F9',
    marginRight: 14,
  },

  avatarLargeText: {
    color: '#1E4B7A',
    fontSize: 22,
    fontWeight: '900',
  },

  profileIdentity: {
    flex: 1,
  },

  candidateName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  candidateEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 9,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  statusShortlisted: {
    backgroundColor: '#DCFCE7',
  },

  statusTextShortlisted: {
    color: '#15803D',
  },

  statusInterview: {
    backgroundColor: '#DBEAFE',
  },

  statusTextInterview: {
    color: '#1D4ED8',
  },

  statusRejected: {
    backgroundColor: '#FEE2E2',
  },

  statusTextRejected: {
    color: '#DC2626',
  },

  statusReview: {
    backgroundColor: '#FEF3C7',
  },

  statusTextReview: {
    color: '#B45309',
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginTop: 18,
  },

  connectionActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
    gap: 10,
  },

  connectButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  connectedButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  connectedButtonText: {
    color: '#15803D',
  },

  messageButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  messageButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  /* GENERAL CARDS */

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 17,
    marginBottom: 14,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.035,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionEyebrow: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },

  blueAccentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goldAccentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* INFO */

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  lastInfoRow: {
    marginBottom: 0,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  infoValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  /* EDUCATION */

  educationTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },

  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  educationInstitution: {
    color: '#475569',
    fontSize: 12,
    marginLeft: 7,
    flex: 1,
  },

  graduationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 10,
    gap: 5,
  },

  educationGraduation: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },

  /* SKILLS */

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#DCE5F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },

  skillText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },

  /* AI */

  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CFE0FA',
    padding: 17,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  aiHeaderText: {
    flex: 1,
  },

  aiEyebrow: {
    color: '#2563EB',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 2,
  },

  aiTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  aiSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  aiScoreContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  aiScore: {
    fontSize: 21,
    fontWeight: '900',
  },

  aiScoreLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E8EEF6',
    borderRadius: 8,
    marginTop: 17,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  aiInsightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFF',
    borderRadius: 11,
    padding: 10,
    marginTop: 11,
    gap: 7,
  },

  aiDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 16,
    flex: 1,
  },

  /* EXPERIENCE */

  experienceTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },

  experienceDuration: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },

  experienceDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  /* ACTIONS */

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 17,
    marginBottom: 14,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.035,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  primaryAction: {
    height: 48,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  actionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },

  dangerAction: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  dangerActionText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryAction: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 8,
  },

  secondaryActionText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },

  bottomSpace: {
    height: 90,
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