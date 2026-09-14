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

type Person = {
  id: string;
  name: string;
  role: string;
  programme: string;
  initials: string;
};

const PEOPLE_KEY = 'careerforge_connection_people';
const REQUESTS_KEY = 'careerforge_connection_requests';
const SENT_KEY = 'careerforge_sent_requests';
const CONNECTIONS_KEY = 'careerforge_connections';

const defaultPeople: Person[] = [
  {
    id: '1',
    name: 'Sarah Williams',
    role: 'Alumni',
    programme: 'Data Analyst',
    initials: 'SW',
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student',
    programme: 'BSc Data Science',
    initials: 'MN',
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Alumni',
    programme: 'Software Developer',
    initials: 'JS',
  },
  {
    id: '4',
    name: 'Daniel Kumar',
    role: 'Alumni',
    programme: 'Business Analyst',
    initials: 'DK',
  },
];

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
    useState<Person[]>(defaultPeople);

  const [requests, setRequests] =
    useState<Person[]>([]);

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
   * Load connection data.
   */
  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const loadConnections = async () => {
    try {
      const storedPeople =
        await AsyncStorage.getItem(
          PEOPLE_KEY
        );

      const storedRequests =
        await AsyncStorage.getItem(
          REQUESTS_KEY
        );

      const storedSent =
        await AsyncStorage.getItem(
          SENT_KEY
        );

      const storedConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      let loadedPeople = defaultPeople;

      if (storedPeople) {
        loadedPeople =
          JSON.parse(storedPeople);

        setPeople(loadedPeople);
      } else {
        setPeople(defaultPeople);

        await AsyncStorage.setItem(
          PEOPLE_KEY,
          JSON.stringify(defaultPeople)
        );
      }

      if (storedRequests) {
        setRequests(
          JSON.parse(storedRequests)
        );
      } else {
        const initialRequest = [
          defaultPeople[3],
        ];

        setRequests(initialRequest);

        await AsyncStorage.setItem(
          REQUESTS_KEY,
          JSON.stringify(initialRequest)
        );
      }

      if (storedSent) {
        setSentRequests(
          JSON.parse(storedSent)
        );
      }

      if (storedConnections) {
        setConnections(
          JSON.parse(storedConnections)
        );
      }

      /*
       * If Chat opened this screen asking
       * for a specific profile, find that
       * person and display their profile.
       */
      if (
        params.openProfile === 'true'
      ) {
        const requestedId =
          params.personId ||
          params.conversationId;

        let person =
          loadedPeople.find(
            item =>
              item.id === requestedId
          );

        /*
         * If the ID cannot be found,
         * construct the person from the
         * parameters supplied by Chat.
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
            name: params.name,
            role:
              params.role ||
              'Student',
            programme:
              params.programme ||
              '',
            initials:
              params.initials ||
              params.name
                .split(' ')
                .map(word =>
                  word.charAt(0)
                )
                .join('')
                .slice(0, 2)
                .toUpperCase(),
          };
        }

        if (person) {
          setSelectedPerson(person);
          setProfileReturnToChat(
            params.returnTo === 'chat'
          );
        }
      }
    } catch (error) {
      console.log(
        'Error loading connections:',
        error
      );
    }
  };

  /*
   * If the screen receives navigation
   * parameters after the initial render,
   * open the requested profile.
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

    const person =
      people.find(
        item =>
          item.id === requestedId
      ) || {
        id:
          requestedId ||
          params.name
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              '-'
            ),
        name: params.name,
        role:
          params.role ||
          'Student',
        programme:
          params.programme ||
          '',
        initials:
          params.initials ||
          params.name
            .split(' ')
            .map(word =>
              word.charAt(0)
            )
            .join('')
            .slice(0, 2)
            .toUpperCase(),
      };

    setSelectedPerson(person);
    setProfileReturnToChat(
      params.returnTo === 'chat'
    );
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
  ]);

  const saveConnections = async (
    updated: Person[]
  ) => {
    setConnections(updated);

    await AsyncStorage.setItem(
      CONNECTIONS_KEY,
      JSON.stringify(updated)
    );
  };

  const sendRequest = async (
    person: Person
  ) => {
    if (
      sentRequests.includes(person.id)
    ) {
      return;
    }

    const updatedSent = [
      ...sentRequests,
      person.id,
    ];

    setSentRequests(updatedSent);

    await AsyncStorage.setItem(
      SENT_KEY,
      JSON.stringify(updatedSent)
    );

    Alert.alert(
      'Connection Request Sent',
      `Your connection request was sent to ${person.name}.`
    );
  };

  const acceptRequest = async (
    person: Person
  ) => {
    const updatedRequests =
      requests.filter(
        item => item.id !== person.id
      );

    const alreadyConnected =
      connections.some(
        item => item.id === person.id
      );

    const updatedConnections =
      alreadyConnected
        ? connections
        : [...connections, person];

    setRequests(updatedRequests);

    await AsyncStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(updatedRequests)
    );

    await saveConnections(
      updatedConnections
    );

    Alert.alert(
      'Connected!',
      `You are now connected with ${person.name}.`
    );
  };

  const declineRequest = async (
    person: Person
  ) => {
    const updatedRequests =
      requests.filter(
        item => item.id !== person.id
      );

    setRequests(updatedRequests);

    await AsyncStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(updatedRequests)
    );

    Alert.alert(
      'Request Declined',
      `The connection request from ${person.name} was declined.`
    );
  };

  const isConnected = (
    id: string
  ) => {
    return connections.some(
      person => person.id === id
    );
  };

  const openPersonProfile = (
    person: Person
  ) => {
    setProfileReturnToChat(false);
    setSelectedPerson(person);
  };

  const openPersonChat = (
    person: Person
  ) => {
    router.push({
      pathname: '/student/chat',
      params: {
        conversationId: person.id,
        name: person.name,
        role: `${person.role} • ${person.programme}`,
        initials: person.initials,
        online: 'true',
      },
    });
  };

  /*
   * Back from the profile.
   *
   * If the profile was opened from Chat,
   * return to that exact Chat.
   *
   * Otherwise return to the normal
   * Connections list.
   */
  const handleProfileBack = () => {
    if (profileReturnToChat) {
      router.replace({
        pathname: '/student/chat',
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
            params.online || 'true',
        },
      });

      return;
    }

    setSelectedPerson(null);
    setProfileReturnToChat(false);
  };

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

  const availablePeople =
    filteredPeople.filter(
      person =>
        !isConnected(person.id) &&
        !requests.some(
          request =>
            request.id === person.id
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
                      {/* NAME IS NOW TAPPABLE */}
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
