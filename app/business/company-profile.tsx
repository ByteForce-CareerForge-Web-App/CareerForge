import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const COMPANY_PROFILE_KEY = 'careerforge_business_profile';

export default function CompanyProfileScreen() {
  const [editing, setEditing] = useState(false);

  const [companyName, setCompanyName] = useState(
    'ABC Technologies'
  );

  const [industry, setIndustry] = useState(
    'Information Technology'
  );

  const [location, setLocation] = useState(
    'Durban, KwaZulu-Natal'
  );

  const [website, setWebsite] = useState(
    'https://www.abctech.co.za'
  );

  const [description, setDescription] = useState(
    'ABC Technologies is a technology company focused on creating innovative digital solutions and developing young technology talent.'
  );

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved company profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(
        COMPANY_PROFILE_KEY
      );

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);

        setCompanyName(
          profile.companyName || 'ABC Technologies'
        );

        setIndustry(
          profile.industry ||
            'Information Technology'
        );

        setLocation(
          profile.location ||
            'Durban, KwaZulu-Natal'
        );

        setWebsite(
          profile.website ||
            'https://www.abctech.co.za'
        );

        setDescription(
          profile.description ||
            'ABC Technologies is a technology company focused on creating innovative digital solutions and developing young technology talent.'
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

  // Pick business logo
  const handlePickLogo = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access so you can select your business logo.'
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

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to select the business logo.'
      );
    }
  };

  // Save company profile
  const handleSave = async () => {
    try {
      let formattedWebsite = website.trim();

      if (
        formattedWebsite &&
        !formattedWebsite.startsWith('http://') &&
        !formattedWebsite.startsWith('https://')
      ) {
        formattedWebsite =
          `https://${formattedWebsite}`;
      }

      const profile = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        location: location.trim(),
        website: formattedWebsite,
        description: description.trim(),
        logoUri,
      };

      await AsyncStorage.setItem(
        COMPANY_PROFILE_KEY,
        JSON.stringify(profile)
      );

      setWebsite(formattedWebsite);
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

  // Open company website
  const handleOpenWebsite = async () => {
    let url = website.trim();

    if (!url) {
      Alert.alert(
        'No Website',
        'No company website has been added yet.'
      );
      return;
    }

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
          'The website link could not be opened.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Open Website',
        'Please check that the website address is correct.'
      );
    }
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
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                '/business/dashboard'
              );
            }
          }}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Company Profile
        </Text>

        <Pressable
          style={styles.editButton}
          onPress={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {editing ? 'Save' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* COMPANY HEADER */}
        <View style={styles.companyCard}>
          <Pressable
            style={styles.logoContainer}
            onPress={editing ? handlePickLogo : undefined}
          >
            {logoUri ? (
              <Image
                source={{ uri: logoUri }}
                style={styles.companyLogoImage}
              />
            ) : (
              <View style={styles.companyLogo}>
                <Text style={styles.logoText}>
                  AT
                </Text>
              </View>
            )}

            {editing && (
              <View style={styles.changeLogoBadge}>
                <Text style={styles.changeLogoText}>
                  📷
                </Text>
              </View>
            )}
          </Pressable>

          {editing && (
            <Pressable
              style={styles.changeLogoButton}
              onPress={handlePickLogo}
            >
              <Text style={styles.changeLogoButtonText}>
                {logoUri
                  ? 'Change Business Logo'
                  : 'Add Business Logo'}
              </Text>
            </Pressable>
          )}

          {editing ? (
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              style={styles.companyNameInput}
              placeholder="Company name"
            />
          ) : (
            <Text style={styles.companyName}>
              {companyName}
            </Text>
          )}

          <Text style={styles.verifiedText}>
            ✓ Verified Business
          </Text>

          <Text style={styles.memberText}>
            Business account • Active
          </Text>
        </View>

        {/* COMPANY INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Company Information
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.label}>
              Industry
            </Text>

            {editing ? (
              <TextInput
                value={industry}
                onChangeText={setIndustry}
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>
                {industry}
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>
              Location
            </Text>

            {editing ? (
              <TextInput
                value={location}
                onChangeText={setLocation}
                style={styles.input}
              />
            ) : (
              <Text style={styles.value}>
                {location}
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>
              Website
            </Text>

            {editing ? (
              <TextInput
                value={website}
                onChangeText={setWebsite}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="https://yourcompany.com"
              />
            ) : (
              <Pressable
                onPress={handleOpenWebsite}
                disabled={!website}
              >
                <Text
                  style={[
                    styles.websiteValue,
                    !website &&
                      styles.disabledWebsite,
                  ]}
                >
                  {website ||
                    'No website added'}
                </Text>
              </Pressable>
            )}

            {!editing && website && (
              <Text style={styles.websiteHint}>
                Tap the website to open it
              </Text>
            )}
          </View>
        </View>

        {/* ABOUT COMPANY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About Company
          </Text>

          <View style={styles.infoCard}>
            {editing ? (
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.description}>
                {description}
              </Text>
            )}
          </View>
        </View>

        {/* HIRING STATISTICS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Hiring Overview
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                4
              </Text>

              <Text style={styles.statLabel}>
                Active Jobs
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                229
              </Text>

              <Text style={styles.statLabel}>
                Applications
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                18
              </Text>

              <Text style={styles.statLabel}>
                Shortlisted
              </Text>
            </View>
          </View>
        </View>

        {/* VERIFICATION */}
        <View style={styles.verificationCard}>
          <Text style={styles.verificationTitle}>
            ✓ Business Verified
          </Text>

          <Text style={styles.verificationText}>
            Your company has been verified by
            CareerForgeAI. You can post
            opportunities and manage candidate
            applications.
          </Text>
        </View>

        {/* ACTIONS */}
        {!editing && (
          <View style={styles.section}>
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
              <Text
                style={styles.secondaryButtonText}
              >
                + Post New Opportunity
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  editButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },

  logoContainer: {
    position: 'relative',
    marginBottom: 14,
  },

  companyLogo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyLogoImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },

  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  changeLogoBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  changeLogoText: {
    fontSize: 15,
  },

  changeLogoButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },

  changeLogoButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  companyName: {
    fontSize: 23,
    fontWeight: '700',
    color: '#0F172A',
  },

  companyNameInput: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#2563EB',
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 220,
  },

  verifiedText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },

  memberText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  websiteValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },

  disabledWebsite: {
    color: '#94A3B8',
  },

  websiteHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },

  descriptionInput: {
    minHeight: 110,
  },

  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '700',
    color: '#2563EB',
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  verificationCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
  },

  verificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#047857',
  },

  verificationText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 19,
    marginTop: 6,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
});