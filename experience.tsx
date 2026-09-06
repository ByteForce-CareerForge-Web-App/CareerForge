import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
    icon: '💼',
    title: 'Internships',
    description:
      'Gain workplace experience through internships and graduate programmes.',
  },
  {
    id: 'projects',
    icon: '🚀',
    title: 'Projects',
    description:
      'Build practical projects that demonstrate your technical and problem-solving abilities.',
  },
  {
    id: 'volunteering',
    icon: '🤝',
    title: 'Volunteering',
    description:
      'Develop valuable skills while contributing to your community.',
  },
  {
    id: 'work',
    icon: '🏢',
    title: 'Work Experience',
    description:
      'Add part-time, full-time, freelance, or other relevant work experience.',
  },
  {
    id: 'certifications',
    icon: '🏆',
    title: 'Certifications',
    description:
      'Earn recognised certifications that strengthen your professional profile.',
  },
  {
    id: 'extracurricular',
    icon: '⭐',
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
      placeholder: 'e.g. June 2026',
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
      placeholder: 'e.g. Backend Developer',
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
      placeholder: 'e.g. React Native, PHP, MySQL',
      multiline: true,
    },
    {
      key: 'achievements',
      label: 'Achievements',
      placeholder:
        'e.g. Successfully connected mobile app to API',
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
      placeholder: 'e.g. March 2026',
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

export default function ExperienceScreen() {
  const [selectedExperience, setSelectedExperience] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [records, setRecords] = useState<
    Record<string, ExperienceRecord[]>
  >({
    internship: [],
    projects: [],
    work: [],
    volunteering: [],
    certifications: [],
    extracurricular: [],
  });

  const [activeForm, setActiveForm] = useState<string | null>(
    null
  );

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<
    Record<string, string>
  >({});

  // ------------------------------------------------------------
  // LOAD EVERYTHING
  // ------------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadExperience = async () => {
        try {
          console.log('Loading saved experience...');

          const savedExperience =
            await AsyncStorage.getItem(
              EXPERIENCE_STORAGE_KEY
            );

          console.log(
            'Saved Experience:',
            savedExperience
          );

          if (!isActive) {
            return;
          }

          if (savedExperience) {
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

          const loadedRecords: Record<
            string,
            ExperienceRecord[]
          > = {
            internship: [],
            projects: [],
            work: [],
            volunteering: [],
            certifications: [],
            extracurricular: [],
          };

          for (const type of Object.keys(
            STORAGE_KEYS
          )) {
            const savedRecords =
              await AsyncStorage.getItem(
                STORAGE_KEYS[
                  type as keyof typeof STORAGE_KEYS
                ]
              );

            console.log(
              `Saved ${type}:`,
              savedRecords
            );

            if (savedRecords) {
              try {
                const parsedRecords =
                  JSON.parse(savedRecords);

                if (Array.isArray(parsedRecords)) {
                  loadedRecords[type] = parsedRecords;
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
  // SELECT / DESELECT EXPERIENCE TYPE
  // ------------------------------------------------------------

  const toggleExperience = (experienceId: string) => {
    setSelectedExperience((current) => {
      if (current.includes(experienceId)) {
        return current.filter(
          (id) => id !== experienceId
        );
      }

      return [...current, experienceId];
    });
  };

  // ------------------------------------------------------------
  // OPEN FORM
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
  // CANCEL FORM
  // ------------------------------------------------------------

  const cancelForm = () => {
    setActiveForm(null);
    setEditingId(null);
    setFormData({});
  };

  // ------------------------------------------------------------
  // UPDATE FORM FIELD
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

  const saveRecord = async (type: string) => {
    const fields = formFields[type];

    if (!fields) {
      return;
    }

    const missingRequired = fields.some(
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

      let updatedRecords: ExperienceRecord[];

      if (editingId) {
        updatedRecords = currentRecords.map(
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

      setActiveForm(null);
      setEditingId(null);
      setFormData({});

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
                  (record) => record.id !== id
                );

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
    if (selectedExperience.length === 0) {
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
        JSON.stringify(selectedExperience)
      );

      setSaving(false);

      Alert.alert(
        'Experience Saved',
        'Your experience profile has been updated.',
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
        return record.position || 'Internship';

      case 'projects':
        return record.name || 'Project';

      case 'work':
        return record.jobTitle || 'Work Experience';

      case 'volunteering':
        return record.role || 'Volunteer Role';

      case 'certifications':
        return record.name || 'Certification';

      case 'extracurricular':
        return record.activity || 'Activity';

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
        return record.organisation || '';

      case 'certifications':
        return record.issuer || '';

      case 'extracurricular':
        return record.organisation || '';

      default:
        return '';
    }
  };

  const getRecordDates = (
    type: string,
    record: ExperienceRecord
  ) => {
    if (type === 'certifications') {
      return record.dateObtained || '';
    }

    if (record.startDate || record.endDate) {
      return `${record.startDate || ''} - ${
        record.endDate || ''
      }`;
    }

    if (type === 'projects') {
      return record.date || '';
    }

    return '';
  };

  const getTypeTitle = (type: string) => {
    const found = experienceTypes.find(
      (item) => item.id === type
    );

    return found?.title || 'Experience';
  };

  const getTypeIcon = (type: string) => {
    const found = experienceTypes.find(
      (item) => item.id === type
    );

    return found?.icon || '💼';
  };

  const progressPercentage = Math.min(
    45 + selectedExperience.length * 8,
    93
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading experience...
        </Text>
      </View>
    );
  }

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
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💼</Text>
        </View>

        <Text style={styles.title}>
          Gain Experience
        </Text>

        <Text style={styles.subtitle}>
          Build practical experience that helps
          you become more confident and
          career-ready.
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>
              Experience Progress
            </Text>

            <Text style={styles.progressTitle}>
              Build your experience profile
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>
              {progressPercentage}
            </Text>

            <Text style={styles.progressPercent}>
              %
            </Text>
          </View>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressDescription}>
          The more relevant experience you build,
          the stronger your employability profile
          becomes.
        </Text>
      </View>

      {/* Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Experience Doesn't Only Mean Employment
          </Text>

          <Text style={styles.infoText}>
            Projects, volunteering, certifications,
            competitions, and extracurricular
            activities can all demonstrate valuable
            skills to employers.
          </Text>
        </View>
      </View>

      {/* Selection Header */}
      <View style={styles.selectionHeader}>
        <Text style={styles.sectionTitle}>
          Build Your Experience
        </Text>

        <Text style={styles.selectedText}>
          {selectedExperience.length} selected
        </Text>
      </View>

      {/* Experience Cards */}
      <View style={styles.experienceContainer}>
        {experienceTypes.map((experience) => {
          const isSelected =
            selectedExperience.includes(
              experience.id
            );

          return (
            <Pressable
              key={experience.id}
              style={[
                styles.experienceCard,
                isSelected &&
                  styles.experienceCardSelected,
              ]}
              onPress={() =>
                toggleExperience(experience.id)
              }
            >
              <View
                style={[
                  styles.experienceIconContainer,
                  isSelected &&
                    styles.experienceIconContainerSelected,
                ]}
              >
                <Text style={styles.experienceIcon}>
                  {experience.icon}
                </Text>
              </View>

              <View style={styles.experienceContent}>
                <Text
                  style={[
                    styles.experienceTitle,
                    isSelected &&
                      styles.experienceTitleSelected,
                  ]}
                >
                  {experience.title}
                </Text>

                <Text
                  style={styles.experienceDescription}
                >
                  {experience.description}
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
                  <Text style={styles.checkmark}>
                    ✓
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Structured Experience Sections */}
      {selectedExperience.map((type) => {
        const typeRecords =
          records[type] || [];

        return (
          <View
            key={type}
            style={styles.experienceSection}
          >
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  {getTypeIcon(type)}{' '}
                  {getTypeTitle(type)}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {typeRecords.length === 0
                    ? `Add your ${getTypeTitle(
                        type
                      ).toLowerCase()} details.`
                    : `${typeRecords.length} ${
                        typeRecords.length === 1
                          ? 'record'
                          : 'records'
                      } added`}
                </Text>
              </View>

              <Pressable
                style={styles.addButton}
                onPress={() =>
                  activeForm === type
                    ? cancelForm()
                    : openAddForm(type)
                }
              >
                <Text style={styles.addButtonText}>
                  {activeForm === type
                    ? 'Cancel'
                    : '+ Add'}
                </Text>
              </Pressable>
            </View>

            {/* Saved Records */}
            {typeRecords.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>
                  {getTypeIcon(type)}
                </Text>

                <Text style={styles.emptyTitle}>
                  No {getTypeTitle(type).toLowerCase()}{' '}
                  added yet
                </Text>

                <Text style={styles.emptyText}>
                  Add your details so CareerForge can
                  better understand your experience.
                </Text>
              </View>
            ) : (
              typeRecords.map((record) => (
                <View
                  key={record.id}
                  style={styles.recordCard}
                >
                  <View style={styles.recordTopRow}>
                    <View style={styles.recordMain}>
                      <Text style={styles.recordTitle}>
                        {getRecordTitle(
                          type,
                          record
                        )}
                      </Text>

                      {getRecordSubtitle(
                        type,
                        record
                      ) ? (
                        <Text
                          style={styles.recordSubtitle}
                        >
                          {getRecordSubtitle(
                            type,
                            record
                          )}
                        </Text>
                      ) : null}

                      {getRecordDates(
                        type,
                        record
                      ) ? (
                        <Text
                          style={styles.recordDates}
                        >
                          {getRecordDates(
                            type,
                            record
                          )}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.recordIcon}>
                      {getTypeIcon(type)}
                    </Text>
                  </View>

                  {record.description ? (
                    <Text
                      style={styles.recordDescription}
                    >
                      {record.description}
                    </Text>
                  ) : null}

                  {record.technologies ? (
                    <Text style={styles.recordExtra}>
                      Technologies: {record.technologies}
                    </Text>
                  ) : null}

                  {record.skills ? (
                    <Text style={styles.recordExtra}>
                      Skills: {record.skills}
                    </Text>
                  ) : null}

                  {record.achievements ? (
                    <Text style={styles.recordExtra}>
                      Achievements:{' '}
                      {record.achievements}
                    </Text>
                  ) : null}

                  {record.employmentType ? (
                    <Text style={styles.recordExtra}>
                      Employment Type:{' '}
                      {record.employmentType}
                    </Text>
                  ) : null}

                  {record.expiryDate ? (
                    <Text style={styles.recordExtra}>
                      Expiry: {record.expiryDate}
                    </Text>
                  ) : null}

                  {record.credentialLink ? (
                    <Text style={styles.recordExtra}>
                      Credential: {record.credentialLink}
                    </Text>
                  ) : null}

                  {record.link ? (
                    <Text style={styles.recordExtra}>
                      Link: {record.link}
                    </Text>
                  ) : null}

                  <View style={styles.recordActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() =>
                        openEditForm(
                          type,
                          record
                        )
                      }
                    >
                      <Text style={styles.editButtonText}>
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() =>
                        deleteRecord(
                          type,
                          record.id
                        )
                      }
                    >
                      <Text
                        style={styles.deleteButtonText}
                      >
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            {/* Add / Edit Form */}
            {activeForm === type && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingId
                    ? `Edit ${getTypeTitle(type)}`
                    : `Add ${getTypeTitle(type)}`}
                </Text>

                {formFields[type].map((field) => (
                  <View key={field.key}>
                    <Text style={styles.inputLabel}>
                      {field.label}
                      {field.required ? ' *' : ''}
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
                      value={
                        formData[field.key] || ''
                      }
                      onChangeText={(value) =>
                        updateField(
                          field.key,
                          value
                        )
                      }
                      multiline={
                        field.multiline || false
                      }
                    />
                  </View>
                ))}

                <Pressable
                  style={styles.saveRecordButton}
                  onPress={() =>
                    saveRecord(type)
                  }
                >
                  <Text
                    style={
                      styles.saveRecordButtonText
                    }
                  >
                    {editingId
                      ? 'Update Experience'
                      : 'Save Experience'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {/* Tip Card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>✨</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Experience Tip
          </Text>

          <Text style={styles.tipText}>
            Don't wait until you have a full-time
            job to build experience. A personal
            project or volunteer role can help you
            demonstrate real-world skills.
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[
          styles.saveButton,
          selectedExperience.length === 0 &&
            styles.saveButtonDisabled,
          saving && styles.saveButtonDisabled,
        ]}
        disabled={
          selectedExperience.length === 0 ||
          saving
        }
        onPress={saveExperience}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? 'Saving...'
            : 'Save Experience'}
        </Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footerText}>
        You can continue adding experience as you
        develop throughout your career journey.
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 15,
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

  progressCard: {
    backgroundColor: '#4F46E5',
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

  progressLabel: {
    color: '#C7D2FE',
    fontSize: 12,
    marginBottom: 5,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    maxWidth: 210,
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
    fontWeight: 'bold',
  },

  progressPercent: {
    color: '#E0E7FF',
    fontSize: 10,
    marginTop: -2,
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#6366F1',
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
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4F46E5',
  },

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
    marginBottom: 5,
  },

  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  experienceContainer: {
    marginBottom: 12,
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  experienceCardSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },

  experienceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  experienceIconContainerSelected: {
    backgroundColor: '#E0E7FF',
  },

  experienceIcon: {
    fontSize: 24,
  },

  experienceContent: {
    flex: 1,
    paddingRight: 8,
  },

  experienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  experienceTitleSelected: {
    color: '#4F46E5',
  },

  experienceDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
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

  /* Structured Experience */

  experienceSection: {
    marginTop: 20,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  addButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 5,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  recordMain: {
    flex: 1,
    paddingRight: 10,
  },

  recordTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  recordSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },

  recordDates: {
    fontSize: 12,
    color: '#64748B',
  },

  recordIcon: {
    fontSize: 25,
  },

  recordDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
  },

  recordExtra: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 3,
  },

  recordActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 8,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Form */

  formCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },

  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  saveRecordButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },

  saveRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  tipCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 25,
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
    color: '#334155',
    marginBottom: 5,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  saveButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  saveButtonText: {
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

