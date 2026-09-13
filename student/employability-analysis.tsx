import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2457E6',
  primaryDark: '#173FBD',
  deepBlue: '#102A72',
  navy: '#172A55',
  brightBlue: '#4C7DFF',
  softBlue: '#E8F0FF',
  paleBlue: '#F3F6FF',

  background: '#F5F7FA',
  white: '#FFFFFF',

  text: '#172033',
  secondaryText: '#667085',
  muted: '#98A2B3',
  border: '#E4E7EC',

  green: '#22C55E',
  greenDark: '#15803D',
  greenLight: '#EAF8EF',

  yellow: '#EAB308',
  yellowLight: '#FFF8D9',

  red: '#EF4444',
  redLight: '#FDECEC',
};

const analysisData = {
  score: 82,
  level: 'Strong Potential',
  profile: 80,
  skills: 78,
  experience: 72,
  education: 91,
  careerReadiness: 84,
  strengths: 4,
  skillGaps: 2,
};

export default function EmployabilityAnalysisScreen() {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/dashboard');
    }
  };

  const openProfile = () => {
    router.push('/student/profile');
  };

  const openSkills = () => {
    router.push('/student/skills');
  };

  const openExperience = () => {
    router.push('/student/experience');
  };

  const openRoadmap = () => {
    router.push('/student/career-roadmap');
  };

  const openCareerGoals = () => {
    router.push('/student/career-goals');
  };

  const openAI = () => {
    router.push('/student/ai-career-assistant');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={goBack}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={COLORS.white}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Employability Analysis
            </Text>

            <Text style={styles.headerSubtitle}>
              AI-powered career readiness overview
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={25}
              color={COLORS.white}
            />
          </View>
        </View>

        {/* AI Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTop}>
            <View>
              <View style={styles.aiLabel}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={COLORS.white}
                />

                <Text style={styles.aiLabelText}>
                  AI EMPLOYABILITY INSIGHT
                </Text>
              </View>

              <Text style={styles.heroHeading}>
                Your career readiness
              </Text>

              <Text style={styles.heroDescription}>
                Based on your current profile, skills,
                experience and career goals.
              </Text>
            </View>
          </View>

          <View style={styles.scoreArea}>
            <View style={styles.scoreCircleOuter}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>
                  {analysisData.score}
                </Text>

                <Text style={styles.scoreOutOf}>
                  /100
                </Text>
              </View>
            </View>

            <View style={styles.scoreDetails}>
              <Text style={styles.scoreLabel}>
                Employability Score
              </Text>

              <Text style={styles.scoreLevel}>
                {analysisData.level}
              </Text>

              <View style={styles.scoreStatus}>
                <Ionicons
                  name="trending-up"
                  size={15}
                  color={COLORS.green}
                />

                <Text style={styles.scoreStatusText}>
                  Above the readiness benchmark
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterNumber}>
                82%
              </Text>

              <Text style={styles.heroFooterLabel}>
                Overall readiness
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterNumber}>
                2
              </Text>

              <Text style={styles.heroFooterLabel}>
                Key skill gaps
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterNumber}>
                4
              </Text>

              <Text style={styles.heroFooterLabel}>
                Strength areas
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Overview */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Readiness breakdown
            </Text>

            <Text style={styles.sectionSubtitle}>
              How each area contributes to your score
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="bar-chart-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.breakdownCard}>
          <AnalysisBar
            icon="person-outline"
            title="Profile"
            description="Profile completeness and career information"
            score={analysisData.profile}
            color="blue"
          />

          <AnalysisBar
            icon="construct-outline"
            title="Skills"
            description="Technical and professional skill development"
            score={analysisData.skills}
            color="green"
          />

          <AnalysisBar
            icon="briefcase-outline"
            title="Experience"
            description="Practical exposure and career experience"
            score={analysisData.experience}
            color="yellow"
          />

          <AnalysisBar
            icon="school-outline"
            title="Education"
            description="Qualification and academic readiness"
            score={analysisData.education}
            color="blue"
          />

          <AnalysisBar
            icon="flag-outline"
            title="Career Readiness"
            description="Goals, direction and preparation"
            score={analysisData.careerReadiness}
            color="green"
            last
          />
        </View>

        {/* AI Assessment */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              AI assessment
            </Text>

            <Text style={styles.sectionSubtitle}>
              What your current score tells you
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="sparkles-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.assessmentCard}>
          <View style={styles.assessmentTop}>
            <View style={styles.assessmentIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={25}
                color={COLORS.green}
              />
            </View>

            <View style={styles.assessmentTitleArea}>
              <Text style={styles.assessmentTitle}>
                You are on a strong track
              </Text>

              <Text style={styles.assessmentSubtitle}>
                Your profile shows good graduate potential.
              </Text>
            </View>
          </View>

          <Text style={styles.assessmentText}>
            Your strongest areas currently include your
            educational foundation, career direction and
            developing technical skills. Building more
            practical experience and closing your remaining
            skill gaps can improve your readiness further.
          </Text>

          <View style={styles.assessmentInsight}>
            <Ionicons
              name="bulb-outline"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.insightText}>
              Focus on practical experience and targeted
              skill development to move toward the 90+ range.
            </Text>
          </View>
        </View>

        {/* Strengths + Gaps */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Strengths & opportunities
            </Text>

            <Text style={styles.sectionSubtitle}>
              Where you are doing well and where to improve
            </Text>
          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.strengthCard}>
            <View style={styles.smallCardHeader}>
              <View style={styles.greenIcon}>
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={21}
                  color={COLORS.greenDark}
                />
              </View>

              <Text style={styles.smallCardTitle}>
                Strengths
              </Text>
            </View>

            <StrengthItem
              icon="school-outline"
              text="Strong academic foundation"
            />

            <StrengthItem
              icon="flag-outline"
              text="Clear career direction"
            />

            <StrengthItem
              icon="person-outline"
              text="Good profile foundation"
            />

            <StrengthItem
              icon="rocket-outline"
              text="Strong graduate potential"
            />
          </View>

          <View style={styles.gapCard}>
            <View style={styles.smallCardHeader}>
              <View style={styles.yellowIcon}>
                <Ionicons
                  name="trending-up-outline"
                  size={21}
                  color="#A16207"
                />
              </View>

              <Text style={styles.smallCardTitle}>
                Skill gaps
              </Text>
            </View>

            <GapItem
              number="01"
              title="Practical experience"
            />

            <GapItem
              number="02"
              title="Advanced technical skills"
            />

            <Pressable
              style={styles.gapAction}
              onPress={openSkills}
            >
              <Text style={styles.gapActionText}>
                Improve skills
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Priority Actions */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recommended next steps
            </Text>

            <Text style={styles.sectionSubtitle}>
              Actions that can improve your employability
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="list-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.actionsCard}>
          <ActionRow
            number="01"
            icon="briefcase-outline"
            title="Build practical experience"
            description="Add projects, internships or volunteering experience."
            onPress={openExperience}
            primary
          />

          <ActionRow
            number="02"
            icon="construct-outline"
            title="Close your skill gaps"
            description="Develop the technical skills most relevant to your career path."
            onPress={openSkills}
          />

          <ActionRow
            number="03"
            icon="map-outline"
            title="Follow your career roadmap"
            description="Continue working through your personalised development journey."
            onPress={openRoadmap}
          />

          <ActionRow
            number="04"
            icon="flag-outline"
            title="Review your career goals"
            description="Make sure your goals align with the career you want."
            onPress={openCareerGoals}
            last
          />
        </View>

        {/* Profile Readiness */}
        <View style={styles.profileReadiness}>
          <View style={styles.profileReadinessTop}>
            <View>
              <Text style={styles.profileReadinessTitle}>
                Profile readiness
              </Text>

              <Text style={styles.profileReadinessSubtitle}>
                Your profile is {analysisData.profile}% complete
              </Text>
            </View>

            <View style={styles.profilePercentage}>
              <Text style={styles.profilePercentageText}>
                {analysisData.profile}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${analysisData.profile}%`,
                },
              ]}
            />
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={openProfile}
          >
            <Text style={styles.profileButtonText}>
              Complete My Profile
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        {/* AI Career Assistant */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardGlow} />

          <View style={styles.aiCardTop}>
            <View style={styles.aiCardIcon}>
              <Ionicons
                name="sparkles"
                size={24}
                color={COLORS.white}
              />
            </View>

            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>
                Want personalised guidance?
              </Text>

              <Text style={styles.aiCardSubtitle}>
                Ask the AI Career Assistant what you should
                focus on next.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.aiButton}
            onPress={openAI}
          >
            <Text style={styles.aiButtonText}>
              Open AI Career Assistant
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.deepBlue}
            />
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          Your employability score is an indication of career
          readiness and can improve as you develop your profile,
          skills and experience.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

type AnalysisBarProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  score: number;
  color: 'blue' | 'green' | 'yellow';
  last?: boolean;
};

function AnalysisBar({
  icon,
  title,
  description,
  score,
  color,
  last,
}: AnalysisBarProps) {
  const fillColor =
    color === 'green'
      ? COLORS.green
      : color === 'yellow'
        ? COLORS.yellow
        : COLORS.primary;

  return (
    <View
      style={[
        styles.analysisRow,
        last && styles.analysisRowLast,
      ]}
    >
      <View style={styles.analysisIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={fillColor}
        />
      </View>

      <View style={styles.analysisContent}>
        <View style={styles.analysisTopLine}>
          <View style={styles.analysisTitleArea}>
            <Text style={styles.analysisTitle}>
              {title}
            </Text>

            <Text style={styles.analysisDescription}>
              {description}
            </Text>
          </View>

          <Text
            style={[
              styles.analysisScore,
              { color: fillColor },
            ]}
          >
            {score}
          </Text>
        </View>

        <View style={styles.analysisTrack}>
          <View
            style={[
              styles.analysisFill,
              {
                width: `${score}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function StrengthItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.strengthItem}>
      <Ionicons
        name={icon}
        size={16}
        color={COLORS.greenDark}
      />

      <Text style={styles.strengthText}>
        {text}
      </Text>
    </View>
  );
}

function GapItem({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <View style={styles.gapItem}>
      <View style={styles.gapNumber}>
        <Text style={styles.gapNumberText}>
          {number}
        </Text>
      </View>

      <Text style={styles.gapTitle}>
        {title}
      </Text>
    </View>
  );
}

type ActionRowProps = {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  primary?: boolean;
  last?: boolean;
};

function ActionRow({
  number,
  icon,
  title,
  description,
  onPress,
  primary,
  last,
}: ActionRowProps) {
  return (
    <Pressable
      style={[
        styles.actionRow,
        primary && styles.actionRowPrimary,
        last && styles.actionRowLast,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionNumber,
          primary && styles.actionNumberPrimary,
        ]}
      >
        <Text
          style={[
            styles.actionNumberText,
            primary && styles.actionNumberTextPrimary,
          ]}
        >
          {number}
        </Text>
      </View>

      <View
        style={[
          styles.actionIcon,
          primary && styles.actionIconPrimary,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            primary
              ? COLORS.white
              : COLORS.primary
          }
        />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={
          primary
            ? COLORS.primary
            : COLORS.muted
        }
      />
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */

  header: {
    backgroundColor: COLORS.deepBlue,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C9D7FF',
    fontSize: 12,
    marginTop: 4,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Hero */

  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 25,
    backgroundColor: COLORS.deepBlue,
    overflow: 'hidden',
    padding: 20,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(76,125,255,0.16)',
    right: -70,
    top: -80,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
    left: -65,
    bottom: 35,
  },

  heroTop: {
    marginBottom: 20,
  },

  aiLabel: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },

  aiLabelText: {
    color: '#DCE6FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginLeft: 5,
  },

  heroHeading: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
  },

  heroDescription: {
    color: '#C9D7FF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 290,
  },

  scoreArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  scoreCircleOuter: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 7,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  scoreCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreNumber: {
    color: COLORS.deepBlue,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
  },

  scoreOutOf: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },

  scoreDetails: {
    flex: 1,
  },

  scoreLabel: {
    color: '#B9C9F4',
    fontSize: 11,
    fontWeight: '700',
  },

  scoreLevel: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },

  scoreStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  scoreStatusText: {
    color: '#D7F5E1',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 5,
    flex: 1,
  },

  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroFooterItem: {
    flex: 1,
    alignItems: 'center',
  },

  heroFooterNumber: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
  },

  heroFooterLabel: {
    color: '#AFC0EE',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },

  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  /* Sections */

  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 3,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Breakdown */

  breakdownCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  analysisRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  analysisRowLast: {
    borderBottomWidth: 0,
  },

  analysisIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: COLORS.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  analysisContent: {
    flex: 1,
  },

  analysisTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  analysisTitleArea: {
    flex: 1,
  },

  analysisTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  analysisDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 2,
  },

  analysisScore: {
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 10,
  },

  analysisTrack: {
    height: 7,
    backgroundColor: '#EDF0F5',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 9,
  },

  analysisFill: {
    height: '100%',
    borderRadius: 10,
  },

  /* Assessment */

  assessmentCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  assessmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assessmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  assessmentTitleArea: {
    flex: 1,
  },

  assessmentTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  assessmentSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 3,
  },

  assessmentText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },

  assessmentInsight: {
    marginTop: 14,
    backgroundColor: COLORS.softBlue,
    borderRadius: 13,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  insightText: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
    fontWeight: '600',
  },

  /* Strengths */

  twoColumn: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
  },

  strengthCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D9F0E1',
  },

  gapCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1E4B5',
  },

  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  greenIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  yellowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.yellowLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  smallCardTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },

  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 11,
  },

  strengthText: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 6,
  },

  gapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  gapNumber: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: COLORS.yellowLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  gapNumberText: {
    color: '#A16207',
    fontSize: 8,
    fontWeight: '900',
  },

  gapTitle: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  },

  gapAction: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2EBCF',
    paddingTop: 11,
  },

  gapActionText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },

  /* Actions */

  actionsCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  actionRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  actionRowLast: {
    borderBottomWidth: 0,
  },

  actionRowPrimary: {
    backgroundColor: '#F8FAFF',
    marginHorizontal: -14,
    paddingHorizontal: 14,
    borderRadius: 15,
  },

  actionNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  actionNumberPrimary: {
    backgroundColor: COLORS.softBlue,
  },

  actionNumberText: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '900',
  },

  actionNumberTextPrimary: {
    color: COLORS.primary,
  },

  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionIconPrimary: {
    backgroundColor: COLORS.primary,
  },

  actionContent: {
    flex: 1,
    marginRight: 7,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  actionDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  /* Profile */

  profileReadiness: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  profileReadinessTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileReadinessTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  profileReadinessSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 3,
  },

  profilePercentage: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profilePercentageText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  progressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#E9EDF4',
    overflow: 'hidden',
    marginTop: 15,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  profileButton: {
    height: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8D6FA',
    backgroundColor: COLORS.paleBlue,
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 7,
  },

  /* AI Card */

  aiCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 21,
    backgroundColor: COLORS.navy,
    padding: 17,
    overflow: 'hidden',
  },

  aiCardGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76,125,255,0.15)',
    right: -50,
    top: -55,
  },

  aiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  aiCardText: {
    flex: 1,
  },

  aiCardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  aiCardSubtitle: {
    color: '#B9C9E8',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  aiButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiButtonText: {
    color: COLORS.deepBlue,
    fontSize: 12,
    fontWeight: '900',
    marginRight: 8,
  },

  footerNote: {
    marginHorizontal: 25,
    marginTop: 17,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
});