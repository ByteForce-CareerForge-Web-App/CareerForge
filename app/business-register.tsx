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

export default function BusinessRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] =
    useState('');
  const [industry, setIndustry] = useState('');
  const [companyDescription, setCompanyDescription] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function validateEmail(value: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  function validatePassword(value: string) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    return passwordPattern.test(value);
  }

  function validateRegistrationNumber(value: string) {
    return /^[A-Za-z0-9/-]{5,30}$/.test(value);
  }

  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCompanyName = companyName.trim();
    const cleanRegistrationNumber =
      registrationNumber.trim();
    const cleanIndustry = industry.trim();
    const cleanCompanyDescription =
      companyDescription.trim();

    if (
      !cleanFullName ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !cleanCompanyName ||
      !cleanRegistrationNumber ||
      !cleanIndustry ||
      !cleanCompanyDescription
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

    if (
      !validateRegistrationNumber(
        cleanRegistrationNumber
      )
    ) {
      Alert.alert(
        'Invalid Registration Number',
        'Please enter a valid company registration number.'
      );
      return;
    }

    if (cleanCompanyName.length < 2) {
      Alert.alert(
        'Invalid Company Name',
        'Please enter a valid company name.'
      );
      return;
    }

    if (cleanCompanyDescription.length < 20) {
      Alert.alert(
        'Company Description',
        'Please provide a company description of at least 20 characters.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Frontend only for now.
      // This data is ready for backend integration later.
      const registrationData = {
        role: 'business',
        fullName: cleanFullName,
        email: cleanEmail,
        password,
        companyName: cleanCompanyName,
        registrationNumber: cleanRegistrationNumber,
        industry: cleanIndustry,
        companyDescription: cleanCompanyDescription,
      };

      void registrationData;

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

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
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          CAREERFORGEAI
        </Text>

        <Text style={styles.title}>
          Business Registration
        </Text>

        <Text style={styles.subtitle}>
          Create your secure CareerForgeAI business
          account.
        </Text>
      </View>

      {/* Form */}
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

      <Text style={styles.label}>
        Email Address
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your business email"
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
          onPress={() =>
            setShowPassword(!showPassword)
          }
          disabled={isSubmitting}
        >
          <Text style={styles.showText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.passwordHint}>
        8+ characters with uppercase, lowercase,
        number and special character
      </Text>

      <Text style={styles.label}>
        Confirm Password
      </Text>

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
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
          disabled={isSubmitting}
        >
          <Text style={styles.showText}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>
        Company Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your company name"
        placeholderTextColor="#94A3B8"
        value={companyName}
        onChangeText={setCompanyName}
        autoCapitalize="words"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>
        Company Registration Number
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter registration number"
        placeholderTextColor="#94A3B8"
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Industry</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Information Technology"
        placeholderTextColor="#94A3B8"
        value={industry}
        onChangeText={setIndustry}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>
        Company Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
        ]}
        placeholder="Tell us about your company"
        placeholderTextColor="#94A3B8"
        value={companyDescription}
        onChangeText={setCompanyDescription}
        multiline
        textAlignVertical="top"
        editable={!isSubmitting}
      />

      <Text style={styles.descriptionHint}>
        Minimum 20 characters
      </Text>

      {/* Register */}
      <Pressable
        style={[
          styles.registerButton,
          isSubmitting &&
            styles.registerButtonDisabled,
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
            Create Business Account
          </Text>
        )}
      </Pressable>

      {/* Login */}
      <Pressable
        onPress={() => router.replace('/login')}
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
    paddingBottom: 45,
  },

  back: {
    fontSize: 16,
    color: '#0B1F3A',
    fontWeight: '700',
    marginBottom: 20,
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 25,
  },

  eyebrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#E2E8F0',
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 14,
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
    color: '#0B1F3A',
    fontWeight: '700',
  },

  passwordHint: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 17,
  },

  descriptionInput: {
    minHeight: 120,
  },

  descriptionHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -10,
    marginBottom: 17,
  },

  registerButton: {
    backgroundColor: '#0B1F3A',
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
    fontWeight: '800',
  },

  loginText: {
    textAlign: 'center',
    color: '#0B1F3A',
    fontWeight: '700',
    fontSize: 14,
  },
});