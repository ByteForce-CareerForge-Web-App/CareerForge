import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '@/constants/api';

const EXPERIENCE_STORAGE_KEY = 'careerforge_experience';

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

export default function Profile() {
  // ----------------------------------------------------------
  // Profile state
  // ----------------------------------------------------------

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [campus, setCampus] = useState('');
  const [bio, setBio] = useState('');

  // ----------------------------------------------------------
  // Loading / saving state
  // ----------------------------------------------------------

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // ----------------------------------------------------------
  // Experience state
  // ----------------------------------------------------------

  const [experience, setExperience] = useState<string[]>([]);
  const [loadingExperience, setLoadingExperience] = useState(true);

  // ----------------------------------------------------------
  // Get ordinal suffix
  // ----------------------------------------------------------

  const getOrdinal = (year: number): string => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  };

  // ----------------------------------------------------------
  // Load student profile from PHP API
  // ----------------------------------------------------------

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/profiles/student.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to load profile'
        );
      }

      const student = result.data;

      // ------------------------------------------------------
      // Populate profile fields
      // ------------------------------------------------------

      setFullName(student.name ?? '');
      setEmail(student.email ?? '');
      setQualification(student.qualification ?? '');

      if (student.year_of_study) {
        const year = Number(student.year_of_study);

        setYearOfStudy(
          `${year}${getOrdinal(year)} Year`
        );
      } else {
        setYearOfStudy('');
      }

      setCampus(student.campus ?? '');
      setBio(student.bio ?? '');

    } catch (error) {
      console.error('Load profile error:', error);

      Alert.alert(
        'Profile Error',
        error instanceof Error
          ? error.message
          : 'Failed to load your profile.'
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // ----------------------------------------------------------
  // Save student profile to PHP API
  // ----------------------------------------------------------

  const saveProfile = async () => {
    try {
      setSavingProfile(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      // ------------------------------------------------------
      // Convert "2nd Year" into 2
      // ------------------------------------------------------

      const yearMatch = yearOfStudy.match(/\d+/);
      const yearNumber = yearMatch
        ? Number(yearMatch[0])
        : NaN;

      // ------------------------------------------------------
      // Validate year
      // ------------------------------------------------------

      if (
        Number.isNaN(yearNumber) ||
        yearNumber < 1 ||
        yearNumber > 6
      ) {
        Alert.alert(
          'Invalid Year',
          'Please enter a valid year of study between 1 and 6.'
        );

        return;
      }

      // ------------------------------------------------------
      // Validate required fields
      // ------------------------------------------------------

      if (
        fullName.trim() === '' ||
        email.trim() === '' ||
        qualification.trim() === '' ||
        campus.trim() === ''
      ) {
        Alert.alert(
          'Missing Information',
          'Please complete your full name, email, qualification and campus.'
        );

        return;
      }

      // ------------------------------------------------------
      // Send PUT request
      // ------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/profiles/student.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            qualification: qualification.trim(),
            yearOfStudy: yearNumber,
            campus: campus.trim(),
            bio: bio.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to save profile'
        );
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully.'
      );

      // ------------------------------------------------------
      // Reload profile from database
      // ------------------------------------------------------

      await loadProfile();

    } catch (error) {
      console.error('Save profile error:', error);

      Alert.alert(
        'Save Error',
        error instanceof Error
          ? error.message
          : 'Failed to save your profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ----------------------------------------------------------
  // Load profile and experience whenever screen becomes active
  // ----------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        // Load real profile from backend
        await loadProfile();

        // Load temporary experience data
        try {
          const savedExperience =
            await AsyncStorage.getItem(
              EXPERIENCE_STORAGE_KEY
            );

          console.log(
            'Saved Experience:',
            savedExperience
          );

          if (!isActive) {
            return;
          }

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

        } catch (error) {
          console.error(
            'Error loading experience:',
            error
          );

          if (isActive) {
            setExperience([]);
          }
        } finally {
          if (isActive) {
            setLoadingExperience(false);
          }
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // ----------------------------------------------------------
  // Profile completion
  // ----------------------------------------------------------

  const profileCompletion =
    experience.length > 0 ? '90%' : '80%';

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {fullName
              ? fullName.charAt(0).toUpperCase()
              : '?'}
          </Text>
        </View>

        <Text style={styles.title}>
          My Profile
        </Text>

        <Text style={styles.subtitle}>
          Build a strong profile to improve your career
          opportunities.
        </Text>
      </View>

      {/* Loading Profile */}
      {loadingProfile && (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>
            Loading your profile...
          </Text>
        </View>
      )}

      {/* Profile Completion */}
      <View style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <View>
            <Text style={styles.completionTitle}>
              Profile Completion
            </Text>

            <Text style={styles.completionSubtitle}>
              Keep your profile up to date
            </Text>
          </View>

          <Text style={styles.completionPercentage}>
            {profileCompletion}
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: profileCompletion,
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

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#94A3B8"
          editable={!loadingProfile}
        />

        <Text style={styles.label}>
          Email Address
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loadingProfile}
        />

        <Text style={styles.label}>
          Qualification
        </Text>

        <TextInput
          style={styles.input}
          value={qualification}
          onChangeText={setQualification}
          placeholder="Enter your qualification"
          placeholderTextColor="#94A3B8"
          editable={!loadingProfile}
        />

        <Text style={styles.label}>
          Year of Study
        </Text>

        <TextInput
          style={styles.input}
          value={yearOfStudy}
          onChangeText={setYearOfStudy}
          placeholder="Example: 2nd Year"
          placeholderTextColor="#94A3B8"
          editable={!loadingProfile}
        />

        <Text style={styles.label}>
          Campus
        </Text>

        <TextInput
          style={styles.input}
          value={campus}
          onChangeText={setCampus}
          placeholder="Enter your campus"
          placeholderTextColor="#94A3B8"
          editable={!loadingProfile}
        />
      </View>

      {/* About Me */}
      <Text style={styles.sectionTitle}>
        About Me
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Professional Bio
        </Text>

        <TextInput
          style={styles.textArea}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell employers about yourself..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!loadingProfile}
        />
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
              <Text style={styles.emptyExperienceIcon}>
                💼
              </Text>

              <Text style={styles.emptyExperienceTitle}>
                No experience added yet
              </Text>

              <Text style={styles.emptyExperienceText}>
                Add internships, projects, volunteering,
                work experience, certifications or
                activities.
              </Text>
            </View>

            <Pressable
              style={styles.experienceButton}
              onPress={() =>
                router.push('/student/experience')
              }
            >
              <Text style={styles.experienceButtonText}>
                Add Experience
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.experienceHeader}>
              <View>
                <Text style={styles.experienceCardTitle}>
                  Your Experience
                </Text>

                <Text style={styles.experienceCardSubtitle}>
                  {experience.length} experience type
                  {experience.length !== 1 ? 's' : ''}{' '}
                  selected
                </Text>
              </View>

              <Text style={styles.experienceCount}>
                {experience.length}
              </Text>
            </View>

            <View style={styles.experienceList}>
              {experience.map((experienceId) => {
                const item =
                  EXPERIENCE_TYPES[experienceId];

                if (!item) {
                  return null;
                }

                return (
                  <View
                    key={experienceId}
                    style={styles.experienceItem}
                  >
                    <View
                      style={styles.experienceItemIcon}
                    >
                      <Text
                        style={styles.experienceIconText}
                      >
                        {item.icon}
                      </Text>
                    </View>

                    <Text
                      style={styles.experienceItemText}
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={styles.experienceCheck}
                    >
                      ✓
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              style={styles.experienceButton}
              onPress={() =>
                router.push('/student/experience')
              }
            >
              <Text style={styles.experienceButtonText}>
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
              Your selected career goals help CareerForgeAI
              personalise your roadmap.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            router.push('/career-goals')
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
              Add and manage the skills that you want
              employers to see.
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

      {/* Save Profile */}
      <Pressable
        style={[
          styles.saveButton,
          savingProfile && styles.saveButtonDisabled,
        ]}
        onPress={saveProfile}
        disabled={savingProfile || loadingProfile}
      >
        <Text style={styles.saveButtonText}>
          {savingProfile
            ? 'Saving...'
            : 'Save Profile'}
        </Text>
      </Pressable>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          💡 Profile Tip
        </Text>

        <Text style={styles.tipText}>
          A complete profile helps you stand out to
          employers and improves the accuracy of your
          CareerForgeAI recommendations.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        CareerForgeAI • Empowering Your Career
      </Text>
    </ScrollView>
  );
}

// ==========================================================
// Styles
// ==========================================================

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
    color: '#4F46E5',
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },

  loadingCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },

  loadingText: {
    textAlign: 'center',
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#4F46E5',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
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
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
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
    backgroundColor: '#EDE9FE',
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
    color: '#16A34A',
  },

  experienceButton: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  experienceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
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
    borderColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },

  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  tipCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3730A3',
    marginBottom: 7,
  },

  tipText: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 25,
  },
});