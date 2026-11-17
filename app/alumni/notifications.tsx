import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
  is_read: boolean;
  read_at?: string | null;
};

type NotificationsResponse = {
  success: boolean;
  message?: string;
  data?: {
    notifications?: Array<{
      id: number;
      type: string;
      message: string;
      read_at?: string | null;
      is_read?: boolean;
    }>;
    unread_count?: number;
  };
};

function getNotificationTitle(type: string): string {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType.includes('opportunity') ||
    normalizedType.includes('job')
  ) {
    return 'New Opportunity Available';
  }

  if (
    normalizedType.includes('connection') ||
    normalizedType.includes('mentor')
  ) {
    return 'New Connection Activity';
  }

  if (normalizedType.includes('profile')) {
    return 'Profile Update';
  }

  if (
    normalizedType.includes('career') ||
    normalizedType.includes('roadmap')
  ) {
    return 'Career Update';
  }

  if (normalizedType.includes('application')) {
    return 'Application Update';
  }

  if (normalizedType.includes('reminder')) {
    return 'CareerForgeAI Reminder';
  }

  return 'CareerForge Notification';
}

function getNotificationTime(
  readAt: string | null | undefined
): string {
  if (!readAt) {
    return 'Recently';
  }

  const notificationDate = new Date(
    readAt.replace(' ', 'T')
  );

  if (Number.isNaN(notificationDate.getTime())) {
    return 'Recently';
  }

  const now = new Date();

  const difference =
    now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes !== 1 ? 's' : ''
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours !== 1 ? 's' : ''
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return notificationDate.toLocaleDateString();
}

function getIcon(type: string) {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType.includes('opportunity') ||
    normalizedType.includes('job')
  ) {
    return '💼';
  }

  if (
    normalizedType.includes('connection') ||
    normalizedType.includes('mentor')
  ) {
    return '🤝';
  }

  if (normalizedType.includes('profile')) {
    return '👤';
  }

  if (
    normalizedType.includes('career') ||
    normalizedType.includes('roadmap')
  ) {
    return '🚀';
  }

  if (normalizedType.includes('application')) {
    return '📄';
  }

  if (normalizedType.includes('reminder')) {
    return '⏰';
  }

  return '🔔';
}

function getNavigationType(type: string) {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType.includes('opportunity') ||
    normalizedType.includes('job')
  ) {
    return 'opportunity';
  }

  if (normalizedType.includes('connection')) {
    return 'networking';
  }

  if (normalizedType.includes('mentor')) {
    return 'mentor';
  }

  if (normalizedType.includes('profile')) {
    return 'profile';
  }

  if (
    normalizedType.includes('career') ||
    normalizedType.includes('roadmap')
  ) {
    return 'career';
  }

  if (normalizedType.includes('application')) {
    return 'application';
  }

  return 'other';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] =
    useState<number>(0);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [processing, setProcessing] =
    useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications.php`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawResponse = await response.text();

      let result: NotificationsResponse;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Notifications API returned non-JSON:',
          rawResponse
        );

        throw new Error(
          `Server returned an invalid response. HTTP ${response.status}`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to load notifications.'
        );
      }

      const backendNotifications =
        result.data?.notifications || [];

      const mappedNotifications: Notification[] =
        backendNotifications.map(
          (notification) => ({
            id: Number(notification.id),
            title: getNotificationTitle(
              notification.type
            ),
            message: notification.message,
            time: getNotificationTime(
              notification.read_at
            ),
            type: notification.type,
            is_read:
              notification.is_read === true ||
              !!notification.read_at,
            read_at:
              notification.read_at || null,
          })
        );

      setNotifications(mappedNotifications);

      const backendUnreadCount =
        result.data?.unread_count;

      if (
        typeof backendUnreadCount === 'number'
      ) {
        setUnreadCount(backendUnreadCount);
      } else {
        setUnreadCount(
          mappedNotifications.filter(
            (notification) =>
              !notification.is_read
          ).length
        );
      }
    } catch (error) {
      console.log(
        'Error loading notifications:',
        error
      );

      Alert.alert(
        'Unable to Load Notifications',
        'We could not retrieve your notifications from CareerForge. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  async function markAsRead(id: number) {
    try {
      const notification =
        notifications.find(
          (item) => item.id === id
        );

      if (!notification || notification.is_read) {
        return;
      }

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        return;
      }

      setProcessing(true);

      const response = await fetch(
        `${API_BASE_URL}/notifications.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notification_id: id,
          }),
        }
      );

      const rawResponse = await response.text();

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Mark notification response:',
          rawResponse
        );

        throw new Error(
          'Server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to mark notification as read.'
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: true,
                read_at:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.log(
        'Error marking notification as read:',
        error
      );
    } finally {
      setProcessing(false);
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        return;
      }

      setProcessing(true);

      const response = await fetch(
        `${API_BASE_URL}/notifications.php`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'mark_all_read',
          }),
        }
      );

      const rawResponse = await response.text();

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Mark all notifications response:',
          rawResponse
        );

        throw new Error(
          'Server returned an invalid response.'
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to mark all notifications as read.'
        );
      }

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at:
            notification.read_at || now,
        }))
      );

      setUnreadCount(0);

      Alert.alert(
        'Notifications Updated',
        'All notifications have been marked as read.'
      );
    } catch (error) {
      console.log(
        'Error marking all notifications:',
        error
      );

      Alert.alert(
        'Unable to Update',
        'We could not mark all notifications as read. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  }

  function handleNotificationPress(
    notification: Notification
  ) {
    markAsRead(notification.id);

    const navigationType =
      getNavigationType(notification.type);

    if (navigationType === 'opportunity') {
      router.push('/alumni/opportunities');
    } else if (
      navigationType === 'networking'
    ) {
      router.push('/alumni/networking');
    } else if (
      navigationType === 'mentor'
    ) {
      router.push('/alumni/mentor-students');
    } else if (
      navigationType === 'profile'
    ) {
      router.push('/alumni/profile');
    } else if (
      navigationType === 'career'
    ) {
      router.push('/alumni/career-roadmap');
    } else if (
      navigationType === 'application'
    ) {
      router.push('/alumni/my-applications');
    }
  }

  function renderNotification(
    notification: Notification
  ) {
    const isUnread = !notification.is_read;

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          isUnread && styles.unreadCard,
        ]}
        onPress={() =>
          handleNotificationPress(
            notification
          )
        }
        activeOpacity={0.7}
        disabled={processing}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {getIcon(notification.type)}
          </Text>
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle}>
              {notification.title}
            </Text>

            {isUnread && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>

          <Text style={styles.time}>
            {notification.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const todayNotifications =
    notifications.filter(
      (notification) =>
        notification.time !== 'Yesterday'
    );

  const earlierNotifications =
    notifications.filter(
      (notification) =>
        notification.time === 'Yesterday'
    );

  const hasNotifications =
    notifications.length > 0;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={markAllAsRead}
          disabled={
            unreadCount === 0 ||
            processing
          }
        >
          <Text
            style={[
              styles.markText,
              (unreadCount === 0 ||
                processing) &&
                styles.disabledMarkText,
            ]}
          >
            Mark all
          </Text>
        </TouchableOpacity>

      </View>

      {/* Notification List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator
              size="large"
              color="#5B3FD1"
            />

            <Text style={styles.loadingText}>
              Loading notifications...
            </Text>
          </View>
        ) : (
          <>
            {/* Unread Summary */}
            {unreadCount > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>
                  🔔
                </Text>

                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>
                    {unreadCount} unread notification
                    {unreadCount !== 1
                      ? 's'
                      : ''}
                  </Text>

                  <Text style={styles.summaryText}>
                    Tap a notification to mark it
                    as read.
                  </Text>
                </View>
              </View>
            )}

            {/* Today */}
            {todayNotifications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Today
                </Text>

                {todayNotifications.map(
                  renderNotification
                )}
              </>
            )}

            {/* Earlier */}
            {earlierNotifications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Earlier
                </Text>

                {earlierNotifications.map(
                  renderNotification
                )}
              </>
            )}

            {/* Empty State */}
            {!hasNotifications && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>
                  ✓
                </Text>

                <Text style={styles.emptyTitle}>
                  No notifications yet
                </Text>

                <Text style={styles.emptyText}>
                  You're all caught up! New
                  CareerForge activity will appear
                  here.
                </Text>
              </View>
            )}

            {/* All Read State */}
            {hasNotifications &&
              unreadCount === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>
                    ✓
                  </Text>

                  <Text style={styles.emptyTitle}>
                    You're all caught up!
                  </Text>

                  <Text style={styles.emptyText}>
                    You have read all your
                    notifications.
                  </Text>
                </View>
              )}

            <View style={styles.bottomSpace} />
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EF',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#5B3FD1',
    marginTop: -5,
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#202124',
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#5B3FD1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  markText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B3FD1',
  },

  disabledMarkText: {
    color: '#B5B5C2',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  summaryCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4C1D95',
  },

  summaryText: {
    fontSize: 12,
    color: '#6D28D9',
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#202124',
    marginTop: 22,
    marginBottom: 10,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEEEF4',
  },

  unreadCard: {
    backgroundColor: '#F3F0FF',
    borderColor: '#E4DEFF',
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 22,
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
    flex: 1,
  },

  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: '#686875',
    marginTop: 5,
  },

  time: {
    fontSize: 11,
    color: '#9999A5',
    marginTop: 7,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#5B3FD1',
    marginLeft: 8,
  },

  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  loadingText: {
    fontSize: 13,
    color: '#777784',
    marginTop: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DCFCE7',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 30,
    color: '#16A34A',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#202124',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#777784',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 19,
  },

  bottomSpace: {
    height: 30,
  },
});
