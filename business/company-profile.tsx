import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const COMPANY_PROFILE_KEY = 'careerforge_business_profile';
const OPPORTUNITIES_KEY = 'careerforge_business_opportunities';
const APPLICATION_STATUS_KEY =
  'careerforge_business_application_statuses';

type ApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected';

type Opportunity = {
  id: string;
  title?: string;
  company?: string;
  status?: string;
  [key: string]: any;
};

const DEFAULT_COMPANY_NAME = 'ABC Technologies';
const DEFAULT_INDUSTRY = 'Information Technology';
const DEFAULT_LOCATION = 'Durban, KwaZulu-Natal';
const DEFAULT_WEBSITE = 'https://www.abctech.co.za';
const DEFAULT_DESCRIPTION =
  'ABC Technologies is a technology company focused on creating innovative digital solutions and developing young technology talent.';

export default function CompanyProfileScreen() {
  const [editing, setEditing] = useState(false);

  const [companyName, setCompanyName] = useState(
    DEFAULT_COMPANY_NAME
  );
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRY);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [website, setWebsite] = useState(DEFAULT_WEBSITE);
  const [description, setDescription] = useState(
    DEFAULT_DESCRIPTION
  );

  const [logoUri, setLogoUri] = useState<string | null>(null);

  const [activeJobs, setActiveJobs] = useState(4);
  const [applications, setApplications] = useState(229);
  const [shortlisted, setShortlisted] = useState(18);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHiringStats();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        COMPANY_PROFILE_KEY
      );

      if (saved) {
        const profile = JSON.parse(saved);

        setCompanyName(
          profile.companyName || DEFAULT_COMPANY_NAME
        );

        setIndustry(
          profile.industry || DEFAULT_INDUSTRY
        );

        setLocation(
          profile.location || DEFAULT_LOCATION
        );

        setWebsite(
          profile.website || DEFAULT_WEBSITE
        );

        setDescription(
          profile.description || DEFAULT_DESCRIPTION
        );

        setLogoUri(profile.logoUri || null);
      }
    } catch (error) {
      console.log(
        'Error loading company profile:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHiringStats = async () => {
    try {
      const opportunitiesSaved =
        await AsyncStorage.getItem(
          OPPORTUNITIES_KEY
        );

      if (opportunitiesSaved) {
        const opportunities: Opportunity[] =
          JSON.parse(opportunitiesSaved);

        const active = opportunities.filter(
          (opportunity) => {
            const status =
              String(opportunity.status || '')
                .trim()
                .toLowerCase();

            return status !== 'closed';
          }
        );

        if (opportunities.length > 0) {
          setActiveJobs(active.length);
        }
      }

      const statusesSaved =
        await AsyncStorage.getItem(
          APPLICATION_STATUS_KEY
        );

      if (statusesSaved) {
        const statuses = JSON.parse(statusesSaved);

        if (
          statuses &&
          typeof statuses === 'object' &&
          !Array.isArray(statuses)
        ) {
          const statusValues: ApplicationStatus[] =
            Object.values(statuses).filter(
              (status): status is ApplicationStatus =>
                typeof status === 'string'
            ) as ApplicationStatus[];

          if (statusValues.length > 0) {
            setApplications(statusValues.length);

            const shortlistedCount =
              statusValues.filter(
                (status) =>
                  status === 'Shortlisted' ||
                  status === 'Interview'
              ).length;

            setShortlisted(shortlistedCount);
          }
        } else if (Array.isArray(statuses)) {
          const statusValues: ApplicationStatus[] =
            statuses
              .map((item) => {
                if (
                  typeof item === 'string'
                ) {
                  return item;
                }

                if (
                  item &&
                  typeof item.status === 'string'
                ) {
                  return item.status;
                }

                return null;
              })
              .filter(
                (status): status is ApplicationStatus =>
                  typeof status === 'string'
              );

          if (statusValues.length > 0) {
            setApplications(statusValues.length);

            const shortlistedCount =
              statusValues.filter(
                (status) =>
                  status === 'Shortlisted' ||
                  status === 'Interview'
              ).length;

            setShortlisted(shortlistedCount);
          }
        }
      }
    } catch (error) {
      console.log(
        'Error loading hiring statistics:',
        error
      );
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    router.replace('/business/dashboard');
  };

  const handlePickLogo = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to select a company logo.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to select the company logo.'
      );
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    const cleanCompanyName =
      companyName.trim();
    const cleanIndustry =
      industry.trim();
    const cleanLocation =
      location.trim();
    const cleanDescription =
      description.trim();

    let cleanWebsite = website.trim();

    if (
      cleanWebsite &&
      !cleanWebsite.startsWith('http://') &&
      !cleanWebsite.startsWith('https://')
    ) {
      cleanWebsite = `https://${cleanWebsite}`;
    }

    if (!cleanCompanyName) {
      Alert.alert(
        'Missing Information',
        'Please enter the company name.'
      );
      return;
    }

    if (!cleanIndustry) {
      Alert.alert(
        'Missing Information',
        'Please enter the industry.'
      );
      return;
    }

    if (!cleanLocation) {
      Alert.alert(
        'Missing Information',
        'Please enter the company location.'
      );
      return;
    }

    try {
      const profile = {
        companyName: cleanCompanyName,
        industry: cleanIndustry,
        location: cleanLocation,
        website: cleanWebsite,
        description: cleanDescription,
        logoUri,
      };

      await AsyncStorage.setItem(
        COMPANY_PROFILE_KEY,
        JSON.stringify(profile)
      );

      setCompanyName(cleanCompanyName);
      setIndustry(cleanIndustry);
      setLocation(cleanLocation);
      setWebsite(cleanWebsite);
      setDescription(cleanDescription);

      setEditing(false);

      Alert.alert(
        'Profile Updated',
        'Your company profile has been updated successfully.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to save your company profile.'
      );
    }
  };

  const handleOpenWebsite = async () => {
    if (!website.trim()) {
      return;
    }

    let url = website.trim();

    if (
      !url.startsWith('http://') &&
      !url.startsWith('https://')
    ) {
      url = `https://${url}`;
    }

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Open Website',
          'This website could not be opened.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Open Website',
        'Please check the website address.'
      );
    }
  };

  const handleCancelEdit = async () => {
    Keyboard.dismiss();
    await loadProfile();
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="business-outline"
          size={32}
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading company profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              BUSINESS ACCOUNT
            </Text>

            <Text style={styles.headerTitle}>
              Company Profile
            </Text>
          </View>

          {!editing ? (
            <Pressable
              style={styles.headerAction}
              onPress={() => setEditing(true)}
              hitSlop={8}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.headerActionText}>
                Edit
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.headerAction}
              onPress={handleSave}
              hitSlop={8}
            >
              <Ionicons
                name="checkmark"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.headerActionText}>
                Save
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.headerAccent} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 90 : 20
        }
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* PROFILE HERO */}
            <View style={styles.profileCard}>
              <View style={styles.profileTopAccent} />

              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  {logoUri ? (
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.logo}
                    />
                  ) : (
                    <Text style={styles.logoText}>
                      {companyName
                        .trim()
                        .charAt(0)
                        .toUpperCase() || 'A'}
                    </Text>
                  )}
                </View>

                {editing && (
                  <Pressable
                    style={styles.changeLogoButton}
                    onPress={handlePickLogo}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={15}
                      color="#2563EB"
                    />

                    <Text style={styles.changeLogoText}>
                      Change Logo
                    </Text>
                  </Pressable>
                )}
              </View>

              {editing ? (
                <TextInput
                  value={companyName}
                  onChangeText={setCompanyName}
                  style={styles.companyNameInput}
                  placeholder="Company name"
                  placeholderTextColor="#94A3B8"
                  returnKeyType="next"
                  autoCapitalize="words"
                  blurOnSubmit
                />
              ) : (
                <Text style={styles.companyName}>
                  {companyName}
                </Text>
              )}

              <View style={styles.verifiedRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.verifiedText}>
                  Verified Business
                </Text>
              </View>

              <Text style={styles.accountStatus}>
                Business account • Active
              </Text>
            </View>

            {/* COMPANY INFORMATION */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBlue}>
                  <Ionicons
                    name="business-outline"
                    size={19}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    Company Information
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Your public business details
                  </Text>
                </View>
              </View>

              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons
                    name="briefcase-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.fieldLabel}>
                    Industry
                  </Text>
                </View>

                {editing ? (
                  <TextInput
                    value={industry}
                    onChangeText={setIndustry}
                    style={styles.input}
                    placeholder="Enter industry"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {industry}
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.fieldLabel}>
                    Location
                  </Text>
                </View>

                {editing ? (
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    style={styles.input}
                    placeholder="Enter location"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {location}
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons
                    name="globe-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.fieldLabel}>
                    Website
                  </Text>
                </View>

                {editing ? (
                  <TextInput
                    value={website}
                    onChangeText={setWebsite}
                    style={styles.input}
                    placeholder="https://example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                ) : website ? (
                  <Pressable
                    onPress={handleOpenWebsite}
                    style={styles.websiteRow}
                  >
                    <Text style={styles.websiteText}>
                      {website}
                    </Text>

                    <Ionicons
                      name="open-outline"
                      size={16}
                      color="#2563EB"
                    />
                  </Pressable>
                ) : (
                  <Text style={styles.emptyValue}>
                    No website added
                  </Text>
                )}
              </View>
            </View>

            {/* ABOUT COMPANY */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconGold}>
                  <Ionicons
                    name="information-outline"
                    size={19}
                    color="#B88A17"
                  />
                </View>

                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    About Company
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Help graduates understand your organisation
                  </Text>
                </View>
              </View>

              {editing ? (
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[
                    styles.input,
                    styles.descriptionInput,
                  ]}
                  placeholder="Tell candidates about your company"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
              ) : (
                <Text style={styles.description}>
                  {description}
                </Text>
              )}
            </View>

            {/* HIRING OVERVIEW */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBlue}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={19}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    Hiring Overview
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Current recruitment activity
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconBlue}>
                    <Ionicons
                      name="briefcase-outline"
                      size={17}
                      color="#2563EB"
                    />
                  </View>

                  <Text style={styles.statNumber}>
                    {activeJobs}
                  </Text>

                  <Text style={styles.statLabel}>
                    Active Jobs
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <View style={styles.statIconGold}>
                    <Ionicons
                      name="document-text-outline"
                      size={17}
                      color="#B88A17"
                    />
                  </View>

                  <Text style={styles.statNumber}>
                    {applications}
                  </Text>

                  <Text style={styles.statLabel}>
                    Applications
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <View style={styles.statIconGreen}>
                    <Ionicons
                      name="people-outline"
                      size={17}
                      color="#059669"
                    />
                  </View>

                  <Text style={styles.statNumber}>
                    {shortlisted}
                  </Text>

                  <Text style={styles.statLabel}>
                    Shortlisted
                  </Text>
                </View>
              </View>
            </View>

            {/* VERIFICATION */}
            <View style={styles.verificationCard}>
              <View style={styles.verificationIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={19}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.verificationContent}>
                <View style={styles.verificationTitleRow}>
                  <Text style={styles.verificationTitle}>
                    Business Verified
                  </Text>

                  <View style={styles.verifiedMiniBadge}>
                    <Text style={styles.verifiedMiniText}>
                      VERIFIED
                    </Text>
                  </View>
                </View>

                <Text style={styles.verificationText}>
                  Your business has been verified by
                  CareerForgeAI. Verified businesses receive
                  increased trust from graduates.
                </Text>
              </View>
            </View>

            {/* EDIT ACTIONS */}
            {editing && (
              <View style={styles.editActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color="#475569"
                  />

                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Ionicons
                    name="checkmark-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Save Changes
                  </Text>
                </Pressable>
              </View>
            )}

            {/* NORMAL ACTIONS */}
            {!editing && (
              <View style={styles.actions}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setEditing(true)}
                >
                  <Ionicons
                    name="create-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.primaryButtonText}>
                    Edit Company Profile
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() =>
                    router.push(
                      '/business/post-opportunity'
                    )
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={19}
                    color="#2563EB"
                  />

                  <Text style={styles.secondaryButtonText}>
                    Post New Opportunity
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  keyboardContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FC',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 13,
  },

  headerTopRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9FB3CC',
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerAction: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  headerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerAccent: {
    height: 3,
    width: 48,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 3,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  /* PROFILE HERO */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },

  profileTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#2563EB',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 3,
  },

  logoContainer: {
    width: 94,
    height: 94,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2563EB',
  },

  changeLogoButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  changeLogoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  companyName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0B1F3A',
    textAlign: 'center',
    marginBottom: 9,
  },

  companyNameInput: {
    width: '100%',
    fontSize: 21,
    fontWeight: '700',
    color: '#0B1F3A',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },

  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  verifiedText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },

  accountStatus: {
    fontSize: 12,
    color: '#64748B',
  },

  /* GENERAL CARDS */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 19,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 9,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionIconGold: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },

  /* FIELDS */

  field: {
    minHeight: 48,
    justifyContent: 'center',
  },

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  fieldValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
  },

  descriptionInput: {
    minHeight: 130,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  websiteText: {
    flex: 1,
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },

  emptyValue: {
    fontSize: 15,
    color: '#94A3B8',
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },

  /* HIRING STATS */

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  statIconGold: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  statIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },

  statDivider: {
    width: 1,
    height: 72,
    backgroundColor: '#E2E8F0',
  },

  /* VERIFICATION */

  verificationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 18,
  },

  verificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  verificationContent: {
    flex: 1,
  },

  verificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
    gap: 7,
  },

  verificationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
  },

  verifiedMiniBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  verifiedMiniText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#15803D',
  },

  verificationText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#166534',
  },

  /* ACTIONS */

  actions: {
    gap: 10,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  secondaryButtonText: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '700',
  },

  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});