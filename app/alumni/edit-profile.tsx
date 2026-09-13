import React, { useCallback, useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';

const ALUMNI_PROFILE_KEY = 'careerforge_alumni_profile';

type AlumniProfileData = {
  fullName: string;
  email: string;
  qualification: string;
  graduationYear: string;
  institution: string;
  currentCompany: string;
  currentPosition: string;
  skills: string;
  experience: string;
};

type AlumniApiProfile = {
  id?: number;
  profile_id?: number | null;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  qualification?: string;
  graduation_year?: number | null;
  company?: string;
  position?: string;
  verified?: boolean;
  certificate_path?: string | null;
};

const DEFAULT_PROFILE: AlumniProfileData = {
  fullName: 'Alumni Member',
  email: 'alumni@careerforge.ai',
  qualification: 'BSc Data Science',
  graduationYear: '2026',
  institution: 'Richfield Graduate Institute',
  currentCompany: '',
  currentPosition: '',
  skills: 'Python, Data Science, SQL, Machine Learning, React',
  experience: '',
};

export default function EditAlumniProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [institution, setInstitution] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      /*
       * First load the locally stored extra fields.
       * Institution, skills and experience are not currently
       * supported by the alumni backend endpoint.
       */
      const savedProfile = await AsyncStorage.getItem(
        ALUMNI_PROFILE_KEY
      );

      let localProfile: AlumniProfileData = DEFAULT_PROFILE;

      if (savedProfile) {
        try {
          localProfile = {
            ...DEFAULT_PROFILE,
            ...JSON.parse(savedProfile),
          };
        } catch (error) {
          console.log(
            'Error parsing saved alumni profile:',
            error
          );
        }
      }

      /*
       * Set local values first so the screen can still display
       * something even if the backend request fails.
       */
      setFullName(localProfile.fullName);
      setEmail(localProfile.email);
      setQualification(localProfile.qualification);
      setGraduationYear(localProfile.graduationYear);
      setInstitution(localProfile.institution);
      setCurrentCompany(localProfile.currentCompany);
      setCurrentPosition(localProfile.currentPosition);
      setSkills(localProfile.skills);
      setExperience(localProfile.experience);

      /*
       * Load the actual alumni profile from the backend.
       */
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.log('No authentication token found.');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/profiles/alumni.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();

      console.log('ALUMNI PROFILE RESPONSE:', result);

      if (!response.ok || !result.success) {
        console.log(
          'Failed to load alumni profile:',
          result.message
        );
        return;
      }

      const profile: AlumniApiProfile = result.data;

      /*
       * Backend values take priority for fields that are
       * actually stored in the database.
       */
      setFullName(
        profile.name ?? localProfile.fullName
      );

      setEmail(
        profile.email ?? localProfile.email
      );

      setQualification(
        profile.qualification ??
          localProfile.qualification
      );

      setGraduationYear(
        profile.graduation_year !== null &&
        profile.graduation_year !== undefined
          ? String(profile.graduation_year)
          : localProfile.graduationYear
      );

      setCurrentCompany(
        profile.company ?? localProfile.currentCompany
      );

      setCurrentPosition(
        profile.position ?? localProfile.currentPosition
      );

      /*
       * Keep these local because the current backend endpoint
       * does not store them yet.
       */
      setInstitution(localProfile.institution);
      setSkills(localProfile.skills);
      setExperience(localProfile.experience);

      /*
       * Update local storage with the latest backend data
       * while preserving the extra local fields.
       */
      const updatedLocalProfile: AlumniProfileData = {
        fullName:
          profile.name ?? localProfile.fullName,

        email:
          profile.email ?? localProfile.email,

        qualification:
          profile.qualification ??
          localProfile.qualification,

        graduationYear:
          profile.graduation_year !== null &&
          profile.graduation_year !== undefined
            ? String(profile.graduation_year)
            : localProfile.graduationYear,

        institution: localProfile.institution,

        currentCompany:
          profile.company ??
          localProfile.currentCompany,

        currentPosition:
          profile.position ??
          localProfile.currentPosition,

        skills: localProfile.skills,

        experience: localProfile.experience,
      };

      await AsyncStorage.setItem(
        ALUMNI_PROFILE_KEY,
        JSON.stringify(updatedLocalProfile)
      );
    } catch (error) {
      console.log(
        'Error loading alumni profile:',
        error
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your full name.'
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your email address.'
      );
      return;
    }

    if (!qualification.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your qualification.'
      );
      return;
    }

    if (!graduationYear.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your graduation year.'
      );
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.'
        );
        return;
      }

      /*
       * Send only fields supported by the current
       * api/profiles/alumni.php endpoint.
       */
      const response = await fetch(
        `${API_BASE_URL}/profiles/alumni.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: fullName.trim(),
            qualification: qualification.trim(),
            graduation_year: Number(
              graduationYear.trim()
            ),
            company: currentCompany.trim(),
            position: currentPosition.trim(),
          }),
        }
      );

      const result = await response.json();

      console.log('ALUMNI PROFILE UPDATE:', result);

      if (!response.ok || !result.success) {
        Alert.alert(
          'Save Failed',
          result.message ||
            'Unable to update your profile.'
        );
        return;
      }

      /*
       * Save the complete screen state locally as well.
       * This preserves institution, skills and experience
       * until those fields are connected to the backend.
       */
      const profile: AlumniProfileData = {
        fullName: fullName.trim(),
        email: email.trim(),
        qualification: qualification.trim(),
        graduationYear: graduationYear.trim(),
        institution: institution.trim(),
        currentCompany: currentCompany.trim(),
        currentPosition: currentPosition.trim(),
        skills: skills.trim(),
        experience: experience.trim(),
      };

      await AsyncStorage.setItem(
        ALUMNI_PROFILE_KEY,
        JSON.stringify(profile)
      );

      const checkSavedProfile =
        await AsyncStorage.getItem(
          ALUMNI_PROFILE_KEY
        );

      console.log(
        'PROFILE SAVED:',
        checkSavedProfile
      );

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/alumni/profile');
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(
        'Error saving alumni profile:',
        error
      );

      Alert.alert(
        'Save Failed',
        'Something went wrong while saving your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.title}>
            Update Your Profile
          </Text>

          <Text style={styles.subtitle}>
            Keep your professional information up to date
            to receive better career opportunities.
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
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
          />
        </View>

        {/* Education */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Education
          </Text>

          <Text style={styles.label}>
            Qualification
          </Text>

          <TextInput
            style={styles.input}
            value={qualification}
            onChangeText={setQualification}
            placeholder="e.g. BSc Data Science"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Graduation Year
          </Text>

          <TextInput
            style={styles.input}
            value={graduationYear}
            onChangeText={setGraduationYear}
            placeholder="e.g. 2026"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={4}
          />

          <Text style={styles.label}>
            Institution
          </Text>

          <TextInput
            style={styles.input}
            value={institution}
            onChangeText={setInstitution}
            placeholder="Enter your institution"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Career */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Career
          </Text>

          <Text style={styles.label}>
            Current Company
          </Text>

          <TextInput
            style={styles.input}
            value={currentCompany}
            onChangeText={setCurrentCompany}
            placeholder="Enter your current company"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Current Position
          </Text>

          <TextInput
            style={styles.input}
            value={currentPosition}
            onChangeText={setCurrentPosition}
            placeholder="e.g. Data Analyst"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Skills
          </Text>

          <Text style={styles.helperText}>
            Separate your skills with commas.
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={skills}
            onChangeText={setSkills}
            placeholder="Python, SQL, React..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Experience */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Professional Experience
          </Text>

          <Text style={styles.helperText}>
            Add your previous jobs, internships, projects
            or other relevant professional experience.
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.experienceInput,
            ]}
            value={experience}
            onChangeText={setExperience}
            placeholder="Describe your professional experience..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Documents
          </Text>

          <Pressable
            style={styles.documentButton}
            onPress={() => {
              Alert.alert(
                'CV Upload',
                'CV upload will be connected when we add document storage.'
              );
            }}
          >
            <Text style={styles.documentIcon}>
              +
            </Text>

            <View
              style={styles.documentTextContainer}
            >
              <Text style={styles.documentTitle}>
                Upload CV / Resume
              </Text>

              <Text
                style={styles.documentDescription}
              >
                Add your latest CV to your profile.
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>

          <Pressable
            style={styles.documentButton}
            onPress={() => {
              Alert.alert(
                'Certificate Upload',
                'Degree certificate upload will be connected when document verification is added.'
              );
            }}
          >
            <Text style={styles.documentIcon}>
              +
            </Text>

            <View
              style={styles.documentTextContainer}
            >
              <Text style={styles.documentTitle}>
                Upload Degree Certificate
              </Text>

              <Text
                style={styles.documentDescription}
              >
                Add your qualification certificate.
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingBottom: 30,
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#4F46E5',
    lineHeight: 42,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  headerSpacer: {
    width: 45,
  },

  intro: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    marginTop: 7,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    fontSize: 15,
  },

  multilineInput: {
    height: 100,
    paddingTop: 14,
  },

  experienceInput: {
    height: 140,
    paddingTop: 14,
  },

  helperText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },

  documentButton: {
    minHeight: 75,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  documentIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
  },

  documentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  documentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  documentDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#9CA3AF',
  },

  saveButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginTop: 22,
    height: 55,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});

