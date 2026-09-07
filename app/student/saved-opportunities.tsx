import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SAVED_OPPORTUNITIES_KEY =
  'careerforge_saved_opportunities';

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

export default function SavedOpportunitiesScreen() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedOpportunities = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY
      );

      if (saved) {
        const parsed: string[] = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSavedIds(parsed);
        } else {
          setSavedIds([]);
        }
      } else {
        setSavedIds([]);
      }
    } catch (error) {
      console.log(
        'Error loading saved opportunities:',
        error
      );

      setSavedIds([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedOpportunities();
    }, [])
  );

  const removeSaved = async (id: string) => {
    try {
      const updatedIds = savedIds.filter(
        (savedId) => savedId !== id
      );

      await AsyncStorage.setItem(
        SAVED_OPPORTUNITIES_KEY,
        JSON.stringify(updatedIds)
      );

      setSavedIds(updatedIds);
    } catch (error) {
      console.log(
        'Error removing saved opportunity:',
        error
      );
    }
  };

  const savedOpportunities = opportunities.filter(
    (opportunity) =>
      savedIds.includes(opportunity.id)
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/dashboard');
    }
  };

  const openOpportunities = () => {
    router.replace('/student/opportunities');
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
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>
            🔖
          </Text>
        </View>

        <Text style={styles.title}>
          Saved Opportunities
        </Text>

        <Text style={styles.subtitle}>
          Opportunities you've saved for later.
        </Text>
      </View>

      {/* Saved Count */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>
            Saved Opportunities
          </Text>

          <Text style={styles.summaryDescription}>
            Keep track of opportunities you want to
            explore or apply for.
          </Text>
        </View>

        <View style={styles.countCircle}>
          <Text style={styles.countText}>
            {savedOpportunities.length}
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Loading saved opportunities...
          </Text>
        </View>
      )}

      {/* No Saved Opportunities */}
      {!loading &&
        savedOpportunities.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔖
            </Text>

            <Text style={styles.emptyTitle}>
              No saved opportunities
            </Text>

            <Text style={styles.emptyText}>
              When you find an opportunity you like,
              tap the save button to keep it here.
            </Text>

            <Pressable
              style={styles.findButton}
              onPress={openOpportunities}
            >
              <Text style={styles.findButtonText}>
                Find Opportunities
              </Text>
            </Pressable>
          </View>
        )}

      {/* Saved Opportunities */}
      {!loading &&
        savedOpportunities.map(
          (opportunity) => (
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

                <View
                  style={styles.cardTitleContainer}
                >
                  <Text
                    style={styles.opportunityTitle}
                  >
                    {opportunity.title}
                  </Text>

                  <Text style={styles.companyName}>
                    {opportunity.company}
                  </Text>
                </View>

                <View style={styles.savedIcon}>
                  <Text style={styles.savedIconText}>
                    ★
                  </Text>
                </View>
              </View>

              {/* Badges */}
              <View style={styles.badgesRow}>
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
                <Text style={styles.detailText}>
                  📍 {opportunity.location}
                </Text>

                <Text style={styles.detailText}>
                  💰 {opportunity.salary}
                </Text>
              </View>

              {/* Description */}
              <Text
                style={
                  styles.opportunityDescription
                }
              >
                {opportunity.description}
              </Text>

              {/* Skills */}
              <View style={styles.skillsContainer}>
                {opportunity.skills.map(
                  (skill) => (
                    <View
                      key={skill}
                      style={styles.skillTag}
                    >
                      <Text
                        style={styles.skillTagText}
                      >
                        {skill}
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.viewButton}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/student/opportunity-details',
                      params: {
                        id: opportunity.id,
                        title: opportunity.title,
                        company:
                          opportunity.company,
                        location:
                          opportunity.location,
                        type: opportunity.type,
                        match:
                          opportunity.match.toString(),
                        description:
                          opportunity.description,
                      },
                    })
                  }
                >
                  <Text style={styles.viewButtonText}>
                    View Opportunity
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.removeButton}
                  onPress={() =>
                    removeSaved(
                      opportunity.id
                    )
                  }
                >
                  <Text
                    style={
                      styles.removeButtonText
                    }
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        )}

      {/* Footer */}
      <Text style={styles.footer}>
        CareerForgeAI • Your Career Opportunities
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
    marginBottom: 20,
  },

  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  headerIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },

  summaryCard: {
    backgroundColor: '#0B1F3A',
    borderRadius: 18,
    padding: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },

  summaryDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 240,
  },

  countCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  countText: {
    color: '#0B1F3A',
    fontSize: 21,
    fontWeight: '800',
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginBottom: 15,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  companyIconText: {
    fontSize: 23,
  },

  cardTitleContainer: {
    flex: 1,
  },

  opportunityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 12,
    color: '#64748B',
  },

  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  savedIconText: {
    color: '#0B1F3A',
    fontSize: 19,
  },

  badgesRow: {
    flexDirection: 'row',
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
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  typeBadgeText: {
    color: '#0B1F3A',
    fontSize: 10,
    fontWeight: '700',
  },

  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  detailText: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 15,
    marginBottom: 5,
  },

  opportunityDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 13,
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

  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  viewButton: {
    flex: 1,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  removeButton: {
    paddingHorizontal: 16,
    height: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },

  findButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  findButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 10,
  },
});