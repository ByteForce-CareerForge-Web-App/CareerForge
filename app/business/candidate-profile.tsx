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

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.replace('/business/candidates')
          }
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Candidate Profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Review candidate information
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            router.replace('/business/company-profile')
          }
        >
          <Text style={styles.profileText}>
            AT
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
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
            <Text
              style={[
                styles.statusBadgeText,
                getStatusTextStyle(),
              ]}
            >
              {status}
            </Text>
          </View>

          {/* CONNECTION ACTIONS */}
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

        {/* APPLIED POSITION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Applied Position
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="briefcase-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Opportunity
              </Text>

              <Text style={styles.infoValue}>
                {params.opportunity ||
                  candidate.applied}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Application Status
              </Text>

              <Text style={styles.infoValue}>
                {status}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Applied
              </Text>

              <Text style={styles.infoValue}>
                Recently
              </Text>
            </View>
          </View>
        </View>

        {/* EDUCATION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Education
          </Text>

          <Text style={styles.educationTitle}>
            {candidate.education}
          </Text>

          <Text style={styles.educationInstitution}>
            {candidate.institution}
          </Text>

          <Text style={styles.educationGraduation}>
            {candidate.graduation}
          </Text>
        </View>

        {/* SKILLS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Skills
          </Text>

          <View style={styles.skillsContainer}>
            {candidate.skills.map((skill) => (
              <View
                key={skill}
                style={styles.skillChip}
              >
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
              <Text style={styles.aiTitle}>
                AI Candidate Match
              </Text>

              <Text style={styles.aiSubtitle}>
                Compatibility with this opportunity
              </Text>
            </View>

            <Text style={styles.aiScore}>
              {candidate.aiMatch}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${candidate.aiMatch}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.aiDescription}>
            This score is based on the candidate's
            skills, education and experience.
          </Text>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Experience
          </Text>

          <Text style={styles.experienceTitle}>
            {candidate.experienceTitle}
          </Text>

          <Text style={styles.experienceDuration}>
            {candidate.experienceDuration}
          </Text>

          <Text style={styles.experienceDescription}>
            {candidate.experienceDescription}
          </Text>
        </View>

        {/* RECRUITMENT ACTIONS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Recruitment Actions
          </Text>

          {status === 'Under Review' && (
            <>
              <Pressable
                style={styles.primaryAction}
                onPress={handleShortlist}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryActionText}>
                  Shortlist Candidate
                </Text>
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
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryActionText}>
                  Move to Interview
                </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
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

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  profileText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '900',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  avatarLargeText: {
    color: '#1E4B7A',
    fontSize: 22,
    fontWeight: '900',
  },

  candidateName: {
    color: '#0F172A',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },

  candidateEmail: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },

  statusBadgeText: {
    fontSize: 11,
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

  connectionActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
    gap: 10,
  },

  connectButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
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
    borderRadius: 12,
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

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
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
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  infoValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  educationTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  educationInstitution: {
    color: '#475569',
    fontSize: 12,
    marginTop: 6,
  },

  educationGraduation: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  skillText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },

  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 14,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  aiHeaderText: {
    flex: 1,
  },

  aiTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  aiSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  aiScore: {
    color: '#15803D',
    fontSize: 21,
    fontWeight: '900',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 15,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 8,
  },

  aiDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },

  experienceTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  experienceDuration: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  experienceDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  primaryAction: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },

  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  dangerAction: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
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
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  secondaryActionText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 90,
  },

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