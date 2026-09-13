import React, { useEffect, useMemo, useState } from 'react'; import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native'; import { router, type Href } from 'expo-router'; import AsyncStorage from '@react-native-async-storage/async-storage'; import { API_BASE_URL } from '../../constants/api';
type CareerPath = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  skills: string[];
  roles: string[];
  aiRecommended?: boolean;
  aiReason?: string;
};

type AIAnalysis = {
  career_paths?: {
    title?: string;
    reason?: string;
    skills_needed?: string[];
  }[];

  ai?: {
    career_paths?: {
      title?: string;
      reason?: string;
      skills_needed?: string[];
    }[];
  };
};

const getSkillName = (skill: unknown): string => {
  if (typeof skill === 'string') {
    return skill;
  }

  if (
    skill &&
    typeof skill === 'object' &&
    'skill' in skill
  ) {
    const value = (skill as { skill?: unknown }).skill;

    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
};

const getPriority = (item: any): string => {
  if (typeof item?.priority === 'string' && item.priority.trim()) {
    return item.priority;
  }

  if (item?.importance === 'essential') {
    return 'High';
  }

  if (item?.importance === 'important') {
    return 'Medium';
  }

  return 'Low';
};

const normalizeAnalysis = (data: any): AIAnalysis => {
  const skillGap = data?.skill_gap ?? {};

  const prioritySkills: PrioritySkill[] = Array.isArray(
    skillGap.priority_skills
  )
    ? skillGap.priority_skills
        .map((item: any) => ({
          skill: getSkillName(item),
          priority: getPriority(item),
          reason:
            typeof item?.reason === 'string'
              ? item.reason
              : '',
        }))
        .filter((item: PrioritySkill) => item.skill)
    : [];

  const normalizeSkillList = (items: unknown): string[] => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(getSkillName)
      .filter(Boolean);
  };

  const careerPaths: CareerPath[] = Array.isArray(
    data?.career_paths
  )
    ? data.career_paths.map((path: any) => ({
        career:
          typeof path?.career === 'string'
            ? path.career
            : typeof path?.title === 'string'
            ? path.title
            : 'Career Path',

        why_it_fits:
          typeof path?.why_it_fits === 'string'
            ? path.why_it_fits
            : typeof path?.reason === 'string'
            ? path.reason
            : '',

        readiness:
          typeof path?.readiness === 'string'
            ? path.readiness
            : 'Developing',

        important_skills: normalizeSkillList(
          path?.important_skills ??
            path?.skills_needed
        ),

        missing_skills: normalizeSkillList(
          path?.missing_skills
        ),

        next_step:
          typeof path?.next_step === 'string'
            ? path.next_step
            : '',
      }))
    : [];

  return {
    assessment_id: Number(data?.assessment_id ?? 0),

    target_role:
      typeof data?.target_role === 'string'
        ? data.target_role
        : 'General Career Development',

    score: Number(
      data?.employability?.score ??
        data?.score ??
        0
    ),

    created_at:
      typeof data?.created_at === 'string'
        ? data.created_at
        : '',

    employability: {
      score: Number(
        data?.employability?.score ??
          data?.score ??
          0
      ),

      level:
        typeof data?.employability?.level === 'string'
          ? data.employability.level
          : 'Needs Improvement',

      overall_assessment:
        typeof data?.employability
          ?.overall_assessment === 'string'
          ? data.employability.overall_assessment
          : '',

      strengths: normalizeSkillList(
        data?.employability?.strengths
      ),

      weaknesses: normalizeSkillList(
        data?.employability?.weaknesses
      ),

      score_factors: Array.isArray(
        data?.employability?.score_factors
      )
        ? data.employability.score_factors
            .map((factor: any) => ({
              factor:
                typeof factor?.factor === 'string'
                  ? factor.factor
                  : '',

              score: Number(
                factor?.score ?? 0
              ),

              explanation:
                typeof factor?.explanation === 'string'
                  ? factor.explanation
                  : '',
            }))
            .filter(
              (factor: ScoreFactor) =>
                factor.factor
            )
        : [],
    },

    skill_gap: {
      existing_skills: normalizeSkillList(
        skillGap.existing_skills
      ),

      strong_skills: normalizeSkillList(
        skillGap.strong_skills
      ),

      skills_to_improve: normalizeSkillList(
        skillGap.skills_to_improve
      ),

      missing_skills: normalizeSkillList(
        skillGap.missing_skills
      ),

      priority_skills: prioritySkills,
    },

    career_paths: careerPaths,

    roadmap: Array.isArray(data?.roadmap)
      ? data.roadmap
      : [],

    recommendations: Array.isArray(
      data?.recommendations
    )
      ? data.recommendations
          .filter(
            (item: unknown): item is string =>
              typeof item === 'string'
          )
      : [],
  };
};

const FALLBACK_CAREER_PATHS: CareerPath[] = [
  {
    id: 'data-science',
    title: 'Data Science',
    category: 'Technology',
    icon: '📊',
    description:
      'Build skills in data analysis, machine learning and AI to solve real-world problems using data.',
    skills: [
      'Python',
      'SQL',
      'Statistics',
      'Machine Learning',
      'Data Visualisation',
    ],
    roles: [
      'Data Scientist',
      'Data Analyst',
      'Machine Learning Engineer',
    ],
  },
  {
    id: 'software-development',
    title: 'Software Development',
    category: 'Technology',
    icon: '💻',
    description:
      'Learn how to design, develop and maintain modern software applications and digital products.',
    skills: [
      'Programming',
      'Git',
      'APIs',
      'Database Management',
      'Problem Solving',
    ],
    roles: [
      'Software Developer',
      'Full-Stack Developer',
      'Mobile Developer',
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    category: 'Technology',
    icon: '🔐',
    description:
      'Protect systems, applications and information from cyber threats and security risks.',
    skills: [
      'Networking',
      'Cybersecurity',
      'Risk Management',
      'Ethical Hacking',
      'Security Analysis',
    ],
    roles: [
      'Cybersecurity Analyst',
      'Security Engineer',
      'Information Security Specialist',
    ],
  },
  {
    id: 'business-analysis',
    title: 'Business Analysis',
    category: 'Business',
    icon: '📈',
    description:
      'Connect business needs with technology and data to improve processes and decision-making.',
    skills: [
      'Business Analysis',
      'Data Analysis',
      'Communication',
      'Process Modelling',
      'Problem Solving',
    ],
    roles: [
      'Business Analyst',
      'Systems Analyst',
      'Product Analyst',
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    category: 'Business',
    icon: '📱',
    description:
      'Use digital platforms, content and analytics to attract audiences and grow organisations.',
    skills: [
      'Social Media',
      'Content Creation',
      'SEO',
      'Analytics',
      'Communication',
    ],
    roles: [
      'Digital Marketing Specialist',
      'Social Media Manager',
      'Marketing Analyst',
    ],
  },
  {
    id: 'project-management',
    title: 'Project Management',
    category: 'Business',
    icon: '📋',
    description:
      'Plan, coordinate and deliver projects while managing people, resources, deadlines and risks.',
    skills: [
      'Leadership',
      'Planning',
      'Communication',
      'Risk Management',
      'Teamwork',
    ],
    roles: [
      'Project Coordinator',
      'Project Manager',
      'Programme Manager',
    ],
  },
];

function getCareerIcon(title: string) {
  const value = title.toLowerCase();

  if (
    value.includes('data') ||
    value.includes('analytics')
  ) {
    return '📊';
  }

  if (
    value.includes('cyber') ||
    value.includes('security')
  ) {
    return '🔐';
  }

  if (
    value.includes('business') ||
    value.includes('analyst')
  ) {
    return '📈';
  }

  if (
    value.includes('marketing') ||
    value.includes('social')
  ) {
    return '📱';
  }

  if (
    value.includes('project') ||
    value.includes('management')
  ) {
    return '📋';
  }

  return '💻';
}

function getCareerCategory(title: string) {
  const value = title.toLowerCase();

  if (
    value.includes('business') ||
    value.includes('marketing') ||
    value.includes('project') ||
    value.includes('management') ||
    value.includes('analyst')
  ) {
    return 'Business';
  }

  return 'Technology';
}

export default function CareerPathwaysScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>(
    FALLBACK_CAREER_PATHS
  );

  const [hasAIRecommendations, setHasAIRecommendations] =
    useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIAnalysis();
  }, []);

  const loadAIAnalysis = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/ai-analysis-result.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const rawResponse = await response.text();

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Server returned a non-JSON response. HTTP ${response.status}`
        );
      }

      if (response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      if (response.status === 404) {
        setCareerPaths(FALLBACK_CAREER_PATHS);
        setHasAIRecommendations(false);
        return;
      }

      console.log(
        'CAREER PATH AI RESULT:',
        JSON.stringify(result, null, 2)
      );

      if (!response.ok || !result.success) {
        setCareerPaths(FALLBACK_CAREER_PATHS);
        setHasAIRecommendations(false);
        return;
      }

      console.log(
        'CAREER PATH AI RESULT:',
        JSON.stringify(result, null, 2)
      );
      const analysis: AIAnalysis = result.data;

      const aiPaths =
        analysis.career_paths ??
        analysis.ai?.career_paths ??
        [];

      if (!Array.isArray(aiPaths) || aiPaths.length === 0) {
        setCareerPaths(FALLBACK_CAREER_PATHS);
        setHasAIRecommendations(false);
        return;
      }

      const convertedPaths: CareerPath[] = aiPaths
        .filter((path) => path?.title)
        .map((path, index) => ({
          id: `ai-path-${index}-${path.title
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')}`,

          title: path.title || 'Career Path',

          category: getCareerCategory(
            path.title || ''
          ),

          icon: getCareerIcon(
            path.title || ''
          ),

          description:
            path.reason ||
            'This career pathway has been recommended based on your CareerForge profile.',

          skills: Array.isArray(path.skills_needed)
            ? path.skills_needed
            : [],

          roles: [],

          aiRecommended: true,

          aiReason:
            path.reason ||
            'This pathway was recommended based on your current profile.',
        }));

      if (convertedPaths.length > 0) {
        setCareerPaths(convertedPaths);
        setHasAIRecommendations(true);
      } else {
        setCareerPaths(FALLBACK_CAREER_PATHS);
        setHasAIRecommendations(false);
      }
    } catch (error) {
      console.log(
        'Load Career Path AI Analysis Error:',
        error
      );

      setCareerPaths(FALLBACK_CAREER_PATHS);
      setHasAIRecommendations(false);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(careerPaths.map((path) => path.category))
    );

    return ['All', ...values];
  }, [careerPaths]);

  const filteredPaths = useMemo(() => {
    return careerPaths.filter((path) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        path.title.toLowerCase().includes(searchValue) ||
        path.description.toLowerCase().includes(searchValue) ||
        path.skills.some((skill) =>
          skill.toLowerCase().includes(searchValue)
        );

      const matchesCategory =
        selectedCategory === 'All' ||
        path.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [
    search,
    selectedCategory,
    careerPaths,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/dashboard');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Career Pathways
          </Text>

          <Text style={styles.headerSubtitle}>
            Discover your career direction
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🎯</Text>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Find Your Career Path
            </Text>

            <Text style={styles.introText}>
              Explore different career paths and discover
              the skills and roles that can help you reach
              your goals.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="small"
              color="#0B1F3A"
            />

            <Text style={styles.loadingText}>
              Personalising your career pathways...
            </Text>
          </View>
        ) : hasAIRecommendations ? (
          <View style={styles.aiCard}>
            <View style={styles.aiCardTop}>
              <View style={styles.aiIcon}>
                <Text style={styles.aiIconText}>✨</Text>
              </View>

              <View style={styles.aiCardText}>
                <Text style={styles.aiTitle}>
                  CareerForge AI Recommendations
                </Text>

                <Text style={styles.aiSubtitle}>
                  These pathways were selected based on
                  your current profile, skills, goals and
                  career development.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search career paths or skills..."
            placeholderTextColor="#98A2B3"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => {
            const active =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  active &&
                    styles.categoryButtonActive,
                ]}
                onPress={() =>
                  setSelectedCategory(category)
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    active &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            {hasAIRecommendations
              ? 'Recommended Career Paths'
              : 'Explore Career Paths'}
          </Text>

          <Text style={styles.resultCount}>
            {filteredPaths.length} paths
          </Text>
        </View>

        {filteredPaths.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>

            <Text style={styles.emptyTitle}>
              No Career Paths Found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for a different career, skill
              or category.
            </Text>
          </View>
        ) : (
          filteredPaths.map((path) => (
            <Pressable
              key={path.id}
              style={styles.pathCard}
              onPress={() =>
                router.push({
                  pathname:
                    '/student/career-path-details' as Href,

                  params: {
                    id: path.id,
                    title: path.title,
                    category: path.category,
                    icon: path.icon,
                    description: path.description,
                    skills: JSON.stringify(path.skills),
                    roles: JSON.stringify(path.roles),

                    aiRecommended:
                      path.aiRecommended
                        ? 'true'
                        : 'false',

                    aiReason:
                      path.aiReason || '',
                  },
                })
              }
            >
              <View style={styles.pathTop}>
                <View style={styles.pathIcon}>
                  <Text style={styles.pathIconText}>
                    {path.icon}
                  </Text>
                </View>

                <View style={styles.pathMain}>
                  <Text style={styles.pathCategory}>
                    {path.category}
                  </Text>

                  <Text style={styles.pathTitle}>
                    {path.title}
                  </Text>
                </View>

                {path.aiRecommended && (
                  <View style={styles.aiMatchBadge}>
                    <Text style={styles.aiMatchText}>
                      AI MATCH
                    </Text>
                  </View>
                )}

                <Text style={styles.arrow}>›</Text>
              </View>

              <Text style={styles.pathDescription}>
                {path.description}
              </Text>

              <View style={styles.skillsContainer}>
                {path.skills
                  .slice(0, 3)
                  .map((skill) => (
                    <View
                      key={skill}
                      style={styles.skillBadge}
                    >
                      <Text style={styles.skillText}>
                        {skill}
                      </Text>
                    </View>
                  ))}
              </View>

              <View style={styles.exploreRow}>
                <Text style={styles.exploreText}>
                  Explore pathway
                </Text>

                <Text style={styles.exploreArrow}>
                  →
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.75,
    fontSize: 12,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },

  introIcon: {
    fontSize: 36,
    marginRight: 14,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  introText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
  },

  loadingText: {
    color: '#667085',
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '600',
  },

  aiCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D9E1FF',
  },

  aiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  aiIconText: {
    fontSize: 22,
  },

  aiCardText: {
    flex: 1,
  },

  aiTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  aiSubtitle: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 18,
  },

  searchContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 1,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: '#0B1F3A',
    fontSize: 14,
  },

  categoryScroll: {
    marginBottom: 20,
  },

  categoryContent: {
    gap: 8,
  },

  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0EA',
  },

  categoryButtonActive: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  categoryText: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '700',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
  },

  resultCount: {
    color: '#667085',
    fontSize: 12,
  },

  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  pathTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pathIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  pathIconText: {
    fontSize: 25,
  },

  pathMain: {
    flex: 1,
  },

  pathCategory: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  pathTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
  },

  aiMatchBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 6,
  },

  aiMatchText: {
    color: '#5B21B6',
    fontSize: 8,
    fontWeight: '900',
  },

  arrow: {
    color: '#0B1F3A',
    fontSize: 30,
    marginLeft: 8,
  },

  pathDescription: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },

  skillBadge: {
    backgroundColor: '#F0F3F7',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  skillText: {
    color: '#344054',
    fontSize: 11,
    fontWeight: '600',
  },

  exploreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
  },

  exploreText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  exploreArrow: {
    color: '#0B1F3A',
    fontSize: 20,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  emptyText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
