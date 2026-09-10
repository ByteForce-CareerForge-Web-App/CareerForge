import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

const opportunities = [
  {
    id: '1',
    title: 'Junior Data Analyst',
    company: 'TechNova Solutions',
    location: 'Durban, KwaZulu-Natal',
    type: 'Full-time',
    salary: 'R18,000 - R25,000 / month',
    match: '94%',
    description:
      'Join our analytics team and help transform business data into meaningful insights and reports.',
    skills: ['Python', 'SQL', 'Excel', 'Power BI'],
  },
  {
    id: '2',
    title: 'Business Intelligence Analyst',
    company: 'Insight Consulting',
    location: 'Johannesburg, Gauteng',
    type: 'Full-time',
    salary: 'R25,000 - R35,000 / month',
    match: '89%',
    description:
      'Work with business teams to develop dashboards, reports and data-driven solutions.',
    skills: ['Power BI', 'SQL', 'Data Visualisation'],
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'FutureTech Africa',
    location: 'Cape Town, Western Cape',
    type: 'Internship',
    salary: 'R8,000 / month',
    match: '86%',
    description:
      'Gain practical experience working with machine learning, analytics and real-world datasets.',
    skills: ['Python', 'Machine Learning', 'Pandas'],
  },
  {
    id: '4',
    title: 'Software Developer',
    company: 'DigitalEdge',
    location: 'Remote',
    type: 'Full-time',
    salary: 'R22,000 - R32,000 / month',
    match: '81%',
    description:
      'Build and maintain modern software applications while working with an experienced development team.',
    skills: ['JavaScript', 'React', 'Git', 'APIs'],
  },
];

export default function AlumniOpportunities() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText.length === 0 ||
        opportunity.title.toLowerCase().includes(searchText) ||
        opportunity.company.toLowerCase().includes(searchText) ||
        opportunity.location.toLowerCase().includes(searchText) ||
        opportunity.type.toLowerCase().includes(searchText) ||
        opportunity.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesFilter =
        selectedFilter === 'All' ||
        opportunity.type === selectedFilter ||
        (selectedFilter === 'Remote' &&
          opportunity.location.toLowerCase() === 'remote');

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            Find your next career opportunity
          </Text>
        </View>

        {/* Saved Opportunities Button */}
        <TouchableOpacity
          style={styles.savedButton}
          onPress={() =>
            router.push('/alumni/saved-opportunities')
          }
          activeOpacity={0.8}
        >
          <Text style={styles.savedIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Saved Opportunities Banner */}
        <TouchableOpacity
          style={styles.savedBanner}
          onPress={() =>
            router.push('/alumni/saved-opportunities')
          }
          activeOpacity={0.85}
        >
          <View style={styles.savedBannerIcon}>
            <Text style={styles.savedBannerIconText}>🔖</Text>
          </View>

          <View style={styles.savedBannerInfo}>
            <Text style={styles.savedBannerTitle}>
              Saved Opportunities
            </Text>

            <Text style={styles.savedBannerText}>
              View opportunities you've saved for later.
            </Text>
          </View>

          <Text style={styles.savedBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search opportunities"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* AI Recommendation Banner */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>✦</Text>
          </View>

          <View style={styles.aiInfo}>
            <Text style={styles.aiTitle}>
              AI Recommended Opportunities
            </Text>

            <Text style={styles.aiDescription}>
              These opportunities have been selected based on your
              professional profile and career interests.
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'Full-time', 'Remote'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter &&
                  styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                    styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recommended for You
          </Text>

          <Text style={styles.resultCount}>
            {filteredOpportunities.length} found
          </Text>
        </View>

        {/* Opportunity Cards */}
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((opportunity) => (
            <TouchableOpacity
              key={opportunity.id}
              style={styles.opportunityCard}
              onPress={() =>
                router.push({
                  pathname: '/alumni/opportunity-details',
                  params: {
                    id: opportunity.id,
                    title: opportunity.title,
                    company: opportunity.company,
                    location: opportunity.location,
                    type: opportunity.type,
                    salary: opportunity.salary,
                    match: opportunity.match,
                    description: opportunity.description,
                    skills: opportunity.skills.join(','),
                  },
                })
              }
              activeOpacity={0.85}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.companyIcon}>
                  <Text style={styles.companyIconText}>
                    {opportunity.company.charAt(0)}
                  </Text>
                </View>

                <View style={styles.cardTitleContainer}>
                  <Text style={styles.jobTitle}>
                    {opportunity.title}
                  </Text>

                  <Text style={styles.companyName}>
                    {opportunity.company}
                  </Text>
                </View>

                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {opportunity.match}
                  </Text>

                  <Text style={styles.matchLabel}>
                    match
                  </Text>
                </View>
              </View>

              {/* Location */}
              <Text style={styles.detailText}>
                📍 {opportunity.location}
              </Text>

              {/* Employment Type */}
              <Text style={styles.detailText}>
                💼 {opportunity.type}
              </Text>

              {/* Salary */}
              <Text style={styles.detailText}>
                💰 {opportunity.salary}
              </Text>

              {/* Skills */}
              <View style={styles.skillsContainer}>
                {opportunity.skills.map((skill) => (
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

              <View style={styles.viewContainer}>
                <Text style={styles.viewText}>
                  View Opportunity →
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>

            <Text style={styles.emptyTitle}>
              No opportunities found
            </Text>

            <Text style={styles.emptyText}>
              Try a different search term or select another filter.
            </Text>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearch('');
                setSelectedFilter('All');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>
                Clear Search & Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to Dashboard */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.replace('/alumni/dashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.dashboardButtonText}>
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
    backgroundColor: '#F7F7FB',
  },

  header: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 24,
    color: '#4F46E5',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#24243A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  savedButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
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
    borderColor: '#E4DEFF',
  },

  savedBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
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
    color: '#312E81',
    marginBottom: 3,
  },

  savedBannerText: {
    fontSize: 11,
    color: '#777784',
  },

  savedBannerArrow: {
    fontSize: 22,
    color: '#5B3FD1',
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
    color: '#24243A',
  },

  aiCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 18,
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#6C63FF',
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
    color: '#312E81',
    marginBottom: 4,
  },

  aiDescription: {
    fontSize: 12,
    color: '#5F5F70',
    lineHeight: 18,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9E5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 8,
  },

  activeFilterButton: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
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
    color: '#24243A',
  },

  resultCount: {
    fontSize: 12,
    color: '#777777',
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
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  companyIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C63FF',
  },

  cardTitleContainer: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 13,
    color: '#777777',
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
    color: '#5F5F70',
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
    borderTopColor: '#EEEEF5',
    marginTop: 10,
    paddingTop: 12,
  },

  viewText: {
    color: '#4F46E5',
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
    color: '#24243A',
  },

  emptyText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  clearButton: {
    backgroundColor: '#6C63FF',
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
    backgroundColor: '#24243A',
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