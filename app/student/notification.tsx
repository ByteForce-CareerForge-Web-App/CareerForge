import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'careerforge_notifications';

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'New Opportunity Available',
    message:
      'A new Software Developer internship has been posted that matches your profile.',
    time: '10 minutes ago',
    type: 'opportunity',
    unread: true,
  },
  {
    id: 2,
    title: 'Profile Update',
    message:
      'Your profile is 85% complete. Add your skills to improve your opportunity matches.',
    time: '1 hour ago',
    type: 'profile',
    unread: true,
  },
  {
    id: 3,
    title: 'Career Roadmap Updated',
    message:
      'Your AI Career Roadmap has been updated based on your latest profile information.',
    time: '3 hours ago',
    type: 'career',
    unread: false,
  },
  {
    id: 4,
    title: 'New Mentor Connection',
    message:
      'You have a new mentor recommendation available.',
    time: 'Yesterday',
    type: 'mentor',
    unread: false,
  },
  {
    id: 5,
    title: 'CareerForgeAI Reminder',
    message:
      'Complete your employability assessment to receive your latest employability score.',
    time: 'Yesterday',
    type: 'reminder',
    unread: false,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);

      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);

        await AsyncStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(DEFAULT_NOTIFICATIONS)
        );
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  };

  const saveNotifications = async (
    updatedNotifications: Notification[]
  ) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );

      setNotifications(updatedNotifications);
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  const handleNotificationPress = async (
    notification: Notification
  ) => {
    if (notification.unread) {
      const updatedNotifications = notifications.map((item) =>
        item.id === notification.id
          ? { ...item, unread: false }
          : item
      );

      await saveNotifications(updatedNotifications);
    }

    if (notification.type === 'opportunity') {
      router.push('/student/opportunities');
    } else if (notification.type === 'profile') {
      router.push('/student/profile');
    } else if (notification.type === 'career') {
      router.push('/student/career-roadmap');
    }
  };

  const handleMarkAll = async () => {
    const hasUnread = notifications.some(
      (notification) => notification.unread
    );

    if (!hasUnread) {
      Alert.alert(
        'Notifications',
        'All notifications are already marked as read.'
      );
      return;
    }

    const updatedNotifications = notifications.map(
      (notification) => ({
        ...notification,
        unread: false,
      })
    );

    await saveNotifications(updatedNotifications);

    Alert.alert(
      'Notifications Updated',
      'All notifications have been marked as read.'
    );
  };

  const getIcon = (type: string) => {
    if (type === 'opportunity') {
      return '💼';
    }

    if (type === 'profile') {
      return '👤';
    }

    if (type === 'career') {
      return '🚀';
    }

    if (type === 'mentor') {
      return '🤝';
    }

    return '🔔';
  };

  const todayNotifications = notifications.filter(
    (notification) => notification.time !== 'Yesterday'
  );

  const earlierNotifications = notifications.filter(
    (notification) => notification.time === 'Yesterday'
  );

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleMarkAll}
          activeOpacity={0.7}
        >
          <Text style={styles.markText}>
            Mark all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {todayNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Today
            </Text>

            {todayNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread && styles.unreadCard,
                ]}
                onPress={() =>
                  handleNotificationPress(notification)
                }
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    {getIcon(notification.type)}
                  </Text>
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.unread &&
                          styles.readTitle,
                      ]}
                    >
                      {notification.title}
                    </Text>

                    {notification.unread && (
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
            ))}
          </>
        )}

        {earlierNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Earlier
            </Text>

            {earlierNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread && styles.unreadCard,
                ]}
                onPress={() =>
                  handleNotificationPress(notification)
                }
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    {getIcon(notification.type)}
                  </Text>
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.unread &&
                          styles.readTitle,
                      ]}
                    >
                      {notification.title}
                    </Text>

                    {notification.unread && (
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
            ))}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              🔔
            </Text>

            <Text style={styles.emptyTitle}>
              No Notifications
            </Text>

            <Text style={styles.emptyText}>
              You're all caught up!
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
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#202124',
  },

  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#5B3FD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
    paddingHorizontal: 5,
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  markText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B3FD1',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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

  readTitle: {
    fontWeight: '600',
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

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202124',
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
  },

  bottomSpace: {
    height: 30,
  },
});