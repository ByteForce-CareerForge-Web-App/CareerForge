
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type BackendOpportunity = {
  id?: number | string;
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  work_arrangement?: string;
  arrangement?: string;
  positions?: number | string;
  minimum_qualification?: string;
  qualification?: string;
  deadline?: string;
  status?: string;
  company_name?: string;
  company?: string;
  salary?: string | number | null;
  skills?: string[] | string;
};

type AlumniOpportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  match: string;
  description: string;
  skills: string[];
  deadline: string;
  arrangement?: string;
  qualification?: string;
  positions?: string;
};

type AlumniAIData = {
  target_role?: string;

  employability?: {
    score?: number;
    level?: string;
    overall_assessment?: string;
    strengths?: unknown[];
    weaknesses?: unknown[];
  };

  skill_gap?: {
    existing_skills?: unknown[];
    strong_skills?: unknown[];
    skills_to_improve?: unknown[];
    missing_skills?: unknown[];
    priority_skills?: unknown[];
  };

  career_paths?: Array<{
    career?: string;
    why_it_fits?: string;
    readiness?: string;
    important_skills?: unknown[];
    missing_skills?: unknown[];
    next_step?: string;
  }>;

  roadmap?: unknown[];
  recommendations?: unknown[];
};

function safeString(
  value: unknown,
  fallback = ''
): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value).trim();
  }

  return fallback;
}

function safeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (
        typeof item === 'number'
      ) {
        return String(item).trim();
      }

      if (
        item &&
        typeof item === 'object'
      ) {
        const objectItem =
          item as Record<string, unknown>;

        return safeString(
          objectItem.skill ||
            objectItem.name ||
            objectItem.title ||
            objectItem.career,
          ''
        );
      }

      return '';
    })
    .filter(Boolean);
}

function normalizeSkill(
  skill: string
): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9+#.\- ]/g,
      ''
    )
    .replace(/\s+/g, ' ');
}

function skillsMatch(
  skillA: string,
  skillB: string
): boolean {
  const a = normalizeSkill(skillA);
  const b = normalizeSkill(skillB);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  return (
    a.includes(b) ||
    b.includes(a)
  );
}

function calculateAIMatch(
  opportunity: BackendOpportunity,
  aiData: AlumniAIData | null
): string {
  if (!aiData) {
    return '0%';
  }

  const opportunitySkills =
    getSkills(opportunity);

  const existingSkills = [
    ...safeStringArray(
      aiData.skill_gap?.existing_skills
    ),
    ...safeStringArray(
      aiData.skill_gap?.strong_skills
    ),
  ];

  const uniqueExistingSkills =
    Array.from(
      new Set(
        existingSkills.map(
          normalizeSkill
        )
      )
    ).filter(Boolean);

  const uniqueOpportunitySkills =
    Array.from(
      new Set(
        opportunitySkills.map(
          normalizeSkill
        )
      )
    ).filter(Boolean);

  let skillScore = 0;

  if (
    uniqueOpportunitySkills.length > 0
  ) {
    const matchedSkills =
      uniqueOpportunitySkills.filter(
        (requiredSkill) =>
          uniqueExistingSkills.some(
            (userSkill) =>
              skillsMatch(
                requiredSkill,
                userSkill
              )
          )
      );

    skillScore =
      (matchedSkills.length /
        uniqueOpportunitySkills.length) *
      100;
  } else {
    skillScore = 50;
  }

  /*
   * The Alumni AI analysis identifies career
   * paths that fit the graduate's profile.
   * We use those AI-generated career paths to
   * determine how closely the opportunity itself
   * matches the graduate's intended direction.
   */
  const careerPaths =
    Array.isArray(
      aiData.career_paths
    )
      ? aiData.career_paths
      : [];

  const opportunityTitle =
    safeString(
      opportunity.title
    ).toLowerCase();

  const opportunityDescription =
    safeString(
      opportunity.description
    ).toLowerCase();

  const targetRole =
    safeString(
      aiData.target_role
    ).toLowerCase();

  let careerScore = 0;

  if (targetRole) {
    if (
      opportunityTitle.includes(
        targetRole
      ) ||
      targetRole.includes(
        opportunityTitle
      )
    ) {
      careerScore = 100;
    } else if (
      opportunityDescription.includes(
        targetRole
      )
    ) {
      careerScore = 85;
    }
  }

  if (careerScore === 0) {
    const careerMatches =
      careerPaths.map((path) => {
        const career =
          safeString(
            path?.career
          ).toLowerCase();

        if (!career) {
          return 0;
        }

        if (
          opportunityTitle.includes(
            career
          ) ||
          career.includes(
            opportunityTitle
          )
        ) {
          return 100;
        }

        if (
          opportunityDescription.includes(
            career
          )
        ) {
          return 80;
        }

        return 0;
      });

    careerScore =
      careerMatches.length > 0
        ? Math.max(
            ...careerMatches
          )
        : 50;
  }

  /*
   * Qualification gives a smaller contribution
   * because the opportunity API currently does not
   * provide a structured qualification match field.
   */
  const qualification =
    safeString(
      opportunity.minimum_qualification ||
        opportunity.qualification
    ).toLowerCase();

  const qualificationScore =
    qualification
      ? 70
      : 50;

  /*
   * Main weighting:
   * 60% skills
   * 30% AI career alignment
   * 10% qualification availability
   */
  let finalScore =
    skillScore * 0.6 +
    careerScore * 0.3 +
    qualificationScore * 0.1;

  /*
   * If the AI identifies the opportunity's
   * career direction as a strong fit, give it
   * a small additional boost while keeping
   * the result capped at 99%.
   */
  if (
    careerScore >= 90 &&
    skillScore >= 70
  ) {
    finalScore += 5;
  }

  finalScore = Math.round(
    Math.max(
      0,
      Math.min(
        99,
        finalScore
      )
    )
  );

  return `${finalScore}%`;
}

function formatOpportunityType(
  type?: string
): string {
  const normalized = safeString(type)
    .toLowerCase()
    .trim();

  switch (normalized) {
    case 'internship':
      return 'Internship';

    case 'graduate_program':
    case 'graduate programme':
    case 'graduate program':
      return 'Graduate Programme';

    case 'job':
    case 'full-time':
    case 'full_time':
      return 'Full-time';

    case 'learnership':
      return 'Learnership';

    case 'volunteer':
      return 'Volunteer';

    default:
      return type
        ? safeString(type)
        : 'Opportunity';
  }
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return 'Not specified';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-ZA',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
}

function getSkills(
  value: BackendOpportunity
): string[] {
  if (Array.isArray(value.skills)) {
    return value.skills
      .map((skill) =>
        typeof skill === 'string'
          ? skill.trim()
          : ''
      )
      .filter(Boolean);
  }

  if (typeof value.skills === 'string') {
    return value.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

function mapOpportunity(
  opportunity: BackendOpportunity,
  aiData: AlumniAIData | null
): AlumniOpportunity {
  const skills =
    getSkills(opportunity);

  const salary = safeString(
    opportunity.salary
  );

  return {
    id: safeString(
      opportunity.id,
      ''
    ),

    title: safeString(
      opportunity.title,
      'Untitled Opportunity'
    ),

    company: safeString(
      opportunity.company_name ||
        opportunity.company,
      'Employer'
    ),

    location: safeString(
      opportunity.location,
      'Location not specified'
    ),

    type: formatOpportunityType(
      opportunity.type
    ),

    salary: salary
      ? salary
      : 'Not specified',

    match: calculateAIMatch(
      opportunity,
      aiData
    ),

    description: safeString(
      opportunity.description,
      'No job description provided.'
    ),

    skills,

    deadline: formatDate(
      opportunity.deadline
    ),

    arrangement: safeString(
      opportunity.work_arrangement ||
        opportunity.arrangement,
      'Not specified'
    ),

    qualification: safeString(
      opportunity.minimum_qualification ||
        opportunity.qualification,
      'Not specified'
    ),

    positions: safeString(
      opportunity.positions
    ),
  };
}

export default function AlumniOpportunities() {
  const [search, setSearch] =
    useState('');

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState('All');

  const [
    opportunities,
    setOpportunities,
  ] = useState<AlumniOpportunity[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const loadOpportunities =
    useCallback(async () => {
      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem(
            'authToken'
          );

        if (!token) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          router.replace('/login');
          return;
        }

        /*
         * Load the latest Alumni AI analysis
         * first. This is what gives the opportunity
         * cards their personalised AI match score.
         */
        let aiData:
          AlumniAIData | null = null;

        try {
          const aiResponse =
            await fetch(
              `${API_BASE_URL}/alumni/ai-analysis-result.php`,
              {
                method: 'GET',
                headers: {
                  Accept:
                    'application/json',
                  Authorization:
                    `Bearer ${token}`,
                  'Content-Type':
                    'application/json',
                },
              }
            );

          const aiRaw =
            await aiResponse.text();

          let aiResult: any = null;

          try {
            aiResult =
              JSON.parse(aiRaw);
          } catch {
            console.log(
              'Alumni AI result returned non-JSON:',
              aiRaw
            );
          }

          if (
            aiResponse.ok &&
            aiResult?.success &&
            aiResult?.data
          ) {
            aiData =
              aiResult.data as AlumniAIData;
          }
        } catch (aiError) {
          /*
           * AI matching should not prevent
           * opportunities from loading.
           */
          console.log(
            'Could not load Alumni AI analysis:',
            aiError
          );
        }

        /*
         * If there is no previous AI analysis,
         * generate one now.
         */
        if (!aiData) {
          try {
            const aiGenerateResponse =
              await fetch(
                `${API_BASE_URL}/alumni/ai-analysis.php`,
                {
                  method: 'POST',
                  headers: {
                    Accept:
                      'application/json',
                    Authorization:
                      `Bearer ${token}`,
                    'Content-Type':
                      'application/json',
                  },
                  body: JSON.stringify(
                    {}
                  ),
                }
              );

            const aiGenerateRaw =
              await aiGenerateResponse.text();

            let aiGenerateResult: any =
              null;

            try {
              aiGenerateResult =
                JSON.parse(
                  aiGenerateRaw
                );
            } catch {
              console.log(
                'Alumni AI generation returned non-JSON:',
                aiGenerateRaw
              );
            }

            if (
              aiGenerateResponse.ok &&
              aiGenerateResult?.success &&
              aiGenerateResult?.data
            ) {
              aiData =
                aiGenerateResult.data as AlumniAIData;
            }
          } catch (aiGenerateError) {
            console.log(
              'Could not generate Alumni AI analysis:',
              aiGenerateError
            );
          }
        }

        const response =
          await fetch(
            `${API_BASE_URL}/opportunities.php`,
            {
              method: 'GET',
              headers: {
                Accept:
                  'application/json',
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
            }
          );

        const rawResponse =
          await response.text();

        let result: any;

        try {
          result =
            JSON.parse(rawResponse);
        } catch {
          console.log(
            'Alumni opportunities non-JSON response:',
            rawResponse
          );

          throw new Error(
            `The server returned an unexpected response. HTTP ${response.status}`
          );
        }

        console.log(
          'Alumni opportunities response:',
          result
        );

        if (
          response.status === 401
        ) {
          await AsyncStorage.removeItem(
            'authToken'
          );

          await AsyncStorage.removeItem(
            'user'
          );

          router.replace('/login');
          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Could not load opportunities.'
          );
        }

        const backendData =
          Array.isArray(
            result.data
          )
            ? result.data
            : [];

        const mapped =
          backendData
            .filter(
              (
                opportunity: BackendOpportunity
              ) => {
                const status =
                  safeString(
                    opportunity.status
                  ).toLowerCase();

                return (
                  status !== 'closed' &&
                  status !== 'inactive'
                );
              }
            )
            .map(
              (
                opportunity: BackendOpportunity
              ) =>
                mapOpportunity(
                  opportunity,
                  aiData
                )
            )
            .filter(
              (opportunity) =>
                opportunity.id !== ''
            );

        setOpportunities(mapped);
      } catch (error) {
        console.log(
          'Error loading Alumni opportunities:',
          error
        );

        setOpportunities([]);

        Alert.alert(
          'Opportunities Error',
          error instanceof Error
            ? error.message
            : 'Unable to load opportunities from the server.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [
      loadOpportunities,
    ])
  );

  const filteredOpportunities =
    useMemo(() => {
      return opportunities.filter(
        (opportunity) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            searchText.length === 0 ||
            opportunity.title
              .toLowerCase()
              .includes(
                searchText
              ) ||
            opportunity.company
              .toLowerCase()
              .includes(
                searchText
              ) ||
            opportunity.location
              .toLowerCase()
              .includes(
                searchText
              ) ||
            opportunity.type
              .toLowerCase()
              .includes(
                searchText
              ) ||
            opportunity.salary
              .toLowerCase()
              .includes(
                searchText
              ) ||
            opportunity.skills.some(
              (skill) =>
                skill
                  .toLowerCase()
                  .includes(
                    searchText
                  )
            );

          const matchesFilter =
            selectedFilter ===
              'All' ||
            opportunity.type ===
              selectedFilter ||
            (selectedFilter ===
              'Remote' &&
              opportunity.location
                .toLowerCase()
                .trim() ===
                'remote') ||
            (selectedFilter ===
              'Remote' &&
              opportunity.arrangement
                ?.toLowerCase()
                .trim() ===
                'remote');

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      opportunities,
      search,
      selectedFilter,
    ]);

  const openOpportunity = (
    opportunity: AlumniOpportunity
  ) => {
    router.push({
      pathname:
        '/alumni/opportunity-details',

      params: {
        id: opportunity.id,

        title:
          opportunity.title,

        company:
          opportunity.company,

        location:
          opportunity.location,

        type:
          opportunity.type,

        salary:
          opportunity.salary,

        match:
          opportunity.match,

        description:
          opportunity.description,

        skills:
          JSON.stringify(
            opportunity.skills
          ),

        deadline:
          opportunity.deadline,

        arrangement:
          opportunity.arrangement ||
          '',

        qualification:
          opportunity.qualification ||
          '',

        positions:
          opportunity.positions ||
          '',
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ←
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={styles.headerTitle}
          >
            Opportunities
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Find your next career opportunity
          </Text>
        </View>

        {/* Saved Opportunities Button */}
        <TouchableOpacity
          style={styles.savedButton}
          onPress={() =>
            router.push(
              '/alumni/saved-opportunities'
            )
          }
          activeOpacity={0.8}
        >
          <Text
            style={styles.savedIcon}
          >
            🔖
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Saved Opportunities Banner */}
        <TouchableOpacity
          style={styles.savedBanner}
          onPress={() =>
            router.push(
              '/alumni/saved-opportunities'
            )
          }
          activeOpacity={0.85}
        >
          <View
            style={
              styles.savedBannerIcon
            }
          >
            <Text
              style={
                styles.savedBannerIconText
              }
            >
              🔖
            </Text>
          </View>

          <View
            style={
              styles.savedBannerInfo
            }
          >
            <Text
              style={
                styles.savedBannerTitle
              }
            >
              Saved Opportunities
            </Text>

            <Text
              style={
                styles.savedBannerText
              }
            >
              View opportunities you've saved
              for later.
            </Text>
          </View>

          <Text
            style={
              styles.savedBannerArrow
            }
          >
            →
          </Text>
        </TouchableOpacity>

        {/* Search */}
        <View
          style={
            styles.searchContainer
          }
        >
          <Text
            style={styles.searchIcon}
          >
            ⌕
          </Text>

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search opportunities"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* AI Recommendation Banner */}
        <View style={styles.aiCard}>
          <View
            style={styles.aiIcon}
          >
            <Text
              style={
                styles.aiIconText
              }
            >
              ✦
            </Text>
          </View>

          <View style={styles.aiInfo}>
            <Text
              style={styles.aiTitle}
            >
              AI Recommended Opportunities
            </Text>

            <Text
              style={
                styles.aiDescription
              }
            >
              These opportunities have been
              selected based on your professional
              profile and career interests.
            </Text>
          </View>
        </View>

        {/* Backend Loading */}
        {loading && (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading opportunities...
            </Text>
          </View>
        )}

        {/* Business Opportunity Notice */}
        {!loading &&
          opportunities.length > 0 && (
            <View
              style={
                styles.businessNotice
              }
            >
              <View
                style={
                  styles.businessNoticeIcon
                }
              >
                <Text
                  style={
                    styles.businessNoticeIconText
                  }
                >
                  ✓
                </Text>
              </View>

              <View
                style={
                  styles.businessNoticeInfo
                }
              >
                <Text
                  style={
                    styles.businessNoticeTitle
                  }
                >
                  New employer opportunities
                </Text>

                <Text
                  style={
                    styles.businessNoticeText
                  }
                >
                  {opportunities.length}{' '}
                  {opportunities.length ===
                  1
                    ? 'opportunity'
                    : 'opportunities'}{' '}
                  currently available from
                  employers.
                </Text>
              </View>
            </View>
          )}

        {/* Filters */}
        <View style={styles.filterRow}>
          {[
            'All',
            'Full-time',
            'Remote',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter ===
                  filter &&
                  styles.activeFilterButton,
              ]}
              onPress={() =>
                setSelectedFilter(
                  filter
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter ===
                    filter &&
                    styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Recommended for You
          </Text>

          <Text
            style={
              styles.resultCount
            }
          >
            {filteredOpportunities.length}{' '}
            found
          </Text>
        </View>

        {/* Opportunity Cards */}
        {!loading &&
        filteredOpportunities.length >
          0 ? (
          filteredOpportunities.map(
            (opportunity) => (
              <TouchableOpacity
                key={
                  opportunity.id
                }
                style={
                  styles.opportunityCard
                }
                onPress={() =>
                  openOpportunity(
                    opportunity
                  )
                }
                activeOpacity={0.85}
              >
                {/* Card Header */}
                <View
                  style={
                    styles.cardHeader
                  }
                >
                  <View
                    style={
                      styles.companyIcon
                    }
                  >
                    <Text
                      style={
                        styles.companyIconText
                      }
                    >
                      {opportunity.company
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.cardTitleContainer
                    }
                  >
                    <Text
                      style={
                        styles.jobTitle
                      }
                    >
                      {
                        opportunity.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.companyName
                      }
                    >
                      {
                        opportunity.company
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.matchBadge
                    }
                  >
                    <Text
                      style={
                        styles.matchText
                      }
                    >
                      {
                        opportunity.match
                      }
                    </Text>

                    <Text
                      style={
                        styles.matchLabel
                      }
                    >
                      match
                    </Text>
                  </View>
                </View>

                {/* Location */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  📍{' '}
                  {
                    opportunity.location
                  }
                </Text>

                {/* Employment Type */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  💼{' '}
                  {
                    opportunity.type
                  }
                </Text>

                {/* Salary */}
                <Text
                  style={
                    styles.detailText
                  }
                >
                  💰{' '}
                  {
                    opportunity.salary
                  }
                </Text>

                {/* Arrangement */}
                {opportunity.arrangement &&
                  opportunity.arrangement !==
                    'Not specified' && (
                    <Text
                      style={
                        styles.detailText
                      }
                    >
                      Work arrangement:{' '}
                      {
                        opportunity.arrangement
                      }
                    </Text>
                  )}

                {/* Deadline */}
                {opportunity.deadline &&
                  opportunity.deadline !==
                    'Not specified' && (
                    <Text
                      style={
                        styles.detailText
                      }
                    >
                      📅 Deadline:{' '}
                      {
                        opportunity.deadline
                      }
                    </Text>
                  )}

                {/* Skills */}
                {opportunity.skills
                  .length > 0 && (
                  <View
                    style={
                      styles.skillsContainer
                    }
                  >
                    {opportunity.skills.map(
                      (
                        skill,
                        index
                      ) => (
                        <View
                          key={`${skill}-${index}`}
                          style={
                            styles.skillBadge
                          }
                        >
                          <Text
                            style={
                              styles.skillText
                            }
                          >
                            {skill}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}

                <View
                  style={
                    styles.viewContainer
                  }
                >
                  <Text
                    style={
                      styles.viewText
                    }
                  >
                    View Opportunity →
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )
        ) : !loading ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyIcon}
            >
              🔎
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              {opportunities.length ===
              0
                ? 'No opportunities available'
                : 'No opportunities found'}
            </Text>

            <Text
              style={styles.emptyText}
            >
              {opportunities.length ===
              0
                ? 'There are currently no active opportunities posted by employers.'
                : 'Try a different search term or select another filter.'}
            </Text>

            <TouchableOpacity
              style={
                styles.clearButton
              }
              onPress={() => {
                setSearch('');
                setSelectedFilter(
                  'All'
                );
              }}
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.clearButtonText
                }
              >
                Clear Search & Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Back to Dashboard */}
        <TouchableOpacity
          style={
            styles.dashboardButton
          }
          onPress={() =>
            router.replace(
              '/alumni/dashboard'
            )
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.dashboardButtonText
            }
          >
            Back to Alumni Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#17345F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 3,
  },

  savedButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#17345F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  savedIcon: {
    fontSize: 20,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  savedBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D7E3F4',
  },

  savedBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  savedBannerIconText: {
    fontSize: 21,
  },

  savedBannerInfo: {
    flex: 1,
  },

  savedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  savedBannerText: {
    fontSize: 11,
    color: '#64748B',
  },

  savedBannerArrow: {
    fontSize: 22,
    color: '#2563EB',
    marginLeft: 8,
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  searchIcon: {
    fontSize: 24,
    color: '#64748B',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },

  aiCard: {
    backgroundColor: '#E8F0FA',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 18,
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  aiInfo: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  aiDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },

  businessNotice: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  businessNoticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  businessNoticeIconText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  businessNoticeInfo: {
    flex: 1,
  },

  businessNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },

  businessNoticeText: {
    fontSize: 11,
    color: '#4D7C5A',
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 9,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 8,
  },

  activeFilterButton: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  resultCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F0FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  companyIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },

  cardTitleContainer: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 13,
    color: '#64748B',
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  matchText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },

  matchLabel: {
    fontSize: 8,
    color: '#15803D',
  },

  detailText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 7,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 7,
  },

  skillBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  skillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  viewContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 10,
    paddingTop: 12,
  },

  viewText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  clearButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 15,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  dashboardButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 5,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

