import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const MY_EVENTS_KEY = 'careerforge_my_events';

type Event = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

export default function MyEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_EVENTS_KEY);
      const savedEvents = stored ? JSON.parse(stored) : [];
      setEvents(savedEvents);
    } catch (error) {
      console.log('Load events error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/dashboard');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>
            Events you have registered for
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Count */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>📅</Text>
          </View>

          <View>
            <Text style={styles.summaryLabel}>
              Registered Events
            </Text>

            <Text style={styles.summaryValue}>
              {events.length}
            </Text>
          </View>
        </View>

        {events.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📆</Text>

            <Text style={styles.emptyTitle}>
              No Events Yet
            </Text>

            <Text style={styles.emptyText}>
              You haven't registered for any events yet.
              Explore upcoming events and find opportunities
              to learn, connect and grow.
            </Text>

            <Pressable
              style={styles.browseButton}
              onPress={() => router.push('/student/events')}
            >
              <Text style={styles.browseButtonText}>
                Browse Events
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Upcoming Events
            </Text>

            {events.map((event) => (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  router.push({
                    pathname: '/student/event-details',
                    params: {
                      title: event.title,
                      type: event.type,
                      date: event.date,
                      time: event.time,
                      location: event.location,
                      description: event.description,
                    },
                  })
                }
              >
                <View style={styles.eventTop}>
                  <View style={styles.eventIcon}>
                    <Text style={styles.eventIconText}>📅</Text>
                  </View>

                  <View style={styles.eventMain}>
                    <Text style={styles.eventType}>
                      {event.type}
                    </Text>

                    <Text style={styles.eventTitle}>
                      {event.title}
                    </Text>
                  </View>

                  <Text style={styles.arrow}>›</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.eventInfo}>
                  <Text style={styles.infoText}>
                    📅 {event.date}
                  </Text>

                  <Text style={styles.infoText}>
                    ⏰ {event.time}
                  </Text>

                  <Text style={styles.infoText}>
                    📍 {event.location}
                  </Text>
                </View>

                <View style={styles.registeredBadge}>
                  <Text style={styles.registeredText}>
                    ✓ Registered
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
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
    marginRight: 14,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.75,
    fontSize: 12,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },

  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  summaryIconText: {
    fontSize: 25,
  },

  summaryLabel: {
    color: '#667085',
    fontSize: 13,
    marginBottom: 3,
  },

  summaryValue: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B1F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  eventIconText: {
    fontSize: 22,
  },

  eventMain: {
    flex: 1,
  },

  eventType: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  eventTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },

  arrow: {
    color: '#0B1F3A',
    fontSize: 30,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8ECF2',
    marginVertical: 15,
  },

  eventInfo: {
    gap: 8,
  },

  infoText: {
    color: '#475467',
    fontSize: 13,
  },

  registeredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
  },

  registeredText: {
    color: '#1F7A4D',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 10,
  },

  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },

  browseButton: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },

  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
