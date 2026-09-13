import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';

type OpportunitySkill = {
  id: number;
  skill_code?: string;
  name: string;
  category?: string;
  description?: string;
};

type Opportunity = {
  id: number;
  business_id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  work_arrangement: string | null;
  positions: number | null;
  qualification: string | null;
  deadline: string;
  status: string;
  created_at: string;
  company_name: string;
  industry?: string;
  company_description?: string;
  required_skills: OpportunitySkill[];
};

export default function OpportunityDetails() {
  const params = useLocalSearchParams();

  const id =
    typeof params.id === 'string'
      ? params.id
      : '';

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [isSaved, setIsSaved] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) {
        setError('Opportunity ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/opportunities.php?id=${id}`
        );

        const data = await response.json();

        console.log(
          'Opportunity details API response:',
          data
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              'Failed to load opportunity'
          );
        }

        setOpportunity(data.data);
      } catch (error) {
        console.log(
          'Error loading opportunity:',
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load opportunity'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!id) {
        return;
      }

      try {
        const saved =
          await AsyncStorage.getItem(
            'careerforge_saved_opportunities'
          );

        if (saved) {
          const savedIds: string[] =
            JSON.parse(saved);

          setIsSaved(
            savedIds.includes(id)
          );
        }
      } catch (error) {
        console.log(
          'Error checking saved opportunity:',
          error
        );
      }
    };

    checkIfSaved();
  }, [id]);

  const toggleSaved = async () => {
    if (!id) {
      return;
    }

    try {
      const saved =
        await AsyncStorage.getItem(
          'careerforge_saved_opportunities'
        );

      const savedIds: string[] = saved
        ? JSON.parse(saved)
        : [];

      let updatedIds: string[];

      if (savedIds.includes(id)) {
        updatedIds = savedIds.filter(
          (savedId) => savedId !== id
        );

        setIsSaved(false);
      } else {
        updatedIds = [
          ...savedIds,
          id,
        ];

        setIsSaved(true);
      }

      await AsyncStorage.setItem(
        'careerforge_saved_opportunities',
        JSON.stringify(updatedIds)
      );
    } catch (error) {
      console.log(
        'Error saving opportunity:',
        error
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />

        <Text style={styles.loadingText}>
          Loading opportunity...
        </Text>
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorTitle}>
          Unable to load opportunity
        </Text>

        <Text style={styles.errorText}>
          {error ||
            'Opportunity not found.'}
        </Text>

        <Pressable
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const displayType =
    formatOpportunityType(
      opportunity.type
    );

  const displayWorkArrangement =
    opportunity.work_arrangement ||
    'Not specified';

  const displayPositions =
    opportunity.positions !== null
      ? `${opportunity.positions} position${
          opportunity.positions === 1
            ? ''
            : 's'
        }`
      : 'Not specified';

  const displayQualification =
    opportunity.qualification ||
    'Not specified';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      <View style={styles.headerCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            💼
          </Text>
        </View>

        <Text style={styles.title}>
          {opportunity.title}
        </Text>

        <Text style={styles.company}>
          {opportunity.company_name}
        </Text>

        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {displayType}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            📍
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Location
            </Text>

            <Text style={styles.infoValue}>
              {opportunity.location ||
                'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            🏢
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Work Arrangement
            </Text>

            <Text style={styles.infoValue}>
              {displayWorkArrangement}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            💼
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Opportunity Type
            </Text>

            <Text style={styles.infoValue}>
              {displayType}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            👥
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Positions Available
            </Text>

            <Text style={styles.infoValue}>
              {displayPositions}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            📅
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Application Deadline
            </Text>

            <Text style={styles.infoValue}>
              {opportunity.deadline}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        About This Opportunity
      </Text>

      <View style={styles.contentCard}>
        <Text style={styles.description}>
          {opportunity.description}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Qualification
      </Text>

      <View style={styles.contentCard}>
        <Text style={styles.description}>
          {displayQualification}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Required Skills
      </Text>

      <View style={styles.skillsCard}>
        {opportunity.required_skills &&
        opportunity.required_skills.length > 0 ? (
          opportunity.required_skills.map(
            (skill) => (
              <View
                key={skill.id}
                style={styles.skill}
              >
                <Text
                  style={styles.skillText}
                >
                  {skill.name}
                </Text>
              </View>
            )
          )
        ) : (
          <Text style={styles.noSkillsText}>
            No specific skills have been
            listed for this opportunity yet.
          </Text>
        )}
      </View>

      {opportunity.industry && (
        <>
          <Text style={styles.sectionTitle}>
            Company Information
          </Text>

          <View style={styles.contentCard}>
            <Text style={styles.companyInfoLabel}>
              Industry
            </Text>

            <Text style={styles.description}>
              {opportunity.industry}
            </Text>

            {opportunity.company_description && (
              <>
                <Text
                  style={[
                    styles.companyInfoLabel,
                    {
                      marginTop: 15,
                    },
                  ]}
                >
                  About the Company
                </Text>

                <Text
                  style={styles.description}
                >
                  {opportunity.company_description}
                </Text>
              </>
            )}
          </View>
        </>
      )}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          💡 CareerForgeAI Tip
        </Text>

        <Text style={styles.tipText}>
          Make sure your profile and CV are
          up to date before applying. A
          complete profile can improve your
          chances of being matched with
          opportunities.
        </Text>
      </View>

      <Pressable
        style={styles.applyButton}
        onPress={() =>
          router.push({
            pathname:
              '/student/apply-opportunity',

            params: {
              id: String(
                opportunity.id
              ),

              title:
                opportunity.title,

              company:
                opportunity.company_name,

              location:
                opportunity.location,

              workArrangement:
                displayWorkArrangement,

              positions:
                String(
                  opportunity.positions ?? ''
                ),

              qualification:
                displayQualification,

              type:
                displayType,

              description:
                opportunity.description,

              deadline:
                opportunity.deadline,
            },
          })
        }
      >
        <Text
          style={styles.applyButtonText}
        >
          Apply Now
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.saveButton,
          isSaved &&
            styles.saveButtonSaved,
        ]}
        onPress={toggleSaved}
      >
        <Text
          style={styles.saveButtonText}
        >
          {isSaved
            ? '★ Opportunity Saved'
            : '☆ Save Opportunity'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        CareerForgeAI
      </Text>
    </ScrollView>
  );
}

function formatOpportunityType(
  type: string
) {
  switch (type) {
    case 'Internship':
    case 'internship':
      return 'Internship';

    case 'Graduate Programme':
    case 'graduate_program':
    case 'graduate programme':
      return 'Graduate Programme';

    case 'Job':
    case 'job':
      return 'Job';

    case 'Learnership':
    case 'learnership':
      return 'Learnership';

    case 'Volunteer':
    case 'volunteer':
      return 'Volunteer';

    default:
      return type
        ? type.charAt(0).toUpperCase() +
            type.slice(1)
        : 'Other';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },

  errorTitle: {
    color: '#B91C1C',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  errorBackButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  errorBackButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  backButton: {
    marginTop: 15,
    marginBottom: 18,
  },

  backText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  icon: {
    fontSize: 34,
  },

  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },

  company: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 12,
  },

  typeBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  typeBadgeText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  infoIcon: {
    fontSize: 22,
    width: 42,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 3,
  },

  infoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 13,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },

  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },

  companyInfoLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  skillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },

  skill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  skillText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '600',
  },

  noSkillsText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },

  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 17,
    padding: 17,
    marginBottom: 20,
  },

  tipTitle: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  tipText: {
    color: '#78350F',
    fontSize: 13,
    lineHeight: 19,
  },

  applyButton: {
    backgroundColor: '#4F46E5',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  saveButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  saveButtonSaved: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },

  saveButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },
});
