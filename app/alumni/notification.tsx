import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';

export default function Notifications() {
  const notifications = [
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

  const handleNotificationPress = (notification: any) => {
    if (notification.type === 'opportunity') {
      router.push('/opportunities');
    } else if (notification.type === 'mentor') {
      router.push('/mentor-students');
    } else if (notification.type === 'profile') {
      router.push('/profile');
    }
  };

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

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity>
          <Text style={styles.markText}>Mark all</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Notifications */}
        <Text style={styles.sectionTitle}>Today</Text>

        {notifications
          .filter((notification) => notification.time !== 'Yesterday')
          .map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.unread && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {notification.type === 'opportunity'
                    ? '💼'
                    : notification.type === 'profile'
                    ? '👤'
                    : notification.type === 'career'
                    ? '🚀'
                    : notification.type === 'mentor'
                    ? '🤝'
                    : '🔔'}
                </Text>
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>

                  {notification.unread && (
                    <View style={styles.unreadDot} />
                  )}
                </View>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <Text style={styles.time}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}

        {/* Earlier Notifications */}
        <Text style={styles.sectionTitle}>Earlier</Text>

        {notifications
          .filter((notification) => notification.time === 'Yesterday')
          .map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationCard}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {notification.type === 'opportunity'
                    ? '💼'
                    : notification.type === 'profile'
                    ? '👤'
                    : notification.type === 'career'
                    ? '🚀'
                    : notification.type === 'mentor'
                    ? '🤝'
                    : '🔔'}
                </Text>
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <Text style={styles.time}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}

        {/* Bottom spacing */}
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

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#202124',
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

  bottomSpace: {
    height: 30,
  },
});