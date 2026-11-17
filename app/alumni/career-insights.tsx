import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

type CareerPath = {
  career?: string;
  title?: string;
  why_it_fits?: string;
  description?: string;
  readiness?: string;
  important_skills?: string[];
  missing_skills?: string[];
  next_step?: string;
  match_percentage?: number;
  match?: number;
};

type PrioritySkill = {
  skill?: string;
  name?: string;
  priority?: string;
  reason?: string;
};

type Employability = {
  score: number;
  level: string;
  overall_assessment: string;
  strengths: string[];
  weaknesses: string[];
  score_factors?: any[];
};

type SkillGap = {
  existing_skills: string[];
  strong_skills: string[];
  skills_to_improve: string[];
  missing_skills: string[];
  priority_skills: PrioritySkill[];
};

type AlumniAIAnalysis = {
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

export default function CareerInsights() {
  const [analysis, setAnalysis] =
    useState<AlumniAIAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
   * Safely convert AI values into strings.
   * This prevents React errors if Gemini returns
   * an object instead of a plain string.
   */
  const safeString = (
    value: any,
    fallback = ''
  ): string => {
    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    if (value && typeof value === 'object') {
      return (
        value.skill ||
        value.name ||
        value.title ||
        value.career ||
        value.description ||
        value.reason ||
        ''
      );
    }

    return fallback;
  };

  /*
   * Make sure AI arrays are always safe to render.
   */
  const safeStringArray = (
    value: any
  ): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => safeString(item))
      .filter((item) => item.trim() !== '');
  };

  /*
   * Load the latest Alumni AI analysis.
   */
  const loadAnalysis = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const token =
          await AsyncStorage.getItem('authToken');

        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/alumni/ai-analysis-result.php`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseText =
          await response.text();

        console.log(
          'Alumni AI Result Status:',
          response.status
        );

        console.log(
          'Alumni AI Result:',
          responseText
        );

        let result: any;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            'The server returned an invalid response.'
          );
        }

        /*
         * Token is no longer valid.
         */
        if (response.status === 401) {
          await AsyncStorage.multiRemove([
            'authToken',
            'user',
          ]);

          router.replace('/login');
          return;
        }

        /*
         * No analysis exists yet.
         * This is handled by generateAnalysis().
         */
        if (
          response.status === 404 ||
          result?.success === false
        ) {
          setAnalysis(null);
          return;
        }

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              'Unable to load career insights.'
          );
        }

        const data = result.data || {};

        const employability =
          data.employability || {};

        const skillGap =
          data.skill_gap || {};

        /*
         * Normalize all AI arrays so the UI
         * never attempts to render an object.
         */
        const normalizedAnalysis: AlumniAIAnalysis = {
          assessment_id: Number(
            data.assessment_id || 0
          ),

          target_role: safeString(
            data.target_role,
            'Career Professional'
          ),

          score: Number(
            data.score ??
              employability.score ??
              0
          ),

          created_at:
            data.created_at || '',

          employability: {
            score: Number(
              employability.score ??
                data.score ??
                0
            ),

            level: safeString(
              employability.level,
              'Career Ready'
            ),

            overall_assessment:
              safeString(
                employability.overall_assessment,
                'Your AI career analysis is ready.'
              ),

            strengths:
              safeStringArray(
                employability.strengths
              ),

            weaknesses:
              safeStringArray(
                employability.weaknesses
              ),

            score_factors:
              Array.isArray(
                employability.score_factors
              )
                ? employability.score_factors
                : [],
          },

          skill_gap: {
            existing_skills:
              safeStringArray(
                skillGap.existing_skills
              ),

            strong_skills:
              safeStringArray(
                skillGap.strong_skills
              ),

            skills_to_improve:
              safeStringArray(
                skillGap.skills_to_improve
              ),

            missing_skills:
              safeStringArray(
                skillGap.missing_skills
              ),

            priority_skills:
              Array.isArray(
                skillGap.priority_skills
              )
                ? skillGap.priority_skills
                    .map((item: any) => ({
                      skill: safeString(
                        item?.skill ||
                          item?.name
                      ),
                      name: safeString(
                        item?.name ||
                          item?.skill
                      ),
                      priority:
                        safeString(
                          item?.priority
                        ),
                      reason:
                        safeString(
                          item?.reason
                        ),
                    }))
                    .filter(
                      (item: PrioritySkill) =>
                        !!item.skill
                    )
                : [],
          },

          career_paths:
            Array.isArray(
              data.career_paths
            )
              ? data.career_paths.map(
                  (career: any) => ({
                    career: safeString(
                      career?.career ||
                        career?.title,
                      'Career Path'
                    ),

                    title: safeString(
                      career?.title ||
                        career?.career
                    ),

                    why_it_fits:
                      safeString(
                        career?.why_it_fits
                      ),

                    description:
                      safeString(
                        career?.description ||
                          career?.why_it_fits
                      ),

                    readiness:
                      safeString(
                        career?.readiness
                      ),

                    important_skills:
                      safeStringArray(
                        career?.important_skills
                      ),

                    missing_skills:
                      safeStringArray(
                        career?.missing_skills
                      ),

                    next_step:
                      safeString(
                        career?.next_step
                      ),

                    match_percentage:
                      Number(
                        career?.match_percentage ??
                          career?.match ??
                          0
                      ),

                    match:
                      Number(
                        career?.match ??
                          career?.match_percentage ??
                          0
                      ),
                  })
                )
              : [],

          roadmap:
            Array.isArray(data.roadmap)
              ? data.roadmap
              : [],

          recommendations:
            safeStringArray(
              data.recommendations
            ),
        };

        setAnalysis(
          normalizedAnalysis
        );
      } catch (err: any) {
        console.error(
          'Error loading Alumni AI analysis:',
          err
        );

        setError(
          err?.message ||
            'Unable to load career insights.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Generate a new Alumni AI analysis.
   */
  const generateAnalysis =
    useCallback(async () => {
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

        const response = await fetch(
          `${API_BASE_URL}/alumni/ai-analysis.php`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            /*
             * The Alumni AI endpoint can determine
             * the career direction from the profile.
             */
            body: JSON.stringify({
              target_role: '',
            }),
          }
        );

        const responseText =
          await response.text();

        console.log(
          'Alumni AI Generation Status:',
          response.status
        );

        console.log(
          'Alumni AI Generation:',
          responseText
        );

        let result: any;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            'The server returned an invalid response.'
          );
        }

        if (response.status === 401) {
          await AsyncStorage.multiRemove([
            'authToken',
            'user',
          ]);

          router.replace('/login');
          return;
        }

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              'Unable to generate career insights.'
          );
        }

        /*
         * Once Gemini has generated the analysis,
         * load the saved result from the separate
         * Alumni result endpoint.
         */
        await loadAnalysis();

        Alert.alert(
          'Career Insights Ready',
          'Your AI-powered career insights have been generated successfully.'
        );
      } catch (err: any) {
        console.error(
          'Error generating Alumni AI analysis:',
          err
        );

        setError(
          err?.message ||
            'Unable to generate career insights.'
        );

        Alert.alert(
          'Unable to Generate',
          err?.message ||
            'Please try again.'
        );
      } finally {
        setGenerating(false);
      }
    }, [loadAnalysis]);

  /*
   * Load existing analysis whenever this screen
   * becomes active.
   *
   * If no analysis exists yet, automatically
   * generate the first one.
   */
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const initialise = async () => {
        await loadAnalysis();

        if (!active) {
          return;
        }
      };

      initialise();

      return () => {
        active = false;
      };
    }, [loadAnalysis])
  );

  /*
   * Automatically generate the analysis if the
   * result endpoint says there is none.
   *
   * This keeps the existing UI unchanged.
   */
  React.useEffect(() => {
    if (
      !loading &&
      !analysis &&
      !generating &&
      !error
    ) {
      generateAnalysis();
    }
  }, [
    loading,
    analysis,
    generating,
    error,
    generateAnalysis,
  ]);

  /*
   * Refresh the analysis manually.
   */
  const handleRefresh = async () => {
    await generateAnalysis();
  };

  /*
   * Determine a percentage for the profile
   * strength section.
   *
   * The current Alumni AI endpoint provides
   * an overall employability score, but does not
   * provide separate Profile / Skills / Experience
   * percentages.
   *
   * Therefore we use the AI score as the current
   * dynamic value rather than inventing separate
   * AI values.
   */
  const overallScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          analysis?.employability?.score ||
            analysis?.score ||
            0
        )
      )
    );

  const profileStrength =
    overallScore;

  const skillsStrength =
    overallScore;

  const experienceStrength =
    overallScore;

  /*
   * Strongest skills.
   */
  const strongestSkills =
    analysis?.skill_gap?.strong_skills ||
    [];

  /*
   * Skills to improve.
   */
  const skillsToImprove =
    analysis?.skill_gap?.skills_to_improve ||
    [];

  const prioritySkills =
    analysis?.skill_gap?.priority_skills ||
    [];

  /*
   * Career paths.
   */
  const careerPaths =
    analysis?.career_paths ||
    [];

  /*
   * Recommended actions.
   */
  const recommendations =
    analysis?.recommendations ||
    [];

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
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

        {/* Loading */}
        {loading || generating ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />

            <Text style={styles.loadingTitle}>
              {generating
                ? 'Generating your AI career insights...'
                : 'Loading your career insights...'}
            </Text>

            <Text style={styles.loadingText}>
              CareerForge AI is analysing your profile,
              skills and professional experience.
            </Text>
          </View>
        ) : null}

        {/* Error */}
        {!loading &&
        !generating &&
        error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Unable to Load Insights
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Employability Score */}
        {!loading &&
        !generating &&
        analysis ? (
          <>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>
                Employability Score
              </Text>

              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>
                  {Math.round(
                    analysis.employability.score
                  )}
                </Text>

                <Text style={styles.scorePercent}>
                  %
                </Text>
              </View>

              <Text style={styles.scoreStatus}>
                {analysis.employability.level}
              </Text>

              <Text style={styles.scoreDescription}>
                {analysis.employability.overall_assessment}
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
                  {Math.round(profileStrength)}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${profileStrength}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  Skills
                </Text>

                <Text style={styles.progressValue}>
                  {Math.round(skillsStrength)}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${skillsStrength}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  Experience
                </Text>

                <Text style={styles.progressValue}>
                  {Math.round(experienceStrength)}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${experienceStrength}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Strong Skills */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Your Strongest Skills
              </Text>

              {strongestSkills.length > 0 ? (
                strongestSkills.map(
                  (skill, index) => (
                    <View
                      key={`${skill}-${index}`}
                      style={styles.skillRow}
                    >
                      <View
                        style={styles.skillInfo}
                      >
                        <Text
                          style={styles.skillName}
                        >
                          {safeString(skill)}
                        </Text>

                        <Text
                          style={styles.skillLevel}
                        >
                          Strong Skill
                        </Text>
                      </View>

                      <Text
                        style={styles.skillScore}
                      >
                        ✓
                      </Text>
                    </View>
                  )
                )
              ) : (
                <Text style={styles.emptyText}>
                  No strongest skills were identified
                  yet.
                </Text>
              )}
            </View>

            {/* Skills to Improve */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Skills to Improve
              </Text>

              {skillsToImprove.length > 0 ? (
                skillsToImprove.map(
                  (skill, index) => (
                    <View
                      key={`${skill}-${index}`}
                      style={
                        styles.improvementItem
                      }
                    >
                      <Text
                        style={
                          styles.improvementTitle
                        }
                      >
                        {safeString(skill)}
                      </Text>

                      <Text
                        style={
                          styles.improvementText
                        }
                      >
                        This skill was identified by
                        CareerForge AI as an area that
                        could strengthen your career
                        readiness.
                      </Text>
                    </View>
                  )
                )
              ) : prioritySkills.length > 0 ? (
                prioritySkills.map(
                  (
                    item,
                    index
                  ) => (
                    <View
                      key={`${item.skill}-${index}`}
                      style={
                        styles.improvementItem
                      }
                    >
                      <Text
                        style={
                          styles.improvementTitle
                        }
                      >
                        {safeString(
                          item.skill ||
                            item.name
                        )}
                      </Text>

                      <Text
                        style={
                          styles.improvementText
                        }
                      >
                        {safeString(
                          item.reason,
                          'Developing this skill could strengthen your career readiness.'
                        )}
                      </Text>
                    </View>
                  )
                )
              ) : (
                <Text style={styles.emptyText}>
                  No skill gaps were identified yet.
                </Text>
              )}
            </View>

            {/* Recommended Careers */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Recommended Career Paths
              </Text>

              {careerPaths.length > 0 ? (
                careerPaths.map(
                  (
                    career,
                    index
                  ) => {
                    const match = Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          career.match_percentage ??
                            career.match ??
                            0
                        )
                      )
                    );

                    return (
                      <View
                        key={`${career.career}-${index}`}
                        style={styles.careerCard}
                      >
                        <Text
                          style={
                            styles.careerTitle
                          }
                        >
                          {safeString(
                            career.career ||
                              career.title,
                            'Career Path'
                          )}
                        </Text>

                        <Text
                          style={styles.match}
                        >
                          {Math.round(match)}% Match
                        </Text>

                        <Text
                          style={
                            styles.careerDescription
                          }
                        >
                          {safeString(
                            career.why_it_fits ||
                              career.description,
                            'This career path was recommended based on your profile, skills and experience.'
                          )}
                        </Text>

                        <Pressable
                          style={
                            styles.smallButton
                          }
                          onPress={() =>
                            router.push(
                              '/alumni/opportunities'
                            )
                          }
                        >
                          <Text
                            style={
                              styles.smallButtonText
                            }
                          >
                            Explore Career
                          </Text>
                        </Pressable>
                      </View>
                    );
                  }
                )
              ) : (
                <Text style={styles.emptyText}>
                  No career paths were generated yet.
                </Text>
              )}
            </View>

            {/* AI Insight */}
            <View style={styles.aiCard}>
              <Text style={styles.aiTitle}>
                ✦ AI Career Insight
              </Text>

              <Text style={styles.aiText}>
                {analysis.employability.overall_assessment}
              </Text>

              <Pressable
                style={styles.aiButton}
                onPress={() =>
                  router.push(
                    '/alumni/career-roadmap'
                  )
                }
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

              {recommendations.length > 0 ? (
                recommendations
                  .slice(0, 6)
                  .map(
                    (
                      recommendation,
                      index
                    ) => (
                      <View
                        key={`${recommendation}-${index}`}
                        style={styles.actionRow}
                      >
                        <Text
                          style={
                            styles.actionNumber
                          }
                        >
                          {index + 1}
                        </Text>

                        <Text
                          style={styles.actionText}
                        >
                          {safeString(
                            recommendation
                          )}
                        </Text>
                      </View>
                    )
                  )
              ) : (
                <>
                  <View style={styles.actionRow}>
                    <Text
                      style={
                        styles.actionNumber
                      }
                    >
                      1
                    </Text>

                    <Text
                      style={styles.actionText}
                    >
                      Continue developing your
                      professional skills
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Text
                      style={
                        styles.actionNumber
                      }
                    >
                      2
                    </Text>

                    <Text
                      style={styles.actionText}
                    >
                      Build practical experience and
                      projects
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Text
                      style={
                        styles.actionNumber
                      }
                    >
                      3
                    </Text>

                    <Text
                      style={styles.actionText}
                    >
                      Apply for relevant opportunities
                    </Text>
                  </View>
                </>
              )}

              {/* Refresh AI analysis */}
              <Pressable
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={generating}
              >
                <Text
                  style={
                    styles.refreshButtonText
                  }
                >
                  {generating
                    ? 'Generating...'
                    : 'Refresh AI Insights'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

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

  /*
   * Added only for the AI loading/error states.
   * Existing N styling above is unchanged.
   */
  loadingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 15,
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    marginTop: 7,
    textAlign: 'center',
  },

  errorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    marginTop: 7,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    marginTop: 14,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  refreshButton: {
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  refreshButtonText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
  },
});

