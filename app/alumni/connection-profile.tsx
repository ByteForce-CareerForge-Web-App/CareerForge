import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

export default function ConnectionProfileScreen() {
  const params = useLocalSearchParams<{
    personId?: string;
    initials?: string;
    name?: string;
    role?: string;
    company?: string;
  }>();

  const personId = params.personId || 'connection';
  const initials = params.initials || 'CF';
  const name = params.name || 'Professional Connection';
  const role = params.role || 'Professional';
  const company = params.company || 'CareerForge Network';

  const handleMessage = () => {
    router.push({
      pathname: '/alumni/chat',
      params: {
        personId,
        initials,
        name,
        role,
        company,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Connection Profile
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <Text style={styles.name}>
            {name}
          </Text>

          <Text style={styles.role}>
            {role}
          </Text>

          <Text style={styles.company}>
            {company}
          </Text>

          <View style={styles.connectionBadge}>
            <Text style={styles.connectionBadgeText}>
              Connected
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                M
              </Text>
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                Message
              </Text>

              <Text style={styles.actionSubtitle}>
                Start a professional conversation
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryIcon}>
              <Text style={styles.secondaryIconText}>
                N
              </Text>
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                View Network
              </Text>

              <Text style={styles.actionSubtitle}>
                Explore professional connections
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Professional Information
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Role
              </Text>

              <Text style={styles.infoValue}>
                {role}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Organisation
              </Text>

              <Text style={styles.infoValue}>
                {company}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Network Status
              </Text>

              <Text style={styles.connectedText}>
                Connected
              </Text>
            </View>
          </View>
        </View>

        {/* Networking Message */}
        <View style={styles.infoBanner}>
          <Text style={styles.bannerTitle}>
            Build meaningful connections
          </Text>

          <Text style={styles.bannerText}>
            Use CareerForgeAI to connect with
            professionals, exchange knowledge,
            and grow your career network.
          </Text>
        </View>

        {/* Back */}
        <TouchableOpacity
          style={styles.backDashboardButton}
          onPress={() =>
            router.replace('/alumni/dashboard')
          }
          activeOpacity={0.8}
        >
          <Text style={styles.backDashboardText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
  },

  backText: {
    fontSize: 34,
    color: '#0B1F3A',
    fontWeight: '300',
    marginTop: -3,
  },

  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  headerSpacer: {
    width: 42,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 18,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E7EEF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#1769AA',
    fontSize: 25,
    fontWeight: '800',
  },

  name: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0B1F3A',
    textAlign: 'center',
  },

  role: {
    fontSize: 14,
    color: '#1769AA',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },

  company: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
    textAlign: 'center',
  },

  connectionBadge: {
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EAF6EF',
  },

  connectionBadgeText: {
    color: '#2E7D52',
    fontSize: 11,
    fontWeight: '700',
  },

  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 16,
    elevation: 2,
    marginBottom: 22,
  },

  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  actionIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  secondaryIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  secondaryIconText: {
    color: '#1769AA',
    fontSize: 16,
    fontWeight: '800',
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#667085',
    marginTop: 4,
  },

  arrow: {
    fontSize: 27,
    color: '#98A2B3',
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EDF3',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 11,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 17,
    elevation: 2,
  },

  infoRow: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    flex: 1,
    fontSize: 12,
    color: '#667085',
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
    textAlign: 'right',
  },

  connectedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D52',
    textAlign: 'right',
  },

  infoBanner: {
    backgroundColor: '#EAF3FB',
    borderRadius: 17,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D5E7F5',
  },

  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1F3A',
    marginBottom: 6,
  },

  bannerText: {
    fontSize: 12,
    color: '#526579',
    lineHeight: 18,
  },

  backDashboardButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  backDashboardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});