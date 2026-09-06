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

export default function OpportunityDetails() {
  const params = useLocalSearchParams();

  const id =
  typeof params.id === 'string'
    ? params.id
    : '1';

const [isSaved, setIsSaved] = useState(false);

useEffect(() => {
  const checkIfSaved = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        'careerforge_saved_opportunities'
      );

      if (saved) {
        const savedIds: string[] = JSON.parse(saved);
        setIsSaved(savedIds.includes(id));
      }
    } catch (error) {
      console.log('Error checking saved opportunity:', error);
    }
  };

  checkIfSaved();
}, [id]);

const toggleSaved = async () => {
  try {
    const saved = await AsyncStorage.getItem(
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
      updatedIds = [...savedIds, id];

      setIsSaved(true);
    }

    await AsyncStorage.setItem(
      'careerforge_saved_opportunities',
      JSON.stringify(updatedIds)
    );
  } catch (error) {
    console.log('Error saving opportunity:', error);
  }
};

  const title =
    typeof params.title === 'string'
      ? params.title
      : 'Junior Data Analyst';

  const company =
    typeof params.company === 'string'
      ? params.company
      : 'Tech Solutions';

  const location =
    typeof params.location === 'string'
      ? params.location
      : 'Durban, KZN';

  const type =
    typeof params.type === 'string'
      ? params.type
      : 'Full Time';

  const match =
    typeof params.match === 'string'
      ? params.match
      : '94%';

  const description =
    typeof params.description === 'string'
      ? params.description
      : 'We are looking for a motivated and analytical graduate to join our team as a Junior Data Analyst. You will work with data, create reports and support business decision-making.';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💼</Text>
        </View>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.company}>{company}</Text>

        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>
            {match} Match
          </Text>
        </View>
      </View>

      {/* Opportunity Information */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>

          <View>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{location}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💼</Text>

          <View>
            <Text style={styles.infoLabel}>Employment Type</Text>
            <Text style={styles.infoValue}>{type}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎓</Text>

          <View>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>Entry Level</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.sectionTitle}>
        About This Opportunity
      </Text>

      <View style={styles.contentCard}>
        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      {/* Responsibilities */}
      <Text style={styles.sectionTitle}>
        Responsibilities
      </Text>

      <View style={styles.contentCard}>
        <Text style={styles.bullet}>
          • Analyse and interpret business data
        </Text>

        <Text style={styles.bullet}>
          • Create reports and data visualisations
        </Text>

        <Text style={styles.bullet}>
          • Identify trends and useful insights
        </Text>

        <Text style={styles.bullet}>
          • Work with different teams to support decisions
        </Text>

        <Text style={styles.bullet}>
          • Maintain accurate data and documentation
        </Text>
      </View>

      {/* Skills */}
      <Text style={styles.sectionTitle}>
        Relevant Skills
      </Text>

      <View style={styles.skillsCard}>
        <View style={styles.skill}>
          <Text style={styles.skillText}>Python</Text>
        </View>

        <View style={styles.skill}>
          <Text style={styles.skillText}>SQL</Text>
        </View>

        <View style={styles.skill}>
          <Text style={styles.skillText}>Excel</Text>
        </View>

        <View style={styles.skill}>
          <Text style={styles.skillText}>Data Analysis</Text>
        </View>
      </View>

      {/* Application Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          💡 CareerForgeAI Tip
        </Text>

        <Text style={styles.tipText}>
          Make sure your profile and CV are up to date before
          applying. A complete profile can improve your chances
          of being matched with opportunities.
        </Text>
      </View>

      {/* Apply Button */}
      <Pressable
        style={styles.applyButton}
        onPress={() =>
            router.push({
                pathname: '/student/apply-opportunity',
                params: {
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
        <Text style={styles.applyButtonText}>
          Apply Now
        </Text>
      </Pressable>

      {/* Save Button */}
      <Pressable
        style={[
            styles.saveButton,
            isSaved && styles.saveButtonSaved,
        ]}
        onPress={toggleSaved}
        >
        <Text style={styles.saveButtonText}>
            {isSaved
            ? '★ Opportunity Saved'
            : '☆ Save Opportunity'}
        </Text>
        </Pressable>

      <Text style={styles.footer}>
        CareerForgeAI • Frontend Demo
      </Text>
    </ScrollView>
  );
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

  matchBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  matchText: {
    color: '#166534',
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

  bullet: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
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