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
import { API_BASE_URL } from '@/constants/api';

export default function StudentRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [campus, setCampus] = useState('');

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

  function validateStudentNumber(value: string) {
    return /^[A-Za-z0-9-]{5,20}$/.test(value);
  }

  function validateYearOfStudy(value: string) {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1 && year <= 6;
  }

  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentNumber = studentNumber.trim();
    const cleanQualification = qualification.trim();
    const cleanYearOfStudy = yearOfStudy.trim();
    const cleanCampus = campus.trim();

    if (
      !cleanFullName ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !cleanStudentNumber ||
      !cleanQualification ||
      !cleanYearOfStudy ||
      !cleanCampus
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

    if (!validateStudentNumber(cleanStudentNumber)) {
      Alert.alert(
        'Invalid Student Number',
        'Please enter a valid student number using 5–20 letters, numbers or hyphens.'
      );
      return;
    }

    if (!validateYearOfStudy(cleanYearOfStudy)) {
      Alert.alert(
        'Invalid Year of Study',
        'Year of study must be a number between 1 and 6.'
      );
      return;
    }


    try {
      setIsSubmitting(true);

      const registrationData = {
        role: 'student',
        fullName: cleanFullName,
        email: cleanEmail,
        password: password,
        studentNumber: cleanStudentNumber,
        qualification: cleanQualification,
        yearOfStudy: Number(cleanYearOfStudy),
        campus: cleanCampus,
      };

      const response = await fetch(
        `${API_BASE_URL}/profiles/student.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        }
      );

      const result = await response.json();

      console.log('Registration response:', result);

      if (!response.ok || !result.success) {
        Alert.alert(
          'Registration Failed',
          result.message || 'Unable to create your account.'
        );

        return;
      }

      Alert.alert(
        'Registration Successful',
        'Your student account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );

    } catch (error) {

      console.error('Registration error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the CareerForge server. Please make sure your phone and computer are connected to the same Wi-Fi network.'
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

      <Text style={styles.title}>Student Registration</Text>

      <Text style={styles.subtitle}>
        Create your secure CareerForgeAI student account
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

      <Text style={styles.label}>Student Number</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your student number"
        placeholderTextColor="#94A3B8"
        value={studentNumber}
        onChangeText={setStudentNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Qualification</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. BSc Data Science"
        placeholderTextColor="#94A3B8"
        value={qualification}
        onChangeText={setQualification}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Year of Study</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 2"
        placeholderTextColor="#94A3B8"
        value={yearOfStudy}
        onChangeText={setYearOfStudy}
        keyboardType="numeric"
        maxLength={1}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Campus</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your campus"
        placeholderTextColor="#94A3B8"
        value={campus}
        onChangeText={setCampus}
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
            Create Student Account
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