
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

type DashboardData = {
  success: boolean;
  stats: {
    total_users: number;
    students: number;
    alumni: number;
    businesses: number;
    opportunities: number;
  };
  approvals: {
    business_verifications: number;
    alumni_certificates: number;
    total: number;
  };
  platform: {
    uptime: string;
    active_sessions: number;
    status: string;
  };
  recent_activity: {
    type: string;
    title: string;
    description: string;
    time?: string;
    created_at?: string;
  }[];
};

function formatActivityTime(
  createdAt?: string,
  time?: string
): string {
  if (time) {
    return time;
  }

  if (!createdAt) {
    return "Recently";
  }

  const createdDate = new Date(createdAt);
  const now = new Date();

  if (isNaN(createdDate.getTime())) {
    return "Recently";
  }

  const difference =
    Math.floor(
      (now.getTime() - createdDate.getTime()) / 1000
    );

  if (difference < 60) {
    return "Just now";
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return createdDate.toLocaleDateString();
}

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const heroAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const contentAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const pulseAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const fetchDashboardData = async () => {
    try {
      const token =
        await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert(
          "Session expired",
          "Please log in again."
        );

        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard.php`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load dashboard data."
        );
      }

      setDashboardData(data);
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      Alert.alert(
        "Dashboard Error",
        "Unable to load the latest dashboard information."
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [
    heroAnimation,
    contentAnimation,
    pulseAnimation,
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of the Admin Dashboard?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "authToken",
                "user",
              ]);
            } catch (error) {
              console.error(
                "Logout error:",
                error
              );
            } finally {
              router.replace("/login");
            }
          },
        },
      ]
    );
  };

  const recentActivity =
    dashboardData?.recent_activity || [];

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
            <View style={styles.welcomeRow}>
              <View style={styles.liveDot}>
                <Animated.View
                  style={[
                    styles.liveDotInner,
                    {
                      transform: [
                        {
                          scale: pulseAnimation,
                        },
                      ],
                    },
                  ]}
                />
              </View>

              <Text style={styles.liveText}>
                PLATFORM LIVE
              </Text>
            </View>

            <Text style={styles.greeting}>
              Good morning, Admin.
            </Text>

            <Text style={styles.headerSubtitle}>
              Everything happening across CareerForgeAI, at a glance.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push("/admin/notifications")
            }
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color="#2457E6"
            />

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* ADMIN HERO */}
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
            style={styles.heroCard}
            onPress={() =>
              router.push("/admin/analytics")
            }
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
            <View style={styles.heroGlowThree} />

            <View style={styles.heroTopRow}>
              <View style={styles.adminBadge}>
                <View style={styles.adminBadgeDot} />

                <Text style={styles.adminBadgeText}>
                  ADMIN CONTROL CENTRE
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={25}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.heroTitleRow}>
              <View style={styles.heroTitleAccent} />

              <View style={styles.heroTitleContainer}>
                <Text style={styles.heroTitle}>
                  Platform
                </Text>

                <Text
                  style={
                    styles.heroTitleHighlight
                  }
                >
                  Intelligence
                </Text>
              </View>
            </View>

            <Text style={styles.heroSubtitle}>
              Monitor, manage and grow the CareerForgeAI ecosystem from one central dashboard.
            </Text>

            <View style={styles.heroStats}>
              <HeroStat
                icon="people"
                value={String(
                  dashboardData?.stats
                    .total_users ?? 0
                )}
                label="TOTAL USERS"
              />

              <View style={styles.heroDivider} />

              <HeroStat
                icon="briefcase"
                value={String(
                  dashboardData?.stats
                    .opportunities ?? 0
                )}
                label="OPPORTUNITIES"
              />

              <View style={styles.heroDivider} />

              <HeroStat
                icon="business"
                value={String(
                  dashboardData?.stats
                    .businesses ?? 0
                )}
                label="BUSINESSES"
              />
            </View>

            <View style={styles.heroCTA}>
              <View>
                <Text style={styles.heroCTALabel}>
                  PLATFORM OVERVIEW
                </Text>

                <Text style={styles.heroCTAText}>
                  Explore analytics
                </Text>
              </View>

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
          {/* PLATFORM OVERVIEW */}
          <SectionHeading
            eyebrow="PLATFORM OVERVIEW"
            title="At a glance"
            subtitle="Your current CareerForgeAI ecosystem."
          />

          <View style={styles.statsGrid}>
            <StatCard
              icon="school"
              value={String(
                dashboardData?.stats.students ?? 0
              )}
              label="Students"
              background="#EAF1FF"
              iconColor="#2457E6"
              accent="#2457E6"
            />

            <StatCard
              icon="people"
              value={String(
                dashboardData?.stats.alumni ?? 0
              )}
              label="Alumni"
              background="#EEF8F1"
              iconColor="#22A65A"
              accent="#22A65A"
            />

            <StatCard
              icon="business"
              value={String(
                dashboardData?.stats
                  .businesses ?? 0
              )}
              label="Businesses"
              background="#FFF1E3"
              iconColor="#F28B30"
              accent="#F28B30"
            />

            <StatCard
              icon="briefcase"
              value={String(
                dashboardData?.stats
                  .opportunities ?? 0
              )}
              label="Opportunities"
              background="#F1EAFE"
              iconColor="#7C45D6"
              accent="#7C45D6"
            />
          </View>

          {/* PLATFORM HEALTH */}
          <SectionHeading
            eyebrow="SYSTEM STATUS"
            title="Platform health"
            subtitle="Current system activity and availability."
          />

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View style={styles.healthIcon}>
                <Ionicons
                  name="pulse"
                  size={23}
                  color="#22A65A"
                />
              </View>

              <View style={styles.healthHeaderText}>
                <Text style={styles.healthTitle}>
                  All systems operational
                </Text>

                <Text
                  style={styles.healthSubtitle}
                >
                  CareerForgeAI is running normally.
                </Text>
              </View>

              <View style={styles.operationalBadge}>
                <View
                  style={styles.operationalDot}
                />

                <Text
                  style={styles.operationalText}
                >
                  LIVE
                </Text>
              </View>
            </View>

            <View style={styles.healthMetrics}>
              <HealthMetric
                label="System uptime"
                value="99.9%"
              />

              <View
                style={styles.healthMetricDivider}
              />

              <HealthMetric
                label="Active sessions"
                value="284"
              />

              <View
                style={styles.healthMetricDivider}
              />

              <HealthMetric
                label="Response"
                value="Fast"
              />
            </View>
          </View>

          {/* PENDING APPROVALS */}
          <SectionHeading
            eyebrow="ACTION REQUIRED"
            title="Pending approvals"
            subtitle="Items waiting for administrator review."
            actionLabel="View all"
            onAction={() =>
              router.push("/admin/approvals")
            }
          />

          <View style={styles.approvalList}>
            <ApprovalCard
              icon="business"
              title="Business Verifications"
              description={`${dashboardData?.approvals.business_verifications ?? 0} businesses waiting for approval`}
              count={String(
                dashboardData?.approvals
                  .business_verifications ?? 0
              )}
              iconBackground="#FFF1E3"
              iconColor="#F28B30"
              accent="#F28B30"
              onPress={() =>
                router.push("/admin/approvals")
              }
            />

            <ApprovalCard
              icon="school"
              title="Alumni Verification"
              description={`${dashboardData?.approvals.alumni_certificates ?? 0} certificates waiting for review`}
              count={String(
                dashboardData?.approvals
                  .alumni_certificates ?? 0
              )}
              iconBackground="#EAF1FF"
              iconColor="#2457E6"
              accent="#2457E6"
              onPress={() =>
                router.push("/admin/approvals")
              }
            />
          </View>

          {/* MANAGEMENT */}
          <SectionHeading
            eyebrow="ADMIN TOOLS"
            title="Management"
            subtitle="Manage the CareerForgeAI platform."
          />

          <View style={styles.managementGrid}>
            <ManagementCard
              icon="briefcase"
              title="Opportunities"
              subtitle="Manage listings"
              background="#FFF1E3"
              iconColor="#F28B30"
              onPress={() =>
                router.push(
                  "/admin/opportunities"
                )
              }
            />

            <ManagementCard
              icon="ribbon"
              title="Badges & Credits"
              subtitle="Manage rewards"
              background="#FDEAF5"
              iconColor="#D83B9C"
              onPress={() =>
                router.push("/admin/rewards")
              }
            />
          </View>

          {/* QUICK INSIGHT */}
          <View style={styles.insightCard}>
            <View style={styles.insightTop}>
              <View style={styles.insightIcon}>
                <Ionicons
                  name="sparkles"
                  size={22}
                  color="#2457E6"
                />
              </View>

              <View style={styles.insightBadge}>
                <Text
                  style={styles.insightBadgeText}
                >
                  ADMIN INSIGHT
                </Text>
              </View>
            </View>

            <Text style={styles.insightTitle}>
              Keep verification queues moving
            </Text>

            <Text style={styles.insightText}>
              {dashboardData?.approvals.total ??
                0}{" "}
              {(
                dashboardData?.approvals.total ??
                0
              ) === 1
                ? "item currently needs"
                : "items currently need"}{" "}
              administrator attention. Reviewing these requests keeps users and businesses moving through the platform.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.insightButton}
              onPress={() =>
                router.push("/admin/approvals")
              }
            >
              <Text
                style={styles.insightButtonText}
              >
                Review approvals
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* RECENT ACTIVITY */}
          <SectionHeading
            eyebrow="PLATFORM ACTIVITY"
            title="Recent activity"
            subtitle="Latest activity across CareerForgeAI."
          />

          <View style={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map(
                (activity, index) => {
                  const activityType =
                    String(
                      activity.type || ""
                    ).toLowerCase();

                  let icon:
                    | keyof typeof Ionicons.glyphMap =
                    "information-circle";

                  let iconBackground =
                    "#EAF1FF";

                  let iconColor = "#2457E6";

                  if (
                    activityType.includes(
                      "business"
                    ) ||
                    activityType.includes(
                      "verification"
                    )
                  ) {
                    icon = "business";
                    iconBackground =
                      "#FFF1E3";
                    iconColor = "#F28B30";
                  } else if (
                    activityType.includes(
                      "alumni"
                    ) ||
                    activityType.includes(
                      "certificate"
                    )
                  ) {
                    icon = "school";
                    iconBackground =
                      "#EAF1FF";
                    iconColor = "#2457E6";
                  } else if (
                    activityType.includes(
                      "opportunity"
                    )
                  ) {
                    icon = "briefcase";
                    iconBackground =
                      "#EEF8F1";
                    iconColor = "#22A65A";
                  } else if (
                    activityType.includes(
                      "student"
                    ) ||
                    activityType.includes(
                      "user"
                    ) ||
                    activityType.includes(
                      "registration"
                    )
                  ) {
                    icon = "person";
                    iconBackground =
                      "#F1EAFE";
                    iconColor = "#7C45D6";
                  }

                  return (
                    <ActivityCard
                      key={`${activity.type}-${activity.created_at}-${index}`}
                      icon={icon}
                      title={
                        activity.title ||
                        "Platform activity"
                      }
                      description={
                        activity.description ||
                        "A new activity occurred on CareerForgeAI."
                      }
                      time={formatActivityTime(
                        activity.created_at,
                        activity.time
                      )}
                      iconBackground={
                        iconBackground
                      }
                      iconColor={iconColor}
                    />
                  );
                }
              )
            ) : (
              <View style={styles.emptyActivityCard}>
                <View style={styles.emptyActivityIcon}>
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color="#94A3B8"
                  />
                </View>

                <View
                  style={styles.emptyActivityInfo}
                >
                  <Text
                    style={
                      styles.emptyActivityTitle
                    }
                  >
                    No recent activity
                  </Text>

                  <Text
                    style={
                      styles.emptyActivityText
                    }
                  >
                    Recent platform activity will appear here.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#EF4444"
              />
            </View>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* Space so content is not hidden behind bottom nav */}
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>

      {/* ADMIN BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <AdminNavItem
          icon="home"
          label="Home"
          active
          onPress={() =>
            router.replace("/admin/dashboard")
          }
        />

        <AdminNavItem
          icon="bar-chart-outline"
          label="Analytics"
          onPress={() =>
            router.push("/admin/analytics")
          }
        />

        <AdminNavItem
          icon="people-outline"
          label="Users"
          onPress={() =>
            router.push("/admin/users")
          }
        />

        <AdminNavItem
          icon="shield-checkmark-outline"
          label="Verifications"
          onPress={() =>
            router.push("/admin/approvals")
          }
        />
      </View>
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
          activeOpacity={0.75}
        >
          <Text
            style={styles.sectionActionText}
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

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        <Ionicons
          name={icon}
          size={16}
          color="#DCE7FF"
        />
      </View>

      <Text style={styles.heroStatValue}>
        {value}
      </Text>

      <Text style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  background,
  iconColor,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  background: string;
  iconColor: string;
  accent: string;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statAccent,
          { backgroundColor: accent },
        ]}
      />

      <View
        style={[
          styles.statIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <View style={styles.statArrow}>
        <Ionicons
          name="arrow-up"
          size={13}
          color={accent}
        />
      </View>
    </View>
  );
}

function HealthMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.healthMetric}>
      <Text style={styles.healthMetricValue}>
        {value}
      </Text>

      <Text style={styles.healthMetricLabel}>
        {label}
      </Text>
    </View>
  );
}

function ApprovalCard({
  icon,
  title,
  description,
  count,
  iconBackground,
  iconColor,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  count: string;
  iconBackground: string;
  iconColor: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.approvalCard}
      onPress={onPress}
    >
      <View
        style={[
          styles.approvalAccent,
          { backgroundColor: accent },
        ]}
      />

      <View
        style={[
          styles.approvalIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={iconColor}
        />
      </View>

      <View style={styles.approvalInfo}>
        <Text style={styles.approvalTitle}>
          {title}
        </Text>

        <Text
          style={styles.approvalDescription}
        >
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.numberBadge,
          { backgroundColor: accent },
        ]}
      >
        <Text style={styles.numberText}>
          {count}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#94A3B8"
        style={styles.approvalChevron}
      />
    </TouchableOpacity>
  );
}

function ManagementCard({
  icon,
  title,
  subtitle,
  background,
  iconColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  background: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.managementCard}
      onPress={onPress}
    >
      <View
        style={[
          styles.managementIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={26}
          color={iconColor}
        />
      </View>

      <View style={styles.managementCardTop}>
        <Text
          style={styles.managementTitle}
          numberOfLines={2}
        >
          {title}
        </Text>

        <View style={styles.managementArrow}>
          <Ionicons
            name="arrow-forward"
            size={17}
            color="#64748B"
          />
        </View>
      </View>

      <Text style={styles.managementSubtitle}>
        {subtitle}
      </Text>

      <View style={styles.managementLine}>
        <View
          style={[
            styles.managementLineActive,
            { backgroundColor: iconColor },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

function ActivityCard({
  icon,
  title,
  description,
  time,
  iconBackground,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  iconBackground: string;
  iconColor: string;
}) {
  return (
    <View style={styles.activityCard}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.activityInfo}>
        <View style={styles.activityTitleRow}>
          <Text style={styles.activityTitle}>
            {title}
          </Text>

          <View
            style={[
              styles.activityStatusDot,
              { backgroundColor: iconColor },
            ]}
          />
        </View>

        <Text
          style={styles.activityDescription}
        >
          {description}
        </Text>

        <Text style={styles.activityTime}>
          {time}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* ADMIN BOTTOM NAV ITEM                                                      */
/* -------------------------------------------------------------------------- */

function AdminNavItem({
  icon,
  label,
  active,
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
      style={styles.navItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.navIconWrapper,
          active &&
            styles.navIconWrapperActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            active ? "#2457E6" : "#64748B"
          }
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
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
    paddingBottom: 25,
  },

  /* BACKGROUND */

  backgroundShapeOne: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#EAF1FF",
    top: -115,
    right: -110,
  },

  backgroundShapeTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#EEF8F1",
    top: 650,
    left: -125,
  },

  backgroundShapeThree: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#FFF0DF",
    top: 1250,
    right: -80,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  liveDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#DDF7E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  liveDotInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22A65A",
  },

  liveText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#22A65A",
  },

  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#172033",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    fontWeight: "500",
  },

  notificationButton: {
    width: 55,
    height: 55,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    shadowColor: "#172033",
    shadowOpacity: 0.07,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    right: 12,
    top: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  /* HERO */

  heroWrapper: {
    marginBottom: 38,
  },

  heroCard: {
    minHeight: 405,
    borderRadius: 34,
    padding: 25,
    overflow: "hidden",
    backgroundColor: "#07152D",
    shadowColor: "#2457E6",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    elevation: 12,
  },

  heroGlowOne: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: "#2457E6",
    opacity: 0.34,
    top: -170,
    right: -100,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#7A42D8",
    opacity: 0.22,
    bottom: -130,
    left: -100,
  },

  heroGlowThree: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#22A65A",
    opacity: 0.14,
    top: 180,
    right: -70,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.2)",
  },

  adminBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4DDC82",
    marginRight: 8,
  },

  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  heroIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
  },

  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 27,
  },

  heroTitleAccent: {
    width: 5,
    height: 66,
    borderRadius: 4,
    backgroundColor: "#4F7CFF",
    marginRight: 14,
  },

  heroTitleContainer: {
    flex: 1,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroTitleHighlight: {
    color: "#7FA1FF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    marginTop: 12,
    color: "#c9f5dd",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    maxWidth: 320,
  },

  heroStats: {
    marginTop: 23,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor:
      "rgba(255,255,255,0.13)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroStat: {
    alignItems: "center",
    flex: 1,
  },

  heroStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor:
      "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  heroStatLabel: {
    marginTop: 2,
    color: "#9EB4DE",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  heroDivider: {
    width: 1,
    height: 53,
    backgroundColor:
      "rgba(255,255,255,0.13)",
  },

  heroCTA: {
    marginTop: 18,
    minHeight: 62,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroCTALabel: {
    color: "#8090A8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 2,
  },

  heroCTAText: {
    color: "#173FBD",
    fontSize: 15,
    fontWeight: "900",
  },

  heroCTAIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#EDF2FF",
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
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
    paddingLeft: 5,
  },

  sectionActionText: {
    color: "#2457E6",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 4,
  },

  /* STATS */

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  statCard: {
    width: "48%",
    height: 135,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    padding: 14,
    justifyContent: "space-between",
    shadowColor: "#172033",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  statAccent: {
    position: "absolute",
    top: 0,
    left: 18,
    width: 38,
    height: 4,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  statValue: {
    fontSize: 22,
    lineHeight: 27,
    color: "#172033",
    fontWeight: "800",
    marginTop: 2,
  },

  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: "#667085",
    fontWeight: "600",
  },

  statArrow: {
    position: "absolute",
    right: 16,
    bottom: 17,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#F6F8FC",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HEALTH */

  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 17,
    marginBottom: 38,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    shadowColor: "#172033",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },

  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  healthIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#EEF8F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  healthHeaderText: {
    flex: 1,
  },

  healthTitle: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
  },

  healthSubtitle: {
    color: "#718096",
    fontSize: 11,
    marginTop: 3,
  },

  operationalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF8F1",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 100,
  },

  operationalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22A65A",
    marginRight: 5,
  },

  operationalText: {
    color: "#22A65A",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  healthMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F6",
  },

  healthMetric: {
    flex: 1,
    alignItems: "center",
  },

  healthMetricValue: {
    color: "#331718",
    fontSize: 16,
    fontWeight: "900",
  },

  healthMetricLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },

  healthMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E8ECF4",
  },

  /* APPROVALS */

  approvalList: {
    marginBottom: 38,
  },

  approvalCard: {
    minHeight: 84,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#172033",
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
    overflow: "hidden",
  },

  approvalAccent: {
    position: "absolute",
    left: 0,
    top: 15,
    bottom: 15,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  approvalIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginLeft: 3,
  },

  approvalInfo: {
    flex: 1,
  },

  approvalTitle: {
    color: "#172033",
    fontSize: 15,
    fontWeight: "900",
  },

  approvalDescription: {
    color: "#718096",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  numberBadge: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  numberText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  approvalChevron: {
    marginRight: 3,
  },

  /* MANAGEMENT */

  managementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 38,
  },

  managementCard: {
    width: "48%",
    minHeight: 175,
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

  managementIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  managementCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  managementTitle: {
    color: "#172033",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    paddingRight: 5,
    flex: 1,
  },

  managementSubtitle: {
    color: "#718096",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  managementArrow: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  managementLine: {
    height: 4,
    borderRadius: 3,
    backgroundColor: "#F1F3F7",
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    overflow: "hidden",
  },

  managementLineActive: {
    height: 4,
    width: "35%",
    borderRadius: 3,
  },

  /* INSIGHT */

  insightCard: {
    backgroundColor: "#EAF1FF",
    borderRadius: 27,
    padding: 20,
    marginBottom: 38,
    borderWidth: 1,
    borderColor: "#DCE6FF",
  },

  insightTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  insightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
  },

  insightBadgeText: {
    color: "#2457E6",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  insightTitle: {
    color: "#172033",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    marginTop: 17,
  },

  insightText: {
    color: "#52647F",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  insightButton: {
    height: 46,
    borderRadius: 15,
    backgroundColor: "#2457E6",
    marginTop: 16,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  insightButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* ACTIVITY */

  activityList: {
    marginBottom: 22,
  },

  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    flexDirection: "row",
    shadowColor: "#172033",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  activityIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  activityInfo: {
    flex: 1,
  },

  activityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  activityTitle: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
    flex: 1,
  },

  activityStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 7,
  },

  activityDescription: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  activityTime: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },

  emptyActivityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 15,
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

  emptyActivityIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#F1F3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  emptyActivityInfo: {
    flex: 1,
  },

  emptyActivityTitle: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
  },

  emptyActivityText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  /* LOGOUT */

  logoutButton: {
    height: 58,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1D5D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "900",
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    shadowColor: "#172033",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 8,
    zIndex: 100,
  },

  navItem: {
    flex: 1,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconWrapper: {
    width: 40,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },

  navIconWrapperActive: {
    backgroundColor: "#EAF1FF",
  },

  navLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },

  navLabelActive: {
    color: "#2457E6",
    fontWeight: "900",
  },

  /* CONTENT SPACER */

  bottomSpacer: {
    height: 105,
  },
});

