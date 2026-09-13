import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';

export default function ApplyOpportunity() {
  const params = useLocalSearchParams();

  const id =
    typeof params.id === 'string'
      ? params.id
      : '';

  const title =
    typeof params.title === 'string'
      ? params.title
      : 'Opportunity';

  const company =
    typeof params.company === 'string'
      ? params.company
      : 'Company';

  const location =
    typeof params.location === 'string'
      ? params.location
      : 'Location';

  const type =
    typeof params.type === 'string'
      ? params.type
      : 'Job';

  const description =
    typeof params.description === 'string'
      ? params.description
      : '';

  const deadline =
    typeof params.deadline === 'string'
      ? params.deadline
      : '';

  const [fullName, setFullName] =
    useState('Student Name');

  const [email, setEmail] =
    useState('student@example.com');

  const [coverLetter, setCoverLetter] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (!id) {
      Alert.alert(
        'Unable to Apply',
        'The opportunity ID is missing. Please go back and try again.'
      );
      return;
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
      !coverLetter.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete your name, email and cover letter before submitting.'
      );
      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Get the authentication token created during login.
       */
      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please log in again before submitting an application.',
          [
            {
              text: 'Go to Login',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      /*
       * Submit the application to the PHP API.
       *
       * The backend gets the student ID from
       * the authentication token.
       *
       * We only send the opportunity ID.
       */
      const response = await fetch(
        `${API_BASE_URL}/applications.php`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            opportunity_id:
              Number(id),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        'Application API response:',
        data
      );

      /*
       * Duplicate application.
       */
      if (
        response.status === 409 ||
        data.message ===
          'You have already applied for this opportunity'
      ) {
        Alert.alert(
          'Already Applied',
          `You have already submitted an application for ${title} at ${company}.`,
          [
            {
              text: 'View My Applications',
              onPress: () =>
                router.replace(
                  '/student/applications'
                ),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );

        return;
      }

      /*
       * Authentication failure.
       */
      if (
        response.status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again before submitting an application.',
          [
            {
              text: 'Go to Login',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      /*
       * Any other API error.
       */
      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to submit application.'
        );
      }

      /*
       * Keep a local copy as well so the
       * existing Applications screen can
       * still display the application until
       * we connect that screen to the API.
       */
      try {
        const existingApplications =
          await AsyncStorage.getItem(
            'careerforge_applications'
          );

        const applications =
          existingApplications
            ? JSON.parse(
                existingApplications
              )
            : [];

        const newApplication = {
          id:
            data.application_id
              ? String(
                  data.application_id
                )
              : `${Date.now()}`,

          opportunity_id:
            Number(id),

          title,
          company,
          location,
          type,
          description,
          deadline,

          fullName,
          email,
          coverLetter,
          notes,

          date:
            new Date()
              .toISOString()
              .split('T')[0],

          status: 'Submitted',
        };

        const updatedApplications =
          [
            newApplication,
            ...applications,
          ];

        await AsyncStorage.setItem(
          'careerforge_applications',
          JSON.stringify(
            updatedApplications
          )
        );
      } catch (localStorageError) {
        console.log(
          'Local application storage error:',
          localStorageError
        );
      }

      /*
       * Application successfully created
       * in the database.
       */
      Alert.alert(
        'Application Submitted 🎉',
        `Your application for ${title} at ${company} has been submitted successfully.`,
        [
          {
            text: 'View My Applications',
            onPress: () =>
              router.replace(
                '/student/applications'
              ),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Application submission error:',
        error
      );

      Alert.alert(
        'Something went wrong',
        error instanceof Error
          ? error.message
          : 'Your application could not be submitted. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </Pressable>

        <View>
          <Text style={styles.title}>
            Apply for Opportunity
          </Text>

          <Text style={styles.subtitle}>
            Submit your application
          </Text>
        </View>
      </View>

      {/* Opportunity Card */}
      <View
        style={styles.opportunityCard}
      >
        <View style={styles.iconBox}>
          <Text style={styles.icon}>
            💼
          </Text>
        </View>

        <View
          style={styles.opportunityInfo}
        >
          <Text
            style={
              styles.opportunityTitle
            }
          >
            {title}
          </Text>

          <Text style={styles.company}>
            {company}
          </Text>

          <Text style={styles.location}>
            📍 {location}
          </Text>
        </View>
      </View>

      {/* Application Information */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          Your Information
        </Text>

        <Text style={styles.label}>
          Full Name
        </Text>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>
          Email Address
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* CV */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          CV / Resume
        </Text>

        <Pressable
          style={styles.uploadBox}
        >
          <Text
            style={styles.uploadIcon}
          >
            📄
          </Text>

          <Text
            style={styles.uploadTitle}
          >
            Upload Your CV
          </Text>

          <Text
            style={styles.uploadSubtitle}
          >
            PDF or DOCX • Frontend demo
          </Text>
        </Pressable>
      </View>

      {/* Cover Letter */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          Cover Letter
        </Text>

        <Text
          style={styles.helperText}
        >
          Explain why you are a good fit
          for this opportunity.
        </Text>

        <TextInput
          style={styles.textArea}
          value={coverLetter}
          onChangeText={setCoverLetter}
          placeholder="Write your cover letter here..."
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Additional Notes */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          Additional Notes
        </Text>

        <TextInput
          style={styles.textAreaSmall}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything else you would like the employer to know?"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Application Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>
          💡
        </Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            CareerForgeAI Tip
          </Text>

          <Text style={styles.tipText}>
            Tailor your application to the
            opportunity and highlight the
            skills that match the job
            requirements.
          </Text>
        </View>
      </View>

      {/* Submit */}
      <Pressable
        style={[
          styles.submitButton,
          submitting &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <View
            style={
              styles.submitLoading
            }
          >
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text
              style={
                styles.submitButtonText
              }
            >
              Submitting...
            </Text>
          </View>
        ) : (
          <Text
            style={
              styles.submitButtonText
            }
          >
            Submit Application
          </Text>
        )}
      </Pressable>

      {/* Cancel */}
      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={submitting}
      >
        <Text
          style={styles.cancelButtonText}
        >
          Cancel
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        CareerForgeAI • Empowering your
        career journey
      </Text>
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    fontSize: 30,
    color: '#333',
    marginTop: -3,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1F1F2E',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: '#F0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 27,
  },

  opportunityInfo: {
    flex: 1,
  },

  opportunityTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222',
  },

  company: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },

  location: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E1E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
    marginBottom: 15,
    backgroundColor: '#FAFAFC',
  },

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9B8AFB',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    backgroundColor: '#FAF9FF',
  },

  uploadIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F3DBA',
  },

  uploadSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },

  helperText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
    lineHeight: 19,
  },

  textArea: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E1E1E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#FAFAFC',
  },

  textAreaSmall: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E1E1E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#FAFAFC',
  },

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },

  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7A5A00',
    marginBottom: 4,
  },

  tipText: {
    fontSize: 13,
    color: '#6D5B27',
    lineHeight: 19,
  },

  submitButton: {
    backgroundColor: '#6C4FF7',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E8',
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 25,
  },
});

