import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Application = {
  id: string;
  icon: string;
  title: string;
  company: string;
  location: string;
  date: string;
  status: string;
  statusColor: string;
  statusBackground: string;
  type?: string;
  match?: string;
  description?: string;
};

export default function ApplicationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      icon: '💻',
      title: 'Junior Data Analyst',
      company: 'Tech Solutions',
      location: 'Durban, KZN',
      date: '2 September 2026',
      status: 'Under Review',
      statusColor: '#2563EB',
      statusBackground: '#DBEAFE',
      type: 'Jobs',
      match: '94',
      description:
        'Analyse business data and create insights to support decision-making.',
    },
    {
      id: '2',
      icon: '📊',
      title: 'Data Science Intern',
      company: 'DataTech Africa',
      location: 'Johannesburg, Gauteng',
      date: '30 August 2026',
      status: 'Shortlisted',
      statusColor: '#7C3AED',
      statusBackground: '#EDE9FE',
      type: 'Internships',
      match: '91',
      description:
        'Work with data science teams on real-world analytics and machine learning projects.',
    },
    {
      id: '3',
      icon: '🚀',
      title: 'Graduate Software Developer',
      company: 'Future Digital',
      location: 'Cape Town, Western Cape',
      date: '25 August 2026',
      status: 'Applied',
      statusColor: '#64748B',
      statusBackground: '#F1F5F9',
      type: 'Graduate',
      match: '87',
      description:
        'Join a graduate development programme and build software solutions with an experienced team.',
    },
    {
      id: '4',
      icon: '🤖',
      title: 'AI & Machine Learning Intern',
      company: 'Innovation Labs',
      location: 'Remote',
      date: '20 August 2026',
      status: 'Accepted',
      statusColor: '#15803D',
      statusBackground: '#DCFCE7',
      type: 'Internships',
      match: '84',
      description:
        'Assist with artificial intelligence projects and explore practical machine learning applications.',
    },
  ]);

  /*
   * Load applications saved from the Apply Opportunity screen.
   */
  useEffect(() => {
    const loadSavedApplications = async () => {
      try {
        const savedApplications = await AsyncStorage.getItem(
          'careerforge_applications'
        );

        if (savedApplications) {
          const savedData = JSON.parse(savedApplications);

          const formattedApplications: Application[] =
            savedData.map((application: any) => ({
              id: application.id,
              icon: '💼',
              title: application.title,
              company: application.company,
              location: application.location || 'Not specified',
              date:
                application.date || '2 September 2026',
              status: application.status || 'Applied',
              statusColor: '#64748B',
              statusBackground: '#F1F5F9',
              type: application.type || 'Application',
              match: application.match || '92',
              description:
                application.description ||
                'You have submitted an application for this opportunity.',
            }));

          /*
           * Put newly submitted applications first.
           */
          setApplications((currentApplications) => [
            ...formattedApplications,
            ...currentApplications.filter(
              (existingApplication) =>
                !formattedApplications.some(
                  (savedApplication) =>
                    savedApplication.title ===
                      existingApplication.title &&
                    savedApplication.company ===
                      existingApplication.company
                )
            ),
          ]);
        }
      } catch (error) {
        console.log(
          'Error loading applications:',
          error
        );
      }
    };

    loadSavedApplications();
  }, []);

  const filters = [
    'All',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Accepted',
  ];

  const filteredApplications =
    selectedFilter === 'All'
      ? applications
      : applications.filter(
          (application) =>
            application.status === selectedFilter
        );

  const totalApplications = applications.length;

  const underReview = applications.filter(
    (application) =>
      application.status === 'Under Review'
  ).length;

  const shortlisted = applications.filter(
    (application) =>
      application.status === 'Shortlisted'
  ).length;

  const accepted = applications.filter(
    (application) =>
      application.status === 'Accepted'
  ).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>
            📋
          </Text>
        </View>

        <Text style={styles.title}>
          My Applications
        </Text>

        <Text style={styles.subtitle}>
          Track your job, internship and graduate programme
          applications.
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {totalApplications}
          </Text>

          <Text style={styles.statLabel}>
            Total
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text
            style={[
              styles.statNumber,
              { color: '#2563EB' },
            ]}
          >
            {underReview}
          </Text>

          <Text style={styles.statLabel}>
            Review
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text
            style={[
              styles.statNumber,
              { color: '#7C3AED' },
            ]}
          >
            {shortlisted}
          </Text>

          <Text style={styles.statLabel}>
            Shortlisted
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text
            style={[
              styles.statNumber,
              { color: '#15803D' },
            ]}
          >
            {accepted}
          </Text>

          <Text style={styles.statLabel}>
            Accepted
          </Text>
        </View>
      </View>

      {/* Filters */}
      <Text style={styles.filterTitle}>
        Application Status
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => {
          const selected =
            selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                selected &&
                  styles.filterButtonSelected,
              ]}
              onPress={() =>
                setSelectedFilter(filter)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selected &&
                    styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Applications Header */}
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Your Applications
          </Text>

          <Text style={styles.resultsSubtitle}>
            {filteredApplications.length}{' '}
            application
            {filteredApplications.length !== 1
              ? 's'
              : ''}
          </Text>
        </View>
      </View>

      {/* Application Cards */}
      {filteredApplications.map(
        (application) => (
          <View
            key={application.id}
            style={styles.applicationCard}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.companyIcon}>
                <Text
                  style={styles.companyIconText}
                >
                  {application.icon}
                </Text>
              </View>

              <View
                style={styles.cardTitleContainer}
              >
                <Text
                  style={styles.applicationTitle}
                >
                  {application.title}
                </Text>

                <Text
                  style={styles.companyName}
                >
                  {application.company}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      application.statusBackground,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        application.statusColor,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        application.statusColor,
                    },
                  ]}
                >
                  {application.status}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>
                  📍
                </Text>

                <Text style={styles.detailText}>
                  {application.location}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>
                  📅
                </Text>

                <Text style={styles.detailText}>
                  {application.date}
                </Text>
              </View>
            </View>

            {/* View Button */}
            <Pressable
              style={styles.viewButton}
              onPress={() =>
                router.push({
                  pathname:
                    '/student/opportunity-details',
                  params: {
                    id: application.id,
                    title:
                      application.title,
                    company:
                      application.company,
                    location:
                      application.location,
                    type:
                      application.type ||
                      'Application',
                    match:
                      application.match ||
                      '92',
                    description:
                      application.description ||
                      'You have already submitted an application for this opportunity.',
                  },
                })
              }
            >
              <Text
                style={styles.viewButtonText}
              >
                View Opportunity
              </Text>
            </Pressable>
          </View>
        )
      )}

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📋
          </Text>

          <Text style={styles.emptyTitle}>
            No applications found
          </Text>

          <Text style={styles.emptyText}>
            You don't have any applications with
            this status yet.
          </Text>

          <Pressable
            style={styles.browseButton}
            onPress={() =>
              router.push(
                '/student/opportunities'
              )
            }
          >
            <Text
              style={styles.browseButtonText}
            >
              Browse Opportunities
            </Text>
          </Pressable>
        </View>
      )}

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>
          💡
        </Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            CareerForgeAI Tip
          </Text>

          <Text style={styles.tipText}>
            Keep checking your application status
            and continue applying for opportunities
            that match your skills and career goals.
          </Text>
        </View>
      </View>

      {/* Browse More */}
      <Pressable
        style={styles.browseMoreButton}
        onPress={() =>
          router.push(
            '/student/opportunities'
          )
        }
      >
        <Text style={styles.browseMoreText}>
          Find More Opportunities
        </Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footer}>
        CareerForgeAI • Empowering your career journey
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

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  statCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
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
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginRight: 9,
  },

  filterButtonSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  resultsHeader: {
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

  applicationCard: {
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
    marginBottom: 14,
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
  },

  applicationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  companyName: {
    fontSize: 12,
    color: '#64748B',
  },

  statusRow: {
    marginBottom: 13,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  detailRow: {
    marginBottom: 14,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  detailIcon: {
    fontSize: 12,
    marginRight: 6,
  },

  detailText: {
    fontSize: 11,
    color: '#64748B',
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
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 38,
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
    marginBottom: 16,
  },

  browseButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  browseButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },

  tipCard: {
    backgroundColor: '#FEF3C7',
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
    color: '#92400E',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#78350F',
  },

  browseMoreButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  browseMoreText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },
});