import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAVED_OPPORTUNITIES_KEY =
  'careerforge_saved_opportunities';

type Opportunity = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  match: number;
  description: string;
  skills: string[];
};

const opportunities: Opportunity[] = [
  {
    id: '1',
    icon: 'analytics-outline',
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
    icon: 'bar-chart-outline',
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
    icon: 'code-slash-outline',
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
    icon: 'hardware-chip-outline',
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
    icon: 'business-outline',
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

const filters = [
  'All',
  'Internships',
  'Graduate',
  'Jobs',
];

export default function OpportunitiesScreen() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const [savedOpportunities, setSavedOpportunities] =
    useState<string[]>([]);

  const loadSavedOpportunities = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSavedOpportunities(parsed);
        } else {
          setSavedOpportunities([]);
        }
      } else {
        setSavedOpportunities([]);
      }
    } catch (error) {
      console.log(
        'Error loading saved opportunities:',
        error
      );

      setSavedOpportunities([]);
    }
  };

  /*
   * Reload whenever the screen comes back into focus.
   * This means saving an opportunity from
   * opportunity-details.tsx will immediately update
   * this screen when the user returns.
   */
  useFocusEffect(
    useCallback(() => {
      loadSavedOpportunities();
    }, [])
  );

  const toggleSaved = async (id: string) => {
    const updated = savedOpportunities.includes(id)
      ? savedOpportunities.filter(
          (item) => item !== id
        )
      : [...savedOpportunities, id];

    setSavedOpportunities(updated);

    try {
      await AsyncStorage.setItem(
        SAVED_OPPORTUNITIES_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log(
        'Error saving opportunity:',
        error
      );
    }
  };

  const filteredOpportunities = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const matchesFilter =
        selectedFilter === 'All' ||
        opportunity.type === selectedFilter;

      const matchesSearch =
        opportunity.title
          .toLowerCase()
          .includes(searchText) ||
        opportunity.company
          .toLowerCase()
          .includes(searchText) ||
        opportunity.location
          .toLowerCase()
          .includes(searchText) ||
        opportunity.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      return matchesFilter && matchesSearch;
    });
  }, [search, selectedFilter]);

  /*
   * Saved opportunities appear FIRST.
   * They are still affected by the current
   * search and filter.
   */
  const savedOpportunityList = useMemo(() => {
    return filteredOpportunities.filter((opportunity) =>
      savedOpportunities.includes(opportunity.id)
    );
  }, [
    filteredOpportunities,
    savedOpportunities,
  ]);

  /*
   * Saved opportunities are removed from the
   * Recommended section so the same card doesn't
   * appear twice.
   */
  const recommendedOpportunityList =
    useMemo(() => {
      return filteredOpportunities.filter(
        (opportunity) =>
          !savedOpportunities.includes(
            opportunity.id
          )
      );
    }, [
      filteredOpportunities,
      savedOpportunities,
    ]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/dashboard');
    }
  };

  const openOpportunity = (
    opportunity: Opportunity
  ) => {
    router.push({
      pathname: '/student/opportunity-details',
      params: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        location: opportunity.location,
        type: opportunity.type,
        match: opportunity.match.toString(),
        description: opportunity.description,
      },
    });
  };

  const renderOpportunityCard = (
    opportunity: Opportunity,
    isSavedSection = false
  ) => {
    const isSaved = savedOpportunities.includes(
      opportunity.id
    );

    return (
      <View
        key={`${isSavedSection ? 'saved' : 'recommended'}-${opportunity.id}`}
        style={[
          styles.opportunityCard,
          isSavedSection &&
            styles.savedOpportunityCard,
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.companyIcon}>
            <Ionicons
              name={opportunity.icon}
              size={24}
              color="#2457E6"
            />
          </View>

          <View style={styles.cardTitleContainer}>
            <Text
              style={styles.opportunityTitle}
              numberOfLines={2}
            >
              {opportunity.title}
            </Text>

            <Text style={styles.companyName}>
              {opportunity.company}
            </Text>
          </View>

          <Pressable
            style={[
              styles.saveButton,
              isSaved &&
                styles.saveButtonActive,
            ]}
            onPress={() =>
              toggleSaved(opportunity.id)
            }
          >
            <Ionicons
              name={
                isSaved
                  ? 'bookmark'
                  : 'bookmark-outline'
              }
              size={19}
              color={
                isSaved
                  ? '#2457E6'
                  : '#64748B'
              }
            />
          </Pressable>
        </View>

        {/* Saved Indicator */}
        {isSavedSection && (
          <View style={styles.savedIndicator}>
            <Ionicons
              name="bookmark"
              size={12}
              color="#2457E6"
            />

            <Text style={styles.savedIndicatorText}>
              Saved for later
            </Text>
          </View>
        )}

        {/* Match + Type */}
        <View style={styles.matchRow}>
          <View style={styles.matchBadge}>
            <Ionicons
              name="sparkles-outline"
              size={12}
              color="#15803D"
            />

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
            <Ionicons
              name="location-outline"
              size={14}
              color="#64748B"
            />

            <Text style={styles.detailText}>
              {opportunity.location}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="cash-outline"
              size={14}
              color="#64748B"
            />

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

        {/* Buttons */}
        <View
          style={[
            styles.buttonRow,
            isSavedSection &&
              styles.savedButtonRow,
          ]}
        >
          <Pressable
            style={styles.viewButton}
            onPress={() =>
              openOpportunity(opportunity)
            }
          >
            <Text style={styles.viewButtonText}>
              View Opportunity
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFFFFF"
            />
          </Pressable>

          {isSavedSection && (
            <Pressable
              style={styles.removeButton}
              onPress={() =>
                toggleSaved(opportunity.id)
              }
            >
              <Ionicons
                name="trash-outline"
                size={15}
                color="#64748B"
              />

              <Text
                style={styles.removeButtonText}
              >
                Remove
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const noMatchingSaved =
    savedOpportunities.length > 0 &&
    savedOpportunityList.length === 0;

  const noRecommendations =
    recommendedOpportunityList.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <Pressable
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons
          name="arrow-back"
          size={19}
          color="#2457E6"
        />

        <Text style={styles.backText}>
          Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="briefcase-outline"
              size={28}
              color="#2457E6"
            />
          </View>

          <View style={styles.headerBadge}>
            <Ionicons
              name="sparkles-outline"
              size={13}
              color="#2457E6"
            />

            <Text style={styles.headerBadgeText}>
              AI Matched
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          Find Opportunities
        </Text>

        <Text style={styles.subtitle}>
          Discover jobs, internships and graduate
          programmes that match your career goals.
        </Text>
      </View>

      {/* AI Match Card */}
      <View style={styles.matchCard}>
        <View style={styles.matchAccent} />

        <View style={styles.matchContent}>
          <View style={styles.matchLabelRow}>
            <Ionicons
              name="sparkles"
              size={14}
              color="#AFC4FF"
            />

            <Text style={styles.matchLabel}>
              AI Opportunity Matching
            </Text>
          </View>

          <Text style={styles.matchTitle}>
            Opportunities picked for you
          </Text>

          <Text style={styles.matchDescription}>
            Based on your skills, career goals and
            profile.
          </Text>
        </View>

        <View style={styles.matchCircle}>
          <Text style={styles.matchNumber}>
            92
          </Text>

          <Text style={styles.matchPercent}>
            %
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color="#64748B"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, skills or companies"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
            style={styles.clearButton}
          >
            <Ionicons
              name="close"
              size={16}
              color="#64748B"
            />
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
        contentContainerStyle={
          styles.filterContainer
        }
      >
        {filters.map((filter) => {
          const isSelected =
            selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                isSelected &&
                  styles.filterButtonSelected,
              ]}
              onPress={() =>
                setSelectedFilter(filter)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected &&
                    styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================================= */}
      {/* SAVED OPPORTUNITIES — FIRST */}
      {/* ================================================= */}

      <View style={styles.savedSectionHeader}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="bookmark"
              size={17}
              color="#2457E6"
            />
          </View>

          <View style={styles.sectionHeadingText}>
            <Text style={styles.sectionTitle}>
              Saved Opportunities
            </Text>

            <Text style={styles.resultsSubtitle}>
              {savedOpportunities.length === 0
                ? 'Your saved opportunities appear here'
                : `${savedOpportunities.length} ${
                    savedOpportunities.length ===
                    1
                      ? 'opportunity'
                      : 'opportunities'
                  } saved`}
            </Text>
          </View>
        </View>

        <View style={styles.savedCountBadge}>
          <Text style={styles.savedCountText}>
            {savedOpportunities.length}
          </Text>
        </View>
      </View>

      {/* Saved Cards */}
      {savedOpportunityList.length > 0 &&
        savedOpportunityList.map(
          (opportunity) =>
            renderOpportunityCard(
              opportunity,
              true
            )
        )}

      {/* No Saved */}
      {savedOpportunities.length === 0 && (
        <View style={styles.savedEmptyCard}>
          <View style={styles.savedEmptyIcon}>
            <Ionicons
              name="bookmark-outline"
              size={27}
              color="#2457E6"
            />
          </View>

          <Text style={styles.savedEmptyTitle}>
            No saved opportunities yet
          </Text>

          <Text style={styles.savedEmptyText}>
            Tap the bookmark icon on an opportunity
            to save it here for later.
          </Text>
        </View>
      )}

      {/* Saved exist but don't match current filter/search */}
      {noMatchingSaved && (
        <View style={styles.filteredSavedCard}>
          <Ionicons
            name="filter-outline"
            size={20}
            color="#2457E6"
          />

          <View style={styles.filteredSavedContent}>
            <Text style={styles.filteredSavedTitle}>
              Your saved opportunities are hidden
            </Text>

            <Text
              style={styles.filteredSavedText}
            >
              Change the search or opportunity type
              filter to see them.
            </Text>
          </View>
        </View>
      )}

      {/* ================================================= */}
      {/* RECOMMENDED */}
      {/* ================================================= */}

      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recommended For You
          </Text>

          <Text style={styles.resultsSubtitle}>
            {recommendedOpportunityList.length}{' '}
            {recommendedOpportunityList.length ===
            1
              ? 'opportunity'
              : 'opportunities'}{' '}
            available
          </Text>
        </View>

        <View style={styles.aiBadge}>
          <Ionicons
            name="sparkles-outline"
            size={13}
            color="#2457E6"
          />

          <Text style={styles.aiBadgeText}>
            AI Match
          </Text>
        </View>
      </View>

      {/* Recommended Cards */}
      {recommendedOpportunityList.map(
        (opportunity) =>
          renderOpportunityCard(opportunity)
      )}

      {/* All matching opportunities are saved */}
      {!filteredOpportunities.length ? null : noRecommendations && (
        <View style={styles.allSavedCard}>
          <View style={styles.allSavedIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={26}
              color="#22C55E"
            />
          </View>

          <Text style={styles.allSavedTitle}>
            All matching opportunities are saved
          </Text>

          <Text style={styles.allSavedText}>
            You have already saved every opportunity
            matching your current search and filter.
          </Text>
        </View>
      )}

      {/* No Results */}
      {filteredOpportunities.length === 0 && (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="search-outline"
              size={30}
              color="#2457E6"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No opportunities found
          </Text>

          <Text style={styles.emptyText}>
            Try changing your search or selecting a
            different opportunity type.
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
        <View style={styles.tipIconContainer}>
          <Ionicons
            name="bulb-outline"
            size={21}
            color="#2457E6"
          />
        </View>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Application Tip
          </Text>

          <Text style={styles.tipText}>
            Apply for opportunities where your skills
            match the requirements. Tailor your CV and
            highlight relevant projects and experience
            before applying.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Ionicons
          name="information-circle-outline"
          size={15}
          color="#94A3B8"
        />

        <Text style={styles.footerText}>
          New opportunities will appear here as they
          become available.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },

  backText: {
    fontSize: 15,
    color: '#2457E6',
    fontWeight: '700',
    marginLeft: 6,
  },

  header: {
    marginBottom: 22,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E2FF',
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#D5E2FF',
  },

  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2457E6',
    marginLeft: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  matchCard: {
    backgroundColor: '#173FBD',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },

  matchAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#6B8FFF',
  },

  matchContent: {
    flex: 1,
    paddingRight: 15,
    paddingLeft: 4,
  },

  matchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  matchLabel: {
    color: '#C9D6FF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },

  matchTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 5,
  },

  matchDescription: {
    color: '#DCE5FF',
    fontSize: 12,
    lineHeight: 18,
  },

  matchCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  matchNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  matchPercent: {
    color: '#DCE5FF',
    fontSize: 10,
    marginTop: -2,
  },

  searchContainer: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: '#173FBD',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#172A55',
    marginLeft: 9,
    paddingVertical: 10,
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 10,
  },

  filterScroll: {
    marginBottom: 25,
  },

  filterContainer: {
    paddingRight: 10,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 9,
    marginRight: 9,
  },

  filterButtonSelected: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  savedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 3,
  },

  resultsSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },

  savedCountBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  savedCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  savedEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    marginBottom: 24,
  },

  savedEmptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  savedEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 5,
  },

  savedEmptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 290,
  },

  filteredSavedCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D5E2FF',
  },

  filteredSavedContent: {
    flex: 1,
    marginLeft: 10,
  },

  filteredSavedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 3,
  },

  filteredSavedText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 3,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2457E6',
    marginLeft: 4,
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#DCE5F5',
    marginBottom: 14,
    shadowColor: '#173FBD',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  savedOpportunityCard: {
    borderColor: '#BFD0FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2457E6',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  companyIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cardTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },

  opportunityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  saveButton: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonActive: {
    backgroundColor: '#E8F0FF',
    borderColor: '#AFC4FF',
  },

  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
  },

  savedIndicatorText: {
    fontSize: 10,
    color: '#2457E6',
    fontWeight: '800',
    marginLeft: 4,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginRight: 7,
  },

  matchBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  typeBadge: {
    backgroundColor: '#E8F0FF',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  typeBadgeText: {
    color: '#2457E6',
    fontSize: 10,
    fontWeight: '800',
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

  detailText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },

  opportunityDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 13,
  },

  skillsLabel: {
    fontSize: 11,
    fontWeight: '800',
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
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  savedButtonRow: {
    gap: 8,
  },

  viewButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2457E6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 7,
  },

  removeButton: {
    height: 44,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
  },

  allSavedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 17,
    padding: 19,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 18,
  },

  allSavedIcon: {
    marginBottom: 8,
  },

  allSavedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 5,
    textAlign: 'center',
  },

  allSavedText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#4B7A5A',
    textAlign: 'center',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    marginBottom: 18,
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172A55',
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
    backgroundColor: '#E8F0FF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  resetButtonText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  tipCard: {
    backgroundColor: '#EAF1FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D5E2FF',
  },

  tipIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 5,
    flex: 1,
  },
});
