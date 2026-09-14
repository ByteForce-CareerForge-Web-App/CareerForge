// @ts-nocheck


import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPERIENCE_STORAGE_KEY = 'careerforge_experience';

const STORAGE_KEYS = {
  internship: 'careerforge_internships',
  projects: 'careerforge_projects',
  work: 'careerforge_work',
  volunteering: 'careerforge_volunteering',
  certifications: 'careerforge_certifications',
  extracurricular: 'careerforge_extracurricular',
};

type ExperienceRecord = {
  id: string;
  [key: string]: string;
};

type FormField = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
};

const experienceTypes = [
  {
    id: 'internship',
    icon: 'briefcase-outline',
    title: 'Internships',
    description:
      'Gain workplace experience through internships and graduate programmes.',
  },
  {
    id: 'projects',
    icon: 'rocket-outline',
    title: 'Projects',
    description:
      'Build practical projects that demonstrate your technical and problem-solving abilities.',
  },
  {
    id: 'volunteering',
    icon: 'people-outline',
    title: 'Volunteering',
    description:
      'Develop valuable skills while contributing to your community.',
  },
  {
    id: 'work',
    icon: 'business-outline',
    title: 'Work Experience',
    description:
      'Add part-time, full-time, freelance, or other relevant work experience.',
  },
  {
    id: 'certifications',
    icon: 'ribbon-outline',
    title: 'Certifications',
    description:
      'Earn recognised certifications that strengthen your professional profile.',
  },
  {
    id: 'extracurricular',
    icon: 'star-outline',
    title: 'Extracurricular Activities',
    description:
      'Showcase leadership, societies, sports, competitions, and other activities.',
  },
];

const formFields: Record<string, FormField[]> = {
  internship: [
    {
      key: 'company',
      label: 'Company / Organisation',
      placeholder: 'e.g. ABC Technologies',
      required: true,
    },
    {
      key: 'position',
      label: 'Position / Role',
      placeholder: 'e.g. Software Developer Intern',
      required: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      placeholder: 'e.g. January 2026',
      required: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      placeholder: 'e.g. June 2026 / Present',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      placeholder:
        'Describe what you did during the internship...',
      multiline: true,
      required: true,
    },
    {
      key: 'skills',
      label: 'Skills Used',
      placeholder: 'e.g. PHP, MySQL, React Native',
      multiline: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder:
        'e.g. Built an API used by 50 users',
      multiline: true,
    },
  ],

  projects: [
    {
      key: 'name',
      label: 'Project Name',
      placeholder: 'e.g. CareerForge Mobile App',
      required: true,
    },
    {
      key: 'role',
      label: 'Your Role',
      placeholder: 'e.g. Frontend Developer',
      required: true,
    },
    {
      key: 'date',
      label: 'Date / Year',
      placeholder: 'e.g. 2026',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      placeholder: 'Describe your project...',
      multiline: true,
      required: true,
    },
    {
      key: 'technologies',
      label: 'Technologies / Skills',
      placeholder: 'e.g. React Native, TypeScript, PHP',
      multiline: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder:
        'e.g. Successfully developed a mobile application',
      multiline: true,
    },
    {
      key: 'link',
      label: 'GitHub / Portfolio Link',
      placeholder: 'https://github.com/...',
    },
  ],

  work: [
    {
      key: 'company',
      label: 'Company / Organisation',
      placeholder: 'e.g. ABC Company',
      required: true,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      placeholder: 'e.g. Junior Developer',
      required: true,
    },
    {
      key: 'employmentType',
      label: 'Employment Type',
      placeholder: 'e.g. Part-time, Full-time, Freelance',
      required: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      placeholder: 'e.g. January 2025',
      required: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      placeholder: 'e.g. December 2025 / Present',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      placeholder: 'Describe your responsibilities...',
      multiline: true,
      required: true,
    },
    {
      key: 'skills',
      label: 'Skills Used',
      placeholder: 'e.g. Customer service, Excel, PHP',
      multiline: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder: 'e.g. Improved a process...',
      multiline: true,
    },
  ],

  volunteering: [
    {
      key: 'organisation',
      label: 'Organisation',
      placeholder: 'e.g. Community Youth Centre',
      required: true,
    },
    {
      key: 'role',
      label: 'Role',
      placeholder: 'e.g. Volunteer Coordinator',
      required: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      placeholder: 'e.g. January 2026',
      required: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      placeholder: 'e.g. March 2026 / Present',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      placeholder:
        'Describe what you did as a volunteer...',
      multiline: true,
      required: true,
    },
    {
      key: 'skills',
      label: 'Skills Developed',
      placeholder:
        'e.g. Leadership, communication, teamwork',
      multiline: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder:
        'e.g. Organised a community event...',
      multiline: true,
    },
  ],

  certifications: [
    {
      key: 'name',
      label: 'Certification Name',
      placeholder: 'e.g. Google AI Essentials',
      required: true,
    },
    {
      key: 'issuer',
      label: 'Issuing Organisation',
      placeholder: 'e.g. Google',
      required: true,
    },
    {
      key: 'dateObtained',
      label: 'Date Obtained',
      placeholder: 'e.g. August 2026',
      required: true,
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      placeholder: 'e.g. August 2029 / No Expiry',
    },
    {
      key: 'description',
      label: 'Description',
      placeholder:
        'Briefly describe what the certification covers...',
      multiline: true,
    },
    {
      key: 'credentialLink',
      label: 'Credential / Verification Link',
      placeholder: 'https://...',
    },
  ],

  extracurricular: [
    {
      key: 'activity',
      label: 'Activity',
      placeholder: 'e.g. Coding Society',
      required: true,
    },
    {
      key: 'organisation',
      label: 'Organisation / Team / Society',
      placeholder: 'e.g. Richfield Coding Society',
      required: true,
    },
    {
      key: 'role',
      label: 'Your Role',
      placeholder: 'e.g. Member / Team Leader',
      required: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      placeholder: 'e.g. February 2026',
      required: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      placeholder: 'e.g. Present',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      placeholder:
        'Describe your involvement...',
      multiline: true,
      required: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder:
        'e.g. Participated in a hackathon...',
      multiline: true,
    },
  ],
};

const emptyRecords = (): Record<string, ExperienceRecord[]> => ({
  internship: [],
  projects: [],
  work: [],
  volunteering: [],
  certifications: [],
  extracurricular: [],
});

export default function ExperienceScreen() {
  const [selectedExperience, setSelectedExperience] =
    useState<string[]>([]);

  const [records, setRecords] =
    useState<Record<string, ExperienceRecord[]>>(
      emptyRecords()
    );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeForm, setActiveForm] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formData, setFormData] =
    useState<Record<string, string>>({});

  // ------------------------------------------------------------
  // LOAD EXPERIENCE
  // ------------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadExperience = async () => {
        try {
          const savedExperience =
            await AsyncStorage.getItem(
              EXPERIENCE_STORAGE_KEY
            );

          if (
            savedExperience &&
            isActive
          ) {
            try {
              const parsedExperience =
                JSON.parse(savedExperience);

              if (Array.isArray(parsedExperience)) {
                setSelectedExperience(
                  parsedExperience
                );
              }
            } catch (error) {
              console.log(
                'Error parsing experience categories:',
                error
              );
            }
          }

          const loadedRecords = emptyRecords();

          for (const type of Object.keys(
            STORAGE_KEYS
          )) {
            const storageKey =
              STORAGE_KEYS[
                type as keyof typeof STORAGE_KEYS
              ];

            const savedRecords =
              await AsyncStorage.getItem(
                storageKey
              );

            if (savedRecords) {
              try {
                const parsedRecords =
                  JSON.parse(savedRecords);

                if (Array.isArray(parsedRecords)) {
                  loadedRecords[type] =
                    parsedRecords;
                }
              } catch (error) {
                console.log(
                  `Error parsing ${type}:`,
                  error
                );
              }
            }
          }

          if (isActive) {
            setRecords(loadedRecords);
          }
        } catch (error) {
          console.log(
            'Error loading experience:',
            error
          );
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadExperience();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // ------------------------------------------------------------
  // SELECT / DESELECT EXPERIENCE
  // ------------------------------------------------------------

  const toggleExperience = (
    experienceId: string
  ) => {
    setSelectedExperience((current) => {
      const alreadySelected =
        current.includes(experienceId);

      if (alreadySelected) {
        if (activeForm === experienceId) {
          setActiveForm(null);
          setEditingId(null);
          setFormData({});
        }

        return current.filter(
          (id) => id !== experienceId
        );
      }

      // Automatically open the form
      // underneath the selected experience.
      setEditingId(null);
      setFormData({});
      setActiveForm(experienceId);

      return [...current, experienceId];
    });
  };

  // ------------------------------------------------------------
  // OPEN ADD FORM
  // ------------------------------------------------------------

  const openAddForm = (type: string) => {
    setEditingId(null);
    setFormData({});
    setActiveForm(type);
  };

  // ------------------------------------------------------------
  // EDIT RECORD
  // ------------------------------------------------------------

  const openEditForm = (
    type: string,
    record: ExperienceRecord
  ) => {
    const data = { ...record };

    delete data.id;

    setEditingId(record.id);
    setFormData(data);
    setActiveForm(type);
  };

  // ------------------------------------------------------------
  // CLOSE FORM
  // ------------------------------------------------------------

  const closeForm = () => {
    setActiveForm(null);
    setEditingId(null);
    setFormData({});
  };

  // ------------------------------------------------------------
  // UPDATE FIELD
  // ------------------------------------------------------------

  const updateField = (
    key: string,
    value: string
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ------------------------------------------------------------
  // SAVE RECORD
  // ------------------------------------------------------------

  const saveRecord = async (
    type: string
  ) => {
    const fields = formFields[type];

    if (!fields) {
      return;
    }

    const missingRequired =
      fields.some(
        (field) =>
          field.required &&
          !formData[field.key]?.trim()
      );

    if (missingRequired) {
      Alert.alert(
        'Missing Information',
        'Please complete all required fields.'
      );
      return;
    }

    try {
      const currentRecords =
        records[type] || [];

      let updatedRecords:
        ExperienceRecord[];

      if (editingId) {
        updatedRecords =
          currentRecords.map(
            (record) =>
              record.id === editingId
                ? {
                    ...record,
                    ...formData,
                  }
                : record
          );
      } else {
        const newRecord: ExperienceRecord = {
          id: Date.now().toString(),
          ...formData,
        };

        updatedRecords = [
          ...currentRecords,
          newRecord,
        ];
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS[
          type as keyof typeof STORAGE_KEYS
        ],
        JSON.stringify(updatedRecords)
      );

      setRecords((current) => ({
        ...current,
        [type]: updatedRecords,
      }));

      setEditingId(null);
      setFormData({});

      // Keep this experience section open
      // after saving so the user can see the
      // record they just added.
      setActiveForm(type);

      Alert.alert(
        editingId
          ? 'Experience Updated'
          : 'Experience Added',
        editingId
          ? 'Your experience has been updated successfully.'
          : 'Your experience has been added successfully.'
      );
    } catch (error) {
      console.log(
        'Error saving record:',
        error
      );

      Alert.alert(
        'Save Error',
        'Something went wrong while saving this experience.'
      );
    }
  };

  // ------------------------------------------------------------
  // DELETE RECORD
  // ------------------------------------------------------------

  const deleteRecord = (
    type: string,
    id: string
  ) => {
    Alert.alert(
      'Delete Experience',
      'Are you sure you want to delete this experience?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRecords =
                (records[type] || []).filter(
                  (record) =>
                    record.id !== id
                );

              await AsyncStorage.setItem(
                STORAGE_KEYS[
                  type as keyof typeof STORAGE_KEYS
                ],
                JSON.stringify(
                  updatedRecords
                )
              );

              setRecords((current) => ({
                ...current,
                [type]: updatedRecords,
              }));
            } catch (error) {
              console.log(
                'Error deleting record:',
                error
              );

              Alert.alert(
                'Delete Error',
                'Something went wrong while deleting this experience.'
              );
            }
          },
        },
      ]
    );
  };

  // ------------------------------------------------------------
  // SAVE EXPERIENCE CATEGORIES
  // ------------------------------------------------------------

  const saveExperience = async () => {
    if (
      selectedExperience.length === 0
    ) {
      Alert.alert(
        'No Experience Selected',
        'Please select at least one experience type.'
      );
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      await AsyncStorage.setItem(
        EXPERIENCE_STORAGE_KEY,
        JSON.stringify(
          selectedExperience
        )
      );

      setSaving(false);

      Alert.alert(
        'Experience Saved',
        'Your experience profile has been updated.',
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
        'Error saving experience:',
        error
      );

      setSaving(false);

      Alert.alert(
        'Save Error',
        'Something went wrong while saving your experience.'
      );
    }
  };

  // ------------------------------------------------------------
  // DISPLAY HELPERS
  // ------------------------------------------------------------

  const getRecordTitle = (
    type: string,
    record: ExperienceRecord
  ) => {
    switch (type) {
      case 'internship':
        return (
          record.position ||
          'Internship'
        );

      case 'projects':
        return (
          record.name ||
          'Project'
        );

      case 'work':
        return (
          record.jobTitle ||
          'Work Experience'
        );

      case 'volunteering':
        return (
          record.role ||
          'Volunteer Role'
        );

      case 'certifications':
        return (
          record.name ||
          'Certification'
        );

      case 'extracurricular':
        return (
          record.activity ||
          'Activity'
        );

      default:
        return 'Experience';
    }
  };

  const getRecordSubtitle = (
    type: string,
    record: ExperienceRecord
  ) => {
    switch (type) {
      case 'internship':
        return record.company || '';

      case 'projects':
        return record.role || '';

      case 'work':
        return record.company || '';

      case 'volunteering':
        return (
          record.organisation || ''
        );

      case 'certifications':
        return record.issuer || '';

      case 'extracurricular':
        return (
          record.organisation || ''
        );

      default:
        return '';
    }
  };

  const getRecordDates = (
    type: string,
    record: ExperienceRecord
  ) => {
    if (
      type === 'certifications'
    ) {
      return (
        record.dateObtained || ''
      );
    }

    if (
      record.startDate ||
      record.endDate
    ) {
      return `${record.startDate || ''} - ${
        record.endDate || ''
      }`;
    }

    if (type === 'projects') {
      return record.date || '';
    }

    return '';
  };

  const getTypeTitle = (
    type: string
  ) => {
    const found =
      experienceTypes.find(
        (item) =>
          item.id === type
      );

    return (
      found?.title ||
      'Experience'
    );
  };

  const getTypeIcon = (
    type: string
  ) => {
    const found =
      experienceTypes.find(
        (item) =>
          item.id === type
      );

    return (
      found?.icon ||
      'briefcase-outline'
    );
  };

  const getProgressPercentage =
    () => {
      const selectedCount =
        selectedExperience.length;

      const recordsCount =
        Object.values(records).reduce(
          (total, list) =>
            total + list.length,
          0
        );

      if (selectedCount === 0) {
        return 45;
      }

      return Math.min(
        45 +
          selectedCount * 7 +
          Math.min(recordsCount * 3, 18),
        93
      );
    };

  const progressPercentage =
    getProgressPercentage();

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <Ionicons
          name="briefcase-outline"
          size={34}
          color="#2457E6"
        />

        <Text
          style={styles.loadingText}
        >
          Loading experience...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
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
            style={styles.iconContainer}
          >
            <Ionicons
              name="briefcase-outline"
              size={28}
              color="#2457E6"
            />
          </View>

          <Text
            style={styles.title}
          >
            Gain Experience
          </Text>

          <Text
            style={styles.subtitle}
          >
            Build practical experience
            that helps you become more
            confident and career-ready.
          </Text>
        </View>

        {/* Progress Card */}

        <View
          style={styles.progressCard}
        >
          <View
            style={
              styles.progressHeader
            }
          >
            <View
              style={
                styles.progressTextContainer
              }
            >
              <Text
                style={
                  styles.progressLabel
                }
              >
                EXPERIENCE PROGRESS
              </Text>

              <Text
                style={
                  styles.progressTitle
                }
              >
                Build your experience
                profile
              </Text>
            </View>

            <View
              style={
                styles.progressCircle
              }
            >
              <Text
                style={
                  styles.progressNumber
                }
              >
                {progressPercentage}
              </Text>

              <Text
                style={
                  styles.progressPercent
                }
              >
                %
              </Text>
            </View>
          </View>

          <View
            style={
              styles.progressBackground
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.progressDescription
            }
          >
            The more relevant experience
            you build, the stronger your
            employability profile becomes.
          </Text>
        </View>

        {/* Information Card */}

        <View
          style={styles.infoCard}
        >
          <View
            style={styles.infoIconContainer}
          >
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#2457E6"
            />
          </View>

          <View
            style={styles.infoContent}
          >
            <Text
              style={styles.infoTitle}
            >
              Experience isn't only
              employment
            </Text>

            <Text
              style={styles.infoText}
            >
              Projects, volunteering,
              certifications, competitions,
              and extracurricular activities
              can all demonstrate valuable
              skills to employers.
            </Text>
          </View>
        </View>

        {/* Section Header */}

        <View
          style={styles.selectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Build Your Experience
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Select the experience you
              have and add your details.
            </Text>
          </View>

          <View
            style={
              styles.selectedBadge
            }
          >
            <Text
              style={
                styles.selectedBadgeText
              }
            >
              {selectedExperience.length}
            </Text>
          </View>
        </View>

        {/* Experience Cards */}

        <View
          style={
            styles.experienceContainer
          }
        >
          {experienceTypes.map(
            (experience) => {
              const isSelected =
                selectedExperience.includes(
                  experience.id
                );

              const isFormOpen =
                activeForm ===
                experience.id;

              const typeRecords =
                records[
                  experience.id
                ] || [];

              return (
                <View
                  key={experience.id}
                  style={
                    styles.experienceWrapper
                  }
                >
                  {/* Main Experience Card */}

                  <Pressable
                    style={[
                      styles.experienceCard,
                      isSelected &&
                        styles.experienceCardSelected,
                    ]}
                    onPress={() =>
                      toggleExperience(
                        experience.id
                      )
                    }
                  >
                    <View
                      style={[
                        styles.experienceIconContainer,
                        isSelected &&
                          styles.experienceIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          experience.icon as any
                        }
                        size={23}
                        color={
                          isSelected
                            ? '#FFFFFF'
                            : '#2457E6'
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.experienceContent
                      }
                    >
                      <Text
                        style={[
                          styles.experienceTitle,
                          isSelected &&
                            styles.experienceTitleSelected,
                        ]}
                      >
                        {
                          experience.title
                        }
                      </Text>

                      <Text
                        style={
                          styles.experienceDescription
                        }
                      >
                        {
                          experience.description
                        }
                      </Text>

                      {typeRecords.length >
                        0 && (
                        <View
                          style={
                            styles.recordCountRow
                          }
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#16A34A"
                          />

                          <Text
                            style={
                              styles.recordCountText
                            }
                          >
                            {
                              typeRecords.length
                            }{' '}
                            {typeRecords.length ===
                            1
                              ? 'record'
                              : 'records'}{' '}
                            added
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        isSelected &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {isSelected ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Ionicons
                          name="add"
                          size={17}
                          color="#64748B"
                        />
                      )}
                    </View>
                  </Pressable>

                  {/* Expanded Content */}

                  {isSelected && (
                    <View
                      style={
                        styles.expandedSection
                      }
                    >
                      {/* Existing Records */}

                      {typeRecords.length >
                        0 && (
                        <View
                          style={
                            styles.savedRecordsSection
                          }
                        >
                          <View
                            style={
                              styles.savedRecordsHeader
                            }
                          >
                            <View>
                              <Text
                                style={
                                  styles.savedRecordsTitle
                                }
                              >
                                Your{' '}
                                {
                                  experience.title
                                }
                              </Text>

                              <Text
                                style={
                                  styles.savedRecordsSubtitle
                                }
                              >
                                Saved experience
                              </Text>
                            </View>

                            <View
                              style={
                                styles.countPill
                              }
                            >
                              <Text
                                style={
                                  styles.countPillText
                                }
                              >
                                {
                                  typeRecords.length
                                }
                              </Text>
                            </View>
                          </View>

                          {typeRecords.map(
                            (record) => (
                              <View
                                key={
                                  record.id
                                }
                                style={
                                  styles.recordCard
                                }
                              >
                                <View
                                  style={
                                    styles.recordTopRow
                                  }
                                >
                                  <View
                                    style={
                                      styles.recordIconBox
                                    }
                                  >
                                    <Ionicons
                                      name={
                                        experience.icon as any
                                      }
                                      size={
                                        18
                                      }
                                      color="#2457E6"
                                    />
                                  </View>

                                  <View
                                    style={
                                      styles.recordMain
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordTitle
                                      }
                                    >
                                      {
                                        getRecordTitle(
                                          experience.id,
                                          record
                                        )
                                      }
                                    </Text>

                                    {getRecordSubtitle(
                                      experience.id,
                                      record
                                    ) ? (
                                      <Text
                                        style={
                                          styles.recordSubtitle
                                        }
                                      >
                                        {
                                          getRecordSubtitle(
                                            experience.id,
                                            record
                                          )
                                        }
                                      </Text>
                                    ) : null}

                                    {getRecordDates(
                                      experience.id,
                                      record
                                    ) ? (
                                      <Text
                                        style={
                                          styles.recordDates
                                        }
                                      >
                                        <Ionicons
                                          name="calendar-outline"
                                          size={
                                            12
                                          }
                                          color="#64748B"
                                        />{' '}
                                        {
                                          getRecordDates(
                                            experience.id,
                                            record
                                          )
                                        }
                                      </Text>
                                    ) : null}
                                  </View>
                                </View>

                                {record.description ? (
                                  <Text
                                    style={
                                      styles.recordDescription
                                    }
                                  >
                                    {
                                      record.description
                                    }
                                  </Text>
                                ) : null}

                                {record.technologies ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Technologies
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.technologies
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.skills ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Skills
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.skills
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.achievements ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Achievements
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.achievements
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.employmentType ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Employment
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.employmentType
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.expiryDate ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Expiry
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.expiryDate
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.credentialLink ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Credential
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.credentialLink
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                {record.link ? (
                                  <View
                                    style={
                                      styles.recordDetailRow
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.recordDetailLabel
                                      }
                                    >
                                      Link
                                    </Text>

                                    <Text
                                      style={
                                        styles.recordDetailText
                                      }
                                    >
                                      {
                                        record.link
                                      }
                                    </Text>
                                  </View>
                                ) : null}

                                <View
                                  style={
                                    styles.recordActions
                                  }
                                >
                                  <Pressable
                                    style={
                                      styles.editButton
                                    }
                                    onPress={() =>
                                      openEditForm(
                                        experience.id,
                                        record
                                      )
                                    }
                                  >
                                    <Ionicons
                                      name="create-outline"
                                      size={15}
                                      color="#2457E6"
                                    />

                                    <Text
                                      style={
                                        styles.editButtonText
                                      }
                                    >
                                      Edit
                                    </Text>
                                  </Pressable>

                                  <Pressable
                                    style={
                                      styles.deleteButton
                                    }
                                    onPress={() =>
                                      deleteRecord(
                                        experience.id,
                                        record.id
                                      )
                                    }
                                  >
                                    <Ionicons
                                      name="trash-outline"
                                      size={15}
                                      color="#DC2626"
                                    />

                                    <Text
                                      style={
                                        styles.deleteButtonText
                                      }
                                    >
                                      Delete
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            )
                          )}
                        </View>
                      )}

                      {/* Add Another Button */}

                      {!isFormOpen && (
                        <Pressable
                          style={
                            styles.addExperienceButton
                          }
                          onPress={() =>
                            openAddForm(
                              experience.id
                            )
                          }
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={19}
                            color="#2457E6"
                          />

                          <Text
                            style={
                              styles.addExperienceButtonText
                            }
                          >
                            {typeRecords.length >
                            0
                              ? `Add Another ${experience.title.replace(
                                  's',
                                  ''
                                )}`
                              : `Add ${experience.title.replace(
                                  's',
                                  ''
                                )}`}
                          </Text>
                        </Pressable>
                      )}

                      {/* Add / Edit Form */}

                      {isFormOpen && (
                        <View
                          style={
                            styles.formCard
                          }
                        >
                          <View
                            style={
                              styles.formHeader
                            }
                          >
                            <View
                              style={
                                styles.formHeaderIcon
                              }
                            >
                              <Ionicons
                                name={
                                  experience.icon as any
                                }
                                size={19}
                                color="#2457E6"
                              />
                            </View>

                            <View
                              style={
                                styles.formHeaderText
                              }
                            >
                              <Text
                                style={
                                  styles.formTitle
                                }
                              >
                                {editingId
                                  ? `Edit ${experience.title}`
                                  : `Add ${experience.title}`}
                              </Text>

                              <Text
                                style={
                                  styles.formSubtitle
                                }
                              >
                                Tell us about this
                                experience.
                              </Text>
                            </View>

                            <Pressable
                              style={
                                styles.closeFormButton
                              }
                              onPress={
                                closeForm
                              }
                            >
                              <Ionicons
                                name="close"
                                size={20}
                                color="#64748B"
                              />
                            </Pressable>
                          </View>

                          {formFields[
                            experience.id
                          ].map(
                            (field) => (
                              <View
                                key={
                                  field.key
                                }
                                style={
                                  styles.inputGroup
                                }
                              >
                                <Text
                                  style={
                                    styles.inputLabel
                                  }
                                >
                                  {
                                    field.label
                                  }

                                  {field.required && (
                                    <Text
                                      style={
                                        styles.requiredStar
                                      }
                                    >
                                      {' '}
                                      *
                                    </Text>
                                  )}
                                </Text>

                                <TextInput
                                  style={[
                                    styles.input,
                                    field.multiline &&
                                      styles.multilineInput,
                                  ]}
                                  placeholder={
                                    field.placeholder
                                  }
                                  placeholderTextColor="#94A3B8"
                                  value={
                                    formData[
                                      field.key
                                    ] ||
                                    ''
                                  }
                                  onChangeText={(
                                    value
                                  ) =>
                                    updateField(
                                      field.key,
                                      value
                                    )
                                  }
                                  multiline={
                                    field.multiline ||
                                    false
                                  }
                                  textAlignVertical={
                                    field.multiline
                                      ? 'top'
                                      : 'center'
                                  }
                                  returnKeyType={
                                    field.multiline
                                      ? 'default'
                                      : 'next'
                                  }
                                />
                              </View>
                            )
                          )}

                          <View
                            style={
                              styles.formButtonRow
                            }
                          >
                            <Pressable
                              style={
                                styles.cancelFormButton
                              }
                              onPress={
                                closeForm
                              }
                            >
                              <Text
                                style={
                                  styles.cancelFormButtonText
                                }
                              >
                                Cancel
                              </Text>
                            </Pressable>

                            <Pressable
                              style={
                                styles.saveRecordButton
                              }
                              onPress={() =>
                                saveRecord(
                                  experience.id
                                )
                              }
                            >
                              <Ionicons
                                name={
                                  editingId
                                    ? 'checkmark-circle-outline'
                                    : 'save-outline'
                                }
                                size={17}
                                color="#FFFFFF"
                              />

                              <Text
                                style={
                                  styles.saveRecordButtonText
                                }
                              >
                                {editingId
                                  ? 'Update'
                                  : 'Save'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            }
          )}
        </View>

        {/* Experience Tip */}

        <View
          style={styles.tipCard}
        >
          <View
            style={styles.tipIconContainer}
          >
            <Ionicons
              name="sparkles-outline"
              size={21}
              color="#2457E6"
            />
          </View>

          <View
            style={styles.tipContent}
          >
            <Text
              style={styles.tipTitle}
            >
              Experience Tip
            </Text>

            <Text
              style={styles.tipText}
            >
              Don't wait until you have a
              full-time job to build
              experience. A personal project
              or volunteer role can help you
              demonstrate real-world skills.
            </Text>
          </View>
        </View>

        {/* Save Button */}

        <Pressable
          style={[
            styles.saveButton,
            selectedExperience.length ===
              0 &&
              styles.saveButtonDisabled,
            saving &&
              styles.saveButtonDisabled,
          ]}
          disabled={
            selectedExperience.length ===
              0 || saving
          }
          onPress={
            saveExperience
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.saveButtonText
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Experience'}
          </Text>
        </Pressable>

        {/* Footer */}

        <Text
          style={styles.footerText}
        >
          You can continue adding
          experience as you develop
          throughout your career journey.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  container: {
    padding: 20,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 15,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 22,
  },

  backText: {
    fontSize: 15,
    color: '#2457E6',
    fontWeight: '700',
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
    fontWeight: '800',
    color: '#102A72',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
  },

  progressCard: {
    backgroundColor: '#2457E6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  progressTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  progressLabel: {
    color: '#DCE7FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },

  progressCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  progressPercent: {
    color: '#DCE7FF',
    fontSize: 10,
    marginTop: -2,
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#4B76EA',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  progressDescription: {
    color: '#E8F0FF',
    fontSize: 12,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#E8F0FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#D5E2FF',
  },

  infoIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173FBD',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#3158A9',
  },

  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#102A72',
    marginBottom: 4,
  },

  sectionDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  selectedBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedBadgeText: {
    color: '#2457E6',
    fontSize: 13,
    fontWeight: '800',
  },

  experienceContainer: {
    marginBottom: 8,
  },

  experienceWrapper: {
    marginBottom: 12,
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  experienceCardSelected: {
    borderColor: '#2457E6',
    borderWidth: 2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#F8FAFF',
  },

  experienceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  experienceIconContainerSelected: {
    backgroundColor: '#2457E6',
  },

  experienceContent: {
    flex: 1,
    paddingRight: 8,
  },

  experienceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#102A72',
    marginBottom: 4,
  },

  experienceTitleSelected: {
    color: '#173FBD',
  },

  experienceDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },

  recordCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 5,
  },

  recordCountText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
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

  /* Expanded Experience */

  expandedSection: {
    backgroundColor: '#F8FAFF',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#2457E6',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    padding: 15,
  },

  savedRecordsSection: {
    marginBottom: 12,
  },

  savedRecordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  savedRecordsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#102A72',
  },

  savedRecordsSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  countPill: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
  },

  countPillText: {
    color: '#2457E6',
    fontSize: 11,
    fontWeight: '800',
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recordIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  recordMain: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#102A72',
    marginBottom: 3,
  },

  recordSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2457E6',
    marginBottom: 3,
  },

  recordDates: {
    fontSize: 11,
    color: '#64748B',
  },

  recordDescription: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 10,
  },

  recordDetailRow: {
    marginTop: 8,
  },

  recordDetailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },

  recordDetailText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  recordActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },

  editButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  editButtonText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  deleteButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  deleteButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },

  addExperienceButton: {
    height: 44,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFD1FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 2,
  },

  addExperienceButtonText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Form */

  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E2F7',
    borderRadius: 14,
    padding: 15,
    marginTop: 2,
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  formHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  formHeaderText: {
    flex: 1,
  },

  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#102A72',
  },

  formSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  closeFormButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputGroup: {
    marginTop: 12,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },

  requiredStar: {
    color: '#DC2626',
  },

  input: {
    minHeight: 45,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#102A72',
  },

  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },

  formButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },

  cancelFormButton: {
    flex: 1,
    height: 45,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelFormButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },

  saveRecordButton: {
    flex: 1.4,
    height: 45,
    borderRadius: 11,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  saveRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Tip */

  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  tipIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#102A72',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  /* Main Save */

  saveButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
});
