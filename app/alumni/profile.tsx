import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function AlumniProfile() {
  return (
    <ScrollView style={styles.container}>
      
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
          <Text style={styles.avatarText}>AM</Text>
        </View>

        <Text style={styles.name}>Alumni Member</Text>

        <Text style={styles.email}>
          alumni@careerforge.ai
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
          <Text style={styles.value}>BSc Data Science</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Graduation Year</Text>
          <Text style={styles.value}>2026</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Institution</Text>
          <Text style={styles.value}>
            Richfield Graduate Institute
          </Text>
        </View>
      </View>

      {/* Career */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Career</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Company</Text>
          <Text style={styles.value}>Not specified</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Position</Text>
          <Text style={styles.value}>Not specified</Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>

        <View style={styles.skillsContainer}>
          <View style={styles.skill}>
            <Text style={styles.skillText}>Python</Text>
          </View>

          <View style={styles.skill}>
            <Text style={styles.skillText}>Data Science</Text>
          </View>

          <View style={styles.skill}>
            <Text style={styles.skillText}>SQL</Text>
          </View>

          <View style={styles.skill}>
            <Text style={styles.skillText}>Machine Learning</Text>
          </View>

          <View style={styles.skill}>
            <Text style={styles.skillText}>React</Text>
          </View>
        </View>
      </View>

      {/* Experience */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Professional Experience
        </Text>

        <Text style={styles.experienceTitle}>
          Add your professional experience
        </Text>

        <Text style={styles.helperText}>
          Showcase your previous positions, internships,
          projects and achievements.
        </Text>

        <Pressable style={styles.outlineButton}>
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

      <View style={styles.bottomSpace} />

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

  bottomSpace: {
    height: 40,
  },
});