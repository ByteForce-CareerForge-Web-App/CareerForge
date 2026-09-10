import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const NOTIFICATIONS_KEY = 'careerforge_business_notifications';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'application' | 'opportunity' | 'candidate' | 'system';
  read: boolean;
};

const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Application',
    message:
      'Sipho Dlamini applied for the Graduate Data Analyst position.',
    time: '10 minutes ago',
    type: 'application',
    read: false,
  },
  {
    id: '2',
    title: 'New Application',
    message:
      'Nomvula Zulu applied for the Graduate Data Analyst position.',
    time: '1 hour ago',
    type: 'application',
    read: false,
  },
  {
    id: '3',
    title: 'Candidate Shortlisted',
    message:
      'Lethiwe Khumalo has been shortlisted for your Junior Frontend Developer position.',
    time: '3 hours ago',
    type: 'candidate',
    read: true,
  },
  {
    id: '4',
    title: 'Opportunity Approved',
    message:
      'Your Graduate Data Analyst opportunity has been approved and is now live.',
    time: 'Yesterday',
    type: 'opportunity',
    read: true,
  },
  {
    id: '5',
    title: 'New Candidate Match',
    message:
      'CareerForgeAI found 5 candidates matching your latest opportunity.',
    time: 'Yesterday',
    type: 'candidate',
    read: true,
  },
  {
    id: '6',
    title: 'Profile Reminder',
    message:
      'Complete your company profile to improve candidate trust and visibility.',
    time: '2 days ago',
    type: 'system',
    read: true,
  },
];

export default function BusinessNotificationsScreen() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        NOTIFICATIONS_KEY
      );

      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications(defaultNotifications);

        await AsyncStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(defaultNotifications)
        );
      }
    } catch (error) {
      console.log(
        'Error loading notifications:',
        error
      );
    }
  };

  const saveNotifications = async (
    updated: Notification[]
  ) => {
    try {
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

  const markAsRead = async (id: string) => {
    const updated = notifications.map(
      (notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
    );

    setNotifications(updated);
    await saveNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    setNotifications(updated);
    await saveNotifications(updated);

    Alert.alert(
      'Notifications Updated',
      'All notifications have been marked as read.'
    );
  };

  const deleteNotification = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated =
              notifications.filter(
                (notification) =>
                  notification.id !== id
              );

            setNotifications(updated);
            await saveNotifications(updated);
          },
        },
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setNotifications([]);
            await saveNotifications([]);
          },
        },
      ]
    );
  };

  const getIcon = (
    type: Notification['type']
  ) => {
    switch (type) {
      case 'application':
        return '📋';

      case 'opportunity':
        return '💼';

      case 'candidate':
        return '👤';

      case 'system':
        return '⚙️';

      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
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
              router.replace(
                '/business/dashboard'
              );
            }
          }}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>
              Business Notifications
            </Text>

            <Text style={styles.summarySubtitle}>
              Stay updated with your business activity.
            </Text>
          </View>

          <View style={styles.countCircle}>
            <Text style={styles.countText}>
              {unreadCount}
            </Text>

            <Text style={styles.countLabel}>
              unread
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        {notifications.length > 0 && (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>
                ✓ Mark all as read
              </Text>
            </Pressable>

            <Pressable
              style={styles.clearButton}
              onPress={clearAllNotifications}
            >
              <Text style={styles.clearText}>
                Clear all
              </Text>
            </Pressable>
          </View>
        )}

        {/* NOTIFICATIONS */}
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔔
            </Text>

            <Text style={styles.emptyTitle}>
              No Notifications
            </Text>

            <Text style={styles.emptyText}>
              You're all caught up. New business
              activity will appear here.
            </Text>

            <Pressable
              style={styles.dashboardButton}
              onPress={() =>
                router.replace(
                  '/business/dashboard'
                )
              }
            >
              <Text
                style={
                  styles.dashboardButtonText
                }
              >
                Back to Dashboard
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {notifications.map(
              (notification) => (
                <Pressable
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read &&
                      styles.unreadCard,
                  ]}
                  onPress={() =>
                    markAsRead(
                      notification.id
                    )
                  }
                >
                  <View
                    style={[
                      styles.iconContainer,
                      !notification.read &&
                        styles.unreadIconContainer,
                    ]}
                  >
                    <Text
                      style={
                        styles.notificationIcon
                      }
                    >
                      {getIcon(
                        notification.type
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.notificationContent
                    }
                  >
                    <View
                      style={
                        styles.titleRow
                      }
                    >
                      <Text
                        style={
                          styles.notificationTitle
                        }
                      >
                        {notification.title}
                      </Text>

                      {!notification.read && (
                        <View
                          style={
                            styles.unreadDot
                          }
                        />
                      )}
                    </View>

                    <Text
                      style={
                        styles.notificationMessage
                      }
                    >
                      {notification.message}
                    </Text>

                    <Text
                      style={
                        styles.notificationTime
                      }
                    >
                      {notification.time}
                    </Text>
                  </View>

                  <Pressable
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteNotification(
                        notification.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                </Pressable>
              )
            )}
          </View>
        )}

        {/* INFO */}
        {notifications.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              🔔 Notification Updates
            </Text>

            <Text style={styles.infoText}>
              You'll receive notifications about
              new applications, candidate matches,
              opportunity approvals and important
              business updates.
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
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  headerSpacer: {
    width: 55,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  summaryCard: {
    backgroundColor: '#0D1B3E',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  summarySubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 5,
    maxWidth: 220,
    lineHeight: 18,
  },

  countCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  countLabel: {
    color: '#DBEAFE',
    fontSize: 8,
    marginTop: -2,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  markAllButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  markAllText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  clearText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  unreadIconContainer: {
    backgroundColor: '#DBEAFE',
  },

  notificationIcon: {
    fontSize: 20,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 5,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },

  notificationMessage: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  notificationTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 7,
  },

  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    color: '#94A3B8',
    fontSize: 23,
    fontWeight: '300',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 5,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 18,
  },

  dashboardButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 16,
    marginTop: 5,
  },

  infoTitle: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },

  infoText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
});