import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

export default function MentorStudents() {
  const [search, setSearch] = useState('');

  const students = [
    {
      id: 1,
      name: 'Thando Mkhize',
      qualification: 'BSc Data Science',
      year: '3rd Year',
      interests: 'Data Analytics • AI • Business Intelligence',
      location: 'Durban',
    },
    {
      id: 2,
      name: 'Lerato Ndlovu',
      qualification: 'BSc Computer Science',
      year: '2nd Year',
      interests: 'Software Development • Cloud • AI',
      location: 'Johannesburg',
    },
    {
      id: 3,
      name: 'Ayesha Khan',
      qualification: 'BSc Information Technology',
      year: '3rd Year',
      interests: 'Cybersecurity • Networking • Cloud Computing',
      location: 'Cape Town',
    },
    {
      id: 4,
      name: 'Sipho Dlamini',
      qualification: 'BCom Information Systems',
      year: '3rd Year',
      interests: 'Business Analysis • Technology • Entrepreneurship',
      location: 'Pietermaritzburg',
    },
  ];

  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase().trim();

    return (
      student.name.toLowerCase().includes(searchValue) ||
      student.qualification.toLowerCase().includes(searchValue) ||
      student.interests.toLowerCase().includes(searchValue) ||
      student.location.toLowerCase().includes(searchValue)
    );
  });

  function handleViewProfile(student: typeof students[0]) {
    Alert.alert(
      'Student Profile',
      `${student.name}\n\n` +
        `${student.qualification}\n` +
        `${student.year}\n\n` +
        `Career Interests:\n${student.interests}\n\n` +
        `Location: ${student.location}`
    );
  }

  function handleMentorship(name: string) {
    Alert.alert(
      'Mentorship Request',
      `You selected ${name} for mentorship.\n\nThis request will be connected to the backend later.`
    );
  }

  function handlePreferences() {
    Alert.alert(
      'Mentorship Preferences',
      'Your mentorship preferences screen will be connected to the backend later.'
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Mentor Students</Text>

          <Text style={styles.subtitle}>
            Help students grow through your experience.
          </Text>
        </View>
      </View>

      {/* Mentorship Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewIcon}>
          <Text style={styles.overviewIconText}>🤝</Text>
        </View>

        <View style={styles.overviewInfo}>
          <Text style={styles.overviewTitle}>
            Make an Impact
          </Text>

          <Text style={styles.overviewDescription}>
            Share your professional experience, provide guidance,
            and help students prepare for successful careers.
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Mentees</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      {/* Search */}
      <Text style={styles.sectionTitle}>
        Find Students
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search students, skills or qualifications..."
        placeholderTextColor="#94A3B8"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Student List */}
      <Text style={styles.sectionTitle}>
        Students Looking for Mentors
      </Text>

      {filteredStudents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔎</Text>

          <Text style={styles.emptyTitle}>
            No students found
          </Text>

          <Text style={styles.emptyDescription}>
            Try searching for another name, qualification or skill.
          </Text>
        </View>
      ) : (
        filteredStudents.map((student) => (
          <View
            key={student.id}
            style={styles.studentCard}
          >
            {/* Student Header */}
            <View style={styles.studentHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {student.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.studentMainInfo}>
                <Text style={styles.studentName}>
                  {student.name}
                </Text>

                <Text style={styles.qualification}>
                  {student.qualification}
                </Text>

                <Text style={styles.year}>
                  {student.year}
                </Text>
              </View>
            </View>

            {/* Career Interests */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>
                Career Interests
              </Text>

              <Text style={styles.infoText}>
                {student.interests}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>
                📍
              </Text>

              <Text style={styles.locationText}>
                {student.location}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.viewButton}
                activeOpacity={0.8}
                onPress={() => handleViewProfile(student)}
              >
                <Text style={styles.viewButtonText}>
                  View Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mentorButton}
                activeOpacity={0.8}
                onPress={() => handleMentorship(student.name)}
              >
                <Text style={styles.mentorButtonText}>
                  Offer Mentorship
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Current Mentees */}
      <Text style={styles.sectionTitle}>
        Your Current Mentees
      </Text>

      <View style={styles.currentCard}>
        <View style={styles.currentAvatar}>
          <Text style={styles.currentAvatarText}>
            M
          </Text>
        </View>

        <View style={styles.currentInfo}>
          <Text style={styles.currentName}>
            Mentor Dashboard
          </Text>

          <Text style={styles.currentDescription}>
            Your active mentorship relationships will appear here
            once connected to the backend.
          </Text>
        </View>
      </View>

      {/* Mentorship Preferences */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          Ready to make a difference?
        </Text>

        <Text style={styles.footerDescription}>
          Your experience could help a student take the next
          important step in their career.
        </Text>

        <TouchableOpacity
          style={styles.footerButton}
          activeOpacity={0.8}
          onPress={handlePreferences}
        >
          <Text style={styles.footerButtonText}>
            Update Mentorship Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back to Dashboard */}
      <TouchableOpacity
        style={styles.dashboardButton}
        activeOpacity={0.8}
        onPress={() => router.replace('/alumni/dashboard')}
      >
        <Text style={styles.dashboardButtonText}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 25,
    color: '#4F46E5',
    fontWeight: '600',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#24243A',
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    lineHeight: 18,
  },

  overviewCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  overviewIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  overviewIconText: {
    fontSize: 27,
  },

  overviewInfo: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 6,
  },

  overviewDescription: {
    fontSize: 13,
    color: '#5F5F70',
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },

  statLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 12,
    marginTop: 8,
  },

  searchInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8E5',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#24243A',
    marginBottom: 22,
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#4F46E5',
  },

  studentMainInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 3,
  },

  qualification: {
    fontSize: 13,
    color: '#555566',
    marginBottom: 3,
  },

  year: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },

  infoSection: {
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777777',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  infoText: {
    fontSize: 13,
    color: '#424255',
    lineHeight: 19,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  locationIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  locationText: {
    fontSize: 12,
    color: '#777777',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  viewButton: {
    width: '39%',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },

  mentorButton: {
    width: '58%',
    backgroundColor: '#6C63FF',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  mentorButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 5,
  },

  emptyDescription: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  currentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
  },

  currentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  currentAvatarText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4F46E5',
  },

  currentInfo: {
    flex: 1,
  },

  currentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  currentDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
  },

  footerCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 7,
  },

  footerDescription: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 19,
    marginBottom: 17,
  },

  footerButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  dashboardButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

