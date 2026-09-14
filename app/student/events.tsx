import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
        selectedType === 'All' || event.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlowOne} />
        <View style={styles.headerGlowTwo} />

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
          <Ionicons
            name="chevron-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerEyebrow}>CAREERFORGE</Text>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSubtitle}>
            Discover events that grow your career
          </Text>
        </View>

        <View style={styles.headerCalendar}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color="#FFFFFF"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* Filter */}
        <View style={styles.filterHeader}>
          <View>
            <Text style={styles.filterEyebrow}>DISCOVER</Text>
            <Text style={styles.filterTitle}>Event Type</Text>
          </View>

          <View style={styles.filterCount}>
            <Text style={styles.filterCountText}>
              {filteredEvents.length}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {eventTypes.map((type) => (
            <Pressable
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type)}
            >
              {selectedType === type && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="#FFFFFF"
                  style={styles.filterCheck}
                />
              )}

              <Text
                style={[
                  styles.filterText,
                  selectedType === type && styles.filterTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              CAREER OPPORTUNITIES
            </Text>
            <Text style={styles.sectionTitle}>
              Upcoming Events
            </Text>
          </View>

          <View style={styles.eventCountBadge}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#2457E6"
            />
            <Text style={styles.eventCount}>
              {filteredEvents.length}
            </Text>
          </View>
        </View>

        {/* Events */}
        {filteredEvents.map((event, index) => (
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
            <View style={styles.cardAccent} />

            <View style={styles.eventTopRow}>
              <View style={styles.eventIconOuter}>
                <View style={styles.eventIconContainer}>
                  <Ionicons
                    name={
                      event.type === 'Networking'
                        ? 'people-outline'
                        : event.type === 'Workshop'
                        ? 'school-outline'
                        : event.type === 'Career Talk'
                        ? 'mic-outline'
                        : 'briefcase-outline'
                    }
                    size={23}
                    color={
                      index % 3 === 0
                        ? '#2457E6'
                        : index % 3 === 1
                        ? '#2878C8'
                        : '#173FBD'
                    }
                  />
                </View>
              </View>

              <View style={styles.eventMainInfo}>
                <View style={styles.typeBadge}>
                  <View style={styles.typeDot} />
                  <Text style={styles.typeBadgeText}>
                    {event.type}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>
                  {event.title}
                </Text>
              </View>

              <View style={styles.arrowBox}>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#2457E6"
                />
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#2457E6"
                  />
                </View>
                <Text style={styles.infoText}>
                  {event.date}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#2878C8"
                  />
                </View>
                <Text style={styles.infoText}>
                  {event.time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#173FBD"
                  />
                </View>
                <Text
                  style={styles.infoText}
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
            </View>

            <Text
              style={styles.description}
              numberOfLines={2}
            >
              {event.description}
            </Text>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>
                View Event
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#2457E6"
              />
            </View>
          </Pressable>
        ))}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="calendar-outline"
                  size={35}
                  color="#2457E6"
                />
              </View>
            </View>

            <Text style={styles.emptyTitle}>
              No events found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or event category.
            </Text>

            {(search.length > 0 || selectedType !== 'All') && (
              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setSearch('');
                  setSelectedType('All');
                }}
              >
                <Text style={styles.resetButtonText}>
                  Clear Filters
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  header: {
    backgroundColor: '#102A72',
    paddingTop: 46,
    paddingBottom: 19,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  headerGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76,125,255,0.18)',
    top: -90,
    right: -35,
  },

  headerGlowTwo: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(36,87,230,0.22)',
    bottom: -70,
    left: -30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#AFC4FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#D8E3FF',
    fontSize: 11,
    marginTop: 3,
  },

  headerCalendar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(76,125,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  searchContainer: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#172A55',
    fontSize: 14,
    paddingVertical: 8,
  },

  clearButton: {
    padding: 6,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  filterEyebrow: {
    color: '#4C6FD8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 2,
  },

  filterTitle: {
    color: '#172A55',
    fontSize: 16,
    fontWeight: '800',
  },

  filterCount: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#E4ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCountText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  filterRow: {
    paddingBottom: 21,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5F2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
    elevation: 2,
  },

  filterCheck: {
    marginRight: 4,
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
    marginBottom: 13,
  },

  sectionEyebrow: {
    color: '#4C6FD8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 19,
    fontWeight: '800',
  },

  eventCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },

  eventCount: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E9F5',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#173FBD',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    position: 'relative',
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2457E6',
  },

  eventTopRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  eventIconOuter: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  eventIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },

  eventMainInfo: {
    flex: 1,
    paddingTop: 1,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4ECFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4C7DFF',
    marginRight: 5,
  },

  typeBadgeText: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  eventTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },

  arrowBox: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  infoGrid: {
    backgroundColor: '#F7F9FD',
    borderRadius: 13,
    padding: 10,
    marginBottom: 11,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoRowLast: {
    marginBottom: 0,
  },

  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  infoText: {
    color: '#475569',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },

  description: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 13,
  },

  viewButton: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  viewButtonText: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 25,
  },

  emptyIconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E4ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#172A55',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 19,
  },

  resetButton: {
    marginTop: 17,
    backgroundColor: '#2457E6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
