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

type ApprovalType = 'Business' | 'Alumni' | 'Student';
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

type Approval = {
  id: string;
  name: string;
  type: ApprovalType;
  description: string;
  date: string;
  status: ApprovalStatus;
};

const APPROVALS_STORAGE_KEY = 'careerforge_admin_approvals';

const DEFAULT_APPROVALS: Approval[] = [
  {
    id: 'business-1',
    name: 'TechNova Solutions',
    type: 'Business',
    description: 'Business registration and company verification',
    date: '3 September 2026',
    status: 'Pending',
  },
  {
    id: 'business-2',
    name: 'DataEdge Analytics',
    type: 'Business',
    description: 'Business registration and company verification',
    date: '2 September 2026',
    status: 'Pending',
  },
  {
    id: 'business-3',
    name: 'FutureTech Africa',
    type: 'Business',
    description: 'Business registration and company verification',
    date: '1 September 2026',
    status: 'Pending',
  },
  {
    id: 'alumni-1',
    name: 'Amanda Naidoo',
    type: 'Alumni',
    description: 'Degree certificate verification',
    date: '3 September 2026',
    status: 'Pending',
  },
  {
    id: 'alumni-2',
    name: 'Jason Pillay',
    type: 'Alumni',
    description: 'Degree certificate verification',
    date: '2 September 2026',
    status: 'Pending',
  },
  {
    id: 'alumni-3',
    name: 'Priya Singh',
    type: 'Alumni',
    description: 'Degree certificate verification',
    date: '1 September 2026',
    status: 'Approved',
  },
  {
    id: 'student-1',
    name: 'Daniel Mokoena',
    type: 'Student',
    description: 'Student number and registration verification',
    date: '3 September 2026',
    status: 'Pending',
  },
  {
    id: 'student-2',
    name: 'Leah Williams',
    type: 'Student',
    description: 'Student number and registration verification',
    date: '2 September 2026',
    status: 'Pending',
  },
  {
    id: 'student-3',
    name: 'Ryan Govender',
    type: 'Student',
    description: 'Student number and registration verification',
    date: '31 August 2026',
    status: 'Rejected',
  },
];

export default function AdminApprovals() {
  const [approvals, setApprovals] =
    useState<Approval[]>(DEFAULT_APPROVALS);

  const [selectedFilter, setSelectedFilter] =
    useState<'All' | ApprovalType | ApprovalStatus>('All');

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadApprovals();
    }, [])
  );

  async function loadApprovals() {
    try {
      const stored = await AsyncStorage.getItem(
        APPROVALS_STORAGE_KEY
      );

      if (stored) {
        setApprovals(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          APPROVALS_STORAGE_KEY,
          JSON.stringify(DEFAULT_APPROVALS)
        );

        setApprovals(DEFAULT_APPROVALS);
      }
    } catch (error) {
      console.log('Error loading approvals:', error);
    }
  }

  async function updateApproval(
    id: string,
    status: ApprovalStatus
  ) {
    try {
      const updatedApprovals = approvals.map((approval) =>
        approval.id === id
          ? { ...approval, status }
          : approval
      );

      setApprovals(updatedApprovals);

      await AsyncStorage.setItem(
        APPROVALS_STORAGE_KEY,
        JSON.stringify(updatedApprovals)
      );

      const approval = approvals.find(
        (item) => item.id === id
      );

      if (approval) {
        Alert.alert(
          status === 'Approved'
            ? 'Approved'
            : 'Rejected',
          `${approval.name} has been ${status.toLowerCase()}.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to update the approval.'
      );
    }
  }

  function handleApprove(approval: Approval) {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve ${approval.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () =>
            updateApproval(
              approval.id,
              'Approved'
            ),
        },
      ]
    );
  }

  function handleReject(approval: Approval) {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject ${approval.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            updateApproval(
              approval.id,
              'Rejected'
            ),
        },
      ]
    );
  }

  const filteredApprovals = approvals.filter(
    (approval) => {
      const matchesSearch =
        approval.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        approval.type
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        approval.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        selectedFilter === 'All' ||
        approval.type === selectedFilter ||
        approval.status === selectedFilter;

      return matchesSearch && matchesFilter;
    }
  );

  const pendingCount = approvals.filter(
    (approval) => approval.status === 'Pending'
  ).length;

  const approvedCount = approvals.filter(
    (approval) => approval.status === 'Approved'
  ).length;

  const rejectedCount = approvals.filter(
    (approval) => approval.status === 'Rejected'
  ).length;

  function getTypeIcon(type: ApprovalType) {
    if (type === 'Business') {
      return '🏢';
    }

    if (type === 'Alumni') {
      return '🎓';
    }

    return '👤';
  }

  function getStatusStyle(status: ApprovalStatus) {
    if (status === 'Approved') {
      return styles.approvedBadge;
    }

    if (status === 'Rejected') {
      return styles.rejectedBadge;
    }

    return styles.pendingBadge;
  }

  function getStatusTextStyle(status: ApprovalStatus) {
    if (status === 'Approved') {
      return styles.approvedText;
    }

    if (status === 'Rejected') {
      return styles.rejectedText;
    }

    return styles.pendingText;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
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
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Verification & Approvals
            </Text>

            <Text style={styles.headerSubtitle}>
              Review and manage platform verification requests
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⏳</Text>

            <Text style={styles.summaryValue}>
              {pendingCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✅</Text>

            <Text style={styles.summaryValue}>
              {approvedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Approved
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>❌</Text>

            <Text style={styles.summaryValue}>
              {rejectedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Rejected
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
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
          {[
            'All',
            'Pending',
            'Business',
            'Alumni',
            'Student',
            'Approved',
            'Rejected',
          ].map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter &&
                  styles.filterButtonSelected,
              ]}
              onPress={() =>
                setSelectedFilter(
                  filter as
                    | 'All'
                    | ApprovalType
                    | ApprovalStatus
                )
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                    styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results heading */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Verification Requests
          </Text>

          <Text style={styles.resultsCount}>
            {filteredApprovals.length} requests
          </Text>
        </View>

        {/* Approval Cards */}
        {filteredApprovals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔍
            </Text>

            <Text style={styles.emptyTitle}>
              No requests found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredApprovals.map((approval) => (
            <View
              key={approval.id}
              style={styles.approvalCard}
            >
              {/* Top */}
              <View style={styles.cardTop}>
                <View style={styles.typeIcon}>
                  <Text style={styles.typeIconText}>
                    {getTypeIcon(approval.type)}
                  </Text>
                </View>

                <View style={styles.nameContainer}>
                  <Text style={styles.name}>
                    {approval.name}
                  </Text>

                  <Text style={styles.type}>
                    {approval.type} Verification
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(
                      approval.status
                    ),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusTextStyle(
                        approval.status
                      ),
                    ]}
                  >
                    {approval.status}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                {approval.description}
              </Text>

              {/* Date */}
              <Text style={styles.date}>
                Submitted: {approval.date}
              </Text>

              {/* Buttons */}
              {approval.status === 'Pending' && (
                <View style={styles.buttonRow}>
                  <Pressable
                    style={styles.rejectButton}
                    onPress={() =>
                      handleReject(approval)
                    }
                  >
                    <Text style={styles.rejectButtonText}>
                      Reject
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.approveButton}
                    onPress={() =>
                      handleApprove(approval)
                    }
                  >
                    <Text style={styles.approveButtonText}>
                      ✓ Approve
                    </Text>
                  </Pressable>
                </View>
              )}

              {approval.status !== 'Pending' && (
                <View style={styles.completedRow}>
                  <Text
                    style={[
                      styles.completedText,
                      approval.status === 'Approved'
                        ? styles.approvedText
                        : styles.rejectedText,
                    ]}
                  >
                    {approval.status === 'Approved'
                      ? '✓ Verification approved'
                      : '✕ Verification rejected'}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* Back to Dashboard */}
        <Pressable
          style={styles.dashboardButton}
          onPress={() =>
            router.replace('/admin/dashboard')
          }
        >
          <Text style={styles.dashboardButtonText}>
            ← Back to Admin Dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backText: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '700',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C7D4E3',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  summaryCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  summaryIcon: {
    fontSize: 21,
    marginBottom: 5,
  },

  summaryValue: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },

  searchContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 13,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  filterContainer: {
    paddingBottom: 5,
  },

  filterButton: {
    paddingHorizontal: 15,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  filterButtonSelected: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  resultsHeader: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultsTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  resultsCount: {
    color: '#64748B',
    fontSize: 12,
  },

  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  typeIconText: {
    fontSize: 24,
  },

  nameContainer: {
    flex: 1,
  },

  name: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  type: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  approvedBadge: {
    backgroundColor: '#DCFCE7',
  },

  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  pendingText: {
    color: '#A16207',
  },

  approvedText: {
    color: '#15803D',
  },

  rejectedText: {
    color: '#B91C1C',
  },

  description: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  date: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 7,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 9,
  },

  rejectButton: {
    flex: 1,
    height: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },

  approveButton: {
    flex: 1,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  completedRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  completedText: {
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E1EA',
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  dashboardButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  dashboardButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },
});