import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type CareerPath = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  skills: string[];
  roles: string[];
};

const CAREER_PATHS: CareerPath[] = [
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

export default function CareerPathwaysScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Business'];

  const filteredPaths = useMemo(() => {
    return CAREER_PATHS.filter((path) => {
      const matchesSearch =
        path.title.toLowerCase().includes(search.toLowerCase()) ||
        path.description.toLowerCase().includes(search.toLowerCase()) ||
        path.skills.some((skill) =>
          skill.toLowerCase().includes(search.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' ||
        path.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Header */}
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
          <Ionicons
            name="chevron-back"
            size={24}
            color="#FFFFFF"
          />
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
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <Ionicons
              name="compass-outline"
              size={28}
              color="#2457E6"
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Find Your Career Path
            </Text>

            <Text style={styles.introText}>
              Explore different career paths and discover the skills
              and roles that can help you reach your goals.
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#8A94A6"
            style={styles.searchIcon}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search career paths or skills..."
            placeholderTextColor="#98A2B3"
            style={styles.searchInput}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsTitleRow}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="map-outline"
                size={18}
                color="#2457E6"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Explore Career Paths
            </Text>
          </View>

          <View style={styles.resultBadge}>
            <Text style={styles.resultCount}>
              {filteredPaths.length} paths
            </Text>
          </View>
        </View>

        {filteredPaths.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="search-outline"
                size={32}
                color="#2457E6"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Career Paths Found
            </Text>

            <Text style={styles.emptyText}>
              Try searching for a different career, skill or category.
            </Text>
          </View>
        ) : (
          filteredPaths.map((path) => (
            <Pressable
              key={path.id}
              style={styles.pathCard}
              onPress={() =>
                router.push({
                  pathname: '/student/career-path-details',
                  params: {
                    id: path.id,
                    title: path.title,
                    category: path.category,
                    icon: path.icon,
                    description: path.description,
                    skills: JSON.stringify(path.skills),
                    roles: JSON.stringify(path.roles),
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

                <View style={styles.arrowContainer}>
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#2457E6"
                  />
                </View>
              </View>

              <Text style={styles.pathDescription}>
                {path.description}
              </Text>

              <View style={styles.skillsContainer}>
                {path.skills.slice(0, 3).map((skill) => (
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

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#2457E6"
                />
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
    backgroundColor: '#F5F7FC',
  },

  header: {
    backgroundColor: '#102A72',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    color: '#D9E5FF',
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
    backgroundColor: '#E8F0FF',
    borderRadius: 17,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  introIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  introText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },

  searchContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D9E2F2',
  },

  searchIcon: {
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: '#172A55',
    fontSize: 14,
  },

  categoryScroll: {
    marginBottom: 20,
  },

  categoryContent: {
    gap: 8,
  },

  categoryButton: {
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0EA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  categoryButtonActive: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
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

  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 18,
    fontWeight: '800',
  },

  resultBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  resultCount: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '700',
  },

  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D9E2F2',
    shadowColor: '#102A72',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  pathTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pathIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
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
    color: '#2457E6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  pathTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '800',
  },

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#F3F6FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E2F2',
  },

  skillText: {
    color: '#475467',
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
    borderTopColor: '#E1E7F2',
  },

  exploreText: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E2F2',
  },

  emptyIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#172A55',
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