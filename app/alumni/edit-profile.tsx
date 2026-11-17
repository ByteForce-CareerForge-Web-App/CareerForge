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
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';

const ALUMNI_PROFILE_KEY = 'careerforge_alumni_profile';
const ALUMNI_DOCUMENTS_KEY = 'careerforge_alumni_documents';

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
  verified?: boolean;
};

type AlumniDocument = {
  id: string;
  type: 'cv' | 'certificate';
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  uploadedAt: string;
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
  verified: false,
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

  const [cvDocument, setCvDocument] =
    useState<AlumniDocument | null>(null);

  const [certificateDocument, setCertificateDocument] =
    useState<AlumniDocument | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(
        ALUMNI_PROFILE_KEY
      );

      if (savedProfile) {
        const profile: AlumniProfileData =
          JSON.parse(savedProfile);

        setFullName(
          profile.fullName ?? DEFAULT_PROFILE.fullName
        );

        setEmail(
          profile.email ?? DEFAULT_PROFILE.email
        );

        setQualification(
          profile.qualification ??
            DEFAULT_PROFILE.qualification
        );

        setGraduationYear(
          profile.graduationYear ??
            DEFAULT_PROFILE.graduationYear
        );

        setInstitution(
          profile.institution ??
            DEFAULT_PROFILE.institution
        );

        setCurrentCompany(
          profile.currentCompany ?? ''
        );

        setCurrentPosition(
          profile.currentPosition ?? ''
        );

        setSkills(
          profile.skills ?? DEFAULT_PROFILE.skills
        );

        setExperience(
          profile.experience ?? ''
        );
      } else {
        setFullName(DEFAULT_PROFILE.fullName);
        setEmail(DEFAULT_PROFILE.email);
        setQualification(DEFAULT_PROFILE.qualification);
        setGraduationYear(
          DEFAULT_PROFILE.graduationYear
        );
        setInstitution(DEFAULT_PROFILE.institution);
        setCurrentCompany(
          DEFAULT_PROFILE.currentCompany
        );
        setCurrentPosition(
          DEFAULT_PROFILE.currentPosition
        );
        setSkills(DEFAULT_PROFILE.skills);
        setExperience(DEFAULT_PROFILE.experience);
      }

      const savedDocuments =
        await AsyncStorage.getItem(
          ALUMNI_DOCUMENTS_KEY
        );

      if (savedDocuments) {
        const documents: AlumniDocument[] =
          JSON.parse(savedDocuments);

        const cv = documents.find(
          (document) => document.type === 'cv'
        );

        const certificate = documents.find(
          (document) =>
            document.type === 'certificate'
        );

        setCvDocument(cv ?? null);
        setCertificateDocument(
          certificate ?? null
        );
      } else {
        setCvDocument(null);
        setCertificateDocument(null);
      }
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

  async function saveDocuments(
    updatedDocuments: AlumniDocument[]
  ) {
    try {
      await AsyncStorage.setItem(
        ALUMNI_DOCUMENTS_KEY,
        JSON.stringify(updatedDocuments)
      );
    } catch (error) {
      console.log(
        'Error saving documents:',
        error
      );

      Alert.alert(
        'Upload Error',
        'The document could not be saved.'
      );
    }
  }

  async function handleDocumentUpload(
    type: 'cv' | 'certificate'
  ) {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/*',
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const selectedFile =
        result.assets?.[0];

      if (!selectedFile) {
        Alert.alert(
          'Upload Failed',
          'No document was selected.'
        );
        return;
      }

      const newDocument: AlumniDocument = {
        id: `${type}-${Date.now()}`,
        type,
        name: selectedFile.name,
        uri: selectedFile.uri,
        mimeType: selectedFile.mimeType,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
      };

      const existingDocumentsRaw =
        await AsyncStorage.getItem(
          ALUMNI_DOCUMENTS_KEY
        );

      let existingDocuments: AlumniDocument[] = [];

      if (existingDocumentsRaw) {
        existingDocuments =
          JSON.parse(existingDocumentsRaw);
      }

      const updatedDocuments = [
        ...existingDocuments.filter(
          (document) =>
            document.type !== type
        ),
        newDocument,
      ];

      await saveDocuments(updatedDocuments);

      if (type === 'cv') {
        setCvDocument(newDocument);
      } else {
        setCertificateDocument(
          newDocument
        );
      }

      Alert.alert(
        'Document Uploaded',
        `${selectedFile.name} has been added to your profile.`
      );
    } catch (error) {
      console.log(
        'Document picker error:',
        error
      );

      Alert.alert(
        'Upload Failed',
        'Something went wrong while selecting the document.'
      );
    }
  }

  async function handleRemoveDocument(
    type: 'cv' | 'certificate'
  ) {
    const document =
      type === 'cv'
        ? cvDocument
        : certificateDocument;

    if (!document) {
      return;
    }

    Alert.alert(
      'Remove Document',
      `Are you sure you want to remove "${document.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const savedDocumentsRaw =
                await AsyncStorage.getItem(
                  ALUMNI_DOCUMENTS_KEY
                );

              let savedDocuments: AlumniDocument[] =
                [];

              if (savedDocumentsRaw) {
                savedDocuments =
                  JSON.parse(
                    savedDocumentsRaw
                  );
              }

              const updatedDocuments =
                savedDocuments.filter(
                  (item) =>
                    item.type !== type
                );

              await saveDocuments(
                updatedDocuments
              );

              if (type === 'cv') {
                setCvDocument(null);
              } else {
                setCertificateDocument(
                  null
                );
              }
            } catch (error) {
              console.log(
                'Error removing document:',
                error
              );

              Alert.alert(
                'Error',
                'The document could not be removed.'
              );
            }
          },
        },
      ]
    );
  }

  function formatFileSize(size?: number) {
    if (!size) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

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
      const profile: AlumniProfileData = {
        fullName: fullName.trim(),
        email: email.trim(),
        qualification:
          qualification.trim(),
        graduationYear:
          graduationYear.trim(),
        institution:
          institution.trim(),
        currentCompany:
          currentCompany.trim(),
        currentPosition:
          currentPosition.trim(),
        skills: skills.trim(),
        experience:
          experience.trim(),
      };

      /*
       * Save the complete profile locally.
       *
       * This keeps institution, skills and experience
       * working with the current UI because the current
       * alumni backend does not yet store those fields.
       */
      await AsyncStorage.setItem(
        ALUMNI_PROFILE_KEY,
        JSON.stringify(profile)
      );

      /*
       * Get the logged-in user's authentication token.
       */
      const authToken =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!authToken) {
        Alert.alert(
          'Session Required',
          'Your login session could not be found. Please log in again.'
        );

        setSaving(false);
        return;
      }

      /*
       * Update the fields currently supported
       * by api/profiles/alumni.php.
       */
      const response = await fetch(
        `${API_BASE_URL}/profiles/alumni.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: fullName.trim(),
            qualification:
              qualification.trim(),
            graduation_year:
              graduationYear.trim(),
            company:
              currentCompany.trim(),
            position:
              currentPosition.trim(),
          }),
        }
      );

      const responseText =
        await response.text();

      let result: any = null;

      try {
        result = JSON.parse(
          responseText
        );
      } catch {
        console.log(
          'Alumni profile backend returned non-JSON:',
          responseText
        );
      }

      console.log(
        'ALUMNI PROFILE UPDATE STATUS:',
        response.status
      );

      console.log(
        'ALUMNI PROFILE UPDATE RESPONSE:',
        result
      );

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            'The alumni profile could not be updated on the server.'
        );
      }

      /*
       * Refresh the locally cached profile with
       * the server-supported values.
       */
      const updatedLocalProfile: AlumniProfileData = {
        ...profile,
        fullName:
          result?.data?.name ??
          profile.fullName,
        qualification:
          result?.data?.qualification ??
          profile.qualification,
        graduationYear:
          result?.data?.graduation_year ??
          profile.graduationYear,
        currentCompany:
          result?.data?.company ??
          profile.currentCompany,
        currentPosition:
          result?.data?.position ??
          profile.currentPosition,
        verified:
          result?.data?.verified ??
          profile.verified ??
          false,
      };

      await AsyncStorage.setItem(
        ALUMNI_PROFILE_KEY,
        JSON.stringify(
          updatedLocalProfile
        )
      );

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(
                '/alumni/profile'
              );
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
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your profile. Please try again.'
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
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>

          <View
            style={styles.headerSpacer}
          />
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
            placeholder="Enter your email address"
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

          {/* CV */}
          <Pressable
            style={styles.documentButton}
            onPress={() =>
              handleDocumentUpload('cv')
            }
          >
            <View style={styles.documentIcon}>
              <Text
                style={
                  styles.documentIconText
                }
              >
                +
              </Text>
            </View>

            <View
              style={
                styles.documentTextContainer
              }
            >
              <Text
                style={styles.documentTitle}
              >
                {cvDocument
                  ? 'Replace CV / Resume'
                  : 'Upload CV / Resume'}
              </Text>

              <Text
                style={
                  styles.documentDescription
                }
              >
                {cvDocument
                  ? cvDocument.name
                  : 'Add your latest CV to your profile.'}
              </Text>

              {cvDocument?.size ? (
                <Text
                  style={styles.fileSize}
                >
                  {formatFileSize(
                    cvDocument.size
                  )}
                </Text>
              ) : null}
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>

          {cvDocument ? (
            <Pressable
              style={
                styles.removeButton
              }
              onPress={() =>
                handleRemoveDocument('cv')
              }
            >
              <Text
                style={
                  styles.removeButtonText
                }
              >
                Remove CV
              </Text>
            </Pressable>
          ) : null}

          {/* Degree Certificate */}
          <Pressable
            style={styles.documentButton}
            onPress={() =>
              handleDocumentUpload(
                'certificate'
              )
            }
          >
            <View style={styles.documentIcon}>
              <Text
                style={
                  styles.documentIconText
                }
              >
                +
              </Text>
            </View>

            <View
              style={
                styles.documentTextContainer
              }
            >
              <Text
                style={styles.documentTitle}
              >
                {certificateDocument
                  ? 'Replace Degree Certificate'
                  : 'Upload Degree Certificate'}
              </Text>

              <Text
                style={
                  styles.documentDescription
                }
              >
                {certificateDocument
                  ? certificateDocument.name
                  : 'Add your qualification certificate.'}
              </Text>

              {certificateDocument?.size ? (
                <Text
                  style={styles.fileSize}
                >
                  {formatFileSize(
                    certificateDocument.size
                  )}
                </Text>
              ) : null}
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>

          {certificateDocument ? (
            <Pressable
              style={
                styles.removeButton
              }
              onPress={() =>
                handleRemoveDocument(
                  'certificate'
                )
              }
            >
              <Text
                style={
                  styles.removeButtonText
                }
              >
                Remove Certificate
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.documentNote}>
            Supported formats: PDF, Word documents and images.
          </Text>
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
          <Text
            style={styles.cancelButtonText}
          >
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
    color: '#0B1F3A',
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
    backgroundColor: '#E8F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  documentIconText: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 28,
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

  fileSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#9CA3AF',
  },

  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  documentNote: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  saveButton: {
    backgroundColor: '#0B1F3A',
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
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});

