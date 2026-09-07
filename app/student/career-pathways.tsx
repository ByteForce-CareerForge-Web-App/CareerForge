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
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Career Pathways</Text>
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
          <Text style={styles.introIcon}>🎯</Text>

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
          <Text style={styles.searchIcon}>🔍</Text>

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
          <Text style={styles.sectionTitle}>
            Explore Career Paths
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

                <Text style={styles.arrow}>›</Text>
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

                <Text style={styles.exploreArrow}>→</Text>
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
