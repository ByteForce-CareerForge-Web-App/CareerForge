import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../../constants/api';

type Skill = {
  id: number;
  name: string;
};

const QUALIFICATIONS = [
  'National Senior Certificate (Grade 12)',
  'Higher Certificate',
  'Advanced Certificate',
  'Diploma',
  'Advanced Diploma',
  "Bachelor's Degree",
  "Bachelor's Honours Degree",
  'Postgraduate Diploma',
  "Master's Degree",
  'Doctoral Degree',
  'Professional Qualification',
];

const OPPORTUNITY_TYPES = [
  {
    label: 'Internship',
    value: 'internship',
  },
  {
    label: 'Graduate Job',
    value: 'job',
  },
  {
    label: 'Learnership',
    value: 'learnership',
  },
];

const WORK_ARRANGEMENTS = [
  {
    label: 'On-site',
    value: 'on-site',
  },
  {
    label: 'Hybrid',
    value: 'hybrid',
  },
  {
    label: 'Remote',
    value: 'remote',
  },
];

export default function PostOpportunityScreen() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [location, setLocation] = useState('');
  const [workArrangement, setWorkArrangement] =
    useState('');

  const [deadline, setDeadline] = useState('');
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [positions, setPositions] = useState('');

  const [qualification, setQualification] =
    useState('');
  const [showQualifications, setShowQualifications] =
    useState(false);

  const [isPosting, setIsPosting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATABASE SKILLS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoadingSkills(true);

      const response = await fetch(
        `${API_BASE_URL}/business/skills.php`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to load predefined skills.'
        );
      }

      setSkills(
        Array.isArray(result.skills)
          ? result.skills
          : []
      );
    } catch (error) {
      console.error(
        'Load skills error:',
        error
      );

      Alert.alert(
        'Unable to Load Skills',
        'CareerForge could not load the predefined skills from the database. Please try again.'
      );
    } finally {
      setLoadingSkills(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH SKILLS
  |--------------------------------------------------------------------------
  */

  const filteredSkills = useMemo(() => {
    const search = skillSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return [];
    }

    return skills
      .filter(
        (skill) =>
          !selectedSkills.some(
            (selected) =>
              selected.id === skill.id
          )
      )
      .filter((skill) =>
        skill.name
          .toLowerCase()
          .includes(search)
      )
      .slice(0, 10);
  }, [
    skills,
    skillSearch,
    selectedSkills,
  ]);

  const addSkill = (skill: Skill) => {
    setSelectedSkills((current) => [
      ...current,
      skill,
    ]);

    setSkillSearch('');
  };

  const removeSkill = (skillId: number) => {
    setSelectedSkills((current) =>
      current.filter(
        (skill) => skill.id !== skillId
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleDateValueChange = (
    event: any
  ) => {
    if (!event?.nativeEvent?.timestamp) {
      return;
    }

    const date = new Date(
      event.nativeEvent.timestamp
    );

    setSelectedDate(date);
    setDeadline(
      formatApiDate(date)
    );
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  /*
  |--------------------------------------------------------------------------
  | POST OPPORTUNITY
  |--------------------------------------------------------------------------
  */

  const handlePostOpportunity = async () => {
    if (isPosting) {
      return;
    }

    if (
      !title.trim() ||
      !type ||
      !description.trim() ||
      !location.trim() ||
      !workArrangement ||
      !deadline ||
      !positions.trim() ||
      !qualification
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all fields before posting the opportunity.'
      );

      return;
    }

    if (selectedSkills.length === 0) {
      Alert.alert(
        'Required Skills',
        'Please select at least one required skill.'
      );

      return;
    }

    const numberOfPositions =
      Number(positions);

    if (
      !Number.isInteger(
        numberOfPositions
      ) ||
      numberOfPositions <= 0
    ) {
      Alert.alert(
        'Invalid Positions',
        'Please enter a valid number of positions.'
      );

      return;
    }

    const token =
      await AsyncStorage.getItem(
        'authToken'
      );

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setIsPosting(true);

      const response = await fetch(
        `${API_BASE_URL}/business/post-opportunity.php`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            title: title.trim(),

            type,

            description:
              description.trim(),

            location:
              location.trim(),

            work_arrangement:
              workArrangement,

            deadline,

            positions:
              numberOfPositions,

            minimum_qualification:
              qualification,

            skill_ids:
              selectedSkills.map(
                (skill) => skill.id
              ),
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        'Post opportunity response:',
        result
      );

      if (response.status === 401) {
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
                router.replace(
                  '/login'
                ),
            },
          ]
        );

        return;
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Unable to post the opportunity.'
        );
      }

      Alert.alert(
        'Opportunity Posted',
        'Your opportunity has been posted successfully.',
        [
          {
            text: 'OK',

            onPress: () =>
              router.replace(
                '/business/manage-opportunities'
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Post opportunity error:',
        error
      );

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Unable to post the opportunity. Please try again.'
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>
            Post Opportunity
          </Text>

          <Text style={styles.headerSubtitle}>
            Find the right graduate talent for your
            business.
          </Text>
        </View>
      </View>

      {/* Form */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Opportunity Details
        </Text>

        <Text style={styles.label}>
          Opportunity Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Graduate Data Analyst"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>
          Opportunity Type
        </Text>

        <View style={styles.optionsRow}>
          {OPPORTUNITY_TYPES.map(
            (option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  type ===
                    option.value &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setType(
                    option.value
                  )
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    type ===
                      option.value &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          )}
        </View>

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Describe the opportunity, responsibilities and expectations..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>
          Required Skills
        </Text>

        {/* Selected Skills */}

        {selectedSkills.length > 0 && (
          <View
            style={
              styles.selectedSkillsContainer
            }
          >
            {selectedSkills.map(
              (skill) => (
                <View
                  key={skill.id}
                  style={styles.skillChip}
                >
                  <Text
                    style={
                      styles.skillChipText
                    }
                  >
                    {skill.name}
                  </Text>

                  <Pressable
                    onPress={() =>
                      removeSkill(
                        skill.id
                      )
                    }
                    style={
                      styles.removeSkillButton
                    }
                  >
                    <Text
                      style={
                        styles.removeSkillText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>
              )
            )}
          </View>
        )}

        {/* Skill Search */}

        <TextInput
          style={styles.input}
          placeholder={
            loadingSkills
              ? 'Loading skills...'
              : 'Search predefined skills...'
          }
          placeholderTextColor="#94A3B8"
          value={skillSearch}
          onChangeText={
            setSkillSearch
          }
          editable={!loadingSkills}
        />

        {/* Helper Text */}

        {!loadingSkills &&
          skillSearch.trim() === '' &&
          selectedSkills.length === 0 && (
            <Text
              style={
                styles.skillsHelperText
              }
            >
              Search for skills required for this
              opportunity.
            </Text>
          )}

        {/* Search Results */}

        {!loadingSkills &&
          skillSearch.trim() !== '' &&
          filteredSkills.length > 0 && (
            <View
              style={
                styles.skillResults
              }
            >
              {filteredSkills.map(
                (skill, index) => (
                  <Pressable
                    key={skill.id}
                    style={[
                      styles.skillResult,
                      index ===
                        filteredSkills.length -
                          1 &&
                        styles.lastSkillResult,
                    ]}
                    onPress={() =>
                      addSkill(
                        skill
                      )
                    }
                  >
                    <Text
                      style={
                        styles.skillResultText
                      }
                    >
                      {skill.name}
                    </Text>

                    <Text
                      style={
                        styles.skillAddText
                      }
                    >
                      +
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          )}

        {/* No Search Results */}

        {!loadingSkills &&
          skillSearch.trim() !== '' &&
          filteredSkills.length ===
            0 && (
            <Text
              style={
                styles.noSkillsText
              }
            >
              No predefined skills found.
            </Text>
          )}
      </View>

      {/* Job Information */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Job Information
        </Text>

        <Text style={styles.label}>
          Location
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Durban, KwaZulu-Natal"
          placeholderTextColor="#94A3B8"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>
          Work Arrangement
        </Text>

        <View style={styles.optionsRow}>
          {WORK_ARRANGEMENTS.map(
            (option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  workArrangement ===
                    option.value &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setWorkArrangement(
                    option.value
                  )
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    workArrangement ===
                      option.value &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          )}
        </View>

        <Text style={styles.label}>
          Application Deadline
        </Text>

        <Pressable
          style={styles.input}
          onPress={() =>
            setShowDatePicker(true)
          }
        >
          <Text
            style={[
              styles.dateText,
              !deadline &&
                styles.placeholderText,
            ]}
          >
            {selectedDate
              ? formatDisplayDate(
                  selectedDate
                )
              : 'Choose application deadline'}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={
              selectedDate ||
              new Date()
            }
            mode="date"
            display="default"
            minimumDate={
              new Date()
            }
            onValueChange={
              handleDateValueChange
            }
            onDismiss={
              handleDateDismiss
            }
          />
        )}

        <Text style={styles.label}>
          Number of Positions
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 5"
          placeholderTextColor="#94A3B8"
          value={positions}
          onChangeText={setPositions}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Minimum Qualification
        </Text>

        <Pressable
          style={styles.input}
          onPress={() =>
            setShowQualifications(
              true
            )
          }
        >
          <Text
            style={[
              styles.dateText,
              !qualification &&
                styles.placeholderText,
            ]}
          >
            {qualification ||
              'Choose minimum qualification'}
          </Text>
        </Pressable>
      </View>

      {/* Qualification Modal */}

      <Modal
        visible={
          showQualifications
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowQualifications(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setShowQualifications(
              false
            )
          }
        >
          <Pressable
            style={
              styles.qualificationModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Minimum Qualification
            </Text>

            <Text
              style={
                styles.modalSubtitle
              }
            >
              Select the minimum qualification
              required for this opportunity.
            </Text>

            <ScrollView
              style={
                styles.qualificationList
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {QUALIFICATIONS.map(
                (item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.qualificationOption,
                      qualification ===
                        item &&
                        styles.qualificationSelected,
                    ]}
                    onPress={() => {
                      setQualification(
                        item
                      );

                      setShowQualifications(
                        false
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.qualificationText,
                        qualification ===
                          item &&
                          styles.qualificationTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>

            <Pressable
              style={
                styles.modalCancelButton
              }
              onPress={() =>
                setShowQualifications(
                  false
                )
              }
            >
              <Text
                style={
                  styles.modalCancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Buttons */}

      <Pressable
        style={[
          styles.postButton,
          isPosting &&
            styles.postButtonDisabled,
        ]}
        onPress={
          handlePostOpportunity
        }
        disabled={isPosting}
      >
        {isPosting ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <Text
            style={
              styles.postButtonText
            }
          >
            Post Opportunity
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={isPosting}
      >
        <Text
          style={
            styles.cancelButtonText
          }
        >
          Cancel
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },

  textArea: {
    height: 120,
    paddingTop: 12,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  optionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },

  optionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  optionTextSelected: {
    color: '#4F46E5',
  },

  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 20,
    paddingLeft: 11,
    paddingRight: 5,
    paddingVertical: 7,
  },

  skillChipText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '600',
  },

  removeSkillButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  removeSkillText: {
    color: '#4F46E5',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: 'bold',
  },

  skillsHelperText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },

  skillResults: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  skillResult: {
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  lastSkillResult: {
    borderBottomWidth: 0,
  },

  skillResultText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  skillAddText: {
    color: '#4F46E5',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },

  noSkillsText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },

  dateText: {
    fontSize: 14,
    color: '#0F172A',
  },

  placeholderText: {
    color: '#94A3B8',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  qualificationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 14,
  },

  qualificationList: {
    maxHeight: 420,
  },

  qualificationOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  qualificationSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },

  qualificationText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },

  qualificationTextSelected: {
    color: '#4F46E5',
  },

  modalCancelButton: {
    marginTop: 4,
    paddingVertical: 13,
    alignItems: 'center',
  },

  modalCancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },

  postButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  postButtonDisabled: {
    opacity: 0.7,
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

