import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
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
import { useRouter } from "expo-router";

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: "blue" | "purple" | "orange" | "pink";
};

type Opportunity = {
  id: number;
  title: string;
  company_name: string;
  matchScore: number;
};

export default function StudentDashboard() {
  const router = useRouter();

  /* -------------------------------------------------------------------------- */
  /* FRONTEND DEMO DATA                                                        */
  /* -------------------------------------------------------------------------- */

  const studentName = "Student";

  const employabilityScore = 82;

  const profileCompletion = 80;

  const skillsCount = 8;

  const careerPathCount = 4;

  const roadmapStepCount = 6;

  const skillGapCount = 3;

  const selectedCareerGoals = 3;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [opportunities] = useState<Opportunity[]>([
    {
      id: 1,
      title: "Software Developer Intern",
      company_name: "Tech Solutions",
      matchScore: 92,
    },
    {
      id: 2,
      title: "Junior IT Support",
      company_name: "Digital Innovations",
      matchScore: 86,
    },
    {
      id: 3,
      title: "Web Development Intern",
      company_name: "Future Systems",
      matchScore: 81,
    },
  ]);

  const heroAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const contentAnimation = useRef(
    new Animated.Value(0)
  ).current;

  /* -------------------------------------------------------------------------- */
  /* FRONTEND LOADING                                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* ANIMATIONS                                                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (loading) {
      return;
    }

    heroAnimation.setValue(0);
    contentAnimation.setValue(0);

    Animated.parallel([
      Animated.timing(heroAnimation, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(contentAnimation, {
        toValue: 1,
        duration: 900,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    loading,
    heroAnimation,
    contentAnimation,
  ]);

  /* -------------------------------------------------------------------------- */
  /* REFRESH                                                                    */
  /* -------------------------------------------------------------------------- */

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  /* -------------------------------------------------------------------------- */
  /* DYNAMIC COLOURS                                                            */
  /* -------------------------------------------------------------------------- */

  const getScoreColor = (score: number) => {
    if (score >= 70) {
      return "#22C55E";
    }

    if (score >= 50) {
      return "#F59E0B";
    }

    return "#EF4444";
  };

  const employabilityColor =
    getScoreColor(employabilityScore);

  const progressColor =
    getScoreColor(profileCompletion);

  const aiLevel =
    employabilityScore >= 70
      ? "Strong"
      : employabilityScore >= 50
      ? "Developing"
      : "Needs Improvement";

  const firstName =
    studentName.split(" ")[0] || "Student";

  const recommendedOpportunities =
    useMemo(() => opportunities.slice(0, 3), [
      opportunities,
    ]);

  /* -------------------------------------------------------------------------- */
  /* LOADING SCREEN                                                             */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <Ionicons
            name="sparkles"
            size={34}
            color="#FFFFFF"
          />
        </View>

        <ActivityIndicator
          size="large"
          color="#2457E6"
        />

        <Text style={styles.loadingTitle}>
          Preparing your CareerForge dashboard
        </Text>

        <Text style={styles.loadingSubtitle}>
          Loading your career intelligence...
        </Text>
      </View>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DASHBOARD                                                                  */
  /* -------------------------------------------------------------------------- */

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>
              CAREERFORGE
            </Text>

            <Text style={styles.greeting}>
              Good morning, {firstName}.
            </Text>

            <Text style={styles.headerSubtitle}>
              Your career intelligence starts here.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/student/profile")
            }
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileDot} />
          </TouchableOpacity>
        </View>

        {/* AI HERO */}

        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity: heroAnimation,
              transform: [
                {
                  translateY:
                    heroAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [35, 0],
                    }),
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
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.aiBadge}>
                <View style={styles.aiBadgeDot} />

                <Text style={styles.aiBadgeText}>
                  AI POWERED
                </Text>
              </View>

              <View style={styles.heroSparkle}>
                <Ionicons
                  name="sparkles"
                  size={23}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text style={styles.heroTitle}>
              CareerForge
            </Text>

            <Text style={styles.heroSubtitle}>
              Employability Intelligence
            </Text>

            <View style={styles.scoreArea}>
              <View
                style={[
                  styles.scoreRingOuter,
                  {
                    borderColor:
                      employabilityColor,
                  },
                ]}
              >
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreNumber}>
                    {employabilityScore}
                    <Text style={styles.scorePercent}>
                      %
                    </Text>
                  </Text>

                  <Text style={styles.scoreLabel}>
                    EMPLOYABILITY
                  </Text>
                </View>
              </View>

              <View style={styles.scoreMessage}>
                <Text style={styles.scoreLevel}>
                  {aiLevel}
                </Text>

                <Text
                  style={styles.scoreDescription}
                  numberOfLines={3}
                >
                  Your current profile shows strong
                  potential. Keep developing your skills
                  and career experience.
                </Text>
              </View>
            </View>

            <View style={styles.intelligenceStats}>
              <IntelligenceStat
                icon="flash"
                value={String(skillsCount)}
                label="Skills"
              />

              <View style={styles.statDivider} />

              <IntelligenceStat
                icon="git-network"
                value={String(careerPathCount)}
                label="Career Fits"
              />

              <View style={styles.statDivider} />

              <IntelligenceStat
                icon="map"
                value={String(roadmapStepCount)}
                label="Roadmap"
              />

              <View style={styles.statDivider} />

              <IntelligenceStat
                icon="alert-circle"
                value={String(skillGapCount)}
                label="Gaps"
              />
            </View>

            <View style={styles.heroCTA}>
              <Text style={styles.heroCTAText}>
                VIEW FULL ANALYSIS
              </Text>

              <View style={styles.heroCTAIcon}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#2457E6"
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* MAIN CONTENT */}

        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: contentAnimation,
              transform: [
                {
                  translateY:
                    contentAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [25, 0],
                    }),
                },
              ],
            },
          ]}
        >
          {/* CAREER CENTRE */}

          <SectionHeading
            eyebrow="YOUR SPACE"
            title="Career Centre"
            subtitle="Everything you need to move forward."
          />

          <View style={styles.careerGrid}>
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
              subtitle={`${selectedCareerGoals} selected`}
              gradient="pink"
              onPress={() =>
                router.push(
                  "/student/career-goals"
                )
              }
            />

            {/* 5TH QUICK ACTION */}

            <CareerAction
              icon="sparkles"
              title="Career AI"
              subtitle="Get guidance"
              gradient="blue"
              onPress={() =>
                router.push(
                  "/student/ai-career-assistant"
                )
              }
            />

            {/* 6TH QUICK ACTION */}

            <CareerAction
              icon="document-text"
              title="Improve My CV"
              subtitle="Build your CV"
              gradient="purple"
              onPress={() =>
                router.push(
                  "/student/improve-cv"
                )
              }
            />
          </View>

          {/* RECOMMENDED OPPORTUNITIES */}

          {recommendedOpportunities.length > 0 && (
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

              <View style={styles.opportunityList}>
                {recommendedOpportunities.map(
                  (opportunity) => (
                    <TouchableOpacity
                      key={opportunity.id}
                      style={styles.opportunityCard}
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push({
                          pathname:
                            "/student/opportunity-details",
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
                          numberOfLines={1}
                        >
                          {opportunity.title}
                        </Text>

                        <Text
                          style={
                            styles.opportunityCompany
                          }
                          numberOfLines={1}
                        >
                          {opportunity.company_name}
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
                                    opportunity.matchScore,
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
                            {opportunity.matchScore}%
                            match
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

          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View>
                <Text style={styles.progressTitle}>
                  Profile strength
                </Text>

                <Text style={styles.progressSubtitle}>
                  Keep building your professional identity.
                </Text>
              </View>

              <Text
                style={[
                  styles.progressPercentage,
                  {
                    color: progressColor,
                  },
                ]}
              >
                {profileCompletion}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${profileCompletion}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>

            <View style={styles.progressBottom}>
              <View style={styles.progressStatus}>
                <Ionicons
                  name={
                    profileCompletion >= 80
                      ? "checkmark-circle"
                      : "trending-up"
                  }
                  size={20}
                  color={progressColor}
                />

                <Text style={styles.progressStatusText}>
                  {profileCompletion >= 80
                    ? "Strong profile"
                    : "Keep improving"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push("/student/profile")
                }
              >
                <Text
                  style={[
                    styles.progressAction,
                    {
                      color: progressColor,
                    },
                  ]}
                >
                  Improve →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CREDITS */}

          <View style={styles.creditsCard}>
            <View style={styles.creditsIcon}>
              <Ionicons
                name="diamond"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.creditsText}>
              <Text style={styles.creditsEyebrow}>
                CAREER CREDITS
              </Text>

              <Text style={styles.creditsTitle}>
                Keep building momentum
              </Text>
            </View>

            <Text style={styles.creditsValue}>
              —
            </Text>
          </View>

          {/* FINAL CTA */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.finalAICTA}
            onPress={() =>
              router.push(
                "/student/ai-career-assistant"
              )
            }
          >
            <View style={styles.finalAIIcon}>
              <Ionicons
                name="sparkles"
                size={28}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.finalAIText}>
              <Text style={styles.finalAITitle}>
                Need career guidance?
              </Text>

              <Text style={styles.finalAISubtitle}>
                Talk to your CareerForge AI Assistant.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>

      {/* STICKY NAVIGATION */}

      <View style={styles.bottomNavShadow}>
        <View style={styles.bottomNav}>
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
              router.push("/student/opportunities")
            }
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.aiNavButton}
            onPress={() =>
              router.push(
                "/student/employability-analysis"
              )
            }
          >
            <View style={styles.aiNavInner}>
              <Ionicons
                name="sparkles"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.aiNavLabel}>
              Career AI
            </Text>
          </TouchableOpacity>

          <BottomNavItem
            icon="chatbubbles"
            label="Messages"
            onPress={() =>
              router.push("/student/messages")
            }
          />

          <BottomNavItem
            icon="person"
            label="Profile"
            onPress={() =>
              router.push("/student/profile")
            }
          />
        </View>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
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
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionEyebrow}>
          {eyebrow}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.sectionAction}
          onPress={onAction}
        >
          <Text style={styles.sectionActionText}>
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
    <View style={styles.intelligenceStat}>
      <Ionicons
        name={icon}
        size={19}
        color="#DCE7FF"
      />

      <Text style={styles.intelligenceValue}>
        {value}
      </Text>

      <Text style={styles.intelligenceLabel}>
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
  gradient: "blue" | "purple" | "orange" | "pink";
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
      style={styles.careerAction}
    >
      <View
        style={[
          styles.careerActionIcon,
          {
            backgroundColor: iconBackground,
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
        style={styles.careerActionTitle}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text style={styles.careerActionSubtitle}>
        {subtitle}
      </Text>

      <View style={styles.careerArrow}>
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
      style={styles.bottomNavItem}
    >
      <Ionicons
        name={icon}
        size={25}
        color={
          active ? "#2457E6" : "#7B879B"
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
    backgroundColor: "#fdf7fb",
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
    backgroundColor: "#021a4a",
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

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F9FD",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingLogo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#2457E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  loadingTitle: {
    marginTop: 25,
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    textAlign: "center",
  },

  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
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
    backgroundColor: "#173FBD",
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
});
