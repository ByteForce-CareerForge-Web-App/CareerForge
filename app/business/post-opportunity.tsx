import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import { API_BASE_URL } from '@/constants/api';

type Skill = {
  id: number;
  name: string;
};

const OPPORTUNITY_TYPES = [
  'Internship',
  'Graduate Job',
  'Learnership',
];

const WORK_ARRANGEMENTS = [
  'On-site',
  'Hybrid',
  'Remote',
];

const TYPE_MAP: Record<string, string> = {
  Internship: 'internship',
  'Graduate Job': 'graduate_program',
  Learnership: 'learnership',
};

const ARRANGEMENT_MAP: Record<string, string> = {
  'On-site': 'on-site',
  Hybrid: 'hybrid',
  Remote: 'remote',
};

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function PostOpportunityScreen() {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');

  const [location, setLocation] = useState('');
  const [selectedArrangement, setSelectedArrangement] = useState('');

  const [salary, setSalary] = useState('');

  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [positions, setPositions] = useState('1');
  const [qualification, setQualification] = useState('');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD SKILLS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoadingSkills(true);

      const url = `${API_BASE_URL}/business/skills.php`;

      console.log('Loading skills from:', url);

      const response = await fetch(url);

      const rawText = await response.text();

      console.log('Skills HTTP status:', response.status);
      console.log('Skills response:', rawText);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${rawText.substring(0, 300)}`
        );
      }

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `The server returned HTML instead of JSON.\n\nResponse:\n${rawText.substring(
            0,
            250
          )}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || 'Unable to load skills.'
        );
      }

      if (!Array.isArray(data.skills)) {
        throw new Error(
          'The server did not return a valid skills list.'
        );
      }

      const formattedSkills: Skill[] = data.skills
        .map((skill: any) => ({
          id: Number(skill.id),
          name: String(skill.name ?? ''),
        }))
        .filter(
          (skill: Skill) =>
            Number.isFinite(skill.id) &&
            skill.name.trim() !== ''
        );

      setSkills(formattedSkills);
    } catch (error) {
      console.error('Error loading skills:', error);

      Alert.alert(
        'Unable to Load Skills',
        error instanceof Error
          ? error.message
          : 'Unable to load skills.'
      );
    } finally {
      setLoadingSkills(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTERED SKILLS
  |--------------------------------------------------------------------------
  */

  const filteredSkills = useMemo(() => {
    const search = skillSearch.trim().toLowerCase();

    if (!search) {
      return skills;
    }

    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(search)
    );
  }, [skills, skillSearch]);

  /*
  |--------------------------------------------------------------------------
  | SELECT / UNSELECT SKILLS
  |--------------------------------------------------------------------------
  */

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((current) => {
      if (current.includes(skillId)) {
        return current.filter((id) => id !== skillId);
      }

      return [...current, skillId];
    });
  };

  const selectedSkills = useMemo(() => {
    return skills.filter((skill) =>
      selectedSkillIds.includes(skill.id)
    );
  }, [skills, selectedSkillIds]);

  /*
  |--------------------------------------------------------------------------
  | DATE PICKER
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | POST OPPORTUNITY
  |--------------------------------------------------------------------------
  */

  const handlePostOpportunity = async () => {
    if (isSubmitting) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!title.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter an opportunity title.'
      );
      return;
    }

    if (!selectedType) {
      Alert.alert(
        'Required Field',
        'Please select an opportunity type.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter an opportunity description.'
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter the opportunity location.'
      );
      return;
    }

    if (!selectedArrangement) {
      Alert.alert(
        'Required Field',
        'Please select a work arrangement.'
      );
      return;
    }

    if (!deadline) {
      Alert.alert(
        'Required Field',
        'Please select an application deadline.'
      );
      return;
    }

    const formattedDeadline =
      formatDateForBackend(deadline);

    const positionCount = Number.parseInt(
      positions.trim(),
      10
    );

    if (
      !Number.isFinite(positionCount) ||
      positionCount <= 0
    ) {
      Alert.alert(
        'Invalid Positions',
        'Please enter at least 1 available position.'
      );
      return;
    }

    if (!qualification.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter the minimum qualification.'
      );
      return;
    }

    if (selectedSkillIds.length === 0) {
      Alert.alert(
        'Required Skills',
        'Please select at least one required skill.'
      );
      return;
    }

    const backendType = TYPE_MAP[selectedType];

    const backendArrangement =
      ARRANGEMENT_MAP[selectedArrangement];

    if (!backendType || !backendArrangement) {
      Alert.alert(
        'Invalid Selection',
        'Please select a valid opportunity type and work arrangement.'
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | AUTH TOKEN
    |--------------------------------------------------------------------------
    */

    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      Alert.alert(
        'Session Expired',
        'Please log in again before posting an opportunity.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SEND TO BACKEND
    |--------------------------------------------------------------------------
    */

    try {
      setIsSubmitting(true);

      /*
      IMPORTANT:
      The PHP file is inside:
      
      api/business/post-opportunities.php
      
      Therefore API_BASE_URL already pointing to /api means
      the correct endpoint is /business/post-opportunities.php.
      */

      const url =
        `${API_BASE_URL}/business/post-opportunities.php`;

      console.log(
        'Posting opportunity to:',
        url
      );

      const payload = {
        title: title.trim(),
        type: backendType,
        description: description.trim(),
        location: location.trim(),
        work_arrangement: backendArrangement,
        deadline: formattedDeadline,
        positions: positionCount,
        minimum_qualification: qualification.trim(),
        skill_ids: selectedSkillIds,
      };

      console.log(
        'Opportunity payload:',
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();

      console.log(
        'Post opportunity HTTP status:',
        response.status
      );

      console.log(
        'Post opportunity response:',
        rawText
      );

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `The server returned HTML instead of JSON.\n\nResponse:\n${rawText.substring(
            0,
            300
          )}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Unable to post opportunity. HTTP ${response.status}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      Alert.alert(
        'Opportunity Posted',
        data.message ||
          'Your opportunity has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(
                '/business/manage-opportunities'
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Error posting opportunity:',
        error
      );

      Alert.alert(
        'Unable to Post Opportunity',
        error instanceof Error
          ? error.message
          : 'Something went wrong while posting the opportunity.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            RECRUITMENT
          </Text>

          <Text style={styles.headerTitle}>
            Post Opportunity
          </Text>

          <Text style={styles.headerSubtitle}>
            Find the right graduate talent for your
            business.
          </Text>
        </View>

        {/* INTRO CARD */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="briefcase-outline"
              size={24}
              color="#111827"
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Connect with graduate talent
            </Text>

            <Text style={styles.introText}>
              Create an opportunity and let CareerForgeAI
              help match your role with suitable candidates.
            </Text>
          </View>
        </View>

        {/* OPPORTUNITY DETAILS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Opportunity Details
          </Text>

          <Text style={styles.label}>
            Opportunity Title
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Junior Software Developer"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>
            Opportunity Type
          </Text>

          <View style={styles.buttonRow}>
            {OPPORTUNITY_TYPES.map((type) => {
              const selected = selectedType === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[
                    styles.optionButton,
                    selected &&
                      styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selected &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the opportunity, responsibilities and expectations..."
            placeholderTextColor="#9CA3AF"
            style={[
              styles.input,
              styles.textArea,
            ]}
            multiline
            textAlignVertical="top"
          />

          {/* REQUIRED SKILLS */}

          <Text style={styles.label}>
            Required Skills
          </Text>

          <Text style={styles.helperText}>
            Select the skills required for this opportunity.
          </Text>

          <View style={styles.skillSearchContainer}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#6B7280"
            />

            <TextInput
              value={skillSearch}
              onChangeText={setSkillSearch}
              placeholder="Search skills..."
              placeholderTextColor="#9CA3AF"
              style={styles.skillSearchInput}
            />
          </View>

          {selectedSkills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              <Text style={styles.selectedSkillsTitle}>
                Selected Skills ({selectedSkills.length})
              </Text>

              <View style={styles.selectedSkillsRow}>
                {selectedSkills.map((skill) => (
                  <Pressable
                    key={skill.id}
                    onPress={() =>
                      toggleSkill(skill.id)
                    }
                    style={styles.skillChip}
                  >
                    <Text style={styles.skillChipText}>
                      {skill.name}
                    </Text>

                    <Ionicons
                      name="close-circle"
                      size={17}
                      color="#111827"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.skillsList}>
            {loadingSkills ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#111827"
                />

                <Text style={styles.loadingText}>
                  Loading skills...
                </Text>
              </View>
            ) : filteredSkills.length === 0 ? (
              <View style={styles.emptySkills}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color="#9CA3AF"
                />

                <Text style={styles.emptySkillsText}>
                  No skills found.
                </Text>
              </View>
            ) : (
              filteredSkills.map((skill) => {
                const selected =
                  selectedSkillIds.includes(skill.id);

                return (
                  <Pressable
                    key={skill.id}
                    onPress={() =>
                      toggleSkill(skill.id)
                    }
                    style={[
                      styles.skillRow,
                      selected &&
                        styles.skillRowSelected,
                    ]}
                  >
                    <View style={styles.skillRowText}>
                      <Text
                        style={[
                          styles.skillName,
                          selected &&
                            styles.skillNameSelected,
                        ]}
                      >
                        {skill.name}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        selected &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* JOB INFORMATION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Job Information
          </Text>

          <Text style={styles.label}>
            Location
          </Text>

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Johannesburg, Gauteng"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>
            Work Arrangement
          </Text>

          <View style={styles.buttonRow}>
            {WORK_ARRANGEMENTS.map((arrangement) => {
              const selected =
                selectedArrangement === arrangement;

              return (
                <Pressable
                  key={arrangement}
                  onPress={() =>
                    setSelectedArrangement(arrangement)
                  }
                  style={[
                    styles.optionButton,
                    selected &&
                      styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selected &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {arrangement}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>
            Salary
            <Text style={styles.optionalText}>
              {' '}
              (Optional)
            </Text>
          </Text>

          <TextInput
            value={salary}
            onChangeText={setSalary}
            placeholder="e.g. R12,000 - R15,000 per month"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.helperText}>
            Salary is currently displayed for recruitment
            information and is not stored by the current
            backend.
          </Text>

          {/* APPLICATION DEADLINE */}

          <Text style={styles.label}>
            Application Deadline
          </Text>

          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <View style={styles.datePickerLeft}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#6B7280"
              />

              <Text
                style={[
                  styles.datePickerText,
                  !deadline &&
                    styles.datePickerPlaceholder,
                ]}
              >
                {deadline
                  ? formatDateForDisplay(deadline)
                  : 'Select application deadline'}
              </Text>
            </View>

            <Ionicons
              name="chevron-down-outline"
              size={18}
              color="#6B7280"
            />
          </Pressable>

          {showDatePicker && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />

              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={() =>
                    setShowDatePicker(false)
                  }
                  style={styles.dateDoneButton}
                >
                  <Text style={styles.dateDoneButtonText}>
                    Done
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <Text style={styles.helperText}>
            Select the final date graduates can apply.
          </Text>

          <Text style={styles.label}>
            Number of Positions
          </Text>

          <TextInput
            value={positions}
            onChangeText={setPositions}
            placeholder="1"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Minimum Qualification
          </Text>

          <TextInput
            value={qualification}
            onChangeText={setQualification}
            placeholder="e.g. Diploma or Degree in Information Technology"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* AI CANDIDATE MATCHING */}

        <View style={styles.aiCard}>
          <View style={styles.aiIconContainer}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color="#111827"
            />
          </View>

          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>
              AI Candidate Matching
            </Text>

            <Text style={styles.aiText}>
              CareerForgeAI will analyse candidate
              qualifications, skills and experience to
              identify strong matches for your opportunity.
            </Text>
          </View>
        </View>

        {/* ACTIONS */}

        <Pressable
          onPress={handlePostOpportunity}
          disabled={isSubmitting}
          style={[
            styles.postButton,
            isSubmitting &&
              styles.postButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.postButtonText}>
                Posting...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="paper-plane-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.postButtonText}>
                Post Opportunity
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={isSubmitting}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#6B7280',
    marginBottom: 6,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
  },

  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },

  optionalText: {
    fontWeight: '400',
    color: '#9CA3AF',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },

  textArea: {
    height: 125,
    paddingTop: 14,
    paddingBottom: 14,
  },

  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: -9,
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 10,
  },

  optionButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  optionButtonTextSelected: {
    color: '#FFFFFF',
  },

  /*
  |--------------------------------------------------------------------------
  | SKILLS
  |--------------------------------------------------------------------------
  */

  skillSearchContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  skillSearchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: '#111827',
  },

  selectedSkillsContainer: {
    marginBottom: 12,
  },

  selectedSkillsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  selectedSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    gap: 5,
  },

  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  skillsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
    maxHeight: 260,
  },

  skillRow: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skillRowSelected: {
    backgroundColor: '#F9FAFB',
  },

  skillRowText: {
    flex: 1,
    paddingRight: 12,
  },

  skillName: {
    fontSize: 14,
    color: '#374151',
  },

  skillNameSelected: {
    fontWeight: '700',
    color: '#111827',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  loadingContainer: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  loadingText: {
    fontSize: 13,
    color: '#6B7280',
  },

  emptySkills: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  emptySkillsText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  /*
  |--------------------------------------------------------------------------
  | DATE PICKER
  |--------------------------------------------------------------------------
  */

  datePickerButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  datePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  datePickerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#111827',
  },

  datePickerPlaceholder: {
    color: '#9CA3AF',
  },

  datePickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },

  dateDoneButton: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
  },

  dateDoneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  /*
  |--------------------------------------------------------------------------
  | AI CARD
  |--------------------------------------------------------------------------
  */

  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  aiIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  aiTextContainer: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 5,
  },

  aiText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  postButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 11,
  },

  postButtonDisabled: {
    opacity: 0.65,
  },

  postButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cancelButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  bottomSpace: {
    height: 20,
  },
});