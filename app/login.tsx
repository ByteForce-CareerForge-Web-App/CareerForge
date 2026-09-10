import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (isSubmitting) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your email address and password.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/../views/auth/login.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const result = await response.json();

      console.log('Login response:', result);

      if (!response.ok || !result.success) {
        Alert.alert(
          'Login Failed',
          result.message || 'Invalid email or password.'
        );
        return;
      }

      // Save login token
      await AsyncStorage.setItem(
        'authToken',
        result.token
      );

      // Save basic user information
      await AsyncStorage.setItem(
        'user',
        JSON.stringify(result.user)
      );

      // Send user to the correct dashboard
      if (result.user.role === 'student') {
        router.replace('/student/dashboard');
      } else if (result.user.role === 'business') {
        router.replace('/business/dashboard');
      } else {
        Alert.alert(
          'Login Successful',
          'Your account was successfully logged in, but a dashboard for your account type is not available yet.'
        );
      }

    } catch (error) {

      console.error('Login error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the CareerForge server. Please make sure your phone and computer are connected to the same Wi-Fi network.'
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Login to your CareerForgeAI account
      </Text>

      <Text style={styles.label}>Email Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
      />

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/register')}
        disabled={isSubmitting}
      >
        <Text style={styles.register}>
          Don't have an account? Create one
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 25,
    justifyContent: 'center',
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
    marginBottom: 35,
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
    paddingVertical: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25,
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

