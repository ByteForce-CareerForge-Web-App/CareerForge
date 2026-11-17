import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type Connection = {
  connection_id: number;
  user_id: number;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  connection_status?: string;
  created_at?: string;
  qualification?: string | null;
  graduation_year?: string | number | null;
  company?: string | null;
  position?: string | null;
  industry?: string | null;
  initials?: string;
};

export default function ConnectionProfileScreen() {
  const params = useLocalSearchParams<{
    personId?: string;
    initials?: string;
    name?: string;
    role?: string;
    company?: string;
    returnTo?: string;
  }>();

  const personId =
    params.personId || 'connection';

  const [profileInitials, setProfileInitials] =
    useState(params.initials || 'CF');

  const [profileName, setProfileName] =
    useState(params.name || 'Professional Connection');

  const [profileRole, setProfileRole] =
    useState(params.role || 'Professional');

  const [profileCompany, setProfileCompany] =
    useState(
      params.company ||
        'CareerForge Network'
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const returnTo =
    params.returnTo || 'connections';

  /*
   * HANDLE UNAUTHORIZED SESSION
   */
  const handleUnauthorized = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');

    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/login'),
        },
      ]
    );
  };

  /*
   * LOAD REAL CONNECTION
   */
  const loadConnection = useCallback(
    async () => {
      if (
        !personId ||
        personId === 'connection'
      ) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          await handleUnauthorized();
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/connections.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.status === 401) {
          await handleUnauthorized();
          return;
        }

        const text =
          await response.text();

        let result: any;

        try {
          result = JSON.parse(text);
        } catch {
          console.error(
            'Invalid connections response:',
            text
          );

          throw new Error(
            'The server returned an invalid response.'
          );
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Failed to load connection profile.'
          );
        }

        const connections:
          Connection[] =
          Array.isArray(
            result.data?.connections
          )
            ? result.data.connections
            : [];

        const numericPersonId =
          Number(personId);

        const connection =
          connections.find(
            (item) =>
              Number(item.user_id) ===
              numericPersonId
          );

        /*
         * The person must be an accepted
         * connection.
         */
        if (!connection) {
          Alert.alert(
            'Connection Not Found',
            'This person is no longer an active connection.'
          );

          setIsLoading(false);
          return;
        }

        /*
         * Update profile information
         * using backend data.
         */
        setProfileName(
          connection.name ||
            params.name ||
            'Professional Connection'
        );

        setProfileInitials(
          connection.initials ||
            params.initials ||
            getInitials(
              connection.name ||
                'Professional Connection'
            )
        );

        /*
         * Prefer the person's actual
         * professional position.
         *
         * Fall back to their account role.
         */
        setProfileRole(
          connection.position?.trim() ||
            connection.role ||
            params.role ||
            'Professional'
        );

        setProfileCompany(
          connection.company?.trim() ||
            params.company ||
            'CareerForge Network'
        );
      } catch (error) {
        console.error(
          'Error loading connection profile:',
          error
        );

        /*
         * Keep the navigation params as
         * a fallback so the profile still
         * displays useful information if
         * the backend temporarily fails.
         */
      } finally {
        setIsLoading(false);
      }
    },
    [personId]
  );

  useFocusEffect(
    useCallback(() => {
      loadConnection();
    }, [loadConnection])
  );

  /*
   * BACK BUTTON
   *
   * If this profile was opened from Chat,
   * return directly to that chat.
   *
   * Otherwise use the normal navigation
   * history.
   */
  const handleBack = () => {
    if (returnTo === 'chat') {
      router.replace({
        pathname: '/alumni/chat',
        params: {
          personId,
          initials: profileInitials,
          name: profileName,
          role: profileRole,
          company: profileCompany,
        },
      });

      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/alumni/networking');
  };

  /*
   * OPEN CHAT
   */
  const handleMessage = () => {
    router.push({
      pathname: '/alumni/chat',
      params: {
        personId,
        initials: profileInitials,
        name: profileName,
        role: profileRole,
        company: profileCompany,
      },
    });
  };

  /*
   * VIEW NETWORK
   */
  const handleNetwork = () => {
    router.replace('/alumni/networking');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={styles.headerEyebrow}
            >
              ALUMNI NETWORK
            </Text>

            <Text
              style={styles.headerTitle}
            >
              Connection Profile
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* PROFILE HERO */}
        <View style={styles.profileCard}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text
                style={styles.avatarText}
              >
                {profileInitials}
              </Text>
            </View>

            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.name}>
            {profileName}
          </Text>

          <Text style={styles.role}>
            {profileRole}
          </Text>

          <View style={styles.companyRow}>
            <Ionicons
              name="business-outline"
              size={14}
              color="#667085"
            />

            <Text style={styles.company}>
              {profileCompany}
            </Text>
          </View>

          <View
            style={styles.connectionBadge}
          >
            <Ionicons
              name="checkmark-circle"
              size={14}
              color="#15803D"
            />

            <Text
              style={
                styles.connectionBadgeText
              }
            >
              Connected
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsCard}>
          <Pressable
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.actionTextContainer
              }
            >
              <Text
                style={styles.actionTitle}
              >
                Message
              </Text>

              <Text
                style={styles.actionSubtitle}
              >
                Continue your professional
                conversation
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.actionRow}
            onPress={handleNetwork}
          >
            <View
              style={styles.secondaryIcon}
            >
              <Ionicons
                name="people-outline"
                size={21}
                color="#2457E6"
              />
            </View>

            <View
              style={
                styles.actionTextContainer
              }
            >
              <Text
                style={styles.actionTitle}
              >
                View Network
              </Text>

              <Text
                style={styles.actionSubtitle}
              >
                Explore professional
                connections
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </Pressable>
        </View>

        {/* PROFESSIONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Professional Information
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View
                style={styles.infoLabelRow}
              >
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color="#2457E6"
                  />
                </View>

                <Text
                  style={styles.infoLabel}
                >
                  Role
                </Text>
              </View>

              <Text style={styles.infoValue}>
                {profileRole}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View
                style={styles.infoLabelRow}
              >
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color="#2457E6"
                  />
                </View>

                <Text
                  style={styles.infoLabel}
                >
                  Organisation
                </Text>
              </View>

              <Text style={styles.infoValue}>
                {profileCompany}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View
                style={styles.infoLabelRow}
              >
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="link-outline"
                    size={16}
                    color="#2457E6"
                  />
                </View>

                <Text
                  style={styles.infoLabel}
                >
                  Network Status
                </Text>
              </View>

              <View
                style={styles.connectedStatus}
              >
                <View
                  style={styles.connectedDot}
                />

                <Text
                  style={styles.connectedText}
                >
                  Connected
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONNECTION INFO */}
        <View style={styles.infoBanner}>
          <View style={styles.bannerIcon}>
            <Ionicons
              name="people-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.bannerContent}>
            <Text
              style={styles.bannerTitle}
            >
              Build meaningful connections
            </Text>

            <Text style={styles.bannerText}>
              Use CareerForgeAI to connect with
              professionals, exchange knowledge,
              and grow your career network.
            </Text>
          </View>
        </View>

        {/* RETURN TO CHAT */}
        {returnTo === 'chat' && (
          <Pressable
            style={styles.returnChatButton}
            onPress={handleMessage}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={styles.returnChatText}
            >
              Return to Chat
            </Text>
          </Pressable>
        )}

        {/* BACK TO DASHBOARD */}
        <Pressable
          style={styles.backDashboardButton}
          onPress={() =>
            router.replace(
              '/alumni/dashboard'
            )
          }
        >
          <Ionicons
            name="grid-outline"
            size={17}
            color="#2457E6"
          />

          <Text
            style={styles.backDashboardText}
          >
            Back to Dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function getInitials(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'CF';
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0].substring(0, 1) +
    parts[parts.length - 1]
      .substring(0, 1)
  ).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  content: {
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    backgroundColor: '#102A72',
    paddingTop:
      Platform.OS === 'ios' ? 50 : 38,
    paddingBottom: 19,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#AFC4FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  headerSpacer: {
    width: 42,
  },

  /* PROFILE */

  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E7F0',
    elevation: 3,
  },

  avatarOuter: {
    position: 'relative',
    marginBottom: 15,
  },

  avatar: {
    width: 91,
    height: 91,
    borderRadius: 46,
    backgroundColor: '#E8F0FF',
    borderWidth: 3,
    borderColor: '#6B8FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#2457E6',
    fontSize: 26,
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    right: 2,
    bottom: 3,
  },

  name: {
    fontSize: 23,
    fontWeight: '900',
    color: '#102A72',
    textAlign: 'center',
  },

  role: {
    fontSize: 14,
    color: '#2457E6',
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  company: {
    fontSize: 12,
    color: '#667085',
    marginLeft: 5,
    textAlign: 'center',
  },

  connectionBadge: {
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EAF7EF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectionBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* ACTIONS */

  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E7F0',
    elevation: 2,
  },

  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  secondaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  actionTextContainer: {
    flex: 1,
    marginRight: 8,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172A55',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#667085',
    marginTop: 4,
    lineHeight: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EDF3',
  },

  /* INFORMATION */

  section: {
    marginHorizontal: 16,
    marginTop: 23,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 11,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E1E7F0',
    elevation: 2,
  },

  infoRow: {
    minHeight: 66,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  infoLabel: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '600',
  },

  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#344054',
    textAlign: 'right',
    marginLeft: 10,
  },

  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  connectedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },

  /* BANNER */

  infoBanner: {
    marginHorizontal: 16,
    marginTop: 19,
    backgroundColor: '#E8F0FF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    flexDirection: 'row',
  },

  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  bannerContent: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 5,
  },

  bannerText: {
    fontSize: 12,
    color: '#526579',
    lineHeight: 18,
  },

  /* RETURN CHAT */

  returnChatButton: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#2457E6',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  returnChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  /* DASHBOARD */

  backDashboardButton: {
    marginHorizontal: 16,
    marginTop: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#C9D8FF',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  backDashboardText: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },
});