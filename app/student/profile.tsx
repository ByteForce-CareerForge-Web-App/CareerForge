import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const EXPERIENCE_STORAGE_KEY = 'careerforge_experience';
const PROFILE_STORAGE_KEY = 'careerforge_student_profile';
const CONNECTIONS_KEY = 'careerforge_connections';
const REQUESTS_KEY = 'careerforge_connection_requests';

const EXPERIENCE_TYPES: Record<
  string,
  { icon: string; title: string }
> = {
  internship: {
    icon: '💼',
    title: 'Internships',
  },
  projects: {
    icon: '🚀',
    title: 'Projects',
  },
  volunteering: {
    icon: '🤝',
    title: 'Volunteering',
  },
  work: {
    icon: '🏢',
    title: 'Work Experience',
  },
  certifications: {
    icon: '🏆',
    title: 'Certifications',
  },
  extracurricular: {
    icon: '⭐',
    title: 'Extracurricular Activities',
  },
};

type StudentProfileData = {
  fullName: string;
  email: string;
  qualification: string;
  yearOfStudy: string;
  campus: string;
  bio: string;
};

const DEFAULT_PROFILE: StudentProfileData = {
  fullName: 'Student Name',
  email: 'student@example.com',
  qualification: 'BSc Data Science',
  yearOfStudy: '2nd Year',
  campus: 'Richfield Campus',
  bio: 'Aspiring data professional interested in technology, analytics and artificial intelligence.',
};

export default function StudentProfile() {
  const [fullName, setFullName] = useState(
    DEFAULT_PROFILE.fullName
  );

  const [email, setEmail] = useState(
    DEFAULT_PROFILE.email
  );

  const [qualification, setQualification] = useState(
    DEFAULT_PROFILE.qualification
  );

  const [yearOfStudy, setYearOfStudy] = useState(
    DEFAULT_PROFILE.yearOfStudy
  );

  const [campus, setCampus] = useState(
    DEFAULT_PROFILE.campus
  );

  const [bio, setBio] = useState(
    DEFAULT_PROFILE.bio
  );

  const [isEditing, setIsEditing] = useState(false);

  const [experience, setExperience] = useState<string[]>([]);
  const [loadingExperience, setLoadingExperience] =
    useState(true);

  const [connectionCount, setConnectionCount] =
    useState(0);

  const [pendingCount, setPendingCount] =
    useState(0);

  const loadData = async () => {
    try {
      const savedProfile =
        await AsyncStorage.getItem(
          PROFILE_STORAGE_KEY
        );

      if (savedProfile) {
        const parsedProfile: StudentProfileData =
          JSON.parse(savedProfile);

        setFullName(
          parsedProfile.fullName ||
            DEFAULT_PROFILE.fullName
        );

        setEmail(
          parsedProfile.email ||
            DEFAULT_PROFILE.email
        );

        setQualification(
          parsedProfile.qualification ||
            DEFAULT_PROFILE.qualification
        );

        setYearOfStudy(
          parsedProfile.yearOfStudy ||
            DEFAULT_PROFILE.yearOfStudy
        );

        setCampus(
          parsedProfile.campus ||
            DEFAULT_PROFILE.campus
        );

        setBio(
          parsedProfile.bio ||
            DEFAULT_PROFILE.bio
        );
      }

      const savedExperience =
        await AsyncStorage.getItem(
          EXPERIENCE_STORAGE_KEY
        );

      if (savedExperience) {
        const parsedExperience =
          JSON.parse(savedExperience);

        if (Array.isArray(parsedExperience)) {
          setExperience(parsedExperience);
        } else {
          setExperience([]);
        }
      } else {
        setExperience([]);
      }

      const savedConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      if (savedConnections) {
        const parsedConnections =
          JSON.parse(savedConnections);

        if (Array.isArray(parsedConnections)) {
          setConnectionCount(
            parsedConnections.length
          );
        } else {
          setConnectionCount(0);
        }
      } else {
        setConnectionCount(0);
      }

      const savedRequests =
        await AsyncStorage.getItem(
          REQUESTS_KEY
        );

      if (savedRequests) {
        const parsedRequests =
          JSON.parse(savedRequests);

        if (Array.isArray(parsedRequests)) {
          setPendingCount(
            parsedRequests.length
          );
        } else {
          setPendingCount(0);
        }
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.log(
        'Error loading profile data:',
        error
      );

      setExperience([]);
      setConnectionCount(0);
      setPendingCount(0);
    } finally {
      setLoadingExperience(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshData = async () => {
        try {
          const savedProfile =
            await AsyncStorage.getItem(
              PROFILE_STORAGE_KEY
            );

          if (
            savedProfile &&
            isActive
          ) {
            const parsedProfile: StudentProfileData =
              JSON.parse(savedProfile);

            setFullName(
              parsedProfile.fullName ||
                DEFAULT_PROFILE.fullName
            );

            setEmail(
              parsedProfile.email ||
                DEFAULT_PROFILE.email
            );

            setQualification(
              parsedProfile.qualification ||
                DEFAULT_PROFILE.qualification
            );

            setYearOfStudy(
              parsedProfile.yearOfStudy ||
                DEFAULT_PROFILE.yearOfStudy
            );

            setCampus(
              parsedProfile.campus ||
                DEFAULT_PROFILE.campus
            );

            setBio(
              parsedProfile.bio ||
                DEFAULT_PROFILE.bio
            );
          }

          const savedExperience =
            await AsyncStorage.getItem(
              EXPERIENCE_STORAGE_KEY
            );

          if (isActive) {
            if (savedExperience) {
              const parsedExperience =
                JSON.parse(savedExperience);

              setExperience(
                Array.isArray(parsedExperience)
                  ? parsedExperience
                  : []
              );
            } else {
              setExperience([]);
            }
          }

          const savedConnections =
            await AsyncStorage.getItem(
              CONNECTIONS_KEY
            );

          if (isActive) {
            if (savedConnections) {
              const parsedConnections =
                JSON.parse(savedConnections);

              setConnectionCount(
                Array.isArray(parsedConnections)
                  ? parsedConnections.length
                  : 0
              );
            } else {
              setConnectionCount(0);
            }
          }

          const savedRequests =
            await AsyncStorage.getItem(
              REQUESTS_KEY
            );

          if (isActive) {
            if (savedRequests) {
              const parsedRequests =
                JSON.parse(savedRequests);

              setPendingCount(
                Array.isArray(parsedRequests)
                  ? parsedRequests.length
                  : 0
              );
            } else {
              setPendingCount(0);
            }
          }
        } catch (error) {
          console.log(
            'Error refreshing profile:',
            error
          );

          if (isActive) {
            setExperience([]);
            setConnectionCount(0);
            setPendingCount(0);
          }
        } finally {
          if (isActive) {
            setLoadingExperience(false);
          }
        }
      };

      refreshData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = async () => {
    try {
      const savedProfile =
        await AsyncStorage.getItem(
          PROFILE_STORAGE_KEY
        );

      if (savedProfile) {
        const parsedProfile: StudentProfileData =
          JSON.parse(savedProfile);

        setFullName(
          parsedProfile.fullName ||
            DEFAULT_PROFILE.fullName
        );

        setEmail(
          parsedProfile.email ||
            DEFAULT_PROFILE.email
        );

        setQualification(
          parsedProfile.qualification ||
            DEFAULT_PROFILE.qualification
        );

        setYearOfStudy(
          parsedProfile.yearOfStudy ||
            DEFAULT_PROFILE.yearOfStudy
        );

        setCampus(
          parsedProfile.campus ||
            DEFAULT_PROFILE.campus
        );

        setBio(
          parsedProfile.bio ||
            DEFAULT_PROFILE.bio
        );
      } else {
        setFullName(DEFAULT_PROFILE.fullName);
        setEmail(DEFAULT_PROFILE.email);
        setQualification(
          DEFAULT_PROFILE.qualification
        );
        setYearOfStudy(
          DEFAULT_PROFILE.yearOfStudy
        );
        setCampus(DEFAULT_PROFILE.campus);
        setBio(DEFAULT_PROFILE.bio);
      }

      Keyboard.dismiss();
      setIsEditing(false);
    } catch (error) {
      console.log(
        'Error cancelling profile edit:',
        error
      );

      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProfile: StudentProfileData = {
        fullName: fullName.trim(),
        email: email.trim(),
        qualification: qualification.trim(),
        yearOfStudy: yearOfStudy.trim(),
        campus: campus.trim(),
        bio: bio.trim(),
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      setFullName(updatedProfile.fullName);
      setEmail(updatedProfile.email);
      setQualification(
        updatedProfile.qualification
      );
      setYearOfStudy(updatedProfile.yearOfStudy);
      setCampus(updatedProfile.campus);
      setBio(updatedProfile.bio);

      Keyboard.dismiss();
      setIsEditing(false);
    } catch (error) {
      console.log(
        'Error saving profile:',
        error
      );
    }
  };

  const initials =
    fullName.trim().length > 0
      ? fullName
          .trim()
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'ST';

  const completion =
    experience.length > 0 ? 90 : 80;

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Back */}
        <Pressable
          onPress={() => {
            Keyboard.dismiss();

            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                '/student/dashboard'
              );
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        {/* Professional Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {fullName}
          </Text>

          <Text style={styles.profileQualification}>
            {qualification}
          </Text>

          <Text style={styles.profileDetails}>
            {yearOfStudy} • {campus}
          </Text>

          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>
              CareerForgeAI Student
            </Text>
          </View>
        </View>

        {/* Edit / Save Controls */}
        <View style={styles.editControls}>
          {!isEditing ? (
            <Pressable
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </Pressable>
          ) : (
            <View style={styles.editModeButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveChangesButton}
                onPress={handleSave}
              >
                <Text style={styles.saveChangesText}>
                  Save Changes
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Profile Completion */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <View style={styles.completionTextContainer}>
              <Text style={styles.completionTitle}>
                Profile Completion
              </Text>

              <Text style={styles.completionSubtitle}>
                Keep your career information up to date
              </Text>
            </View>

            <Text style={styles.completionPercentage}>
              {completion}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completion}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Full Name
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <Text style={styles.detailValue}>
              {fullName}
            </Text>
          )}

          <Text style={styles.label}>
            Email Address
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <Text style={styles.detailValue}>
              {email}
            </Text>
          )}

          <Text style={styles.label}>
            Qualification
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={qualification}
              onChangeText={setQualification}
              placeholder="Enter your qualification"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <Text style={styles.detailValue}>
              {qualification}
            </Text>
          )}

          <Text style={styles.label}>
            Year of Study
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={yearOfStudy}
              onChangeText={setYearOfStudy}
              placeholder="Enter your year of study"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <Text style={styles.detailValue}>
              {yearOfStudy}
            </Text>
          )}

          <Text style={styles.label}>
            Campus
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={campus}
              onChangeText={setCampus}
              placeholder="Enter your campus"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          ) : (
            <Text style={styles.detailValue}>
              {campus}
            </Text>
          )}
        </View>

        {/* About Me */}
        <Text style={styles.sectionTitle}>
          About Me
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Professional Bio
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell employers about yourself..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>
              {bio}
            </Text>
          )}
        </View>

        {/* Experience */}
        <Text style={styles.sectionTitle}>
          Experience
        </Text>

        <View style={styles.experienceCard}>
          {loadingExperience ? (
            <Text style={styles.experienceLoading}>
              Loading experience...
            </Text>
          ) : experience.length === 0 ? (
            <>
              <View style={styles.emptyExperience}>
                <Text
                  style={styles.emptyExperienceIcon}
                >
                  💼
                </Text>

                <Text
                  style={styles.emptyExperienceTitle}
                >
                  No experience added yet
                </Text>

                <Text
                  style={styles.emptyExperienceText}
                >
                  Add internships, projects,
                  volunteering, work experience,
                  certifications or activities.
                </Text>
              </View>

              <Pressable
                style={styles.experienceButton}
                onPress={() =>
                  router.push(
                    '/student/experience'
                  )
                }
              >
                <Text
                  style={styles.experienceButtonText}
                >
                  Add Experience
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.experienceHeader}>
                <View>
                  <Text
                    style={styles.experienceCardTitle}
                  >
                    Your Experience
                  </Text>

                  <Text
                    style={styles.experienceCardSubtitle}
                  >
                    {experience.length} experience type
                    {experience.length !== 1
                      ? 's'
                      : ''}{' '}
                    selected
                  </Text>
                </View>

                <Text style={styles.experienceCount}>
                  {experience.length}
                </Text>
              </View>

              <View style={styles.experienceList}>
                {experience.map(
                  (experienceId) => {
                    const item =
                      EXPERIENCE_TYPES[
                        experienceId
                      ];

                    if (!item) {
                      return null;
                    }

                    return (
                      <View
                        key={experienceId}
                        style={
                          styles.experienceItem
                        }
                      >
                        <View
                          style={
                            styles.experienceItemIcon
                          }
                        >
                          <Text
                            style={
                              styles.experienceIconText
                            }
                          >
                            {item.icon}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.experienceItemText
                          }
                        >
                          {item.title}
                        </Text>

                        <Text
                          style={
                            styles.experienceCheck
                          }
                        >
                          ✓
                        </Text>
                      </View>
                    );
                  }
                )}
              </View>

              <Pressable
                style={styles.experienceButton}
                onPress={() =>
                  router.push(
                    '/student/experience'
                  )
                }
              >
                <Text
                  style={styles.experienceButtonText}
                >
                  Update Experience
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Career Profile */}
        <Text style={styles.sectionTitle}>
          Career Profile
        </Text>

        {/* Career Goals */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              🎯
            </Text>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Career Goals
              </Text>

              <Text style={styles.infoText}>
                Your selected career goals help
                CareerForgeAI personalise your
                roadmap.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                '/student/career-goals'
              )
            }
          >
            <Text style={styles.secondaryButtonText}>
              Update Career Goals
            </Text>
          </Pressable>
        </View>

        {/* Skills */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              💡
            </Text>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Skills
              </Text>

              <Text style={styles.infoText}>
                Add and manage the skills that you
                want employers to see.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/student/skills')
            }
          >
            <Text style={styles.secondaryButtonText}>
              Manage Skills
            </Text>
          </Pressable>
        </View>

        {/* Improve My CV */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              📄
            </Text>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Improve My CV
              </Text>

              <Text style={styles.infoText}>
                Review and improve the different
                sections of your CV to make your
                profile more attractive to employers.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/student/improve-cv')
            }
          >
            <Text style={styles.secondaryButtonText}>
              Improve My CV
            </Text>
          </Pressable>
        </View>

        {/* My Network */}
        <Text style={styles.sectionTitle}>
          My Network
        </Text>

        <View style={styles.networkCard}>
          <View style={styles.networkHeader}>
            <View style={styles.networkIcon}>
              <Text style={styles.networkIconText}>
                👥
              </Text>
            </View>

            <View style={styles.networkContent}>
              <Text style={styles.networkTitle}>
                Connections
              </Text>

              <Text style={styles.networkText}>
                Build your professional network with
                students, alumni and other CareerForgeAI
                members.
              </Text>
            </View>
          </View>

          <View style={styles.networkStats}>
            <View style={styles.networkStat}>
              <Text style={styles.networkStatNumber}>
                {connectionCount}
              </Text>

              <Text style={styles.networkStatLabel}>
                Connections
              </Text>
            </View>

            <View style={styles.networkDivider} />

            <View style={styles.networkStat}>
              <Text style={styles.networkStatNumber}>
                {pendingCount}
              </Text>

              <Text style={styles.networkStatLabel}>
                Pending
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.networkButton}
            onPress={() =>
              router.push('/student/connections')
            }
          >
            <Text style={styles.networkButtonText}>
              View My Network
            </Text>
          </Pressable>
        </View>

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>
            🔒 Profile Security
          </Text>

          <Text style={styles.securityText}>
            Your profile information is locked by
            default. Press Edit to make changes.
            Your changes are only applied when you
            select Save Changes.
          </Text>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            💡 Profile Tip
          </Text>

          <Text style={styles.tipText}>
            A complete profile helps you stand out
            to employers and improves the accuracy
            of your CareerForgeAI recommendations.
          </Text>
        </View>

        <Text style={styles.footer}>
          CareerForgeAI • Empowering Your Career
        </Text>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  backButton: {
    marginBottom: 18,
  },

  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 5,
  },

  profileQualification: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },

  profileDetails: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
  },

  studentBadge: {
    backgroundColor: '#E8F0F8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  studentBadgeText: {
    color: '#1E4B7A',
    fontSize: 11,
    fontWeight: '700',
  },

  editControls: {
    marginBottom: 20,
  },

  editButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  editModeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
  },

  saveChangesButton: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  saveChangesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },

  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  completionTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  completionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  completionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  completionPercentage: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803D',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#15803D',
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 7,
  },

  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 16,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },

  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },

  bioText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },

  experienceLoading: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    paddingVertical: 15,
  },

  emptyExperience: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  emptyExperienceIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  emptyExperienceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  emptyExperienceText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },

  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  experienceCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  experienceCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  experienceCount: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    color: '#0B1F3A',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '800',
    paddingTop: 8,
  },

  experienceList: {
    marginBottom: 15,
  },

  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 11,
    marginBottom: 9,
  },

  experienceItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  experienceIconText: {
    fontSize: 19,
  },

  experienceItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  experienceCheck: {
    fontSize: 17,
    fontWeight: '800',
    color: '#15803D',
  },

  experienceButton: {
    borderWidth: 1,
    borderColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  experienceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  infoIcon: {
    fontSize: 25,
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  networkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },

  networkHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  networkIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  networkIconText: {
    fontSize: 23,
  },

  networkContent: {
    flex: 1,
  },

  networkTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },

  networkText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  networkStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },

  networkStat: {
    flex: 1,
    alignItems: 'center',
  },

  networkStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  networkStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  networkDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },

  networkButton: {
    borderWidth: 1,
    borderColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  networkButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  securityCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 18,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  securityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  securityText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  tipCard: {
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  tipText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 25,
  },
});
