// @ts-nocheck

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Calendar from 'expo-calendar/legacy';

type Event = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

const events: Event[] = [
  {
    id: '1',
    title: 'Career & Graduate Opportunities Fair',
    type: 'Career Fair',
    date: '15 September 2026',
    time: '09:00 - 15:00',
    location: 'Richfield Campus',
    description:
      'Meet employers, discover graduate opportunities and connect with recruiters looking for emerging talent.',
  },
  {
    id: '2',
    title: 'CV & Interview Masterclass',
    type: 'Workshop',
    date: '18 September 2026',
    time: '10:00 - 12:00',
    location: 'CareerForgeAI Virtual',
    description:
      'Learn how to improve your CV, prepare for interviews and present your skills with confidence.',
  },
  {
    id: '3',
    title: 'Alumni Networking Session',
    type: 'Networking',
    date: '22 September 2026',
    time: '14:00 - 16:00',
    location: 'Richfield Campus',
    description:
      'Connect with successful alumni and gain practical career advice, industry insights and mentorship opportunities.',
  },
  {
    id: '4',
    title: 'AI & Data Science Careers',
    type: 'Career Talk',
    date: '25 September 2026',
    time: '13:00 - 15:00',
    location: 'CareerForgeAI Virtual',
    description:
      'Explore career opportunities in artificial intelligence, data science, analytics and emerging technology.',
  },
  {
    id: '5',
    title: 'Graduate Employability Workshop',
    type: 'Workshop',
    date: '30 September 2026',
    time: '09:30 - 11:30',
    location: 'Richfield Campus',
    description:
      'Build the professional skills employers are looking for and learn how to stand out as a graduate.',
  },
];

/**
 * Converts:
 * "15 September 2026"
 * into a usable Date object.
 */
const parseEventDate = (dateString: string) => {
  const match = dateString.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthName = match[2];
  const year = Number(match[3]);

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const monthIndex = monthNames.indexOf(
    monthName.toLowerCase(),
  );

  if (monthIndex === -1) {
    return null;
  }

  return {
    year,
    monthIndex,
    day,
  };
};

/**
 * Converts:
 * "09:00 - 15:00"
 * into start and end Date objects.
 */
const parseEventDateTime = (
  dateString: string,
  timeString: string,
) => {
  const parsedDate = parseEventDate(dateString);

  if (!parsedDate) {
    return null;
  }

  const timeMatch = timeString.match(
    /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/,
  );

  if (!timeMatch) {
    return null;
  }

  const startHour = Number(timeMatch[1]);
  const startMinute = Number(timeMatch[2]);
  const endHour = Number(timeMatch[3]);
  const endMinute = Number(timeMatch[4]);

  if (
    startHour > 23 ||
    endHour > 23 ||
    startMinute > 59 ||
    endMinute > 59
  ) {
    return null;
  }

  const startDate = new Date(
    parsedDate.year,
    parsedDate.monthIndex,
    parsedDate.day,
    startHour,
    startMinute,
    0,
    0,
  );

  const endDate = new Date(
    parsedDate.year,
    parsedDate.monthIndex,
    parsedDate.day,
    endHour,
    endMinute,
    0,
    0,
  );

  /**
   * Handles events where the end time accidentally
   * appears before the start time.
   */
  if (endDate.getTime() <= startDate.getTime()) {
    return null;
  }

  return {
    startDate,
    endDate,
  };
};

export default function EventsScreen() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const eventTypes = [
    'All',
    'Career Fair',
    'Workshop',
    'Networking',
    'Career Talk',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        `${event.title} ${event.type} ${event.location} ${event.description}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        selectedType === 'All' ||
        event.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  /**
   * Opens the REAL phone calendar.
   *
   * The user can review/edit the event and then
   * save it into their device calendar.
   */
  const addEventToPhoneCalendar = async (
    event: Event,
  ) => {
    try {
      const parsed = parseEventDateTime(
        event.date,
        event.time,
      );

      if (!parsed) {
        Alert.alert(
          'Calendar Error',
          'The event date or time could not be understood.',
        );
        return;
      }

      await Calendar.createEventInCalendarAsync(
        {
          title: event.title,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          location: event.location,
          notes: event.description,
          timeZone:
            Intl.DateTimeFormat().resolvedOptions()
              .timeZone,
        },
        {
          allowsEditing: true,
          allowsCalendarPreview: true,
        },
      );
    } catch (error) {
      console.log(
        'Unable to open phone calendar:',
        error,
      );

      Alert.alert(
        'Unable to Open Calendar',
        'CareerForgeAI could not open your phone calendar. Please try again.',
      );
    }
  };

  return (
    <View style={styles.screen}>
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
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Events
          </Text>

          <Text style={styles.headerSubtitle}>
            Discover events that grow your career
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        {/* Filter */}
        <Text style={styles.filterTitle}>
          Event Type
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          keyboardShouldPersistTaps="handled"
        >
          {eventTypes.map((type) => (
            <Pressable
              key={type}
              style={[
                styles.filterButton,
                selectedType === type &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === type &&
                    styles.filterTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upcoming Events
          </Text>

          <Text style={styles.eventCount}>
            {filteredEvents.length} events
          </Text>
        </View>

        {/* Events */}
        {filteredEvents.map((event) => (
          <View
            key={event.id}
            style={styles.eventCard}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    '/student/event-details',
                  params: {
                    title: event.title,
                    type: event.type,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    description:
                      event.description,
                  },
                })
              }
            >
              <View style={styles.eventTopRow}>
                <View
                  style={
                    styles.eventIconContainer
                  }
                >
                  <Text style={styles.eventIcon}>
                    📅
                  </Text>
                </View>

                <View style={styles.eventMainInfo}>
                  <View style={styles.typeBadge}>
                    <Text
                      style={
                        styles.typeBadgeText
                      }
                    >
                      {event.type}
                    </Text>
                  </View>

                  <Text
                    style={styles.eventTitle}
                  >
                    {event.title}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>
                  📅
                </Text>

                <Text style={styles.infoText}>
                  {event.date}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>
                  🕐
                </Text>

                <Text style={styles.infoText}>
                  {event.time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>
                  📍
                </Text>

                <Text style={styles.infoText}>
                  {event.location}
                </Text>
              </View>

              <Text
                style={styles.description}
                numberOfLines={2}
              >
                {event.description}
              </Text>
            </Pressable>

            {/* Bottom Actions */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.calendarButton}
                onPress={() =>
                  addEventToPhoneCalendar(event)
                }
              >
                <Text
                  style={
                    styles.calendarButtonIcon
                  }
                >
                  📅
                </Text>

                <Text
                  style={
                    styles.calendarButtonText
                  }
                >
                  Add to Calendar
                </Text>
              </Pressable>

              <Pressable
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname:
                      '/student/event-details',
                    params: {
                      title: event.title,
                      type: event.type,
                      date: event.date,
                      time: event.time,
                      location:
                        event.location,
                      description:
                        event.description,
                    },
                  })
                }
              >
                <Text
                  style={styles.viewButtonText}
                >
                  View Event →
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              📅
            </Text>

            <Text style={styles.emptyTitle}>
              No events found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or event category.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 30,
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
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  searchContainer: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
  },

  filterTitle: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },

  filterRow: {
    paddingBottom: 20,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filterButtonActive: {
    backgroundColor: '#0B1F3A',
    borderColor: '#0B1F3A',
  },

  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  eventCount: {
    color: '#64748B',
    fontSize: 12,
  },

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  eventTopRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAF0F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  eventIcon: {
    fontSize: 23,
  },

  eventMainInfo: {
    flex: 1,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF0F8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },

  typeBadgeText: {
    color: '#0B1F3A',
    fontSize: 10,
    fontWeight: '800',
  },

  eventTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  infoIcon: {
    width: 25,
    fontSize: 14,
  },

  infoText: {
    color: '#475569',
    fontSize: 12,
    flex: 1,
  },

  description: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 14,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },

  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  calendarButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  calendarButtonText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  viewButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
  },

  viewButtonText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});