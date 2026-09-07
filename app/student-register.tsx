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
import { router, useLocalSearchParams } from 'expo-router';

export default function StudentRegisterScreen() {
  const params = useLocalSearchParams();

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
    const year = Number(value);

    return (
      Number.isInteger(year) &&
      year >= 1 &&
      year <= 6
    );
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

      /*
       * FRONTEND ONLY
       *
       * No API
       * No PHP
       * No database
       *
       * Backend integration will be added later.
       */

      console.log('Student registration completed frontend checks:', {
        fullName: cleanFullName,
        email: cleanEmail,
        studentNumber: cleanStudentNumber,
        qualification: cleanQualification,
        yearOfStudy: Number(cleanYearOfStudy),
        campus: cleanCampus,
        careerGoals: goalIds,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      Alert.alert(
        'Registration Ready',
        'Your student registration has passed the frontend checks.'
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
        <Text style={styles.back}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}
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
                These goals will help personalise your CareerForgeAI experience.
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
              const goal = goalDetails[goalId];

              if (!goal) {
                return null;
              }

              return (
                <View
                  key={goalId}
                  style={styles.goalItem}
                >
                  <View style={styles.goalIconContainer}>
                    <Text style={styles.goalIcon}>
                      {goal.icon}
                    </Text>
                  </View>

                  <Text style={styles.goalText}>
                    {goal.title}
                  </Text>

                  <View style={styles.checkCircle}>
                    <Text style={styles.goalCheck}>
                      ✓
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Change Goals */}
          <Pressable
            style={styles.changeGoalsButton}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.changeGoalsText}>
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
        editable={!isSubmitting}
      />

      {/* EMAIL */}
      <Text style={styles.label}>
        Email Address
      </Text>

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
        8+ characters with uppercase, lowercase, number and special character
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
        editable={!isSubmitting}
      />

      {/* QUALIFICATION */}
      <Text style={styles.label}>
        Qualification
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. BSc Data Science"
        placeholderTextColor="#94A3B8"
        value={qualification}
        onChangeText={setQualification}
        editable={!isSubmitting}
      />

      {/* YEAR */}
      <Text style={styles.label}>
        Year of Study
      </Text>

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

      {/* CAMPUS */}
      <Text style={styles.label}>
        Campus
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your campus"
        placeholderTextColor="#94A3B8"
        value={campus}
        onChangeText={setCampus}
        editable={!isSubmitting}
      />

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

      {/* LOGIN */}
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
    paddingBottom: 50,
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

