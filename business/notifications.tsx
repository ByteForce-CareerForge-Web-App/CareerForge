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
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS_KEY =
  'careerforge_business_notifications';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type:
    | 'application'
    | 'opportunity'
    | 'candidate'
    | 'system';
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
          ? {
              ...notification,
              read: true,
            }
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
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'application':
        return 'document-text-outline';

      case 'opportunity':
        return 'briefcase-outline';

      case 'candidate':
        return 'person-outline';

      case 'system':
        return 'settings-outline';

      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (
    type: Notification['type']
  ) => {
    switch (type) {
      case 'application':
        return '#2563EB';

      case 'opportunity':
        return '#B88A17';

      case 'candidate':
        return '#059669';

      case 'system':
        return '#64748B';

      default:
        return '#2563EB';
    }
  };

  const getIconBackground = (
    type: Notification['type']
  ) => {
    switch (type) {
      case 'application':
        return '#EFF6FF';

      case 'opportunity':
        return '#FFFBEB';

      case 'candidate':
        return '#ECFDF5';

      case 'system':
        return '#F1F5F9';

      default:
        return '#EFF6FF';
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) => !notification.read
    ).length;

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
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
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerEyebrow}>
              BUSINESS ACTIVITY
            </Text>

            <Text style={styles.headerTitle}>
              Notifications
            </Text>

            <Text style={styles.headerSubtitle}>
              Stay updated with your latest activity
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#FFFFFF"
            />

            {unreadCount > 0 && (
              <View
                style={styles.headerUnreadDot}
              />
            )}
          </View>
        </View>

        <View style={styles.headerAccent} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.summaryTextContainer}
            >
              <Text style={styles.summaryTitle}>
                Business Notifications
              </Text>

              <Text style={styles.summarySubtitle}>
                Important updates about your business activity.
              </Text>
            </View>
          </View>

          <View style={styles.countContainer}>
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
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color="#2563EB"
              />

              <Text style={styles.markAllText}>
                Mark all as read
              </Text>
            </Pressable>

            <Pressable
              style={styles.clearButton}
              onPress={clearAllNotifications}
            >
              <Ionicons
                name="trash-outline"
                size={15}
                color="#DC2626"
              />

              <Text style={styles.clearText}>
                Clear all
              </Text>
            </Pressable>
          </View>
        )}

        {/* SECTION HEADER */}
        {notifications.length > 0 && (
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Recent Activity
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your latest business updates
              </Text>
            </View>

            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {notifications.length}
              </Text>
            </View>
          </View>
        )}

        {/* NOTIFICATIONS */}
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={30}
                color="#64748B"
              />
            </View>

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
              <Ionicons
                name="grid-outline"
                size={16}
                color="#FFFFFF"
              />

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
                  {/* TYPE ICON */}
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          getIconBackground(
                            notification.type
                          ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getIcon(
                        notification.type
                      )}
                      size={21}
                      color={getIconColor(
                        notification.type
                      )}
                    />
                  </View>

                  {/* CONTENT */}
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
                        numberOfLines={1}
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

                    <View
                      style={
                        styles.timeRow
                      }
                    >
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color="#94A3B8"
                      />

                      <Text
                        style={
                          styles.notificationTime
                        }
                      >
                        {notification.time}
                      </Text>
                    </View>
                  </View>

                  {/* DELETE */}
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
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#94A3B8"
                    />
                  </Pressable>
                </Pressable>
              )
            )}
          </View>
        )}

        {/* INFO */}
        {notifications.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Notification Updates
              </Text>

              <Text style={styles.infoText}>
                You'll receive notifications about
                new applications, candidate matches,
                opportunity approvals and important
                business updates.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#9FB3CC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 3,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    position: 'relative',
  },

  headerUnreadDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4A72C',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: '#0B1F3A',
  },

  headerAccent: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 14,
    marginLeft: 54,
  },

  /* CONTENT */

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryTextContainer: {
    flex: 1,
  },

  summaryTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
  },

  summarySubtitle: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4,
  },

  countContainer: {
    minWidth: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  countText: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '900',
  },

  countLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    marginTop: -1,
  },

  /* ACTIONS */

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 21,
  },

  markAllButton: {
    minHeight: 40,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  markAllText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },

  clearButton: {
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  clearText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 3,
  },

  totalBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0ECFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  totalBadgeText: {
    color: '#1E4B7A',
    fontSize: 11,
    fontWeight: '900',
  },

  /* NOTIFICATION CARD */

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 7,
    elevation: 1,
  },

  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FBFDFF',
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
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
    color: '#0B1F3A',
    fontSize: 13.5,
    fontWeight: '800',
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 7,
  },

  notificationMessage: {
    color: '#475569',
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 5,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  notificationTime: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginLeft: 4,
  },

  deleteButton: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },

  emptyIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },

  dashboardButton: {
    minHeight: 43,
    backgroundColor: '#2563EB',
    borderRadius: 11,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* INFO */

  infoCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 15,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#1D4ED8',
    fontSize: 12.5,
    fontWeight: '800',
  },

  infoText: {
    color: '#475569',
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },
});