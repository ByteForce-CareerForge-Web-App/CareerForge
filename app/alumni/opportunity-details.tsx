
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

export default function OpportunityDetails() {
  const params = useLocalSearchParams();

  const title =
    typeof params.title === 'string'
      ? params.title
      : 'Junior Data Analyst';

  const company =
    typeof params.company === 'string'
      ? params.company
      : 'TechNova Solutions';

  const location =
    typeof params.location === 'string'
      ? params.location
      : 'Durban, KwaZulu-Natal';

  const type =
    typeof params.type === 'string'
      ? params.type
      : 'Full-time';

  const salary =
    typeof params.salary === 'string' &&
    params.salary.trim().length > 0
      ? params.salary
      : 'Salary not specified';

  const match =
    typeof params.match === 'string'
      ? params.match
      : '94%';

  const description =
    typeof params.description === 'string' &&
    params.description.trim().length > 0
      ? params.description
      : 'No job description provided.';

  const deadline =
    typeof params.deadline === 'string' &&
    params.deadline.trim().length > 0
      ? params.deadline
      : 'Not specified';

  const arrangement =
    typeof params.arrangement === 'string' &&
    params.arrangement.trim().length > 0
      ? params.arrangement
      : 'Not specified';

  const qualification =
    typeof params.qualification === 'string'
      ? params.qualification
      : '';

  const skillsString =
    typeof params.skills === 'string'
      ? params.skills
      : 'Python,SQL,Excel,Power BI';

  const skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  /*
   * ---------------------------------------------------------
   * REAL DATABASE OPPORTUNITY ID
   * ---------------------------------------------------------
   */

  const opportunityId =
    typeof params.id === 'string'
      ? params.id.trim()
      : '';

  const numericOpportunityId =
    Number(opportunityId);

  /*
   * ---------------------------------------------------------
   * LOAD SAVED + APPLICATION STATUS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      Number.isInteger(numericOpportunityId) &&
      numericOpportunityId > 0
    ) {
      loadSavedStatus();
      loadApplicationStatus();
    }
  }, [opportunityId]);

  async function getToken() {
    const token =
      await AsyncStorage.getItem('authToken');

    if (!token) {
      await AsyncStorage.removeItem(
        'authToken'
      );

      await AsyncStorage.removeItem(
        'user'
      );

      router.replace('/login');

      return null;
    }

    return token;
  }

  async function handleSessionExpired() {
    await AsyncStorage.removeItem(
      'authToken'
    );

    await AsyncStorage.removeItem(
      'user'
    );

    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/login'),
        },
      ]
    );
  }

  /*
   * ---------------------------------------------------------
   * LOAD SAVED STATUS
   * ---------------------------------------------------------
   */

  async function loadSavedStatus() {
    if (
      !Number.isInteger(
        numericOpportunityId
      ) ||
      numericOpportunityId <= 0
    ) {
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/saved-opportunities.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
        }
      );

      const rawResponse =
        await response.text();

      let result: any;

      try {
        result = JSON.parse(
          rawResponse
        );
      } catch {
        console.log(
          'Saved status non-JSON response:',
          rawResponse
        );

        return;
      }

      if (response.status === 401) {
        await handleSessionExpired();
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        console.log(
          'Could not load saved opportunities:',
          result.message
        );

        return;
      }

      const savedOpportunities =
        Array.isArray(result.data)
          ? result.data
          : [];

      const alreadySaved =
        savedOpportunities.some(
          (item: any) =>
            Number(item.id) ===
            numericOpportunityId
        );

      setIsSaved(alreadySaved);
    } catch (error) {
      console.log(
        'Error loading saved opportunity status:',
        error
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * LOAD APPLICATION STATUS
   * ---------------------------------------------------------
   */

  async function loadApplicationStatus() {
    if (
      !Number.isInteger(
        numericOpportunityId
      ) ||
      numericOpportunityId <= 0
    ) {
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/applications.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
        }
      );

      const rawResponse =
        await response.text();

      let result: any;

      try {
        result = JSON.parse(
          rawResponse
        );
      } catch {
        console.log(
          'Applications non-JSON response:',
          rawResponse
        );

        return;
      }

      if (response.status === 401) {
        await handleSessionExpired();
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        console.log(
          'Could not load applications:',
          result.message
        );

        return;
      }

      const applications =
        Array.isArray(result.data)
          ? result.data
          : [];

      const alreadyApplied =
        applications.some(
          (item: any) =>
            Number(
              item.opportunity_id
            ) === numericOpportunityId
        );

      setHasApplied(alreadyApplied);
    } catch (error) {
      console.log(
        'Error loading application status:',
        error
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * APPLY
   * ---------------------------------------------------------
   */

  async function handleApply() {
    if (applying) {
      return;
    }

    if (
      !Number.isInteger(
        numericOpportunityId
      ) ||
      numericOpportunityId <= 0
    ) {
      Alert.alert(
        'Application Error',
        'The opportunity ID is missing or invalid. Please go back and open the opportunity again.'
      );

      return;
    }

    if (hasApplied) {
      Alert.alert(
        'Already Applied',
        'You have already applied for this opportunity.',
        [
          {
            text: 'View Applications',
            onPress: () =>
              router.push(
                '/alumni/my-applications'
              ),
          },
          {
            text: 'Close',
            style: 'cancel',
          },
        ]
      );

      return;
    }

    try {
      setApplying(true);

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/applications.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            opportunity_id:
              numericOpportunityId,
          }),
        }
      );

      const rawResponse =
        await response.text();

      let result: any;

      try {
        result = JSON.parse(
          rawResponse
        );
      } catch {
        console.log(
          'Alumni application non-JSON response:',
          rawResponse
        );

        Alert.alert(
          'Application Error',
          `The server returned an unexpected response. HTTP ${response.status}`
        );

        return;
      }

      console.log(
        'Alumni application response:',
        result
      );

      if (response.status === 401) {
        await handleSessionExpired();
        return;
      }

      if (response.status === 409) {
        setHasApplied(true);

        Alert.alert(
          'Already Applied',
          'You have already applied for this opportunity.',
          [
            {
              text: 'View Applications',
              onPress: () =>
                router.push(
                  '/alumni/my-applications'
                ),
            },
            {
              text: 'Close',
              style: 'cancel',
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        Alert.alert(
          'Application Failed',
          result.message ||
            'Your application could not be submitted.'
        );

        return;
      }

      setHasApplied(true);

      Alert.alert(
        'Application Submitted',
        `Your application for ${title} at ${company} has been submitted successfully.`,
        [
          {
            text: 'View My Applications',
            onPress: () =>
              router.push(
                '/alumni/my-applications'
              ),
          },
          {
            text: 'Done',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.log(
        'Error submitting application:',
        error
      );

      Alert.alert(
        'Application Error',
        'Could not connect to the CareerForge server. Please make sure the backend is running.'
      );
    } finally {
      setApplying(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * SAVE / UNSAVE
   * ---------------------------------------------------------
   */

  async function handleSave() {
    if (saving) {
      return;
    }

    if (
      !Number.isInteger(
        numericOpportunityId
      ) ||
      numericOpportunityId <= 0
    ) {
      Alert.alert(
        'Save Error',
        'The opportunity ID is missing or invalid. Please go back and open the opportunity again.'
      );

      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        return;
      }

      /*
       * -----------------------------------------------------
       * REMOVE FROM SAVED OPPORTUNITIES
       * -----------------------------------------------------
       */

      if (isSaved) {
        const response = await fetch(
          `${API_BASE_URL}/alumni/saved-opportunities.php`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              opportunity_id:
                numericOpportunityId,
            }),
          }
        );

        const rawResponse =
          await response.text();

        let result: any;

        try {
          result = JSON.parse(
            rawResponse
          );
        } catch {
          console.log(
            'Remove saved opportunity non-JSON response:',
            rawResponse
          );

          Alert.alert(
            'Remove Failed',
            `The server returned an unexpected response. HTTP ${response.status}`
          );

          return;
        }

        if (response.status === 401) {
          await handleSessionExpired();
          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          Alert.alert(
            'Remove Failed',
            result.message ||
              'The opportunity could not be removed from your saved opportunities.'
          );

          return;
        }

        setIsSaved(false);

        Alert.alert(
          'Removed',
          'This opportunity has been removed from your saved opportunities.'
        );

        return;
      }

      /*
       * -----------------------------------------------------
       * SAVE OPPORTUNITY
       * -----------------------------------------------------
       */

      const response = await fetch(
        `${API_BASE_URL}/alumni/saved-opportunities.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            opportunity_id:
              numericOpportunityId,
          }),
        }
      );

      const rawResponse =
        await response.text();

      let result: any;

      try {
        result = JSON.parse(
          rawResponse
        );
      } catch {
        console.log(
          'Save opportunity non-JSON response:',
          rawResponse
        );

        Alert.alert(
          'Save Failed',
          `The server returned an unexpected response. HTTP ${response.status}`
        );

        return;
      }

      console.log(
        'Save opportunity response:',
        result
      );

      if (response.status === 401) {
        await handleSessionExpired();
        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        Alert.alert(
          'Save Failed',
          result.message ||
            'This opportunity could not be saved.'
        );

        return;
      }

      setIsSaved(true);

      Alert.alert(
        'Opportunity Saved',
        'This opportunity has been added to your saved opportunities.'
      );
    } catch (error) {
      console.log(
        'Error saving opportunity:',
        error
      );

      Alert.alert(
        'Save Error',
        'Could not connect to the CareerForge server. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Opportunity Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Job Header */}
        <View style={styles.jobHeaderCard}>
          <View style={styles.companyIcon}>
            <Text style={styles.companyIconText}>
              {company.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.jobTitle}>
            {title}
          </Text>

          <Text style={styles.companyName}>
            {company}
          </Text>

          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>
              {match}
            </Text>

            <Text style={styles.matchLabel}>
              Career Match
            </Text>
          </View>
        </View>

        {/* Job Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                L
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Location
              </Text>

              <Text style={styles.infoValue}>
                {location}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                T
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Employment Type
              </Text>

              <Text style={styles.infoValue}>
                {type}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                R
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Salary
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  salary ===
                    'Salary not specified' &&
                    styles.mutedValue,
                ]}
              >
                {salary}
              </Text>
            </View>
          </View>

          {arrangement !==
            'Not specified' && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text
                  style={styles.infoIcon}
                >
                  W
                </Text>
              </View>

              <View
                style={styles.infoContent}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Work Arrangement
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {arrangement}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                D
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Closing Date
              </Text>

              <Text style={styles.infoValue}>
                {deadline}
              </Text>
            </View>
          </View>
        </View>

        {/* Qualification */}
        {qualification.trim().length >
          0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Qualification
            </Text>

            <View style={styles.qualificationCard}>
              <Text
                style={
                  styles.qualificationText
                }
              >
                {qualification}
              </Text>
            </View>
          </View>
        )}

        {/* Why This Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Why This Opportunity Matches You
          </Text>

          <View style={styles.matchCard}>
            <View style={styles.matchCardIcon}>
              <Text
                style={
                  styles.matchCardIconText
                }
              >
                AI
              </Text>
            </View>

            <Text style={styles.matchCardText}>
              Your professional profile and
              skills indicate a strong match
              for this opportunity. You have
              several of the technical skills
              requested by the employer.
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Job Description
          </Text>

          <Text style={styles.bodyText}>
            {description}
          </Text>

          <Text style={styles.bodyText}>
            You will collaborate with team
            members, analyse information,
            prepare reports and contribute to
            data-driven business decisions.
          </Text>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Requirements
          </Text>

          <Text style={styles.bullet}>
            • Relevant tertiary qualification
          </Text>

          <Text style={styles.bullet}>
            • Strong analytical and
            problem-solving skills
          </Text>

          <Text style={styles.bullet}>
            • Ability to work independently
            and within a team
          </Text>

          <Text style={styles.bullet}>
            • Good communication skills
          </Text>
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Skills Required
            </Text>

            <View
              style={styles.skillsContainer}
            >
              {skills.map((skill) => (
                <View
                  key={skill}
                  style={styles.skillBadge}
                >
                  <Text
                    style={styles.skillText}
                  >
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Career Advice */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>
              AI
            </Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>
              CareerForgeAI Recommendation
            </Text>

            <Text style={styles.aiText}>
              This opportunity could help
              strengthen your professional
              experience and move you closer to
              your long-term career goals.
            </Text>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            hasApplied &&
              styles.appliedButton,
          ]}
          onPress={handleApply}
          activeOpacity={0.8}
          disabled={applying}
        >
          <Text
            style={[
              styles.applyButtonText,
              hasApplied &&
                styles.appliedButtonText,
            ]}
          >
            {applying
              ? 'Submitting...'
              : hasApplied
              ? '✓ Application Submitted'
              : 'Apply Now'}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaved && styles.savedButton,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text
            style={[
              styles.saveButtonText,
              isSaved &&
                styles.savedButtonText,
            ]}
          >
            {saving
              ? 'Please wait...'
              : isSaved
              ? '♥ Opportunity Saved'
              : '♡ Save Opportunity'}
          </Text>
        </TouchableOpacity>

        {/* Back to Opportunities */}
        <TouchableOpacity
          style={
            styles.backToOpportunitiesButton
          }
          onPress={() =>
            router.push(
              '/alumni/opportunities'
            )
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.backToOpportunitiesText
            }
          >
            ← Back to Opportunities
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#17345F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  jobHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },

  companyIcon: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#E8F0FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  companyIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },

  jobTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0B1F3A',
    textAlign: 'center',
    marginBottom: 6,
  },

  companyName: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 14,
  },

  matchBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  matchText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },

  matchLabel: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 1,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E8F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  mutedValue: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 11,
  },

  qualificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D7E3F4',
  },

  qualificationText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },

  bodyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 10,
  },

  bullet: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 23,
  },

  matchCard: {
    backgroundColor: '#E8F0FA',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  matchCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  matchCardIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  matchCardText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillBadge: {
    backgroundColor: '#E8F0FA',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginRight: 7,
    marginBottom: 7,
  },

  skillText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },

  aiCard: {
    backgroundColor: '#E8F0FA',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 5,
  },

  aiText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 19,
  },

  applyButton: {
    backgroundColor: '#0B1F3A',
    borderRadius: 13,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  appliedButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  appliedButtonText: {
    color: '#15803D',
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 13,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },

  savedButton: {
    backgroundColor: '#E8F0FA',
  },

  savedButtonText: {
    color: '#1D4ED8',
  },

  backToOpportunitiesButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  backToOpportunitiesText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
});

