import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';

export default function CareerInsights() {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Career Insights
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.title}>
            Your Career Insights
          </Text>

          <Text style={styles.subtitle}>
            AI-powered insights to help you understand
            your career readiness and identify your next
            opportunities.
          </Text>
        </View>

        {/* Employability Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>
            Employability Score
          </Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>
              78
            </Text>

            <Text style={styles.scorePercent}>
              %
            </Text>
          </View>

          <Text style={styles.scoreStatus}>
            Good Career Readiness
          </Text>

          <Text style={styles.scoreDescription}>
            Your profile shows strong potential. A few
            improvements could increase your career
            opportunities.
          </Text>
        </View>

        {/* Profile Strength */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Profile Strength
          </Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Professional Profile
            </Text>

            <Text style={styles.progressValue}>
              75%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '75%' }]} />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Skills
            </Text>

            <Text style={styles.progressValue}>
              85%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '85%' }]} />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Experience
            </Text>

            <Text style={styles.progressValue}>
              65%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '65%' }]} />
          </View>
        </View>

        {/* Strong Skills */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Your Strongest Skills
          </Text>

          <View style={styles.skillRow}>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>
                Python
              </Text>

              <Text style={styles.skillLevel}>
                Advanced
              </Text>
            </View>

            <Text style={styles.skillScore}>
              90%
            </Text>
          </View>

          <View style={styles.skillRow}>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>
                SQL
              </Text>

              <Text style={styles.skillLevel}>
                Advanced
              </Text>
            </View>

            <Text style={styles.skillScore}>
              86%
            </Text>
          </View>

          <View style={styles.skillRow}>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>
                Data Analysis
              </Text>

              <Text style={styles.skillLevel}>
                Intermediate
              </Text>
            </View>

            <Text style={styles.skillScore}>
              80%
            </Text>
          </View>

          <View style={styles.skillRow}>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>
                Machine Learning
              </Text>

              <Text style={styles.skillLevel}>
                Intermediate
              </Text>
            </View>

            <Text style={styles.skillScore}>
              76%
            </Text>
          </View>
        </View>

        {/* Skills to Improve */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Skills to Improve
          </Text>

          <View style={styles.improvementItem}>
            <Text style={styles.improvementTitle}>
              Cloud Computing
            </Text>

            <Text style={styles.improvementText}>
              Developing cloud skills could improve your
              eligibility for modern data roles.
            </Text>
          </View>

          <View style={styles.improvementItem}>
            <Text style={styles.improvementTitle}>
              Communication
            </Text>

            <Text style={styles.improvementText}>
              Stronger communication skills can help with
              interviews and workplace collaboration.
            </Text>
          </View>

          <View style={styles.improvementItem}>
            <Text style={styles.improvementTitle}>
              Data Visualization
            </Text>

            <Text style={styles.improvementText}>
              Improving dashboard and visualization skills
              could strengthen your data portfolio.
            </Text>
          </View>
        </View>

        {/* Recommended Careers */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Recommended Career Paths
          </Text>

          <View style={styles.careerCard}>
            <Text style={styles.careerTitle}>
              Data Analyst
            </Text>

            <Text style={styles.match}>
              92% Match
            </Text>

            <Text style={styles.careerDescription}>
              Your current skills and qualification align
              strongly with this career path.
            </Text>

            <Pressable
                style={styles.smallButton}
                onPress={() => router.push('/alumni/opportunities')}
              >
              <Text style={styles.smallButtonText}>
                Explore Career
              </Text>
            </Pressable>
          </View>

          <View style={styles.careerCard}>
            <Text style={styles.careerTitle}>
              Junior Data Scientist
            </Text>

            <Text style={styles.match}>
              86% Match
            </Text>

            <Text style={styles.careerDescription}>
              Strengthening your machine learning and
              statistical skills could prepare you for
              this role.
            </Text>

            <Pressable
              style={styles.smallButton}
              onPress={() => router.push('/alumni/opportunities')}
            >
              <Text style={styles.smallButtonText}>
                Explore Career
              </Text>
            </Pressable>
          </View>

          <View style={styles.careerCard}>
            <Text style={styles.careerTitle}>
              Business Intelligence Analyst
            </Text>

            <Text style={styles.match}>
              81% Match
            </Text>

            <Text style={styles.careerDescription}>
              Your SQL and data analysis skills provide a
              strong foundation for this career.
            </Text>

            <Pressable
              style={styles.smallButton}
              onPress={() => router.push('/alumni/opportunities')}
            >
              <Text style={styles.smallButtonText}>
                Explore Career
              </Text>
            </Pressable>
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>
            ✦ AI Career Insight
          </Text>

          <Text style={styles.aiText}>
            Based on your current profile, you are well
            positioned for entry-level data and technology
            roles. Focus on building a strong portfolio,
            improving cloud skills and gaining practical
            experience to increase your employability.
          </Text>

          <Pressable
            style={styles.aiButton}
            onPress={() => router.push('/alumni/career-roadmap')}
          >
            <Text style={styles.aiButtonText}>
              View Career Roadmap →
            </Text>
          </Pressable>
        </View>

        {/* Recommended Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Recommended Actions
          </Text>

          <View style={styles.actionRow}>
            <Text style={styles.actionNumber}>
              1
            </Text>

            <Text style={styles.actionText}>
              Complete your professional profile
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.actionNumber}>
              2
            </Text>

            <Text style={styles.actionText}>
              Upload your latest CV
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.actionNumber}>
              3
            </Text>

            <Text style={styles.actionText}>
              Develop your cloud computing skills
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.actionNumber}>
              4
            </Text>

            <Text style={styles.actionText}>
              Apply for relevant opportunities
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FB',
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

  scoreCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },

  scoreCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    borderWidth: 12,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  scoreNumber: {
    fontSize: 43,
    fontWeight: '900',
    color: '#111827',
  },

  scorePercent: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: -5,
  },

  scoreStatus: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 15,
  },

  scoreDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
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
    marginBottom: 16,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 7,
  },

  progressLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },

  progressValue: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '800',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressBar: {
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  skillInfo: {
    flex: 1,
  },

  skillName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  skillLevel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  skillScore: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },

  improvementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  improvementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  improvementText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 5,
  },

  careerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  careerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  match: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },

  careerDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 8,
  },

  smallButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 12,
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  aiCard: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },

  aiTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#312E81',
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4338CA',
    marginTop: 10,
  },

  aiButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  actionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '800',
    marginRight: 12,
  },

  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  bottomSpace: {
    height: 30,
  },
});

