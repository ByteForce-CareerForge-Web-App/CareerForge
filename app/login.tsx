import { router } from 'expo-router';
import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type UserRole = 'student' | 'alumni' | 'business' | 'admin';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  function validateEmail(value: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  async function handleLogin() {
    if (isLoggingIn) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email address and password.'
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters.'
      );
      return;
    }

    try {
      setIsLoggingIn(true);

      /*
       * FRONTEND-ONLY LOGIN
       *
       * Backend authentication will be connected later.
       *
       * For now, the selected role determines
       * which dashboard opens.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      if (role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (role === 'alumni') {
        router.replace('/alumni/dashboard');
      } else if (role === 'business') {
        router.replace('/business/dashboard');
      } else {
        router.replace('/student/dashboard');
      }
    } catch (error) {
      Alert.alert(
        'Login Error',
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          disabled={isLoggingIn}
        >
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Login to your CareerForgeAI account
          </Text>
        </View>

        {/* Role Selection */}
        <Text style={styles.roleLabel}>
          Login As
        </Text>

        <View style={styles.roleContainer}>

          {/* Business */}
          <Pressable
            style={[
              styles.roleButton,
              role === 'business' &&
                styles.roleButtonSelected,
            ]}
            onPress={() => setRole('business')}
            disabled={isLoggingIn}
          >
            <Text style={styles.roleIcon}>
              🏢
            </Text>

            <Text
              style={[
                styles.roleText,
                role === 'business' &&
                  styles.roleTextSelected,
              ]}
            >
              Business
            </Text>
          </Pressable>

          {/* Student */}
          <Pressable
            style={[
              styles.roleButton,
              role === 'student' &&
                styles.roleButtonSelected,
            ]}
            onPress={() => setRole('student')}
            disabled={isLoggingIn}
          >
            <Text style={styles.roleIcon}>
              🎓
            </Text>

            <Text
              style={[
                styles.roleText,
                role === 'student' &&
                  styles.roleTextSelected,
              ]}
            >
              Student
            </Text>
          </Pressable>

          {/* Alumni */}
          <Pressable
            style={[
              styles.roleButton,
              role === 'alumni' &&
                styles.roleButtonSelected,
            ]}
            onPress={() => setRole('alumni')}
            disabled={isLoggingIn}
          >
            <Text style={styles.roleIcon}>
              👨‍💼
            </Text>

            <Text
              style={[
                styles.roleText,
                role === 'alumni' &&
                  styles.roleTextSelected,
              ]}
            >
              Alumni
            </Text>
          </Pressable>

          {/* Admin */}
          <Pressable
            style={[
              styles.roleButton,
              role === 'admin' &&
                styles.roleButtonSelected,
            ]}
            onPress={() => setRole('admin')}
            disabled={isLoggingIn}
          >
            <Text style={styles.roleIcon}>
              🛡️
            </Text>

            <Text
              style={[
                styles.roleText,
                role === 'admin' &&
                  styles.roleTextSelected,
              ]}
            >
              Admin
            </Text>
          </Pressable>

        </View>

        {/* Email */}
        <Text style={styles.label}>
          Email Address
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!isLoggingIn}
        />

        {/* Password */}
        <Text style={styles.label}>
          Password
        </Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            editable={!isLoggingIn}
          />

          <Pressable
            style={styles.showButton}
            onPress={() =>
              setShowPassword(!showPassword)
            }
            disabled={isLoggingIn}
          >
            <Text style={styles.showText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <Pressable
          style={[
            styles.button,
            isLoggingIn && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />

              <Text style={styles.buttonText}>
                Logging in...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Login as{' '}
              {role === 'admin'
                ? 'Admin'
                : role === 'alumni'
                ? 'Alumni'
                : role === 'business'
                ? 'Business'
                : 'Student'}
            </Text>
          )}
        </Pressable>

        {/* Register */}
        <Pressable
          disabled={isLoggingIn}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.register}>
            Don't have an account? Create one
          </Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },

  back: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 35,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },

  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
    marginTop: 5,
  },

  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  roleButton: {
    width: '48%',
    height: 78,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  roleButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
  },

  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },

  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  roleTextSelected: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 52,
    fontSize: 15,
    color: '#0F172A',
  },

  passwordContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#0F172A',
  },

  showButton: {
    paddingHorizontal: 15,
  },

  showText: {
    color: '#4F46E5',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#4F46E5',
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  register: {
    textAlign: 'center',
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 20,
  },
});