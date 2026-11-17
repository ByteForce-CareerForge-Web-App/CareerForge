import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '@/constants/api';

const SKILLS_STORAGE_KEY =
  'careerforge_skills';

type SkillItem = {
  id: string;
  skillCode: string;
  title: string;
  category: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};


/*
|--------------------------------------------------------------------------
| ICON HELPER
|--------------------------------------------------------------------------
|
| The database does not need an icon column.
| We choose an appropriate Ionicon based on
| the skill category.
|
*/

const getSkillIcon = (
  category: string,
  skillName: string
): keyof typeof Ionicons.glyphMap => {
  const value =
    `${category} ${skillName}`.toLowerCase();

  if (
    value.includes('javascript') ||
    value.includes('web') ||
    value.includes('frontend') ||
    value.includes('development')
  ) {
    return 'code-slash';
  }

  if (
    value.includes('python') ||
    value.includes('programming') ||
    value.includes('software') ||
    value.includes('coding')
  ) {
    return 'code-slash';
  }

  if (
    value.includes('data') ||
    value.includes('analytics') ||
    value.includes('statistics') ||
    value.includes('database')
  ) {
    return 'stats-chart';
  }

  if (
    value.includes('communication') ||
    value.includes('language') ||
    value.includes('writing')
  ) {
    return 'chatbubbles';
  }

  if (
    value.includes('management') ||
    value.includes('leadership')
  ) {
    return 'people';
  }

  if (
    value.includes('design') ||
    value.includes('creative') ||
    value.includes('ui') ||
    value.includes('ux')
  ) {
    return 'color-palette';
  }

  if (
    value.includes('security') ||
    value.includes('cyber')
  ) {
    return 'shield-checkmark';
  }

  if (
    value.includes('cloud') ||
    value.includes('devops')
  ) {
    return 'cloud';
  }

  if (
    value.includes('project')
  ) {
    return 'briefcase';
  }

  if (
    value.includes('business') ||
    value.includes('finance')
  ) {
    return 'business';
  }

  if (
    value.includes('marketing') ||
    value.includes('sales')
  ) {
    return 'megaphone';
  }

  if (
    value.includes('problem') ||
    value.includes('critical') ||
    value.includes('analytical')
  ) {
    return 'bulb';
  }

  if (
    value.includes('team') ||
    value.includes('collaboration')
  ) {
    return 'people';
  }

  return 'school-outline';
};


/*
|--------------------------------------------------------------------------
| MAP BACKEND SKILL
|--------------------------------------------------------------------------
*/

const mapBackendSkill = (
  skill: any
): SkillItem => {

  const id = String(
    skill.id
  );

  const name =
    skill.name ||
    'Unnamed Skill';

  const category =
    skill.category ||
    'Other';

  const description =
    skill.description ||
    'Develop this skill to strengthen your career profile.';

  return {
    id,
    skillCode:
      skill.skill_code
        ? String(skill.skill_code)
        : id,
    title: String(name),
    category: String(category),
    description: String(description),
    icon: getSkillIcon(
      String(category),
      String(name)
    ),
  };
};


export default function SkillsScreen() {

  const [skills, setSkills] =
    useState<SkillItem[]>([]);

  const [selectedSkills, setSelectedSkills] =
    useState<string[]>([]);

  const [loadingSkills, setLoadingSkills] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  const [yourSkillsOpen, setYourSkillsOpen] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD SKILLS FROM BACKEND
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {

      let isActive = true;

      const loadSkills = async () => {

        try {

          setLoadingSkills(true);

          const token =
            await AsyncStorage.getItem(
              'authToken'
            );

          if (!token) {
            router.replace('/login');
            return;
          }


          const response =
            await fetch(
              `${API_BASE_URL}/skills.php`,
              {
                method: 'GET',
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  'Content-Type':
                    'application/json',
                },
              }
            );


          const rawResponse =
            await response.text();

          console.log(
            'SKILLS API STATUS:',
            response.status
          );

          console.log(
            'SKILLS API RAW RESPONSE:',
            rawResponse
          );

          let data: any;

          try {

            data =
              JSON.parse(
                rawResponse
              );

          } catch {

            throw new Error(
              `Server returned an invalid response. HTTP ${response.status}`
            );
          }


          console.log(
            'Skills API response:',
            data
          );


          if (
            response.status === 401
          ) {

            await AsyncStorage.removeItem(
              'authToken'
            );

            await AsyncStorage.removeItem(
              'user'
            );

            router.replace('/login');

            return;
          }


          if (
            !response.ok ||
            !data.success
          ) {

            throw new Error(
              data.message ||
                'Failed to load skills.'
            );
          }


          if (!isActive) {
            return;
          }


          /*
           * Convert backend skills into
           * the exact structure expected
           * by the existing UI.
           */

          const backendSkills =
            Array.isArray(
              data.data?.skills
            )
              ? data.data.skills
              : [];


          const mappedSkills =
            backendSkills.map(
              mapBackendSkill
            );


          setSkills(
            mappedSkills
          );


          /*
           * Load selected IDs returned
           * by the backend.
           */

          const backendSelectedIds =
            Array.isArray(
              data.data
                ?.selected_skill_ids
            )
              ? data.data.selected_skill_ids
                  .map(
                    (id: any) =>
                      String(id)
                  )
              : [];


          setSelectedSkills(
            backendSelectedIds
          );


          /*
           * Keep AsyncStorage updated too.
           *
           * This preserves compatibility
           * with the existing roadmap and
           * other student screens.
           */

          await AsyncStorage.setItem(
            SKILLS_STORAGE_KEY,
            JSON.stringify(
              backendSelectedIds
            )
          );

        } catch (error) {

          console.log(
            'Error loading skills:',
            error
          );


          /*
           * If the backend cannot be reached,
           * fall back to the locally cached IDs.
           *
           * The actual skill cards will still
           * require the backend list.
           */

          try {

            const cachedSkills =
              await AsyncStorage.getItem(
                SKILLS_STORAGE_KEY
              );

            if (
              cachedSkills &&
              isActive
            ) {

              const parsed =
                JSON.parse(
                  cachedSkills
                );

              if (
                Array.isArray(parsed)
              ) {

                setSelectedSkills(
                  parsed.map(
                    (id: any) =>
                      String(id)
                  )
                );
              }
            }

          } catch (
            cacheError
          ) {

            console.log(
              'Error loading cached skills:',
              cacheError
            );
          }


          if (isActive) {

            Alert.alert(
              'Unable to Load Skills',
              error instanceof Error
                ? error.message
                : 'Something went wrong while loading your skills.'
            );
          }

        } finally {

          if (isActive) {
            setLoadingSkills(false);
          }
        }
      };


      loadSkills();


      return () => {
        isActive = false;
      };

    }, [])
  );


  /*
  |--------------------------------------------------------------------------
  | ADD / REMOVE SKILL
  |--------------------------------------------------------------------------
  */

  const toggleSkill = (
    skillId: string
  ) => {

    setSelectedSkills(
      (currentSkills) => {

        if (
          currentSkills.includes(
            skillId
          )
        ) {

          return currentSkills.filter(
            (id) =>
              id !== skillId
          );
        }


        return [
          ...currentSkills,
          skillId,
        ];
      }
    );
  };


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredSkills = useMemo(() => {

    const search =
      searchText
        .trim()
        .toLowerCase();


    if (!search) {
      return skills;
    }


    return skills.filter(
      (skill) => {

        return (
          skill.title
            .toLowerCase()
            .includes(search) ||

          skill.description
            .toLowerCase()
            .includes(search) ||

          skill.category
            .toLowerCase()
            .includes(search) ||

          skill.skillCode
            .toLowerCase()
            .includes(search)
        );
      }
    );

  }, [
    searchText,
    skills,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SELECTED SKILL OBJECTS
  |--------------------------------------------------------------------------
  */

  const selectedSkillObjects =
    useMemo(() => {

      return selectedSkills
        .map(
          (skillId) =>
            skills.find(
              (skill) =>
                skill.id ===
                skillId
            )
        )
        .filter(
          (
            skill
          ): skill is SkillItem =>
            Boolean(skill)
        );

    }, [
      selectedSkills,
      skills,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SAVE SKILLS
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {

    if (
      selectedSkills.length === 0
    ) {

      Alert.alert(
        'Select a Skill',
        'Please select at least one skill.'
      );

      return;
    }


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

        router.replace('/login');

        return;
      }


      /*
       * Convert the selected string IDs
       * back into numbers for PHP/MySQL.
       */

      const skillIds =
        selectedSkills.map(
          (id) => Number(id)
        );


      const response =
        await fetch(
          `${API_BASE_URL}/skills.php`,
          {
            method: 'PUT',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              skill_ids:
                skillIds,
            }),
          }
        );


      const rawResponse =
        await response.text();

      let data: any;

      try {

        data =
          JSON.parse(
            rawResponse
          );

      } catch {

        throw new Error(
          `Server returned an invalid response. HTTP ${response.status}`
        );
      }


      console.log(
        'Save skills API response:',
        data
      );


      if (
        response.status === 401
      ) {

        await AsyncStorage.removeItem(
          'authToken'
        );

        await AsyncStorage.removeItem(
          'user'
        );

        router.replace('/login');

        return;
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
            'Unable to save your skills.'
        );
      }


      /*
       * Store the IDs locally as well.
       */

      const savedIds =
        Array.isArray(
          data.data
            ?.selected_skill_ids
        )
          ? data.data
              .selected_skill_ids
              .map(
                (id: any) =>
                  String(id)
              )
          : selectedSkills;


      await AsyncStorage.setItem(
        SKILLS_STORAGE_KEY,
        JSON.stringify(
          savedIds
        )
      );


      setSelectedSkills(
        savedIds
      );


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
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your skills.'
      );

    } finally {

      setSaving(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loadingSkills) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color="#2457E6"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading skills...
        </Text>

      </View>
    );
  }


  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >

      {/* Back Button */}

      <Pressable
        style={styles.backButton}
        onPress={() =>
          router.back()
        }
      >

        <Ionicons
          name="arrow-back"
          size={20}
          color="#2457E6"
        />

        <Text
          style={styles.backText}
        >
          Back
        </Text>

      </Pressable>


      {/* Header */}

      <View
        style={styles.header}
      >

        <View
          style={
            styles.iconContainer
          }
        >

          <Ionicons
            name="school-outline"
            size={28}
            color="#2457E6"
          />

        </View>


        <Text
          style={styles.title}
        >
          Build Your Skills
        </Text>


        <Text
          style={styles.subtitle}
        >
          Select the skills you want to develop
          to become more career-ready.
        </Text>

      </View>


      {/* Progress */}

      <View
        style={styles.progressCard}
      >

        <View
          style={styles.progressHeader}
        >

          <Text
            style={styles.progressTitle}
          >
            Roadmap Progress
          </Text>


          <Text
            style={styles.progressValue}
          >
            Step 2 of 6
          </Text>

        </View>


        <View
          style={
            styles.progressBackground
          }
        >

          <View
            style={styles.progressFill}
          />

        </View>

      </View>


      {/* Your Skills Dropdown */}

      <View
        style={styles.yourSkillsCard}
      >

        <Pressable
          style={
            styles.yourSkillsHeader
          }
          onPress={() =>
            setYourSkillsOpen(
              (current) =>
                !current
            )
          }
        >

          <View
            style={
              styles.yourSkillsLeft
            }
          >

            <View
              style={
                styles.yourSkillsIcon
              }
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#2457E6"
              />

            </View>


            <View>

              <Text
                style={
                  styles.yourSkillsTitle
                }
              >
                Your Skills
              </Text>


              <Text
                style={
                  styles.yourSkillsCount
                }
              >
                {`${selectedSkills.length} ${
                  selectedSkills.length === 1
                    ? 'skill'
                    : 'skills'
                } selected`}
              </Text>

            </View>

          </View>


          <Ionicons
            name={
              yourSkillsOpen
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={22}
            color="#64748B"
          />

        </Pressable>


        {yourSkillsOpen && (

          <View
            style={
              styles.dropdownContent
            }
          >

            {selectedSkillObjects.length ===
            0 ? (

              <View
                style={
                  styles.emptySelected
                }
              >

                <Ionicons
                  name="sparkles-outline"
                  size={25}
                  color="#94A3B8"
                />


                <Text
                  style={
                    styles.emptySelectedText
                  }
                >
                  No skills selected yet.
                </Text>


                <Text
                  style={
                    styles.emptySelectedSubtext
                  }
                >
                  Search below and select skills
                  to build your profile.
                </Text>

              </View>

            ) : (

              selectedSkillObjects.map(
                (skill) => (

                  <View
                    key={skill.id}
                    style={
                      styles.selectedSkillRow
                    }
                  >

                    <View
                      style={
                        styles.selectedSkillIcon
                      }
                    >

                      <Ionicons
                        name={skill.icon}
                        size={18}
                        color="#2457E6"
                      />

                    </View>


                    <View
                      style={
                        styles.selectedSkillInfo
                      }
                    >

                      <Text
                        style={
                          styles.selectedSkillTitle
                        }
                      >
                        {skill.title}
                      </Text>


                      <Text
                        style={
                          styles.selectedSkillCategory
                        }
                      >
                        {skill.category}
                      </Text>

                    </View>


                    <Pressable
                      style={
                        styles.removeSkillButton
                      }
                      onPress={() =>
                        toggleSkill(
                          skill.id
                        )
                      }
                      hitSlop={8}
                    >

                      <Ionicons
                        name="close"
                        size={18}
                        color="#64748B"
                      />

                    </Pressable>

                  </View>

                )
              )

            )}

          </View>

        )}

      </View>


      {/* Search */}

      <View
        style={styles.searchSection}
      >

        <Text
          style={styles.sectionTitle}
        >
          Find a Skill
        </Text>


        <View
          style={
            styles.searchContainer
          }
        >

          <Ionicons
            name="search-outline"
            size={21}
            color="#64748B"
            style={styles.searchIcon}
          />


          <TextInput
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Search by skill name..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />


          {searchText.length > 0 && (

            <Pressable
              onPress={() =>
                setSearchText('')
              }
              hitSlop={8}
            >

              <Ionicons
                name="close-circle"
                size={20}
                color="#94A3B8"
              />

            </Pressable>

          )}

        </View>


        <View
          style={
            styles.resultsHeader
          }
        >

          <Text
            style={
              styles.resultsCount
            }
          >
            {filteredSkills.length}{' '}
            {filteredSkills.length === 1
              ? 'skill'
              : 'skills'}{' '}
            found
          </Text>


          <Text
            style={
              styles.totalSkills
            }
          >
            {skills.length} total
          </Text>

        </View>

      </View>


      {/* Skills */}

      <View
        style={styles.skillsContainer}
      >

        {filteredSkills.length ===
        0 ? (

          <View
            style={
              styles.emptySearchCard
            }
          >

            <View
              style={
                styles.emptySearchIcon
              }
            >

              <Ionicons
                name="search-outline"
                size={28}
                color="#64748B"
              />

            </View>


            <Text
              style={
                styles.emptySearchTitle
              }
            >
              No skills found
            </Text>


            <Text
              style={
                styles.emptySearchText
              }
            >
              Try searching for another skill,
              category, or keyword.
            </Text>

          </View>

        ) : (

          filteredSkills.map(
            (skill) => {

              const isSelected =
                selectedSkills.includes(
                  skill.id
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
                    toggleSkill(
                      skill.id
                    )
                  }
                >

                  {/* Icon */}

                  <View
                    style={[
                      styles.skillIconContainer,
                      isSelected &&
                        styles.skillIconSelected,
                    ]}
                  >

                    <Ionicons
                      name={skill.icon}
                      size={22}
                      color={
                        isSelected
                          ? '#FFFFFF'
                          : '#2457E6'
                      }
                    />

                  </View>


                  {/* Information */}

                  <View
                    style={
                      styles.skillContent
                    }
                  >

                    <Text
                      style={[
                        styles.skillTitle,
                        isSelected &&
                          styles.skillTitleSelected,
                      ]}
                    >
                      {skill.title}
                    </Text>


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
                      numberOfLines={2}
                    >
                      {skill.description}
                    </Text>

                  </View>


                  {/* Checkbox */}

                  <View
                    style={[
                      styles.checkbox,
                      isSelected &&
                        styles.checkboxSelected,
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
            }
          )

        )}

      </View>


      {/* Career Tip */}

      <View
        style={styles.tipCard}
      >

        <View
          style={
            styles.tipIconContainer
          }
        >

          <Ionicons
            name="bulb-outline"
            size={22}
            color="#2457E6"
          />

        </View>


        <View
          style={styles.tipContent}
        >

          <Text
            style={styles.tipTitle}
          >
            Career Tip
          </Text>


          <Text
            style={styles.tipText}
          >
            Focus on a combination of technical
            and soft skills. Employers value
            candidates who can solve problems
            and communicate effectively.
          </Text>

        </View>

      </View>


      {/* Save */}

      <Pressable
        style={[
          styles.continueButton,
          selectedSkills.length === 0 &&
            styles.continueButtonDisabled,
          saving &&
            styles.continueButtonDisabled,
        ]}
        disabled={
          selectedSkills.length === 0 ||
          saving
        }
        onPress={handleSave}
      >

        <Ionicons
          name="save-outline"
          size={19}
          color="#FFFFFF"
        />


        <Text
          style={styles.continueText}
        >
          {saving
            ? 'Saving...'
            : 'Save Skills'}
        </Text>

      </Pressable>


      {/* Footer */}

      <Text
        style={styles.footerText}
      >
        You can update your skills later from
        your profile.
      </Text>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backText: {
    fontSize: 16,
    color: '#2457E6',
    fontWeight: '600',
    marginLeft: 7,
  },

  header: {
    marginBottom: 22,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#102A72',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172A55',
  },

  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2457E6',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#2457E6',
    borderRadius: 10,
  },

  yourSkillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#DCE5F5',
    marginBottom: 24,
    overflow: 'hidden',
  },

  yourSkillsHeader: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  yourSkillsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  yourSkillsIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  yourSkillsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 3,
  },

  yourSkillsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  dropdownContent: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F8FAFF',
  },

  selectedSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
  },

  selectedSkillIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  selectedSkillInfo: {
    flex: 1,
  },

  selectedSkillTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172A55',
    marginBottom: 2,
  },

  selectedSkillCategory: {
    fontSize: 11,
    color: '#64748B',
  },

  removeSkillButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptySelected: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 15,
  },

  emptySelectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 9,
  },

  emptySelectedSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },

  searchSection: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 12,
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E1EF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#172A55',
    paddingVertical: 0,
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },

  resultsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  totalSkills: {
    fontSize: 12,
    color: '#2457E6',
    fontWeight: '700',
  },

  skillsContainer: {
    marginBottom: 10,
  },

  skillCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  skillCardSelected: {
    backgroundColor: '#F0F5FF',
    borderColor: '#2457E6',
    borderWidth: 1.5,
  },

  skillIconContainer: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  skillIconSelected: {
    backgroundColor: '#2457E6',
  },

  skillContent: {
    flex: 1,
    paddingRight: 8,
  },

  skillTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 3,
  },

  skillTitleSelected: {
    color: '#173FBD',
  },

  skillCategory: {
    fontSize: 11,
    color: '#2457E6',
    fontWeight: '700',
    marginBottom: 3,
  },

  skillDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#2457E6',
    borderColor: '#2457E6',
  },

  emptySearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptySearchIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172A55',
    marginBottom: 5,
  },

  emptySearchText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },

  tipCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 18,
  },

  tipIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173FBD',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#31538F',
  },

  continueButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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