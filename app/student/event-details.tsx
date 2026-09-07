import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';

const MY_EVENTS_KEY = 'careerforge_my_events';

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();

  const title = String(params.title || 'Career Event');
  const type = String(params.type || 'Event');
  const date = String(params.date || 'Date TBC');
  const time = String(params.time || 'Time TBC');
  const location = String(params.location || 'Location TBC');
  const description = String(
    params.description || 'Join this event and grow your career network.'
  );

  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_EVENTS_KEY);
      const events = stored ? JSON.parse(stored) : [];

      const exists = events.some(
        (event: any) =>
          event.title === title &&
          event.date === date
      );

      setRegistered(exists);
    } catch (error) {
      console.log('Check registration error:', error);
    }
  };

  const registerForEvent = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_EVENTS_KEY);
      const events = stored ? JSON.parse(stored) : [];

      const alreadyRegistered = events.some(
        (event: any) =>
          event.title === title &&
          event.date === date
      );

      if (alreadyRegistered) {
        Alert.alert(
          'Already Registered',
          'You are already registered for this event.'
        );
        return;
      }

      const newEvent = {
        id: Date.now().toString(),
        title,
        type,
        date,
        time,
        location,
        description,
      };

      await AsyncStorage.setItem(
        MY_EVENTS_KEY,
        JSON.stringify([...events, newEvent])
      );

      setRegistered(true);

      Alert.alert(
        'Registration Successful 🎉',
        `You are registered for ${title}.`
      );
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while registering.'
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/events');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Event Details</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Event Header */}
      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>📅</Text>
        </View>

        <Text style={styles.type}>{type}</Text>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      {/* Event Information */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Event Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>⏰</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{time}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{location}</Text>
          </View>
        </View>
      </View>

      {/* What to Expect */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          What to Expect
        </Text>

        <Text style={styles.bullet}>✓ Meet industry professionals</Text>
        <Text style={styles.bullet}>✓ Build your professional network</Text>
        <Text style={styles.bullet}>✓ Learn about career opportunities</Text>
        <Text style={styles.bullet}>✓ Improve your employability</Text>
      </View>

      {/* Register Button */}
      <Pressable
        style={[
          styles.registerButton,
          registered && styles.registeredButton,
        ]}
        onPress={registerForEvent}
      >
        <Text style={styles.registerButtonText}>
          {registered ? '✓ Registered' : 'Register for Event'}
        </Text>
      </Pressable>

      {registered && (
        <Pressable
          style={styles.myEventsButton}
          onPress={() => router.push('/student/my-events')}
        >
          <Text style={styles.myEventsText}>
            View My Events
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    height: 90,
    backgroundColor: '#0B1F3A',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 40,
  },

  heroCard: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 25,
    paddingBottom: 30,
    alignItems: 'center',
  },

  iconCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  icon: {
    fontSize: 34,
  },

  type: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    opacity: 0.9,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  infoIcon: {
    fontSize: 22,
    width: 42,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    color: '#7A869A',
    fontSize: 12,
    marginBottom: 3,
  },

  infoValue: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
  },

  bullet: {
    color: '#344054',
    fontSize: 15,
    marginBottom: 12,
  },

  registerButton: {
    backgroundColor: '#0B1F3A',
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  registeredButton: {
    backgroundColor: '#1F7A4D',
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  myEventsButton: {
    marginHorizontal: 18,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#0B1F3A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  myEventsText: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
  },
});