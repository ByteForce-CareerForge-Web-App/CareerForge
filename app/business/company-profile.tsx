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
      /*
       * ACTIVE JOBS
       *
       * Read opportunities created by the business.
       * Closed opportunities are excluded.
       */
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

        /*
         * If the local opportunity list contains data,
         * use it. Otherwise keep the demo value.
         */
        if (opportunities.length > 0) {
          setActiveJobs(active.length);
        }
      }

      /*
       * APPLICATIONS + SHORTLISTED
       *
       * The application-status object stores candidate
       * application statuses.
       */
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
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={10}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Company Profile
        </Text>

        {!editing ? (
          <Pressable
            style={styles.headerAction}
            onPress={() => setEditing(true)}
            hitSlop={8}
          >
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
            <Text style={styles.headerActionText}>
              Save
            </Text>
          </Pressable>
        )}
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
            {/* COMPANY HEADER */}
            <View style={styles.profileCard}>
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
                  <Text style={styles.verifiedCheck}>
                    ✓
                  </Text>
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
              <Text style={styles.sectionTitle}>
                Company Information
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Industry
                </Text>

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
                <Text style={styles.fieldLabel}>
                  Location
                </Text>

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
                <Text style={styles.fieldLabel}>
                  Website
                </Text>

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
                  >
                    <Text style={styles.websiteText}>
                      {website}
                    </Text>
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
              <Text style={styles.sectionTitle}>
                About Company
              </Text>

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
              <View style={styles.sectionHeaderRow}>
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
                  <Text style={styles.statNumber}>
                    {activeJobs}
                  </Text>

                  <Text style={styles.statLabel}>
                    Active Jobs
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {applications}
                  </Text>

                  <Text style={styles.statLabel}>
                    Applications
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
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
                <Text style={styles.verificationCheck}>
                  ✓
                </Text>
              </View>

              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>
                  Business Verified
                </Text>

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
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSave}
                >
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
                  <Text style={styles.secondaryButtonText}>
                    + Post New Opportunity
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
    backgroundColor: '#F8FAFC',
  },

  keyboardContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    fontSize: 15,
    color: '#64748B',
  },

  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 36,
    lineHeight: 36,
    color: '#0F172A',
    fontWeight: '300',
  },

  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 4,
  },

  headerAction: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  headerActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 14,
  },

  logoContainer: {
    width: 92,
    height: 92,
    borderRadius: 20,
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
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },

  changeLogoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  companyName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },

  companyNameInput: {
    width: '100%',
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
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
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  verifiedText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
  },

  accountStatus: {
    fontSize: 13,
    color: '#64748B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 0,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  field: {
    minHeight: 48,
    justifyContent: 'center',
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  fieldValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
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

  websiteText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },

  emptyValue: {
    fontSize: 15,
    color: '#94A3B8',
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#475569',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E2E8F0',
  },

  verificationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 18,
  },

  verificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  verificationCheck: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  verificationContent: {
    flex: 1,
  },

  verificationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 5,
  },

  verificationText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#166534',
  },

  actions: {
    gap: 10,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
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
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});