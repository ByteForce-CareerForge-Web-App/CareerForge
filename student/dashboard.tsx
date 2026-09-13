import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
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
import { useFocusEffect, useRouter } from "expo-router";

const SAVED_PATHS_KEY = "careerforge_saved_career_paths";
const NOTIFICATIONS_KEY = "careerforge_notifications";

type CareerPath = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  skills: string[];
  roles: string[];
};

type StudentEvent = {
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
};

type StudentNotification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
};

/* -------------------------------------------------------------------------- */
/* EVENTS                                                                     */
/* -------------------------------------------------------------------------- */

const upcomingEvents: StudentEvent[] = [
  {
    title: "Career & Graduate Opportunities Fair",
    type: "Career Fair",
    date: "15 September 2026",
    time: "09:00 - 15:00",
    location: "Richfield Campus",
  },
  {
    title: "CV & Interview Masterclass",
    type: "Workshop",
    date: "18 September 2026",
    time: "10:00 - 12:00",
    location: "CareerForgeAI Virtual",
  },
  {
    title: "Alumni Networking Session",
    type: "Networking",
    date: "22 September 2026",
    time: "14:00 - 16:00",
    location: "Richfield Campus",
  },
];

/* -------------------------------------------------------------------------- */
/* DASHBOARD                                                                  */
/* -------------------------------------------------------------------------- */

export default function StudentDashboard() {
  const router = useRouter();

  const firstName = "Student";
  const profileCompletion = 80;
  const aiScore = 82;
  const aiLevel = "Strong Potential";
  const skillsCount = 6;
  const careerPathCount = 3;
  const roadmapStepCount = 5;
  const skillGapCount = 2;
  const careerGoalsCount = 3;

  const recommendedOpportunities = [
    {
      id: 1,
      title: "Junior Software Developer",
      company_name: "TechNova",
      matchScore: 92,
    },
    {
      id: 2,
      title: "IT Support Intern",
      company_name: "DigitalCore",
      matchScore: 86,
    },
    {
      id: 3,
      title: "Frontend Developer Intern",
      company_name: "FutureLabs",
      matchScore: 81,
    },
  ];

  const [refreshing, setRefreshing] = useState(false);
  const [savedPathCount, setSavedPathCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const heroAnimation = useRef(new Animated.Value(0)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;

  /* ---------------------------------------------------------------------- */
  /* LOAD SAVED CAREER PATHS                                                */
  /* ---------------------------------------------------------------------- */

  const loadSavedCareerPaths = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_PATHS_KEY);

      if (stored) {
        const paths: CareerPath[] = JSON.parse(stored);

        setSavedPathCount(
          Array.isArray(paths) ? paths.length : 0
        );
      } else {
        setSavedPathCount(0);
      }
    } catch (error) {
      console.log(
        "Load saved career paths error:",
        error
      );

      setSavedPathCount(0);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOAD NOTIFICATION COUNT                                                */
  /* ---------------------------------------------------------------------- */

  const loadNotificationCount = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(
        NOTIFICATIONS_KEY
      );

      if (!stored) {
        setUnreadNotificationCount(0);
        return;
      }

      const notifications: StudentNotification[] =
        JSON.parse(stored);

      if (Array.isArray(notifications)) {
        const unread = notifications.filter(
          (notification) => notification.unread
        ).length;

        setUnreadNotificationCount(unread);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.log(
        "Load notification count error:",
        error
      );

      setUnreadNotificationCount(0);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* REFRESH DASHBOARD DATA WHEN FOCUSED                                    */
  /* ---------------------------------------------------------------------- */

  useFocusEffect(
    useCallback(() => {
      loadSavedCareerPaths();
      loadNotificationCount();
    }, [
      loadSavedCareerPaths,
      loadNotificationCount,
    ])
  );

  /* ---------------------------------------------------------------------- */
  /* ANIMATION                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
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
  }, [heroAnimation, contentAnimation]);

  /* ---------------------------------------------------------------------- */
  /* REFRESH                                                                */
  /* ---------------------------------------------------------------------- */

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      loadSavedCareerPaths(),
      loadNotificationCount(),
    ]);

    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  /* ---------------------------------------------------------------------- */
  /* LOGOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleLogout = () => {
    router.replace("/login");
  };

  /* ---------------------------------------------------------------------- */
  /* EVENT DETAILS                                                          */
  /* ---------------------------------------------------------------------- */

  const openEvent = (event: StudentEvent) => {
    router.push({
      pathname: "/student/event-details",
      params: {
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        location: event.location,
        description:
          "Join CareerForgeAI for an upcoming event designed to support your career development and employability journey.",
      },
    });
  };

  /* ---------------------------------------------------------------------- */
  /* COLORS                                                                 */
  /* ---------------------------------------------------------------------- */

  const scoreColor =
    aiScore >= 70
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
      {/* BACKGROUND DECORATION */}

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

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/student/notifications")
              }
            >
              <Ionicons
                name={
                  unreadNotificationCount > 0
                    ? "notifications"
                    : "notifications-outline"
                }
                size={25}
                color="#173FBD"
              />

              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

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
            <View style={styles.heroDepthOne} />
            <View style={styles.heroDepthTwo} />
            <View style={styles.heroDepthThree} />
            <View style={styles.heroGlow} />

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
                    borderColor: scoreColor,
                  },
                ]}
              >
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreNumber}>
                    {aiScore}
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
                  Your current profile shows strong potential.
                  Keep improving your skills and experience to
                  move closer to your target career.
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
                  color="#173FBD"
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
              variant="primary"
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
              variant="light"
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
              variant="deep"
              onPress={() =>
                router.push(
                  "/student/career-pathways"
                )
              }
            />

            <CareerAction
              icon="flag"
              title="Career Goals"
              subtitle={`${careerGoalsCount} selected`}
              variant="soft"
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
              variant="primary"
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
              variant="deep"
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
              variant="light"
              onPress={() =>
                router.push(
                  "/student/social-feed"
                )
              }
            />
          </View>

          {/* MY CAREER PATHS */}

          <SectionHeading
            eyebrow="YOUR SAVED JOURNEY"
            title="My Career Paths"
            subtitle="Keep track of pathways that match your ambitions."
            actionLabel="View all"
            onAction={() =>
              router.push(
                "/student/my-career-paths"
              )
            }
          />

          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.savedPathsCard}
            onPress={() =>
              router.push(
                "/student/my-career-paths"
              )
            }
          >
            <View style={styles.savedPathsBackgroundOne} />
            <View style={styles.savedPathsBackgroundTwo} />

            <View style={styles.savedPathsIcon}>
              <Ionicons
                name="bookmark"
                size={27}
                color="#2457E6"
              />
            </View>

            <View style={styles.savedPathsContent}>
              <View style={styles.savedPathsTitleRow}>
                <Text style={styles.savedPathsTitle}>
                  Saved Career Pathways
                </Text>

                <View style={styles.savedPathsCount}>
                  <Text style={styles.savedPathsCountText}>
                    {savedPathCount}
                  </Text>
                </View>
              </View>

              <Text style={styles.savedPathsDescription}>
                Your saved career pathways are ready whenever
                you want to compare skills, roles and next steps.
              </Text>

              <View style={styles.savedPathsActionRow}>
                <Text style={styles.savedPathsAction}>
                  Open My Career Paths
                </Text>

                <View style={styles.savedPathsArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* EVENTS */}

          <View style={styles.eventsHeadingRow}>
            <SectionHeading
              eyebrow="STAY CONNECTED"
              title="Upcoming Events"
              subtitle="Opportunities to learn, connect and grow."
            />

            <TouchableOpacity
              style={styles.eventsCalendarButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push("/student/events")
              }
            >
              <Ionicons
                name="calendar-outline"
                size={21}
                color="#2457E6"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.eventsCard}>
            <View style={styles.eventsCardHeader}>
              <View>
                <Text style={styles.eventsCardTitle}>
                  CareerForge Calendar
                </Text>

                <Text style={styles.eventsCardSubtitle}>
                  Upcoming opportunities for you
                </Text>
              </View>

              <View style={styles.eventsCalendarIcon}>
                <Ionicons
                  name="calendar"
                  size={23}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.eventsDivider} />

            {upcomingEvents
              .slice(0, 3)
              .map((event, index) => (
                <TouchableOpacity
                  key={event.title}
                  activeOpacity={0.85}
                  style={[
                    styles.eventRow,
                    index <
                      Math.min(
                        upcomingEvents.length,
                        3
                      ) -
                        1 &&
                      styles.eventRowBorder,
                  ]}
                  onPress={() => openEvent(event)}
                >
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDateDay}>
                      {event.date.split(" ")[0]}
                    </Text>

                    <Text style={styles.eventDateMonth}>
                      {event.date
                        .split(" ")[1]
                        ?.substring(0, 3)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.eventInformation}>
                    <View style={styles.eventTitleRow}>
                      <Text
                        style={styles.eventTitle}
                        numberOfLines={2}
                      >
                        {event.title}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#94A3B8"
                      />
                    </View>

                    <View style={styles.eventMetaRow}>
                      <View style={styles.eventTypeBadge}>
                        <Text style={styles.eventTypeText}>
                          {event.type}
                        </Text>
                      </View>

                      <View style={styles.eventMetaItem}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#718096"
                        />

                        <Text style={styles.eventMetaText}>
                          {event.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.eventLocationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#718096"
                      />

                      <Text
                        style={styles.eventLocation}
                        numberOfLines={1}
                      >
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.viewEventsButton}
              onPress={() =>
                router.push("/student/events")
              }
            >
              <Text style={styles.viewEventsButtonText}>
                View Full Events Calendar
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#2457E6"
              />
            </TouchableOpacity>
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
                          {opportunity.company_name ||
                            "CareerForge Opportunity"}
                        </Text>

                        <View
                          style={styles.matchRow}
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
                            style={styles.matchText}
                          >
                            {opportunity.matchScore}% match
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={23}
                        color="#64748B"
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
                  color="#2457E6"
                />

                <Text style={styles.progressStatusText}>
                  {profileCompletion >= 80
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
                <Text style={styles.progressAction}>
                  Improve →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CAREER CREDITS */}

          <View style={styles.creditsCard}>
            <View style={styles.creditsGlow} />

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

          {/* FINAL AI CTA */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.finalAICTA}
            onPress={() =>
              router.push(
                "/student/ai-career-assistant"
              )
            }
          >
            <View style={styles.finalAIAccent} />

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

          {/* LOGOUT */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#EF4444"
            />

            <Text style={styles.logoutButtonText}>
              Logout
            </Text>
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

          {/* FIXED: EXPLORE NOW OPENS OPPORTUNITIES */}
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
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADING                                                            */
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

/* -------------------------------------------------------------------------- */
/* INTELLIGENCE STAT                                                          */
/* -------------------------------------------------------------------------- */

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
        color="#8FB0FF"
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

/* -------------------------------------------------------------------------- */
/* CAREER ACTION                                                              */
/* -------------------------------------------------------------------------- */

function CareerAction({
  icon,
  title,
  subtitle,
  variant,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  variant:
    | "primary"
    | "light"
    | "deep"
    | "soft";
  onPress: () => void;
}) {
  const iconBackground = {
    primary: "#E4ECFF",
    light: "#EAF3FF",
    deep: "#E0E8FF",
    soft: "#F0F4FF",
  }[variant];

  const iconColor = {
    primary: "#2457E6",
    light: "#2878C8",
    deep: "#173FBD",
    soft: "#4569C9",
  }[variant];

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
          color="#2457E6"
        />
      </View>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------------------- */
/* BOTTOM NAV                                                                 */
/* -------------------------------------------------------------------------- */

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
    backgroundColor: "#F5F7FA",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* BACKGROUND */

  backgroundShapeOne: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "#E6EEFF",
    top: -130,
    right: -120,
  },

  backgroundShapeTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#EDF3FF",
    top: 510,
    left: -125,
  },

  backgroundShapeThree: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: "#E8F3FF",
    top: 1300,
    right: -85,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
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

  /* HEADER ACTIONS */

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5F4",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#172033",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  profileButton: {
    position: "relative",
  },

  profileAvatar: {
    width: 57,
    height: 57,
    borderRadius: 20,
    backgroundColor: "#173FBD",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#173FBD",
    shadowOpacity: 0.25,
    shadowRadius: 14,
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
    backgroundColor: "#6B8FFF",
    right: -2,
    bottom: -2,
    borderWidth: 3,
    borderColor: "#F5F7FA",
  },

  /* AI HERO */

  heroWrapper: {
    marginBottom: 38,
  },

  aiHero: {
    minHeight: 470,
    borderRadius: 34,
    padding: 25,
    overflow: "hidden",
    backgroundColor: "#102A72",
    shadowColor: "#102A72",
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    elevation: 12,
  },

  heroDepthOne: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "#173FBD",
    opacity: 0.8,
    top: -170,
    right: -100,
  },

  heroDepthTwo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#2457E6",
    opacity: 0.38,
    bottom: -145,
    left: -100,
  },

  heroDepthThree: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#0A2058",
    opacity: 0.7,
    top: 175,
    right: -105,
  },

  heroGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#6B8FFF",
    opacity: 0.16,
    top: 105,
    left: 125,
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
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
  },

  aiBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6B8FFF",
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
      "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
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
    color: "#C8D8FF",
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
      "rgba(255,255,255,0.045)",
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
    color: "#B7C9F7",
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
    color: "#C7D5F4",
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
      "rgba(255,255,255,0.15)",
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
    color: "#AFC1E8",
    fontSize: 9,
    fontWeight: "800",
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor:
      "rgba(255,255,255,0.14)",
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
    backgroundColor: "#E4ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SECTIONS */

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
    color: "#2457E6",
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

  /* CAREER GRID */

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
    borderColor: "#E1E7F2",
    shadowColor: "#172033",
    shadowOpacity: 0.06,
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
    backgroundColor: "#F0F4FA",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SAVED CAREER PATHS */

  savedPathsCard: {
    minHeight: 170,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5F4",
    padding: 19,
    marginBottom: 38,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#173FBD",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  savedPathsBackgroundOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E8F0FF",
    right: -70,
    top: -90,
  },

  savedPathsBackgroundTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F1F6FF",
    right: 35,
    bottom: -65,
  },

  savedPathsIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#E4ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  savedPathsContent: {
    flex: 1,
  },

  savedPathsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  savedPathsTitle: {
    flex: 1,
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
    paddingRight: 8,
  },

  savedPathsCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: "#173FBD",
    alignItems: "center",
    justifyContent: "center",
  },

  savedPathsCountText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  savedPathsDescription: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  savedPathsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  savedPathsAction: {
    color: "#2457E6",
    fontSize: 12,
    fontWeight: "900",
  },

  savedPathsArrow: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#2457E6",
    alignItems: "center",
    justifyContent: "center",
  },

  /* EVENTS */

  eventsHeadingRow: {
    position: "relative",
  },

  eventsCalendarButton: {
    position: "absolute",
    right: 0,
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E4ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  eventsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#DCE5F4",
    overflow: "hidden",
    marginBottom: 38,
    shadowColor: "#172033",
    shadowOpacity: 0.06,
    shadowRadius: 17,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  eventsCardHeader: {
    minHeight: 88,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#173FBD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eventsCardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  eventsCardSubtitle: {
    color: "#C8D8FF",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },

  eventsCalendarIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#2457E6",
    alignItems: "center",
    justifyContent: "center",
  },

  eventsDivider: {
    height: 1,
    backgroundColor: "#E8EDF5",
  },

  eventRow: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  eventRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },

  eventDateBox: {
    width: 50,
    minHeight: 55,
    borderRadius: 14,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  eventDateDay: {
    color: "#173FBD",
    fontSize: 19,
    lineHeight: 20,
    fontWeight: "900",
  },

  eventDateMonth: {
    color: "#2457E6",
    fontSize: 8,
    fontWeight: "900",
    marginTop: 3,
    letterSpacing: 0.6,
  },

  eventInformation: {
    flex: 1,
  },

  eventTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  eventTitle: {
    flex: 1,
    color: "#172033",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    paddingRight: 6,
  },

  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 7,
  },

  eventTypeBadge: {
    backgroundColor: "#EEF3FF",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginRight: 7,
  },

  eventTypeText: {
    color: "#2457E6",
    fontSize: 9,
    fontWeight: "900",
  },

  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventMetaText: {
    color: "#718096",
    fontSize: 9,
    fontWeight: "600",
    marginLeft: 3,
  },

  eventLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  eventLocation: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
    flex: 1,
  },

  viewEventsButton: {
    minHeight: 54,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },

  viewEventsButtonText: {
    color: "#2457E6",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 7,
  },

  /* OPPORTUNITIES */

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
    borderColor: "#E1E7F2",
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
    backgroundColor: "#E4ECFF",
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

  /* PROGRESS */

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 27,
    padding: 21,
    borderWidth: 1,
    borderColor: "#E1E7F2",
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

  /* CREDITS */

  creditsCard: {
    minHeight: 95,
    backgroundColor: "#172A55",
    borderRadius: 26,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },

  creditsGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#2457E6",
    opacity: 0.38,
    right: -85,
    top: -60,
  },

  creditsIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2457E6",
    alignItems: "center",
    justifyContent: "center",
  },

  creditsText: {
    flex: 1,
    paddingHorizontal: 14,
  },

  creditsEyebrow: {
    color: "#AFC1E8",
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
    color: "#7EA0FF",
    fontSize: 27,
    fontWeight: "900",
  },

  /* FINAL CTA */

  finalAICTA: {
    minHeight: 92,
    borderRadius: 26,
    padding: 16,
    backgroundColor: "#173FBD",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#173FBD",
    shadowOpacity: 0.23,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
    overflow: "hidden",
  },

  finalAIAccent: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#2457E6",
    opacity: 0.55,
    right: -80,
    top: -75,
  },

  finalAIIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#2457E6",
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
    color: "#DCE7FF",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  /* LOGOUT */

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

  bottomSpacer: {
    height: 115,
  },

  /* BOTTOM NAV */

  bottomNavShadow: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    shadowColor: "#172033",
    shadowOpacity: 0.18,
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
    borderColor: "#E0E6F0",
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
    backgroundColor: "#173FBD",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#173FBD",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  aiNavLabel: {
    color: "#173FBD",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 4,
  },
});
