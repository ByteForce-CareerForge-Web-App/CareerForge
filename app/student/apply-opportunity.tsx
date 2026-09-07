import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const APPLICATIONS_KEY = 'careerforge_applications';

type SelectedFile = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

export default function ApplyOpportunity() {
  const params = useLocalSearchParams();

  const opportunityId =
    typeof params.id === 'string'
      ? params.id
      : typeof params.opportunityId === 'string'
      ? params.opportunityId
      : `${params.title || 'opportunity'}-${params.company || 'company'}`;

  const title =
    typeof params.title === 'string'
      ? params.title
      : 'Junior Data Analyst';

  const company =
    typeof params.company === 'string'
      ? params.company
      : 'Tech Solutions';

  const location =
    typeof params.location === 'string'
      ? params.location
      : 'Durban, KZN';

  const type =
    typeof params.type === 'string'
      ? params.type
      : 'Jobs';

  const match =
    typeof params.match === 'string'
      ? params.match
      : '94';

  const description =
    typeof params.description === 'string'
      ? params.description
      : 'Analyse business data and create insights to support decision-making.';

  const [fullName, setFullName] = useState('Student Name');
  const [email, setEmail] = useState('student@example.com');
  const [coverLetter, setCoverLetter] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] =
    useState<SelectedFile | null>(null);

  const [isPickingFile, setIsPickingFile] =
    useState(false);

  const handlePickFile = async () => {
    try {
      setIsPickingFile(true);

      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/*',
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset) {
        return;
      }

      setSelectedFile({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType,
        size: asset.size,
      });
    } catch (error) {
      console.log('Error selecting file:', error);

      Alert.alert(
        'Upload Error',
        'The file could not be selected. Please try again.'
      );
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
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

    try {
      const existingApplications =
        await AsyncStorage.getItem(APPLICATIONS_KEY);

      const applications = existingApplications
        ? JSON.parse(existingApplications)
        : [];

      // Prevent duplicate applications
      const alreadyApplied = applications.some(
        (application: any) =>
          application.opportunityId === opportunityId ||
          (
            application.title === title &&
            application.company === company &&
            application.email === email.trim()
          )
      );

      if (alreadyApplied) {
        Alert.alert(
          'Already Applied',
          `You have already submitted an application for ${title} at ${company}.`,
          [
            {
              text: 'View My Applications',
              onPress: () =>
                router.replace('/student/applications'),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );

        return;
      }

      const newApplication = {
        id: `${Date.now()}`,

        // Opportunity information
        opportunityId,
        title,
        company,
        location,
        type,
        match,
        description,

        // Student information
        fullName: fullName.trim(),
        email: email.trim(),

        // Application information
        coverLetter: coverLetter.trim(),
        notes: notes.trim(),

        // Uploaded attachment
        attachment: selectedFile
          ? {
              name: selectedFile.name,
              uri: selectedFile.uri,
              mimeType: selectedFile.mimeType || '',
              size: selectedFile.size || 0,
            }
          : null,

        // Business-side fields
        name: fullName.trim(),
        initials: fullName
          .trim()
          .split(' ')
          .filter(Boolean)
          .map(
            (part: string) =>
              part.charAt(0)
          )
          .join('')
          .slice(0, 2)
          .toUpperCase(),

        qualification: 'BSc Data Science',
        status: 'Under Review',
        applied: 'Just now',

        // Student-side date
        date: new Date().toLocaleDateString(
          'en-GB',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
        ),

        submittedAt: new Date().toISOString(),
      };

      const updatedApplications = [
        newApplication,
        ...applications,
      ];

      await AsyncStorage.setItem(
        APPLICATIONS_KEY,
        JSON.stringify(updatedApplications)
      );

      Alert.alert(
        'Application Submitted 🎉',
        `Your application for ${title} at ${company} has been submitted successfully.`,
        [
          {
            text: 'View My Applications',
            onPress: () =>
              router.replace('/student/applications'),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Error saving application:',
        error
      );

      Alert.alert(
        'Something went wrong',
        'Your application could not be saved. Please try again.'
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
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
      <View style={styles.opportunityCard}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>💼</Text>
        </View>

        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>
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
        <Text style={styles.sectionTitle}>
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

      {/* CV / Resume Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          CV / Resume
        </Text>

        {!selectedFile ? (
          <Pressable
            style={styles.uploadBox}
            onPress={handlePickFile}
            disabled={isPickingFile}
          >
            <Text style={styles.uploadIcon}>
              📎
            </Text>

            <Text style={styles.uploadTitle}>
              {isPickingFile
                ? 'Opening files...'
                : 'Upload Your CV'}
            </Text>

            <Text style={styles.uploadSubtitle}>
              PDF, DOCX or image
            </Text>

            <Text style={styles.uploadHint}>
              Tap to choose a file from your device
            </Text>
          </Pressable>
        ) : (
          <View style={styles.selectedFileCard}>
            <View style={styles.fileIconBox}>
              <Text style={styles.fileIcon}>
                {selectedFile.mimeType?.startsWith(
                  'image/'
                )
                  ? '🖼️'
                  : '📄'}
              </Text>
            </View>

            <View style={styles.fileInfo}>
              <Text
                style={styles.fileName}
                numberOfLines={2}
              >
                {selectedFile.name}
              </Text>

              <Text style={styles.fileStatus}>
                Attachment selected ✓
              </Text>
            </View>

            <Pressable
              style={styles.removeFileButton}
              onPress={handleRemoveFile}
            >
              <Text style={styles.removeFileText}>
                ✕
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.fileNote}>
          Your attachment will be included with your
          application. The backend can handle the actual
          upload when it is connected.
        </Text>
      </View>

      {/* Cover Letter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Cover Letter
        </Text>

        <Text style={styles.helperText}>
          Explain why you are a good fit for this opportunity.
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
        <Text style={styles.sectionTitle}>
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
        <Text style={styles.tipIcon}>💡</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            CareerForgeAI Tip
          </Text>

          <Text style={styles.tipText}>
            Tailor your application to the opportunity and
            highlight the skills that match the job requirements.
          </Text>
        </View>
      </View>

      {/* Submit */}
      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>
          Submit Application
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

      <Text style={styles.footer}>
        CareerForgeAI • Empowering your career journey
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
    fontSize: 13,
    color: '#555',
    marginTop: 5,
    fontWeight: '600',
  },

  uploadHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },

  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D5FF',
    backgroundColor: '#FAF9FF',
    borderRadius: 14,
    padding: 12,
  },

  fileIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EEE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  fileIcon: {
    fontSize: 22,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
  },

  fileStatus: {
    fontSize: 12,
    color: '#6C4FF7',
    marginTop: 4,
    fontWeight: '600',
  },

  removeFileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  removeFileText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '700',
  },

  fileNote: {
    fontSize: 11,
    color: '#888',
    marginTop: 10,
    lineHeight: 16,
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