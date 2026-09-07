import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function OpportunitiesScreen() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>(
    []
  );

  useEffect(() => {
    const loadSavedOpportunities = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          'careerforge_saved_opportunities'
        );

        if (saved) {
          setSavedOpportunities(JSON.parse(saved));
        }
      } catch (error) {
        console.log('Error loading saved opportunities:', error);
      }
    };

    loadSavedOpportunities();
  }, []);

  const filters = [
    'All',
    'Internships',
    'Graduate',
    'Jobs',
  ];

  const opportunities = [
    {
      id: '1',
      icon: '💻',
      title: 'Junior Data Analyst',
      company: 'Tech Solutions',
      location: 'Durban, KZN',
      type: 'Jobs',
      salary: 'R15,000 - R20,000',
      match: 94,
      description:
        'Analyse business data and create insights to support decision-making.',
      skills: ['Python', 'SQL', 'Excel'],
    },
    {
      id: '2',
      icon: '📊',
      title: 'Data Science Intern',
      company: 'DataTech Africa',
      location: 'Johannesburg, Gauteng',
      type: 'Internships',
      salary: 'Paid Internship',
      match: 91,
      description:
        'Work with data science teams on real-world analytics and machine learning projects.',
      skills: ['Python', 'Pandas', 'Machine Learning'],
    },
    {
      id: '3',
      icon: '🚀',
      title: 'Graduate Software Developer',
      company: 'Future Digital',
      location: 'Cape Town, Western Cape',
      type: 'Graduate',
      salary: 'Graduate Programme',
      match: 87,
      description:
        'Join a graduate development programme and build software solutions with an experienced team.',
      skills: ['JavaScript', 'React', 'Git'],
    },
    {
      id: '4',
      icon: '🤖',
      title: 'AI & Machine Learning Intern',
      company: 'Innovation Labs',
      location: 'Remote',
      type: 'Internships',
      salary: 'Paid Internship',
      match: 84,
      description:
        'Assist with artificial intelligence projects and explore practical machine learning applications.',
      skills: ['Python', 'AI', 'Machine Learning'],
    },
    {
      id: '5',
      icon: '💼',
      title: 'Business Intelligence Graduate',
      company: 'Insight Group',
      location: 'Pretoria, Gauteng',
      type: 'Graduate',
      salary: 'Graduate Programme',
      match: 81,
      description:
        'Help transform business data into useful reports, dashboards, and strategic insights.',
      skills: ['SQL', 'Power BI', 'Data Analysis'],
    },
  ];

  const toggleSaved = async (id: string) => {
    setSavedOpportunities((current) => {
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      AsyncStorage.setItem(
        'careerforge_saved_opportunities',
        JSON.stringify(updated)
      ).catch((error) => {
        console.log('Error saving opportunity:', error);
      });

      return updated;
    });
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesFilter =
        selectedFilter === 'All' ||
        opportunity.type === selectedFilter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchText) ||
        opportunity.company.toLowerCase().includes(searchText) ||
        opportunity.location.toLowerCase().includes(searchText) ||
        opportunity.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      return matchesFilter && matchesSearch;
    });
  }, [search, selectedFilter]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/dashboard');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <Pressable
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>💼</Text>
        </View>

        <Text style={styles.title}>
          Find Opportunities
        </Text>

        <Text style={styles.subtitle}>
          Discover jobs, internships and graduate programmes
          that match your career goals.
        </Text>
      </View>

      {/* AI Match Card */}
      <View style={styles.matchCard}>
        <View style={styles.matchContent}>
          <Text style={styles.matchLabel}>
            AI Opportunity Matching
          </Text>

          <Text style={styles.matchTitle}>
            Opportunities picked for you
          </Text>

          <Text style={styles.matchDescription}>
            Based on your skills, career goals and profile.
          </Text>
        </View>

        <View style={styles.matchCircle}>
          <Text style={styles.matchNumber}>92</Text>
          <Text style={styles.matchPercent}>%</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔎</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, skills or companies"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <Text style={styles.filterTitle}>
        Opportunity Type
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonSelected,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recommended For You
          </Text>

          <Text style={styles.resultsSubtitle}>
            {filteredOpportunities.length} opportunities found
          </Text>
        </View>

        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>
            ⭐ {savedOpportunities.length} saved
          </Text>
        </View>
      </View>

      {/* Opportunity Cards */}
      {filteredOpportunities.map((opportunity) => {
        const isSaved = savedOpportunities.includes(
          opportunity.id
        );

        return (
          <View
            key={opportunity.id}
            style={styles.opportunityCard}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.companyIcon}>
                <Text style={styles.companyIconText}>
                  {opportunity.icon}
                </Text>
              </View>

              <View style={styles.cardTitleContainer}>
                <Text style={styles.opportunityTitle}>
                  {opportunity.title}
                </Text>

                <Text style={styles.companyName}>
                  {opportunity.company}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.saveButton,
                  isSaved && styles.saveButtonActive,
                ]}
                onPress={() =>
                  toggleSaved(opportunity.id)
                }
              >
                <Text
                  style={[
                    styles.saveIcon,
                    isSaved && styles.saveIconActive,
                  ]}
                >
                  {isSaved ? '★' : '☆'}
                </Text>
              </Pressable>
            </View>

            {/* Match */}
            <View style={styles.matchRow}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>
                  {opportunity.match}% Match
                </Text>
              </View>

              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {opportunity.type}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📍</Text>

                <Text style={styles.detailText}>
                  {opportunity.location}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💰</Text>

                <Text style={styles.detailText}>
                  {opportunity.salary}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.opportunityDescription}>
              {opportunity.description}
            </Text>

            {/* Skills */}
            <Text style={styles.skillsLabel}>
              Relevant Skills
            </Text>

            <View style={styles.skillsContainer}>
              {opportunity.skills.map((skill) => (
                <View
                  key={skill}
                  style={styles.skillTag}
                >
                  <Text style={styles.skillTagText}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>

            {/* View Button */}
            <Pressable
              style={styles.viewButton}
              onPress={() =>
                router.push({
                  pathname: '/student/opportunity-details',
                  params: {
                    id: opportunity.id,
                    title: opportunity.title,
                    company: opportunity.company,
                    location: opportunity.location,
                    type: opportunity.type,
                    match: opportunity.match,
                    description: opportunity.description,
                  },
                })
              }
            >
              <Text style={styles.viewButtonText}>
                View Opportunity
              </Text>
            </Pressable>
          </View>
        );
      })}

      {/* No Results */}
      {filteredOpportunities.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔎</Text>

          <Text style={styles.emptyTitle}>
            No opportunities found
          </Text>

          <Text style={styles.emptyText}>
            Try changing your search or selecting a different
            opportunity type.
          </Text>

          <Pressable
            style={styles.resetButton}
            onPress={() => {
              setSearch('');
              setSelectedFilter('All');
            }}
          >
            <Text style={styles.resetButtonText}>
              Reset Search
            </Text>
          </Pressable>
        </View>
      )}

      {/* Career Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Application Tip
          </Text>

          <Text style={styles.tipText}>
            Apply for opportunities where your skills match
            the requirements. Tailor your CV and highlight
            relevant projects and experience before applying.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        New opportunities will appear here as they become
        available.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  backButton: {
    marginBottom: 22,
  },

  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  headerIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  matchCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  matchContent: {
    flex: 1,
    paddingRight: 15,
  },

  matchLabel: {
    color: '#C7D2FE',
    fontSize: 12,
    marginBottom: 5,
  },

  matchTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  matchDescription: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 18,
  },

  matchCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  matchNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  matchPercent: {
    color: '#E0E7FF',
    fontSize: 10,
    marginTop: -2,
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },

  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearText: {
    fontSize: 18,
    color: '#64748B',
    lineHeight: 20,
  },

  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },

  filterScroll: {
    marginBottom: 24,
  },

  filterContainer: {
    paddingRight: 10,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 9,
  },

  filterButtonSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },

  resultsSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },

  savedBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  savedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  companyIconText: {
    fontSize: 23,
  },

  cardTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },

  opportunityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 12,
    color: '#64748B',
  },

  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },

  saveIcon: {
    fontSize: 20,
    color: '#94A3B8',
  },

  saveIconActive: {
    color: '#F59E0B',
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginRight: 7,
  },

  matchBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },

  typeBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  typeBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '700',
  },

  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 5,
  },

  detailIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  detailText: {
    fontSize: 11,
    color: '#64748B',
  },

  opportunityDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 13,
  },

  skillsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 7,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },

  skillTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 5,
  },

  skillTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  viewButton: {
    height: 43,
    borderRadius: 11,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 15,
  },

  resetButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  resetButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },

  tipCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 18,
  },

  tipIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});