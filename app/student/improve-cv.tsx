import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CV_IMPROVEMENTS_STORAGE_KEY = 'careerforge_cv_improvements';

export default function ImproveCVScreen() {
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const focusAreas = [
    {
      id: 'personal',
      icon: 'person-outline',
      title: 'Personal Information',
      description:
        'Make your contact details and professional profile information clear, accurate and employer-ready.',
      category: 'Foundation',
      priority: 'Essential',
    },
    {
      id: 'summary',
      icon: 'document-text-outline',
      title: 'Professional Summary',
      description:
        'Create a strong introduction that communicates your strengths, career direction and value.',
      category: 'Content',
      priority: 'High Impact',
    },
    {
      id: 'skills',
      icon: 'construct-outline',
      title: 'Skills',
      description:
        'Highlight technical and professional skills that match the roles and career paths you are targeting.',
      category: 'Relevance',
      priority: 'High Impact',
    },
    {
      id: 'education',
      icon: 'school-outline',
      title: 'Education',
      description:
        'Present your qualifications, academic achievements and relevant learning in a professional format.',
      category: 'Foundation',
      priority: 'Essential',
    },
    {
      id: 'experience',
      icon: 'briefcase-outline',
      title: 'Experience',
      description:
        'Showcase internships, projects, volunteering and work experience with meaningful achievements.',
      category: 'Evidence',
      priority: 'High Impact',
    },
    {
      id: 'projects',
      icon: 'rocket-outline',
      title: 'Projects & Achievements',
      description:
        'Show employers what you have built, contributed to and accomplished beyond your coursework.',
      category: 'Evidence',
      priority: 'High Impact',
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadSavedImprovements = async () => {
        try {
          const saved = await AsyncStorage.getItem(
            CV_IMPROVEMENTS_STORAGE_KEY
          );

          if (saved) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
              setSelectedFocus(parsed);
            }
          }
        } catch (error) {
          console.log(
            'Error loading CV improvements:',
            error
          );
        }
      };

      loadSavedImprovements();
    }, [])
  );

  const toggleFocus = (focusId: string) => {
    setSelectedFocus((current) => {
      if (current.includes(focusId)) {
        return current.filter((id) => id !== focusId);
      }

      return [...current, focusId];
    });
  };

  const handleSave = async () => {
    console.log('STEP 1: Save Improvements button pressed');

    if (selectedFocus.length === 0) {
      console.log('STEP 2: No improvement areas selected');

      Alert.alert(
        'Select an Area',
        'Please select at least one area you would like to improve.'
      );

      return;
    }

    if (saving) {
      console.log('Already saving...');
      return;
    }

    try {
      setSaving(true);

      await AsyncStorage.setItem(
        CV_IMPROVEMENTS_STORAGE_KEY,
        JSON.stringify(selectedFocus)
      );

      setSaving(false);

      Alert.alert(
        'CV Improvements Saved',
        'Your selected CV improvement areas have been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/student/profile');
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log('STEP ERROR:', error);

      setSaving(false);

      Alert.alert(
        'Error',
        'Something went wrong while saving your CV improvements.'
      );
    }
  };

  const readinessItems = [
    {
      label: 'Contact Information',
      status: 'Complete',
      icon: 'checkmark-circle',
      complete: true,
    },
    {
      label: 'Education',
      status: 'Complete',
      icon: 'checkmark-circle',
      complete: true,
    },
    {
      label: 'Professional Summary',
      status: 'Needs Work',
      icon: 'alert-circle',
      complete: false,
    },
    {
      label: 'Projects & Achievements',
      status: 'Needs Work',
      icon: 'alert-circle',
      complete: false,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#173FBD"
          />

          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.topBadge}>
          <Ionicons
            name="document-text-outline"
            size={15}
            color="#2457E6"
          />

          <Text style={styles.topBadgeText}>CV Builder</Text>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroShapeOne} />
        <View style={styles.heroShapeTwo} />

        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="document-text"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.heroStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Good Foundation</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Improve Your CV</Text>

        <Text style={styles.heroDescription}>
          Strengthen your CV, improve your employability profile
          and make your application more attractive to graduate
          employers.
        </Text>

        <View style={styles.heroBottom}>
          <View>
            <Text style={styles.heroSmallLabel}>
              CURRENT READINESS
            </Text>

            <View style={styles.heroScoreRow}>
              <Text style={styles.heroScore}>72</Text>
              <Text style={styles.heroPercent}>%</Text>
            </View>
          </View>

          <View style={styles.heroRing}>
            <View style={styles.heroRingInner}>
              <Text style={styles.heroRingText}>72%</Text>
              <Text style={styles.heroRingLabel}>Ready</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Score Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewTitle}>
              CV Readiness Overview
            </Text>

            <Text style={styles.overviewSubtitle}>
              Your CV has a good foundation, but there are
              opportunities to make it stronger.
            </Text>
          </View>

          <View style={styles.overviewIcon}>
            <Ionicons
              name="analytics-outline"
              size={22}
              color="#2457E6"
            />
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressStart}>Starting point</Text>
          <Text style={styles.progressEnd}>72% readiness</Text>
        </View>

        <View style={styles.scoreStats}>
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatNumber}>2</Text>
            <Text style={styles.scoreStatLabel}>Completed</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatNumber}>2</Text>
            <Text style={styles.scoreStatLabel}>Needs attention</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatNumber}>6</Text>
            <Text style={styles.scoreStatLabel}>Focus areas</Text>
          </View>
        </View>
      </View>

      {/* AI Guidance */}
      <View style={styles.aiCard}>
        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={21}
            color="#2457E6"
          />
        </View>

        <View style={styles.aiContent}>
          <Text style={styles.aiEyebrow}>
            CAREERFORGEAI GUIDANCE
          </Text>

          <Text style={styles.aiTitle}>
            Make your CV employer-ready
          </Text>

          <Text style={styles.aiText}>
            Select the areas you want to improve. Prioritise
            sections that give employers stronger evidence of
            your skills, experience and career direction.
          </Text>
        </View>
      </View>

      {/* Selection Header */}
      <View style={styles.selectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>PERSONALISED PLAN</Text>

          <Text style={styles.sectionTitle}>
            Areas to Improve
          </Text>
        </View>

        <View style={styles.selectedBadge}>
          <Text style={styles.selectedNumber}>
            {selectedFocus.length}
          </Text>

          <Text style={styles.selectedLabel}>selected</Text>
        </View>
      </View>

      {/* Focus Cards */}
      <View style={styles.focusContainer}>
        {focusAreas.map((area) => {
          const isSelected = selectedFocus.includes(area.id);

          return (
            <Pressable
              key={area.id}
              style={[
                styles.focusCard,
                isSelected && styles.focusCardSelected,
              ]}
              onPress={() => toggleFocus(area.id)}
            >
              <View
                style={[
                  styles.focusIconContainer,
                  isSelected &&
                    styles.focusIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={area.icon as any}
                  size={24}
                  color={isSelected ? '#FFFFFF' : '#2457E6'}
                />
              </View>

              <View style={styles.focusContent}>
                <View style={styles.focusTitleRow}>
                  <Text
                    style={[
                      styles.focusTitle,
                      isSelected &&
                        styles.focusTitleSelected,
                    ]}
                  >
                    {area.title}
                  </Text>

                  <View
                    style={[
                      styles.priorityBadge,
                      isSelected &&
                        styles.priorityBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected &&
                          styles.priorityTextSelected,
                      ]}
                    >
                      {area.priority}
                    </Text>
                  </View>
                </View>

                <Text style={styles.focusCategory}>
                  {area.category}
                </Text>

                <Text style={styles.focusDescription}>
                  {area.description}
                </Text>

                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#2457E6"
                    />

                    <Text style={styles.selectedIndicatorText}>
                      Included in your improvement plan
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Checklist */}
      <View style={styles.sectionHeadingRow}>
        <View>
          <Text style={styles.sectionEyebrow}>QUALITY CHECK</Text>

          <Text style={styles.sectionTitle}>
            CV Checklist
          </Text>
        </View>

        <View style={styles.checklistCount}>
          <Text style={styles.checklistCountText}>
            2 / 4
          </Text>
        </View>
      </View>

      <View style={styles.checklistCard}>
        {readinessItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.checklistRow,
              index !== readinessItems.length - 1 &&
                styles.checklistRowBorder,
            ]}
          >
            <View
              style={[
                styles.checkCircle,
                item.complete
                  ? styles.checkCircleComplete
                  : styles.checkCirclePending,
              ]}
            >
              <Ionicons
                name={item.complete ? 'checkmark' : 'alert'}
                size={15}
                color={
                  item.complete ? '#15803D' : '#B45309'
                }
              />
            </View>

            <View style={styles.checklistTextContainer}>
              <Text style={styles.checklistText}>
                {item.label}
              </Text>

              <Text
                style={[
                  styles.checklistStatus,
                  item.complete
                    ? styles.completeStatus
                    : styles.pendingStatus,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Ionicons
              name={
                item.complete
                  ? 'checkmark-circle-outline'
                  : 'arrow-forward-circle-outline'
              }
              size={20}
              color={
                item.complete ? '#22C55E' : '#2457E6'
              }
            />
          </View>
        ))}
      </View>

      {/* Employer Expectations */}
      <View style={styles.employerCard}>
        <View style={styles.employerHeader}>
          <View style={styles.employerIcon}>
            <Ionicons
              name="briefcase-outline"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.employerHeaderText}>
            <Text style={styles.employerEyebrow}>
              EMPLOYER PERSPECTIVE
            </Text>

            <Text style={styles.employerTitle}>
              What employers look for
            </Text>
          </View>
        </View>

        <View style={styles.expectationRow}>
          <View style={styles.expectationDot}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#2457E6"
            />
          </View>

          <Text style={styles.expectationText}>
            Clear career direction and professional presentation
          </Text>
        </View>

        <View style={styles.expectationRow}>
          <View style={styles.expectationDot}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#2457E6"
            />
          </View>

          <Text style={styles.expectationText}>
            Skills that match the role being applied for
          </Text>
        </View>

        <View style={styles.expectationRow}>
          <View style={styles.expectationDot}>
            <Ionicons
              name="checkmark"
              size={13}
              color="#2457E6"
            />
          </View>

          <Text style={styles.expectationText}>
            Evidence through projects, experience and achievements
          </Text>
        </View>
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Ionicons
            name="bulb-outline"
            size={22}
            color="#2457E6"
          />
        </View>

        <View style={styles.tipContent}>
          <Text style={styles.tipEyebrow}>CAREER TIP</Text>

          <Text style={styles.tipTitle}>
            Tailor your CV for every opportunity
          </Text>

          <Text style={styles.tipText}>
            Highlight the skills, projects and experiences that
            are most relevant to the specific role you are
            applying for. A targeted CV is more effective than
            sending the same CV everywhere.
          </Text>
        </View>
      </View>

      {/* Save Area */}
      <View style={styles.saveSection}>
        <View style={styles.saveInfo}>
          <View style={styles.saveInfoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.saveInfoContent}>
            <Text style={styles.saveInfoTitle}>
              Your improvement plan
            </Text>

            <Text style={styles.saveInfoText}>
              {selectedFocus.length === 0
                ? 'Select at least one area to create your plan.'
                : `${selectedFocus.length} area${
                    selectedFocus.length === 1 ? '' : 's'
                  } selected for improvement.`}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            (selectedFocus.length === 0 || saving) &&
              styles.continueButtonDisabled,
          ]}
          disabled={selectedFocus.length === 0 || saving}
          onPress={handleSave}
        >
          <Text style={styles.continueText}>
            {saving ? 'Saving...' : 'Save Improvements'}
          </Text>

          {!saving && (
            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          )}
        </Pressable>

        <Text style={styles.footerText}>
          Your saved improvement areas can be reviewed and
          updated from your profile.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  container: {
    padding: 18,
    paddingBottom: 45,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingRight: 10,
  },

  backText: {
    marginLeft: 7,
    fontSize: 15,
    color: '#173FBD',
    fontWeight: '700',
  },

  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  topBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#2457E6',
    fontWeight: '800',
  },

  heroCard: {
    backgroundColor: '#102A72',
    borderRadius: 25,
    padding: 21,
    marginBottom: 15,
    overflow: 'hidden',
    minHeight: 245,
  },

  heroShapeOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#2457E6',
    right: -75,
    top: -80,
    opacity: 0.65,
  },

  heroShapeTwo: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: '#4C7DFF',
    right: 35,
    bottom: -72,
    opacity: 0.4,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6EE7B7',
    marginRight: 6,
  },

  statusText: {
    color: '#E5EDFF',
    fontSize: 10,
    fontWeight: '700',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 7,
  },

  heroDescription: {
    color: '#DCE7FF',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '94%',
  },

  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 19,
  },

  heroSmallLabel: {
    color: '#9FB8F8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 1,
  },

  heroScore: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '900',
  },

  heroPercent: {
    color: '#BFD0FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 7,
    marginLeft: 2,
  },

  heroRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: '#4C7DFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#173FBD',
  },

  heroRingInner: {
    alignItems: 'center',
  },

  heroRingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  heroRingLabel: {
    color: '#C7D5FF',
    fontSize: 9,
    marginTop: 1,
  },

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    marginBottom: 15,
  },

  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  overviewTitle: {
    color: '#172A55',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },

  overviewSubtitle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    maxWidth: '88%',
  },

  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#E7EDF7',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 17,
  },

  progressFill: {
    width: '72%',
    height: '100%',
    backgroundColor: '#2457E6',
    borderRadius: 5,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  progressStart: {
    color: '#94A3B8',
    fontSize: 10,
  },

  progressEnd: {
    color: '#2457E6',
    fontSize: 10,
    fontWeight: '700',
  },

  scoreStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },

  scoreStat: {
    flex: 1,
    alignItems: 'center',
  },

  scoreStatNumber: {
    color: '#172A55',
    fontSize: 19,
    fontWeight: '900',
  },

  scoreStatLabel: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },

  aiCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4E2FF',
    marginBottom: 25,
  },

  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiContent: {
    flex: 1,
  },

  aiEyebrow: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  aiTitle: {
    color: '#173FBD',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  aiText: {
    color: '#49658F',
    fontSize: 11,
    lineHeight: 17,
  },

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 21,
    fontWeight: '900',
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  selectedNumber: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 4,
  },

  selectedLabel: {
    color: '#56709A',
    fontSize: 10,
    fontWeight: '600',
  },

  focusContainer: {
    marginBottom: 22,
  },

  focusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#172A55',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  focusCardSelected: {
    borderWidth: 2,
    borderColor: '#2457E6',
    backgroundColor: '#F5F8FF',
  },

  focusIconContainer: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  focusIconContainerSelected: {
    backgroundColor: '#2457E6',
  },

  focusContent: {
    flex: 1,
    paddingRight: 7,
  },

  focusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  focusTitle: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 7,
    flexShrink: 1,
  },

  focusTitleSelected: {
    color: '#173FBD',
  },

  focusCategory: {
    color: '#8A9AB4',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  priorityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
  },

  priorityBadgeSelected: {
    backgroundColor: '#DCE7FF',
  },

  priorityText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
  },

  priorityTextSelected: {
    color: '#2457E6',
  },

  focusDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  selectedIndicatorText: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 5,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  checklistCount: {
    backgroundColor: '#DCFCE7',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  checklistCountText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },

  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E1E8F5',
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  checklistRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  checkCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  checkCircleComplete: {
    backgroundColor: '#DCFCE7',
  },

  checkCirclePending: {
    backgroundColor: '#FEF3C7',
  },

  checklistTextContainer: {
    flex: 1,
  },

  checklistText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },

  checklistStatus: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  completeStatus: {
    color: '#16A34A',
  },

  pendingStatus: {
    color: '#B45309',
  },

  employerCard: {
    backgroundColor: '#172A55',
    borderRadius: 21,
    padding: 18,
    marginBottom: 18,
  },

  employerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  employerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  employerHeaderText: {
    flex: 1,
  },

  employerEyebrow: {
    color: '#9EB8FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  employerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  expectationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 11,
  },

  expectationDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  expectationText: {
    flex: 1,
    color: '#DCE6FA',
    fontSize: 11,
    lineHeight: 17,
    paddingTop: 2,
  },

  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E1E8F5',
    marginBottom: 22,
  },

  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
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
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  tipTitle: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },

  tipText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  saveSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5F3',
  },

  saveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  saveInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  saveInfoContent: {
    flex: 1,
  },

  saveInfoTitle: {
    color: '#172A55',
    fontSize: 13,
    fontWeight: '800',
  },

  saveInfoText: {
    color: '#7A8AA3',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  continueButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#2457E6',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 8,
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 11,
    paddingHorizontal: 12,
  },
});
