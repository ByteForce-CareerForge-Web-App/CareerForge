
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { API_BASE_URL } from '@/constants/api';

const EXPERIENCE_STORAGE_KEY = 'careerforge_experience';
const PROFILE_STORAGE_KEY = 'careerforge_student_profile';
const PROFILE_PICTURE_STORAGE_KEY =
  'careerforge_student_profile_picture';
const CONNECTIONS_KEY = 'careerforge_connections';
const REQUESTS_KEY = 'careerforge_connection_requests';

const EXPERIENCE_TYPES: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; title: string }
> = {
  internship: {
    icon: 'briefcase-outline',
    title: 'Internships',
  },
  projects: {
    icon: 'rocket-outline',
    title: 'Projects',
  },
  volunteering: {
    icon: 'people-outline',
    title: 'Volunteering',
  },
  work: {
    icon: 'business-outline',
    title: 'Work Experience',
  },
  certifications: {
    icon: 'ribbon-outline',
    title: 'Certifications',
  },
  extracurricular: {
    icon: 'star-outline',
    title: 'Extracurricular Activities',
  },
};

type StudentProfileData = {
  fullName: string;
  email: string;
  qualification: string;
  targetRole: string;
  yearOfStudy: string;
  campus: string;
  bio: string;
};

const DEFAULT_PROFILE: StudentProfileData = {
  fullName: 'Student Name',
  email: 'student@example.com',
  qualification: 'BSc Data Science',
  targetRole: '',
  yearOfStudy: '2nd Year',
  campus: 'Richfield Campus',
  bio: 'Aspiring data professional interested in technology, analytics and artificial intelligence.',
};

export default function StudentProfile() {
  const [fullName, setFullName] = useState(
    DEFAULT_PROFILE.fullName
  );

  const [email, setEmail] = useState(
    DEFAULT_PROFILE.email
  );

  const [qualification, setQualification] = useState(
    DEFAULT_PROFILE.qualification
  );

  const [targetRole, setTargetRole] = useState(
    DEFAULT_PROFILE.targetRole
  );

  const [yearOfStudy, setYearOfStudy] = useState(
    DEFAULT_PROFILE.yearOfStudy
  );

  const [campus, setCampus] = useState(
    DEFAULT_PROFILE.campus
  );

  const [bio, setBio] = useState(
    DEFAULT_PROFILE.bio
  );

  const [profilePicture, setProfilePicture] =
    useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [experience, setExperience] = useState<string[]>([]);
  const [loadingExperience, setLoadingExperience] =
    useState(true);

  const [connectionCount, setConnectionCount] =
    useState(0);

  const [pendingCount, setPendingCount] =
    useState(0);

  const loadData = useCallback(async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | LOAD REAL PROFILE FROM BACKEND
      |--------------------------------------------------------------------------
      */

      const authToken =
        await AsyncStorage.getItem('authToken');

      if (authToken) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/profiles/student.php`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
              },
            }
          );

          const result = await response.json();

          console.log(
            'Student profile API response:',
            result
          );

          /*
          |--------------------------------------------------------------------------
          | SUPPORT BACKEND RESPONSE FORMAT
          |--------------------------------------------------------------------------
          | The current backend returns the student inside result.data.
          | result.student is also supported for compatibility.
          */

          const student =
            result?.data ??
            result?.student ??
            null;

          if (
            response.ok &&
            result?.success &&
            student
          ) {
            const backendYear = Number(
              student.year_of_study
            );

            let formattedYear =
              DEFAULT_PROFILE.yearOfStudy;

            if (
              backendYear >= 1 &&
              backendYear <= 6
            ) {
              const suffix =
                backendYear === 1
                  ? 'st'
                  : backendYear === 2
                  ? 'nd'
                  : backendYear === 3
                  ? 'rd'
                  : 'th';

              formattedYear = `${backendYear}${suffix} Year`;
            }

            const backendProfile: StudentProfileData = {
              fullName:
                student.name ||
                DEFAULT_PROFILE.fullName,

              email:
                student.email ||
                DEFAULT_PROFILE.email,

              qualification:
                student.qualification ||
                DEFAULT_PROFILE.qualification,

              targetRole:
                student.target_role ||
                DEFAULT_PROFILE.targetRole,

              yearOfStudy: formattedYear,

              campus:
                student.campus ||
                DEFAULT_PROFILE.campus,

              bio:
                student.bio ||
                DEFAULT_PROFILE.bio,
            };

            setFullName(
              backendProfile.fullName
            );

            setEmail(
              backendProfile.email
            );

            setQualification(
              backendProfile.qualification
            );

            setTargetRole(
              backendProfile.targetRole
            );

            setYearOfStudy(
              backendProfile.yearOfStudy
            );

            setCampus(
              backendProfile.campus
            );

            setBio(
              backendProfile.bio
            );

            /*
            |--------------------------------------------------------------------------
            | KEEP LOCAL CACHE UPDATED
            |--------------------------------------------------------------------------
            */

            await AsyncStorage.setItem(
              PROFILE_STORAGE_KEY,
              JSON.stringify(backendProfile)
            );
          } else {
            /*
            |--------------------------------------------------------------------------
            | FALL BACK TO LOCAL PROFILE
            |--------------------------------------------------------------------------
            */

            const savedProfile =
              await AsyncStorage.getItem(
                PROFILE_STORAGE_KEY
              );

            if (savedProfile) {
              const parsedProfile: StudentProfileData =
                JSON.parse(savedProfile);

              setFullName(
                parsedProfile.fullName ||
                  DEFAULT_PROFILE.fullName
              );

              setEmail(
                parsedProfile.email ||
                  DEFAULT_PROFILE.email
              );

              setQualification(
                parsedProfile.qualification ||
                  DEFAULT_PROFILE.qualification
              );

              setTargetRole(
                parsedProfile.targetRole ||
                  DEFAULT_PROFILE.targetRole
              );

              setYearOfStudy(
                parsedProfile.yearOfStudy ||
                  DEFAULT_PROFILE.yearOfStudy
              );

              setCampus(
                parsedProfile.campus ||
                  DEFAULT_PROFILE.campus
              );

              setBio(
                parsedProfile.bio ||
                  DEFAULT_PROFILE.bio
              );
            }
          }
        } catch (backendError) {
          console.log(
            'Error loading profile from backend:',
            backendError
          );

          /*
          |--------------------------------------------------------------------------
          | FALL BACK TO LOCAL PROFILE IF BACKEND FAILS
          |--------------------------------------------------------------------------
          */

          const savedProfile =
            await AsyncStorage.getItem(
              PROFILE_STORAGE_KEY
            );

          if (savedProfile) {
            const parsedProfile: StudentProfileData =
              JSON.parse(savedProfile);

            setFullName(
              parsedProfile.fullName ||
                DEFAULT_PROFILE.fullName
            );

            setEmail(
              parsedProfile.email ||
                DEFAULT_PROFILE.email
            );

            setQualification(
              parsedProfile.qualification ||
                DEFAULT_PROFILE.qualification
            );

            setTargetRole(
              parsedProfile.targetRole ||
                DEFAULT_PROFILE.targetRole
            );

            setYearOfStudy(
              parsedProfile.yearOfStudy ||
                DEFAULT_PROFILE.yearOfStudy
            );

            setCampus(
              parsedProfile.campus ||
                DEFAULT_PROFILE.campus
            );

            setBio(
              parsedProfile.bio ||
                DEFAULT_PROFILE.bio
            );
          }
        }
      } else {
        /*
        |--------------------------------------------------------------------------
        | NO AUTH TOKEN — LOAD LOCAL PROFILE
        |--------------------------------------------------------------------------
        */

        const savedProfile =
          await AsyncStorage.getItem(
            PROFILE_STORAGE_KEY
          );

        if (savedProfile) {
          const parsedProfile: StudentProfileData =
            JSON.parse(savedProfile);

          setFullName(
            parsedProfile.fullName ||
              DEFAULT_PROFILE.fullName
          );

          setEmail(
            parsedProfile.email ||
              DEFAULT_PROFILE.email
          );

          setQualification(
            parsedProfile.qualification ||
              DEFAULT_PROFILE.qualification
          );

          setTargetRole(
            parsedProfile.targetRole ||
              DEFAULT_PROFILE.targetRole
          );

          setYearOfStudy(
            parsedProfile.yearOfStudy ||
              DEFAULT_PROFILE.yearOfStudy
          );

          setCampus(
            parsedProfile.campus ||
              DEFAULT_PROFILE.campus
          );

          setBio(
            parsedProfile.bio ||
              DEFAULT_PROFILE.bio
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD PROFILE PICTURE
      |--------------------------------------------------------------------------
      */

      const savedProfilePicture =
        await AsyncStorage.getItem(
          PROFILE_PICTURE_STORAGE_KEY
        );

      setProfilePicture(
        savedProfilePicture || null
      );

      /*
      |--------------------------------------------------------------------------
      | LOAD EXPERIENCE
      |--------------------------------------------------------------------------
      */

      const savedExperience =
        await AsyncStorage.getItem(
          EXPERIENCE_STORAGE_KEY
        );

      if (savedExperience) {
        const parsedExperience =
          JSON.parse(savedExperience);

        setExperience(
          Array.isArray(parsedExperience)
            ? parsedExperience
            : []
        );
      } else {
        setExperience([]);
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD CONNECTIONS
      |--------------------------------------------------------------------------
      */

      const savedConnections =
        await AsyncStorage.getItem(
          CONNECTIONS_KEY
        );

      if (savedConnections) {
        const parsedConnections =
          JSON.parse(savedConnections);

        setConnectionCount(
          Array.isArray(parsedConnections)
            ? parsedConnections.length
            : 0
        );
      } else {
        setConnectionCount(0);
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD PENDING REQUESTS
      |--------------------------------------------------------------------------
      */

      const savedRequests =
        await AsyncStorage.getItem(
          REQUESTS_KEY
        );

      if (savedRequests) {
        const parsedRequests =
          JSON.parse(savedRequests);

        setPendingCount(
          Array.isArray(parsedRequests)
            ? parsedRequests.length
            : 0
        );
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.log(
        'Error loading profile data:',
        error
      );

      setExperience([]);
      setConnectionCount(0);
      setPendingCount(0);
    } finally {
      setLoadingExperience(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // PROFILE PICTURE UPLOAD
  const handleProfilePicture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Photo Access Required',
          'Please allow CareerForgeAI to access your photos so you can choose a profile picture.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        const selectedImage =
          result.assets[0].uri;

        setProfilePicture(selectedImage);

        await AsyncStorage.setItem(
          PROFILE_PICTURE_STORAGE_KEY,
          selectedImage
        );
      }
    } catch (error) {
      console.log(
        'Error selecting profile picture:',
        error
      );

      Alert.alert(
        'Unable to Select Photo',
        'Something went wrong while selecting your profile picture. Please try again.'
      );
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await AsyncStorage.removeItem(
        PROFILE_PICTURE_STORAGE_KEY
      );

      setProfilePicture(null);
    } catch (error) {
      console.log(
        'Error removing profile picture:',
        error
      );
    }
  };

  const handleProfilePicturePress = () => {
    if (profilePicture) {
      Alert.alert(
        'Profile Picture',
        'What would you like to do?',
        [
          {
            text: 'Change Picture',
            onPress: handleProfilePicture,
          },
          {
            text: 'Remove Picture',
            style: 'destructive',
            onPress:
              handleRemoveProfilePicture,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      handleProfilePicture();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = async () => {
    try {
      const savedProfile =
        await AsyncStorage.getItem(
          PROFILE_STORAGE_KEY
        );

      if (savedProfile) {
        const parsedProfile: StudentProfileData =
          JSON.parse(savedProfile);

        setFullName(
          parsedProfile.fullName ||
            DEFAULT_PROFILE.fullName
        );

        setEmail(
          parsedProfile.email ||
            DEFAULT_PROFILE.email
        );

        setQualification(
          parsedProfile.qualification ||
            DEFAULT_PROFILE.qualification
        );

        setTargetRole(
          parsedProfile.targetRole ||
            DEFAULT_PROFILE.targetRole
        );

        setYearOfStudy(
          parsedProfile.yearOfStudy ||
            DEFAULT_PROFILE.yearOfStudy
        );

        setCampus(
          parsedProfile.campus ||
            DEFAULT_PROFILE.campus
        );

        setBio(
          parsedProfile.bio ||
            DEFAULT_PROFILE.bio
        );
      } else {
        setFullName(DEFAULT_PROFILE.fullName);
        setEmail(DEFAULT_PROFILE.email);
        setQualification(
          DEFAULT_PROFILE.qualification
        );
        setTargetRole(
          DEFAULT_PROFILE.targetRole
        );
        setYearOfStudy(
          DEFAULT_PROFILE.yearOfStudy
        );
        setCampus(DEFAULT_PROFILE.campus);
        setBio(DEFAULT_PROFILE.bio);
      }

      Keyboard.dismiss();
      setIsEditing(false);
    } catch (error) {
      console.log(
        'Error cancelling profile edit:',
        error
      );

      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    try {
      const authToken =
        await AsyncStorage.getItem('authToken');

      if (!authToken) {
        Alert.alert(
          'Authentication Required',
          'Your session has expired. Please log in again.'
        );
        return;
      }

      const trimmedFullName =
        fullName.trim();

      const trimmedEmail =
        email.trim();

      const trimmedQualification =
        qualification.trim();

      const trimmedTargetRole =
        targetRole.trim();

      const trimmedYearOfStudy =
        yearOfStudy.trim();

      const trimmedCampus =
        campus.trim();

      const trimmedBio =
        bio.trim();

      if (!trimmedFullName) {
        Alert.alert(
          'Missing Information',
          'Please enter your full name.'
        );
        return;
      }

      if (!trimmedEmail) {
        Alert.alert(
          'Missing Information',
          'Please enter your email address.'
        );
        return;
      }

      if (!trimmedQualification) {
        Alert.alert(
          'Missing Information',
          'Please enter your qualification.'
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CONVERT "2nd Year" INTO 2
      |--------------------------------------------------------------------------
      */

      const yearMatch =
        trimmedYearOfStudy.match(/\d+/);

      const numericYear = yearMatch
        ? Number(yearMatch[0])
        : 0;

      if (
        numericYear < 1 ||
        numericYear > 6
      ) {
        Alert.alert(
          'Invalid Year of Study',
          'Please enter a valid year of study from 1st Year to 6th Year.'
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE BACKEND
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${API_BASE_URL}/profiles/student.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            fullName: trimmedFullName,
            email: trimmedEmail,
            qualification:
              trimmedQualification,
            targetRole:
              trimmedTargetRole,
            yearOfStudy: numericYear,
            campus: trimmedCampus,
            bio: trimmedBio,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to update your profile.'
        );
      }

      /*
      |--------------------------------------------------------------------------
      | KEEP LOCAL PROFILE CACHE
      |--------------------------------------------------------------------------
      */

      const updatedProfile: StudentProfileData = {
        fullName: trimmedFullName,
        email: trimmedEmail,
        qualification:
          trimmedQualification,
        targetRole:
          trimmedTargetRole,
        yearOfStudy:
          trimmedYearOfStudy,
        campus: trimmedCampus,
        bio: trimmedBio,
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE UI
      |--------------------------------------------------------------------------
      */

      setFullName(
        updatedProfile.fullName
      );

      setEmail(
        updatedProfile.email
      );

      setQualification(
        updatedProfile.qualification
      );

      setTargetRole(
        updatedProfile.targetRole
      );

      setYearOfStudy(
        updatedProfile.yearOfStudy
      );

      setCampus(
        updatedProfile.campus
      );

      setBio(
        updatedProfile.bio
      );

      Keyboard.dismiss();
      setIsEditing(false);

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.'
      );
    } catch (error) {
      console.log(
        'Error saving profile:',
        error
      );

      Alert.alert(
        'Unable to Save Profile',
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your profile. Please try again.'
      );
    }
  };

  const initials =
    fullName.trim().length > 0
      ? fullName
          .trim()
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'ST';

  const completion =
    experience.length > 0 ? 90 : 80;

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* TOP HEADER */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace(
                  '/student/dashboard'
                );
              }
            }}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <View>
            <Text style={styles.topTitle}>
              My Profile
            </Text>
            <Text style={styles.topSubtitle}>
              Build your professional identity
            </Text>
          </View>

          <View style={styles.topIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* PROFILE HERO */}
        <View style={styles.profileHero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          {/* PROFILE PICTURE */}
          <Pressable
            style={styles.avatarOuter}
            onPress={handleProfilePicturePress}
          >
            <View style={styles.avatar}>
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              )}
            </View>

            <View style={styles.onlineDot}>
              <Ionicons
                name="checkmark"
                size={12}
                color="#FFFFFF"
              />
            </View>

            {/* CAMERA BUTTON */}
            <View style={styles.cameraButton}>
              <Ionicons
                name="camera"
                size={15}
                color="#FFFFFF"
              />
            </View>
          </Pressable>

          <Text style={styles.changePhotoText}>
            {profilePicture
              ? 'Tap to change profile picture'
              : 'Tap to add profile picture'}
          </Text>

          <Text style={styles.profileName}>
            {fullName}
          </Text>

          <Text style={styles.profileQualification}>
            {qualification}
          </Text>

          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="school-outline"
                size={14}
                color="#C7D7FF"
              />
              <Text style={styles.metaText}>
                {campus}
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#C7D7FF"
              />
              <Text style={styles.metaText}>
                {yearOfStudy}
              </Text>
            </View>
          </View>

          <View style={styles.studentBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#DCE7FF"
            />

            <Text style={styles.studentBadgeText}>
              CareerForgeAI Student
            </Text>
          </View>
        </View>

        {/* EDIT CONTROLS */}
        <View style={styles.editControls}>
          {!isEditing ? (
            <Pressable
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.editButtonText}>
                Edit Profile
              </Text>
            </Pressable>
          ) : (
            <View style={styles.editModeButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Ionicons
                  name="close-outline"
                  size={18}
                  color="#475569"
                />

                <Text
                  style={styles.cancelButtonText}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveChangesButton}
                onPress={handleSave}
              >
                <Ionicons
                  name="checkmark-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveChangesText}
                >
                  Save Changes
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* PROFILE COMPLETION */}
        <View style={styles.completionCard}>
          <View style={styles.cardAccent} />

          <View style={styles.completionHeader}>
            <View
              style={styles.completionIconBox}
            >
              <Ionicons
                name="analytics-outline"
                size={21}
                color="#2457E6"
              />
            </View>

            <View
              style={styles.completionTextContainer}
            >
              <Text
                style={styles.completionTitle}
              >
                Profile Completion
              </Text>

              <Text
                style={styles.completionSubtitle}
              >
                Keep your career information up to
                date
              </Text>
            </View>

            <Text
              style={styles.completionPercentage}
            >
              {completion}%
            </Text>
          </View>

          <View
            style={styles.progressBackground}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completion}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressLabel}>
              Career profile strength
            </Text>

            <View style={styles.progressStatus}>
              <View style={styles.greenDot} />
              <Text style={styles.progressStatusText}>
                {completion >= 90
                  ? 'Excellent'
                  : 'Good progress'}
              </Text>
            </View>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="person-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Personal Information
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your basic profile details
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            Full Name
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="person-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {fullName}
              </Text>
            </View>
          )}

          <View style={styles.fieldSpacing} />

          <Text style={styles.label}>
            Email Address
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="mail-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {email}
              </Text>
            </View>
          )}

          <View style={styles.fieldSpacing} />

          <Text style={styles.label}>
            Qualification
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={qualification}
              onChangeText={setQualification}
              placeholder="Enter your qualification"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="school-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {qualification}
              </Text>
            </View>
          )}

          <View style={styles.fieldSpacing} />

          <Text style={styles.label}>
            Target Career
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={targetRole}
              onChangeText={setTargetRole}
              placeholder="e.g. Software Developer"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="briefcase-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {targetRole || 'Not specified'}
              </Text>
            </View>
          )}

          <View style={styles.fieldSpacing} />

          <Text style={styles.label}>
            Year of Study
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={yearOfStudy}
              onChangeText={setYearOfStudy}
              placeholder="Enter your year of study"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              blurOnSubmit
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {yearOfStudy}
              </Text>
            </View>
          )}

          <View style={styles.fieldSpacing} />

          <Text style={styles.label}>
            Campus
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={campus}
              onChangeText={setCampus}
              placeholder="Enter your campus"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          ) : (
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#2457E6"
              />
              <Text style={styles.detailValue}>
                {campus}
              </Text>
            </View>
          )}
        </View>

        {/* ABOUT ME */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="document-text-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              About Me
            </Text>
            <Text style={styles.sectionSubtitle}>
              Tell employers what makes you unique
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            Professional Bio
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell employers about yourself..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.bioContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={19}
                color="#4C7DFF"
              />

              <Text style={styles.bioText}>
                {bio}
              </Text>
            </View>
          )}
        </View>

        {/* EXPERIENCE */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="briefcase-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Experience
            </Text>
            <Text style={styles.sectionSubtitle}>
              Showcase your career development
            </Text>
          </View>
        </View>

        <View style={styles.experienceCard}>
          {loadingExperience ? (
            <View style={styles.loadingContainer}>
              <Ionicons
                name="sync-outline"
                size={22}
                color="#2457E6"
              />

              <Text
                style={styles.experienceLoading}
              >
                Loading experience...
              </Text>
            </View>
          ) : experience.length === 0 ? (
            <>
              <View style={styles.emptyExperience}>
                <View
                  style={styles.emptyExperienceIcon}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={30}
                    color="#2457E6"
                  />
                </View>

                <Text
                  style={styles.emptyExperienceTitle}
                >
                  No experience added yet
                </Text>

                <Text
                  style={styles.emptyExperienceText}
                >
                  Add internships, projects,
                  volunteering, work experience,
                  certifications or activities.
                </Text>
              </View>

              <Pressable
                style={styles.experienceButton}
                onPress={() =>
                  router.push(
                    '/student/experience'
                  )
                }
              >
                <Ionicons
                  name="add-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.experienceButtonText
                  }
                >
                  Add Your Experience
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.experienceHeader}>
                <View>
                  <Text
                    style={
                      styles.experienceCardTitle
                    }
                  >
                    Your Experience
                  </Text>

                  <Text
                    style={
                      styles.experienceCardSubtitle
                    }
                  >
                    {experience.length} experience
                    type
                    {experience.length !== 1
                      ? 's'
                      : ''}{' '}
                    selected
                  </Text>
                </View>

                <View
                  style={styles.experienceCount}
                >
                  <Text
                    style={
                      styles.experienceCountText
                    }
                  >
                    {experience.length}
                  </Text>
                </View>
              </View>

              <View style={styles.experienceList}>
                {experience.map(
                  (experienceId: string) => {
                    const item =
                      EXPERIENCE_TYPES[
                        experienceId
                      ];

                    if (!item) {
                      return null;
                    }

                    return (
                      <View
                        key={experienceId}
                        style={
                          styles.experienceItem
                        }
                      >
                        <View
                          style={
                            styles.experienceItemIcon
                          }
                        >
                          <Ionicons
                            name={item.icon}
                            size={19}
                            color="#2457E6"
                          />
                        </View>

                        <Text
                          style={
                            styles.experienceItemText
                          }
                        >
                          {item.title}
                        </Text>

                        <View
                          style={
                            styles.experienceCheck
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                      </View>
                    );
                  }
                )}
              </View>

              <Pressable
                style={styles.experienceButton}
                onPress={() =>
                  router.push(
                    '/student/experience'
                  )
                }
              >
                <Ionicons
                  name="add-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.experienceButtonText
                  }
                >
                  Add Your Experience
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* CAREER PROFILE */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="trending-up-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Career Profile
            </Text>
            <Text style={styles.sectionSubtitle}>
              Strengthen your employability profile
            </Text>
          </View>
        </View>

        {/* CAREER GOALS */}
        <View style={styles.infoCard}>
          <View style={styles.infoAccent} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons
                name="flag-outline"
                size={22}
                color="#2457E6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Career Goals
              </Text>

              <Text style={styles.infoText}>
                Your selected career goals help
                CareerForgeAI personalise your
                roadmap.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                '/student/career-goals'
              )
            }
          >
            <Text
              style={styles.secondaryButtonText}
            >
              Update Career Goals
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#2457E6"
            />
          </Pressable>
        </View>

        {/* SKILLS */}
        <View style={styles.infoCard}>
          <View style={styles.infoAccent} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons
                name="bulb-outline"
                size={22}
                color="#2457E6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Skills
              </Text>

              <Text style={styles.infoText}>
                Add and manage the skills that you
                want employers to see.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/student/skills')
            }
          >
            <Text
              style={styles.secondaryButtonText}
            >
              Manage Skills
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#2457E6"
            />
          </Pressable>
        </View>

        {/* IMPROVE CV */}
        <View style={styles.infoCard}>
          <View style={styles.infoAccent} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#2457E6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Improve My CV
              </Text>

              <Text style={styles.infoText}>
                Review and improve the different
                sections of your CV to make your
                profile more attractive to employers.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/student/improve-cv')
            }
          >
            <Text
              style={styles.secondaryButtonText}
            >
              Improve My CV
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#2457E6"
            />
          </Pressable>
        </View>

        {/* MY NETWORK */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="people-outline"
              size={19}
              color="#2457E6"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              My Network
            </Text>
            <Text style={styles.sectionSubtitle}>
              Grow your professional connections
            </Text>
          </View>
        </View>

        <View style={styles.networkCard}>
          <View style={styles.networkTop}>
            <View style={styles.networkIcon}>
              <Ionicons
                name="people-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.networkContent}>
              <Text style={styles.networkTitle}>
                Connections
              </Text>

              <Text style={styles.networkText}>
                Build your professional network with
                students, alumni and other
                CareerForgeAI members.
              </Text>
            </View>
          </View>

          <View style={styles.networkStats}>
            <View style={styles.networkStat}>
              <Text
                style={styles.networkStatNumber}
              >
                {connectionCount}
              </Text>

              <Text
                style={styles.networkStatLabel}
              >
                Connections
              </Text>
            </View>

            <View style={styles.networkDivider} />

            <View style={styles.networkStat}>
              <Text
                style={styles.networkStatNumber}
              >
                {pendingCount}
              </Text>

              <Text
                style={styles.networkStatLabel}
              >
                Pending
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.networkButton}
            onPress={() =>
              router.push(
                '/student/connections'
              )
            }
          >
            <Text style={styles.networkButtonText}>
              View My Network
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* SECURITY */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#2457E6"
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Profile Security
            </Text>

            <Text style={styles.securityText}>
              Your profile information is locked by
              default. Press Edit to make changes.
              Your changes are only applied when you
              select Save Changes.
            </Text>
          </View>
        </View>

        {/* TIP */}
        <View style={styles.tipCard}>
          <View style={styles.tipTop}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="sparkles-outline"
                size={19}
                color="#2457E6"
              />
            </View>

            <Text style={styles.tipTitle}>
              Profile Tip
            </Text>
          </View>

          <Text style={styles.tipText}>
            A complete profile helps you stand out
            to employers and improves the accuracy
            of your CareerForgeAI recommendations.
          </Text>
        </View>

        <Text style={styles.footer}>
          CareerForgeAI • Empowering Your Career
        </Text>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },

  container: {
    paddingBottom: 45,
  },

  /* TOP HEADER */

  topBar: {
    backgroundColor: '#102A72',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  topSubtitle: {
    fontSize: 11,
    color: '#C7D7FF',
    marginTop: 3,
    textAlign: 'center',
  },

  topIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#173FBD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HERO */

  profileHero: {
    backgroundColor: '#173FBD',
    marginHorizontal: 16,
    marginTop: -1,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },

  heroGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#2457E6',
    opacity: 0.45,
    top: -110,
    right: -70,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#6B8FFF',
    opacity: 0.25,
    bottom: -75,
    left: -50,
  },

  avatarOuter: {
    position: 'relative',
    marginBottom: 5,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#6B8FFF',
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#173FBD',
  },

  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#173FBD',
  },

  cameraButton: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#2457E6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  changePhotoText: {
    fontSize: 10,
    color: '#C7D7FF',
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 2,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },

  profileQualification: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DCE7FF',
    textAlign: 'center',
    marginBottom: 12,
  },

  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 11,
    color: '#DCE7FF',
    marginLeft: 5,
    fontWeight: '600',
  },

  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#6B8FFF',
    marginHorizontal: 12,
  },

  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2457E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B8FFF',
  },

  studentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },

  /* EDIT */

  editControls: {
    paddingHorizontal: 16,
    paddingTop: 18,
    marginBottom: 3,
  },

  editButton: {
    backgroundColor: '#2457E6',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#173FBD',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  editModeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

  saveChangesButton: {
    flex: 1,
    backgroundColor: '#173FBD',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 8,
  },

  saveChangesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* COMPLETION */

  completionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 25,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    shadowColor: '#173FBD',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
    overflow: 'hidden',
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#2457E6',
  },

  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  completionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  completionTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  completionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172A55',
  },

  completionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },

  completionPercentage: {
    fontSize: 21,
    fontWeight: '900',
    color: '#22C55E',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#E5EAF4',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 10,
  },

  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },

  progressLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  progressStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  progressStatusText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '800',
  },

  /* SECTIONS */

  sectionHeading: {
    marginHorizontal: 16,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#172A55',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  /* CARDS */

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    marginBottom: 25,
    shadowColor: '#173FBD',
    shadowOpacity: 0.055,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  detailRow: {
    minHeight: 42,
    backgroundColor: '#F6F8FD',
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#172A55',
    fontWeight: '700',
    marginLeft: 10,
  },

  fieldSpacing: {
    height: 15,
  },

  input: {
    height: 49,
    borderWidth: 1,
    borderColor: '#AFC2EE',
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#172A55',
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#AFC2EE',
    borderRadius: 11,
    padding: 14,
    fontSize: 14,
    color: '#172A55',
    backgroundColor: '#FFFFFF',
  },

  /* BIO */

  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F6FF',
    borderRadius: 12,
    padding: 14,
  },

  bioText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginLeft: 10,
  },

  /* EXPERIENCE */

  experienceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    marginBottom: 25,
    shadowColor: '#173FBD',
    shadowOpacity: 0.055,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  experienceLoading: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 8,
  },

  emptyExperience: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  emptyExperienceIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  emptyExperienceTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172A55',
    marginBottom: 6,
  },

  emptyExperienceText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },

  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  experienceCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172A55',
  },

  experienceCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },

  experienceCount: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  experienceCountText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2457E6',
  },

  experienceList: {
    marginBottom: 15,
  },

  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FD',
    borderRadius: 12,
    padding: 11,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E8EDFA',
  },

  experienceItemIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  experienceItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  experienceCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  experienceButton: {
    backgroundColor: '#2457E6',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  experienceButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6,
  },

  /* INFO CARDS */

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    marginBottom: 14,
    shadowColor: '#173FBD',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
    overflow: 'hidden',
  },

  infoAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#2457E6',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },

  infoIconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172A55',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
  },

  secondaryButton: {
    backgroundColor: '#F3F6FF',
    borderWidth: 1,
    borderColor: '#BFD0F7',
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2457E6',
  },

  /* NETWORK */

  networkCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    marginBottom: 24,
    shadowColor: '#173FBD',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
    overflow: 'hidden',
  },

  networkTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  networkIcon: {
    width: 51,
    height: 51,
    borderRadius: 15,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  networkContent: {
    flex: 1,
  },

  networkTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172A55',
    marginBottom: 5,
  },

  networkText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
  },

  networkStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6FF',
    borderRadius: 13,
    paddingVertical: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E1E8F8',
  },

  networkStat: {
    flex: 1,
    alignItems: 'center',
  },

  networkStatNumber: {
    fontSize: 21,
    fontWeight: '900',
    color: '#2457E6',
    marginBottom: 3,
  },

  networkStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },

  networkDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#CBD5E1',
  },

  networkButton: {
    backgroundColor: '#173FBD',
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  networkButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* SECURITY */

  securityCard: {
    marginHorizontal: 16,
    backgroundColor: '#E8F0FF',
    borderRadius: 17,
    padding: 17,
    marginBottom: 13,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD9FA',
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#173FBD',
    marginBottom: 6,
  },

  securityText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 19,
  },

  /* TIP */

  tipCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    shadowColor: '#173FBD',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  tipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#173FBD',
  },

  tipText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 25,
  },
});

