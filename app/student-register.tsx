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
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

export default function StudentRegisterScreen() {
  const params = useLocalSearchParams();

  const [fullName, setFullName] = useState('');

  // Richfield student email - REQUIRED
  const [studentEmail, setStudentEmail] = useState('');

  // Personal email - OPTIONAL
  const [personalEmail, setPersonalEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  const [qualification, setQualification] = useState('');
  const [otherQualification, setOtherQualification] =
    useState('');

  const [yearOfStudy, setYearOfStudy] = useState('');
  const [studyMode, setStudyMode] = useState('');
  const [campus, setCampus] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<
    'qualification' | 'year' | 'studyMode' | 'campus' | null
  >(null);

  const qualificationOptions = [
    // Bachelor's Degrees
    'Bachelor of Science in Information Technology (BSc IT)',
    'Bachelor of Commerce (BCom)',
    'Bachelor of Commerce (AGA)',
    'Bachelor of Commerce (AGA IT)',
    'BCom (AGA IT) Bridging Programme',
    'Bachelor of Business Administration (BBA)',
    'Bachelor of Public Management (BPM)',

    // Diplomas
    'Diploma in Information Technology (DIT)',
    'Diploma in Business Administration (DBA)',
    'Diploma in Local Government Management (DLGM)',

    // Higher Certificates
    'Higher Certificate in Business Administration (HCBA)',
    'Higher Certificate in Local Government Management (HCLGM)',
    'Higher Certificate in Office Administration (HCOA)',
    'Higher Certificate in Recognition of Prior Learning Activities (RPLA)',
    'Higher Certificate in Information Technology (HCIT)',
    'Higher Certificate in Computer Forensics (HCCF)',

    // Postgraduate
    'Honours in Bachelor of Science in Information Technology',
    'Postgraduate Diploma in Management (PGDM)',

    // Master's
    'Master of Business Administration (MBA)',

    // Other
    'Other',
  ];

  const yearOptions = [
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Postgraduate',
    'Honours',
    "Master's",
  ];

  const studyModeOptions = [
    'Contact',
    'Distance',
  ];

  const campusOptions = [
    'Bryanston Campus',
    'Cape Town Campus',
    'Umhlanga Campus',
    'Musgrave Campus',
    'Polokwane New Premium Campus',
    'Newtown Junction Campus',
    'Centurion Campus',
    'Pretoria Campus',
  ];

  // Get selected career goals from Career Goals screen
  const goalIds =
    typeof params.goals === 'string'
      ? params.goals.split(',').filter(Boolean)
      : [];

  // Career goal information
  const goalDetails: Record<
    string,
    { icon: string; title: string }
  > = {
    employment: {
      icon: '💼',
      title: 'Find a Job',
    },
    internship: {
      icon: '🎓',
      title: 'Find an Internship',
    },
    career: {
      icon: '🚀',
      title: 'Build My Career',
    },
    skills: {
      icon: '📚',
      title: 'Improve My Skills',
    },
    mentor: {
      icon: '🤝',
      title: 'Find a Mentor',
    },
    cv: {
      icon: '📄',
      title: 'Improve My CV',
    },
    'career-change': {
      icon: '🔄',
      title: 'Change Careers',
    },
    entrepreneurship: {
      icon: '💡',
      title: 'Start a Business',
    },
  };

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
    const validYears = [
      'Year 1',
      'Year 2',
      'Year 3',
      'Year 4',
      'Year 5',
      'Year 6',
      'Postgraduate',
      'Honours',
      "Master's",
      'Doctorate',
    ];

    return validYears.includes(value);
  }

  function selectDropdownValue(
    type:
      | 'qualification'
      | 'year'
      | 'studyMode'
      | 'campus',
    value: string,
  ) {
    if (type === 'qualification') {
      setQualification(value);

      if (value !== 'Other') {
        setOtherQualification('');
      }
    } else if (type === 'year') {
      setYearOfStudy(value);
    } else if (type === 'studyMode') {
      setStudyMode(value);

      // Distance students do not need a physical campus
      if (value === 'Distance') {
        setCampus('');
      }
    } else if (type === 'campus') {
      setCampus(value);
    }

    setOpenDropdown(null);
  }

  function renderDropdown(
    type:
      | 'qualification'
      | 'year'
      | 'studyMode'
      | 'campus',
    title: string,
    options: string[],
  ) {
    return (
      <Modal
        visible={openDropdown === type}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOpenDropdown(null)}
        >
          <Pressable
            style={styles.dropdownModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                {title}
              </Text>

              <Pressable
                onPress={() => setOpenDropdown(null)}
              >
                <Text style={styles.dropdownClose}>
                  ✕
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const selected =
                  type === 'qualification'
                    ? qualification === option
                    : type === 'year'
                      ? yearOfStudy === option
                      : type === 'studyMode'
                        ? studyMode === option
                        : campus === option;

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.dropdownOption,
                      selected &&
                        styles.dropdownOptionSelected,
                    ]}
                    onPress={() =>
                      selectDropdownValue(
                        type,
                        option,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selected &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {selected && (
                      <Text style={styles.dropdownCheck}>
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    const cleanFullName = fullName.trim();

    const cleanStudentEmail =
      studentEmail.trim().toLowerCase();

    const cleanPersonalEmail =
      personalEmail.trim().toLowerCase();

    const cleanStudentNumber =
      studentNumber.trim();

    const cleanQualification =
      qualification === 'Other'
        ? otherQualification.trim()
        : qualification.trim();

    const cleanYearOfStudy =
      yearOfStudy.trim();

    const cleanStudyMode =
      studyMode.trim();

    const cleanCampus =
      campus.trim();

    // Campus is only required for Contact students
    const campusRequired =
      cleanStudyMode === 'Contact';

    // Required fields
    if (
      !cleanFullName ||
      !cleanStudentEmail ||
      !password ||
      !confirmPassword ||
      !cleanStudentNumber ||
      !cleanQualification ||
      !cleanYearOfStudy ||
      !cleanStudyMode ||
      (campusRequired && !cleanCampus)
    ) {
      Alert.alert(
        'Missing Information',
        campusRequired
          ? 'Please complete all required fields, including your Richfield student email and campus.'
          : 'Please complete all required fields before creating your account.',
      );

      return;
    }

    // Full name validation
    if (cleanFullName.length < 2) {
      Alert.alert(
        'Invalid Name',
        'Please enter your full name.',
      );

      return;
    }

    // Richfield student email validation
    if (!validateEmail(cleanStudentEmail)) {
      Alert.alert(
        'Invalid Student Email',
        'Please enter a valid Richfield student email address.',
      );

      return;
    }

    // Personal email validation - only if provided
    if (
      cleanPersonalEmail &&
      !validateEmail(cleanPersonalEmail)
    ) {
      Alert.alert(
        'Invalid Personal Email',
        'Please enter a valid personal email address or leave the field blank.',
      );

      return;
    }

    // Password validation
    if (!validatePassword(password)) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 8 characters, including an uppercase letter, lowercase letter, number and special character.',
      );

      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      Alert.alert(
        'Password Error',
        'Passwords do not match.',
      );

      return;
    }

    // Student number validation
    if (!validateStudentNumber(cleanStudentNumber)) {
      Alert.alert(
        'Invalid Student Number',
        'Please enter a valid student number using 5–20 letters, numbers or hyphens.',
      );

      return;
    }

    // Year validation
    if (!validateYearOfStudy(cleanYearOfStudy)) {
      Alert.alert(
        'Invalid Year of Study',
        'Please select a valid year or postgraduate study level.',
      );

      return;
    }

    // Study mode validation
    if (
      cleanStudyMode !== 'Contact' &&
      cleanStudyMode !== 'Distance'
    ) {
      Alert.alert(
        'Invalid Study Mode',
        'Please select Contact or Distance.',
      );

      return;
    }

    // Campus validation for Contact students
    if (
      cleanStudyMode === 'Contact' &&
      !cleanCampus
    ) {
      Alert.alert(
        'Campus Required',
        'Please select your Richfield campus.',
      );

      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * FRONTEND ONLY
       *
       * No API
       * No PHP
       * No database
       *
       * Backend integration will be added later.
       */

      console.log(
        'Student registration completed frontend checks:',
        {
          fullName: cleanFullName,

          studentEmail:
            cleanStudentEmail,

          personalEmail:
            cleanPersonalEmail || null,

          studentNumber:
            cleanStudentNumber,

          qualification:
            cleanQualification,

          yearOfStudy:
            cleanYearOfStudy,

          studyMode:
            cleanStudyMode,

          campus:
            cleanStudyMode === 'Contact'
              ? cleanCampus
              : 'Distance',

          careerGoals:
            goalIds,
        },
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      Alert.alert(
        'Registration Ready',
        'Your student registration has passed the frontend checks.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <TouchableWithoutFeedback
  onPress={Keyboard.dismiss}
  accessible={false}
>
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
        {/* BACK */}
        <Pressable
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>

        {/* HEADER */}
        <Text style={styles.title}>
          Student Registration
        </Text>

        <Text style={styles.subtitle}>
          Create your CareerForgeAI student account
        </Text>

        {/* CAREER GOALS */}
        {goalIds.length > 0 && (
          <View style={styles.goalsCard}>
            <View style={styles.goalsHeader}>
              <View>
                <Text style={styles.goalsTitle}>
                  Your Career Goals
                </Text>

                <Text style={styles.goalsSubtitle}>
                  These goals will help personalise your
                  CareerForgeAI experience.
                </Text>
              </View>

              <View style={styles.goalCount}>
                <Text style={styles.goalCountText}>
                  {goalIds.length}
                </Text>
              </View>
            </View>

            <View style={styles.goalsList}>
              {goalIds.map((goalId) => {
                const goal =
                  goalDetails[goalId];

                if (!goal) {
                  return null;
                }

                return (
                  <View
                    key={goalId}
                    style={styles.goalItem}
                  >
                    <View
                      style={
                        styles.goalIconContainer
                      }
                    >
                      <Text
                        style={styles.goalIcon}
                      >
                        {goal.icon}
                      </Text>
                    </View>

                    <Text style={styles.goalText}>
                      {goal.title}
                    </Text>

                    <View
                      style={styles.checkCircle}
                    >
                      <Text
                        style={styles.goalCheck}
                      >
                        ✓
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* CHANGE GOALS */}
            <Pressable
              style={styles.changeGoalsButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text
                style={styles.changeGoalsText}
              >
                ← Change Career Goals
              </Text>
            </Pressable>
          </View>
        )}

        {/* FULL NAME */}
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
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() =>
            Keyboard.dismiss()
          }
          editable={!isSubmitting}
        />

        {/* RICHFIELD STUDENT EMAIL */}
        <Text style={styles.label}>
          Richfield Student Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your Richfield student email"
          placeholderTextColor="#94A3B8"
          value={studentEmail}
          onChangeText={setStudentEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() =>
            Keyboard.dismiss()
          }
          editable={!isSubmitting}
        />

        <Text style={styles.fieldHint}>
          Your Richfield student email is required
          for your student account.
        </Text>

        {/* PERSONAL EMAIL */}
        <Text style={styles.label}>
          Personal Email
          <Text style={styles.optionalText}>
            {' '} (Optional)
          </Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your personal email"
          placeholderTextColor="#94A3B8"
          value={personalEmail}
          onChangeText={setPersonalEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() =>
            Keyboard.dismiss()
          }
          editable={!isSubmitting}
        />

        <Text style={styles.fieldHint}>
          You can add a personal email for future
          communication.
        </Text>

        {/* PASSWORD */}
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
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() =>
              Keyboard.dismiss()
            }
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

        {/* CONFIRM PASSWORD */}
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
            blurOnSubmit={true}
            onSubmitEditing={() =>
              Keyboard.dismiss()
            }
            editable={!isSubmitting}
          />

          <Pressable
            style={styles.showButton}
            onPress={() =>
              setShowConfirmPassword(
                !showConfirmPassword,
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

        {/* STUDENT NUMBER */}
        <Text style={styles.label}>
          Student Number
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your student number"
          placeholderTextColor="#94A3B8"
          value={studentNumber}
          onChangeText={setStudentNumber}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() =>
            Keyboard.dismiss()
          }
          editable={!isSubmitting}
        />

        {/* QUALIFICATION */}
        <Text style={styles.label}>
          Qualification
        </Text>

        <Pressable
          style={styles.dropdownInput}
          onPress={() =>
            setOpenDropdown('qualification')
          }
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.dropdownInputText,
              !qualification &&
                styles.dropdownPlaceholder,
            ]}
          >
            {qualification ||
              'Select your qualification'}
          </Text>

          <Text style={styles.dropdownArrow}>
            ⌄
          </Text>
        </Pressable>

        {/* OTHER QUALIFICATION */}
        {qualification === 'Other' && (
          <View
            style={
              styles.otherQualificationContainer
            }
          >
            <Text style={styles.label}>
              Other Qualification
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your qualification"
              placeholderTextColor="#94A3B8"
              value={otherQualification}
              onChangeText={setOtherQualification}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() =>
                Keyboard.dismiss()
              }
              editable={!isSubmitting}
            />

            <Text style={styles.fieldHint}>
              Please enter the name of your
              qualification if it is not listed above.
            </Text>
          </View>
        )}

        {/* YEAR OF STUDY */}
        <Text style={styles.label}>
          Year of Study
        </Text>

        <Pressable
          style={styles.dropdownInput}
          onPress={() =>
            setOpenDropdown('year')
          }
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.dropdownInputText,
              !yearOfStudy &&
                styles.dropdownPlaceholder,
            ]}
          >
            {yearOfStudy ||
              'Select your year of study'}
          </Text>

          <Text style={styles.dropdownArrow}>
            ⌄
          </Text>
        </Pressable>

        {/* STUDY MODE */}
        <Text style={styles.label}>
          Study Mode
        </Text>

        <Pressable
          style={styles.dropdownInput}
          onPress={() =>
            setOpenDropdown('studyMode')
          }
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.dropdownInputText,
              !studyMode &&
                styles.dropdownPlaceholder,
            ]}
          >
            {studyMode ||
              'Select study mode'}
          </Text>

          <Text style={styles.dropdownArrow}>
            ⌄
          </Text>
        </Pressable>

        {/* CAMPUS - ONLY FOR CONTACT */}
        {studyMode === 'Contact' && (
          <>
            <Text style={styles.label}>
              Richfield Campus
            </Text>

            <Pressable
              style={styles.dropdownInput}
              onPress={() =>
                setOpenDropdown('campus')
              }
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.dropdownInputText,
                  !campus &&
                    styles.dropdownPlaceholder,
                ]}
              >
                {campus ||
                  'Select your Richfield campus'}
              </Text>

              <Text
                style={styles.dropdownArrow}
              >
                ⌄
              </Text>
            </Pressable>
          </>
        )}

        {/* DROPDOWNS */}
        {renderDropdown(
          'qualification',
          'Select Qualification',
          qualificationOptions,
        )}

        {renderDropdown(
          'year',
          'Select Year of Study',
          yearOptions,
        )}

        {renderDropdown(
          'studyMode',
          'Select Study Mode',
          studyModeOptions,
        )}

        {studyMode === 'Contact' &&
          renderDropdown(
            'campus',
            'Select Richfield Campus',
            campusOptions,
          )}

        {/* REGISTER */}
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
            <View
              style={styles.loadingContainer}
            >
              <ActivityIndicator color="#FFFFFF" />

              <Text
                style={
                  styles.registerButtonText
                }
              >
                Checking...
              </Text>
            </View>
          ) : (
            <Text
              style={styles.registerButtonText}
            >
              Create Student Account
            </Text>
          )}
        </Pressable>

        {/* LOGIN */}
        <Pressable
          onPress={() =>
            router.replace('/login')
          }
          disabled={isSubmitting}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
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
    padding: 24,
    paddingBottom: 140,
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
    marginBottom: 22,
  },

  /* CAREER GOALS */

  goalsCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#312E81',
    marginBottom: 5,
  },

  goalsSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6366F1',
    maxWidth: 280,
  },

  goalCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  goalCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  goalsList: {
    gap: 8,
  },

  goalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  goalIcon: {
    fontSize: 20,
  },

  goalText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  goalCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  changeGoalsButton: {
    marginTop: 14,
    alignItems: 'center',
  },

  changeGoalsText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '600',
  },

  /* FORM */

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

  optionalText: {
    color: '#64748B',
    fontWeight: '400',
  },

  fieldHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -10,
    marginBottom: 17,
  },

  dropdownInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  dropdownInputText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingRight: 10,
  },

  dropdownPlaceholder: {
    color: '#94A3B8',
  },

  dropdownArrow: {
    fontSize: 22,
    color: '#4338CA',
    fontWeight: '700',
    marginTop: -5,
  },

  /* DROPDOWN MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },

  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '75%',
    overflow: 'hidden',
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  dropdownClose: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },

  dropdownList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  dropdownOption: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },

  dropdownOptionSelected: {
    backgroundColor: '#EEF2FF',
  },

  dropdownOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },

  dropdownOptionTextSelected: {
    color: '#4338CA',
    fontWeight: '700',
  },

  dropdownCheck: {
    color: '#4338CA',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },

  /* PASSWORD */

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

  /* REGISTER BUTTON */

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

  otherQualificationContainer: {
    marginBottom: 0,
  },
});