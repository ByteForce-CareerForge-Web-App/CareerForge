import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type StudentProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  student_number: string | null;
  qualification: string | null;
  year_of_study: number | null;
  graduation_year: number | null;
  campus: string | null;
  bio: string | null;
  current_company: string | null;
  current_position: string | null;
  employability_score: number | null;
};

type Skill = {
  id: number;
  name: string;
};

type CareerGoal = {
  id: number;
  name: string;
};

type OpportunitySkill = {
  id: number;
  name: string;
};

type Opportunity = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  deadline: string | null;
  status: string;
  company_name: string | null;
  skills?: OpportunitySkill[];
};

type RecommendedOpportunity = Opportunity & {
  matchCount: number;
};

type AIAnalysisResult = {
  score: number;
  target_role?: string;
  employability?: {
    score: number;
    level: string | null;
    overall_assessment?: string;
  };
};

export default function StudentDashboard() {
  const [student, setStudent] =
    useState<StudentProfile | null>(null);

  const [skills, setSkills] =
    useState<Skill[]>([]);

  const [careerGoals, setCareerGoals] =
    useState<CareerGoal[]>([]);

  const [aiAnalysis, setAIAnalysis] =
    useState<AIAnalysisResult | null>(null);

  const [
    recommendedOpportunities,
    setRecommendedOpportunities,
  ] = useState<RecommendedOpportunity[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22C55E';
    if (score >= 50) return '#EAB308';
    return '#EF4444';
  };

  const calculateProfileCompletion = (
    profile: StudentProfile | null
  ): number => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.email,
      profile.student_number,
      profile.qualification,
      profile.year_of_study,
      profile.graduation_year,
      profile.campus,
      profile.bio,
      profile.current_company,
      profile.current_position,
    ];

    const completedFields = fields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ''
    ).length;

    return Math.round(
      (completedFields / fields.length) * 100
    );
  };

  const getOpportunitySkillIds = (
    opportunity: Opportunity
  ): number[] => {
    if (!Array.isArray(opportunity.skills)) {
      return [];
    }

    return opportunity.skills
      .map((skill) => Number(skill.id))
      .filter((id) => !Number.isNaN(id));
  };

  const formatOpportunityType = (type: string) => {
    switch (type) {
      case 'graduate_program':
        return 'Graduate Program';

      case 'internship':
        return 'Internship';

      case 'job':
        return 'Full Time';

      case 'learnership':
        return 'Learnership';

      case 'volunteer':
        return 'Volunteer';

      default:
        return type
          ? type.charAt(0).toUpperCase() + type.slice(1)
          : 'Opportunity';
    }
  };

  const loadDashboard = useCallback(async () => {
    try {
      setErrorMessage('');

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      /*
       * ---------------------------------------------------------
       * LOAD CENTRAL AI EMPLOYABILITY ANALYSIS
       * ---------------------------------------------------------
       *
       * The dashboard reads the latest analysis generated
       * by the central CareerForge AI system.
       *
       * A 404 is allowed because a new student may not have
       * generated an AI analysis yet.
       */
      const aiAnalysisResponse = await fetch(
        `${API_BASE_URL}/ai-analysis-result.php`,
        {
          method: 'GET',
          headers: authHeaders,
        }
      );

      if (aiAnalysisResponse.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      if (aiAnalysisResponse.ok) {
        const aiAnalysisData =
          await aiAnalysisResponse.json();

        console.log(
          'AI ANALYSIS RESULT:',
          aiAnalysisData
        );

        if (
          aiAnalysisData.success &&
          aiAnalysisData.data
        ) {
          setAIAnalysis(
            aiAnalysisData.data
          );
        } else {
          setAIAnalysis(null);
        }
      } else if (
        aiAnalysisResponse.status === 404
      ) {
        /*
         * No analysis exists yet.
         * This should not break the dashboard.
         */
        setAIAnalysis(null);
      } else {
        /*
         * If the AI result endpoint has another
         * problem, allow the normal dashboard to
         * continue loading.
         */
        setAIAnalysis(null);
      }

      /*
       * ---------------------------------------------------------
       * LOAD STUDENT PROFILE
       * ---------------------------------------------------------
       *
       * Actual API:
       * /CareerForge/api/profiles/student.php
       */
      const profileResponse = await fetch(
        `${API_BASE_URL}/profiles/student.php`,
        {
          method: 'GET',
          headers: authHeaders,
        }
      );

      const profileText =
        await profileResponse.text();

      console.log(
        'PROFILE API STATUS:',
        profileResponse.status
      );

      console.log(
        'PROFILE API RESPONSE:',
        profileText
      );

      let profileData: any;

      try {
        profileData = JSON.parse(profileText);
      } catch {
        throw new Error(
          'Profile API returned invalid JSON.'
        );
      }

      if (profileResponse.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      if (
        !profileResponse.ok ||
        !profileData.success
      ) {
        throw new Error(
          profileData.message ||
            `Profile API error (${profileResponse.status})`
        );
      }

      const loadedStudent: StudentProfile =
        profileData.data;

      setStudent(loadedStudent);

      /*
       * ---------------------------------------------------------
       * LOAD SKILLS
       * ---------------------------------------------------------
       */
      const skillsResponse = await fetch(
        `${API_BASE_URL}/skills.php`,
        {
          method: 'GET',
          headers: authHeaders,
        }
      );

      if (skillsResponse.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      let loadedSkills: Skill[] = [];

      if (skillsResponse.ok) {
        const skillsData =
          await skillsResponse.json();

        console.log(
          'SKILLS API RESPONSE:',
          skillsData
        );

        if (skillsData.success) {
          const selectedSkillIds: number[] =
            Array.isArray(
              skillsData.data?.selected_skill_ids
            )
              ? skillsData.data.selected_skill_ids.map(
                  Number
                )
              : [];

          const allSkills: Skill[] =
            Array.isArray(
              skillsData.data?.skills
            )
              ? skillsData.data.skills
              : [];

          loadedSkills =
            allSkills.filter((skill) =>
              selectedSkillIds.includes(
                Number(skill.id)
              )
            );

          setSkills(loadedSkills);
        }
      }

      /*
       * ---------------------------------------------------------
       * LOAD CAREER GOALS
       * ---------------------------------------------------------
       *
       * The dashboard does not currently display the goals,
       * but we load them so the dashboard remains connected
       * to the Career Goals API.
       */
      const goalsResponse = await fetch(
        `${API_BASE_URL}/career-goals.php`,
        {
          method: 'GET',
          headers: authHeaders,
        }
      );

      if (goalsResponse.status === 401) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      if (goalsResponse.ok) {
        const goalsData =
          await goalsResponse.json();

        console.log(
          'CAREER GOALS API RESPONSE:',
          goalsData
        );

        if (goalsData.success) {
          const selectedGoalIds: number[] =
            Array.isArray(
              goalsData.data?.selected_goal_ids
            )
              ? goalsData.data.selected_goal_ids.map(
                  Number
                )
              : [];

          const allGoals: CareerGoal[] =
            Array.isArray(
              goalsData.data?.goals
            )
              ? goalsData.data.goals
              : [];

          const selectedGoals =
            allGoals.filter((goal) =>
              selectedGoalIds.includes(
                Number(goal.id)
              )
            );

          setCareerGoals(selectedGoals);
        }
      }

      /*
       * ---------------------------------------------------------
       * LOAD OPPORTUNITIES
       * ---------------------------------------------------------
       */
      const opportunitiesResponse =
        await fetch(
          `${API_BASE_URL}/opportunities.php`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

      if (!opportunitiesResponse.ok) {
        throw new Error(
          'Unable to load opportunities.'
        );
      }

      const opportunitiesData =
        await opportunitiesResponse.json();

      console.log(
        'OPPORTUNITIES API RESPONSE:',
        opportunitiesData
      );

      if (!opportunitiesData.success) {
        throw new Error(
          opportunitiesData.message ||
            'Unable to load opportunities.'
        );
      }

      const allOpportunities: Opportunity[] =
        Array.isArray(
          opportunitiesData.data
        )
          ? opportunitiesData.data
          : [];

      /*
       * ---------------------------------------------------------
       * RECOMMENDATION / MATCHING
       * ---------------------------------------------------------
       *
       * Simple rule-based skill matching.
       * This is intentionally NOT presented as AI.
       */
      const selectedSkillIds =
        loadedSkills.map(
          (skill) => Number(skill.id)
        );

      const rankedOpportunities:
        RecommendedOpportunity[] =
        allOpportunities
          .map((opportunity) => {
            const opportunitySkillIds =
              getOpportunitySkillIds(
                opportunity
              );

            const matchCount =
              opportunitySkillIds.filter(
                (skillId) =>
                  selectedSkillIds.includes(
                    skillId
                  )
              ).length;

            return {
              ...opportunity,
              matchCount,
            };
          })
          .sort((a, b) => {
            if (
              b.matchCount !==
              a.matchCount
            ) {
              return (
                b.matchCount -
                a.matchCount
              );
            }

            return (
              Number(b.id) -
              Number(a.id)
            );
          })
          .slice(0, 3);

      setRecommendedOpportunities(
        rankedOpportunities
      );
    } catch (error: any) {
      console.error(
        'Dashboard error:',
        error
      );

      setErrorMessage(
        error?.message ||
          'Unable to load your dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      'authToken',
      'user',
    ]);

    router.replace('/login');
  };

  /*
   * ---------------------------------------------------------
   * EMPLOYABILITY SCORE
   * ---------------------------------------------------------
   *
   * Central AI analysis is the primary source.
   *
   * If no AI analysis exists yet, we fall back to the
   * employability_score stored on the student profile.
   */
  const employabilityScore =
    aiAnalysis?.employability?.score ??
    aiAnalysis?.score ??
    student?.employability_score ??
    0;

  const hasEmployabilityAnalysis =
    aiAnalysis !== null;

  const hasEmployabilityScore =
    hasEmployabilityAnalysis ||
    (
      student?.employability_score !== null &&
      student?.employability_score !== undefined
    );

  const employabilityLevel =
    aiAnalysis?.employability?.level ??
    null;

  const profileCompletion =
    calculateProfileCompletion(student);

  const scoreColor =
    getScoreColor(employabilityScore);

  const progressColor =
    getScoreColor(profileCompletion);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back 👋
          </Text>

          <Text style={styles.name}>
            {isLoading
              ? 'Student'
              : student?.name || 'Student'}
          </Text>
        </View>

        <View style={styles.headerButtons}>
          {/* Notifications */}
          <Pressable
            style={styles.notificationButton}
            onPress={() =>
              router.push(
                '/student/notification'
              )
            }
          >
            <Text style={styles.notificationIcon}>
              🔔
            </Text>
          </Pressable>

          {/* Profile */}
          <Pressable
            style={styles.profileButton}
            onPress={() =>
              router.push(
                '/student/profile'
              )
            }
          >
            <Text style={styles.profileIcon}>
              👤
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Loading */}
      {isLoading && (
        <View
          style={{
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <ActivityIndicator
            size="small"
            color="#1e5397"
          />
        </View>
      )}

      {/* Error */}
      {errorMessage !== '' && (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <Text
            style={{
              color: '#B91C1C',
              fontSize: 13,
            }}
          >
            {errorMessage}
          </Text>

          <Pressable
            onPress={loadDashboard}
            style={{
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: '#1e5397',
                fontWeight: '700',
              }}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      )}

      {/* ===================================================== */}
      {/* EMPLOYABILITY SCORE */}
      {/* ===================================================== */}

      <Pressable
        style={styles.scoreCard}
        onPress={() =>
          router.push(
            '/student/employability-analysis'
          )
        }
      >
        <View style={styles.scoreContent}>

          {/* Top Row */}
          <View style={styles.scoreTopRow}>
            <View style={styles.scoreHeadingArea}>
              <Text style={styles.scoreLabel}>
                Employability Score
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  ✦ AI-POWERED
                </Text>
              </View>
            </View>

            {/* Score Circle */}
            <View
              style={[
                styles.scoreCircle,
                {
                  borderColor:
                    hasEmployabilityScore
                      ? scoreColor
                      : '#CBD5E1',
                },
              ]}
            >
              <Text
                style={styles.scoreCircleText}
              >
                {hasEmployabilityScore
                  ? Math.round(
                      employabilityScore
                    )
                  : '—'}
              </Text>

              <Text
                style={[
                  styles.scoreCirclePercent,
                  {
                    color:
                      hasEmployabilityScore
                        ? scoreColor
                        : '#64748B',
                  },
                ]}
              >
                {hasEmployabilityScore
                  ? '%'
                  : ''}
              </Text>
            </View>
          </View>

          {/* Main Score */}
          <Text style={styles.score}>
            {hasEmployabilityScore
              ? `${Math.round(
                  employabilityScore
                )}%`
              : '—'}
          </Text>

          {/* Career Readiness */}
          {employabilityLevel && (
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>
                Career Readiness
              </Text>

              <Text
                style={[
                  styles.levelValue,
                  {
                    color: scoreColor,
                  },
                ]}
              >
                {employabilityLevel}
              </Text>
            </View>
          )}

          {/* Score Progress */}
          {hasEmployabilityScore && (
            <View
              style={
                styles.scoreProgressBackground
              }
            >
              <View
                style={[
                  styles.scoreProgressFill,
                  {
                    width: `${Math.min(
                      Math.max(
                        employabilityScore,
                        0
                      ),
                      100
                    )}%`,
                    backgroundColor:
                      scoreColor,
                  },
                ]}
              />
            </View>
          )}

          {/* Description */}
          <Text
            style={styles.scoreDescription}
          >
            {hasEmployabilityAnalysis
              ? 'Your CareerForge AI analysis is ready.'
              : 'Complete your career assessment to get your score.'}
          </Text>

          {/* Button */}
          <View
            style={styles.scoreActionButton}
          >
            <Text
              style={styles.scoreActionText}
            >
              {hasEmployabilityAnalysis
                ? 'View Full AI Analysis  →'
                : 'Start Employability Analysis  →'}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Career Credits */}
      <View style={styles.creditCard}>
        <View>
          <Text style={styles.creditLabel}>
            Career Credits
          </Text>

          <Text style={styles.creditAmount}>
            240 ⭐
          </Text>
        </View>

        <Text
          style={styles.creditDescription}
        >
          Keep completing activities to earn more.
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionGrid}>
        {/* AI Career Assistant */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/ai-career-assistant'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🤖
          </Text>

          <Text style={styles.actionTitle}>
            AI Career
          </Text>

          <Text style={styles.actionTitle}>
            Assistant
          </Text>
        </Pressable>

        {/* Career Roadmap */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/career-roadmap'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🧭
          </Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Roadmap
          </Text>
        </Pressable>

        {/* Find Opportunities */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/opportunities'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🔍
          </Text>

          <Text style={styles.actionTitle}>
            Find
          </Text>

          <Text style={styles.actionTitle}>
            Opportunities
          </Text>
        </Pressable>

        {/* My Applications */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/applications'
            )
          }
        >
          <Text style={styles.actionIcon}>
            📋
          </Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Applications
          </Text>
        </Pressable>

        {/* Saved Opportunities */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/saved-opportunities'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🔖
          </Text>

          <Text style={styles.actionTitle}>
            Saved
          </Text>

          <Text style={styles.actionTitle}>
            Opportunities
          </Text>
        </Pressable>

        {/* Career Goals */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/career-goals'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🎯
          </Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Goals
          </Text>
        </Pressable>

        {/* Connections */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/connections'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🤝
          </Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Connections
          </Text>
        </Pressable>

        {/* Messages */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/messages'
            )
          }
        >
          <Text style={styles.actionIcon}>
            💬
          </Text>

          <Text style={styles.actionTitle}>
            My
          </Text>

          <Text style={styles.actionTitle}>
            Messages
          </Text>
        </Pressable>

        {/* Social Feed */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/social-feed'
            )
          }
        >
          <Text style={styles.actionIcon}>
            📰
          </Text>

          <Text style={styles.actionTitle}>
            Social
          </Text>

          <Text style={styles.actionTitle}>
            Feed
          </Text>
        </Pressable>

        {/* Career Pathways */}
        <Pressable
          style={styles.actionCard}
          onPress={() =>
            router.push(
              '/student/career-pathways'
            )
          }
        >
          <Text style={styles.actionIcon}>
            🧭
          </Text>

          <Text style={styles.actionTitle}>
            Career
          </Text>

          <Text style={styles.actionTitle}>
            Pathways
          </Text>
        </Pressable>
      </View>

      {/* My Career Paths + Events */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 25,
        }}
      >
        {/* My Career Paths */}
        <Pressable
          style={{
            width: '48%',
            minHeight: 120,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: '#D9E1EA',
            justifyContent: 'center',
            shadowColor: '#0B1F3A',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.07,
            shadowRadius: 7,
            elevation: 2,
          }}
          onPress={() =>
            router.push(
              '/student/my-career-paths'
            )
          }
        >
          <Text style={styles.actionIcon}>
            ⭐
          </Text>

          <Text style={styles.actionTitle}>
            My Career
          </Text>

          <Text style={styles.actionTitle}>
            Paths
          </Text>
        </Pressable>

        {/* Events */}
        <Pressable
          style={{
            width: '48%',
            minHeight: 120,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: '#D9E1EA',
            justifyContent: 'center',
            shadowColor: '#0B1F3A',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.07,
            shadowRadius: 7,
            elevation: 2,
          }}
          onPress={() =>
            router.push(
              '/student/events'
            )
          }
        >
          <Text style={styles.actionIcon}>
            📅
          </Text>

          <Text style={styles.actionTitle}>
            Events
          </Text>
        </Pressable>
      </View>

      {/* Recommended Opportunities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recommended Opportunities
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              '/student/opportunities'
            )
          }
        >
          <Text style={styles.viewAll}>
            View All
          </Text>
        </Pressable>
      </View>

      {recommendedOpportunities.length ===
      0 ? (
        <View style={styles.opportunityCard}>
          <View
            style={styles.opportunityIcon}
          >
            <Text>💼</Text>
          </View>

          <View
            style={styles.opportunityInfo}
          >
            <Text
              style={
                styles.opportunityTitle
              }
            >
              No opportunities available
            </Text>

            <Text style={styles.company}>
              Check back later for new opportunities.
            </Text>
          </View>
        </View>
      ) : (
        recommendedOpportunities.map(
          (opportunity, index) => (
            <Pressable
              key={opportunity.id}
              style={
                styles.opportunityCard
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/student/opportunity-details',
                  params: {
                    id: String(
                      opportunity.id
                    ),
                  },
                })
              }
            >
              <View
                style={
                  styles.opportunityIcon
                }
              >
                <Text>
                  {index === 0
                    ? '💻'
                    : index === 1
                    ? '📊'
                    : '📈'}
                </Text>
              </View>

              <View
                style={
                  styles.opportunityInfo
                }
              >
                <Text
                  style={
                    styles.opportunityTitle
                  }
                  numberOfLines={2}
                >
                  {opportunity.title}
                </Text>

                <Text
                  style={styles.company}
                  numberOfLines={1}
                >
                  {opportunity.company_name ||
                    'CareerForge Opportunity'}
                </Text>

                <Text
                  style={styles.location}
                  numberOfLines={2}
                >
                  📍{' '}
                  {opportunity.location ||
                    'Location not specified'}{' '}
                  •{' '}
                  {formatOpportunityType(
                    opportunity.type
                  )}
                </Text>
              </View>
            </Pressable>
          )
        )
      )}

      {/* Career Progress */}
      <Text style={styles.sectionTitle}>
        Career Progress
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Profile Completion
          </Text>

          <Text
            style={[
              styles.progressValue,
              {
                color: progressColor,
              },
            ]}
          >
            {profileCompletion}%
          </Text>
        </View>

        <View
          style={styles.progressBackground}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${profileCompletion}%`,
                backgroundColor:
                  progressColor,
              },
            ]}
          />
        </View>

        <Text style={styles.progressHint}>
          Complete your profile to improve
          opportunity matches.
        </Text>
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 45,
  },

  /* Header */
  header: {
    backgroundColor: '#416697',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: 0.2,
  },

  name: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E3FF',
  },

  notificationIcon: {
    fontSize: 20,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  profileIcon: {
    fontSize: 21,
  },

  /* Employability Score */
  scoreCard: {
    backgroundColor: '#1e5397',
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
    overflow: 'hidden',
  },

  scoreContent: {
    flex: 1,
  },

  scoreTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  scoreHeadingArea: {
    flex: 1,
    paddingRight: 12,
  },

  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },

  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor:
      'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 3,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.20)',
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  score: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 4,
  },

  scoreDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 17,
  },

  scoreCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreCircleText: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '800',
  },

  scoreCirclePercent: {
    fontSize: 10,
    fontWeight: '700',
  },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },

  levelLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginRight: 6,
  },

  levelValue: {
    fontSize: 12,
    fontWeight: '800',
  },

  scoreProgressBackground: {
    height: 6,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 13,
  },

  scoreProgressFill: {
    height: '100%',
    borderRadius: 10,
  },

  scoreActionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 12,
  },

  scoreActionText: {
    color: '#1e5397',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Career Credits */
  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginBottom: 25,
  },

  creditLabel: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '600',
  },

  creditAmount: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 3,
  },

  creditDescription: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 7,
  },

  /* Sections */
  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAll: {
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Quick Actions */
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  actionCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    justifyContent: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

  careerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  smallActionCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    justifyContent: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
    lineHeight: 19,
  },

  /* Opportunities */
  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  opportunityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  opportunityInfo: {
    flex: 1,
  },

  opportunityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  company: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },

  location: {
    fontSize: 12,
    color: '#64748B',
  },

  /* Career Progress */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginBottom: 25,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1F3A',
  },

  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  progressHint: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },

  /* Logout */
  logoutButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 13,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  logoutText: {
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 15,
  },
});