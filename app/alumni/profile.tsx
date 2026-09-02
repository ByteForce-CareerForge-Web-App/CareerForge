import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

const ALUMNI_PROFILE_KEY = 'careerforge_alumni_profile';
const ALUMNI_EXPERIENCE_KEY = 'careerforge_alumni_experience';

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        try {
          // Load alumni profile
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

          // Load professional experience
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
        } catch (error) {
          console.log('Error loading alumni profile:', error);

          if (isActive) {
            setProfile(DEFAULT_PROFILE);
            setExperiences([]);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>My Profile</Text>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push('/alumni/edit-profile')}
        >
          <Text style={styles.editText}>Edit</Text>
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
          <Text style={styles.badgeText}>ALUMNI</Text>
        </View>
      </View>

      {/* Profile Completion */}
      <View style={styles.card}>
        <View style={styles.completionHeader}>
          <Text style={styles.sectionTitle}>
            Profile Completion
          </Text>

          <Text style={styles.percentage}>75%</Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={styles.progressBar} />
        </View>

        <Text style={styles.helperText}>
          Complete your profile to improve your career matches.
        </Text>
      </View>

      {/* Education */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Education</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Qualification</Text>

          <Text style={styles.value}>
            {profile.qualification || 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Graduation Year</Text>

          <Text style={styles.value}>
            {profile.graduationYear || 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Institution</Text>

          <Text style={styles.value}>
            {profile.institution || 'Not specified'}
          </Text>
        </View>
      </View>

      {/* Career */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Career</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Company</Text>

          <Text style={styles.value}>
            {profile.currentCompany || 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Position</Text>

          <Text style={styles.value}>
            {profile.currentPosition || 'Not specified'}
          </Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>

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
        <Text style={styles.sectionTitle}>
          Professional Experience
        </Text>

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
              <Text style={styles.experienceJobTitle}>
                {experience.jobTitle}
              </Text>

              <Text style={styles.experienceCompany}>
                {experience.company}
              </Text>

              <Text style={styles.experienceDates}>
                {experience.startYear} - {experience.endYear}
              </Text>

              {experience.description ? (
                <Text style={styles.experienceDescription}>
                  {experience.description}
                </Text>
              ) : null}
            </View>
          ))
        )}

        {/* Add Experience Button */}
        <Pressable
          style={styles.outlineButton}
          onPress={() => router.push('/alumni/add-experience')}
        >
          <Text style={styles.outlineButtonText}>
            + Add Experience
          </Text>
        </Pressable>
      </View>

      {/* Documents */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Documents
        </Text>

        <View style={styles.documentRow}>
          <View>
            <Text style={styles.documentTitle}>
              Degree Certificate
            </Text>

            <Text style={styles.documentStatus}>
              Verification pending
            </Text>
          </View>

          <Text style={styles.documentArrow}>›</Text>
        </View>

        <View style={styles.documentRow}>
          <View>
            <Text style={styles.documentTitle}>
              CV / Resume
            </Text>

            <Text style={styles.documentStatus}>
              No CV uploaded
            </Text>
          </View>

          <Text style={styles.documentArrow}>›</Text>
        </View>
      </View>

      {/* AI Career Section */}
      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>
          CareerForgeAI Career Insights
        </Text>

        <Text style={styles.aiText}>
          Improve your profile to receive personalised
          career recommendations, opportunity matches
          and career development insights.
        </Text>

        <Pressable style={styles.aiButton}>
          <Text style={styles.aiButtonText}>
            View Career Insights
          </Text>
        </Pressable>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#4F46E5',
    lineHeight: 40,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  editText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 12,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  badge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },

  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 20,
  },

  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },

  percentage: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressBar: {
    width: '75%',
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  helperText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 10,
  },

  infoRow: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  skillText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '600',
  },

  experienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  experienceCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  experienceJobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  experienceCompany: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 5,
  },

  experienceDates: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  experienceDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 10,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },

  outlineButtonText: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  documentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  documentStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  documentArrow: {
    fontSize: 28,
    color: '#9CA3AF',
  },

  aiCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#EEF2FF',
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 8,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4338CA',
  },

  aiButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

