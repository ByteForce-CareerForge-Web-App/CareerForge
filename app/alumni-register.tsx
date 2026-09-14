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

const RICHFIELD_QUALIFICATIONS = [
  'Bachelor of Science in Information Technology (BSc IT)',
  'Bachelor of Commerce (BCom)',
  'Bachelor of Commerce (BCom AGA)',
  'Bachelor of Commerce (BCom AGA IT)',
  'Bachelor of Business Administration (BBA)',
  'Bachelor of Public Management (BPM)',
  'Diploma in Information Technology (DIT)',
  'Diploma in Business Administration (DBA)',
  'Diploma in Local Government Management',
  'Higher Certificate in Information Technology (HCIT)',
  'Higher Certificate in Business Administration (HCBA)',
  'Higher Certificate in Office Administration (HCOA)',
  'Higher Certificate in Local Government Management (HCLGM)',
  'Higher Certificate in Recognition of Prior Learning Activities (RPLA)',
  'Higher Certificate in Computer Forensics (HCCF)',
  'Bachelor of Science Honours in Information Technology',
  'Postgraduate Diploma in Management',
  'Master of Business Administration (MBA)',
];

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

  const [showQualificationDropdown, setShowQualificationDropdown] =
    useState(false);

  const [showYearDropdown, setShowYearDropdown] = useState(false);

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

    Keyboard.dismiss();

    setShowQualificationDropdown(false);
    setShowYearDropdown(false);

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

    if (!RICHFIELD_QUALIFICATIONS.includes(cleanQualification)) {
      Alert.alert(
        'Invalid Qualification',
        'Please select a qualification offered by Richfield Graduate Institute of Technology.'
      );
      return;
    }

    if (!validateGraduationYear(cleanGraduationYear)) {
      Alert.alert(
        'Invalid Graduation Year',
        'Please select a valid graduation year.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Backend API integration will be added later.
      // This object is prepared for the PHP/MySQL backend developer.
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

  const currentYear = new Date().getFullYear();

  const graduationYears = Array.from(
    { length: currentYear - 1949 },
    (_, index) => String(currentYear - index)
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowQualificationDropdown(false);
          setShowYearDropdown(false);
        }}
      >
        <View style={styles.screen}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
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
                <Text style={styles.headerBadgeText}>ALUMNI</Text>
              </View>

              <Text style={styles.title}>
                Alumni Registration
              </Text>

              <Text style={styles.subtitle}>
                Create your secure CareerForgeAI alumni account
              </Text>
            </View>

            {/* Account Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Account Information
              </Text>

              <Text style={styles.label}>Full Name</Text>

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
                returnKeyType="next"
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
                8+ characters with uppercase, lowercase, number
                and special character
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
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Academic Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Academic Information
              </Text>

              <Text style={styles.label}>
                Qualification
              </Text>

              <Pressable
                style={[
                  styles.dropdown,
                  showQualificationDropdown &&
                    styles.dropdownActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowYearDropdown(false);
                  setShowQualificationDropdown(
                    !showQualificationDropdown
                  );
                }}
                disabled={isSubmitting}
              >
                <Text
                  style={
                    qualification
                      ? styles.dropdownText
                      : styles.dropdownPlaceholder
                  }
                  numberOfLines={1}
                >
                  {qualification ||
                    'Select your Richfield qualification'}
                </Text>

                <Text style={styles.dropdownArrow}>
                  {showQualificationDropdown ? '▲' : '▼'}
                </Text>
              </Pressable>

              {showQualificationDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.dropdownScroll}
                  >
                    {RICHFIELD_QUALIFICATIONS.map(
                      (item) => (
                        <Pressable
                          key={item}
                          style={[
                            styles.dropdownOption,
                            qualification === item &&
                              styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setQualification(item);
                            setShowQualificationDropdown(
                              false
                            );
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              qualification === item &&
                                styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.label}>
                Graduation Year
              </Text>

              <Pressable
                style={[
                  styles.dropdown,
                  showYearDropdown &&
                    styles.dropdownActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowQualificationDropdown(false);
                  setShowYearDropdown(!showYearDropdown);
                }}
                disabled={isSubmitting}
              >
                <Text
                  style={
                    graduationYear
                      ? styles.dropdownText
                      : styles.dropdownPlaceholder
                  }
                >
                  {graduationYear ||
                    'Select your graduation year'}
                </Text>

                <Text style={styles.dropdownArrow}>
                  {showYearDropdown ? '▲' : '▼'}
                </Text>
              </Pressable>

              {showYearDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.yearDropdownScroll}
                  >
                    {graduationYears.map((year) => (
                      <Pressable
                        key={year}
                        style={[
                          styles.dropdownOption,
                          graduationYear === year &&
                            styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          setGraduationYear(year);
                          setShowYearDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            graduationYear === year &&
                              styles.dropdownOptionTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Career Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Career Information
              </Text>

              <Text style={styles.label}>
                Current Company
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your current company"
                placeholderTextColor="#94A3B8"
                value={currentCompany}
                onChangeText={setCurrentCompany}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isSubmitting}
              />

              <Text style={styles.label}>
                Current Position
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Data Analyst"
                placeholderTextColor="#94A3B8"
                value={currentPosition}
                onChangeText={setCurrentPosition}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                editable={!isSubmitting}
              />
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
                  Create Alumni Account
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.back();
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
    marginBottom: 22,
  },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F1FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },

  headerBadgeText: {
    color: '#1769E0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
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

  yearDropdownScroll: {
    maxHeight: 230,
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