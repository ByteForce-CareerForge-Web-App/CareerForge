// @ts-nocheck

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';

type Person = {
  id: string;
  name: string;
  role: string;
  programme: string;
  initials: string;
};

type BackendPerson = {
  connection_id?: number | string;
  user_id?: number | string;
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  qualification?: string;
  programme?: string;
  target_role?: string;
  status?: string;
  created_at?: string;
};

export default function ConnectionsScreen() {
  const params =
    useLocalSearchParams<{
      openProfile?: string;
      returnTo?: string;
      conversationId?: string;
      personId?: string;
      name?: string;
      role?: string;
      programme?: string;
      initials?: string;
      online?: string;
    }>();

  const [people, setPeople] =
    useState<Person[]>([]);

  const [requests, setRequests] =
    useState<Person[]>([]);

  /*
   * IDs of users that the current student
   * has already sent a request to.
   */
  const [sentRequests, setSentRequests] =
    useState<string[]>([]);

  const [connections, setConnections] =
    useState<Person[]>([]);

  const [search, setSearch] =
    useState('');

  const [selectedPerson, setSelectedPerson] =
    useState<Person | null>(null);

  const [profileReturnToChat, setProfileReturnToChat] =
    useState(false);

  /*
   * ----------------------------------------------------------
   * HELPERS
   * ----------------------------------------------------------
   */

  const getInitials = (
    name: string
  ) => {
    if (!name) {
      return '??';
    }

    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (
    role?: string
  ) => {
    if (!role) {
      return 'Student';
    }

    return role.charAt(0).toUpperCase() +
      role.slice(1);
  };

  const convertPerson = (
    person: BackendPerson,
    useConnectionId = false
  ): Person => {
    const userId =
      person.user_id ??
      person.id ??
      '';

    const connectionId =
      person.connection_id ??
      userId;

    const name =
      person.name ||
      'CareerForgeAI Member';

    const role =
      formatRole(person.role);

    /*
     * Backend may provide qualification
     * or programme depending on the query.
     */
    const programme =
      person.programme ||
      person.qualification ||
      person.target_role ||
      '';

    return {
      /*
       * IMPORTANT:
       *
       * Incoming requests need the
       * connection ID because Accept/
       * Reject operate on connection_id.
       *
       * Available people, sent requests
       * and accepted connections use the
       * actual user's ID.
       */
      id: String(
        useConnectionId
          ? connectionId
          : userId
      ),

      name,

      role,

      programme,

      initials:
        getInitials(name),
    };
  };

  /*
   * ----------------------------------------------------------
   * LOAD REAL BACKEND CONNECTION DATA
   * ----------------------------------------------------------
   */

  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const loadConnections = async () => {
    try {
      const authToken =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!authToken) {
        console.log(
          'Connections: No auth token found.'
        );

        setPeople([]);
        setRequests([]);
        setSentRequests([]);
        setConnections([]);

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/connections.php`,
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${authToken}`,
            Accept:
              'application/json',
          },
        }
      );

      const rawResponse =
        await response.text();

      console.log(
        'Connections API status:',
        response.status
      );

      console.log(
        'Connections API response:',
        rawResponse
      );

      let result;

      try {
        result =
          JSON.parse(rawResponse);
      } catch {
        throw new Error(
          'The connections API returned an invalid response.'
        );
      }

      if (
        response.status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          'Failed to load connections.'
        );
      }

      const data =
        result?.data || {};

      /*
       * ------------------------------------------------------
       * INCOMING REQUESTS
       *
       * IMPORTANT:
       * Use connection_id here because
       * Accept/Reject require connection_id.
       * ------------------------------------------------------
       */

      const incoming =
        Array.isArray(
          data.incoming_requests
        )
          ? data.incoming_requests
          : [];

      const normalizedRequests =
        incoming.map(
          (item: BackendPerson) =>
            convertPerson(
              item,
              true
            )
        );

      /*
       * ------------------------------------------------------
       * SENT REQUESTS
       *
       * These use the receiver's USER ID.
       * ------------------------------------------------------
       */

      const sent =
        Array.isArray(
          data.sent_requests
        )
          ? data.sent_requests
          : [];

      const normalizedSent =
        sent.map(
          (item: BackendPerson) =>
            String(
              item.user_id ??
              item.id ??
              ''
            )
        ).filter(
          (id: string) =>
            id !== ''
        );

      /*
       * ------------------------------------------------------
       * ACCEPTED CONNECTIONS
       * ------------------------------------------------------
       */

      const accepted =
        Array.isArray(
          data.connections
        )
          ? data.connections
          : [];

      const normalizedConnections =
        accepted.map(
          (item: BackendPerson) =>
            convertPerson(
              item,
              false
            )
        );

      /*
       * ------------------------------------------------------
       * AVAILABLE PEOPLE
       * ------------------------------------------------------
       */

      const available =
        Array.isArray(
          data.available_people
        )
          ? data.available_people
          : [];

      const normalizedPeople =
        available.map(
          (item: BackendPerson) =>
            convertPerson(
              item,
              false
            )
        );

      setRequests(
        normalizedRequests
      );

      setSentRequests(
        normalizedSent
      );

      setConnections(
        normalizedConnections
      );

      setPeople(
        normalizedPeople
      );

    } catch (error) {
      console.log(
        'Error loading connections:',
        error
      );

      setPeople([]);
      setRequests([]);
      setSentRequests([]);
      setConnections([]);

      Alert.alert(
        'Unable to Load Connections',
        error?.message ||
          'Please check your connection and try again.'
      );
    }
  };

  /*
   * ----------------------------------------------------------
   * OPEN PROFILE FROM NAVIGATION PARAMS
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (
      params.openProfile !== 'true' ||
      !params.name
    ) {
      return;
    }

    const requestedId =
      params.personId ||
      params.conversationId;

    const allKnownPeople = [
      ...people,
      ...requests,
      ...connections,
    ];

    let person =
      allKnownPeople.find(
        item =>
          item.id === requestedId
      );

    /*
     * If the ID cannot be found in the
     * backend lists, construct the person
     * from Chat navigation parameters.
     */
    if (!person && params.name) {
      person = {
        id:
          requestedId ||
          params.name
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              '-'
            ),

        name:
          params.name,

        role:
          params.role ||
          'Student',

        programme:
          params.programme ||
          '',

        initials:
          params.initials ||
          getInitials(
            params.name
          ),
      };
    }

    if (person) {
      setSelectedPerson(person);

      setProfileReturnToChat(
        params.returnTo === 'chat'
      );
    }
  }, [
    params.openProfile,
    params.personId,
    params.conversationId,
    params.name,
    params.role,
    params.programme,
    params.initials,
    params.returnTo,
    people,
    requests,
    connections,
  ]);

  /*
   * ----------------------------------------------------------
   * SEND CONNECTION REQUEST
   * ----------------------------------------------------------
   */

  const sendRequest = async (
    person: Person
  ) => {
    try {
      const authToken =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!authToken) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      const userId =
        Number(person.id);

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        Alert.alert(
          'Unable to Connect',
          'Invalid user selected.'
        );

        return;
      }

      if (
        sentRequests.includes(
          person.id
        )
      ) {
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/connections.php`,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${authToken}`,

              Accept:
                'application/json',

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                receiver_id:
                  userId,
              }),
          }
        );

      const rawResponse =
        await response.text();

      console.log(
        'Send connection status:',
        response.status
      );

      console.log(
        'Send connection response:',
        rawResponse
      );

      let result;

      try {
        result =
          JSON.parse(rawResponse);
      } catch {
        throw new Error(
          'Invalid response from the connections API.'
        );
      }

      if (
        response.status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          'Failed to send connection request.'
        );
      }

      /*
       * Reload backend data so the
       * People You May Know section
       * immediately reflects Pending.
       */
      await loadConnections();

      Alert.alert(
        'Connection Request Sent',
        `Your connection request was sent to ${person.name}.`
      );

    } catch (error) {
      console.log(
        'Send connection request error:',
        error
      );

      Alert.alert(
        'Unable to Send Request',
        error?.message ||
          'Please try again.'
      );
    }
  };

  /*
   * ----------------------------------------------------------
   * ACCEPT CONNECTION REQUEST
   * ----------------------------------------------------------
   */

  const acceptRequest = async (
    person: Person
  ) => {
    try {
      const authToken =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!authToken) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      /*
       * For incoming requests,
       * person.id is the CONNECTION ID.
       */
      const connectionId =
        Number(person.id);

      if (
        !Number.isInteger(
          connectionId
        ) ||
        connectionId <= 0
      ) {
        Alert.alert(
          'Unable to Accept',
          'Invalid connection request.'
        );

        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/connections.php`,
          {
            method: 'PUT',

            headers: {
              Authorization:
                `Bearer ${authToken}`,

              Accept:
                'application/json',

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                action:
                  'accept',

                connection_id:
                  connectionId,
              }),
          }
        );

      const rawResponse =
        await response.text();

      console.log(
        'Accept connection status:',
        response.status
      );

      console.log(
        'Accept connection response:',
        rawResponse
      );

      let result;

      try {
        result =
          JSON.parse(rawResponse);
      } catch {
        throw new Error(
          'Invalid response from the connections API.'
        );
      }

      if (
        response.status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          'Failed to accept connection request.'
        );
      }

      await loadConnections();

      Alert.alert(
        'Connected!',
        `You are now connected with ${person.name}.`
      );

    } catch (error) {
      console.log(
        'Accept connection error:',
        error
      );

      Alert.alert(
        'Unable to Accept Request',
        error?.message ||
          'Please try again.'
      );
    }
  };

  /*
   * ----------------------------------------------------------
   * DECLINE CONNECTION REQUEST
   * ----------------------------------------------------------
   */

  const declineRequest = async (
    person: Person
  ) => {
    try {
      const authToken =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!authToken) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      /*
       * For incoming requests,
       * person.id is the CONNECTION ID.
       */
      const connectionId =
        Number(person.id);

      if (
        !Number.isInteger(
          connectionId
        ) ||
        connectionId <= 0
      ) {
        Alert.alert(
          'Unable to Decline',
          'Invalid connection request.'
        );

        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/connections.php`,
          {
            method: 'PUT',

            headers: {
              Authorization:
                `Bearer ${authToken}`,

              Accept:
                'application/json',

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                action:
                  'reject',

                connection_id:
                  connectionId,
              }),
          }
        );

      const rawResponse =
        await response.text();

      console.log(
        'Decline connection status:',
        response.status
      );

      console.log(
        'Decline connection response:',
        rawResponse
      );

      let result;

      try {
        result =
          JSON.parse(rawResponse);
      } catch {
        throw new Error(
          'Invalid response from the connections API.'
        );
      }

      if (
        response.status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/login'),
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          'Failed to decline connection request.'
        );
      }

      await loadConnections();

      Alert.alert(
        'Request Declined',
        `The connection request from ${person.name} was declined.`
      );

    } catch (error) {
      console.log(
        'Decline connection error:',
        error
      );

      Alert.alert(
        'Unable to Decline Request',
        error?.message ||
          'Please try again.'
      );
    }
  };

  /*
   * ----------------------------------------------------------
   * CONNECTION CHECK
   * ----------------------------------------------------------
   */

  const isConnected = (
    id: string
  ) => {
    return connections.some(
      person =>
        person.id === id
    );
  };

  /*
   * ----------------------------------------------------------
   * OPEN PROFILE
   * ----------------------------------------------------------
   */

  const openPersonProfile = (
    person: Person
  ) => {
    setProfileReturnToChat(false);
    setSelectedPerson(person);
  };

  /*
   * ----------------------------------------------------------
   * OPEN CHAT
   * ----------------------------------------------------------
   */

  const openPersonChat = (
    person: Person
  ) => {
    router.push({
      pathname:
        '/student/chat',

      params: {
        conversationId:
          person.id,

        name:
          person.name,

        role:
          `${person.role} • ${person.programme}`,

        initials:
          person.initials,

        online:
          'true',
      },
    });
  };

  /*
   * ----------------------------------------------------------
   * BACK FROM PROFILE
   * ----------------------------------------------------------
   */

  const handleProfileBack = () => {
    if (profileReturnToChat) {
      router.replace({
        pathname:
          '/student/chat',

        params: {
          conversationId:
            params.conversationId ||
            params.personId ||
            selectedPerson?.id ||
            '',

          name:
            params.name ||
            selectedPerson?.name ||
            '',

          role:
            params.role &&
            params.programme
              ? `${params.role} • ${params.programme}`
              : `${selectedPerson?.role || 'Student'} • ${selectedPerson?.programme || ''}`,

          initials:
            params.initials ||
            selectedPerson?.initials ||
            '',

          online:
            params.online ||
            'true',
        },
      });

      return;
    }

    setSelectedPerson(null);
    setProfileReturnToChat(false);
  };

  /*
   * ----------------------------------------------------------
   * FILTER PEOPLE
   * ----------------------------------------------------------
   */

  const filteredPeople =
    people.filter(person =>
      person.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      person.programme
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      person.role
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /*
   * Backend already excludes users
   * with pending/accepted relationships.
   *
   * We still filter defensively here.
   */
  const availablePeople =
    filteredPeople.filter(
      person =>
        !isConnected(
          person.id
        ) &&
        !sentRequests.includes(
          person.id
        )
    );

  /*
   * ==========================================================
   * PROFILE VIEW
   * ==========================================================
   */

  if (selectedPerson) {
    const person =
      selectedPerson;

    const isAlumni =
      person.role
        .toLowerCase()
        .includes('alumni');

    return (
      <View
        style={styles.container}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleProfileBack}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          <View>
            <Text
              style={styles.headerTitle}
            >
              Profile
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Professional profile
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* Profile Hero */}
          <View
            style={styles.profileHero}
          >
            <View
              style={styles.profileAvatar}
            >
              <Text
                style={
                  styles.profileAvatarText
                }
              >
                {person.initials}
              </Text>
            </View>

            <Text
              style={styles.profileName}
            >
              {person.name}
            </Text>

            <Text
              style={styles.profileRole}
            >
              {person.programme}
            </Text>

            <Text
              style={styles.profileType}
            >
              {person.role}
            </Text>

            <View
              style={styles.memberBadge}
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.primary}
                style={
                  styles.memberIcon
                }
              />

              <Text
                style={
                  styles.memberBadgeText
                }
              >
                {isAlumni
                  ? 'CareerForgeAI Alumni'
                  : 'CareerForgeAI Student'}
              </Text>
            </View>
          </View>

          {/* Profile Actions */}
          <View
            style={styles.profileActions}
          >
            <Pressable
              style={
                styles.profileMessageButton
              }
              onPress={() =>
                openPersonChat(person)
              }
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />

              <Text
                style={
                  styles.profileMessageText
                }
              >
                Message
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.profileBackButton
              }
              onPress={
                handleProfileBack
              }
            >
              <Ionicons
                name="arrow-back-outline"
                size={16}
                color={COLORS.primary}
                style={styles.buttonIcon}
              />

              <Text
                style={
                  styles.profileBackText
                }
              >
                {profileReturnToChat
                  ? 'Back to Chat'
                  : 'Back to Network'}
              </Text>
            </Pressable>
          </View>

          {/* About */}
          <View
            style={styles.profileSection}
          >
            <Text
              style={
                styles.profileSectionTitle
              }
            >
              About
            </Text>

            <View
              style={styles.profileCard}
            >
              <Text
                style={
                  styles.profileBodyText
                }
              >
                {person.name} is part of the
                CareerForgeAI professional
                network. Their profile helps
                students and alumni discover
                professional interests, career
                paths and networking
                opportunities.
              </Text>
            </View>
          </View>

          {/* Professional Information */}
          <View
            style={styles.profileSection}
          >
            <Text
              style={
                styles.profileSectionTitle
              }
            >
              Professional Information
            </Text>

            <View
              style={styles.profileCard}
            >
              <View
                style={styles.profileInfoRow}
              >
                <View
                  style={
                    styles.profileInfoIcon
                  }
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View
                  style={
                    styles.profileInfoContent
                  }
                >
                  <Text
                    style={
                      styles.profileInfoLabel
                    }
                  >
                    Role
                  </Text>

                  <Text
                    style={
                      styles.profileInfoValue
                    }
                  >
                    {person.role}
                  </Text>
                </View>
              </View>

              <View
                style={styles.profileDivider}
              />

              <View
                style={styles.profileInfoRow}
              >
                <View
                  style={
                    styles.profileInfoIcon
                  }
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View
                  style={
                    styles.profileInfoContent
                  }
                >
                  <Text
                    style={
                      styles.profileInfoLabel
                    }
                  >
                    Profession / Programme
                  </Text>

                  <Text
                    style={
                      styles.profileInfoValue
                    }
                  >
                    {person.programme}
                  </Text>
                </View>
              </View>

              <View
                style={styles.profileDivider}
              />

              <View
                style={styles.profileInfoRow}
              >
                <View
                  style={
                    styles.profileInfoIcon
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View
                  style={
                    styles.profileInfoContent
                  }
                >
                  <Text
                    style={
                      styles.profileInfoLabel
                    }
                  >
                    Network
                  </Text>

                  <Text
                    style={
                      styles.profileInfoValue
                    }
                  >
                    CareerForgeAI
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Skills */}
          <View
            style={styles.profileSection}
          >
            <Text
              style={
                styles.profileSectionTitle
              }
            >
              Skills
            </Text>

            <View
              style={styles.profileCard}
            >
              <View
                style={
                  styles.skillsContainer
                }
              >
                {[
                  'Communication',
                  'Problem Solving',
                  'Technology',
                  'Professional Development',
                ].map(skill => (
                  <View
                    key={skill}
                    style={styles.skill}
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={COLORS.primary}
                      style={
                        styles.skillIcon
                      }
                    />

                    <Text
                      style={
                        styles.skillText
                      }
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Experience */}
          <View
            style={styles.profileSection}
          >
            <Text
              style={
                styles.profileSectionTitle
              }
            >
              Experience
            </Text>

            <View
              style={styles.profileCard}
            >
              <View
                style={
                  styles.experienceHeader
                }
              >
                <View
                  style={
                    styles.experienceIcon
                  }
                >
                  <Ionicons
                    name="business-outline"
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <View
                  style={
                    styles.experienceContent
                  }
                >
                  <Text
                    style={
                      styles.experienceTitle
                    }
                  >
                    CareerForgeAI Member
                  </Text>

                  <Text
                    style={
                      styles.experienceSubtitle
                    }
                  >
                    Professional Network
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.profileBodyText
                }
              >
                Developing professional
                connections, exploring career
                opportunities and building
                employability through the
                CareerForgeAI platform.
              </Text>
            </View>
          </View>

          {/* Networking */}
          <View
            style={styles.profileSection}
          >
            <Text
              style={
                styles.profileSectionTitle
              }
            >
              Networking
            </Text>

            <View
              style={
                styles.networkingCard
              }
            >
              <View
                style={
                  styles.networkingHeader
                }
              >
                <View
                  style={
                    styles.networkingIcon
                  }
                >
                  <Ionicons
                    name="link-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <Text
                  style={
                    styles.networkingTitle
                  }
                >
                  Connected on
                  CareerForgeAI
                </Text>
              </View>

              <Text
                style={
                  styles.networkingText
                }
              >
                You are connected with{' '}
                {person.name}. You can now
                message them and build your
                professional network.
              </Text>
            </View>
          </View>

          <Text
            style={styles.footer}
          >
            CareerForgeAI Professional
            Network
          </Text>
        </ScrollView>
      </View>
    );
  }

  /*
   * ==========================================================
   * CONNECTIONS LIST
   * ==========================================================
   */

  return (
    <View
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={COLORS.primary}
          />
        </Pressable>

        <View>
          <Text
            style={styles.headerTitle}
          >
            Connections
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Build your professional network
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Search */}
        <View
          style={styles.searchContainer}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.muted}
            style={styles.searchIcon}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people, roles or programmes..."
            placeholderTextColor={
              COLORS.muted
            }
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch('')
              }
              style={
                styles.clearSearchButton
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={COLORS.muted}
              />
            </Pressable>
          )}
        </View>

        {/* Connection Requests */}
        {requests.length > 0 && (
          <View style={styles.section}>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Connection Requests
              </Text>

              <View
                style={styles.badge}
              >
                <Text
                  style={styles.badgeText}
                >
                  {requests.length}
                </Text>
              </View>
            </View>

            {requests.map(person => (
              <View
                key={person.id}
                style={styles.card}
              >
                <View
                  style={styles.avatar}
                >
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {person.initials}
                  </Text>
                </View>

                <View
                  style={styles.personInfo}
                >
                  <Pressable
                    onPress={() =>
                      openPersonProfile(
                        person
                      )
                    }
                  >
                    <Text
                      style={
                        styles.personName
                      }
                    >
                      {person.name}
                    </Text>
                  </Pressable>

                  <Text
                    style={
                      styles.personRole
                    }
                  >
                    {person.role} •{' '}
                    {person.programme}
                  </Text>

                  <View
                    style={
                      styles.requestButtons
                    }
                  >
                    <Pressable
                      style={
                        styles.requestProfileButton
                      }
                      onPress={() =>
                        openPersonProfile(
                          person
                        )
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color={
                          COLORS.primary
                        }
                        style={
                          styles.smallButtonIcon
                        }
                      />

                      <Text
                        style={
                          styles.requestProfileText
                        }
                      >
                        View Profile
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.acceptButton
                      }
                      onPress={() =>
                        acceptRequest(
                          person
                        )
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FFFFFF"
                        style={
                          styles.smallButtonIcon
                        }
                      />

                      <Text
                        style={
                          styles.acceptText
                        }
                      >
                        Accept
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.declineButton
                      }
                      onPress={() =>
                        declineRequest(
                          person
                        )
                      }
                    >
                      <Ionicons
                        name="close-outline"
                        size={15}
                        color="#667085"
                        style={
                          styles.smallButtonIcon
                        }
                      />

                      <Text
                        style={
                          styles.declineText
                        }
                      >
                        Decline
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* People You May Know */}
        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              People You May Know
            </Text>

            {availablePeople.length >
              0 && (
              <View
                style={styles.countBadge}
              >
                <Text
                  style={
                    styles.countBadgeText
                  }
                >
                  {availablePeople.length}
                </Text>
              </View>
            )}
          </View>

          {availablePeople.length ===
          0 ? (
            <View
              style={styles.emptyCard}
            >
              <View
                style={
                  styles.emptyIconContainer
                }
              >
                <Ionicons
                  name="people-outline"
                  size={30}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                No new people found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Try another search or check
                back later.
              </Text>
            </View>
          ) : (
            availablePeople.map(
              person => {
                const pending =
                  sentRequests.includes(
                    person.id
                  );

                return (
                  <View
                    key={person.id}
                    style={styles.card}
                  >
                    <Pressable
                      onPress={() =>
                        openPersonProfile(
                          person
                        )
                      }
                    >
                      <View
                        style={
                          styles.avatar
                        }
                      >
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {person.initials}
                        </Text>
                      </View>
                    </Pressable>

                    <View
                      style={
                        styles.personInfo
                      }
                    >
                      <Pressable
                        onPress={() =>
                          openPersonProfile(
                            person
                          )
                        }
                      >
                        <Text
                          style={
                            styles.personName
                          }
                        >
                          {person.name}
                        </Text>
                      </Pressable>

                      <Text
                        style={
                          styles.personRole
                        }
                      >
                        {person.role}
                      </Text>

                      <Text
                        style={
                          styles.programme
                        }
                      >
                        {person.programme}
                      </Text>

                      <View
                        style={
                          styles.peopleActions
                        }
                      >
                        <Pressable
                          style={
                            styles.peopleProfileButton
                          }
                          onPress={() =>
                            openPersonProfile(
                              person
                            )
                          }
                        >
                          <Ionicons
                            name="person-outline"
                            size={14}
                            color={
                              COLORS.primary
                            }
                            style={
                              styles.smallButtonIcon
                            }
                          />

                          <Text
                            style={
                              styles.peopleProfileText
                            }
                          >
                            View Profile
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.connectButton,
                            pending &&
                              styles.pendingButton,
                          ]}
                          onPress={() =>
                            sendRequest(
                              person
                            )
                          }
                          disabled={pending}
                        >
                          <Ionicons
                            name={
                              pending
                                ? 'time-outline'
                                : 'person-add-outline'
                            }
                            size={15}
                            color={
                              pending
                                ? '#667085'
                                : '#FFFFFF'
                            }
                            style={
                              styles.smallButtonIcon
                            }
                          />

                          <Text
                            style={[
                              styles.connectText,
                              pending &&
                                styles.pendingText,
                            ]}
                          >
                            {pending
                              ? 'Pending'
                              : 'Connect'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const COLORS = {
  primary: '#2457E6',
  primaryDark: '#173FBD',
  deepBlue: '#172A55',
  heroBlue: '#102A72',
  accent: '#4C7DFF',
  light: '#E8F0FF',
  veryLight: '#F3F6FF',
  background: '#F5F7FC',
  white: '#FFFFFF',
  text: '#172A55',
  secondaryText: '#667085',
  muted: '#98A2B3',
  border: '#D9E2F2',
  green: '#258A50',
  greenLight: '#EAF7EF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    backgroundColor:
      COLORS.deepBlue,
    paddingTop: 55,
    paddingBottom: 19,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      '#102247',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C9D7F5',
    fontSize: 12,
    marginTop: 3,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 45,
  },

  searchContainer: {
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 25,
    shadowColor:
      '#102A72',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
  },

  clearSearchButton: {
    padding: 3,
    marginLeft: 6,
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  badge: {
    backgroundColor:
      COLORS.light,
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  countBadge: {
    backgroundColor:
      COLORS.light,
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },

  countBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    backgroundColor:
      COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor:
      COLORS.border,
    shadowColor:
      '#102A72',
    shadowOpacity: 0.055,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      COLORS.light,
    borderWidth: 2,
    borderColor:
      '#D3E0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  personRole: {
    color: '#475467',
    fontSize: 13,
    marginBottom: 3,
    lineHeight: 18,
  },

  programme: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginBottom: 10,
  },

  peopleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },

  peopleProfileButton: {
    backgroundColor:
      COLORS.veryLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor:
      '#D5E1F7',
    marginRight: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  peopleProfileText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  connectButton: {
    alignSelf: 'flex-start',
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  connectText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  pendingButton: {
    backgroundColor:
      '#F2F4F7',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  pendingText: {
    color:
      COLORS.secondaryText,
  },

  requestButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    flexWrap: 'wrap',
  },

  requestProfileButton: {
    backgroundColor:
      COLORS.veryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:
      '#D5E1F7',
    marginRight: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestProfileText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  acceptButton: {
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  acceptText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  declineButton: {
    backgroundColor:
      '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  declineText: {
    color:
      COLORS.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  smallButtonIcon: {
    marginRight: 5,
  },

  emptyCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
    shadowColor:
      '#102A72',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color:
      COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  profileHero: {
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 16,
    shadowColor:
      '#102A72',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor:
      COLORS.light,
    borderWidth: 3,
    borderColor:
      '#C8D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  profileAvatarText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
  },

  profileName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },

  profileRole: {
    color: '#475467',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  profileType: {
    color:
      COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 13,
  },

  memberBadge: {
    backgroundColor:
      COLORS.light,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberIcon: {
    marginRight: 5,
  },

  memberBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  profileActions: {
    flexDirection: 'row',
    marginBottom: 25,
  },

  profileMessageButton: {
    flex: 1,
    backgroundColor:
      COLORS.primary,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexDirection: 'row',
    shadowColor:
      COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  profileMessageText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  buttonIcon: {
    marginRight: 7,
  },

  profileBackButton: {
    flex: 1,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.primary,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  profileBackText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  profileSection: {
    marginBottom: 22,
  },

  profileSectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  profileCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    shadowColor:
      '#102A72',
    shadowOpacity: 0.045,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  profileBodyText: {
    color:
      COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 20,
  },

  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor:
      COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  profileInfoContent: {
    flex: 1,
  },

  profileInfoLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },

  profileInfoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  profileDivider: {
    height: 1,
    backgroundColor:
      '#E8EDF5',
    marginVertical: 15,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skill: {
    backgroundColor:
      COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillIcon: {
    marginRight: 4,
  },

  skillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  experienceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor:
      COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  experienceContent: {
    flex: 1,
  },

  experienceTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  experienceSubtitle: {
    color:
      COLORS.secondaryText,
    fontSize: 12,
  },

  networkingCard: {
    backgroundColor:
      COLORS.veryLight,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor:
      '#D7E3FA',
  },

  networkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  networkingIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  networkingTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  networkingText: {
    color: '#475467',
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    marginBottom: 10,
  },
});