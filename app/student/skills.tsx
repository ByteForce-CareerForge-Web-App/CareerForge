import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '@/constants/api';

type Skill = {
  id: number;
  skill_code: string;
  name: string;
  category: string;
  description: string | null;
};

type PrioritySkill = {
  skill: string;
  priority: string;
  reason: string;
};

type AIAnalysis = {
  skill_gap?: {
    existing_skills?: string[];
    strong_skills?: string[];
    skills_to_improve?: string[];
    missing_skills?: string[];
    priority_skills?: PrioritySkill[];
  };
  recommendations?: string[];
};

export default function SkillsScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [aiAnalysis, setAIAnalysis] =
    useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Authentication Helper
  |--------------------------------------------------------------------------
  */

  const handleAuthenticationFailure = () => {
    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/login');
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Load AI Skill Analysis
  |--------------------------------------------------------------------------
  */

  const loadAIAnalysis = useCallback(async () => {
    try {
      setLoadingAI(true);

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/ai-analysis-result.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();

      console.log(
        'AI Skills Analysis response:',
        result
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      /*
       * A 404 simply means the student has not generated
       * an AI analysis yet. The normal skills screen
       * should continue working.
       */
      if (response.status === 404) {
        setAIAnalysis(null);
        return;
      }

      if (!response.ok || !result.success) {
        console.log(
          'Unable to load AI skill analysis:',
          result.message
        );
        return;
      }

      setAIAnalysis(result.data || null);
    } catch (error) {
      console.log(
        'Error loading AI skill analysis:',
        error
      );
    } finally {
      setLoadingAI(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Skills From API
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadSkills = async () => {
        try {
          setLoadingSkills(true);

          console.log(
            'Loading skills from API...'
          );

          const token =
            await AsyncStorage.getItem('authToken');

          if (!token) {
            handleAuthenticationFailure();
            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/skills.php`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );

          console.log(
            'Skills API status:',
            response.status
          );

          const result = await response.json();

          console.log(
            'Skills API response:',
            result
          );

          if (!isActive) {
            return;
          }

          if (!response.ok || !result.success) {
            if (response.status === 401) {
              handleAuthenticationFailure();
              return;
            }

            throw new Error(
              result.message ||
                'Failed to load skills'
            );
          }

          setSkills(
            result.data?.skills || []
          );

          setSelectedSkills(
            (
              result.data
                ?.selected_skill_ids || []
            ).map((id: number) =>
              Number(id)
            )
          );

          console.log(
            'Skills loaded:',
            result.data?.skills?.length
          );

          console.log(
            'Selected skills:',
            result.data
              ?.selected_skill_ids
          );
        } catch (error) {
          console.log(
            'Error loading skills:',
            error
          );

          if (isActive) {
            Alert.alert(
              'Error',
              'Unable to load your skills. Please try again.'
            );
          }
        } finally {
          if (isActive) {
            setLoadingSkills(false);
          }
        }
      };

      loadSkills();
      loadAIAnalysis();

      return () => {
        isActive = false;
      };
    }, [loadAIAnalysis])
  );

  /*
  |--------------------------------------------------------------------------
  | AI Skill Data
  |--------------------------------------------------------------------------
  */

  const skillGap =
    aiAnalysis?.skill_gap;

  const skillsToImprove =
    skillGap?.skills_to_improve || [];

  const missingSkills =
    skillGap?.missing_skills || [];

  const strongSkills =
    skillGap?.strong_skills || [];

  const prioritySkills =
    skillGap?.priority_skills || [];

  /*
  |--------------------------------------------------------------------------
  | Categories
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        skills.map(
          (skill) => skill.category
        )
      )
    );

    return ['All', ...uniqueCategories];
  }, [skills]);

  /*
  |--------------------------------------------------------------------------
  | Filter Skills
  |--------------------------------------------------------------------------
  */

  const filteredSkills = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return skills.filter((skill) => {
      const matchesSearch =
        search.length === 0 ||
        skill.name
          .toLowerCase()
          .includes(search) ||
        skill.category
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === 'All' ||
        skill.category === selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    skills,
    searchText,
    selectedCategory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Skill
  |--------------------------------------------------------------------------
  */

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((currentSkills) => {
      if (
        currentSkills.includes(skillId)
      ) {
        return currentSkills.filter(
          (id) => id !== skillId
        );
      }

      return [
        ...currentSkills,
        skillId,
      ];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Get Icon For Skill
  |--------------------------------------------------------------------------
  */

  const getSkillIcon = (skill: Skill) => {
    const name =
      skill.name.toLowerCase();

    const category =
      skill.category.toLowerCase();

    if (name.includes('python')) {
      return '🐍';
    }

    if (
      name.includes('javascript') ||
      name.includes('typescript')
    ) {
      return '💻';
    }

    if (
      name.includes('data') ||
      category.includes('data')
    ) {
      return '📊';
    }

    if (
      name.includes('communication') ||
      name.includes('presentation')
    ) {
      return '🗣️';
    }

    if (
      name.includes('problem') ||
      name.includes('analytical')
    ) {
      return '🧩';
    }

    if (
      name.includes('team') ||
      name.includes('collaboration')
    ) {
      return '🤝';
    }

    if (
      category.includes('programming') ||
      category.includes('development')
    ) {
      return '💻';
    }

    if (category.includes('business')) {
      return '💼';
    }

    if (category.includes('design')) {
      return '🎨';
    }

    if (category.includes('management')) {
      return '📋';
    }

    if (category.includes('ai')) {
      return '🤖';
    }

    if (category.includes('cloud')) {
      return '☁️';
    }

    if (category.includes('security')) {
      return '🔐';
    }

    if (category.includes('database')) {
      return '🗄️';
    }

    return '⭐';
  };

  /*
  |--------------------------------------------------------------------------
  | Check Whether AI Identifies A Skill
  |--------------------------------------------------------------------------
  */

  const aiSkillMatch = (
    skillName: string,
    list: string[]
  ) => {
    const normalizedName =
      skillName.trim().toLowerCase();

    return list.some(
      (item) =>
        item.trim().toLowerCase() ===
        normalizedName
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Get AI Status For Skill
  |--------------------------------------------------------------------------
  */

  const getAISkillStatus = (
    skillName: string
  ) => {
    if (
      aiSkillMatch(
        skillName,
        strongSkills
      )
    ) {
      return 'strong';
    }

    if (
      aiSkillMatch(
        skillName,
        skillsToImprove
      )
    ) {
      return 'improve';
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | Save Skills
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    console.log(
      'Save Skills pressed:',
      selectedSkills
    );

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const token =
        await AsyncStorage.getItem(
          'authToken'
        );

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      console.log(
        'Saving skills to API:',
        selectedSkills
      );

      const response = await fetch(
        `${API_BASE_URL}/skills.php`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            skill_ids: selectedSkills,
          }),
        }
      );

      console.log(
        'Save skills API status:',
        response.status
      );

      const result =
        await response.json();

      console.log(
        'Save skills API response:',
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        if (response.status === 401) {
          handleAuthenticationFailure();
          return;
        }

        throw new Error(
          result.message ||
            'Failed to save skills'
        );
      }

      Alert.alert(
        'Skills Saved',
        'Your skills have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(
                '/student/profile'
              );
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(
        'Error saving skills:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while saving your skills.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}

      <View style={styles.header}>
        <View
          style={styles.iconContainer}
        >
          <Text style={styles.icon}>
            💡
          </Text>
        </View>

        <Text style={styles.title}>
          My Skills
        </Text>

        <Text style={styles.subtitle}>
          Select the skills you currently
          have. These skills will appear on
          your profile and help employers
          understand your strengths.
        </Text>
      </View>

      {/* Selected Skills Summary */}

      <View style={styles.summaryCard}>
        <View
          style={
            styles.summaryIconContainer
          }
        >
          <Text
            style={styles.summaryIcon}
          >
            ✓
          </Text>
        </View>

        <View
          style={styles.summaryContent}
        >
          <Text
            style={styles.summaryTitle}
          >
            Your Current Skills
          </Text>

          <Text
            style={styles.summaryText}
          >
            {loadingSkills
              ? 'Loading your skills...'
              : `${selectedSkills.length} skill${
                  selectedSkills.length ===
                  1
                    ? ''
                    : 's'
                } selected`}
          </Text>
        </View>
      </View>

      {/* AI Skill Intelligence */}

      {!loadingAI &&
        aiAnalysis &&
        skillGap && (
          <View
            style={styles.aiCard}
          >
            <View
              style={styles.aiHeader}
            >
              <View
                style={
                  styles.aiIconContainer
                }
              >
                <Text
                  style={styles.aiIcon}
                >
                  ✨
                </Text>
              </View>

              <View
                style={styles.aiHeaderText}
              >
                <Text
                  style={styles.aiTitle}
                >
                  CareerForge AI
                </Text>

                <Text
                  style={styles.aiSubtitle}
                >
                  Your skill intelligence
                </Text>
              </View>
            </View>

            {strongSkills.length >
              0 && (
              <View
                style={
                  styles.aiInsightBlock
                }
              >
                <Text
                  style={
                    styles.aiInsightHeading
                  }
                >
                  💪 Your Strengths
                </Text>

                <View
                  style={
                    styles.aiChipContainer
                  }
                >
                  {strongSkills
                    .slice(0, 5)
                    .map(
                      (
                        skill,
                        index
                      ) => (
                        <View
                          key={`${skill}-${index}`}
                          style={
                            styles.strongChip
                          }
                        >
                          <Text
                            style={
                              styles.strongChipText
                            }
                          >
                            {skill}
                          </Text>
                        </View>
                      )
                    )}
                </View>
              </View>
            )}

            {skillsToImprove.length >
              0 && (
              <View
                style={
                  styles.aiInsightBlock
                }
              >
                <Text
                  style={
                    styles.aiInsightHeading
                  }
                >
                  📈 Skills To Improve
                </Text>

                <Text
                  style={
                    styles.aiInsightText
                  }
                >
                  CareerForge AI identified
                  these skills as areas
                  where improving your
                  capability could strengthen
                  your career readiness.
                </Text>

                <View
                  style={
                    styles.aiChipContainer
                  }
                >
                  {skillsToImprove
                    .slice(0, 5)
                    .map(
                      (
                        skill,
                        index
                      ) => (
                        <View
                          key={`${skill}-${index}`}
                          style={
                            styles.improveChip
                          }
                        >
                          <Text
                            style={
                              styles.improveChipText
                            }
                          >
                            {skill}
                          </Text>
                        </View>
                      )
                    )}
                </View>
              </View>
            )}

            {missingSkills.length >
              0 && (
              <View
                style={
                  styles.aiInsightBlock
                }
              >
                <Text
                  style={
                    styles.aiInsightHeading
                  }
                >
                  🎯 Skills You May Need
                </Text>

                <Text
                  style={
                    styles.aiInsightText
                  }
                >
                  Based on your profile and
                  career direction, these
                  skills may be worth
                  developing next.
                </Text>

                <View
                  style={
                    styles.aiChipContainer
                  }
                >
                  {missingSkills
                    .slice(0, 5)
                    .map(
                      (
                        skill,
                        index
                      ) => (
                        <View
                          key={`${skill}-${index}`}
                          style={
                            styles.missingChip
                          }
                        >
                          <Text
                            style={
                              styles.missingChipText
                            }
                          >
                            {skill}
                          </Text>
                        </View>
                      )
                    )}
                </View>
              </View>
            )}

            {prioritySkills.length >
              0 && (
              <View
                style={
                  styles.prioritySection
                }
              >
                <Text
                  style={
                    styles.aiInsightHeading
                  }
                >
                  🔥 AI Priority Skills
                </Text>

                {prioritySkills
                  .slice(0, 3)
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <View
                        key={`${item.skill}-${index}`}
                        style={
                          styles.priorityCard
                        }
                      >
                        <View
                          style={
                            styles.priorityTop
                          }
                        >
                          <Text
                            style={
                              styles.prioritySkill
                            }
                          >
                            {item.skill}
                          </Text>

                          <View
                            style={[
                              styles.priorityBadge,
                              item.priority
                                ?.toLowerCase() ===
                                'high' &&
                                styles.highPriorityBadge,
                              item.priority
                                ?.toLowerCase() ===
                                'medium' &&
                                styles.mediumPriorityBadge,
                            ]}
                          >
                            <Text
                              style={
                                styles.priorityBadgeText
                              }
                            >
                              {item.priority ||
                                'Priority'}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={
                            styles.priorityReason
                          }
                        >
                          {item.reason}
                        </Text>
                      </View>
                    )
                  )}
              </View>
            )}

            <Pressable
              style={
                styles.viewAnalysisButton
              }
              onPress={() =>
                router.push(
                  '/student/employability-analysis'
                )
              }
            >
              <Text
                style={
                  styles.viewAnalysisText
                }
              >
                View Full AI Analysis →
              </Text>
            </Pressable>
          </View>
        )}

      {/* Search */}

      <View
        style={styles.searchContainer}
      >
        <Text
          style={styles.searchIcon}
        >
          🔎
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={setSearchText}
        />

        {searchText.length > 0 && (
          <Pressable
            onPress={() =>
              setSearchText('')
            }
          >
            <Text
              style={styles.clearText}
            >
              ✕
            </Text>
          </Pressable>
        )}
      </View>

      {/* Categories */}

      {!loadingSkills &&
        categories.length > 1 && (
          <View
            style={styles.categorySection}
          >
            <Text
              style={styles.categoryLabel}
            >
              Browse by category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoryContainer
              }
            >
              {categories.map(
                (category) => {
                  const isActive =
                    selectedCategory ===
                    category;

                  return (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryChip,
                        isActive &&
                          styles.categoryChipActive,
                      ]}
                      onPress={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>
          </View>
        )}

      {/* Skills Header */}

      <View
        style={styles.selectionHeader}
      >
        <Text
          style={styles.sectionTitle}
        >
          Skills You Have
        </Text>

        <Text
          style={styles.selectedText}
        >
          {loadingSkills
            ? 'Loading...'
            : `${filteredSkills.length} shown`}
        </Text>
      </View>

      {/* Skills */}

      <View
        style={styles.skillsContainer}
      >
        {loadingSkills ? (
          <View
            style={styles.loadingContainer}
          >
            <Text
              style={styles.loadingText}
            >
              Loading skills...
            </Text>
          </View>
        ) : skills.length === 0 ? (
          <View
            style={styles.loadingContainer}
          >
            <Text
              style={styles.loadingText}
            >
              No skills available.
            </Text>
          </View>
        ) : filteredSkills.length ===
          0 ? (
          <View
            style={styles.loadingContainer}
          >
            <Text
              style={styles.emptyIcon}
            >
              🔎
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No skills found
            </Text>

            <Text
              style={styles.emptyText}
            >
              Try a different search or
              category.
            </Text>
          </View>
        ) : (
          filteredSkills.map((skill) => {
            const isSelected =
              selectedSkills.includes(
                skill.id
              );

            const aiStatus =
              getAISkillStatus(
                skill.name
              );

            return (
              <Pressable
                key={skill.id}
                style={[
                  styles.skillCard,
                  isSelected &&
                    styles.skillCardSelected,
                ]}
                onPress={() =>
                  toggleSkill(skill.id)
                }
              >
                <View
                  style={[
                    styles.skillIconContainer,
                    isSelected &&
                      styles.skillIconSelected,
                  ]}
                >
                  <Text
                    style={styles.skillIcon}
                  >
                    {getSkillIcon(skill)}
                  </Text>
                </View>

                <View
                  style={
                    styles.skillContent
                  }
                >
                  <View
                    style={
                      styles.skillTitleRow
                    }
                  >
                    <Text
                      style={[
                        styles.skillTitle,
                        isSelected &&
                          styles.skillTitleSelected,
                      ]}
                    >
                      {skill.name}
                    </Text>

                    {aiStatus ===
                      'strong' && (
                      <View
                        style={
                          styles.aiStatusStrong
                        }
                      >
                        <Text
                          style={
                            styles.aiStatusText
                          }
                        >
                          AI Strength
                        </Text>
                      </View>
                    )}

                    {aiStatus ===
                      'improve' && (
                      <View
                        style={
                          styles.aiStatusImprove
                        }
                      >
                        <Text
                          style={
                            styles.aiStatusTextImprove
                          }
                        >
                          Improve
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={
                      styles.skillCategory
                    }
                  >
                    {skill.category}
                  </Text>

                  <Text
                    style={
                      styles.skillDescription
                    }
                  >
                    {skill.description ||
                      'Current skill'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    isSelected &&
                      styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Text
                      style={
                        styles.checkmark
                      }
                    >
                      ✓
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      {/* Tip */}

      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>
          💡
        </Text>

        <View style={styles.tipContent}>
          <Text
            style={styles.tipTitle}
          >
            Career Tip
          </Text>

          <Text
            style={styles.tipText}
          >
            Only select skills you
            currently have. CareerForgeAI
            can analyse your profile and
            identify skills you should
            develop based on your career
            goals.
          </Text>
        </View>
      </View>

      {/* Save */}

      <Pressable
        style={[
          styles.continueButton,
          saving &&
            styles.continueButtonDisabled,
        ]}
        disabled={saving}
        onPress={handleSave}
      >
        <Text
          style={styles.continueText}
        >
          {saving
            ? 'Saving...'
            : 'Save My Skills'}
        </Text>
      </Pressable>

      <Text
        style={styles.footerText}
      >
        You can update your skills anytime
        from your profile.
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
    paddingBottom: 45,
  },

  backButton: {
    marginBottom: 22,
  },

  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  icon: {
    fontSize: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  summaryIcon: {
    fontSize: 21,
    color: '#4F46E5',
    fontWeight: 'bold',
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },

  summaryText: {
    fontSize: 12,
    color: '#64748B',
  },

  /*
  |--------------------------------------------------------------------------
  | AI Card
  |--------------------------------------------------------------------------
  */

  aiCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 20,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  aiIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiIcon: {
    fontSize: 21,
  },

  aiHeaderText: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 2,
  },

  aiSubtitle: {
    fontSize: 12,
    color: '#6366F1',
  },

  aiInsightBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  aiInsightHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 7,
  },

  aiInsightText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 9,
  },

  aiChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  strongChip: {
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  strongChipText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },

  improveChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  improveChipText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },

  missingChip: {
    backgroundColor: '#E0E7FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  missingChipText: {
    color: '#3730A3',
    fontSize: 11,
    fontWeight: '700',
  },

  prioritySection: {
    marginTop: 2,
  },

  priorityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 12,
    marginBottom: 8,
  },

  priorityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  prioritySkill: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },

  priorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0E7FF',
  },

  highPriorityBadge: {
    backgroundColor: '#FEE2E2',
  },

  mediumPriorityBadge: {
    backgroundColor: '#FEF3C7',
  },

  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4338CA',
    textTransform: 'uppercase',
  },

  priorityReason: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },

  viewAnalysisButton: {
    height: 45,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  viewAnalysisText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  clearText: {
    fontSize: 16,
    color: '#94A3B8',
    paddingLeft: 8,
  },

  /*
  |--------------------------------------------------------------------------
  | Categories
  |--------------------------------------------------------------------------
  */

  categorySection: {
    marginBottom: 22,
  },

  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },

  categoryContainer: {
    paddingRight: 10,
  },

  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },

  categoryChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  /*
  |--------------------------------------------------------------------------
  | Skills
  |--------------------------------------------------------------------------
  */

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  skillsContainer: {
    marginBottom: 10,
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  skillCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  skillIconSelected: {
    backgroundColor: '#E0E7FF',
  },

  skillIcon: {
    fontSize: 24,
  },

  skillContent: {
    flex: 1,
    paddingRight: 8,
  },

  skillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },

  skillTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },

  skillTitleSelected: {
    color: '#4F46E5',
  },

  skillCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 3,
  },

  skillDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  /*
  |--------------------------------------------------------------------------
  | AI Skill Status
  |--------------------------------------------------------------------------
  */

  aiStatusStrong: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  aiStatusImprove: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  aiStatusText: {
    color: '#166534',
    fontSize: 8,
    fontWeight: '800',
  },

  aiStatusTextImprove: {
    color: '#92400E',
    fontSize: 8,
    fontWeight: '800',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /*
  |--------------------------------------------------------------------------
  | Tip
  |--------------------------------------------------------------------------
  */

  tipCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 18,
  },

  tipIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4F46E5',
  },

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  continueButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});

