import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

export default function AlumniRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [qualification, setQualification] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail(value: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  function validatePassword(value: string) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    return passwordPattern.test(value);
  }

  function validateGraduationYear(value: string) {
    const year = Number(value);
    const currentYear = new Date().getFullYear();

    return (
      Number.isInteger(year) &&
      year >= 1950 &&
      year <= currentYear
    );
  }

  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanQualification = qualification.trim();
    const cleanGraduationYear = graduationYear.trim();
    const cleanCurrentCompany = currentCompany.trim();
    const cleanCurrentPosition = currentPosition.trim();

    if (
      !cleanFullName ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !cleanQualification ||
      !cleanGraduationYear ||
      !cleanCurrentCompany ||
      !cleanCurrentPosition
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all fields before creating your account.'
      );
      return;
    }

    if (cleanFullName.length < 2) {
      Alert.alert(
        'Invalid Name',
        'Please enter your full name.'
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

    if (!validatePassword(password)) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 8 characters, including an uppercase letter, lowercase letter, number and special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Error',
        'Passwords do not match.'
      );
      return;
    }

    if (!validateGraduationYear(cleanGraduationYear)) {
      Alert.alert(
        'Invalid Graduation Year',
        'Please enter a valid graduation year.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Backend API integration will be added later.
      // This data is prepared for the PHP/MySQL backend developer.
      const registrationData = {
        role: 'alumni',
        fullName: cleanFullName,
        email: cleanEmail,
        password: password,
        qualification: cleanQualification,
        graduationYear: Number(cleanGraduationYear),
        currentCompany: cleanCurrentCompany,
        currentPosition: cleanCurrentPosition,
      };

      console.log('Alumni registration data prepared:', {
        ...registrationData,
        password: '[HIDDEN]',
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Registration Ready',
        'Your registration information has passed all frontend security checks and is ready for backend integration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Alumni Registration</Text>

      <Text style={styles.subtitle}>
        Create your secure CareerForgeAI alumni account
      </Text>

      <Text style={styles.label}>Full Name</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#94A3B8"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Email Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Create a strong password"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />

        <Pressable
          style={styles.showButton}
          onPress={() => setShowPassword(!showPassword)}
          disabled={isSubmitting}
        >
          <Text style={styles.showText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.passwordHint}>
        8+ characters with uppercase, lowercase, number and special character
      </Text>

      <Text style={styles.label}>Confirm Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm your password"
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />

        <Pressable
          style={styles.showButton}
          onPress={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          disabled={isSubmitting}
        >
          <Text style={styles.showText}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Qualification</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. BSc Data Science"
        placeholderTextColor="#94A3B8"
        value={qualification}
        onChangeText={setQualification}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Graduation Year</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 2025"
        placeholderTextColor="#94A3B8"
        value={graduationYear}
        onChangeText={setGraduationYear}
        keyboardType="numeric"
        maxLength={4}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Current Company</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your current company"
        placeholderTextColor="#94A3B8"
        value={currentCompany}
        onChangeText={setCurrentCompany}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Current Position</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Data Analyst"
        placeholderTextColor="#94A3B8"
        value={currentPosition}
        onChangeText={setCurrentPosition}
        editable={!isSubmitting}
      />

      <Pressable
        style={[
          styles.registerButton,
          isSubmitting && styles.registerButtonDisabled,
        ]}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.registerButtonText}>
              Checking...
            </Text>
          </View>
        ) : (
          <Text style={styles.registerButtonText}>
            Create Alumni Account
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 24,
    paddingBottom: 40,
  },

  back: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '600',
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 17,
  },

  passwordContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    color: '#4338CA',
    fontWeight: '600',
  },

  passwordHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 17,
  },

  registerButton: {
    backgroundColor: '#4338CA',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    textAlign: 'center',
    color: '#4338CA',
    fontWeight: '600',
    fontSize: 14,
  },
});