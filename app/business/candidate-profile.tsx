import React, { useCallback, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected'
  | 'Accepted'
  | 'Withdrawn';

type CandidateData = {
  id: string;
  applicationId: string;
  opportunityId: string;
  name: string;
  qualification: string;
  applied: string;
  email: string;
  education: string;
  institution: string;
  graduation: string;
  skills: string[];
  requiredSkills: string[];
  experienceTitle: string;
  experienceDuration: string;
  experienceDescription: string;
  aiMatch: number;
  employabilityScore: number | null;
  appliedAt: string | null;
};

type Connection = {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  connectedAt: string;
};

const CONNECTIONS_KEY =
  'careerforge_business_connections';

export default function CandidateProfileScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    opportunity?: string;
    fromChat?: string;
    conversationId?: string;
    role?: string;
    initials?: string;
    studentId?: string;
    applicationId?: string;
    opportunityId?: string;
    employabilityScore?: string;
  }>();

  const [candidate, setCandidate] =
    useState<CandidateData | null>(null);

  const [status, setStatus] =
    useState<ApplicationStatus>('Under Review');

  const [isConnected, setIsConnected] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useFocusEffect(
    useCallback(() => {
      loadCandidateData();
    }, [
      params.applicationId,
      params.studentId,
      params.opportunityId,
    ])
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD CANDIDATE FROM BACKEND
  |--------------------------------------------------------------------------
  */

  const loadCandidateData = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | APPLICATION ID
      |--------------------------------------------------------------------------
      */

      const applicationId =
        params.applicationId;

      if (
        !applicationId ||
        !/^\d+$/.test(String(applicationId))
      ) {
        throw new Error(
          'A valid application ID was not provided.'
        );
      }

      /*
      |--------------------------------------------------------------------------
      | API REQUEST
      |--------------------------------------------------------------------------
      */

      const url =
        `${API_BASE_URL}/business/candidate-profile.php` +
        `?application_id=${encodeURIComponent(
          applicationId
        )}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const responseText =
        await response.text();

      /*
      |--------------------------------------------------------------------------
      | PROTECT AGAINST HTML / 404 RESPONSES
      |--------------------------------------------------------------------------
      */

      if (
        responseText
          .trim()
          .toLowerCase()
          .startsWith('<!doctype') ||
        responseText
          .trim()
          .toLowerCase()
          .startsWith('<html')
      ) {
        throw new Error(
          `The server returned HTML instead of JSON. Response: ${responseText.slice(
            0,
            300
          )}`
        );
      }

      let result: any;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid JSON response from server: ${responseText.slice(
            0,
            300
          )}`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to load candidate profile. HTTP ${response.status}`
        );
      }

      const data = result.data;

      if (!data) {
        throw new Error(
          'Candidate profile data was not returned.'
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NORMALISE SKILLS
      |--------------------------------------------------------------------------
      */

      const skills: string[] =
        Array.isArray(data.skills)
          ? data.skills
              .map((skill: any) => {
                if (typeof skill === 'string') {
                  return skill;
                }

                if (
                  skill &&
                  typeof skill.name === 'string'
                ) {
                  return skill.name;
                }

                return '';
              })
              .filter(Boolean)
          : [];

      const requiredSkills: string[] =
        Array.isArray(data.required_skills)
          ? data.required_skills
              .map((skill: any) => {
                if (typeof skill === 'string') {
                  return skill;
                }

                if (
                  skill &&
                  typeof skill.name === 'string'
                ) {
                  return skill.name;
                }

                return '';
              })
              .filter(Boolean)
          : [];

      /*
      |--------------------------------------------------------------------------
      | EXPERIENCE
      |--------------------------------------------------------------------------
      |
      | Experience is currently stored locally by the
      | student in CareerForge, so the backend profile may
      | not contain it yet.
      |
      */

      const experienceTitle =
        data.current_position ||
        'Professional Experience';

      const experienceDuration =
        data.current_company
          ? data.current_company
          : 'Not provided';

      const experienceDescription =
        data.bio ||
        'No experience information has been provided.';

      /*
      |--------------------------------------------------------------------------
      | BUILD CANDIDATE OBJECT
      |--------------------------------------------------------------------------
      */

      const candidateData: CandidateData = {
        id: String(
          data.student_id ??
            params.studentId ??
            ''
        ),

        applicationId: String(
          data.application_id ??
            applicationId
        ),

        opportunityId: String(
          data.opportunity_id ??
            params.opportunityId ??
            ''
        ),

        name:
          data.name ||
          params.name ||
          'Candidate',

        qualification:
          data.qualification ||
          'Not provided',

        applied:
          data.opportunity ||
          params.opportunity ||
          'Opportunity',

        email:
          data.email ||
          'Not provided',

        education:
          data.qualification ||
          'Not provided',

        institution:
          data.campus ||
          'Richfield Graduate Institute of Technology',

        graduation:
          data.graduation_year
            ? `Expected ${data.graduation_year}`
            : 'Not provided',

        skills,

        requiredSkills,

        experienceTitle,

        experienceDuration,

        experienceDescription,

        aiMatch:
          data.ai_match !== null &&
          data.ai_match !== undefined &&
          !isNaN(Number(data.ai_match))
            ? Number(data.ai_match)
            : 0,

        employabilityScore:
          data.employability_score !== null &&
          data.employability_score !== undefined &&
          !isNaN(
            Number(data.employability_score)
          )
            ? Number(
                data.employability_score
              )
            : null,

        appliedAt:
          data.applied_at || null,
      };

      setCandidate(candidateData);

      /*
      |--------------------------------------------------------------------------
      | APPLICATION STATUS
      |--------------------------------------------------------------------------
      */

      setStatus(
        normalizeStatus(
          data.status
        )
      );

      /*
      |--------------------------------------------------------------------------
      | CONNECTION STATUS
      |--------------------------------------------------------------------------
      */

      await loadConnectionStatus(
        candidateData.id
      );

    } catch (err: any) {
      console.log(
        'Error loading candidate profile:',
        err
      );

      setError(
        err?.message ||
          'Unable to load candidate profile.'
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS NORMALISATION
  |--------------------------------------------------------------------------
  */

  const normalizeStatus = (
    value: any
  ): ApplicationStatus => {
    switch (
      String(value || '')
        .trim()
        .toLowerCase()
    ) {
      case 'shortlisted':
        return 'Shortlisted';

      case 'interview':
        return 'Interview';

      case 'rejected':
        return 'Rejected';

      case 'accepted':
        return 'Accepted';

      case 'withdrawn':
        return 'Withdrawn';

      case 'reviewing':
      case 'submitted':
      case 'under review':
      default:
        return 'Under Review';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD CONNECTION
  |--------------------------------------------------------------------------
  */

  const loadConnectionStatus = async (
    candidateId: string
  ) => {
    try {
      const storedConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      if (!storedConnections) {
        setIsConnected(false);
        return;
      }

      const connections: Connection[] =
        JSON.parse(storedConnections);

      setIsConnected(
        connections.some(
          (connection) =>
            String(connection.id) ===
            String(candidateId)
        )
      );

    } catch (err) {
      console.log(
        'Error loading connection:',
        err
      );

      setIsConnected(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE APPLICATION STATUS
  |--------------------------------------------------------------------------
  */

  const updateApplicationStatus = async (
  newStatus: ApplicationStatus
) => {
  try {
    if (!candidate) {
      return;
    }

    const token =
      await AsyncStorage.getItem('authToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const backendStatus =
      getBackendStatus(newStatus);

    const applicationId =
      Number(candidate.applicationId);

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      Alert.alert(
        'Error',
        'Invalid application ID.'
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE APPLICATION ENDPOINT
    |--------------------------------------------------------------------------
    */

    const updateUrl =
      `${API_BASE_URL}/business/applications.php`;

    const requestBody = {
      application_id: applicationId,
      status: backendStatus,
    };

    console.log(
      '===================================='
    );

    console.log(
      'Updating application status'
    );

    console.log(
      'URL:',
      updateUrl
    );

    console.log(
      'Application ID:',
      applicationId
    );

    console.log(
      'Frontend status:',
      newStatus
    );

    console.log(
      'Backend status:',
      backendStatus
    );

    console.log(
      'Request body:',
      JSON.stringify(requestBody)
    );

    console.log(
      '===================================='
    );

    const response = await fetch(
      updateUrl,
      {
        method: 'PUT',

        headers: {
          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body:
          JSON.stringify(
            requestBody
          ),
      }
    );

    const responseText =
      await response.text();

    console.log(
      'Status update HTTP status:',
      response.status
    );

    console.log(
      'Status update response:',
      responseText
    );

    /*
    |--------------------------------------------------------------------------
    | HTML RESPONSE
    |--------------------------------------------------------------------------
    */

    const trimmedResponse =
      responseText.trim();

    if (
      trimmedResponse
        .toLowerCase()
        .startsWith('<!doctype') ||
      trimmedResponse
        .toLowerCase()
        .startsWith('<html')
    ) {
      throw new Error(
        `The server returned HTML instead of JSON.\n\n` +
        `URL:\n${updateUrl}\n\n` +
        `HTTP Status: ${response.status}\n\n` +
        `Response:\n${responseText.slice(
          0,
          500
        )}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PARSE JSON
    |--------------------------------------------------------------------------
    */

    let result: any;

    try {
      result =
        JSON.parse(responseText);
    } catch {
      throw new Error(
        `Invalid JSON response from server.\n\n` +
        `HTTP Status: ${response.status}\n\n` +
        `Response:\n${responseText.slice(
          0,
          500
        )}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | API ERROR
    |--------------------------------------------------------------------------
    */

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          `Unable to update application status. HTTP ${response.status}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    setStatus(newStatus);

    Alert.alert(
      'Status Updated',
      `${candidate.name} is now ${newStatus}.`
    );

  } catch (err: any) {

    console.log(
      'Error updating application status:',
      err
    );

    Alert.alert(
      'Error',
      err?.message ||
        'Unable to update the application status.'
    );
  }
};

  /*
  |--------------------------------------------------------------------------
  | BACKEND STATUS
  |--------------------------------------------------------------------------
  */

  const getBackendStatus = (
    value: ApplicationStatus
  ) => {
    switch (value) {
      case 'Shortlisted':
        return 'shortlisted';

      case 'Interview':
        return 'interview';

      case 'Rejected':
        return 'rejected';

      case 'Accepted':
        return 'accepted';

      case 'Withdrawn':
        return 'withdrawn';

      case 'Under Review':
      default:
        return 'reviewing';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONNECTION
  |--------------------------------------------------------------------------
  */

  const handleConnect = async () => {
    try {
      if (!candidate) {
        return;
      }

      const stored =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      const connections: Connection[] =
        stored ? JSON.parse(stored) : [];

      if (
        connections.some(
          (connection) =>
            String(connection.id) ===
            String(candidate.id)
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

        connectedAt:
          new Date().toISOString(),
      };

      const updatedConnections = [
        ...connections,
        newConnection,
      ];

      await AsyncStorage.setItem(
        CONNECTIONS_KEY,
        JSON.stringify(
          updatedConnections
        )
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

  /*
  |--------------------------------------------------------------------------
  | MESSAGE
  |--------------------------------------------------------------------------
  */

  const handleMessage = () => {
    if (!candidate) {
      return;
    }

    router.push({
      pathname: '/business/chat',
      params: {
        conversationId:
          candidate.id,

        name:
          candidate.name,

        role:
          candidate.applied,

        initials:
          candidate.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    if (
      params.fromChat === 'true' &&
      params.conversationId
    ) {
      router.replace({
        pathname: '/business/chat',
        params: {
          conversationId:
            params.conversationId,

          name:
            candidate?.name ||
            params.name ||
            'Candidate',

          role:
            params.role ||
            candidate?.applied ||
            params.opportunity ||
            'Candidate',

          initials:
            params.initials ||
            candidate?.name
              ?.split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() ||
            'CA',
        },
      });

      return;
    }

    router.replace('/business/candidates');
  };

  /*
  |--------------------------------------------------------------------------
  | RECRUITMENT ACTIONS
  |--------------------------------------------------------------------------
  */

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
              'Shortlisted'
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
              'Interview'
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
              'Rejected'
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
              'Under Review'
            );
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STYLES
  |--------------------------------------------------------------------------
  */

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
    const match =
      candidate?.aiMatch ?? 0;

    if (match >= 90) {
      return '#16A34A';
    }

    if (match >= 80) {
      return '#2563EB';
    }

    return '#D4A72C';
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading candidate profile...
        </Text>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error || !candidate) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#DC2626"
        />

        <Text style={styles.errorTitle}>
          Unable to Load Candidate
        </Text>

        <Text style={styles.errorText}>
          {error ||
            'Candidate information could not be loaded.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadCandidateData}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.errorBackButton}
          onPress={handleBack}
        >
          <Text style={styles.errorBackButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>

          <Pressable
            style={styles.backButton}
            onPress={handleBack}
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

        {/* APPLICATION SUMMARY */}
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

          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>
              <Ionicons
                name="briefcase-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Opportunity
              </Text>

              <Text style={styles.infoValue}>
                {candidate.applied}
              </Text>
            </View>

          </View>

          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
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

          <View
            style={[
              styles.infoRow,
              styles.lastInfoRow,
            ]}
          >

            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Applied
              </Text>

              <Text style={styles.infoValue}>
                {candidate.applied}
                {'\n'}
                {formatAppliedDate(
                  candidate.appliedAt
                )}
              </Text>
            </View>

          </View>

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

          {candidate.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {candidate.skills.map(
                (skill, index) => (
                  <View
                    key={`${skill}-${index}`}
                    style={styles.skillChip}
                  >
                    <View
                      style={styles.skillDot}
                    />

                    <Text style={styles.skillText}>
                      {skill}
                    </Text>
                  </View>
                )
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No skills have been added.
            </Text>
          )}

        </View>

        {/* AI MATCH */}
        <View style={styles.aiCard}>

          <View style={styles.aiTopBar} />

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
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      candidate.aiMatch
                    )
                  )}%`,
                  backgroundColor:
                    getMatchColor(),
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
              This score compares the candidate's
              skills against the skills required for
              this opportunity.
            </Text>

          </View>

        </View>

        {/* EMPLOYABILITY SCORE */}
        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                CAREERFORGE AI
              </Text>

              <Text style={styles.sectionTitle}>
                Employability Score
              </Text>
            </View>

            <View style={styles.blueAccentIcon}>
              <Ionicons
                name="analytics-outline"
                size={19}
                color="#2563EB"
              />
            </View>
          </View>

          <View style={styles.employabilityRow}>

            <Text
              style={[
                styles.employabilityScore,
                {
                  color:
                    getEmployabilityColor(
                      candidate.employabilityScore
                    ),
                },
              ]}
            >
              {candidate.employabilityScore !==
              null
                ? `${candidate.employabilityScore}%`
                : 'N/A'}
            </Text>

            <Text style={styles.employabilityLabel}>
              Overall employability
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

            <View style={styles.actionIcon}>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={20}
                color="#2563EB"
              />
            </View>
          </View>

          {status === 'Under Review' && (
            <>
              <Pressable
                style={styles.primaryAction}
                onPress={handleShortlist}
              >
                <View
                  style={
                    styles.actionIconCircle
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  style={
                    styles.primaryActionText
                  }
                >
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

                <Text
                  style={
                    styles.dangerActionText
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
                style={styles.primaryAction}
                onPress={handleInterview}
              >
                <View
                  style={
                    styles.actionIconCircle
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  style={
                    styles.primaryActionText
                  }
                >
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

                <Text
                  style={
                    styles.dangerActionText
                  }
                >
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

              <Text
                style={
                  styles.dangerActionText
                }
              >
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

              <Text
                style={
                  styles.secondaryActionText
                }
              >
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

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatAppliedDate(
  value: string | null
) {
  if (!value) {
    return 'Not available';
  }

  const timestamp =
    new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return value;
  }

  const difference =
    Date.now() - timestamp;

  if (difference < 60_000) {
    return 'Just now';
  }

  if (difference < 3_600_000) {
    const minutes = Math.floor(
      difference / 60_000
    );

    return `${minutes} ${
      minutes === 1
        ? 'minute'
        : 'minutes'
    } ago`;
  }

  if (difference < 86_400_000) {
    const hours = Math.floor(
      difference / 3_600_000
    );

    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    } ago`;
  }

  const days = Math.floor(
    difference / 86_400_000
  );

  if (days < 7) {
    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    } ago`;
  }

  return new Date(value).toLocaleDateString(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}

function getEmployabilityColor(
  score: number | null
) {
  if (score === null) {
    return '#64748B';
  }

  if (score >= 80) {
    return '#16A34A';
  }

  if (score >= 60) {
    return '#2563EB';
  }

  return '#D4A72C';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 14,
  },

  errorText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  errorBackButton: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  errorBackButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
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
    backgroundColor:
      'rgba(255,255,255,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
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

  connectionActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
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

  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
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

  aiTopBar: {
    height: 3,
    width: 48,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    marginBottom: 15,
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

  /* EMPLOYABILITY */

  employabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  employabilityScore: {
    fontSize: 27,
    fontWeight: '900',
    marginRight: 12,
  },

  employabilityLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
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
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor:
      'rgba(255,255,255,0.18)',
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