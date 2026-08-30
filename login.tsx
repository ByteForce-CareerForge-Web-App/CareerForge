import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your email address and password.'
      );
      return;
    }

    if (
      email.trim().toLowerCase() === 'business@test.com' &&
      password === '123456'
    ) {
      router.replace('/business/dashboard');
      return;
    }

    Alert.alert(
      'Login Failed',
      'Invalid email or password.'
    );
  };

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
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/register')}
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

