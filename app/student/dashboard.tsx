import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL } from "@/constants/api";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type StudentProfile = {
  id?: string | number;
  user_id?: string | number;

  full_name?: string;
  name?: string;
  email?: string;

  qualification?: string;
  graduation_year?: string | number;
  campus?: string;
  bio?: string;

  current_company?: string;
  current_position?: string;

  employability_score?: string | number | null;
};

type User = {
  id?: string | number;
  name?: string;
  full_name?: string;
  first_name?: string;
  email?: string;
  role?: string;
};

type Opportunity = {
  id: string;
  title: string;
  company_name: string;
  matchScore: number;
};

type DashboardData = {
  profile: StudentProfile | null;
  opportunities: Opportunity[];
  skillsCount: number | null;
  careerPathCount: number | null;
  roadmapStepCount: number | null;
  skillGapCount: number | null;
  careerGoalsCount: number | null;
  aiScore: number | null;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getFirstName(
  user: User | null,
  profile: StudentProfile | null
): string {
  const possibleName =
    profile?.full_name ||
    profile?.name ||
    user?.full_name ||
    user?.name ||
    user?.first_name ||
    "";

  if (!possibleName.trim()) {
    return "Student";
  }

  return possibleName.trim().split(/\s+/)[0];
}

function normaliseScore(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(parsed))
  );
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  if (Array.isArray(data?.data?.skills)) {
    return data.data.skills;
  }

  if (Array.isArray(data?.data?.goals)) {
    return data.data.goals;
  }

  if (Array.isArray(data?.skills)) {
    return data.skills;
  }

  if (Array.isArray(data?.goals)) {
    return data.goals;
  }

  return [];
}

function calculateProfileCompletion(
  profile: StudentProfile | null
): number {
  if (!profile) {
    return 0;
  }

  const fields = [
    profile.full_name,
    profile.email,
    profile.qualification,
    profile.graduation_year,
    profile.campus,
    profile.bio,
    profile.current_company,
    profile.current_position,
  ];

  const completedFields = fields.filter(
    (field) =>
      field !== undefined &&
      field !== null &&
      String(field).trim() !== ""
  ).length;

  return Math.round(
    (completedFields / fields.length) * 100
  );
}

function getOpportunityMatchScore(
  opportunity: any
): number {
  const possibleScore =
    opportunity.match_score ??
    opportunity.match_percentage ??
    opportunity.matchScore ??
    opportunity.match;

  const score = normaliseScore(
    possibleScore
  );

  return score ?? 0;
}

function getAIValue(
  analysis: any,
  paths: string[][]
): any {
  for (const path of paths) {
    let current = analysis;

    for (const key of path) {
      if (
        current === null ||
        current === undefined
      ) {
        break;
      }

      current = current[key];
    }

    if (
      current !== undefined &&
      current !== null
    ) {
      return current;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* API HELPERS                                                                */
/* -------------------------------------------------------------------------- */

async function fetchJSON(
  endpoint: string,
  token: string
): Promise<{
  response: Response;
  data: any;
}> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const rawResponse =
    await response.text();

  let data: any;

  try {
    data = JSON.parse(rawResponse);
  } catch {
    throw new Error(
      `Server returned an unexpected response for ${endpoint}. HTTP ${response.status}`
    );
  }

  return {
    response,
    data,
  };
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function StudentDashboard() {
  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [dashboardData, setDashboardData] =
    useState<DashboardData>({
      profile: null,
      opportunities: [],
      skillsCount: null,
      careerPathCount: null,
      roadmapStepCount: null,
      skillGapCount: null,
      careerGoalsCount: null,
      aiScore: null,
    });

  const heroAnimation =
    useRef(new Animated.Value(0)).current;

  const contentAnimation =
    useRef(new Animated.Value(0)).current;

  /* ---------------------------------------------------------------------- */
  /* LOAD DASHBOARD                                                         */
  /* ---------------------------------------------------------------------- */

  const loadDashboard = useCallback(
    async (
      showLoader = true
    ) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const token =
          await AsyncStorage.getItem(
            "authToken"
          );

        if (!token) {
          await AsyncStorage.removeItem(
            "authToken"
          );

          await AsyncStorage.removeItem(
            "user"
          );

          router.replace("/login");
          return;
        }

        const storedUser =
          await AsyncStorage.getItem("user");

        let currentUser: User | null = null;

        if (storedUser) {
          try {
            currentUser =
              JSON.parse(storedUser);
          } catch {
            currentUser = null;
          }
        }

        /* ---------------------------------------------------------------- */
        /* PROFILE                                                           */
        /* ---------------------------------------------------------------- */

        let profile: StudentProfile | null =
          null;

        try {
          const {
            response,
            data,
          } = await fetchJSON(
            "/profiles/student.php",
            token
          );

          if (response.status === 401) {
            await AsyncStorage.removeItem(
              "authToken"
            );

            await AsyncStorage.removeItem(
              "user"
            );

            router.replace("/login");
            return;
          }

          if (
            response.ok &&
            data?.success
          ) {
            profile =
              data?.data?.profile ??
              data?.data ??
              null;
          }
        } catch (error) {
          console.log(
            "Student profile load error:",
            error
          );
        }

        /* ---------------------------------------------------------------- */
        /* OPPORTUNITIES                                                     */
        /* ---------------------------------------------------------------- */

        let opportunities: Opportunity[] =
          [];

        try {
          const {
            response,
            data,
          } = await fetchJSON(
            "/opportunities.php",
            token
          );

          if (response.status === 401) {
            await AsyncStorage.removeItem(
              "authToken"
            );

            await AsyncStorage.removeItem(
              "user"
            );

            router.replace("/login");
            return;
          }

          if (
            response.ok &&
            data?.success
          ) {
            const backendOpportunities =
              extractArray(data);

            opportunities =
              backendOpportunities
                .slice(0, 3)
                .map(
                  (
                    opportunity: any
                  ): Opportunity => ({
                    id: String(
                      opportunity.id
                    ),

                    title:
                      opportunity.title ||
                      "Career Opportunity",

                    company_name:
                      opportunity.company_name ||
                      opportunity.company ||
                      "Company",

                    matchScore:
                      getOpportunityMatchScore(
                        opportunity
                      ),
                  })
                );
          }
        } catch (error) {
          console.log(
            "Opportunities load error:",
            error
          );
        }

        /* ---------------------------------------------------------------- */
        /* SKILLS                                                            */
        /* ---------------------------------------------------------------- */

        let skillsCount:
          | number
          | null = null;

        try {
          const {
            response,
            data,
          } = await fetchJSON(
            "/skills.php",
            token
          );

          if (
            response.ok &&
            data?.success
          ) {
            const skills =
              extractArray(data);

            skillsCount =
              skills.length;
          }
        } catch (error) {
          console.log(
            "Skills load error:",
            error
          );
        }

        /* ---------------------------------------------------------------- */
        /* CAREER GOALS                                                       */
        /* ---------------------------------------------------------------- */

        let careerGoalsCount:
          | number
          | null = null;

        try {
          const {
            response,
            data,
          } = await fetchJSON(
            "/career-goals.php",
            token
          );

          if (
            response.ok &&
            data?.success
          ) {
            const goals =
              extractArray(data);

            careerGoalsCount =
              goals.length;
          }
        } catch (error) {
          console.log(
            "Career goals load error:",
            error
          );
        }

        /* ---------------------------------------------------------------- */
        /* AI ANALYSIS                                                        */
        /* ---------------------------------------------------------------- */

        let aiScore: number | null =
          normaliseScore(
            profile?.employability_score
          );

        let careerPathCount:
          | number
          | null = null;

        let roadmapStepCount:
          | number
          | null = null;

        let skillGapCount:
          | number
          | null = null;

        try {
          const {
            response,
            data,
          } = await fetchJSON(
            "/ai-analysis-result.php",
            token
          );

          if (
            response.ok &&
            data?.success
          ) {
            const analysis =
              data?.data ?? data;

            const returnedScore =
              getAIValue(
                analysis,
                [
                  [
                    "employability",
                    "score",
                  ],
                  ["score"],
                ]
              );

            const normalisedAI =
              normaliseScore(
                returnedScore
              );

            if (
              normalisedAI !== null
            ) {
              aiScore =
                normalisedAI;
            }

            const careerPaths =
              getAIValue(
                analysis,
                [
                  ["career_paths"],
                  [
                    "career",
                    "paths",
                  ],
                  [
                    "recommendations",
                    "career_paths",
                  ],
                ]
              );

            if (
              Array.isArray(
                careerPaths
              )
            ) {
              careerPathCount =
                careerPaths.length;
            }

            const roadmap =
              getAIValue(
                analysis,
                [
                  ["roadmap"],
                  [
                    "career",
                    "roadmap",
                  ],
                  ["roadmap_steps"],
                ]
              );

            if (
              Array.isArray(roadmap)
            ) {
              roadmapStepCount =
                roadmap.length;
            }

            const skillsToImprove =
              getAIValue(
                analysis,
                [
                  [
                    "skills_to_improve",
                  ],
                  [
                    "skill_gaps",
                  ],
                  [
                    "skills",
                    "to_improve",
                  ],
                ]
              );

            if (
              Array.isArray(
                skillsToImprove
              )
            ) {
              skillGapCount =
                skillsToImprove.length;
            }
          }
        } catch (error) {
          /*
           * AI analysis may not exist yet for a
           * newly registered student. That should
           * not prevent the dashboard from loading.
           */
          console.log(
            "AI analysis load error:",
            error
          );
        }

        setDashboardData({
          profile,
          opportunities,
          skillsCount,
          careerPathCount,
          roadmapStepCount,
          skillGapCount,
          careerGoalsCount,
          aiScore,
        });
      } catch (error) {
        console.log(
          "Dashboard load error:",
          error
        );

        Alert.alert(
          "Dashboard Error",
          "We could not load some of your latest career information. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /* INITIAL LOAD + REFRESH WHEN RETURNING TO SCREEN                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard(false);
    }, [loadDashboard])
  );

  /* ---------------------------------------------------------------------- */
  /* ANIMATIONS                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    heroAnimation.setValue(0);
    contentAnimation.setValue(0);

    Animated.parallel([
      Animated.timing(
        heroAnimation,
        {
          toValue: 1,
          duration: 750,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        contentAnimation,
        {
          toValue: 1,
          duration: 900,
          delay: 150,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      ),
    ]).start();
  }, [
    heroAnimation,
    contentAnimation,
  ]);

  /* ---------------------------------------------------------------------- */
  /* REFRESH                                                                */
  /* ---------------------------------------------------------------------- */

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      await loadDashboard(false);
    }, [loadDashboard]);

  /* ---------------------------------------------------------------------- */
  /* LOGOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(
        "authToken"
      );

      await AsyncStorage.removeItem(
        "user"
      );

      router.replace("/login");
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );

      router.replace("/login");
    }
  };

  /* ---------------------------------------------------------------------- */
  /* DISPLAY VALUES                                                         */
  /* ---------------------------------------------------------------------- */

  const firstName =
    getFirstName(
      dashboardData.profile
        ? dashboardData.profile
        : null,
      dashboardData.profile
    );

  const storedUser =
    dashboardData.profile;

  const aiScore =
    dashboardData.aiScore;

  const profileCompletion =
    calculateProfileCompletion(
      dashboardData.profile
    );

  const skillsCount =
    dashboardData.skillsCount;

  const careerPathCount =
    dashboardData.careerPathCount;

  const roadmapStepCount =
    dashboardData.roadmapStepCount;

  const skillGapCount =
    dashboardData.skillGapCount;

  const careerGoalsCount =
    dashboardData.careerGoalsCount;

  const aiLevel =
    aiScore === null
      ? "Not yet analysed"
      : aiScore >= 80
        ? "Strong Potential"
        : aiScore >= 70
          ? "Good Potential"
          : aiScore >= 50
            ? "Developing Potential"
            : "Needs Development";

  const scoreColor =
    aiScore === null
      ? "#94A3B8"
      : aiScore >= 70
        ? "#22C55E"
        : aiScore >= 50
          ? "#F59E0B"
          : "#EF4444";

  const progressColor =
    profileCompletion >= 70
      ? "#22C55E"
      : profileCompletion >= 50
        ? "#F59E0B"
        : "#EF4444";

  return (
    <View style={styles.container}>
      {/* Decorative background elements */}
      <View
        pointerEvents="none"
        style={styles.backgroundShapeOne}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundShapeTwo}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundShapeThree}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2457E6"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={styles.eyebrow}
            >
              CAREERFORGE
            </Text>

            <Text
              style={styles.greeting}
            >
              Good morning,{" "}
              {firstName}.
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Your career intelligence
              starts here.
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.profileButton
            }
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/student/profile"
              )
            }
          >
            <View
              style={
                styles.profileAvatar
              }
            >
              <Text
                style={
                  styles.profileInitial
                }
              >
                {firstName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={
                styles.profileDot
              }
            />
          </TouchableOpacity>
        </View>

        {/* AI HERO */}
        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity:
                heroAnimation,

              transform: [
                {
                  translateY:
                    heroAnimation.interpolate(
                      {
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          35,
                          0,
                        ],
                      }
                    ),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.94}
            onPress={() =>
              router.push(
                "/student/employability-analysis"
              )
            }
            style={styles.aiHero}
          >
            {/* Hero decorations */}
            <View
              style={
                styles.heroGlowOne
              }
            />

            <View
              style={
                styles.heroGlowTwo
              }
            />

            <View
              style={
                styles.heroTopRow
              }
            >
              <View
                style={styles.aiBadge}
              >
                <View
                  style={
                    styles.aiBadgeDot
                  }
                />

                <Text
                  style={
                    styles.aiBadgeText
                  }
                >
                  AI POWERED
                </Text>
              </View>

              <View
                style={
                  styles.heroSparkle
                }
              >
                <Ionicons
                  name="sparkles"
                  size={23}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text
              style={styles.heroTitle}
            >
              CareerForge
            </Text>

            <Text
              style={
                styles.heroSubtitle
              }
            >
              Employability Intelligence
            </Text>

            <>
              <View
                style={
                  styles.scoreArea
                }
              >
                <View
                  style={[
                    styles.scoreRingOuter,
                    {
                      borderColor:
                        scoreColor,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.scoreRingInner
                    }
                  >
                    {aiScore ===
                    null ? (
                      <>
                        <Text
                          style={
                            styles.scoreNumber
                          }
                        >
                          —
                        </Text>

                        <Text
                          style={
                            styles.scoreLabel
                          }
                        >
                          EMPLOYABILITY
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={
                            styles.scoreNumber
                          }
                        >
                          {aiScore}
                          <Text
                            style={
                              styles.scorePercent
                            }
                          >
                            %
                          </Text>
                        </Text>

                        <Text
                          style={
                            styles.scoreLabel
                          }
                        >
                          EMPLOYABILITY
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View
                  style={
                    styles.scoreMessage
                  }
                >
                  <Text
                    style={
                      styles.scoreLevel
                    }
                  >
                    {aiLevel}
                  </Text>

                  <Text
                    style={
                      styles.scoreDescription
                    }
                    numberOfLines={3}
                  >
                    {aiScore ===
                    null
                      ? "Complete your profile and CareerForge will analyse your employability and provide personalised career insights."
                      : "Your current profile shows strong potential. Keep improving your skills and experience to move closer to your target career."}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.intelligenceStats
                }
              >
                <IntelligenceStat
                  icon="flash"
                  value={
                    skillsCount ===
                    null
                      ? "—"
                      : String(
                          skillsCount
                        )
                  }
                  label="Skills"
                />

                <View
                  style={
                    styles.statDivider
                  }
                />

                <IntelligenceStat
                  icon="git-network"
                  value={
                    careerPathCount ===
                    null
                      ? "—"
                      : String(
                          careerPathCount
                        )
                  }
                  label="Career Fits"
                />

                <View
                  style={
                    styles.statDivider
                  }
                />

                <IntelligenceStat
                  icon="map"
                  value={
                    roadmapStepCount ===
                    null
                      ? "—"
                      : String(
                          roadmapStepCount
                        )
                  }
                  label="Roadmap"
                />

                <View
                  style={
                    styles.statDivider
                  }
                />

                <IntelligenceStat
                  icon="alert-circle"
                  value={
                    skillGapCount ===
                    null
                      ? "—"
                      : String(
                          skillGapCount
                        )
                  }
                  label="Gaps"
                />
              </View>

              <View
                style={styles.heroCTA}
              >
                <Text
                  style={
                    styles.heroCTAText
                  }
                >
                  VIEW FULL ANALYSIS
                </Text>

                <View
                  style={
                    styles.heroCTAIcon
                  }
                >
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#2457E6"
                  />
                </View>
              </View>
            </>
          </TouchableOpacity>
        </Animated.View>

        {/* CAREER CENTRE */}
        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity:
                contentAnimation,

              transform: [
                {
                  translateY:
                    contentAnimation.interpolate(
                      {
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          25,
                          0,
                        ],
                      }
                    ),
                },
              ],
            },
          ]}
        >
          <SectionHeading
            eyebrow="YOUR SPACE"
            title="Career Centre"
            subtitle="Everything you need to move forward."
          />

          <View
            style={
              styles.careerGrid
            }
          >
            <CareerAction
              icon="map"
              title="Career Roadmap"
              subtitle="Your next moves"
              gradient="blue"
              onPress={() =>
                router.push(
                  "/student/career-roadmap"
                )
              }
            />

            <CareerAction
              icon="briefcase"
              title="Opportunities"
              subtitle="Jobs & saved"
              gradient="orange"
              onPress={() =>
                router.push(
                  "/student/opportunities"
                )
              }
            />

            <CareerAction
              icon="git-network"
              title="Career Paths"
              subtitle="Explore your fit"
              gradient="purple"
              onPress={() =>
                router.push(
                  "/student/career-pathways"
                )
              }
            />

            <CareerAction
              icon="flag"
              title="Career Goals"
              subtitle={
                careerGoalsCount ===
                null
                  ? "Manage your goals"
                  : `${careerGoalsCount} selected`
              }
              gradient="pink"
              onPress={() =>
                router.push(
                  "/student/career-goals"
                )
              }
            />

            <CareerAction
              icon="document-text"
              title="My Applications"
              subtitle="Track applications"
              gradient="blue"
              onPress={() =>
                router.push(
                  "/student/applications"
                )
              }
            />

            <CareerAction
              icon="sparkles"
              title="AI Career Assistant"
              subtitle="Get career guidance"
              gradient="purple"
              onPress={() =>
                router.push(
                  "/student/ai-career-assistant"
                )
              }
            />

            <CareerAction
              icon="people"
              title="Social Feed"
              subtitle="Connect & share"
              gradient="blue"
              onPress={() =>
                router.push(
                  "/student/social-feed"
                )
              }
            />
          </View>

          {/* RECOMMENDED OPPORTUNITIES */}
          {dashboardData
            .opportunities
            .length > 0 && (
            <>
              <SectionHeading
                eyebrow="MATCHED FOR YOU"
                title="Recommended Opportunities"
                subtitle="Based on your current skills."
                actionLabel="View all"
                onAction={() =>
                  router.push(
                    "/student/opportunities"
                  )
                }
              />

              <View
                style={
                  styles.opportunityList
                }
              >
                {dashboardData.opportunities.map(
                  (
                    opportunity
                  ) => (
                    <TouchableOpacity
                      key={
                        opportunity.id
                      }
                      style={
                        styles.opportunityCard
                      }
                      activeOpacity={
                        0.9
                      }
                      onPress={() =>
                        router.push(
                          {
                            pathname:
                              "/student/opportunity-details",
                            params: {
                              id: opportunity.id,
                            },
                          }
                        )
                      }
                    >
                      <View
                        style={
                          styles.opportunityIcon
                        }
                      >
                        <Ionicons
                          name="briefcase"
                          size={24}
                          color="#2457E6"
                        />
                      </View>

                      <View
                        style={
                          styles.opportunityContent
                        }
                      >
                        <Text
                          style={
                            styles.opportunityTitle
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            opportunity.title
                          }
                        </Text>

                        <Text
                          style={
                            styles.opportunityCompany
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            opportunity.company_name
                          }
                        </Text>

                        <View
                          style={
                            styles.matchRow
                          }
                        >
                          <View
                            style={
                              styles.matchTrack
                            }
                          >
                            <View
                              style={[
                                styles.matchFill,
                                {
                                  width: `${Math.min(
                                    Math.max(
                                      opportunity.matchScore,
                                      0
                                    ),
                                    100
                                  )}%`,
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={
                              styles.matchText
                            }
                          >
                            {opportunity.matchScore >
                            0
                              ? `${opportunity.matchScore}% match`
                              : "View match"}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={23}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}

          {/* PROGRESS */}
          <SectionHeading
            eyebrow="YOUR MOMENTUM"
            title="Career Progress"
            subtitle="Small steps build your future."
          />

          <View
            style={
              styles.progressCard
            }
          >
            <View
              style={
                styles.progressTop
              }
            >
              <View>
                <Text
                  style={
                    styles.progressTitle
                  }
                >
                  Profile strength
                </Text>

                <Text
                  style={
                    styles.progressSubtitle
                  }
                >
                  Keep building your professional identity.
                </Text>
              </View>

              <Text
                style={[
                  styles.progressPercentage,
                  {
                    color:
                      progressColor,
                  },
                ]}
              >
                {profileCompletion}%
              </Text>
            </View>

            <View
              style={
                styles.progressTrack
              }
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

            <View
              style={
                styles.progressBottom
              }
            >
              <View
                style={
                  styles.progressStatus
                }
              >
                <Ionicons
                  name={
                    profileCompletion >=
                    80
                      ? "checkmark-circle"
                      : "trending-up"
                  }
                  size={20}
                  color="#2457E6"
                />

                <Text
                  style={
                    styles.progressStatusText
                  }
                >
                  {profileCompletion >=
                  80
                    ? "Strong profile"
                    : "Keep improving"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/student/profile"
                  )
                }
              >
                <Text
                  style={
                    styles.progressAction
                  }
                >
                  Improve →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CREDITS */}
          <View
            style={
              styles.creditsCard
            }
          >
            <View
              style={
                styles.creditsIcon
              }
            >
              <Ionicons
                name="diamond"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.creditsText
              }
            >
              <Text
                style={
                  styles.creditsEyebrow
                }
              >
                CAREER CREDITS
              </Text>

              <Text
                style={
                  styles.creditsTitle
                }
              >
                Keep building momentum
              </Text>
            </View>

            <Text
              style={
                styles.creditsValue
              }
            >
              240
            </Text>
          </View>

          {/* FINAL CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={
              styles.finalAICTA
            }
            onPress={() =>
              router.push(
                "/student/ai-career-assistant"
              )
            }
          >
            <View
              style={
                styles.finalAIIcon
              }
            >
              <Ionicons
                name="sparkles"
                size={28}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.finalAIText
              }
            >
              <Text
                style={
                  styles.finalAITitle
                }
              >
                Need career guidance?
              </Text>

              <Text
                style={
                  styles.finalAISubtitle
                }
              >
                Talk to your CareerForge AI Assistant.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.logoutButton
            }
            onPress={
              handleLogout
            }
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#EF4444"
            />

            <Text
              style={
                styles.logoutButtonText
              }
            >
              Logout
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.bottomSpacer
            }
          />
        </Animated.View>
      </ScrollView>

      {/* STICKY NAVIGATION */}
      <View
        style={
          styles.bottomNavShadow
        }
      >
        <View
          style={
            styles.bottomNav
          }
        >
          <BottomNavItem
            icon="home"
            label="Home"
            active
            onPress={() => {}}
          />

          <BottomNavItem
            icon="compass"
            label="Explore"
            onPress={() =>
              router.push(
                "/student/opportunities"
              )
            }
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.aiNavButton
            }
            onPress={() =>
              router.push(
                "/student/employability-analysis"
              )
            }
          >
            <View
              style={
                styles.aiNavInner
              }
            >
              <Ionicons
                name="sparkles"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.aiNavLabel
              }
            >
              Career AI
            </Text>
          </TouchableOpacity>

          <BottomNavItem
            icon="chatbubbles"
            label="Messages"
            onPress={() =>
              router.push(
                "/student/messages"
              )
            }
          />

          <BottomNavItem
            icon="person"
            label="Profile"
            onPress={() =>
              router.push(
                "/student/profile"
              )
            }
          />
        </View>
      </View>

      {loading &&
        !dashboardData.profile && (
          <View
            pointerEvents="none"
            style={
              styles.loadingOverlay
            }
          >
            <ActivityIndicator
              size="large"
              color="#2457E6"
            />
          </View>
        )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={
        styles.sectionHeading
      }
    >
      <View
        style={
          styles.sectionHeadingText
        }
      >
        <Text
          style={
            styles.sectionEyebrow
          }
        >
          {eyebrow}
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      {actionLabel &&
        onAction && (
          <TouchableOpacity
            style={
              styles.sectionAction
            }
            onPress={onAction}
          >
            <Text
              style={
                styles.sectionActionText
              }
            >
              {actionLabel}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#2457E6"
            />
          </TouchableOpacity>
        )}
    </View>
  );
}

function IntelligenceStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View
      style={
        styles.intelligenceStat
      }
    >
      <Ionicons
        name={icon}
        size={19}
        color="#DCE7FF"
      />

      <Text
        style={
          styles.intelligenceValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.intelligenceLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function CareerAction({
  icon,
  title,
  subtitle,
  gradient,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradient:
    | "blue"
    | "purple"
    | "orange"
    | "pink";
  onPress: () => void;
}) {
  const iconBackground = {
    blue: "#E8F0FF",
    purple: "#F0E9FF",
    orange: "#FFF1E3",
    pink: "#FDEAF5",
  }[gradient];

  const iconColor = {
    blue: "#2457E6",
    purple: "#8A42D8",
    orange: "#F28B30",
    pink: "#D83B9C",
  }[gradient];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={
        styles.careerAction
      }
    >
      <View
        style={[
          styles.careerActionIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={27}
          color={iconColor}
        />
      </View>

      <Text
        style={
          styles.careerActionTitle
        }
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        style={
          styles.careerActionSubtitle
        }
      >
        {subtitle}
      </Text>

      <View
        style={
          styles.careerArrow
        }
      >
        <Ionicons
          name="arrow-forward"
          size={18}
          color="#64748B"
        />
      </View>
    </TouchableOpacity>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={
        styles.bottomNavItem
      }
    >
      <Ionicons
        name={icon}
        size={25}
        color={
          active
            ? "#2457E6"
            : "#7B879B"
        }
      />

      <Text
        style={[
          styles.bottomNavLabel,
          active &&
            styles.bottomNavLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FD",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  backgroundShapeOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#EAF1FF",
    top: -100,
    right: -100,
  },

  backgroundShapeTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#F7E9FA",
    top: 480,
    left: -110,
  },

  backgroundShapeThree: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFF0DF",
    top: 950,
    right: -70,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.4,
    color: "#2457E6",
    marginBottom: 7,
  },

  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#172033",
  },

  headerSubtitle: {
    marginTop: 7,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    fontWeight: "500",
  },

  profileButton: {
    position: "relative",
  },

  profileAvatar: {
    width: 57,
    height: 57,
    borderRadius: 20,
    backgroundColor: "#2457E6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2457E6",
    shadowOpacity: 0.22,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 7,
  },

  profileInitial: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  profileDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F28B30",
    right: -2,
    bottom: -2,
    borderWidth: 3,
    borderColor: "#F7F9FD",
  },

  heroWrapper: {
    marginBottom: 38,
  },

  aiHero: {
    minHeight: 470,
    borderRadius: 34,
    padding: 25,
    overflow: "hidden",
    backgroundColor: "#0a0d16",
    shadowColor: "#2457E6",
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    elevation: 12,
  },

  heroGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#7A42D8",
    opacity: 0.55,
    top: -110,
    right: -70,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#D83B9C",
    opacity: 0.32,
    bottom: -110,
    left: -80,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.25)",
  },

  aiBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFAA52",
    marginRight: 8,
  },

  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  heroSparkle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.13)",
  },

  heroTitle: {
    marginTop: 28,
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    marginTop: 3,
    color: "#DDE7FF",
    fontSize: 17,
    fontWeight: "700",
  },

  scoreArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
  },

  scoreRingOuter: {
    width: 174,
    height: 174,
    borderRadius: 87,
    borderWidth: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  scoreRingInner: {
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    color: "#FFFFFF",
    fontSize: 48,
    lineHeight: 53,
    fontWeight: "900",
    letterSpacing: -2,
  },

  scorePercent: {
    fontSize: 25,
    letterSpacing: 0,
  },

  scoreLabel: {
    marginTop: 4,
    color: "#C8D8FF",
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
  },

  scoreMessage: {
    flex: 1,
    paddingLeft: 20,
  },

  scoreLevel: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 8,
  },

  scoreDescription: {
    color: "#D8E3FF",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  intelligenceStats: {
    marginTop: 28,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor:
      "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  intelligenceStat: {
    alignItems: "center",
    flex: 1,
  },

  intelligenceValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  intelligenceLabel: {
    marginTop: 2,
    color: "#B9CAEE",
    fontSize: 9,
    fontWeight: "800",
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor:
      "rgba(255,255,255,0.15)",
  },

  heroCTA: {
    marginTop: 20,
    minHeight: 57,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroCTAText: {
    color: "#173FBD",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  heroCTAIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EDF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyAISection: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyAIIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor:
      "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.18)",
  },

  emptyAIText: {
    flex: 1,
    paddingLeft: 16,
  },

  emptyAITitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },

  emptyAISubtitle: {
    marginTop: 5,
    color: "#C8D8FF",
    fontSize: 13,
    lineHeight: 19,
  },

  contentSection: {
    width: "100%",
  },

  sectionHeading: {
    marginBottom: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  sectionHeadingText: {
    flex: 1,
    paddingRight: 10,
  },

  sectionEyebrow: {
    color: "#8A42D8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 5,
  },

  sectionTitle: {
    color: "#172033",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
  },

  sectionActionText: {
    color: "#2457E6",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 4,
  },

  careerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 38,
  },

  careerAction: {
    width: "48%",
    minHeight: 172,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    shadowColor: "#172033",
    shadowOpacity: 0.055,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  careerActionIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  careerActionTitle: {
    color: "#172033",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },

  careerActionSubtitle: {
    color: "#718096",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  careerArrow: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },

  opportunityList: {
    marginBottom: 38,
  },

  opportunityCard: {
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#172033",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  opportunityIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#EDF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  opportunityContent: {
    flex: 1,
    paddingHorizontal: 13,
  },

  opportunityTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
  },

  opportunityCompany: {
    color: "#718096",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  matchTrack: {
    flex: 1,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#E7EBF2",
    overflow: "hidden",
  },

  matchFill: {
    height: "100%",
    backgroundColor: "#2457E6",
    borderRadius: 5,
  },

  matchText: {
    marginLeft: 9,
    color: "#2457E6",
    fontSize: 11,
    fontWeight: "900",
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 27,
    padding: 21,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    marginBottom: 17,
    shadowColor: "#172033",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressTitle: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
  },

  progressSubtitle: {
    color: "#718096",
    fontSize: 12,
    marginTop: 4,
  },

  progressPercentage: {
    fontSize: 25,
    fontWeight: "900",
  },

  progressTrack: {
    marginTop: 19,
    height: 11,
    borderRadius: 10,
    backgroundColor: "#E9EDF4",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  progressBottom: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressStatusText: {
    color: "#536174",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },

  progressAction: {
    color: "#2457E6",
    fontSize: 12,
    fontWeight: "900",
  },

  creditsCard: {
    minHeight: 95,
    backgroundColor: "#172033",
    borderRadius: 26,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },

  creditsIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#8A42D8",
    alignItems: "center",
    justifyContent: "center",
  },

  creditsText: {
    flex: 1,
    paddingHorizontal: 14,
  },

  creditsEyebrow: {
    color: "#AAB7CE",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
  },

  creditsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },

  creditsValue: {
    color: "#FFAA52",
    fontSize: 27,
    fontWeight: "900",
  },

  finalAICTA: {
    minHeight: 92,
    borderRadius: 26,
    padding: 16,
    backgroundColor: "#D83B9C",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#D83B9C",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  finalAIIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  finalAIText: {
    flex: 1,
    paddingHorizontal: 13,
  },

  finalAITitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  finalAISubtitle: {
    color: "#FFE5F5",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  bottomSpacer: {
    height: 115,
  },

  bottomNavShadow: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    shadowColor: "#172033",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 12,
  },

  bottomNav: {
    minHeight: 78,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EAF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
  },

  bottomNavItem: {
    width: 58,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomNavLabel: {
    marginTop: 4,
    color: "#7B879B",
    fontSize: 9,
    fontWeight: "800",
  },

  bottomNavLabelActive: {
    color: "#2457E6",
  },

  aiNavButton: {
    width: 72,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
  },

  aiNavInner: {
    width: 59,
    height: 59,
    borderRadius: 21,
    backgroundColor: "#2457E6",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2457E6",
    shadowOpacity: 0.3,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  aiNavLabel: {
    color: "#2457E6",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 4,
  },

  logoutButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1D5D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  logoutButtonText: {
    marginLeft: 9,
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "900",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(247,249,253,0.45)",
  },
});