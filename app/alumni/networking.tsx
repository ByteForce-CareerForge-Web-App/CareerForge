import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

export default function NetworkingScreen() {
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
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Networking</Text>
          <Text style={styles.subtitle}>
            Connect with graduates and professionals
          </Text>
        </View>
      </View>

      {/* Introduction */}
      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <Text style={styles.iconText}>🌐</Text>
        </View>

        <Text style={styles.introTitle}>
          Grow Your Professional Network
        </Text>

        <Text style={styles.introDescription}>
          Connect with CareerForge members, alumni and professionals
          to build meaningful career relationships.
        </Text>
      </View>

      {/* Search */}
      <Text style={styles.sectionTitle}>
        Find Professionals
      </Text>

      <TouchableOpacity style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>
          Search for people, skills or careers
        </Text>
      </TouchableOpacity>

      {/* Suggested Connections */}
      <Text style={styles.sectionTitle}>
        Suggested Connections
      </Text>

      {/* Person 1 */}
      <View style={styles.personCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>
            Jordan Daniels
          </Text>

          <Text style={styles.personRole}>
            Software Developer
          </Text>

          <Text style={styles.personCompany}>
            Technology Professional
          </Text>
        </View>

        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Person 2 */}
      <View style={styles.personCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SM</Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>
            Sarah Mokoena
          </Text>

          <Text style={styles.personRole}>
            Data Analyst
          </Text>

          <Text style={styles.personCompany}>
            Data & Analytics
          </Text>
        </View>

        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Person 3 */}
      <View style={styles.personCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TN</Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>
            Thabo Ndlovu
          </Text>

          <Text style={styles.personRole}>
            Project Manager
          </Text>

          <Text style={styles.personCompany}>
            Business & Technology
          </Text>
        </View>

        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Networking Benefits */}
      <Text style={styles.sectionTitle}>
        Why Network?
      </Text>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>💼</Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Discover Opportunities
          </Text>

          <Text style={styles.benefitDescription}>
            Learn about career opportunities through your
            professional network.
          </Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>🤝</Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Build Connections
          </Text>

          <Text style={styles.benefitDescription}>
            Meet professionals and alumni who can support
            your career journey.
          </Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>🚀</Text>

        <View style={styles.benefitInfo}>
          <Text style={styles.benefitTitle}>
            Grow Your Career
          </Text>

          <Text style={styles.benefitDescription}>
            Expand your professional network and gain valuable
            industry knowledge.
          </Text>
        </View>
      </View>

      {/* Back to Dashboard */}
      <TouchableOpacity
        style={styles.dashboardButton}
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
  },

  backText: {
    fontSize: 25,
    color: '#4F46E5',
    fontWeight: '600',
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#24243A',
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },

  introCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 28,
  },

  introIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  iconText: {
    fontSize: 30,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24243A',
    textAlign: 'center',
    marginBottom: 8,
  },

  introDescription: {
    fontSize: 14,
    color: '#5F5F70',
    textAlign: 'center',
    lineHeight: 21,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 14,
  },

  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchText: {
    color: '#999999',
    fontSize: 14,
  },

  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 3,
  },

  personRole: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 2,
  },

  personCompany: {
    fontSize: 11,
    color: '#888888',
  },

  connectButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  connectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  benefitIcon: {
    fontSize: 28,
    marginRight: 15,
  },

  benefitInfo: {
    flex: 1,
  },

  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24243A',
    marginBottom: 5,
  },

  benefitDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 18,
  },

  dashboardButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },

  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

