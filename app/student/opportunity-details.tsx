import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';

const SAVED_OPPORTUNITIES_KEY =
  'careerforge_saved_opportunities';

type BackendSkill = {
  id: number | string;
  name: string;
};

type BackendOpportunity = {
  id: number | string;
  business_id: number | string;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  salary: string | null;
  work_arrangement: string | null;
  positions: number | null;
  minimum_qualification: string | null;
  qualification: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  company_name: string;
  skills?: BackendSkill[];
  match_percentage?: number | string;
};

const fallbackSkills = [
  'Python',
  'SQL',
  'Excel',
  'Data Analysis',
];

const skillIcons: (keyof typeof Ionicons.glyphMap)[] = [
  'code-slash-outline',
  'server-outline',
  'grid-outline',
  'analytics-outline',
];

const formatOpportunityType = (
  opportunityType: string
): string => {
  switch (opportunityType) {
    case 'internship':
      return 'Internship';

    case 'graduate_program':
      return 'Graduate';

    case 'job':
      return 'Job';

    case 'learnership':
      return 'Learnership';

    case 'volunteer':
      return 'Volunteer';

    case 'other':
      return 'Other';

    default:
      return opportunityType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );
  }
};

const formatMatch = (
  value: number | string | null | undefined
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '94%';
  }

  const numericValue = Number(
    String(value).replace('%', '')
  );

  if (!Number.isFinite(numericValue)) {
    return '94%';
  }

  const clampedValue = Math.max(
    0,
    Math.min(100, Math.round(numericValue))
  );

  return `${clampedValue}%`;
};

export default function OpportunityDetails() {
  const params = useLocalSearchParams();

  const id =
    typeof params.id === 'string'
      ? params.id
      : '1';

  const [isSaved, setIsSaved] = useState(false);

  const [title, setTitle] = useState(
    typeof params.title === 'string'
      ? params.title
      : 'Junior Data Analyst'
  );

  const [company, setCompany] = useState(
    typeof params.company === 'string'
      ? params.company
      : 'Tech Solutions'
  );

  const [location, setLocation] = useState(
    typeof params.location === 'string'
      ? params.location
      : 'Durban, KZN'
  );

  const [type, setType] = useState(
    typeof params.type === 'string'
      ? params.type
      : 'Full Time'
  );

  const [match, setMatch] = useState(
    typeof params.match === 'string'
      ? params.match
      : '94%'
  );

  const [description, setDescription] =
    useState(
      typeof params.description === 'string'
        ? params.description
        : 'We are looking for a motivated and analytical graduate to join our team as a Junior Data Analyst. You will work with data, create reports and support business decision-making.'
    );

  const [skills, setSkills] =
    useState<string[]>(fallbackSkills);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          SAVED_OPPORTUNITIES_KEY
        );

        if (saved) {
          const savedIds: string[] = JSON.parse(saved);

          setIsSaved(savedIds.includes(id));
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

  useEffect(() => {
    const loadOpportunity = async () => {
      try {
        const token =
          await AsyncStorage.getItem('authToken');

        if (!token) {
          console.log(
            'No authentication token found.'
          );
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/opportunities.php?id=${encodeURIComponent(
            id
          )}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              'Failed to load opportunity.'
          );
        }

        const data: BackendOpportunity =
          result.data;

        setTitle(
          data.title ||
            'Junior Data Analyst'
        );

        setCompany(
          data.company_name ||
            'Tech Solutions'
        );

        setLocation(
          data.location ||
            'Durban, KZN'
        );

        setType(
          formatOpportunityType(
            data.type || 'job'
          )
        );

        setDescription(
          data.description ||
            'We are looking for a motivated and analytical graduate to join our team as a Junior Data Analyst. You will work with data, create reports and support business decision-making.'
        );

        setMatch(
          formatMatch(
            data.match_percentage
          )
        );

        if (Array.isArray(data.skills)) {
          setSkills(
            data.skills
              .map((skill) => skill.name)
              .filter(
                (skillName): skillName is string =>
                  typeof skillName === 'string' &&
                  skillName.trim().length > 0
              )
          );
        }

        console.log(
          'Opportunity loaded:',
          data
        );
      } catch (error) {
        console.log(
          'Error loading opportunity details:',
          error
        );
      }
    };

    loadOpportunity();
  }, [id]);

  const toggleSaved = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY
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
        updatedIds = [...savedIds, id];

        setIsSaved(true);
      }

      await AsyncStorage.setItem(
        SAVED_OPPORTUNITIES_KEY,
        JSON.stringify(updatedIds)
      );
    } catch (error) {
      console.log(
        'Error saving opportunity:',
        error
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* BACK BUTTON */}

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <View style={styles.backIcon}>
          <Ionicons
            name="arrow-back"
            size={19}
            color="#2457E6"
          />
        </View>

        <Text style={styles.backText}>
          Back
        </Text>
      </Pressable>

      {/* HERO HEADER */}

      <View style={styles.headerCard}>
        <View style={styles.headerGlowOne} />
        <View style={styles.headerGlowTwo} />

        <View style={styles.headerTopRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="briefcase-outline"
              size={31}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.matchBadge}>
            <Ionicons
              name="sparkles"
              size={13}
              color="#2457E6"
            />

            <Text style={styles.matchText}>
              {match} Match
            </Text>
          </View>
        </View>

        <Text style={styles.headerEyebrow}>
          CAREER OPPORTUNITY
        </Text>

        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.companyRow}>
          <View style={styles.companyIcon}>
            <Ionicons
              name="business-outline"
              size={14}
              color="#2457E6"
            />
          </View>

          <Text style={styles.company}>
            {company}
          </Text>
        </View>
      </View>

      {/* OPPORTUNITY INFORMATION */}

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View>
            <Text style={styles.infoEyebrow}>
              OPPORTUNITY DETAILS
            </Text>

            <Text style={styles.infoTitle}>
              Key information
            </Text>
          </View>

          <View style={styles.infoHeaderIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              Location
            </Text>

            <Text style={styles.infoValue}>
              {location}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="briefcase-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              Employment Type
            </Text>

            <Text style={styles.infoValue}>
              {type}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="school-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              Experience
            </Text>

            <Text style={styles.infoValue}>
              Entry Level
            </Text>
          </View>
        </View>
      </View>

      {/* ABOUT */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>
            01
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          About This Opportunity
        </Text>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.cardTopLine} />

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      {/* RESPONSIBILITIES */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>
            02
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Responsibilities
        </Text>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.bullet}>
            Analyse and interpret business data
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.bullet}>
            Create reports and data visualisations
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.bullet}>
            Identify trends and useful insights
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.bullet}>
            Work with different teams to support
            decisions
          </Text>
        </View>

        <View style={styles.bulletRow}>
          <View style={styles.bulletIcon}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.bullet}>
            Maintain accurate data and documentation
          </Text>
        </View>
      </View>

      {/* SKILLS */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>
            03
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Relevant Skills
        </Text>
      </View>

      <View style={styles.skillsCard}>
        {skills.map((skill, index) => (
          <View
            style={styles.skill}
            key={`${skill}-${index}`}
          >
            <Ionicons
              name={
                skillIcons[
                  index % skillIcons.length
                ]
              }
              size={13}
              color="#2457E6"
            />

            <Text style={styles.skillText}>
              {skill}
            </Text>
          </View>
        ))}
      </View>

      {/* AI CAREER TIP */}

      <View style={styles.tipCard}>
        <View style={styles.tipAccent} />

        <View style={styles.tipIconContainer}>
          <Ionicons
            name="bulb-outline"
            size={21}
            color="#2457E6"
          />
        </View>

        <View style={styles.tipContent}>
          <Text style={styles.tipEyebrow}>
            CAREERFORGE AI
          </Text>

          <Text style={styles.tipTitle}>
            CareerForgeAI Tip
          </Text>

          <Text style={styles.tipText}>
            Make sure your profile and CV are up to
            date before applying. A complete profile
            can improve your chances of being matched
            with opportunities.
          </Text>
        </View>
      </View>

      {/* MATCH INSIGHT */}

      <View style={styles.insightCard}>
        <View style={styles.insightIconContainer}>
          <Ionicons
            name="sparkles-outline"
            size={21}
            color="#2457E6"
          />
        </View>

        <View style={styles.insightContent}>
          <Text style={styles.insightEyebrow}>
            AI MATCH ANALYSIS
          </Text>

          <Text style={styles.insightTitle}>
            Why this opportunity matches you
          </Text>

          <Text style={styles.insightText}>
            Your profile skills and career interests
            align strongly with this opportunity.
          </Text>
        </View>

        <View style={styles.insightScore}>
          <Text style={styles.insightScoreNumber}>
            {match}
          </Text>

          <Text style={styles.insightScoreLabel}>
            match
          </Text>
        </View>
      </View>

      {/* APPLY BUTTON */}

      <Pressable
        style={styles.applyButton}
        onPress={() =>
          router.push({
            pathname: '/student/apply-opportunity',
            params: {
              id,
              title,
              company,
              location,
              type,
              match,
              description,
            },
          })
        }
      >
        <View style={styles.applyIcon}>
          <Ionicons
            name="paper-plane-outline"
            size={17}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.applyButtonText}>
          Apply Now
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>

      {/* SAVE BUTTON */}

      <Pressable
        style={[
          styles.saveButton,
          isSaved && styles.saveButtonSaved,
        ]}
        onPress={toggleSaved}
      >
        <Ionicons
          name={
            isSaved
              ? 'bookmark'
              : 'bookmark-outline'
          }
          size={19}
          color="#2457E6"
        />

        <Text
          style={[
            styles.saveButtonText,
            isSaved &&
              styles.saveButtonTextSaved,
          ]}
        >
          {isSaved
            ? 'Opportunity Saved'
            : 'Save Opportunity'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        CareerForgeAI • Opportunity Centre
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  /* =========================
     BACK
  ========================= */

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 18,
    paddingVertical: 4,
  },

  backIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#2457E6',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 7,
  },

  /* =========================
     HEADER
  ========================= */

  headerCard: {
    backgroundColor: '#102A72',
    borderRadius: 24,
    padding: 21,
    marginBottom: 17,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#102A72',
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  headerGlowOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#2457E6',
    opacity: 0.30,
    right: -75,
    top: -75,
  },

  headerGlowTwo: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: '#6B8FFF',
    opacity: 0.18,
    left: -55,
    bottom: -55,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  iconContainer: {
    width: 67,
    height: 67,
    borderRadius: 19,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B8FFF',
  },

  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  matchText: {
    color: '#173FBD',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },

  headerEyebrow: {
    color: '#8EACFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: 10,
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  companyIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  company: {
    color: '#DCE6FF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* =========================
     INFO
  ========================= */

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C9D6ED',
    marginBottom: 25,
    shadowColor: '#102A72',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  infoEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  infoTitle: {
    color: '#102A72',
    fontSize: 17,
    fontWeight: '900',
  },

  infoHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  infoIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#D5E2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },

  infoValue: {
    color: '#102A72',
    fontSize: 14,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E1E7F0',
    marginVertical: 13,
  },

  /* =========================
     SECTIONS
  ========================= */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  sectionTitle: {
    color: '#102A72',
    fontSize: 19,
    fontWeight: '900',
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C9D6ED',
    marginBottom: 23,
    overflow: 'hidden',
  },

  cardTopLine: {
    height: 3,
    width: 42,
    borderRadius: 2,
    backgroundColor: '#2457E6',
    marginBottom: 13,
  },

  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },

  /* =========================
     RESPONSIBILITIES
  ========================= */

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },

  bulletIcon: {
    width: 23,
    height: 23,
    borderRadius: 8,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    marginTop: 1,
  },

  bullet: {
    flex: 1,
    color: '#475569',
    fontSize: 13,
    lineHeight: 21,
  },

  /* =========================
     SKILLS
  ========================= */

  skillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#C9D6ED',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 23,
  },

  skill: {
    backgroundColor: '#E8F0FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C0D0FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* =========================
     AI TIP
  ========================= */

  tipCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#AFC4FF',
    overflow: 'hidden',
  },

  tipAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#2457E6',
  },

  tipIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  tipTitle: {
    color: '#102A72',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },

  tipText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },

  /* =========================
     MATCH INSIGHT
  ========================= */

  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#AFC4FF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2457E6',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  insightIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C0D0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  insightContent: {
    flex: 1,
    paddingRight: 8,
  },

  insightEyebrow: {
    color: '#2457E6',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },

  insightTitle: {
    color: '#102A72',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },

  insightText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  insightScore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2457E6',
  },

  insightScoreNumber: {
    color: '#173FBD',
    fontSize: 14,
    fontWeight: '900',
  },

  insightScoreLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
    marginTop: -1,
  },

  /* =========================
     ACTIONS
  ========================= */

  applyButton: {
    backgroundColor: '#2457E6',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#173FBD',
    shadowOpacity: 0.24,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  applyIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#173FBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 8,
  },

  saveButton: {
    height: 53,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#2457E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    flexDirection: 'row',
  },

  saveButtonSaved: {
    backgroundColor: '#E8F0FF',
    borderColor: '#173FBD',
  },

  saveButtonText: {
    color: '#2457E6',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  saveButtonTextSaved: {
    color: '#173FBD',
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
});