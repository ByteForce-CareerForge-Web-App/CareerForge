import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'careerforge_admin_notifications';

type NotificationType =
  | 'Platform'
  | 'Users'
  | 'Opportunities'
  | 'Verification';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  active: boolean;
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to CareerForgeAI',
    message:
      'Welcome to the CareerForgeAI platform. Start building your career today.',
    type: 'Platform',
    time: 'Today',
    active: true,
  },
  {
    id: '2',
    title: 'New Business Verification',
    message:
      'TechNova Solutions has submitted a new business verification request.',
    type: 'Verification',
    time: '10 minutes ago',
    active: true,
  },
  {
    id: '3',
    title: 'New Opportunity Available',
    message:
      'A new Junior Data Analyst opportunity has been posted.',
    type: 'Opportunities',
    time: '1 hour ago',
    active: true,
  },
  {
    id: '4',
    title: 'Alumni Verification Required',
    message:
      'An alumni certificate is waiting for administrator review.',
    type: 'Verification',
    time: '2 hours ago',
    active: true,
  },
];

const NOTIFICATION_TYPES: NotificationType[] = [
  'Platform',
  'Users',
  'Opportunities',
  'Verification',
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    []
  );

  const [search, setSearch] = useState('');

  // Create notification modal
  const [createModalVisible, setCreateModalVisible] =
    useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] =
    useState<NotificationType>('Platform');
  const [newActive, setNewActive] = useState(true);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(
        NOTIFICATIONS_KEY
      );

      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(DEFAULT_NOTIFICATIONS)
        );

        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch (error) {
      console.log(
        'Error loading notifications:',
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const saveNotifications = async (
    updated: Notification[]
  ) => {
    try {
      setNotifications(updated);

      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log(
        'Error saving notifications:',
        error
      );
    }
  };

  const toggleNotification = (
    notification: Notification
  ) => {
    const updated = notifications.map((item) =>
      item.id === notification.id
        ? {
            ...item,
            active: !item.active,
          }
        : item
    );

    saveNotifications(updated);
  };

  const deleteNotification = (
    notification: Notification
  ) => {
    Alert.alert(
      'Delete Notification',
      `Delete "${notification.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = notifications.filter(
              (item) => item.id !== notification.id
            );

            await saveNotifications(updated);
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setNewTitle('');
    setNewMessage('');
    setNewType('Platform');
    setNewActive(true);
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    Keyboard.dismiss();
    setCreateModalVisible(false);
  };

  const createNotification = async () => {
    const title = newTitle.trim();
    const message = newMessage.trim();

    if (!title) {
      Alert.alert(
        'Missing Title',
        'Please enter a notification title.'
      );
      return;
    }

    if (!message) {
      Alert.alert(
        'Missing Message',
        'Please enter a notification message.'
      );
      return;
    }

    const newNotification: Notification = {
      id: `${Date.now()}`,
      title,
      message,
      type: newType,
      time: 'Just now',
      active: newActive,
    };

    const updatedNotifications = [
      newNotification,
      ...notifications,
    ];

    await saveNotifications(updatedNotifications);

    Keyboard.dismiss();
    setCreateModalVisible(false);

    setNewTitle('');
    setNewMessage('');
    setNewType('Platform');
    setNewActive(true);

    Alert.alert(
      'Notification Created',
      `"${title}" has been added successfully.`
    );
  };

  const filteredNotifications =
    notifications.filter((notification) => {
      const searchText = search.toLowerCase();

      return (
        notification.title
          .toLowerCase()
          .includes(searchText) ||
        notification.message
          .toLowerCase()
          .includes(searchText) ||
        notification.type
          .toLowerCase()
          .includes(searchText)
      );
    });

  const activeCount = notifications.filter(
    (notification) => notification.active
  ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/admin/dashboard');
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage platform notifications
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* SUMMARY */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              🔔
            </Text>

            <Text style={styles.summaryValue}>
              {notifications.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              ✓
            </Text>

            <Text style={styles.summaryValue}>
              {activeCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Active
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>
              —
            </Text>

            <Text style={styles.summaryValue}>
              {notifications.length - activeCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Inactive
            </Text>
          </View>
        </View>

        {/* CREATE */}
        <Pressable
          style={styles.createButton}
          onPress={openCreateModal}
        >
          <Text style={styles.createButtonText}>
            + Create Notification
          </Text>
        </Pressable>

        {/* SEARCH */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notifications..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        {/* SECTION */}
        <Text style={styles.sectionTitle}>
          Platform Notifications
        </Text>

        {filteredNotifications.map(
          (notification) => (
            <View
              key={notification.id}
              style={styles.notificationCard}
            >
              <View style={styles.notificationTop}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.iconText}>
                    {notification.type ===
                    'Verification'
                      ? '✓'
                      : notification.type ===
                        'Opportunities'
                      ? 'O'
                      : notification.type ===
                        'Users'
                      ? 'U'
                      : 'N'}
                  </Text>
                </View>

                <View style={styles.notificationInfo}>
                  <Text
                    style={styles.notificationTitle}
                  >
                    {notification.title}
                  </Text>

                  <Text
                    style={styles.notificationType}
                  >
                    {notification.type}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    notification.active
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      notification.active
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {notification.active
                      ? 'Active'
                      : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.notificationMessage}
              >
                {notification.message}
              </Text>

              <Text style={styles.notificationTime}>
                {notification.time}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    notification.active
                      ? styles.disableButton
                      : styles.enableButton,
                  ]}
                  onPress={() =>
                    toggleNotification(
                      notification
                    )
                  }
                >
                  <Text
                    style={[
                      styles.actionText,
                      notification.active
                        ? styles.disableText
                        : styles.enableText,
                    ]}
                  >
                    {notification.active
                      ? 'Disable'
                      : 'Enable'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                  onPress={() =>
                    deleteNotification(
                      notification
                    )
                  }
                >
                  <Text
                    style={[
                      styles.actionText,
                      styles.deleteText,
                    ]}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        )}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔎
            </Text>

            <Text style={styles.emptyTitle}>
              No notifications found
            </Text>

            <Text style={styles.emptyText}>
              Try a different search.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CREATE NOTIFICATION MODAL */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCreateModal}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
          >
            <TouchableWithoutFeedback>
              <View style={styles.createModalCard}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={
                    styles.modalContent
                  }
                >
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>
                        Create Notification
                      </Text>

                      <Text
                        style={styles.modalSubtitle}
                      >
                        Send a notification to platform users
                      </Text>
                    </View>

                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={closeCreateModal}
                    >
                      <Text
                        style={styles.modalCloseText}
                      >
                        ×
                      </Text>
                    </Pressable>
                  </View>

                  {/* TITLE */}
                  <Text style={styles.fieldLabel}>
                    Notification Title
                  </Text>

                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="Enter notification title"
                    placeholderTextColor="#94A3B8"
                    style={styles.modalInput}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  {/* MESSAGE */}
                  <Text style={styles.fieldLabel}>
                    Message
                  </Text>

                  <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Enter notification message"
                    placeholderTextColor="#94A3B8"
                    style={[
                      styles.modalInput,
                      styles.messageInput,
                    ]}
                    multiline
                    textAlignVertical="top"
                    returnKeyType="default"
                  />

                  {/* TYPE */}
                  <Text style={styles.fieldLabel}>
                    Notification Type
                  </Text>

                  <View style={styles.typeGrid}>
                    {NOTIFICATION_TYPES.map(
                      (type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.typeButton,
                            newType === type &&
                              styles.typeButtonActive,
                          ]}
                          onPress={() =>
                            setNewType(type)
                          }
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              newType === type &&
                                styles.typeButtonTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>

                  {/* STATUS */}
                  <Text style={styles.fieldLabel}>
                    Notification Status
                  </Text>

                  <View style={styles.statusSelector}>
                    <Pressable
                      style={[
                        styles.statusOption,
                        newActive &&
                          styles.statusOptionActive,
                      ]}
                      onPress={() =>
                        setNewActive(true)
                      }
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          newActive &&
                            styles.statusOptionTextActive,
                        ]}
                      >
                        Active
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusOption,
                        !newActive &&
                          styles.statusOptionInactive,
                      ]}
                      onPress={() =>
                        setNewActive(false)
                      }
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          !newActive &&
                            styles.statusOptionInactiveText,
                        ]}
                      >
                        Inactive
                      </Text>
                    </Pressable>
                  </View>

                  {/* ACTIONS */}
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[
                        styles.modalActionButton,
                        styles.modalCancelButton,
                      ]}
                      onPress={closeCreateModal}
                    >
                      <Text
                        style={
                          styles.modalCancelText
                        }
                      >
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.modalActionButton,
                        styles.modalCreateButton,
                      ]}
                      onPress={createNotification}
                    >
                      <Text
                        style={
                          styles.modalCreateText
                        }
                      >
                        Create
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0F172A',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -4,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 3,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },

  summaryIcon: {
    fontSize: 20,
    marginBottom: 5,
    color: '#0F172A',
    fontWeight: '800',
  },

  summaryValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },

  createButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  notificationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 17,
    color: '#0F172A',
    fontWeight: '800',
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  notificationType: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  inactiveBadge: {
    backgroundColor: '#F1F5F9',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  activeText: {
    color: '#15803D',
  },

  inactiveText: {
    color: '#64748B',
  },

  notificationMessage: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 13,
  },

  notificationTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 7,
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },

  actionButton: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
  },

  enableButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  disableButton: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  enableText: {
    color: '#15803D',
  },

  disableText: {
    color: '#C2410C',
  },

  deleteText: {
    color: '#DC2626',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  /* CREATE MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },

  createModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },

  modalContent: {
    padding: 20,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  modalTitle: {
    color: '#0F172A',
    fontSize: 21,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: 280,
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },

  modalCloseText: {
    color: '#475569',
    fontSize: 25,
    lineHeight: 27,
    fontWeight: '500',
  },

  fieldLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 4,
  },

  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 15,
  },

  messageInput: {
    minHeight: 100,
    maxHeight: 150,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  typeButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 7,
    marginBottom: 7,
  },

  typeButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },

  typeButtonText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },

  typeButtonTextActive: {
    color: '#FFFFFF',
  },

  statusSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  statusOption: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginHorizontal: 4,
  },

  statusOptionActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },

  statusOptionInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },

  statusOptionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },

  statusOptionTextActive: {
    color: '#15803D',
  },

  statusOptionInactiveText: {
    color: '#475569',
  },

  modalActions: {
    flexDirection: 'row',
  },

  modalActionButton: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  modalCancelButton: {
    backgroundColor: '#F1F5F9',
  },

  modalCancelText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },

  modalCreateButton: {
    backgroundColor: '#0F172A',
  },

  modalCreateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});