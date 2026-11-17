import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');


const COLORS = {
  navy: '#071A33',
  navy2: '#0B2547',
  blue: '#36B7FF',
  blueSoft: '#7DD8FF',
  purple: '#8B5CF6',
  pink: '#D946EF',
  white: '#FFFFFF',
  background: '#F5F8FD',
  text: '#10233F',
  muted: '#6B7A90',
  border: '#E2E8F2',
  success: '#18B887',
  warning: '#F59E0B',
  danger: '#EF5B72',
};

type ScoreFactor = {
  factor: string;
  score: number;
  explanation: string;
};

type PrioritySkill = {
  skill: string;
  priority: string;
  reason: string;
};

type CareerPath = {
  career: string;
  why_it_fits: string;
  readiness: string;
  important_skills: string[];
  missing_skills: string[];
  next_step: string;
};

type Employability = {
  score: number;
  level: string;
  overall_assessment: string;
  strengths: string[];
  weaknesses: string[];
  score_factors: ScoreFactor[];
};

type SkillRequirement = {
  skill_id?: number;
  skill_code?: string;
  skill?: string;
  student_level?: string | number;
  required_level?: string | number;
  importance?: string;
  match_percentage?: number;
  priority?: string;
  reason?: string;
};

type SkillGap = {
  existing_skills: string[];
  strong_skills: string[];
  skills_to_improve: string[];
  missing_skills: string[];
  priority_skills: PrioritySkill[];
};

type AIAnalysis = {
  assessment_id: number;
  target_role: string;
  score: number;
  created_at: string;
  employability: Employability;
  skill_gap: SkillGap;
  career_paths: CareerPath[];
  roadmap: any[];
  recommendations: string[];
};


// =========================================================
// NORMALIZATION FUNCTIONS
// =========================================================

const getSkillName = (skill: unknown): string => {
  // Already a string
  if (typeof skill === 'string') {
    return skill.trim();
  }

  // Skill object
  if (skill && typeof skill === 'object') {
    const item = skill as SkillRequirement;

    if (typeof item.skill === 'string') {
      return item.skill.trim();
    }

    if (typeof item.skill_code === 'string') {
      return item.skill_code.trim();
    }
  }

  return '';
};

const getPriority = (item: SkillRequirement): string => {
  if (
    typeof item.priority === 'string' &&
    item.priority.trim()
  ) {
    return item.priority;
  }

  if (item.importance === 'essential') {
    return 'High';
  }

  if (item.importance === 'important') {
    return 'Medium';
  }

  return 'Low';
};

const normalizeSkillList = (
  items: unknown
): string[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => getSkillName(item))
    .filter(
      (skill): skill is string =>
        typeof skill === 'string' &&
        skill.trim().length > 0
    );
};

const normalizePrioritySkills = (
  items: unknown
): PrioritySkill[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item): PrioritySkill | null => {
      if (
        typeof item === 'string'
      ) {
        return {
          skill: item,
          priority: 'Low',
          reason: '',
        };
      }

      if (
        !item ||
        typeof item !== 'object'
      ) {
        return null;
      }

      const skillItem =
        item as SkillRequirement;

      const skillName =
        getSkillName(skillItem);

      if (!skillName) {
        return null;
      }

      return {
        skill: skillName,

        priority:
          getPriority(skillItem),

        reason:
          typeof skillItem.reason === 'string'
            ? skillItem.reason
            : typeof skillItem.match_percentage ===
                'number'
            ? `${Math.round(
                skillItem.match_percentage
              )}% match with your current skill level.`
            : '',
      };
    })
    .filter(
      (
        item
      ): item is PrioritySkill =>
        item !== null &&
        item.skill.length > 0
    );
};

const normalizeCareerPaths = (
  items: unknown
): CareerPath[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((path: any): CareerPath => ({
      career:
        typeof path?.career === 'string'
          ? path.career
          : typeof path?.title === 'string'
          ? path.title
          : 'Career Path',

      why_it_fits:
        typeof path?.why_it_fits === 'string'
          ? path.why_it_fits
          : typeof path?.reason === 'string'
          ? path.reason
          : '',

      readiness:
        typeof path?.readiness === 'string'
          ? path.readiness
          : 'Developing',

      important_skills:
        normalizeSkillList(
          path?.important_skills ??
            path?.skills_needed
        ),

      missing_skills:
        normalizeSkillList(
          path?.missing_skills
        ),

      next_step:
        typeof path?.next_step === 'string'
          ? path.next_step
          : '',
    }));

};

const normalizeAnalysis = (
  data: any
): AIAnalysis => {
  const skillGap =
    data?.skill_gap &&
    typeof data.skill_gap === 'object' &&
    !Array.isArray(data.skill_gap)
      ? data.skill_gap
      : {};

  const employability =
    data?.employability &&
    typeof data.employability === 'object'
      ? data.employability
      : {};

  return {
    assessment_id:
      Number(data?.assessment_id ?? 0),

    target_role:
      typeof data?.target_role === 'string' &&
      data.target_role.trim()
        ? data.target_role.trim()
        : 'General Career Development',

    score: Number(
      employability?.score ??
        data?.score ??
        0
    ),

    created_at:
      typeof data?.created_at === 'string'
        ? data.created_at
        : '',

    employability: {
      score: Number(
        employability?.score ??
          data?.score ??
          0
      ),

      level:
        typeof employability?.level ===
          'string'
          ? employability.level
          : 'Needs Improvement',

      overall_assessment:
        typeof employability?.overall_assessment ===
          'string'
          ? employability.overall_assessment
          : '',

      strengths:
        normalizeSkillList(
          employability?.strengths
        ),

      weaknesses:
        normalizeSkillList(
          employability?.weaknesses
        ),

      score_factors:
        Array.isArray(
          employability?.score_factors
        )
          ? employability.score_factors
              .map(
                (factor: any) => ({
                  factor:
                    typeof factor?.factor ===
                      'string'
                      ? factor.factor
                      : '',

                  score: Number(
                    factor?.score ?? 0
                  ),

                  explanation:
                    typeof factor?.explanation ===
                      'string'
                      ? factor.explanation
                      : '',
                })
              )
              .filter(
                (
                  factor: ScoreFactor
                ) => factor.factor
              )
          : [],
    },

    skill_gap: {
      existing_skills:
        normalizeSkillList(
          skillGap?.existing_skills
        ),

      strong_skills:
        normalizeSkillList(
          skillGap?.strong_skills
        ),

      skills_to_improve:
        normalizeSkillList(
          skillGap?.skills_to_improve
        ),

      missing_skills:
        normalizeSkillList(
          skillGap?.missing_skills
        ),

      priority_skills:
        normalizePrioritySkills(
          skillGap?.priority_skills ??
            skillGap?.skills_to_improve ??
            skillGap?.missing_skills
        ),
    },

    career_paths:
      normalizeCareerPaths(
        data?.career_paths
      ),

    roadmap:
      Array.isArray(data?.roadmap)
        ? data.roadmap
        : [],

    recommendations:
      Array.isArray(
        data?.recommendations
      )
        ? data.recommendations.filter(
            (
              item: unknown
            ): item is string =>
              typeof item === 'string'
          )
        : [],
  };
};






export default function EmployabilityAnalysisScreen() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
    const [displayScore, setDisplayScore] = useState(0);
    const [targetRole, setTargetRole] = useState('');

  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  

  /*
   * ---------------------------------------------------------
   * ANIMATIONS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!analysis) {
        return;
    }

    scoreAnimation.setValue(0);
    setDisplayScore(0);

    const listenerId = scoreAnimation.addListener(({ value }) => {
        setDisplayScore(Math.round(value));
    });

    Animated.timing(scoreAnimation, {
        toValue: analysis.employability.score,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
    }).start();

    return () => {
        scoreAnimation.removeListener(listenerId);
    };
    }, [analysis]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  

   
  /*
   * ---------------------------------------------------------
   * LOAD SAVED ANALYSIS
   * ---------------------------------------------------------
   */

  const loadAnalysis = async (showLoader = true) => {
  try {
    if (showLoader) {
      setLoading(true);
    }

    setError('');

    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/ai-analysis-result.php`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rawResponse = await response.text();

    let result;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      throw new Error(
        `Server returned a non-JSON response. HTTP ${response.status}`
      );
    }

    console.log(
      'Saved AI Analysis Result:',
      JSON.stringify(result, null, 2)
    );

    if (response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      router.replace('/login');
      return;
    }

    if (response.status === 404) {
      setAnalysis(null);
      return;
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || 'Unable to load your employability analysis.'
      );
    }

    setAnalysis(normalizeAnalysis(result.data));

  } catch (err) {
    console.error('Load AI Analysis Error:', err);

    setError(
      err instanceof Error
        ? err.message
        : 'Unable to load your employability analysis.'
    );

  } finally {
    if (showLoader) {
      setLoading(false);
    }

    setRefreshing(false);
  }
};

  useFocusEffect(
    useCallback(() => {
      loadAnalysis();
    }, [])
  );

  /*
   * ---------------------------------------------------------
   * GENERATE NEW AI ANALYSIS
   * ---------------------------------------------------------
   */
  
  const loadTargetRole = async (
      token: string
    ): Promise<string> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/profiles/student.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          return '';
        }

        const result = await response.json();

        const student =
          result?.data?.student ??
          result?.data ??
          result?.student ??
          {};

        const role =
          typeof student?.target_role === 'string'
            ? student.target_role.trim()
            : '';

        setTargetRole(role);

        return role;
      } catch (err) {
        console.error(
          'Load target role error:',
          err
        );

        return '';
      }
    };

const generateAnalysis = async () => {
    if (generating) {
      return;
    }

    try {
      setGenerating(true);
      setError('');

      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        router.replace('/login');
        return;
      }

      const savedTargetRole =
        await loadTargetRole(token);

      if (!savedTargetRole) {
        Alert.alert(
          'Target Career Required',
          'Please choose your target career in your Profile before generating your employability analysis.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/ai-analysis.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target_role:
              savedTargetRole,
          }),
        }
      );

      const result =
        await response.json();

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to generate your AI analysis.'
        );
      }

      setAnalysis(
        normalizeAnalysis(
          result.data
        )
      );

      Alert.alert(
        'Analysis Updated ✨',
        `CareerForge has analysed your profile against your target career: ${savedTargetRole}.`
      );
    } catch (err) {
      console.error(
        'Generate analysis error:',
        err
      );

      Alert.alert(
        'Analysis Failed',
        err instanceof Error
          ? err.message
          : 'Unable to generate your AI analysis.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalysis(false);
  };

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getScoreMessage = (score: number) => {
    if (score >= 80) {
      return 'You are highly prepared for the graduate job market.';
    }

    if (score >= 60) {
      return 'You have a solid foundation. A few targeted improvements can make you more competitive.';
    }

    if (score >= 40) {
      return 'You are developing well. CareerForge has identified areas that can strengthen your profile.';
    }

    return 'There is significant room for improvement. Your personalised roadmap can help you build momentum.';
  };

  const getReadinessStyle = (readiness: string) => {
    const value = readiness.toLowerCase();

    if (value.includes('ready')) {
      return {
        backgroundColor: '#E7FAF4',
        color: COLORS.success,
      };
    }

    if (
      value.includes('developing') ||
      value.includes('almost')
    ) {
      return {
        backgroundColor: '#FFF6DE',
        color: COLORS.warning,
      };
    }

    return {
      backgroundColor: '#FFECEF',
      color: COLORS.danger,
    };
  };

  const getPriorityStyle = (priority: string) => {
    const value = priority.toLowerCase();

    if (value === 'high') {
      return {
        backgroundColor: '#FFECEF',
        color: COLORS.danger,
      };
    }

    if (value === 'medium') {
      return {
        backgroundColor: '#FFF6DE',
        color: COLORS.warning,
      };
    }

    return {
      backgroundColor: '#EAF4FF',
      color: COLORS.blue,
    };
  };

  const formatDate = (date: string) => {
    if (!date) {
      return '';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Animated.View
          style={[
            styles.loadingOrb,
            {
              transform: [
                {
                  scale: pulseAnimation,
                },
              ],
            },
          ]}
        >
          <Text style={styles.loadingOrbText}>✦</Text>
        </Animated.View>

        <Text style={styles.loadingTitle}>
          Building your career intelligence
        </Text>

        <Text style={styles.loadingSubtitle}>
          CareerForge is retrieving your latest employability analysis...
        </Text>

        <ActivityIndicator
          size="large"
          color={COLORS.blue}
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */

  if (!analysis) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyHeader}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Employability Intelligence
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.emptyOrb,
              {
                transform: [
                  {
                    scale: pulseAnimation,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.emptyOrbText}>✦</Text>
          </Animated.View>

          <Text style={styles.emptyTitle}>
            Discover your career potential
          </Text>

          <Text style={styles.emptyText}>
            CareerForge will analyse your profile, skills,
            qualification, projects and career goals to build
            a personalised employability profile.
          </Text>

          <Pressable
            style={styles.generateButton}
            onPress={generateAnalysis}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.generateButtonIcon}>✦</Text>
                <Text style={styles.generateButtonText}>
                  Analyse My Employability
                </Text>
              </>
            )}
          </Pressable>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  const score = Math.round(
    analysis.employability.score
  );

  

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.65],
  });

  /*
   * ---------------------------------------------------------
   * MAIN SCREEN
   * ---------------------------------------------------------
   */

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.blue}
          />
        }
      >
        {/* -------------------------------------------------
            HERO
        -------------------------------------------------- */}

        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.heroGlow,
              {
                opacity: glowOpacity,
              },
            ]}
          />

          <View style={styles.heroHeader}>
            <Pressable
              style={styles.heroBackButton}
              onPress={() => router.back()}
            >
              <Text style={styles.heroBackText}>‹</Text>
            </Pressable>

            <View style={styles.aiBadge}>
              <View style={styles.aiBadgeDot} />
              <Text style={styles.aiBadgeText}>
                CAREERFORGE AI
              </Text>
            </View>

            <Pressable
              style={styles.heroRefresh}
              onPress={generateAnalysis}
              disabled={generating}
            >
              <Text style={styles.heroRefreshText}>
                {generating ? '…' : '↻'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.heroTitleArea}>
            <Text style={styles.heroEyebrow}>
              YOUR CAREER INTELLIGENCE
            </Text>

            <Text style={styles.heroTitle}>
              Employability
              {'\n'}
              <Text style={styles.heroTitleAccent}>
                Analysis
              </Text>
            </Text>

            <Text style={styles.heroDescription}>
              An evidence-based view of how prepared
              you are for your career journey.
            </Text>
          </View>

          {/* SCORE */}
          <Animated.View
            style={[
              styles.scoreOrb,
              {
                transform: [
                  {
                    scale: pulseAnimation,
                  },
                ],
              },
            ]}
          >
            <View style={styles.scoreOrbOuter}>
              <View style={styles.scoreOrbInner}>
                <Text style={styles.scoreNumber}>
                    {displayScore}
                </Text>

                <Text style={styles.scorePercent}>%</Text>

                <Text style={styles.scoreCaption}>
                  EMPLOYABILITY
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.levelPill}>
            <Text style={styles.levelPillIcon}>✦</Text>
            <Text style={styles.levelPillText}>
              {analysis.employability.level}
            </Text>
          </View>

          <Text style={styles.scoreMessage}>
            {getScoreMessage(score)}
          </Text>

          {analysis.created_at ? (
            <Text style={styles.updatedText}>
              Last analysed {formatDate(analysis.created_at)}
            </Text>
          ) : null}
        </View>

        <View style={styles.content}>

          {/* -------------------------------------------------
              AI VERDICT
          -------------------------------------------------- */}

          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  AI VERDICT
                </Text>

                <Text style={styles.sectionTitle}>
                  What CareerForge sees
                </Text>
              </View>

              <View style={styles.sparkleBadge}>
                <Text>✦</Text>
              </View>
            </View>

            <View style={styles.verdictCard}>
              <View style={styles.verdictAccent} />

              <Text style={styles.verdictText}>
                {analysis.employability.overall_assessment ||
                  'CareerForge has analysed your current profile and identified the areas that can influence your career readiness.'}
              </Text>
            </View>
          </View>

          {/* -------------------------------------------------
              SCORE FACTORS
          -------------------------------------------------- */}

          {analysis.employability.score_factors?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>
                YOUR SCORE
              </Text>

              <Text style={styles.sectionTitle}>
                What is driving your score?
              </Text>

              <View style={styles.factorCard}>
                {analysis.employability.score_factors.map(
                  (factor, index) => {
                    const factorScore = Math.round(
                      factor.score
                    );

                    return (
                      <View
                        key={`${factor.factor}-${index}`}
                        style={[
                          styles.factorRow,
                          index !==
                            analysis.employability
                              .score_factors.length -
                              1 &&
                            styles.factorBorder,
                        ]}
                      >
                        <View style={styles.factorLeft}>
                          <Text style={styles.factorName}>
                            {factor.factor}
                          </Text>

                          <Text
                            style={styles.factorExplanation}
                          >
                            {factor.explanation}
                          </Text>
                        </View>

                        <View style={styles.factorScoreBox}>
                          <Text style={styles.factorScore}>
                            {factorScore}
                          </Text>

                          <Text
                            style={styles.factorScorePercent}
                          >
                            %
                          </Text>
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          )}

          {/* -------------------------------------------------
              STRENGTHS / WEAKNESSES
          -------------------------------------------------- */}

          <View style={styles.twoColumnSection}>

            <View style={styles.halfCard}>
              <View style={styles.miniIconSuccess}>
                <Text>✓</Text>
              </View>

              <Text style={styles.miniTitle}>
                Your strengths
              </Text>

              {analysis.employability.strengths
                ?.slice(0, 5)
                .map((strength, index) => (
                  <View
                    key={`${strength}-${index}`}
                    style={styles.bulletRow}
                  >
                    <View style={styles.greenDot} />
                    <Text style={styles.bulletText}>
                      {strength}
                    </Text>
                  </View>
                ))}

              {analysis.employability.strengths?.length ===
                0 && (
                <Text style={styles.emptySmall}>
                  No strengths identified yet.
                </Text>
              )}
            </View>

            <View style={styles.halfCard}>
              <View style={styles.miniIconWarning}>
                <Text>!</Text>
              </View>

              <Text style={styles.miniTitle}>
                Growth areas
              </Text>

              {analysis.employability.weaknesses
                ?.slice(0, 5)
                .map((weakness, index) => (
                  <View
                    key={`${weakness}-${index}`}
                    style={styles.bulletRow}
                  >
                    <View style={styles.orangeDot} />
                    <Text style={styles.bulletText}>
                      {weakness}
                    </Text>
                  </View>
                ))}

              {analysis.employability.weaknesses?.length ===
                0 && (
                <Text style={styles.emptySmall}>
                  No major weaknesses identified.
                </Text>
              )}
            </View>

          </View>

          {/* -------------------------------------------------
              SKILL GAP
          -------------------------------------------------- */}

          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  SKILL INTELLIGENCE
                </Text>

                <Text style={styles.sectionTitle}>
                  Your skill gap
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push('/student/skills')
                }
              >
                <Text style={styles.linkText}>
                  Manage →
                </Text>
              </Pressable>
            </View>

            <View style={styles.skillCard}>

              {analysis.skill_gap.strong_skills?.length >
                0 && (
                <View style={styles.skillGroup}>
                  <Text style={styles.skillGroupTitle}>
                    Strong skills
                  </Text>

                  <View style={styles.chipContainer}>
                    {analysis.skill_gap.strong_skills
                      .slice(0, 8)
                      .map((skill, index) => (
                        <View
                          key={`${skill}-${index}`}
                          style={styles.strongChip}
                        >
                          <Text style={styles.strongChipText}>
                            ✓ {skill}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {analysis.skill_gap.skills_to_improve
                ?.length > 0 && (
                <View style={styles.skillGroup}>
                  <Text style={styles.skillGroupTitle}>
                    Skills to improve
                  </Text>

                  <View style={styles.chipContainer}>
                    {analysis.skill_gap.skills_to_improve
                      .slice(0, 8)
                      .map((skill, index) => (
                        <View
                          key={`${skill}-${index}`}
                          style={styles.improveChip}
                        >
                          <Text
                            style={styles.improveChipText}
                          >
                            ↗ {skill}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {analysis.skill_gap.missing_skills?.length >
                0 && (
                <View style={styles.skillGroup}>
                  <Text style={styles.skillGroupTitle}>
                    Missing skills
                  </Text>

                  <View style={styles.chipContainer}>
                    {analysis.skill_gap.missing_skills
                      .slice(0, 8)
                      .map((skill, index) => (
                        <View
                          key={`${skill}-${index}`}
                          style={styles.missingChip}
                        >
                          <Text style={styles.missingChipText}>
                            + {skill}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {analysis.skill_gap.priority_skills
                ?.length > 0 && (
                <View style={styles.prioritySection}>
                  <Text style={styles.skillGroupTitle}>
                    Priority skills
                  </Text>

                  {analysis.skill_gap.priority_skills
                    .slice(0, 5)
                    .map((item, index) => {
                      const priorityStyle =
                        getPriorityStyle(
                          item.priority
                        );

                      return (
                        <View
                          key={`${item.skill}-${index}`}
                          style={styles.priorityRow}
                        >
                          <View
                            style={styles.priorityNumber}
                          >
                            <Text
                              style={
                                styles.priorityNumberText
                              }
                            >
                              {index + 1}
                            </Text>
                          </View>

                          <View style={styles.priorityInfo}>
                            <View
                              style={
                                styles.priorityTitleRow
                              }
                            >
                              <Text
                                style={
                                  styles.prioritySkill
                                }
                              >
                                {item.skill}
                              </Text>

                              <View
                                style={[
                                  styles.priorityBadge,
                                  {
                                    backgroundColor:
                                      priorityStyle.backgroundColor,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.priorityBadgeText,
                                    {
                                      color:
                                        priorityStyle.color,
                                    },
                                  ]}
                                >
                                  {item.priority}
                                </Text>
                              </View>
                            </View>

                            <Text
                              style={styles.priorityReason}
                            >
                              {item.reason}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

            </View>
          </View>

          {/* -------------------------------------------------
              CAREER PATHS
          -------------------------------------------------- */}

          {analysis.career_paths?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>
                CAREER MATCH
              </Text>

              <Text style={styles.sectionTitle}>
                Paths that fit your profile
              </Text>

              {analysis.career_paths
                .slice(0, 5)
                .map((career, index) => {
                  const readinessStyle =
                    getReadinessStyle(
                      career.readiness
                    );

                  return (
                    <Pressable
                      key={`${career.career}-${index}`}
                      style={styles.careerCard}
                      onPress={() =>
                        router.push({
                          pathname:
                            '/student/career-path-details',
                          params: {
                            career: career.career,
                          },
                        })
                      }
                    >
                      <View style={styles.careerNumber}>
                        <Text style={styles.careerNumberText}>
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                      </View>

                      <View style={styles.careerInfo}>
                        <View
                          style={styles.careerTopRow}
                        >
                          <Text style={styles.careerName}>
                            {career.career}
                          </Text>

                          <View
                            style={[
                              styles.readinessBadge,
                              {
                                backgroundColor:
                                  readinessStyle.backgroundColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.readinessText,
                                {
                                  color:
                                    readinessStyle.color,
                                },
                              ]}
                            >
                              {career.readiness}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={styles.careerReason}
                          numberOfLines={3}
                        >
                          {career.why_it_fits}
                        </Text>

                        {career.next_step ? (
                          <Text
                            style={styles.careerNext}
                            numberOfLines={2}
                          >
                            Next: {career.next_step}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={styles.careerArrow}>
                        ›
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          )}

          {/* -------------------------------------------------
              RECOMMENDATIONS
          -------------------------------------------------- */}

          {analysis.recommendations?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>
                CAREERFORGE RECOMMENDS
              </Text>

              <Text style={styles.sectionTitle}>
                Your next moves
              </Text>

              <View style={styles.recommendationCard}>
                {analysis.recommendations
                  .slice(0, 6)
                  .map((recommendation, index) => (
                    <View
                      key={`${recommendation}-${index}`}
                      style={styles.recommendationRow}
                    >
                      <View style={styles.recommendationNumber}>
                        <Text
                          style={
                            styles.recommendationNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <Text style={styles.recommendationText}>
                        {recommendation}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* -------------------------------------------------
              ROADMAP CTA
          -------------------------------------------------- */}

          <Animated.View
            style={[
              styles.roadmapHero,
              {
                transform: [
                  {
                    scale: pulseAnimation,
                  },
                ],
              },
            ]}
          >
            <View style={styles.roadmapGlow} />

            <Text style={styles.roadmapEyebrow}>
              YOUR NEXT CHAPTER
            </Text>

            <Text style={styles.roadmapTitle}>
              Turn your analysis
              {'\n'}
              into action.
            </Text>

            <Text style={styles.roadmapText}>
              Your CareerForge roadmap turns these insights
              into a practical sequence of career-building
              steps.
            </Text>

            <Pressable
              style={styles.roadmapButton}
              onPress={() =>
                router.push('/student/career-roadmap')
              }
            >
              <Text style={styles.roadmapButtonText}>
                View My Career Roadmap
              </Text>

              <Text style={styles.roadmapButtonArrow}>
                →
              </Text>
            </Pressable>
          </Animated.View>

          {/* -------------------------------------------------
              REGENERATE
          -------------------------------------------------- */}

          <Pressable
            style={[
              styles.reanalyseButton,
              generating && styles.reanalyseDisabled,
            ]}
            onPress={generateAnalysis}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={COLORS.navy} />
            ) : (
              <>
                <Text style={styles.reanalyseIcon}>↻</Text>

                <View>
                  <Text style={styles.reanalyseTitle}>
                    Re-analyse my profile
                  </Text>

                  <Text style={styles.reanalyseSubtitle}>
                    Generate fresh AI insights
                  </Text>
                </View>
              </>
            )}
          </Pressable>

          <Text style={styles.disclaimer}>
            CareerForge's employability score is an
            analytical indicator based on the information
            available in your profile. It is not a guarantee
            of employment.
          </Text>

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  loadingOrb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(54,183,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(125,216,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  loadingOrbText: {
    color: COLORS.blueSoft,
    fontSize: 48,
  },

  loadingTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  loadingSubtitle: {
    color: '#A9BED8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },

  emptyHeader: {
    height: 105,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 42,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 36,
    marginTop: -3,
  },

  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 50,
  },

  emptyOrb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  emptyOrbText: {
    color: COLORS.blueSoft,
    fontSize: 70,
  },

  emptyTitle: {
    color: COLORS.navy,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },

  generateButton: {
    minHeight: 58,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  generateButtonIcon: {
    color: COLORS.blueSoft,
    fontSize: 20,
    marginRight: 10,
  },

  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 20,
  },

  /*
   * HERO
   */

  hero: {
    backgroundColor: COLORS.navy,
    minHeight: 620,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 34,
    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
    top: 80,
    left: width / 2 - 180,
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroBackText: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 36,
    marginTop: -3,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  aiBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginRight: 7,
  },

  aiBadgeText: {
    color: COLORS.blueSoft,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  heroRefresh: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroRefreshText: {
    color: COLORS.white,
    fontSize: 25,
  },

  heroTitleArea: {
    marginTop: 34,
    alignItems: 'center',
  },

  heroEyebrow: {
    color: COLORS.blueSoft,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },

  heroTitleAccent: {
    color: COLORS.blue,
  },

  heroDescription: {
    color: '#B7C7DA',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
    marginTop: 13,
  },

  scoreOrb: {
    alignSelf: 'center',
    marginTop: 30,
  },

  scoreOrbOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 2,
    borderColor: 'rgba(54,183,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(54,183,255,0.06)',
  },

  scoreOrbInner: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: '#0D2B50',
    borderWidth: 2,
    borderColor: 'rgba(217,70,239,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreNumber: {
    color: COLORS.white,
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 68,
  },

  scorePercent: {
    color: COLORS.blue,
    fontSize: 23,
    fontWeight: '900',
    marginTop: -5,
  },

  scoreCaption: {
    color: '#8EA6C1',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginTop: 7,
  },

  levelPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingVertical: 9,
    marginTop: 22,
  },

  levelPillIcon: {
    color: COLORS.blueSoft,
    fontSize: 14,
    marginRight: 7,
  },

  levelPillText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  scoreMessage: {
    color: '#B9C9DA',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
    paddingHorizontal: 25,
  },

  updatedText: {
    color: '#6E89A8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },

  /*
   * CONTENT
   */

  content: {
    padding: 20,
  },

  section: {
    marginBottom: 30,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 5,
  },

  sectionTitle: {
    color: COLORS.navy,
    fontSize: 23,
    fontWeight: '900',
  },

  sparkleBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sparkleBadgeText: {
    color: COLORS.purple,
  },

  verdictCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  verdictAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: COLORS.pink,
  },

  verdictText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  /*
   * FACTORS
   */

  factorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  factorRow: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
  },

  factorBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  factorLeft: {
    flex: 1,
    paddingRight: 15,
  },

  factorName: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '800',
  },

  factorExplanation: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  factorScoreBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  factorScore: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '900',
  },

  factorScorePercent: {
    color: COLORS.blue,
    fontSize: 8,
    fontWeight: '800',
    marginTop: -2,
  },

  /*
   * STRENGTHS
   */

  twoColumnSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  halfCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  miniIconSuccess: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E7FAF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  miniIconSuccessText: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '900',
  },

  miniIconWarning: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFF6DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  miniTitle: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginTop: 6,
    marginRight: 8,
  },

  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginTop: 6,
    marginRight: 8,
  },

  bulletText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  emptySmall: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  /*
   * SKILLS
   */

  skillCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },

  skillGroup: {
    marginBottom: 20,
  },

  skillGroupTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  strongChip: {
    backgroundColor: '#E7FAF4',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  strongChipText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },

  improveChip: {
    backgroundColor: '#EEF7FF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  improveChipText: {
    color: '#2587C4',
    fontSize: 11,
    fontWeight: '700',
  },

  missingChip: {
    backgroundColor: '#F3EEFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  missingChipText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '700',
  },

  prioritySection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 18,
  },

  priorityRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  priorityNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  priorityNumberText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  priorityInfo: {
    flex: 1,
  },

  priorityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  prioritySkill: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  priorityBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  priorityReason: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /*
   * CAREER PATHS
   */

  linkText: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: '800',
  },

  careerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  careerNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  careerNumberText: {
    color: COLORS.blueSoft,
    fontSize: 10,
    fontWeight: '900',
  },

  careerInfo: {
    flex: 1,
  },

  careerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  careerName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
  },

  readinessBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  readinessText: {
    fontSize: 8,
    fontWeight: '900',
  },

  careerReason: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  careerNext: {
    color: COLORS.purple,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 8,
  },

  careerArrow: {
    color: '#A5B3C4',
    fontSize: 27,
    marginLeft: 7,
  },

  /*
   * RECOMMENDATIONS
   */

  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },

  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  recommendationNumberText: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: '900',
  },

  recommendationText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },

  /*
   * ROADMAP
   */

  roadmapHero: {
    backgroundColor: COLORS.navy,
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },

  roadmapGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.pink,
    opacity: 0.16,
    right: -50,
    top: -50,
  },

  roadmapEyebrow: {
    color: COLORS.blueSoft,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  roadmapTitle: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    marginTop: 9,
  },

  roadmapText: {
    color: '#AFC2D8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },

  roadmapButton: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  roadmapButtonText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '900',
  },

  roadmapButtonArrow: {
    color: COLORS.purple,
    fontSize: 22,
    fontWeight: '900',
  },

  /*
   * REANALYSE
   */

  reanalyseButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  reanalyseDisabled: {
    opacity: 0.6,
  },

  reanalyseIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF7FF',
    color: COLORS.blue,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    marginRight: 12,
  },

  reanalyseTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '900',
  },

  reanalyseSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  disclaimer: {
    color: '#8A98AA',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 15,
  },
});
