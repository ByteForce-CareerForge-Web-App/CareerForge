import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';

type Project = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  technologies: string | null;
  github_url: string | null;
  project_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectForm = {
  title: string;
  description: string;
  technologies: string;
  github_url: string;
  project_url: string;
  completed_at: string;
};

const EMPTY_FORM: ProjectForm = {
  title: '',
  description: '',
  technologies: '',
  github_url: '',
  project_url: '',
  completed_at: '',
};

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [token, setToken] = useState<string | null>(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD PROJECTS
  |--------------------------------------------------------------------------
  */

  const loadProjects = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');

      if (!authToken) {
        Alert.alert(
          'Authentication Required',
          'Please log in again.'
        );
        return;
      }

      setToken(authToken);

      const response = await fetch(
        `${API_BASE_URL}/projects.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to load projects'
        );
      }

      setProjects(
        Array.isArray(result.data?.projects)
          ? result.data.projects
          : []
      );

    } catch (error) {

      console.error('Load projects error:', error);

      Alert.alert(
        'Error',
        'Unable to load your projects.'
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const refreshProjects = async () => {
    setRefreshing(true);
    await loadProjects();
  };


  /*
  |--------------------------------------------------------------------------
  | LOAD WHEN SCREEN GETS FOCUS
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );


  /*
  |--------------------------------------------------------------------------
  | OPEN ADD PROJECT MODAL
  |--------------------------------------------------------------------------
  */

  const openAddProject = () => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };


  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT PROJECT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditProject = (project: Project) => {
    setEditingProject(project);

    setForm({
      title: project.title || '',
      description: project.description || '',
      technologies: project.technologies || '',
      github_url: project.github_url || '',
      project_url: project.project_url || '',
      completed_at: project.completed_at || '',
    });

    setModalVisible(true);
  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    setEditingProject(null);
    setForm(EMPTY_FORM);
  };


  /*
  |--------------------------------------------------------------------------
  | SAVE PROJECT
  |--------------------------------------------------------------------------
  */

  const saveProject = async () => {

    const title = form.title.trim();
    const description = form.description.trim();
    const technologies = form.technologies.trim();
    const githubUrl = form.github_url.trim();
    const projectUrl = form.project_url.trim();
    const completedAt = form.completed_at.trim();


    if (!title) {
      Alert.alert(
        'Missing Information',
        'Please enter a project title.'
      );
      return;
    }

    if (!description) {
      Alert.alert(
        'Missing Information',
        'Please describe your project.'
      );
      return;
    }


    if (completedAt) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(completedAt)) {
        Alert.alert(
          'Invalid Date',
          'Use the format YYYY-MM-DD.'
        );
        return;
      }
    }


    try {

      setSaving(true);

      const authToken =
        token || await AsyncStorage.getItem('authToken');

      if (!authToken) {
        Alert.alert(
          'Authentication Required',
          'Please log in again.'
        );
        return;
      }


      const payload = {
        title,
        description,
        technologies,
        github_url: githubUrl,
        project_url: projectUrl,
        completed_at: completedAt,
      };


      const isEditing = editingProject !== null;

      const url = isEditing
        ? `${API_BASE_URL}/projects.php?id=${editingProject.id}`
        : `${API_BASE_URL}/projects.php`;


      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',

        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },

        body: JSON.stringify(payload),
      });


      const result = await response.json();


      if (response.status === 401) {

        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');

        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );

        return;
      }


      if (!response.ok || !result.success) {

        throw new Error(
          result.message ||
            (isEditing
              ? 'Failed to update project'
              : 'Failed to add project')
        );
      }


      setModalVisible(false);
      setEditingProject(null);
      setForm(EMPTY_FORM);

      await loadProjects();

      Alert.alert(
        'Success',
        isEditing
          ? 'Project updated successfully.'
          : 'Project added successfully.'
      );

    } catch (error) {

      console.error('Save project error:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Unable to save project.'
      );

    } finally {

      setSaving(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | DELETE PROJECT
  |--------------------------------------------------------------------------
  */

  const deleteProject = (project: Project) => {

    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"?`,
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

              const authToken =
                token ||
                await AsyncStorage.getItem('authToken');

              if (!authToken) {
                Alert.alert(
                  'Authentication Required',
                  'Please log in again.'
                );
                return;
              }


              const response = await fetch(
                `${API_BASE_URL}/projects.php?id=${project.id}`,
                {
                  method: 'DELETE',

                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: 'application/json',
                  },
                }
              );


              const result = await response.json();


              if (response.status === 401) {

                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');

                Alert.alert(
                  'Session Expired',
                  'Please log in again.'
                );

                return;
              }


              if (!response.ok || !result.success) {

                throw new Error(
                  result.message ||
                    'Failed to delete project'
                );
              }


              await loadProjects();


              Alert.alert(
                'Deleted',
                'Project deleted successfully.'
              );

            } catch (error) {

              console.error(
                'Delete project error:',
                error
              );

              Alert.alert(
                'Error',
                'Unable to delete project.'
              );
            }
          },
        },
      ]
    );
  };


  /*
  |--------------------------------------------------------------------------
  | OPEN URL
  |--------------------------------------------------------------------------
  */

  const openUrl = async (url: string) => {

    try {

      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          'Unable to Open Link',
          'This link cannot be opened on your device.'
        );
        return;
      }

      await Linking.openURL(url);

    } catch (error) {

      console.error(
        'Open URL error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to open this link.'
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | RENDER PROJECT
  |--------------------------------------------------------------------------
  */

  const renderProject = ({
    item,
  }: {
    item: Project;
  }) => {

    const technologies =
      item.technologies
        ?.split(',')
        .map((technology) => technology.trim())
        .filter(Boolean) || [];


    return (
      <View style={styles.projectCard}>

        <View style={styles.projectHeader}>

          <View style={styles.projectTitleContainer}>

            <Text style={styles.projectTitle}>
              {item.title}
            </Text>

            {item.completed_at ? (
              <Text style={styles.projectDate}>
                Completed {item.completed_at}
              </Text>
            ) : null}

          </View>


          <View style={styles.actionRow}>

            <Pressable
              style={styles.smallButton}
              onPress={() => openEditProject(item)}
            >
              <Text style={styles.smallButtonText}>
                Edit
              </Text>
            </Pressable>


            <Pressable
              style={[
                styles.smallButton,
                styles.deleteButton,
              ]}
              onPress={() => deleteProject(item)}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  styles.deleteButtonText,
                ]}
              >
                Delete
              </Text>
            </Pressable>

          </View>

        </View>


        <Text style={styles.projectDescription}>
          {item.description}
        </Text>


        {technologies.length > 0 ? (

          <View style={styles.technologySection}>

            <Text style={styles.sectionLabel}>
              Technologies
            </Text>

            <View style={styles.technologyRow}>

              {technologies.map(
                (technology, index) => (
                  <View
                    key={`${technology}-${index}`}
                    style={styles.technologyChip}
                  >
                    <Text style={styles.technologyText}>
                      {technology}
                    </Text>
                  </View>
                )
              )}

            </View>

          </View>

        ) : null}


        {(item.github_url || item.project_url) ? (

          <View style={styles.linksSection}>

            {item.github_url ? (

              <Pressable
                onPress={() =>
                  openUrl(item.github_url as string)
                }
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  View GitHub
                </Text>
              </Pressable>

            ) : null}


            {item.project_url ? (

              <Pressable
                onPress={() =>
                  openUrl(item.project_url as string)
                }
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  View Project
                </Text>
              </Pressable>

            ) : null}

          </View>

        ) : null}

      </View>
    );
  };


  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading projects...
        </Text>

      </View>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | MAIN SCREEN
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <View>

          <Text style={styles.headerTitle}>
            My Projects
          </Text>

          <Text style={styles.headerSubtitle}>
            Showcase the work you've built
          </Text>

        </View>


        <Pressable
          style={styles.addButton}
          onPress={openAddProject}
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </Pressable>

      </View>


      <FlatList
        data={projects}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderProject}
        contentContainerStyle={
          projects.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProjects}
          />
        }
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyIcon}>
              💻
            </Text>

            <Text style={styles.emptyTitle}>
              No projects yet
            </Text>

            <Text style={styles.emptyText}>
              Add projects you've built at university,
              during your studies, hackathons, or in your
              own time. Your projects help CareerForge
              understand your practical experience.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={openAddProject}
            >
              <Text style={styles.emptyButtonText}>
                Add Your First Project
              </Text>
            </Pressable>

          </View>
        }

      />


      {/* ---------------------------------------------------------------- */}
      {/* ADD / EDIT MODAL */}
      {/* ---------------------------------------------------------------- */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >

        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>

              <View>

                <Text style={styles.modalTitle}>
                  {editingProject
                    ? 'Edit Project'
                    : 'Add Project'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Tell employers what you've built
                </Text>

              </View>


              <Pressable
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.closeButton}>
                  ✕
                </Text>
              </Pressable>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.formContent
              }
            >

              {/* TITLE */}

              <Text style={styles.inputLabel}>
                Project Title *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. CareerForge Mobile App"
                placeholderTextColor="#999"
                value={form.title}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    title: text,
                  })
                }
                editable={!saving}
              />


              {/* DESCRIPTION */}

              <Text style={styles.inputLabel}>
                Description *
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Describe what you built, what problem it solves, and what you contributed..."
                placeholderTextColor="#999"
                value={form.description}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    description: text,
                  })
                }
                multiline
                textAlignVertical="top"
                editable={!saving}
              />


              {/* TECHNOLOGIES */}

              <Text style={styles.inputLabel}>
                Technologies / Skills
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. React Native, PHP, MySQL, JavaScript"
                placeholderTextColor="#999"
                value={form.technologies}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    technologies: text,
                  })
                }
                editable={!saving}
              />

              <Text style={styles.helperText}>
                Separate technologies with commas.
              </Text>


              {/* GITHUB */}

              <Text style={styles.inputLabel}>
                GitHub URL
              </Text>

              <TextInput
                style={styles.input}
                placeholder="https://github.com/username/project"
                placeholderTextColor="#999"
                value={form.github_url}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    github_url: text,
                  })
                }
                autoCapitalize="none"
                keyboardType="url"
                editable={!saving}
              />


              {/* PROJECT URL */}

              <Text style={styles.inputLabel}>
                Live Project URL
              </Text>

              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                placeholderTextColor="#999"
                value={form.project_url}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    project_url: text,
                  })
                }
                autoCapitalize="none"
                keyboardType="url"
                editable={!saving}
              />


              {/* COMPLETION DATE */}

              <Text style={styles.inputLabel}>
                Completion Date
              </Text>

              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={form.completed_at}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    completed_at: text,
                  })
                }
                keyboardType="numbers-and-punctuation"
                editable={!saving}
              />

              <Text style={styles.helperText}>
                Optional. Example: 2026-09-10
              </Text>


              {/* SAVE */}

              <Pressable
                style={[
                  styles.saveButton,
                  saving &&
                    styles.disabledButton,
                ]}
                onPress={saveProject}
                disabled={saving}
              >

                {saving ? (

                  <ActivityIndicator
                    size="small"
                  />

                ) : (

                  <Text style={styles.saveButtonText}>
                    {editingProject
                      ? 'Save Changes'
                      : 'Add Project'}
                  </Text>

                )}

              </Pressable>


              {/* CANCEL */}

              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

            </ScrollView>

          </View>

        </KeyboardAvoidingView>

      </Modal>

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
    backgroundColor: '#F7F8FA',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },

  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111827',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
    padding: 20,
  },

  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  projectTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  projectDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },

  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#F3F4F6',
  },

  smallButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
  },

  deleteButtonText: {
    color: '#DC2626',
  },

  projectDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },

  technologySection: {
    marginTop: 16,
  },

  sectionLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },

  technologyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  technologyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },

  technologyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },

  linksSection: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },

  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },

  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },

  closeButton: {
    fontSize: 22,
    color: '#6B7280',
  },

  formContent: {
    padding: 20,
    paddingBottom: 40,
  },

  inputLabel: {
    marginTop: 16,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: 14,
  },

  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },

  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: '#9CA3AF',
  },

  saveButton: {
    marginTop: 26,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },

});