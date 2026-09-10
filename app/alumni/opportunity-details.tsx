import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function OpportunityDetails() {
  const params = useLocalSearchParams();

  const title =
    typeof params.title === 'string'
      ? params.title
      : 'Junior Data Analyst';

  const company =
    typeof params.company === 'string'
      ? params.company
      : 'TechNova Solutions';

  const location =
    typeof params.location === 'string'
      ? params.location
      : 'Durban, KwaZulu-Natal';

  const type =
    typeof params.type === 'string'
      ? params.type
      : 'Full-time';

  const salary =
    typeof params.salary === 'string'
      ? params.salary
      : 'R18,000 - R25,000 / month';

  const match =
    typeof params.match === 'string'
      ? params.match
      : '94%';

  const description =
    typeof params.description === 'string'
      ? params.description
      : 'Join our analytics team and help transform business data into meaningful insights and reports.';

  const skillsString =
    typeof params.skills === 'string'
      ? params.skills
      : 'Python,SQL,Excel,Power BI';

  const skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  function handleApply() {
    Alert.alert(
      'Application Started',
      'Your application has been prepared. The backend will handle the actual application submission.'
    );
  }

  function handleSave() {
    Alert.alert(
      'Opportunity Saved',
      'This opportunity has been added to your saved opportunities.'
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Opportunity Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Job Header */}
        <View style={styles.jobHeaderCard}>

          <View style={styles.companyIcon}>
            <Text style={styles.companyIconText}>
              {company.charAt(0)}
            </Text>
          </View>

          <Text style={styles.jobTitle}>
            {title}
          </Text>

          <Text style={styles.companyName}>
            {company}
          </Text>

          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>
              {match}
            </Text>

            <Text style={styles.matchLabel}>
              Career Match
            </Text>
          </View>

        </View>

        {/* Job Information */}
        <View style={styles.infoCard}>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>

            <View>
              <Text style={styles.infoLabel}>
                Location
              </Text>

              <Text style={styles.infoValue}>
                {location}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💼</Text>

            <View>
              <Text style={styles.infoLabel}>
                Employment Type
              </Text>

              <Text style={styles.infoValue}>
                {type}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>

            <View>
              <Text style={styles.infoLabel}>
                Salary
              </Text>

              <Text style={styles.infoValue}>
                {salary}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>

            <View>
              <Text style={styles.infoLabel}>
                Closing Date
              </Text>

              <Text style={styles.infoValue}>
                30 September 2026
              </Text>
            </View>
          </View>

        </View>

        {/* Why This Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Why This Opportunity Matches You
          </Text>

          <View style={styles.matchCard}>
            <Text style={styles.matchCardIcon}>
              ✦
            </Text>

            <Text style={styles.matchCardText}>
              Your professional profile and skills indicate a strong
              match for this opportunity. You have several of the
              technical skills requested by the employer.
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Job Description
          </Text>

          <Text style={styles.bodyText}>
            {description}
          </Text>

          <Text style={styles.bodyText}>
            You will collaborate with team members, analyse information,
            prepare reports and contribute to data-driven business
            decisions.
          </Text>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Requirements
          </Text>

          <Text style={styles.bullet}>
            • Relevant tertiary qualification
          </Text>

          <Text style={styles.bullet}>
            • Strong analytical and problem-solving skills
          </Text>

          <Text style={styles.bullet}>
            • Ability to work independently and within a team
          </Text>

          <Text style={styles.bullet}>
            • Good communication skills
          </Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Skills Required
          </Text>

          <View style={styles.skillsContainer}>
            {skills.map((skill) => (
              <View
                key={skill}
                style={styles.skillBadge}
              >
                <Text style={styles.skillText}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Career Advice */}
        <View style={styles.aiCard}>

          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>
              ✦
            </Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>
              CareerForgeAI Recommendation
            </Text>

            <Text style={styles.aiText}>
              This opportunity could help strengthen your professional
              experience and move you closer to your long-term career
              goals.
            </Text>
          </View>

        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>
            Apply Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            ♡ Save Opportunity
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 24,
    color: '#4F46E5',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24243A',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  jobHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },

  companyIcon: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  companyIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6C63FF',
  },

  jobTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#24243A',
    textAlign: 'center',
    marginBottom: 6,
  },

  companyName: {
    fontSize: 15,
    color: '#777777',
    marginBottom: 14,
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  matchText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },

  matchLabel: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 1,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  infoIcon: {
    fontSize: 21,
    width: 38,
  },

  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 11,
  },

  bodyText: {
    fontSize: 14,
    color: '#5F5F70',
    lineHeight: 22,
    marginBottom: 10,
  },

  bullet: {
    fontSize: 14,
    color: '#5F5F70',
    lineHeight: 23,
  },

  matchCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
  },

  matchCardIcon: {
    fontSize: 22,
    color: '#4F46E5',
    marginRight: 10,
  },

  matchCardText: {
    flex: 1,
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillBadge: {
    backgroundColor: '#EAE8FF',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginRight: 7,
    marginBottom: 7,
  },

  skillText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },

  aiCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#581C87',
    marginBottom: 5,
  },

  aiText: {
    fontSize: 12,
    color: '#6B21A8',
    lineHeight: 19,
  },

  applyButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 13,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 13,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '700',
  },
});

