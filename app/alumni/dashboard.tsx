import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AlumniDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Alumni Dashboard</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/alumni/notifications')}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationIcon}>🔔</Text>

              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/alumni/profile')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={21}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Career Journey */}
        <View style={styles.journeyCard}>
          <View style={styles.journeyHeader}>
            <View style={styles.journeyIcon}>
              <Ionicons
                name="trending-up-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.journeyHeaderText}>
              <Text style={styles.journeyTitle}>
                Your Career Journey
              </Text>

              <Text style={styles.journeySubtitle}>
                Keep building your professional future
              </Text>
            </View>
          </View>

          <Text style={styles.journeyDescription}>
            Stay connected, grow your skills, support students and discover
            opportunities through the CareerForge community.
          </Text>

          <View style={styles.journeyStats}>
            {/* Profile */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>75%</Text>
              <Text style={styles.journeyStatLabel}>
                Profile Complete
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>5</Text>
              <Text style={styles.journeyStatLabel}>
                Skills
              </Text>
            </View>

            {/* Connections */}
            <View style={styles.journeyStat}>
              <Text style={styles.journeyStatValue}>3</Text>
              <Text style={styles.journeyStatLabel}>
                Connections
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.journeyButton}
            onPress={() => router.push('/alumni/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.journeyButtonText}>
              View My Profile
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#1769AA"
            />
          </TouchableOpacity>
        </View>

        {/* Career Growth */}
        <Text style={styles.sectionTitle}>
          Career Growth
        </Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                Overall Progress
              </Text>

              <Text style={styles.progressSubtitle}>
                Keep developing your professional profile
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              75%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          {/* Progress Items */}
          <View style={styles.progressItems}>

            {/* Profile */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Profile
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                75%
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="layers-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Skills
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                80%
              </Text>
            </View>

            {/* Experience */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Experience
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                70%
              </Text>
            </View>

            {/* Networking */}
            <View style={styles.progressItem}>
              <View style={styles.progressItemLeft}>
                <View style={styles.progressIcon}>
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color="#1769AA"
                  />
                </View>

                <Text style={styles.progressItemText}>
                  Networking
                </Text>
              </View>

              <Text style={styles.progressItemValue}>
                60%
              </Text>
            </View>

          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        {/* Career Insights */}
        <TouchableOpacity
          style={styles.insightsCard}
          onPress={() => router.push('/alumni/career-insights')}
          activeOpacity={0.8}
        >
          <View style={styles.insightsIcon}>
            <Ionicons
              name="sparkles"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.insightsInfo}>
            <Text style={styles.insightsTitle}>
              Career Insights
            </Text>

            <Text style={styles.insightsDescription}>
              View your employability score, career recommendations,
              skills analysis and AI-powered career insights.
            </Text>

            <Text style={styles.insightsButton}>
              View Career Insights →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Grid */}
        <View style={styles.grid}>

          {/* Mentor Students */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/alumni/mentor-students')}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="school-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Mentor Students
            </Text>

            <Text style={styles.actionDescription}>
              Guide students with your experience.
            </Text>

            <Text style={styles.cardLink}>
              Mentor Students →
            </Text>
          </TouchableOpacity>

          {/* Career Roadmap */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/alumni/career-roadmap')}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="map-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Career Roadmap
            </Text>

            <Text style={styles.actionDescription}>
              Plan your professional growth and track your career journey.
            </Text>

            <Text style={styles.cardLink}>
              View Roadmap →
            </Text>
          </TouchableOpacity>

          {/* Share Experience */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/alumni/share-experience')}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name="share-social-outline"
                size={21}
                color="#1769AA"
              />
            </View>

            <Text style={styles.actionTitle}>
              Share Experience
            </Text>

            <Text style={styles.actionDescription}>
              Share advice and career knowledge.
            </Text>

            <Text style={styles.cardLink}>
              Share Your Story →
            </Text>
          </TouchableOpacity>

        </View>

        {/* What's Happening */}
        <Text style={styles.sectionTitle}>
          What's Happening
        </Text>

        {/* Career Insight Update */}
        <TouchableOpacity
          style={styles.updateCard}
          onPress={() => router.push('/alumni/career-insights')}
          activeOpacity={0.8}
        >
          <View style={styles.updateIcon}>
            <Ionicons
              name="sparkles-outline"
              size={22}
              color="#1769AA"
            />
          </View>

          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>
              Career Insight Available
            </Text>

            <Text style={styles.updateDescription}>
              Your latest career recommendations are ready to review.
            </Text>

            <Text style={styles.updateLink}>
              View Insights →
            </Text>
          </View>
        </TouchableOpacity>

        {/* New Opportunities */}
        <TouchableOpacity
          style={styles.updateCard}
          onPress={() => router.push('/alumni/opportunities')}
          activeOpacity={0.8}
        >
          <View style={styles.updateIcon}>
            <Ionicons
              name="briefcase-outline"
              size={22}
              color="#1769AA"
            />
          </View>

          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>
              New Opportunities Available
            </Text>

            <Text style={styles.updateDescription}>
              Explore opportunities that match your professional interests.
            </Text>

            <Text style={styles.updateLink}>
              Explore Jobs →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Community */}
        <Text style={styles.sectionTitle}>
          CareerForge Community
        </Text>

        <View style={styles.communityCard}>
          <Text style={styles.communityTitle}>
            Support the next generation
          </Text>

          <Text style={styles.communityDescription}>
            Connect with students, provide mentorship, share your career
            experience and help graduates become more employable.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/alumni/networking')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Connect With Students
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Opportunities */}
        <Text style={styles.sectionTitle}>
          Recommended Opportunities
        </Text>

        <View style={styles.opportunityCard}>
          <View style={styles.opportunityInfo}>
            <Text style={styles.opportunityTitle}>
              Explore Opportunities
            </Text>

            <Text style={styles.opportunityDescription}>
              Find opportunities that match your professional interests.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => router.push('/alumni/opportunities')}
            activeOpacity={0.8}
          >
            <Text style={styles.smallButtonText}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>

        {/* Home */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/alumni/dashboard')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIcon, styles.activeNavIcon]}>
            <Ionicons
              name="home"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <Text style={[styles.navLabel, styles.activeNavLabel]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Opportunities */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/alumni/opportunities')}
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="briefcase-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Jobs
          </Text>
        </TouchableOpacity>

        {/* My Applications */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/alumni/my-applications')}
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="document-text-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Applications
          </Text>
        </TouchableOpacity>

        {/* Networking */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/alumni/networking')}
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="people-outline"
              size={22}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            My Network
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/alumni/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="person-outline"
              size={21}
              color="#667085"
            />
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 115,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 15,
    color: '#667085',
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 22,
  },

  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D92D20',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Sections */

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 14,
    marginTop: 4,
  },

  /* Career Journey */

  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  journeyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  journeyHeaderText: {
    flex: 1,
  },

  journeyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  journeySubtitle: {
    fontSize: 12,
    color: '#667085',
  },

  journeyDescription: {
    fontSize: 13,
    color: '#526579',
    lineHeight: 19,
    marginBottom: 18,
  },

  journeyStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    paddingVertical: 15,
    marginBottom: 15,
  },

  journeyStat: {
    flex: 1,
    alignItems: 'center',
  },

  journeyStatValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1769AA',
    marginBottom: 4,
  },

  journeyStatLabel: {
    fontSize: 10,
    color: '#667085',
    textAlign: 'center',
  },

  journeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
  },

  journeyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1769AA',
  },

  /* Career Growth */

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  progressSubtitle: {
    fontSize: 12,
    color: '#667085',
  },

  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1769AA',
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#E8EDF3',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 18,
  },

  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#1769AA',
    borderRadius: 5,
  },

  progressItems: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDF3',
  },

  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  progressItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
  },

  progressItemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
  },

  /* Career Insights */

  insightsCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  insightsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  insightsInfo: {
    flex: 1,
  },

  insightsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 5,
  },

  insightsDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#40566F',
  },

  insightsButton: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
    marginTop: 9,
  },

  /* Quick Actions */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    minHeight: 175,
    elevation: 2,
  },

  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  actionDescription: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 17,
  },

  cardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1769AA',
    marginTop: 12,
  },

  /* What's Happening */

  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  updateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  updateInfo: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 4,
  },

  updateDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#667085',
  },

  updateLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1769AA',
    marginTop: 7,
  },

  /* Community */

  communityCard: {
    backgroundColor: '#EAF3FB',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  communityTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 8,
  },

  communityDescription: {
    fontSize: 14,
    color: '#526579',
    lineHeight: 21,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Opportunities */

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },

  opportunityInfo: {
    marginBottom: 5,
  },

  opportunityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 6,
  },

  opportunityDescription: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 19,
    marginBottom: 15,
  },

  smallButton: {
    backgroundColor: '#1769AA',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Logout */

  logoutButton: {
    borderWidth: 1,
    borderColor: '#D92D20',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  logoutText: {
    color: '#D92D20',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Bottom Navigation */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingBottom: 6,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  activeNavIcon: {
    backgroundColor: '#0B1F3A',
  },

  navLabel: {
    fontSize: 10,
    color: '#667085',
    fontWeight: '600',
  },

  activeNavLabel: {
    color: '#0B1F3A',
    fontWeight: '800',
  },
});