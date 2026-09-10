import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useEffect, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';

type Business = {
  user_id: number;
  name: string;
  email: string;
  role: string;
  profile_id: number;
  company_name: string;
  registration_number: string;
  website: string | null;
  industry: string;
  description: string;
  verification_status: string | null;
};

export default function BusinessDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        setError('You are not logged in.');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/profiles/business.php`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to load business profile'
        );
      }

      setBusiness(result.data);
    } catch (err) {
      console.error('Business profile error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load business profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (companyName: string) => {
    const words = companyName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>
          Loading business dashboard...
        </Text>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.errorText}>
          {error || 'Business information could not be found.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadBusinessProfile}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

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
            <Text style={styles.avatarText}>
              {getInitials(business.company_name)}
            </Text>
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.greeting}>
              Good morning 👋
            </Text>

            <Text
              style={styles.companyName}
              numberOfLines={1}
            >
              {business.company_name}
            </Text>
          </View>

          <View style={styles.notification}>
            <Text style={{ fontSize: 20 }}>
              🔔
            </Text>

            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.headerTitle}>
          Business Dashboard
        </Text>

        <Text style={styles.headerSubtitle}>
          Welcome back, {business.company_name}.
        </Text>
      </View>

      <View style={styles.content}>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View
              style={styles.statCard}
              key={stat.label}
            >
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
