import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#2457E6"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              CAREERFORGEAI • STUDENT
            </Text>

            <Text style={styles.title}>
              Apply for Opportunity
            </Text>

            <Text style={styles.subtitle}>
              Submit your application
            </Text>
          </View>
        </View>

        {/* =========================
            OPPORTUNITY CARD
        ========================= */}

        <View style={styles.opportunityCard}>
          <View style={styles.opportunityAccent} />

          <View style={styles.opportunityContent}>
            <View style={styles.iconBox}>
              <Ionicons
                name="briefcase-outline"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.opportunityInfo}>
              <Text style={styles.opportunityEyebrow}>
                OPPORTUNITY
              </Text>

              <Text style={styles.opportunityTitle}>
                {title}
              </Text>

              <View style={styles.companyRow}>
                <Ionicons
                  name="business-outline"
                  size={14}
                  color="#D9E2F2"
                />

                <Text style={styles.company}>
                  {company}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#8FB0FF"
                />

                <Text style={styles.location}>
                  {location}
                </Text>
              </View>
            </View>

            <View style={styles.matchBadge}>
              <Text style={styles.matchNumber}>
                {match}%
              </Text>

              <Text style={styles.matchLabel}>
                MATCH
              </Text>
            </View>
          </View>

          <View style={styles.opportunityFooter}>
            <View style={styles.typeBadge}>
              <Ionicons
                name="briefcase-outline"
                size={12}
                color="#2457E6"
              />

              <Text style={styles.typeText}>
                {type}
              </Text>
            </View>

            <View style={styles.fitText}>
              <Ionicons
                name="sparkles-outline"
                size={13}
                color="#6B8FFF"
              />

              <Text style={styles.fitLabel}>
                AI matched opportunity
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            YOUR INFORMATION
        ========================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <View>
              <Text style={styles.sectionEyebrow}>
                APPLICANT DETAILS
              </Text>

              <Text style={styles.sectionTitle}>
                Your Information
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#2457E6"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.label}>
            Email Address
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#2457E6"
              style={styles.inputIcon}
            />

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
        </View>

        {/* =========================
            CV / RESUME
        ========================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <View>
              <Text style={styles.sectionEyebrow}>
                SUPPORTING DOCUMENT
              </Text>

              <Text style={styles.sectionTitle}>
                CV / Resume
              </Text>
            </View>
          </View>

          {!selectedFile ? (
            <Pressable
              style={styles.uploadBox}
              onPress={handlePickFile}
              disabled={isPickingFile}
            >
              <View style={styles.uploadIconBox}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={29}
                  color="#2457E6"
                />
              </View>

              <Text style={styles.uploadTitle}>
                {isPickingFile
                  ? 'Opening files...'
                  : 'Upload Your CV'}
              </Text>

              <Text style={styles.uploadSubtitle}>
                PDF, DOCX or image
              </Text>

              <View style={styles.uploadHintRow}>
                <Ionicons
                  name="add-circle-outline"
                  size={14}
                  color="#2457E6"
                />

                <Text style={styles.uploadHint}>
                  Tap to choose a file from your device
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.selectedFileCard}>
              <View style={styles.fileIconBox}>
                <Ionicons
                  name={
                    selectedFile.mimeType?.startsWith(
                      'image/'
                    )
                      ? 'image-outline'
                      : 'document-outline'
                  }
                  size={24}
                  color="#2457E6"
                />
              </View>

              <View style={styles.fileInfo}>
                <Text
                  style={styles.fileName}
                  numberOfLines={2}
                >
                  {selectedFile.name}
                </Text>

                <View style={styles.fileStatusRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#2457E6"
                  />

                  <Text style={styles.fileStatus}>
                    Attachment selected
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.removeFileButton}
                onPress={handleRemoveFile}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color="#64748B"
                />
              </Pressable>
            </View>
          )}

          <View style={styles.fileNoteRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#6B8FFF"
            />

            <Text style={styles.fileNote}>
              Your attachment will be included with your
              application. The backend can handle the actual
              upload when it is connected.
            </Text>
          </View>
        </View>

        {/* =========================
            COVER LETTER
        ========================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="create-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <View>
              <Text style={styles.sectionEyebrow}>
                YOUR MESSAGE
              </Text>

              <Text style={styles.sectionTitle}>
                Cover Letter
              </Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            Explain why you are a good fit for this opportunity.
          </Text>

          <TextInput
            style={styles.textArea}
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Write your cover letter here..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* =========================
            ADDITIONAL NOTES
        ========================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <View>
              <Text style={styles.sectionEyebrow}>
                OPTIONAL
              </Text>

              <Text style={styles.sectionTitle}>
                Additional Notes
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.textAreaSmall}
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else you would like the employer to know?"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* =========================
            APPLICATION TIP
        ========================= */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#2457E6"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipEyebrow}>
              CAREERFORGEAI TIP
            </Text>

            <Text style={styles.tipTitle}>
              Make your application stand out
            </Text>

            <Text style={styles.tipText}>
              Tailor your application to the opportunity
              and highlight the skills that match the job
              requirements.
            </Text>
          </View>
        </View>

        {/* =========================
            SUBMIT
        ========================= */}

        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <View style={styles.submitIcon}>
            <Ionicons
              name="paper-plane-outline"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.submitButtonText}>
            Submit Application
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </Pressable>

        {/* =========================
            CANCEL
        ========================= */}

        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={17}
            color="#2457E6"
          />

          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          CareerForgeAI • Empowering your career journey
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === 'ios' ? 55 : 25,
    paddingBottom: 45,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#2457E6',
    marginBottom: 4,
  },

  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    color: '#102A72',
  },

  subtitle: {
    fontSize: 13,
    color: '#667085',
    marginTop: 3,
    fontWeight: '500',
  },

  /* =========================
     OPPORTUNITY
  ========================= */

  opportunityCard: {
    backgroundColor: '#102A72',
    borderRadius: 21,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#173FBD',
  },

  opportunityAccent: {
    height: 5,
    backgroundColor: '#4C7DFF',
  },

  opportunityContent: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  opportunityInfo: {
    flex: 1,
  },

  opportunityEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#8FB0FF',
    marginBottom: 3,
  },

  opportunityTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  company: {
    fontSize: 12,
    color: '#D9E2F2',
    marginLeft: 5,
    fontWeight: '600',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  location: {
    fontSize: 11,
    color: '#D9E2F2',
    marginLeft: 5,
    fontWeight: '500',
  },

  matchBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  matchNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#173FBD',
  },

  matchLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#2457E6',
    marginTop: 2,
  },

  opportunityFooter: {
    borderTopWidth: 1,
    borderTopColor: '#29498D',
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  typeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#173FBD',
    marginLeft: 5,
  },

  fitText: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  fitLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#B8C7E6',
    marginLeft: 4,
  },

  /* =========================
     SECTIONS
  ========================= */

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE4F2',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#D2DFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#2457E6',
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#102A72',
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 7,
  },

  /* =========================
     INPUTS
  ========================= */

  inputWrapper: {
    height: 51,
    borderWidth: 1,
    borderColor: '#CBD7ED',
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  inputIcon: {
    marginLeft: 13,
    marginRight: 2,
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 11,
    fontSize: 14,
    color: '#172A55',
  },

  /* =========================
     UPLOAD
  ========================= */

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#6B8FFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F3F6FF',
  },

  uploadIconBox: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#173FBD',
  },

  uploadSubtitle: {
    fontSize: 12,
    color: '#667085',
    marginTop: 5,
    fontWeight: '600',
  },

  uploadHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  uploadHint: {
    fontSize: 10,
    color: '#7B8BA8',
    marginLeft: 5,
  },

  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B9CCFF',
    backgroundColor: '#F3F6FF',
    borderRadius: 15,
    padding: 12,
  },

  fileIconBox: {
    width: 47,
    height: 47,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  fileStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  fileStatus: {
    fontSize: 11,
    color: '#2457E6',
    marginLeft: 4,
    fontWeight: '700',
  },

  removeFileButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  fileNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 11,
  },

  fileNote: {
    flex: 1,
    fontSize: 10,
    color: '#7B8BA8',
    marginLeft: 5,
    lineHeight: 15,
  },

  /* =========================
     TEXT AREAS
  ========================= */

  helperText: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 10,
    lineHeight: 18,
  },

  textArea: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#CBD7ED',
    borderRadius: 13,
    padding: 14,
    fontSize: 14,
    color: '#172A55',
    backgroundColor: '#F8FAFF',
  },

  textAreaSmall: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#CBD7ED',
    borderRadius: 13,
    padding: 14,
    fontSize: 14,
    color: '#172A55',
    backgroundColor: '#F8FAFF',
  },

  /* =========================
     TIP
  ========================= */

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#B9CCFF',
  },

  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#2457E6',
    marginBottom: 3,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 4,
  },

  tipText: {
    fontSize: 11,
    color: '#4E638C',
    lineHeight: 17,
  },

  /* =========================
     BUTTONS
  ========================= */

  submitButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 11,
  },

  submitIcon: {
    marginRight: 8,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 9,
  },

  cancelButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2457E6',
    marginLeft: 7,
  },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#8A99B5',
    marginTop: 22,
  },
});
