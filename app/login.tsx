
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function validateEmail(value: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  function getDashboardRoute(role: string) {
    switch (role.toLowerCase()) {
      case 'student':
        return '/student/dashboard';

      case 'alumni':
        return '/alumni/dashboard';

      case 'business':
        return '/business/dashboard';

      case 'admin':
        return '/admin/dashboard';

      default:
        return null;
    }
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

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordPattern.test(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
      );
      return;
    }

    try {
      Keyboard.dismiss();
      setIsLoggingIn(true);

      /*
       * CENTRAL AUTHENTICATION
       *
       * The backend is responsible for:
       * - verifying the email
       * - verifying the password
       * - checking the account status
       * - generating the authentication token
       * - determining the user's actual role
       *
       * The frontend does NOT determine the role from
       * the email address.
       */

      const response = await fetch(
        `${API_BASE_URL}/auth/login.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const rawResponse = await response.text();

      let result: any;

      try {
        result = JSON.parse(rawResponse);
      } catch {
        console.log(
          'Login non-JSON response:',
          rawResponse
        );

        Alert.alert(
          'Login Error',
          `The server returned an unexpected response. HTTP ${response.status}`
        );

        return;
      }

      console.log('Login response:', result);

      /*
       * Authentication failed
       */
      if (!response.ok || !result.success) {
        Alert.alert(
          'Login Failed',
          result.message ||
            'Invalid email or password.'
        );

        return;
      }

      /*
       * Make sure the backend actually returned
       * the information required for the session.
       */
      if (!result.token || !result.user) {
        console.log(
          'Incomplete login response:',
          result
        );

        Alert.alert(
          'Login Error',
          'The server did not return the required authentication information.'
        );

        return;
      }

      const role =
        typeof result.user.role === 'string'
          ? result.user.role.trim().toLowerCase()
          : '';

      const dashboardRoute =
        getDashboardRoute(role);

      /*
       * Protect against an unexpected/unsupported
       * role being returned by the backend.
       */
      if (!dashboardRoute) {
        console.log(
          'Unsupported user role:',
          result.user.role
        );

        Alert.alert(
          'Login Error',
          'Your account has an unsupported user role. Please contact the administrator.'
        );

        return;
      }

      /*
       * Store the central authentication session.
       *
       * All protected CareerForge screens use the
       * same authToken and user values.
       */
      await AsyncStorage.setItem(
        'authToken',
        result.token
      );

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(result.user)
      );

      /*
       * Route according to the REAL role returned
       * by the backend.
       */
      router.replace(dashboardRoute as any);
    } catch (error) {
      console.log('Login error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to the CareerForge server. Please make sure XAMPP is running and the backend is available.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 0 : 20
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
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
          returnKeyType="next"
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
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() =>
              Keyboard.dismiss()
            }
          />

          <Pressable
            style={styles.showButton}
            onPress={() =>
              setShowPassword(!showPassword)
            }
            disabled={isLoggingIn}
          >
            <Text style={styles.showText}>
              {showPassword
                ? 'Hide'
                : 'Show'}
            </Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <Pressable
          style={[
            styles.button,
            isLoggingIn &&
              styles.buttonDisabled,
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
              Login
            </Text>
          )}
        </Pressable>

        {/* Register */}
        <Pressable
          disabled={isLoggingIn}
          onPress={() =>
            router.push('/register')
          }
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

  scrollView: {
    flex: 1,
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
    marginBottom: 45,
  },

  header: {
    marginBottom: 35,
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 15,
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
    marginTop: 30,
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
    marginTop: 22,
  },
});

