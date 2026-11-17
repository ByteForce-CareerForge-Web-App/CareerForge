
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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';

const INDUSTRIES = [
  'Information Technology',
  'Financial Services',
  'Education',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Construction',
  'Engineering',
  'Telecommunications',
  'Professional Services',
  'Marketing & Advertising',
  'Hospitality & Tourism',
  'Transport & Logistics',
  'Real Estate',
  'Agriculture',
  'Government & Public Services',
  'Non-Profit / NGO',
  'Media & Entertainment',
  'Other',
];

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

  const [showIndustryDropdown, setShowIndustryDropdown] =
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

    Keyboard.dismiss();
    setShowIndustryDropdown(false);

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

      console.log(
        'Submitting business registration:',
        {
          ...registrationData,
          password: '[HIDDEN]',
        }
      );

      const response = await fetch(
        `${API_BASE_URL}/profiles/business.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        }
      );

      let result;

      try {
        result = await response.json();
      } catch (jsonError) {
        console.error(
          'Invalid backend response:',
          jsonError
        );

        Alert.alert(
          'Server Error',
          'The server returned an invalid response. Please make sure the CareerForge backend is running correctly.'
        );

        return;
      }

      console.log(
        'Business registration response:',
        result
      );

      if (!response.ok || !result.success) {
        Alert.alert(
          'Registration Failed',
          result.message ||
            'Unable to create business account. Please try again.'
        );

        return;
      }

      Alert.alert(
        'Registration Successful',
        'Your business account has been created successfully. You can now log in.',
        [
          {
            text: 'Continue to Login',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Business registration error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check that the CareerForge backend is running.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios' ? 'padding' : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 20 : 0
      }
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowIndustryDropdown(false);
        }}
      >
        <View style={styles.screen}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios'
                ? 'interactive'
                : 'on-drag'
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.back();
              }}
              disabled={isSubmitting}
              style={styles.backButton}
            >
              <Text style={styles.back}>← Back</Text>
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  BUSINESS
                </Text>
              </View>

              <Text style={styles.title}>
                Business Registration
              </Text>

              <Text style={styles.subtitle}>
                Create your secure CareerForgeAI business
                account.
              </Text>
            </View>

            {/* Account Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Account Information
              </Text>

              <Text style={styles.label}>
                Full Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
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
                returnKeyType="next"
                editable={!isSubmitting}
              />

              <Text style={styles.label}>
                Password
              </Text>

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
                  returnKeyType="next"
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
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
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
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Company Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Company Information
              </Text>

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
                autoCorrect={false}
                returnKeyType="next"
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
                returnKeyType="next"
                editable={!isSubmitting}
              />

              <Text style={styles.label}>
                Industry
              </Text>

              <Pressable
                style={[
                  styles.dropdown,
                  showIndustryDropdown &&
                    styles.dropdownActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowIndustryDropdown(
                    !showIndustryDropdown
                  );
                }}
                disabled={isSubmitting}
              >
                <Text
                  style={
                    industry
                      ? styles.dropdownText
                      : styles.dropdownPlaceholder
                  }
                  numberOfLines={1}
                >
                  {industry || 'Select your industry'}
                </Text>

                <Text style={styles.dropdownArrow}>
                  {showIndustryDropdown ? '▲' : '▼'}
                </Text>
              </Pressable>

              {showIndustryDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.dropdownScroll}
                  >
                    {INDUSTRIES.map((item) => (
                      <Pressable
                        key={item}
                        style={[
                          styles.dropdownOption,
                          industry === item &&
                            styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          setIndustry(item);
                          setShowIndustryDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            industry === item &&
                              styles.dropdownOptionTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

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
                returnKeyType="default"
                editable={!isSubmitting}
              />

              <Text style={styles.descriptionHint}>
                Minimum 20 characters
              </Text>
            </View>

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
              onPress={() => {
                Keyboard.dismiss();
                router.replace('/login');
              }}
              disabled={isSubmitting}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                Already have an account? Login
              </Text>
            </Pressable>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 55,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },

  back: {
    fontSize: 16,
    color: '#0B1F3A',
    fontWeight: '700',
  },

  header: {
    backgroundColor: '#0B1F3A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },

  headerBadgeText: {
    color: '#1769E0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
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

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAF2',
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 16,
  },

  passwordContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 12,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#0F172A',
  },

  showButton: {
    paddingHorizontal: 15,
    height: 52,
    justifyContent: 'center',
  },

  showText: {
    color: '#1769E0',
    fontWeight: '700',
  },

  passwordHint: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#64748B',
    marginBottom: 16,
  },

  dropdown: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 12,
    paddingLeft: 15,
    paddingRight: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  dropdownActive: {
    borderColor: '#1769E0',
    backgroundColor: '#FFFFFF',
  },

  dropdownText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    paddingRight: 10,
  },

  dropdownPlaceholder: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
    paddingRight: 10,
  },

  dropdownArrow: {
    color: '#1769E0',
    fontSize: 12,
    fontWeight: '800',
  },

  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },

  dropdownScroll: {
    maxHeight: 250,
  },

  dropdownOption: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  dropdownOptionSelected: {
    backgroundColor: '#EAF2FF',
  },

  dropdownOptionText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },

  dropdownOptionTextSelected: {
    color: '#1769E0',
    fontWeight: '700',
  },

  descriptionInput: {
    minHeight: 120,
  },

  descriptionHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -10,
    marginBottom: 3,
  },

  registerButton: {
    backgroundColor: '#0B1F3A',
    minHeight: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 18,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
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

  loginButton: {
    paddingVertical: 5,
  },

  loginText: {
    textAlign: 'center',
    color: '#1769E0',
    fontWeight: '700',
    fontSize: 14,
  },

  bottomSpace: {
    height: 20,
  },
});

