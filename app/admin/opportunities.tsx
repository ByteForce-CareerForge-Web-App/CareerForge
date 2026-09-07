import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

type OpportunityStatus = 'Pending' | 'Approved' | 'Rejected';

type Opportunity = {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  type: string;
  status: OpportunityStatus;
  posted: string;
  description: string;
};

const STORAGE_KEY = 'careerforge_admin_opportunities';

const defaultOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Junior Data Analyst',
    company: 'TechNova Solutions',
    category: 'Data Science',
    location: 'Durban, KZN',
    type: 'Full-time',
    status: 'Pending',
    posted: '2 Sep 2026',
    description:
      'Entry-level opportunity for graduates interested in data analysis, reporting and business intelligence.',
  },
  {
    id: '2',
    title: 'Software Developer Intern',
    company: 'DataEdge Analytics',
    category: 'Technology',
    location: 'Johannesburg, Gauteng',
    type: 'Internship',
    status: 'Pending',
    posted: '2 Sep 2026',
    description:
      'Software development internship focused on web and mobile application development.',
  },
  {
    id: '3',
    title: 'Business Analyst Graduate',
    company: 'FutureTech Africa',
    category: 'Business',
    location: 'Cape Town, Western Cape',
    type: 'Graduate',
    status: 'Approved',
    posted: '1 Sep 2026',
    description:
      'Graduate position supporting business analysis, requirements gathering and process improvement.',
  },
  {
    id: '4',
    title: 'Cybersecurity Intern',
    company: 'SecureNet Africa',
    category: 'Cybersecurity',
    location: 'Pretoria, Gauteng',
    type: 'Internship',
    status: 'Pending',
    posted: '31 Aug 2026',
    description:
      'Internship for students and graduates interested in cybersecurity operations and risk management.',
  },
  {
    id: '5',
    title: 'Digital Marketing Assistant',
    company: 'BrightMedia',
    category: 'Marketing',
    location: 'Remote',
    type: 'Part-time',
    status: 'Approved',
    posted: '30 Aug 2026',
    description:
      'Marketing opportunity involving social media, content creation and digital campaigns.',
  },
  {
    id: '6',
    title: 'Junior Project Coordinator',
    company: 'Innovate Group',
    category: 'Project Management',
    location: 'Durban, KZN',
    type: 'Full-time',
    status: 'Rejected',
    posted: '29 Aug 2026',
    description:
      'Entry-level project coordination role supporting project planning, reporting and administration.',
  },
  {
    id: '7',
    title: 'AI Research Assistant',
    company: 'AI Labs Africa',
    category: 'Artificial Intelligence',
    location: 'Remote',
    type: 'Internship',
    status: 'Pending',
    posted: '28 Aug 2026',
    description:
      'Research assistant opportunity focusing on artificial intelligence and machine learning projects.',
  },
];

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const loadOpportunities = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setOpportunities(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultOpportunities)
        );
        setOpportunities(defaultOpportunities);
      }
    } catch (error) {
      console.log('Error loading opportunities:', error);
      setOpportunities(defaultOpportunities);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOpportunities();
    }, [loadOpportunities])
  );

  const saveOpportunities = async (updated: Opportunity[]) => {
    setOpportunities(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateStatus = (
    opportunity: Opportunity,
    newStatus: OpportunityStatus
  ) => {
    const action = newStatus === 'Approved' ? 'approve' : 'reject';

    Alert.alert(
      `${newStatus} Opportunity`,
      `Are you sure you want to ${action} "${opportunity.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: newStatus,
          style: newStatus === 'Rejected' ? 'destructive' : 'default',
          onPress: async () => {
            const updated = opportunities.map((item) =>
              item.id === opportunity.id
                ? { ...item, status: newStatus }
                : item
            );

            await saveOpportunities(updated);
          },
        },
      ]
    );
  };

  const deleteOpportunity = (opportunity: Opportunity) => {
    Alert.alert(
      'Remove Opportunity',
      `Are you sure you want to remove "${opportunity.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = opportunities.filter(
              (item) => item.id !== opportunity.id
            );

            await saveOpportunities(updated);
          },
        },
      ]
    );
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchText) ||
      opportunity.company.toLowerCase().includes(searchText) ||
      opportunity.category.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === 'All' || opportunity.status === filter;

    return matchesSearch && matchesFilter;
  });

  const total = opportunities.length;
  const pending = opportunities.filter(
    (item) => item.status === 'Pending'
  ).length;
  const approved = opportunities.filter(
    (item) => item.status === 'Approved'
  ).length;
  const rejected = opportunities.filter(
    (item) => item.status === 'Rejected'
  ).length;

  const getStatusColor = (status: OpportunityStatus) => {
    if (status === 'Approved') return '#16A34A';
    if (status === 'Rejected') return '#DC2626';
    return '#D97706';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/admin/dashboard');
              }
            }}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Opportunity Management</Text>
            <Text style={styles.headerSubtitle}>
              Review and manage platform opportunities
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search opportunities..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Opportunities</Text>
          <Text style={styles.resultCount}>
            {filteredOpportunities.length} found
          </Text>
        </View>

        {filteredOpportunities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No opportunities found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <View key={opportunity.id} style={styles.opportunityCard}>
              {/* Top */}
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>💼</Text>
                </View>

                <View style={styles.titleContainer}>
                  <Text style={styles.opportunityTitle}>
                    {opportunity.title}
                  </Text>

                  <Text style={styles.companyName}>
                    {opportunity.company}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      borderColor: getStatusColor(opportunity.status),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: getStatusColor(opportunity.status),
                      },
                    ]}
                  >
                    {opportunity.status}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🏷️</Text>
                  <Text style={styles.detailText}>
                    {opportunity.category}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>
                    {opportunity.location}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <Text style={styles.detailText}>
                    {opportunity.type}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={styles.detailText}>
                    Posted {opportunity.posted}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                {opportunity.description}
              </Text>

              {/* Actions */}
              <View style={styles.actions}>
                {opportunity.status === 'Pending' && (
                  <>
                    <Pressable
                      style={styles.approveButton}
                      onPress={() =>
                        updateStatus(opportunity, 'Approved')
                      }
                    >
                      <Text style={styles.approveText}>✓ Approve</Text>
                    </Pressable>

                    <Pressable
                      style={styles.rejectButton}
                      onPress={() =>
                        updateStatus(opportunity, 'Rejected')
                      }
                    >
                      <Text style={styles.rejectText}>✕ Reject</Text>
                    </Pressable>
                  </>
                )}

                {opportunity.status === 'Rejected' && (
                  <Pressable
                    style={styles.approveButton}
                    onPress={() =>
                      updateStatus(opportunity, 'Approved')
                    }
                  >
                    <Text style={styles.approveText}>
                      ✓ Approve
                    </Text>
                  </Pressable>
                )}

                {opportunity.status === 'Approved' && (
                  <Pressable
                    style={styles.rejectButton}
                    onPress={() =>
                      updateStatus(opportunity, 'Rejected')
                    }
                  >
                    <Text style={styles.rejectText}>
                      ✕ Reject
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.removeButton}
                  onPress={() => deleteOpportunity(opportunity)}
                >
                  <Text style={styles.removeText}>🗑 Remove</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 16,
    gap: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 24,
    color: '#64748B',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },

  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  filterButtonActive: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  resultCount: {
    fontSize: 12,
    color: '#64748B',
  },

  opportunityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  iconText: {
    fontSize: 20,
  },

  titleContainer: {
    flex: 1,
    paddingRight: 6,
  },

  opportunityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  companyName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  detailsContainer: {
    marginTop: 14,
    gap: 7,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 24,
    fontSize: 13,
  },

  detailText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 12,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },

  approveButton: {
    flex: 1,
    backgroundColor: '#0B1F3A',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  approveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  rejectButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  rejectText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  removeButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  removeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
});