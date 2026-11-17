
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type AlumniProfile = {
  id?: number;
  profile_id?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  qualification?: string;
  graduation_year?: string | number;
  company?: string | null;
  position?: string | null;
  verified?: boolean;
};

type ConnectionResponse = {
  success?: boolean;
  data?: {
    accepted?: any[];
    connections?: any[];
    people?: any[];
  };
  accepted?: any[];
  connections?: any[];
  people?: any[];
};

type MessagesResponse = {
  success?: boolean;
  data?: {
    conversations?: any[];
  };
  conversations?: any[];
};

type NotificationsResponse = {
  success?: boolean;
  data?: {
    notifications?: any[];
    unread_count?: number;
  };
  notifications?: any[];
  unread_count?: number;
};

type Experience = {
  id?: number;
  job_title?: string;
  company?: string;
  start_year?: string | number;
  end_year?: string | number | null;
  description?: string;
};

type OpportunitiesResponse = {
  success?: boolean;
  data?: any;
  opportunities?: any[];
};

type AIResponse = {
  success?: boolean;
  data?: any;
};

type DashboardData = {
  profile: AlumniProfile;
  profileCompletion: number;
  skillsCount: number;
  connectionsCount: number;
  conversationsCount: number;
  unreadMessages: number;
  unreadNotifications: number;
  experienceCount: number;
  opportunityCount: number;
  aiAvailable: boolean;
};

const defaultData: DashboardData = {
  profile: {},
  profileCompletion: 0,
  skillsCount: 0,
  connectionsCount: 0,
  conversationsCount: 0,
  unreadMessages: 0,
  unreadNotifications: 0,
  experienceCount: 0,
  opportunityCount: 0,
  aiAvailable: false,
};

function getResponseData<T>(response: T & { data?: any }): any {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }

  return response;
}

function extractArray(value: any, possibleKeys: string[] = []): any[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  for (const key of possibleKeys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  return [];
}

function getNumericValue(value: any): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function calculateProfileCompletion(
  profile: AlumniProfile,
  skillsCount: number,
  experienceCount: number
): number {
  const checks = [
    Boolean(profile.name?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.qualification?.trim()),
    Boolean(profile.graduation_year),
    Boolean(profile.company?.trim()),
    Boolean(profile.position?.trim()),
    skillsCount > 0,
    experienceCount > 0,
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

function calculateGrowthValues(
  profileCompletion: number,
  skillsCount: number,
  experienceCount: number,
  connectionsCount: number
) {
  const skillsProgress =
    skillsCount === 0
      ? 0
      : Math.min(100, Math.round((skillsCount / 5) * 100));

  const experienceProgress =
    experienceCount === 0
      ? 0
      : Math.min(100, Math.round((experienceCount / 3) * 100));

  const networkingProgress =
    connectionsCount === 0
      ? 0
      : Math.min(100, Math.round((connectionsCount / 5) * 100));

  const overall = Math.round(
    (profileCompletion +
      skillsProgress +
      experienceProgress +
      networkingProgress) /
      4
  );

  return {
    profile: profileCompletion,
    skills: skillsProgress,
    experience: experienceProgress,
    networking: networkingProgress,
    overall,
  };
}

export default function AlumniDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData>(defaultData);

  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      /*
       * Load the main dashboard data independently.
       *
       * If one endpoint fails, the other dashboard information
       * can still be displayed.
       */
      const [
        profileResponse,
        connectionsResponse,
        messagesResponse,
        notificationsResponse,
        experienceResponse,
        opportunitiesResponse,
        aiResponse,
        skillsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/profiles/alumni.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/connections.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/messages.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/notifications.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/alumni/alumni-experience.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/opportunities.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/alumni/ai-analysis-result.php`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE_URL}/skills.php`, {
          method: 'GET',
          headers,
        }),
      ]);

      const responses = [
        profileResponse,
        connectionsResponse,
        messagesResponse,
        notificationsResponse,
        experienceResponse,
        opportunitiesResponse,
        aiResponse,
        skillsResponse,
      ];

      /*
       * If authentication has expired, send the alumni back
       * to login rather than displaying a broken dashboard.
       */
      if (responses.some((response) => response.status === 401)) {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
        ]);

        router.replace('/login');
        return;
      }

      let profile: AlumniProfile = {};

      if (profileResponse.ok) {
        try {
          const json = await profileResponse.json();
          const data = getResponseData(json);

          if (data?.profile && typeof data.profile === 'object') {
            profile = data.profile;
          } else if (data && typeof data === 'object') {
            profile = data;
          }
        } catch {
          // Keep default profile if the response cannot be parsed.
        }
      }

      /*
       * Connections
       */
      let connections: any[] = [];

      if (connectionsResponse.ok) {
        try {
          const json: ConnectionResponse =
            await connectionsResponse.json();

          const data = getResponseData(json);

          connections =
            extractArray(data, [
              'accepted',
              'connections',
              'people',
            ]);
        } catch {
          connections = [];
        }
      }

      /*
       * Messages
       */
      let conversations: any[] = [];

      if (messagesResponse.ok) {
        try {
          const json: MessagesResponse =
            await messagesResponse.json();

          const data = getResponseData(json);

          conversations = extractArray(data, [
            'conversations',
          ]);
        } catch {
          conversations = [];
        }
      }

      /*
       * Notifications
       */
      let unreadNotifications = 0;

      if (notificationsResponse.ok) {
        try {
          const json: NotificationsResponse =
            await notificationsResponse.json();

          const data = getResponseData(json);

          unreadNotifications = getNumericValue(
            data?.unread_count ??
              json.unread_count ??
              0
          );

          /*
           * Fallback in case the endpoint does not provide
           * unread_count.
           */
          if (
            unreadNotifications === 0 &&
            Array.isArray(data?.notifications)
          ) {
            unreadNotifications =
              data.notifications.filter(
                (notification: any) =>
                  Number(notification.is_read) === 0 ||
                  notification.is_read === false
              ).length;
          }
        } catch {
          unreadNotifications = 0;
        }
      }

      /*
       * Professional experience
       */
      let experiences: Experience[] = [];

      if (experienceResponse.ok) {
        try {
          const json = await experienceResponse.json();
          const data = getResponseData(json);

          experiences = extractArray(data, [
            'experiences',
          ]);
        } catch {
          experiences = [];
        }
      }

      /*
       * Opportunities
       */
      let opportunities: any[] = [];

      if (opportunitiesResponse.ok) {
        try {
          const json: OpportunitiesResponse =
            await opportunitiesResponse.json();

          const data = getResponseData(json);

          opportunities = extractArray(data, [
            'opportunities',
            'results',
          ]);

          /*
           * Some APIs return the array directly inside data.
           */
          if (
            opportunities.length === 0 &&
            Array.isArray(data)
          ) {
            opportunities = data;
          }
        } catch {
          opportunities = [];
        }
      }

      /*
       * AI Career Insights
       */
      let aiAvailable = false;

      if (aiResponse.ok) {
        try {
          const json: AIResponse = await aiResponse.json();
          const data = getResponseData(json);

          aiAvailable = Boolean(
            json.success &&
              data &&
              typeof data === 'object'
          );
        } catch {
          aiAvailable = false;
        }
      }

      /*
       * Skills
       */
      let skills: any[] = [];

      if (skillsResponse.ok) {
        try {
          const json = await skillsResponse.json();
          const data = getResponseData(json);

          skills = extractArray(data, [
            'skills',
            'user_skills',
          ]);

          if (
            skills.length === 0 &&
            Array.isArray(data)
          ) {
            skills = data;
          }
        } catch {
          skills = [];
        }
      }

      /*
       * Calculate the dashboard values.
       *
       * We deliberately calculate these from actual backend
       * information instead of keeping the old hardcoded
       * 75%, 5 skills and 3 connections.
       */
      const profileCompletion =
        calculateProfileCompletion(
          profile,
          skills.length,
          experiences.length
        );

      const growth = calculateGrowthValues(
        profileCompletion,
        skills.length,
        experiences.length,
        connections.length
      );

      const unreadMessages = conversations.reduce(
        (total, conversation) =>
          total +
          getNumericValue(conversation?.unread_count),
        0
      );

      setDashboard({
        profile,
        profileCompletion,
        skillsCount: skills.length,
        connectionsCount: connections.length,
        conversationsCount: conversations.length,
        unreadMessages,
        unreadNotifications,
        experienceCount: experiences.length,
        opportunityCount: opportunities.length,
        aiAvailable,
      });

    } catch (error) {
      console.error(
        'Alumni dashboard error:',
        error
      );

      /*
       * Do not destroy the existing dashboard if a single
       * network request fails.
       */
      Alert.alert(
        'Dashboard',
        'Some dashboard information could not be loaded. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const growth = calculateGrowthValues(
    dashboard.profileCompletion,
    dashboard.skillsCount,
    dashboard.experienceCount,
    dashboard.connectionsCount
  );

  const displayName =
    dashboard.profile.name?.trim() || 'Alumni Member';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              Welcome back{displayName ? `, ${displayName}` : ''}
            </Text>

            <Text style={styles.title}>
              Alumni Dashboard
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() =>
                router.push('/alumni/notifications')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.notificationIcon}>
                🔔
              </Text>

              {dashboard.unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text
                    style={styles.notificationBadgeText}
                  >
                    {dashboard.unreadNotifications > 99
                      ? '99+'
                      : dashboard.unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                router.push('/alumni/profile')
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={21}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Career Journey */}
        <View style={styles.journeyCard}>
          <View style={styles.journeyHeader}>
            <View style={styles.journeyIcon}>
              <Ionicons
                name="trending-up-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.journeyHeaderText}>
              <Text style={styles.journeyTitle}>
                Your Career Journey
              </Text>

              <Text style={styles.journeySubtitle}>
                Keep building your professional future
              </Text>
            </View>
          </View>

          <Text style={styles.journeyDescription}>
            Stay connected, grow your skills, support students and discover
            opportunities through the CareerForge community.
          </Text>

          <View style={styles.journeyStats}>
            {/* Profile */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>
                {loading
                  ? '—'
                  : `${dashboard.profileCompletion}%`}
              </Text>

              <Text style={styles.journeyStatLabel}>
                Profile Complete
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>
                {loading
                  ? '—'
                  : dashboard.skillsCount}
              </Text>

              <Text style={styles.journeyStatLabel}>
                Skills
              </Text>
            </View>

            {/* Connections */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>
                {loading
                  ? '—'
                  : dashboard.connectionsCount}
              </Text>

              <Text style={styles.journeyStatLabel}>
                Connections
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.journeyButton}
            onPress={() =>
              router.push('/alumni/profile')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.journeyButtonText}>
              View My Profile
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#1769AA"
            />
          </TouchableOpacity>
        </View>

        {/* Career Growth */}
        <Text style={styles.sectionTitle}>
          Career Growth
        </Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                Overall Progress
              </Text>

              <Text style={styles.progressSubtitle}>
                Keep developing your professional profile
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {loading
                ? '—'
                : `${growth.overall}%`}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${growth.overall}%`,
                },
              ]}
            />
          </View>

          {/* Progress Items */}
          <View style={styles.progressItems}>

            {/* Profile */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Profile
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                {loading
                  ? '—'
                  : `${growth.profile}%`}
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="layers-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Skills
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                {loading
                  ? '—'
                  : `${growth.skills}%`}
              </Text>
            </View>

            {/* Experience */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Experience
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                {loading
                  ? '—'
                  : `${growth.experience}%`}
              </Text>
            </View>

            {/* Networking */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Networking
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                {loading
                  ? '—'
                  : `${growth.networking}%`}
              </Text>
            </View>

          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        {/* Career Insights */}
        <TouchableOpacity
          style={styles.insightsCard}
          onPress={() =>
            router.push('/alumni/career-insights')
          }
          activeOpacity={0.8}
        >
          <View style={styles.insightsIcon}>
            <Ionicons
              name="sparkles"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.insightsInfo}>
            <Text style={styles.insightsTitle}>
              Career Insights
            </Text>

            <Text style={styles.insightsDescription}>
              View your employability score, career recommendations,
              skills analysis and AI-powered career insights.
            </Text>

            <Text style={styles.insightsButton}>
              {dashboard.aiAvailable
                ? 'View Career Insights →'
                : 'Generate Career Insights →'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <View style={styles.grid}>

          {/* Mentor Students */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push('/alumni/mentor-students')
            }
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="school-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Mentor Students
            </Text>

            <Text style={styles.actionDescription}>
              Guide students with your experience.
            </Text>

            <Text style={styles.cardLink}>
              Mentor Students →
            </Text>
          </TouchableOpacity>

          {/* Career Roadmap */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push('/alumni/career-roadmap')
            }
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="map-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Career Roadmap
            </Text>

            <Text style={styles.actionDescription}>
              Plan your professional growth and track your career journey.
            </Text>

            <Text style={styles.cardLink}>
              View Roadmap →
            </Text>
          </TouchableOpacity>

          {/* Share Experience */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push('/alumni/share-experience')
            }
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="share-social-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Share Experience
            </Text>

            <Text style={styles.actionDescription}>
              Share advice and career knowledge.
            </Text>

            <Text style={styles.cardLink}>
              Share Your Story →
            </Text>
          </TouchableOpacity>

          {/* Messages */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push('/alumni/messages')
            }
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="chatbubbles-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Messages
            </Text>

            <Text style={styles.actionDescription}>
              Stay connected with your professional network.
            </Text>

            <Text style={styles.cardLink}>
              View Messages →
            </Text>
          </TouchableOpacity>

        </View>

        {/* What's Happening */}
        <Text style={styles.sectionTitle}>
          What's Happening
        </Text>

        {/* Career Insight Update */}
        <TouchableOpacity
          style={styles.updateCard}
          onPress={() =>
            router.push('/alumni/career-insights')
          }
          activeOpacity={0.8}
        >
          <View style={styles.updateIcon}>
            <Ionicons
              name="sparkles-outline"
              size={22}
              color="#1769AA"
            />
          </View>

          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>
              {dashboard.aiAvailable
                ? 'Career Insight Available'
                : 'Career Insights'}
            </Text>

            <Text style={styles.updateDescription}>
              {dashboard.aiAvailable
                ? 'Your latest career recommendations are ready to review.'
                : 'Generate your personalised AI career analysis and recommendations.'}
            </Text>

            <Text style={styles.updateLink}>
              View Insights →
            </Text>
          </View>
        </TouchableOpacity>

        {/* New Opportunities */}
        <TouchableOpacity
          style={styles.updateCard}
          onPress={() =>
            router.push('/alumni/opportunities')
          }
          activeOpacity={0.8}
        >
          <View style={styles.updateIcon}>
            <Ionicons
              name="briefcase-outline"
              size={22}
              color="#1769AA"
            />
          </View>

          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>
              New Opportunities Available
            </Text>

            <Text style={styles.updateDescription}>
              {dashboard.opportunityCount > 0
                ? `${dashboard.opportunityCount} opportunities are currently available to explore.`
                : 'Explore opportunities that match your professional interests.'}
            </Text>

            <Text style={styles.updateLink}>
              Explore Jobs →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Messages Update */}
        {dashboard.unreadMessages > 0 && (
          <TouchableOpacity
            style={styles.updateCard}
            onPress={() =>
              router.push('/alumni/messages')
            }
            activeOpacity={0.8}
          >
            <View style={styles.updateIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color="#1769AA"
              />
            </View>

            <View style={styles.updateInfo}>
              <Text style={styles.updateTitle}>
                New Messages
              </Text>

              <Text style={styles.updateDescription}>
                You have {dashboard.unreadMessages}{' '}
                unread message
                {dashboard.unreadMessages === 1
                  ? ''
                  : 's'} from your network.
              </Text>

              <Text style={styles.updateLink}>
                View Messages →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Community */}
        <Text style={styles.sectionTitle}>
          CareerForge Community
        </Text>

        <View style={styles.communityCard}>
          <Text style={styles.communityTitle}>
            Support the next generation
          </Text>

          <Text style={styles.communityDescription}>
            Connect with students, provide mentorship, share your career
            experience and help graduates become more employable.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push('/alumni/networking')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Connect With Students
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Opportunities */}
        <Text style={styles.sectionTitle}>
          Recommended Opportunities
        </Text>

        <View style={styles.opportunityCard}>
          <View style={styles.opportunityInfo}>
            <Text style={styles.opportunityTitle}>
              Explore Opportunities
            </Text>

            <Text style={styles.opportunityDescription}>
              {dashboard.opportunityCount > 0
                ? `${dashboard.opportunityCount} opportunities available based on your professional profile and career interests.`
                : 'Find opportunities that match your professional interests.'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() =>
              router.push('/alumni/opportunities')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.smallButtonText}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.multiRemove([
              'authToken',
              'user',
            ]);

            router.replace('/login');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>

        {/* Home */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.replace('/alumni/dashboard')
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.navIcon,
              styles.activeNavIcon,
            ]}
          >
            <Ionicons
              name="home"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.navLabel,
              styles.activeNavLabel,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Opportunities */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/alumni/opportunities')
          }
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="briefcase-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Jobs
          </Text>
        </TouchableOpacity>

        {/* My Applications */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/alumni/my-applications')
          }
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="document-text-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Applications
          </Text>
        </TouchableOpacity>

        {/* Networking */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/alumni/networking')
          }
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="people-outline"
              size={22}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            My Network
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/alumni/profile')
          }
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="person-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 115,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 15,
    color: '#667085',
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 22,
  },

  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D92D20',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Sections */

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 14,
    marginTop: 4,
  },

  /* Career Journey */

  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  journeyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  journeyHeaderText: {
    flex: 1,
  },

  journeyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  journeySubtitle: {
    fontSize: 12,
    color: '#667085',
  },

  journeyDescription: {
    fontSize: 13,
    color: '#526579',
    lineHeight: 19,
    marginBottom: 18,
  },

  journeyStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    paddingVertical: 15,
    marginBottom: 15,
  },

  journeyStat: {
    flex: 1,
    alignItems: 'center',
  },

  journeyStatValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1769AA',
    marginBottom: 4,
  },

  journeyStatLabel: {
    fontSize: 10,
    color: '#667085',
    textAlign: 'center',
  },

  journeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
  },

  journeyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1769AA',
  },

  /* Career Growth */

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  progressSubtitle: {
    fontSize: 12,
    color: '#667085',
  },

  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1769AA',
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#E8EDF3',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#1769AA',
    borderRadius: 5,
  },

  progressItems: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDF3',
  },

  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  progressItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
  },

  progressItemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  /* Career Insights */

  insightsCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  insightsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  insightsInfo: {
    flex: 1,
  },

  insightsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 5,
  },

  insightsDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#40566F',
  },

  insightsButton: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
    marginTop: 9,
  },

  /* Quick Actions */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    minHeight: 175,
    elevation: 2,
  },

  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  actionDescription: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 17,
  },

  cardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1769AA',
    marginTop: 12,
  },

  /* What's Happening */

  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  updateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  updateInfo: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  updateDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#667085',
  },

  updateLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1769AA',
    marginTop: 7,
  },

  /* Community */

  communityCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  communityTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 8,
  },

  communityDescription: {
    fontSize: 14,
    color: '#526579',
    lineHeight: 21,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Opportunities */

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },

  opportunityInfo: {
    marginBottom: 5,
  },

  opportunityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 6,
  },

  opportunityDescription: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 19,
    marginBottom: 15,
  },

  smallButton: {
    backgroundColor: '#1769AA',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Logout */

  logoutButton: {
    borderWidth: 1,
    borderColor: '#D92D20',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  logoutText: {
    color: '#D92D20',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Bottom Navigation */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingBottom: 6,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  activeNavIcon: {
    backgroundColor: '#0B1F3A',
  },

  navLabel: {
    fontSize: 10,
    color: '#667085',
    fontWeight: '600',
  },

  activeNavLabel: {
    color: '#0B1F3A',
    fontWeight: '800',
  },
});

