import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
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
      statusColor: '#2457E6',
      statusBackground: '#E8F0FF',
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
      statusColor: '#173FBD',
      statusBackground: '#E8F0FF',
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
              date: application.date || '2 September 2026',
              status: application.status || 'Applied',
              statusColor: '#64748B',
              statusBackground: '#F1F5F9',
              type: application.type || 'Application',
              match: application.match || '92',
              description:
                application.description ||
                'You have submitted an application for this opportunity.',
            }));

          setApplications((currentApplications) => [
            ...formattedApplications,
            ...currentApplications.filter(
              (existingApplication) =>
                !formattedApplications.some(
                  (savedApplication) =>
                    savedApplication.title === existingApplication.title &&
                    savedApplication.company === existingApplication.company
                )
            ),
          ]);
        }
      } catch (error) {
        console.log('Error loading applications:', error);
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
          (application) => application.status === selectedFilter
        );

  const totalApplications = applications.length;

  const underReview = applications.filter(
    (application) => application.status === 'Under Review'
  ).length;

  const shortlisted = applications.filter(
    (application) => application.status === 'Shortlisted'
  ).length;

  const accepted = applications.filter(
    (application) => application.status === 'Accepted'
  ).length;

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
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HERO */}

        <View style={styles.heroHeader}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.headerTop}>
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.studentBadge}>
              <Ionicons
                name="school-outline"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.studentBadgeText}>
                STUDENT
              </Text>
            </View>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              name="document-text-outline"
              size={29}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroEyebrow}>
            CAREERFORGEAI
          </Text>

          <Text style={styles.heroTitle}>
            My Applications
          </Text>

          <Text style={styles.heroSubtitle}>
            Keep track of every opportunity you've
            applied for and follow your progress.
          </Text>

          <View style={styles.heroBottom}>
            <View style={styles.heroStatus}>
              <View style={styles.liveDot} />

              <Text style={styles.heroStatusText}>
                {totalApplications} active applications
              </Text>
            </View>

            <View style={styles.heroBottomIcon}>
              <Ionicons
                name="briefcase-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* APPLICATION OVERVIEW */}

        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                APPLICATION OVERVIEW
              </Text>

              <Text style={styles.statsTitle}>
                Your progress
              </Text>
            </View>

            <View style={styles.statsIcon}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color="#2457E6"
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIconBlue}>
                  <Ionicons
                    name="apps-outline"
                    size={18}
                    color="#2457E6"
                  />
                </View>

                <Text style={styles.statNumber}>
                  {totalApplications}
                </Text>
              </View>

              <Text style={styles.statLabel}>
                Total Applications
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIconBlue}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#2457E6"
                  />
                </View>

                <Text style={styles.blueNumber}>
                  {underReview}
                </Text>
              </View>

              <Text style={styles.statLabel}>
                Under Review
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIconDeepBlue}>
                  <Ionicons
                    name="star-outline"
                    size={18}
                    color="#173FBD"
                  />
                </View>

                <Text style={styles.deepBlueNumber}>
                  {shortlisted}
                </Text>
              </View>

              <Text style={styles.statLabel}>
                Shortlisted
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIconBlue}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#2457E6"
                  />
                </View>

                <Text style={styles.blueNumber}>
                  {accepted}
                </Text>
              </View>

              <Text style={styles.statLabel}>
                Accepted
              </Text>
            </View>
          </View>
        </View>

        {/* FILTERS */}

        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                FILTER APPLICATIONS
              </Text>

              <Text style={styles.filterTitle}>
                Application status
              </Text>
            </View>

            <View style={styles.filterIcon}>
              <Ionicons
                name="filter-outline"
                size={19}
                color="#2457E6"
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((filter) => {
              const selected = selectedFilter === filter;

              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selected && styles.filterButtonSelected,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                  )}

                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* RESULTS */}

        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              YOUR CAREER ACTIVITY
            </Text>

            <Text style={styles.sectionTitle}>
              Applications
            </Text>
          </View>

          <View style={styles.resultCount}>
            <Text style={styles.resultCountText}>
              {filteredApplications.length}
            </Text>
          </View>
        </View>

        {/* APPLICATION CARDS */}

        {filteredApplications.map((application) => (
          <View
            key={application.id}
            style={styles.applicationCard}
          >
            <View style={styles.cardAccent} />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.companyIcon}>
                  <Ionicons
                    name="business-outline"
                    size={23}
                    color="#2457E6"
                  />
                </View>

                <View style={styles.cardTitleContainer}>
                  <Text style={styles.applicationTitle}>
                    {application.title}
                  </Text>

                  <View style={styles.companyRow}>
                    <Ionicons
                      name="business-outline"
                      size={12}
                      color="#64748B"
                    />

                    <Text style={styles.companyName}>
                      {application.company}
                    </Text>
                  </View>
                </View>

                <View style={styles.matchBadge}>
                  <Text style={styles.matchNumber}>
                    {application.match}%
                  </Text>

                  <Text style={styles.matchLabel}>
                    MATCH
                  </Text>
                </View>
              </View>

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
                        color: application.statusColor,
                      },
                    ]}
                  >
                    {application.status}
                  </Text>
                </View>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {application.type}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#2457E6"
                    />
                  </View>

                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>
                      LOCATION
                    </Text>

                    <Text style={styles.detailText}>
                      {application.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#2457E6"
                    />
                  </View>

                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>
                      APPLIED
                    </Text>

                    <Text style={styles.detailText}>
                      {application.date}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname:
                      '/student/opportunity-details',
                    params: {
                      id: application.id,
                      title: application.title,
                      company: application.company,
                      location: application.location,
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
                <Text style={styles.viewButtonText}>
                  View Opportunity
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>
        ))}

        {/* EMPTY STATE */}

        {filteredApplications.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="document-text-outline"
                size={30}
                color="#2457E6"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No applications found
            </Text>

            <Text style={styles.emptyText}>
              You don't have any applications with
              this status yet.
            </Text>

            <Pressable
              style={styles.browseButton}
              onPress={openOpportunities}
            >
              <Ionicons
                name="search-outline"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.browseButtonText}>
                Browse Opportunities
              </Text>
            </Pressable>
          </View>
        )}

        {/* BLUE AI TIP */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#2457E6"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipEyebrow}>
              CAREERFORGE AI
            </Text>

            <Text style={styles.tipTitle}>
              Keep building your momentum
            </Text>

            <Text style={styles.tipText}>
              Keep checking your application status
              and continue applying for opportunities
              that match your skills and career goals.
            </Text>
          </View>
        </View>

        {/* BROWSE MORE */}

        <Pressable
          style={styles.browseMoreButton}
          onPress={openOpportunities}
        >
          <View style={styles.browseMoreIcon}>
            <Ionicons
              name="briefcase-outline"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.browseMoreContent}>
            <Text style={styles.browseMoreTitle}>
              Find more opportunities
            </Text>

            <Text style={styles.browseMoreSubtitle}>
              Discover jobs, internships and graduate programmes
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.footer}>
          CareerForgeAI • Empowering your career journey
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FC',
  },

  container: {
    paddingBottom: 45,
  },

  /* =========================
     HERO
  ========================= */

  heroHeader: {
    backgroundColor: '#071A45',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },

  heroGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#2457E6',
    opacity: 0.32,
    right: -75,
    top: -75,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: '#6B8FFF',
    opacity: 0.24,
    left: -65,
    bottom: -65,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C7DFF',
  },

  studentBadge: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#173FBD',
    borderWidth: 1,
    borderColor: '#4C7DFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 6,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6B8FFF',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  heroEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: '#8EACFF',
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 9,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#DCE6FF',
    maxWidth: '94%',
  },

  heroBottom: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#29468A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6B8FFF',
    marginRight: 7,
  },

  heroStatusText: {
    color: '#DCE6FF',
    fontSize: 11,
    fontWeight: '700',
  },

  heroBottomIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C7DFF',
  },

  /* =========================
     STATS
  ========================= */

  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#2457E6',
    marginBottom: 4,
  },

  statsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#102A72',
  },

  statsIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DCE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#AFC4FF',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C9D6ED',
    shadowColor: '#102A72',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  statIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#E2EAFF',
    borderWidth: 1,
    borderColor: '#C0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIconDeepBlue: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#D5E1FF',
    borderWidth: 1,
    borderColor: '#AFC4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIconGreen: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#E8F7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#102A72',
  },

  blueNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2457E6',
  },

  deepBlueNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#173FBD',
  },

  greenNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2457E6',
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  /* =========================
     FILTERS
  ========================= */

  filterSection: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD7EA',
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  filterTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#102A72',
  },

  filterIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#DCE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#AFC4FF',
  },

  filterContainer: {
    paddingRight: 10,
  },

  filterButton: {
    height: 40,
    backgroundColor: '#F0F4FC',
    borderWidth: 1,
    borderColor: '#CBD7EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterButtonSelected: {
    backgroundColor: '#173FBD',
    borderColor: '#173FBD',
    shadowColor: '#102A72',
    shadowOpacity: 0.20,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  filterTextSelected: {
    color: '#FFFFFF',
    marginLeft: 4,
  },

  /* =========================
     RESULTS
  ========================= */

  resultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#102A72',
  },

  resultCount: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#102A72',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  resultCountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* =========================
     APPLICATION CARD
  ========================= */

  applicationCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C9D6ED',
    shadowColor: '#102A72',
    shadowOpacity: 0.08,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  cardAccent: {
    height: 5,
    backgroundColor: '#2457E6',
  },

  cardContent: {
    padding: 17,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  companyIcon: {
    width: 51,
    height: 51,
    borderRadius: 15,
    backgroundColor: '#E2EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#C0D0FF',
  },

  cardTitleContainer: {
    flex: 1,
  },

  applicationTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 5,
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  companyName: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '600',
  },

  matchBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#DCE7FF',
    borderWidth: 1,
    borderColor: '#AFC4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  matchNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: '#173FBD',
  },

  matchLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#102A72',
    letterSpacing: 0.7,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
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
    fontSize: 10,
    fontWeight: '800',
  },

  typeBadge: {
    backgroundColor: '#F0F4FC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD7EA',
  },

  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E7F1',
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#E2EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  detailTextContainer: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: '#94A3B8',
    marginBottom: 2,
  },

  detailText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  viewButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#102A72',
    shadowOpacity: 0.20,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
  },

  /* =========================
     EMPTY
  ========================= */

  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9D6ED',
    shadowColor: '#102A72',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: '#E2EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C0D0FF',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },

  browseButton: {
    height: 43,
    paddingHorizontal: 17,
    borderRadius: 11,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },

  /* =========================
     BLUE AI TIP
  ========================= */

  tipCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    backgroundColor: '#E8F0FF',
    borderRadius: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#AFC4FF',
    shadowColor: '#2457E6',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#C0D0FF',
  },

  tipContent: {
    flex: 1,
  },

  tipEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#2457E6',
    marginBottom: 4,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102A72',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#53647F',
  },

  /* =========================
     BROWSE MORE
  ========================= */

  browseMoreButton: {
    marginHorizontal: 20,
    marginTop: 12,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 19,
    backgroundColor: '#102A72',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2457E6',
    shadowColor: '#081B4B',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  browseMoreIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  browseMoreContent: {
    flex: 1,
  },

  browseMoreTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
  },

  browseMoreSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: '#C9D8FF',
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 22,
  },
});
