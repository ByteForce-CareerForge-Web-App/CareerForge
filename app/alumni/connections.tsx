import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_READ_KEY =
  'careerforge_alumni_notifications_read';

const notificationsData = [
  {
    id: 1,
    title: 'New Opportunity Available',
    message:
      'A new Software Developer internship has been posted that matches your profile.',
    time: '10 minutes ago',
    type: 'opportunity',
  },
  {
    id: 2,
    title: 'Profile Update',
    message:
      'Your profile is 85% complete. Add your skills to improve your opportunity matches.',
    time: '1 hour ago',
    type: 'profile',
  },
  {
    id: 3,
    title: 'Career Roadmap Updated',
    message:
      'Your AI Career Roadmap has been updated based on your latest profile information.',
    time: '3 hours ago',
    type: 'career',
  },
  {
    id: 4,
    title: 'New Mentor Connection',
    message:
      'You have a new mentor recommendation available.',
    time: 'Yesterday',
    type: 'mentor',
  },
  {
    id: 5,
    title: 'CareerForgeAI Reminder',
    message:
      'Complete your employability assessment to receive your latest employability score.',
    time: 'Yesterday',
    type: 'reminder',
  },
];

export default function Notifications() {
  const [readNotifications, setReadNotifications] = useState<number[]>(
    []
  );

  useEffect(() => {
    loadReadNotifications();
  }, []);

  async function loadReadNotifications() {
    try {
      const stored = await AsyncStorage.getItem(
        NOTIFICATIONS_READ_KEY
      );

      if (stored) {
        setReadNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading notification status:', error);
    }
  }

  async function markAsRead(id: number) {
    try {
      if (readNotifications.includes(id)) {
        return;
      }

      const updated = [...readNotifications, id];

      setReadNotifications(updated);

      await AsyncStorage.setItem(
        NOTIFICATIONS_READ_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const allIds = notificationsData.map(
        (notification) => notification.id
      );

      setReadNotifications(allIds);

      await AsyncStorage.setItem(
        NOTIFICATIONS_READ_KEY,
        JSON.stringify(allIds)
      );

      Alert.alert(
        'Notifications Updated',
        'All notifications have been marked as read.'
      );
    } catch (error) {
      console.log('Error marking all notifications:', error);
    }
  }

  function handleNotificationPress(notification: any) {
    markAsRead(notification.id);

    if (notification.type === 'opportunity') {
      router.push('/alumni/opportunities');
    } else if (notification.type === 'mentor') {
      router.push('/alumni/mentor-students');
    } else if (notification.type === 'profile') {
      router.push('/alumni/profile');
    } else if (notification.type === 'career') {
      router.push('/alumni/career-roadmap');
    }
  }

  function getIcon(type: string) {
    if (type === 'opportunity') return '💼';
    if (type === 'profile') return '👤';
    if (type === 'career') return '🚀';
    if (type === 'mentor') return '🤝';
    return '🔔';
  }

  const unreadCount = notificationsData.filter(
    (notification) => !readNotifications.includes(notification.id)
  ).length;

  const todayNotifications = notificationsData.filter(
    (notification) => notification.time !== 'Yesterday'
  );

  const earlierNotifications = notificationsData.filter(
    (notification) => notification.time === 'Yesterday'
  );

  function renderNotification(notification: any) {
    const isUnread = !readNotifications.includes(notification.id);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          isUnread && styles.unreadCard,
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
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

            {isUnread && <View style={styles.unreadDot} />}
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
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markText,
              unreadCount === 0 && styles.disabledMarkText,
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

        {/* Unread Summary */}
        {unreadCount > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🔔</Text>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                {unreadCount} unread notification
                {unreadCount !== 1 ? 's' : ''}
              </Text>

              <Text style={styles.summaryText}>
                Tap a notification to mark it as read.
              </Text>
            </View>
          </View>
        )}

        {/* Today */}
        <Text style={styles.sectionTitle}>
          Today
        </Text>

        {todayNotifications.map(renderNotification)}

        {/* Earlier */}
        <Text style={styles.sectionTitle}>
          Earlier
        </Text>

        {earlierNotifications.map(renderNotification)}

        {/* Empty State */}
        {unreadCount === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>

            <Text style={styles.emptyTitle}>
              You're all caught up!
            </Text>

            <Text style={styles.emptyText}>
              You have read all your notifications.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />

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

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
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
  },

  emptyText: {
    fontSize: 13,
    color: '#777784',
    marginTop: 5,
  },

  bottomSpace: {
    height: 30,
  },
});