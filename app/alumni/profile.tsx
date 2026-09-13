import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ALUMNI_PROFILE_KEY = 'careerforge_alumni_profile';
const ALUMNI_EXPERIENCE_KEY = 'careerforge_alumni_experience';
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
};

type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  startYear: string;
  endYear: string;
  description: string;
};

type AlumniDocument = {
  id: string;
  type: 'cv' | 'certificate' | 'other';
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
};

export default function AlumniProfile() {
  const [profile, setProfile] =
    useState<AlumniProfileData>(DEFAULT_PROFILE);

  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [documents, setDocuments] = useState<AlumniDocument[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        try {
          const savedProfile = await AsyncStorage.getItem(
            ALUMNI_PROFILE_KEY
          );

          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);

            if (isActive) {
              setProfile({
                ...DEFAULT_PROFILE,
                ...parsedProfile,
              });
            }
          } else {
            if (isActive) {
              setProfile(DEFAULT_PROFILE);
            }
          }

          const savedExperiences = await AsyncStorage.getItem(
            ALUMNI_EXPERIENCE_KEY
          );

          if (savedExperiences) {
            const parsedExperiences = JSON.parse(savedExperiences);

            if (isActive) {
              setExperiences(parsedExperiences);
            }
          } else {
            if (isActive) {
              setExperiences([]);
            }
          }

          const savedDocuments = await AsyncStorage.getItem(
            ALUMNI_DOCUMENTS_KEY
          );

          if (savedDocuments) {
            const parsedDocuments = JSON.parse(savedDocuments);

            if (isActive) {
              setDocuments(parsedDocuments);
            }
          } else {
            if (isActive) {
              setDocuments([]);
            }
          }
        } catch (error) {
          console.log('Error loading alumni profile:', error);

          if (isActive) {
            setProfile(DEFAULT_PROFILE);
            setExperiences([]);
            setDocuments([]);
          }
        }
      };

      loadProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const getInitials = (name: string) => {
    const words = name.trim().split(' ').filter(Boolean);

    if (words.length === 0) {
      return 'AM';
    }

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const skillsList = profile.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const getDocument = (
    type: AlumniDocument['type']
  ) => {
    return documents.find((document) => document.type === type);
  };

  const saveDocuments = async (
    updatedDocuments: AlumniDocument[]
  ) => {
    try {
      await AsyncStorage.setItem(
        ALUMNI_DOCUMENTS_KEY,
        JSON.stringify(updatedDocuments)
      );

      setDocuments(updatedDocuments);
    } catch (error) {
      console.log('Error saving documents:', error);

      Alert.alert(
        'Unable to save',
        'The document information could not be saved.'
      );
    }
  };

  const uploadDocument = async (
    type: AlumniDocument['type']
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
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

      const selectedFile = result.assets[0];

      const newDocument: AlumniDocument = {
        id: `${type}-${Date.now()}`,
        type,
        name: selectedFile.name,
        uri: selectedFile.uri,
        mimeType: selectedFile.mimeType,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocuments = [
        ...documents.filter(
          (document) => document.type !== type
        ),
        newDocument,
      ];

      await saveDocuments(updatedDocuments);

      Alert.alert(
        'Document uploaded',
        `${selectedFile.name} has been added to your profile.`
      );
    } catch (error) {
      console.log('Document picker error:', error);

      Alert.alert(
        'Upload failed',
        'Something went wrong while selecting the document.'
      );
    }
  };

  const removeDocument = (
    document: AlumniDocument
  ) => {
    Alert.alert(
      'Remove document',
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
            const updatedDocuments = documents.filter(
              (item) => item.id !== document.id
            );

            await saveDocuments(updatedDocuments);
          },
        },
      ]
    );
  };

  const formatFileSize = (size?: number) => {
    if (!size) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDocumentRow = ({
    type,
    title,
    emptyText,
    icon,
  }: {
    type: AlumniDocument['type'];
    title: string;
    emptyText: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const document = getDocument(type);

    return (
      <View style={styles.documentItem}>
        <View style={styles.documentTopRow}>
          <View style={styles.documentLeft}>
            <View style={styles.documentIcon}>
              <Ionicons
                name={icon}
                size={20}
                color="#1769AA"
              />
            </View>

            <View style={styles.documentDetails}>
              <Text style={styles.documentTitle}>
                {title}
              </Text>

              {document ? (
                <>
                  <Text
                    style={styles.documentFileName}
                    numberOfLines={1}
                  >
                    {document.name}
                  </Text>

                  <View style={styles.uploadedStatusRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#16803C"
                    />

                    <Text style={styles.uploadedStatus}>
                      Uploaded
                    </Text>

                    {document.size ? (
                      <Text style={styles.fileSize}>
                        • {formatFileSize(document.size)}
                      </Text>
                    ) : null}
                  </View>
                </>
              ) : (
                <Text style={styles.documentStatus}>
                  {emptyText}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.documentActions}>
          <Pressable
            style={styles.uploadButton}
            onPress={() => uploadDocument(type)}
          >
            <Ionicons
              name={
                document
                  ? 'swap-horizontal-outline'
                  : 'cloud-upload-outline'
              }
              size={17}
              color="#1769AA"
            />

            <Text style={styles.uploadButtonText}>
              {document ? 'Replace' : 'Upload'}
            </Text>
          </Pressable>

          {document ? (
            <Pressable
              style={styles.removeButton}
              onPress={() => removeDocument(document)}
            >
              <Ionicons
                name="trash-outline"
                size={17}
                color="#B42318"
              />

              <Text style={styles.removeButtonText}>
                Remove
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#0B1F3A"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            My Profile
          </Text>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push('/alumni/edit-profile')
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#1769AA"
            />

            <Text style={styles.editText}>
              Edit
            </Text>
          </Pressable>
        </View>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(profile.fullName)}
            </Text>
          </View>

          <Text style={styles.name}>
            {profile.fullName}
          </Text>

          <Text style={styles.email}>
            {profile.email}
          </Text>

          <View style={styles.badge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color="#1769AA"
            />

            <Text style={styles.badgeText}>
              VERIFIED ALUMNI
            </Text>
          </View>
        </View>

        {/* Profile Completion */}
        <View style={styles.card}>
          <View style={styles.completionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Profile Completion
              </Text>
            </View>

            <Text style={styles.percentage}>
              75%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.helperText}>
            Complete your profile to improve your career
            matches.
          </Text>
        </View>

        {/* Education */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="school-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Education
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Qualification
            </Text>

            <Text style={styles.value}>
              {profile.qualification || 'Not specified'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Graduation Year
            </Text>

            <Text style={styles.value}>
              {profile.graduationYear || 'Not specified'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Institution
            </Text>

            <Text style={styles.value}>
              {profile.institution || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Career */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="briefcase-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Career
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Current Company
            </Text>

            <Text style={styles.value}>
              {profile.currentCompany || 'Not specified'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Current Position
            </Text>

            <Text style={styles.value}>
              {profile.currentPosition || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="sparkles-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Skills
            </Text>
          </View>

          <View style={styles.skillsContainer}>
            {skillsList.length > 0 ? (
              skillsList.map((skill, index) => (
                <View
                  style={styles.skill}
                  key={`${skill}-${index}`}
                >
                  <Text style={styles.skillText}>
                    {skill}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>
                No skills added yet.
              </Text>
            )}
          </View>
        </View>

        {/* Professional Experience */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="reader-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Professional Experience
            </Text>
          </View>

          {experiences.length === 0 ? (
            <>
              <Text style={styles.experienceTitle}>
                Add your professional experience
              </Text>

              <Text style={styles.helperText}>
                Showcase your previous positions, internships,
                projects and achievements.
              </Text>
            </>
          ) : (
            experiences.map((experience) => (
              <View
                key={experience.id}
                style={styles.experienceCard}
              >
                <View style={styles.experienceHeader}>
                  <View style={styles.experienceIcon}>
                    <Ionicons
                      name="briefcase"
                      size={19}
                      color="#1769AA"
                    />
                  </View>

                  <View style={styles.experienceHeading}>
                    <Text style={styles.experienceJobTitle}>
                      {experience.jobTitle}
                    </Text>

                    <Text style={styles.experienceCompany}>
                      {experience.company}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color="#667085"
                  />

                  <Text style={styles.experienceDates}>
                    {experience.startYear} - {experience.endYear}
                  </Text>
                </View>

                {experience.description ? (
                  <Text style={styles.experienceDescription}>
                    {experience.description}
                  </Text>
                ) : null}
              </View>
            ))
          )}

          <Pressable
            style={styles.outlineButton}
            onPress={() =>
              router.push('/alumni/add-experience')
            }
          >
            <Ionicons
              name="add"
              size={19}
              color="#1769AA"
            />

            <Text style={styles.outlineButtonText}>
              Add Experience
            </Text>
          </Pressable>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="document-text-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Documents
            </Text>
          </View>

          <Text style={styles.documentHelper}>
            Upload your CV, qualification certificates and
            other supporting documents.
          </Text>

          {renderDocumentRow({
            type: 'certificate',
            title: 'Degree Certificate',
            emptyText: 'No certificate uploaded',
            icon: 'school-outline',
          })}

          {renderDocumentRow({
            type: 'cv',
            title: 'CV / Resume',
            emptyText: 'No CV uploaded',
            icon: 'document-outline',
          })}

          {renderDocumentRow({
            type: 'other',
            title: 'Other Document',
            emptyText: 'No other document uploaded',
            icon: 'folder-outline',
          })}
        </View>

        {/* AI Career Section */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.aiTitle}>
            CareerForgeAI Career Insights
          </Text>

          <Text style={styles.aiText}>
            Improve your profile to receive personalised
            career recommendations, opportunity matches
            and career development insights.
          </Text>

          <Pressable
            style={styles.aiButton}
            onPress={() =>
              router.push('/alumni/career-insights')
            }
          >
            <Text style={styles.aiButtonText}>
              View Career Insights
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingBottom: 35,
  },

  /* Header */

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  editText: {
    color: '#1769AA',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Profile Header */

  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 16,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 4,
    borderColor: '#E7EEF7',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  email: {
    fontSize: 14,
    color: '#667085',
    marginTop: 5,
  },

  badge: {
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EAF3FB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  badgeText: {
    color: '#1769AA',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  /* Completion */

  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  percentage: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1769AA',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressBar: {
    width: '75%',
    height: 8,
    backgroundColor: '#1769AA',
    borderRadius: 10,
  },

  /* Section */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  helperText: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 20,
    marginTop: 10,
  },

  /* Information */

  infoRow: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B1F3A',
  },

  /* Skills */

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skill: {
    backgroundColor: '#EAF3FB',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  skillText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Experience */

  experienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  experienceCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  experienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  experienceHeading: {
    flex: 1,
  },

  experienceJobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  experienceCompany: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1769AA',
    marginTop: 4,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },

  experienceDates: {
    fontSize: 13,
    color: '#667085',
  },

  experienceDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 10,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#1769AA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },

  outlineButtonText: {
    color: '#1769AA',
    fontWeight: '700',
  },

  /* Documents */

  documentHelper: {
    fontSize: 13,
    lineHeight: 20,
    color: '#667085',
    marginTop: -7,
    marginBottom: 10,
  },

  documentItem: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  documentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  documentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  documentDetails: {
    flex: 1,
  },

  documentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  documentFileName: {
    fontSize: 12,
    color: '#475467',
    marginTop: 4,
  },

  documentStatus: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
  },

  uploadedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },

  uploadedStatus: {
    fontSize: 12,
    color: '#16803C',
    fontWeight: '700',
  },

  fileSize: {
    fontSize: 12,
    color: '#667085',
  },

  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    gap: 9,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#1769AA',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  uploadButtonText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '700',
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F0B8B5',
    backgroundColor: '#FFF5F4',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  removeButtonText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },

  /* AI */

  aiCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    padding: 20,
    backgroundColor: '#EAF3FB',
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  aiIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 8,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#40566F',
  },

  aiButton: {
    marginTop: 16,
    backgroundColor: '#0B1F3A',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  bottomSpacing: {
    height: 10,
  },
});