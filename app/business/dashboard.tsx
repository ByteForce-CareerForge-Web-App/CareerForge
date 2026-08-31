import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';

export default function BusinessDashboard() {
  const stats = [
    {
      label: 'Active Opportunities',
      value: '4',
      icon: '💼',
    },
    {
      label: 'Total Applications',
      value: '229',
      icon: '📋',
    },
    {
      label: 'Shortlisted',
      value: '18',
      icon: '⭐',
    },
    {
      label: 'Interviews',
      value: '6',
      icon: '🗓️',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.companyAvatar}>
            <Text style={styles.avatarText}>AT</Text>
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.greeting}>
              Good morning 👋
            </Text>

            <Text style={styles.companyName}>
              ABC Technologies
            </Text>
          </View>

          <View style={styles.notification}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.headerTitle}>
          Business Dashboard
        </Text>

        <Text style={styles.headerSubtitle}>
          47 new applications this week.
        </Text>
      </View>

      <View style={styles.content}>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View style={styles.statCard} key={stat.label}>
              <View style={styles.statIcon}>
                <Text style={{ fontSize: 22 }}>
                  {stat.icon}
                </Text>
              </View>

              <Text style={styles.statValue}>
                {stat.value}
              </Text>

              <Text style={styles.statLabel}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>

            <ActionButton
              icon="➕"
              title="Post Opportunity"
              onPress={() =>
                router.push('/business/post-opportunity')
              }
            />

            <ActionButton
              icon="📋"
              title="Manage Jobs"
              onPress={() =>
                router.push('/business/manage-opportunities')
              }
            />

            <ActionButton
              icon="👥"
              title="View Candidates"
              onPress={() =>
                router.push('/business/candidates')
              }
            />

            <ActionButton
              icon="🏢"
              title="Company Profile"
              onPress={() =>
                router.push('/business/company-profile')
              }
            />

          </View>
        </View>

        {/* Recent Applications */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Applications
            </Text>

            <Pressable
              onPress={() =>
                router.push('/business/applications')
              }
            >
              <Text style={styles.seeAll}>
                See all
              </Text>
            </Pressable>
          </View>

          <CandidateRow
            initials="SD"
            name="Sipho Dlamini"
            title="Graduate Data Analyst"
            match="94%"
          />

          <CandidateRow
            initials="NZ"
            name="Nomvula Zulu"
            title="Graduate Data Analyst"
            match="91%"
          />

          <CandidateRow
            initials="LK"
            name="Lethiwe Khumalo"
            title="Junior Frontend Developer"
            match="87%"
          />
        </View>

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>
            ✨ AI Hiring Insight
          </Text>

          <Text style={styles.aiText}>
            You have 94 unreviewed applications. Sipho
            Dlamini (94% match) is your top candidate for
            the Graduate Data Analyst role.
          </Text>

          <Pressable
            style={styles.aiButton}
            onPress={() =>
              router.push('/business/candidates')
            }
          >
            <Text style={styles.aiButtonText}>
              Review Candidates
            </Text>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}

function ActionButton({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionButton}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>
        {icon}
      </Text>

      <Text style={styles.actionText}>
        {title}
      </Text>
    </Pressable>
  );
}

function CandidateRow({
  initials,
  name,
  title,
  match,
}: {
  initials: string;
  name: string;
  title: string;
  match: string;
}) {
  return (
    <View style={styles.candidateRow}>
      <View style={styles.candidateAvatar}>
        <Text style={styles.avatarText}>
          {initials}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.candidateName}>
          {name}
        </Text>

        <Text style={styles.candidateTitle}>
          {title}
        </Text>
      </View>

      <Text style={styles.match}>
        {match}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  companyAvatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  companyInfo: {
    marginLeft: 12,
    flex: 1,
  },

  greeting: {
    color: '#C7D2FE',
    fontSize: 12,
  },

  companyName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },

  notification: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#FB7185',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 25,
  },

  headerSubtitle: {
    color: '#A5B4FC',
    fontSize: 14,
    marginTop: 5,
  },

  content: {
    padding: 20,
    marginTop: -10,
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
    marginBottom: 12,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statValue: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionButton: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  actionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  seeAll: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },

  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  candidateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  candidateName: {
    fontWeight: '600',
    color: '#0F172A',
    fontSize: 14,
  },

  candidateTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },

  match: {
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },

  aiCard: {
    backgroundColor: '#4338CA',
    borderRadius: 18,
    padding: 18,
    marginBottom: 30,
  },

  aiTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  aiText: {
    color: '#C7D2FE',
    fontSize: 13,
    lineHeight: 20,
  },

  aiButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6366F1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});