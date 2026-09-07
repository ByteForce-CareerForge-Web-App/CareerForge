import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'careerforge_admin_notifications';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'Platform' | 'Users' | 'Opportunities' | 'Verification';
  time: string;
  active: boolean;
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to CareerForgeAI',
    message:
      'Welcome to the CareerForgeAI platform. Start building your career today.',
    type: 'Platform',
    time: 'Today',
    active: true,
  },
  {
    id: '2',
    title: 'New Business Verification',
    message:
      'TechNova Solutions has submitted a new business verification request.',
    type: 'Verification',
    time: '10 minutes ago',
    active: true,
  },
  {
    id: '3',
    title: 'New Opportunity Available',
    message:
      'A new Junior Data Analyst opportunity has been posted.',
    type: 'Opportunities',
    time: '1 hour ago',
    active: true,
  },
  {
    id: '4',
    title: 'Alumni Verification Required',
    message:
      'An alumni certificate is waiting for administrator review.',
    type: 'Verification',
    time: '2 hours ago',
    active: true,
  },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    []
  );

  const [search, setSearch] = useState('');

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(
        NOTIFICATIONS_KEY
      );

      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(DEFAULT_NOTIFICATIONS)
        );

        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch (error) {
      console.log(
        'Error loading notifications:',
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const saveNotifications = async (
    updated: Notification[]
  ) => {
    try {
      setNotifications(updated);

      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log(
        'Error saving notifications:',
        error
      );
    }
  };

  const toggleNotification = (
    notification: Notification
  ) => {
    const updated = notifications.map((item) =>
      item.id === notification.id
        ? {
            ...item,
            active: !item.active,
          }
        : item
    );

    saveNotifications(updated);
  };

  const deleteNotification = (
    notification: Notification
  ) => {
    Alert.alert(
      'Delete Notification',
      `Delete "${notification.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = notifications.filter(
              (item) => item.id !== notification.id
            );

            await saveNotifications(updated);
          },
        },
      ]
    );
  };

  const createNotification = () => {
    Alert.alert(
      'Create Notification',
      'Notification creation will be connected to the backend later.'
    );
  };

  const filteredNotifications =
    notifications.filter((notification) => {
      const searchText = search.toLowerCase();

      return (
        notification.title
          .toLowerCase()
          .includes(searchText) ||
        notification.message
          .toLowerCase()
          .includes(searchText) ||
        notification.type
          .toLowerCase()
          .includes(searchText)
      );
    });

  const activeCount = notifications.filter(
    (notification) => notification.active
  ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
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

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage platform notifications
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* SUMMARY */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              🔔
            </Text>

            <Text style={styles.summaryValue}>
              {notifications.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              ✅
            </Text>

            <Text style={styles.summaryValue}>
              {activeCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Active
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              📢
            </Text>

            <Text style={styles.summaryValue}>
              {notifications.length - activeCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Inactive
            </Text>
          </View>
        </View>

        {/* CREATE */}
        <Pressable
          style={styles.createButton}
          onPress={createNotification}
        >
          <Text style={styles.createButtonText}>
            + Create Notification
          </Text>
        </Pressable>

        {/* SEARCH */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notifications..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />

        {/* SECTION */}
        <Text style={styles.sectionTitle}>
          Platform Notifications
        </Text>

        {filteredNotifications.map(
          (notification) => (
            <View
              key={notification.id}
              style={styles.notificationCard}
            >
              <View style={styles.notificationTop}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.iconText}>
                    {notification.type ===
                    'Verification'
                      ? '✅'
                      : notification.type ===
                        'Opportunities'
                      ? '💼'
                      : notification.type ===
                        'Users'
                      ? '👥'
                      : '🔔'}
                  </Text>
                </View>

                <View style={styles.notificationInfo}>
                  <Text
                    style={styles.notificationTitle}
                  >
                    {notification.title}
                  </Text>

                  <Text
                    style={styles.notificationType}
                  >
                    {notification.type}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    notification.active
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      notification.active
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {notification.active
                      ? 'Active'
                      : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.notificationMessage}
              >
                {notification.message}
              </Text>

              <Text style={styles.notificationTime}>
                {notification.time}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    notification.active
                      ? styles.disableButton
                      : styles.enableButton,
                  ]}
                  onPress={() =>
                    toggleNotification(
                      notification
                    )
                  }
                >
                  <Text
                    style={[
                      styles.actionText,
                      notification.active
                        ? styles.disableText
                        : styles.enableText,
                    ]}
                  >
                    {notification.active
                      ? 'Disable'
                      : 'Enable'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                  onPress={() =>
                    deleteNotification(
                      notification
                    )
                  }
                >
                  <Text
                    style={[
                      styles.actionText,
                      styles.deleteText,
                    ]}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        )}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔎
            </Text>

            <Text style={styles.emptyTitle}>
              No notifications found
            </Text>

            <Text style={styles.emptyText}>
              Try a different search.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0F172A',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -4,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 3,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  summaryIcon: {
    fontSize: 22,
    marginBottom: 5,
  },

  summaryValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },

  createButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  notificationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 22,
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  notificationType: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  inactiveBadge: {
    backgroundColor: '#F1F5F9',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  activeText: {
    color: '#15803D',
  },

  inactiveText: {
    color: '#64748B',
  },

  notificationMessage: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 13,
  },

  notificationTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 7,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  actionButton: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  enableButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  disableButton: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  enableText: {
    color: '#15803D',
  },

  disableText: {
    color: '#C2410C',
  },

  deleteText: {
    color: '#DC2626',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },
});