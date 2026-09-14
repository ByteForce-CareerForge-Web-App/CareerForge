import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LaunchCareerScreen() {
  const checklistItems = [
    {
      icon: 'person-circle-outline',
      title: 'Complete your profile',
      description:
        'Make sure your education, skills and career goals are up to date.',
    },
    {
      icon: 'document-text-outline',
      title: 'Keep your CV updated',
      description:
        'Update your CV whenever you gain new skills, experience or achievements.',
    },
    {
      icon: 'briefcase-outline',
      title: 'Build professional experience',
      description:
        'Continue working on projects, internships and other practical opportunities.',
    },
    {
      icon: 'paper-plane-outline',
      title: 'Apply for opportunities',
      description:
        'Regularly search and apply for roles that match your skills and career goals.',
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Prepare for interviews',
      description:
        'Practise communicating your skills, achievements and career goals with confidence.',
    },
  ];

  const nextSteps = [
    {
      icon: 'flag-outline',
      title: 'Set Career Goals',
      description:
        'Continue setting short-term and long-term goals for your professional development.',
      label: 'PLAN',
    },
    {
      icon: 'people-outline',
      title: 'Build Your Network',
      description:
        'Connect with alumni, mentors, students and employers to grow your professional network.',
      label: 'CONNECT',
    },
    {
      icon: 'trending-up-outline',
      title: 'Keep Improving',
      description:
        'Keep learning new skills and improving your employability throughout your career.',
      label: 'GROW',
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#173FBD"
          />

          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.topBadge}>
          <Ionicons
            name="rocket-outline"
            size={15}
            color="#2457E6"
          />

          <Text style={styles.topBadgeText}>
            Career Launch
          </Text>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroShapeOne} />
        <View style={styles.heroShapeTwo} />
        <View style={styles.heroShapeThree} />

        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="rocket"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.readyBadge}>
            <View style={styles.readyDot} />

            <Text style={styles.readyText}>
              CAREER READY
            </Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>
          Launch Your Career
        </Text>

        <Text style={styles.heroSubtitle}>
          You have built your foundation. Now put your skills,
          experience and confidence into action.
        </Text>

        <View style={styles.heroDivider} />

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>82%</Text>

            <Text style={styles.heroStatLabel}>
              Readiness
            </Text>
          </View>

          <View style={styles.heroStatDivider} />

          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>5</Text>

            <Text style={styles.heroStatLabel}>
              Key actions
            </Text>
          </View>

          <View style={styles.heroStatDivider} />

          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>AI</Text>

            <Text style={styles.heroStatLabel}>
              Career support
            </Text>
          </View>
        </View>
      </View>

      {/* Achievement Banner */}
      <View style={styles.achievementCard}>
        <View style={styles.achievementIcon}>
          <Ionicons
            name="trophy-outline"
            size={24}
            color="#2457E6"
          />
        </View>

        <View style={styles.achievementContent}>
          <Text style={styles.achievementEyebrow}>
            MILESTONE UNLOCKED
          </Text>

          <Text style={styles.achievementTitle}>
            You're Career-Ready!
          </Text>

          <Text style={styles.achievementText}>
            Completing your roadmap is an important milestone.
            Keep learning, applying, networking and growing.
          </Text>
        </View>
      </View>

      {/* Career Readiness */}
      <View style={styles.readinessCard}>
        <View style={styles.readinessHeader}>
          <View style={styles.readinessTitleArea}>
            <Text style={styles.sectionEyebrow}>
              YOUR PROGRESS
            </Text>

            <Text style={styles.readinessTitle}>
              Career Readiness
            </Text>

            <Text style={styles.readinessSubtitle}>
              Your employability profile
            </Text>
          </View>

          <View style={styles.readinessScoreBox}>
            <Text style={styles.readinessPercentage}>
              82%
            </Text>

            <Text style={styles.readinessScoreLabel}>
              Strong
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>
            Foundation
          </Text>

          <Text style={styles.progressLabelActive}>
            Strong potential
          </Text>

          <Text style={styles.progressLabel}>
            Career launch
          </Text>
        </View>

        <View style={styles.readinessMessage}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#2457E6"
          />

          <Text style={styles.readinessDescription}>
            Your profile shows strong potential. Continue
            improving your skills and gaining relevant
            experience to strengthen your career readiness.
          </Text>
        </View>
      </View>

      {/* Readiness Breakdown */}
      <View style={styles.breakdownHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>
            READINESS SNAPSHOT
          </Text>

          <Text style={styles.sectionTitle}>
            What you've built
          </Text>
        </View>

        <Ionicons
          name="analytics-outline"
          size={22}
          color="#2457E6"
        />
      </View>

      <View style={styles.breakdownCard}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIcon}>
            <Ionicons
              name="school-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View style={styles.breakdownContent}>
            <Text style={styles.breakdownTitle}>
              Education
            </Text>

            <Text style={styles.breakdownText}>
              Academic foundation established
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={21}
            color="#22C55E"
          />
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIcon}>
            <Ionicons
              name="construct-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View style={styles.breakdownContent}>
            <Text style={styles.breakdownTitle}>
              Skills
            </Text>

            <Text style={styles.breakdownText}>
              Continue developing role-specific skills
            </Text>
          </View>

          <Ionicons
            name="arrow-forward-circle-outline"
            size={21}
            color="#2457E6"
          />
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIcon}>
            <Ionicons
              name="briefcase-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View style={styles.breakdownContent}>
            <Text style={styles.breakdownTitle}>
              Experience
            </Text>

            <Text style={styles.breakdownText}>
              Keep building practical experience
            </Text>
          </View>

          <Ionicons
            name="arrow-forward-circle-outline"
            size={21}
            color="#2457E6"
          />
        </View>
      </View>

      {/* Final Checklist */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>
            FINAL PREPARATION
          </Text>

          <Text style={styles.sectionTitle}>
            Career Launch Checklist
          </Text>
        </View>

        <View style={styles.completeBadge}>
          <Ionicons
            name="checkmark"
            size={12}
            color="#15803D"
          />

          <Text style={styles.completeBadgeText}>
            Ready
          </Text>
        </View>
      </View>

      <View style={styles.checklistCard}>
        {checklistItems.map((item, index) => (
          <View
            key={item.title}
            style={[
              styles.checklistRow,
              index !== checklistItems.length - 1 &&
                styles.checklistBorder,
            ]}
          >
            <View style={styles.checkIcon}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color="#2457E6"
              />
            </View>

            <View style={styles.checklistContent}>
              <View style={styles.checklistTitleRow}>
                <Text style={styles.checklistTitle}>
                  {item.title}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#22C55E"
                />
              </View>

              <Text style={styles.checklistDescription}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Next Steps */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>
            KEEP MOVING FORWARD
          </Text>

          <Text style={styles.sectionTitle}>
            Your Next Steps
          </Text>
        </View>
      </View>

      <View style={styles.nextStepsContainer}>
        {nextSteps.map((step, index) => (
          <Pressable
            key={step.title}
            style={styles.nextStepCard}
          >
            <View style={styles.nextStepNumber}>
              <Text style={styles.nextStepNumberText}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.nextStepIcon}>
              <Ionicons
                name={step.icon as any}
                size={22}
                color="#2457E6"
              />
            </View>

            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepLabel}>
                {step.label}
              </Text>

              <Text style={styles.nextStepTitle}>
                {step.title}
              </Text>

              <Text style={styles.nextStepText}>
                {step.description}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#94A3B8"
            />
          </Pressable>
        ))}
      </View>

      {/* CareerForgeAI Advice */}
      <View style={styles.aiCard}>
        <View style={styles.aiTop}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.aiTitleArea}>
            <Text style={styles.aiEyebrow}>
              CAREERFORGEAI
            </Text>

            <Text style={styles.aiTitle}>
              Your journey doesn't end here
            </Text>
          </View>
        </View>

        <Text style={styles.aiText}>
          There is no single path to success. Keep building
          relevant skills, gaining experience and taking
          opportunities that move you closer to your goals.
        </Text>

        <View style={styles.aiBottom}>
          <View style={styles.aiPill}>
            <Ionicons
              name="school-outline"
              size={13}
              color="#BFD0FF"
            />

            <Text style={styles.aiPillText}>
              Learn
            </Text>
          </View>

          <View style={styles.aiPill}>
            <Ionicons
              name="briefcase-outline"
              size={13}
              color="#BFD0FF"
            />

            <Text style={styles.aiPillText}>
              Build
            </Text>
          </View>

          <View style={styles.aiPill}>
            <Ionicons
              name="rocket-outline"
              size={13}
              color="#BFD0FF"
            />

            <Text style={styles.aiPillText}>
              Launch
            </Text>
          </View>
        </View>
      </View>

      {/* Dashboard Button */}
      <Pressable
        style={styles.dashboardButton}
        onPress={() => router.replace('/student/dashboard')}
      >
        <View style={styles.dashboardButtonIcon}>
          <Ionicons
            name="home-outline"
            size={19}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.dashboardButtonText}>
          Return to Dashboard
        </Text>

        <Ionicons
          name="arrow-forward"
          size={19}
          color="#FFFFFF"
        />
      </Pressable>

      {/* Footer */}
      <Text style={styles.footerText}>
        CareerForgeAI — Empowering you to build your future.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  container: {
    padding: 18,
    paddingBottom: 45,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingRight: 10,
  },

  backText: {
    color: '#173FBD',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 7,
  },

  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  topBadgeText: {
    color: '#2457E6',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 6,
  },

  heroCard: {
    backgroundColor: '#102A72',
    borderRadius: 25,
    padding: 21,
    marginBottom: 15,
    minHeight: 275,
    overflow: 'hidden',
  },

  heroShapeOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#2457E6',
    right: -75,
    top: -90,
    opacity: 0.65,
  },

  heroShapeTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4C7DFF',
    right: 35,
    bottom: -80,
    opacity: 0.4,
  },

  heroShapeThree: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#071A4D',
    left: -35,
    bottom: 35,
    opacity: 0.7,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6EE7B7',
    marginRight: 6,
  },

  readyText: {
    color: '#DCE7FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 7,
  },

  heroSubtitle: {
    color: '#DCE7FF',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '95%',
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: 20,
    marginBottom: 15,
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroStat: {
    flex: 1,
    alignItems: 'center',
  },

  heroStatNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  heroStatLabel: {
    color: '#AFC3EF',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },

  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  achievementCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D5E2FF',
    marginBottom: 15,
  },

  achievementIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  achievementContent: {
    flex: 1,
  },

  achievementEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  achievementTitle: {
    color: '#173FBD',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  achievementText: {
    color: '#4F6790',
    fontSize: 11,
    lineHeight: 17,
  },

  readinessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    marginBottom: 24,
  },

  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  readinessTitleArea: {
    flex: 1,
  },

  sectionEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },

  readinessTitle: {
    color: '#172A55',
    fontSize: 20,
    fontWeight: '900',
  },

  readinessSubtitle: {
    color: '#8A9AB4',
    fontSize: 10,
    marginTop: 3,
  },

  readinessScoreBox: {
    backgroundColor: '#E8F0FF',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },

  readinessPercentage: {
    color: '#2457E6',
    fontSize: 22,
    fontWeight: '900',
  },

  readinessScoreLabel: {
    color: '#56709A',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E7EDF7',
    overflow: 'hidden',
    marginTop: 18,
  },

  progressFill: {
    width: '82%',
    height: '100%',
    backgroundColor: '#2457E6',
    borderRadius: 5,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  progressLabel: {
    color: '#A0AEC0',
    fontSize: 8,
  },

  progressLabelActive: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '800',
  },

  readinessMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 11,
    marginTop: 15,
  },

  readinessDescription: {
    flex: 1,
    color: '#64748B',
    fontSize: 10,
    lineHeight: 16,
    marginLeft: 7,
  },

  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 20,
    fontWeight: '900',
  },

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    marginBottom: 24,
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  breakdownContent: {
    flex: 1,
  },

  breakdownTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },

  breakdownText: {
    color: '#8A98AD',
    fontSize: 10,
    marginTop: 3,
  },

  breakdownDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  completeBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 3,
  },

  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    marginBottom: 24,
  },

  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },

  checklistBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  checkIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checklistContent: {
    flex: 1,
  },

  checklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  checklistTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },

  checklistDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  nextStepsContainer: {
    marginBottom: 5,
  },

  nextStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  nextStepNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#172A55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  nextStepNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  nextStepIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  nextStepContent: {
    flex: 1,
  },

  nextStepLabel: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  nextStepTitle: {
    color: '#172A55',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },

  nextStepText: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 16,
  },

  aiCard: {
    backgroundColor: '#172A55',
    borderRadius: 21,
    padding: 18,
    marginTop: 13,
    marginBottom: 18,
    overflow: 'hidden',
  },

  aiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  aiTitleArea: {
    flex: 1,
  },

  aiEyebrow: {
    color: '#9FB8FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  aiTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  aiText: {
    color: '#D4DFF5',
    fontSize: 11,
    lineHeight: 18,
  },

  aiBottom: {
    flexDirection: 'row',
    marginTop: 15,
  },

  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginRight: 7,
  },

  aiPillText: {
    color: '#BFD0FF',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },

  dashboardButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#2457E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    shadowColor: '#2457E6',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  dashboardButtonIcon: {
    marginRight: 8,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 15,
  },
});
