import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { router } from 'expo-router';

export default function EditAlumniProfile() {
  const [fullName, setFullName] = useState('Alumni Member');
  const [email, setEmail] = useState('alumni@careerforge.ai');

  const [qualification, setQualification] =
    useState('BSc Data Science');

  const [graduationYear, setGraduationYear] =
    useState('2026');

  const [institution, setInstitution] =
    useState('Richfield Graduate Institute');

  const [currentCompany, setCurrentCompany] =
    useState('');

  const [currentPosition, setCurrentPosition] =
    useState('');

  const [skills, setSkills] =
    useState('Python, Data Science, SQL, Machine Learning, React');

  const [experience, setExperience] =
    useState('');

  function handleSave() {
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

    /*
     * TEMPORARY FRONTEND SAVE
     *
     * Later this information will be sent to the
     * CareerForge backend and stored in the database.
     */

    console.log('Updated Alumni Profile:', {
      fullName,
      email,
      qualification,
      graduationYear,
      institution,
      currentCompany,
      currentPosition,
      skills,
      experience,
    });

    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

            <View style={styles.documentTextContainer}>
              <Text style={styles.documentTitle}>
                Upload CV / Resume
              </Text>

              <Text style={styles.documentDescription}>
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

            <View style={styles.documentTextContainer}>
              <Text style={styles.documentTitle}>
                Upload Degree Certificate
              </Text>

              <Text style={styles.documentDescription}>
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
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            Save Changes
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
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

