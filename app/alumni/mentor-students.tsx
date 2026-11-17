import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const MENTORSHIP_ENDPOINT =
  `${API_BASE_URL}/alumni/mentorship.php`;

type BackendStudent = {
  id?: number | string;
  name?: string;
  email?: string;
  qualification?: string | null;
  year_of_study?: number | string | null;
  graduation_year?: number | string | null;
  campus?: string | null;
  bio?: string | null;
  skills?: string[] | string | null;
  career_goals?: string[] | string | null;
  mentorship_status?: string | null;
  pending_request_id?: number | string | null;
};

type Student = {
  id: number;
  name: string;
  qualification: string;
  year: string;
  interests: string;
  location: string;
  bio: string;
  skills: string[];
  careerGoals: string[];
  mentorshipStatus: string | null;
  pendingRequestId: number | null;
};

type MentorshipRequest = {
  id: number;
  alumniId: number;
  studentId: number;
  status: string;
  studentName: string;
  qualification: string;
  year: string;
  location: string;
};

type MentorshipStats = {
  students: number;
  requests: number;
  accepted: number;
  sessions: number;
};

function safeString(
  value: unknown,
  fallback = ''
): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return fallback;
}

function safeStringArray(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => safeString(item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,•|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatYearOfStudy(
  value: unknown
): string {
  const year = Number(value);

  if (!Number.isFinite(year) || year <= 0) {
    return 'Student';
  }

  const suffix =
    year === 1
      ? 'st'
      : year === 2
      ? 'nd'
      : year === 3
      ? 'rd'
      : 'th';

  return `${year}${suffix} Year`;
}

function mapStudent(
  student: BackendStudent
): Student {
  const skills = safeStringArray(student.skills);
  const careerGoals = safeStringArray(
    student.career_goals
  );

  /*
   * Career goals are the best source for the UI's
   * "Career Interests" section.
   *
   * If the student has no career goals, fall back
   * to their skills.
   */
  const interests =
    careerGoals.length > 0
      ? careerGoals.join(' • ')
      : skills.length > 0
      ? skills.join(' • ')
      : 'Career interests not specified';

  const campus = safeString(
    student.campus,
    'Not specified'
  );

  const pendingRequestId =
    student.pending_request_id !== null &&
    student.pending_request_id !== undefined &&
    Number.isFinite(Number(student.pending_request_id))
      ? Number(student.pending_request_id)
      : null;

  return {
    id: Number(student.id),
    name: safeString(
      student.name,
      'CareerForge Student'
    ),
    qualification: safeString(
      student.qualification,
      'Qualification not specified'
    ),
    year: formatYearOfStudy(
      student.year_of_study
    ),
    interests,
    location: campus,
    bio: safeString(student.bio),
    skills,
    careerGoals,
    mentorshipStatus:
      student.mentorship_status
        ? safeString(student.mentorship_status)
        : null,
    pendingRequestId,
  };
}

function mapRequest(
  request: any
): MentorshipRequest {
  return {
    id: Number(request?.id ?? 0),
    alumniId: Number(
      request?.alumni_id ?? 0
    ),
    studentId: Number(
      request?.student_id ?? 0
    ),
    status: safeString(
      request?.status,
      'pending'
    ),
    studentName: safeString(
      request?.student_name,
      'Student'
    ),
    qualification: safeString(
      request?.qualification,
      'Qualification not specified'
    ),
    year: formatYearOfStudy(
      request?.year_of_study
    ),
    location: safeString(
      request?.campus,
      'Not specified'
    ),
  };
}

export default function MentorStudents() {
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState<Student[]>(
    []
  );

  const [requests, setRequests] = useState<
    MentorshipRequest[]
  >([]);

  const [stats, setStats] =
    useState<MentorshipStats>({
      students: 0,
      requests: 0,
      accepted: 0,
      sessions: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [actionLoadingId, setActionLoadingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState('');

  /*
   * ---------------------------------------------------------
   * SESSION
   * ---------------------------------------------------------
   */

  const getToken = async (): Promise<
    string | null
  > => {
    const token =
      await AsyncStorage.getItem('authToken');

    if (!token) {
      return null;
    }

    return token;
  };

  const handleSessionExpired = () => {
    AsyncStorage.multiRemove([
      'authToken',
      'user',
    ]);

    Alert.alert(
      'Session Expired',
      'Please log in again to continue.',
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/login'),
        },
      ]
    );
  };

  /*
   * ---------------------------------------------------------
   * LOAD MENTORSHIP DATA
   * ---------------------------------------------------------
   */

  const loadMentorshipData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const token = await getToken();

        if (!token) {
          handleSessionExpired();
          return;
        }

        const response = await fetch(
          MENTORSHIP_ENDPOINT,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const responseText =
          await response.text();

        let result: any;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch (parseError) {
          console.log(
            'Mentorship JSON parse error:',
            parseError
          );

          throw new Error(
            'The server returned an invalid response.'
          );
        }

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              'Unable to load mentorship data.'
          );
        }

        const backendStudents =
          Array.isArray(result?.data?.students)
            ? result.data.students
            : [];

        const backendRequests =
          Array.isArray(result?.data?.requests)
            ? result.data.requests
            : [];

        const backendStats =
          result?.data?.stats ?? {};

        setStudents(
          backendStudents
            .map(mapStudent)
            .filter(
              (student) =>
                Number.isFinite(student.id) &&
                student.id > 0
            )
        );

        setRequests(
          backendRequests
            .map(mapRequest)
            .filter(
              (request) =>
                request.id > 0
            )
        );

        setStats({
          students: Number(
            backendStats.students ?? 0
          ),
          requests: Number(
            backendStats.requests ?? 0
          ),
          accepted: Number(
            backendStats.accepted ?? 0
          ),
          sessions: Number(
            backendStats.sessions ?? 0
          ),
        });
      } catch (loadError) {
        console.log(
          'Error loading mentorship data:',
          loadError
        );

        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load mentorship data.';

        setError(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadMentorshipData();
    }, [loadMentorshipData])
  );

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const filteredStudents =
    students.filter((student) => {
      const searchValue =
        search.toLowerCase().trim();

      if (!searchValue) {
        return true;
      }

      return (
        student.name
          .toLowerCase()
          .includes(searchValue) ||
        student.qualification
          .toLowerCase()
          .includes(searchValue) ||
        student.interests
          .toLowerCase()
          .includes(searchValue) ||
        student.location
          .toLowerCase()
          .includes(searchValue) ||
        student.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchValue)
        ) ||
        student.careerGoals.some((goal) =>
          goal
            .toLowerCase()
            .includes(searchValue)
        )
      );
    });

  /*
   * ---------------------------------------------------------
   * VIEW STUDENT PROFILE
   * ---------------------------------------------------------
   */

  const handleViewProfile = (
    student: Student
  ) => {
    const interests =
      student.interests ||
      'Career interests not specified';

    const bio =
      student.bio ||
      'No profile biography provided.';

    Alert.alert(
      'Student Profile',
      `${student.name}\n\n` +
        `${student.qualification}\n` +
        `${student.year}\n\n` +
        `Career Interests:\n${interests}\n\n` +
        `Location: ${student.location}\n\n` +
        `About:\n${bio}`
    );
  };

  /*
   * ---------------------------------------------------------
   * SEND MENTORSHIP REQUEST
   * ---------------------------------------------------------
   */

  const sendMentorshipRequest = async (
    student: Student
  ) => {
    try {
      setActionLoadingId(student.id);

      const token = await getToken();

      if (!token) {
        handleSessionExpired();
        return;
      }

      const response = await fetch(
        MENTORSHIP_ENDPOINT,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            student_id: student.id,
          }),
        }
      );

      const responseText =
        await response.text();

      let result: any;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : null;
      } catch (parseError) {
        console.log(
          'Mentorship request JSON parse error:',
          parseError
        );

        throw new Error(
          'The server returned an invalid response.'
        );
      }

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (
        response.status === 409
      ) {
        Alert.alert(
          'Mentorship Request',
          result?.message ||
            'A mentorship request already exists for this student.'
        );

        await loadMentorshipData();
        return;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            'Unable to send the mentorship request.'
        );
      }

      Alert.alert(
        'Request Sent',
        `Your mentorship request has been sent to ${student.name}.`
      );

      await loadMentorshipData();
    } catch (requestError) {
      console.log(
        'Error sending mentorship request:',
        requestError
      );

      Alert.alert(
        'Unable to Send Request',
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while sending the mentorship request.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMentorship = (
    student: Student
  ) => {
    const existingRequest =
      requests.find(
        (request) =>
          request.studentId ===
            student.id &&
          request.status === 'pending'
      );

    if (
      existingRequest ||
      student.mentorshipStatus ===
        'pending'
    ) {
      Alert.alert(
        'Mentorship Request',
        `You have already sent a mentorship request to ${student.name}.`
      );
      return;
    }

    if (
      student.mentorshipStatus ===
      'accepted'
    ) {
      Alert.alert(
        'Mentorship',
        `You are already mentoring ${student.name}.`
      );
      return;
    }

    Alert.alert(
      'Offer Mentorship',
      `Would you like to offer mentorship to ${student.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Request',
          onPress: () =>
            sendMentorshipRequest(student),
        },
      ]
    );
  };

  /*
   * ---------------------------------------------------------
   * CANCEL MENTORSHIP REQUEST
   * ---------------------------------------------------------
   */

  const cancelMentorshipRequest =
    async (
      request: MentorshipRequest
    ) => {
      try {
        setActionLoadingId(
          request.studentId
        );

        const token = await getToken();

        if (!token) {
          handleSessionExpired();
          return;
        }

        const response = await fetch(
          MENTORSHIP_ENDPOINT,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              request_id: request.id,
              action: 'cancel',
            }),
          }
        );

        const responseText =
          await response.text();

        let result: any;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch (parseError) {
          console.log(
            'Cancel request JSON parse error:',
            parseError
          );

          throw new Error(
            'The server returned an invalid response.'
          );
        }

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              'Unable to cancel the mentorship request.'
          );
        }

        Alert.alert(
          'Request Cancelled',
          `Your mentorship request to ${request.studentName} has been cancelled.`
        );

        await loadMentorshipData();
      } catch (cancelError) {
        console.log(
          'Error cancelling mentorship request:',
          cancelError
        );

        Alert.alert(
          'Unable to Cancel Request',
          cancelError instanceof Error
            ? cancelError.message
            : 'Something went wrong while cancelling the request.'
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  const handleRemoveRequest = (
    request: MentorshipRequest
  ) => {
    Alert.alert(
      'Cancel Mentorship Request',
      `Are you sure you want to cancel your mentorship request to ${request.studentName}?`,
      [
        {
          text: 'Keep Request',
          style: 'cancel',
        },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: () =>
            cancelMentorshipRequest(
              request
            ),
        },
      ]
    );
  };

  /*
   * ---------------------------------------------------------
   * MENTORSHIP PREFERENCES
   * ---------------------------------------------------------
   *
   * Preferences are intentionally left unchanged because
   * there is not yet a dedicated mentorship_preferences
   * backend table/endpoint.
   */

  const handlePreferences = () => {
    Alert.alert(
      'Mentorship Preferences',
      'Mentorship preferences will be connected to the backend later.'
    );
  };

  /*
   * ---------------------------------------------------------
   * REQUESTED STUDENTS
   * ---------------------------------------------------------
   */

  const requestedStudentObjects =
    requests
      .filter(
        (request) =>
          request.status === 'pending'
      )
      .map((request) => {
        const student =
          students.find(
            (item) =>
              item.id ===
              request.studentId
          );

        if (student) {
          return student;
        }

        return {
          id: request.studentId,
          name: request.studentName,
          qualification:
            request.qualification,
          year: request.year,
          interests:
            'Career interests not specified',
          location:
            request.location,
          bio: '',
          skills: [],
          careerGoals: [],
          mentorshipStatus:
            request.status,
          pendingRequestId:
            request.id,
        };
      });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Mentor Students
          </Text>

          <Text style={styles.subtitle}>
            Help students grow through your experience.
          </Text>
        </View>
      </View>

      {/* Mentorship Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewIcon}>
          <Text style={styles.overviewIconText}>
            🤝
          </Text>
        </View>

        <View style={styles.overviewInfo}>
          <Text style={styles.overviewTitle}>
            Make an Impact
          </Text>

          <Text style={styles.overviewDescription}>
            Share your professional experience, provide guidance,
            and help students prepare for successful careers.
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#6C63FF"
          />

          <Text style={styles.loadingText}>
            Loading mentorship data...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Unable to load mentorship data
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={loadMentorshipData}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats.students}
          </Text>

          <Text style={styles.statLabel}>
            Students
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats.requests}
          </Text>

          <Text style={styles.statLabel}>
            Requests
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats.sessions}
          </Text>

          <Text style={styles.statLabel}>
            Sessions
          </Text>
        </View>
      </View>

      {/* Search */}
      <Text style={styles.sectionTitle}>
        Find Students
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search students, skills or qualifications..."
        placeholderTextColor="#94A3B8"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Student List */}
      <Text style={styles.sectionTitle}>
        Students Looking for Mentors
      </Text>

      {!loading &&
      !error &&
      filteredStudents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🔎
          </Text>

          <Text style={styles.emptyTitle}>
            {students.length === 0
              ? 'No students found'
              : 'No matching students'}
          </Text>

          <Text style={styles.emptyDescription}>
            {students.length === 0
              ? 'There are currently no active students available for mentorship.'
              : 'Try searching for another name, qualification or skill.'}
          </Text>
        </View>
      ) : (
        filteredStudents.map((student) => {
          const pendingRequest =
            requests.find(
              (request) =>
                request.studentId ===
                  student.id &&
                request.status ===
                  'pending'
            );

          const isRequested =
            Boolean(pendingRequest) ||
            student.mentorshipStatus ===
              'pending';

          const isAccepted =
            student.mentorshipStatus ===
            'accepted';

          const isLoading =
            actionLoadingId === student.id;

          return (
            <View
              key={student.id}
              style={styles.studentCard}
            >
              {/* Student Header */}
              <View style={styles.studentHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>

                <View style={styles.studentMainInfo}>
                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>

                  <Text style={styles.qualification}>
                    {student.qualification}
                  </Text>

                  <Text style={styles.year}>
                    {student.year}
                  </Text>
                </View>

                {isRequested && (
                  <View style={styles.requestedBadge}>
                    <Text style={styles.requestedBadgeText}>
                      Requested
                    </Text>
                  </View>
                )}

                {isAccepted && (
                  <View style={styles.requestedBadge}>
                    <Text style={styles.requestedBadgeText}>
                      Mentoring
                    </Text>
                  </View>
                )}
              </View>

              {/* Career Interests */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>
                  Career Interests
                </Text>

                <Text style={styles.infoText}>
                  {student.interests}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>
                  📍
                </Text>

                <Text style={styles.locationText}>
                  {student.location}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.viewButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleViewProfile(
                      student
                    )
                  }
                  disabled={isLoading}
                >
                  <Text style={styles.viewButtonText}>
                    View Profile
                  </Text>
                </TouchableOpacity>

                {isRequested ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (
                        pendingRequest
                      ) {
                        handleRemoveRequest(
                          pendingRequest
                        );
                      }
                    }}
                    disabled={
                      isLoading ||
                      !pendingRequest
                    }
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#2E7D32"
                      />
                    ) : (
                      <Text style={styles.cancelButtonText}>
                        Request Sent
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : isAccepted ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    activeOpacity={0.8}
                    disabled
                  >
                    <Text style={styles.cancelButtonText}>
                      Mentoring
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.mentorButton}
                    activeOpacity={0.8}
                    onPress={() =>
                      handleMentorship(
                        student
                      )
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text style={styles.mentorButtonText}>
                        Offer Mentorship
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Current Mentees / Requests */}
      <Text style={styles.sectionTitle}>
        Your Mentorship Requests
      </Text>

      {requestedStudentObjects.length === 0 ? (
        <View style={styles.currentCard}>
          <View style={styles.currentAvatar}>
            <Text style={styles.currentAvatarText}>
              M
            </Text>
          </View>

          <View style={styles.currentInfo}>
            <Text style={styles.currentName}>
              No Active Requests
            </Text>

            <Text style={styles.currentDescription}>
              Students you offer mentorship to will appear here.
            </Text>
          </View>
        </View>
      ) : (
        requestedStudentObjects.map(
          (student) => {
            const request =
              requests.find(
                (item) =>
                  item.studentId ===
                    student.id &&
                  item.status ===
                    'pending'
              );

            const isLoading =
              actionLoadingId ===
              student.id;

            return (
              <View
                key={student.id}
                style={styles.menteeCard}
              >
                <View style={styles.currentAvatar}>
                  <Text style={styles.currentAvatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>

                <View style={styles.currentInfo}>
                  <Text style={styles.currentName}>
                    {student.name}
                  </Text>

                  <Text style={styles.currentDescription}>
                    {student.qualification} •{' '}
                    {student.year}
                  </Text>

                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>
                      Mentorship Request Sent
                    </Text>
                  </View>

                  {request && (
                    <TouchableOpacity
                      style={
                        styles.requestCancelButton
                      }
                      activeOpacity={0.8}
                      onPress={() =>
                        handleRemoveRequest(
                          request
                        )
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator
                          size="small"
                          color="#B26A00"
                        />
                      ) : (
                        <Text
                          style={
                            styles.requestCancelText
                          }
                        >
                          Cancel Request
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }
        )
      )}

      {/* Mentorship Preferences */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          Ready to make a difference?
        </Text>

        <Text style={styles.footerDescription}>
          Your experience could help a student take the next
          important step in their career.
        </Text>

        <TouchableOpacity
          style={styles.footerButton}
          activeOpacity={0.8}
          onPress={handlePreferences}
        >
          <Text style={styles.footerButtonText}>
            Update Mentorship Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back to Dashboard */}
      <TouchableOpacity
        style={styles.dashboardButton}
        activeOpacity={0.8}
        onPress={() =>
          router.replace('/alumni/dashboard')
        }
      >
        <Text style={styles.dashboardButtonText}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 25,
    color: '#4F46E5',
    fontWeight: '600',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#24243A',
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    lineHeight: 18,
  },

  overviewCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  overviewIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  overviewIconText: {
    fontSize: 27,
  },

  overviewInfo: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 6,
  },

  overviewDescription: {
    fontSize: 13,
    color: '#5F5F70',
    lineHeight: 19,
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginLeft: 9,
    fontSize: 13,
    color: '#777777',
  },

  errorCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 5,
  },

  errorText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 12,
  },

  retryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },

  statLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 12,
    marginTop: 8,
  },

  searchInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8E5',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#24243A',
    marginBottom: 22,
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#4F46E5',
  },

  studentMainInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 3,
  },

  qualification: {
    fontSize: 13,
    color: '#555566',
    marginBottom: 3,
  },

  year: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },

  requestedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  requestedBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '800',
  },

  infoSection: {
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777777',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  infoText: {
    fontSize: 13,
    color: '#424255',
    lineHeight: 19,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  locationIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  locationText: {
    fontSize: 12,
    color: '#777777',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  viewButton: {
    width: '39%',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },

  mentorButton: {
    width: '58%',
    backgroundColor: '#6C63FF',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  mentorButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cancelButton: {
    width: '58%',
    backgroundColor: '#E8F5E9',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 5,
  },

  emptyDescription: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  currentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },

  menteeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  currentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  currentAvatarText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4F46E5',
  },

  currentInfo: {
    flex: 1,
  },

  currentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  currentDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
  },

  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7E6',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
  },

  pendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B26A00',
  },

  requestCancelButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  requestCancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B26A00',
  },

  footerCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 7,
  },

  footerDescription: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 19,
    marginBottom: 17,
  },

  footerButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  dashboardButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});