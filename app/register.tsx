import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <Text style={styles.eyebrow}>
            CAREERFORGEAI
          </Text>

          <Text style={styles.title}>
            Create your account
          </Text>

          <Text style={styles.subtitle}>
            Choose your account type to get started.
          </Text>
        </View>

        {/* Account Types */}
        <View style={styles.optionsContainer}>
          {/* Student */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() =>
              router.push(
                '/student/career-goals?mode=registration'
              )
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎓</Text>
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                Student
              </Text>

              <Text style={styles.optionDescription}>
                Build your career, find opportunities,
                improve your skills and connect with
                professionals.
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>
          </Pressable>

          {/* Alumni */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() =>
              router.push('/alumni-register')
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👨‍🎓</Text>
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                Alumni
              </Text>

              <Text style={styles.optionDescription}>
                Share your experience, mentor students
                and grow your professional network.
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>
          </Pressable>

          {/* Business */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() =>
              router.push('/business-register')
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏢</Text>
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                Business
              </Text>

              <Text style={styles.optionDescription}>
                Discover talented graduates and post
                opportunities for students and alumni.
              </Text>
            </View>

            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        {/* Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <Pressable
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.loginLink}>
              Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  backText: {
    color: '#0B1F3A',
    fontSize: 25,
    fontWeight: '600',
    marginTop: -2,
  },

  eyebrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 35,
    marginBottom: 10,
  },

  subtitle: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
  },

  optionsContainer: {
    marginBottom: 10,
  },

  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1EA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionCardPressed: {
    opacity: 0.82,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 25,
  },

  optionContent: {
    flex: 1,
    paddingRight: 8,
  },

  optionTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  optionDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },

  arrow: {
    color: '#0B1F3A',
    fontSize: 22,
    fontWeight: '700',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  loginText: {
    color: '#64748B',
    fontSize: 13,
  },

  loginLink: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
  },
});