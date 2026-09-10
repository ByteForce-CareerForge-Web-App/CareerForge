import React from 'react';
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
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            Find your next career opportunity
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search opportunities"
            placeholderTextColor="#94A3B8"
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
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Full-time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Remote</Text>
          </TouchableOpacity>
        </View>

        {/* Section */}
        <Text style={styles.sectionTitle}>
          Recommended for You
        </Text>

        {/* Opportunity Cards */}
        {opportunities.map((opportunity) => (
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
        ))}

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

  content: {
    padding: 20,
    paddingBottom: 40,
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

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 14,
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
});

