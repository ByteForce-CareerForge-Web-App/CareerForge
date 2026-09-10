import { router, useLocalSearchParams } from 'expo-router';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function BusinessMessagesScreen() {
  const params = useLocalSearchParams();

  const selectedName =
    typeof params.name === 'string'
      ? params.name
      : '';

  const selectedRole =
    typeof params.role === 'string'
      ? params.role
      : '';

  const hasSelectedPerson = !!selectedName;

  const messages = [
    {
      id: '1',
      name: 'Sipho Dlamini',
      role: 'Graduate Data Analyst',
      message: 'Thank you for the opportunity.',
      time: 'Today',
      initials: 'SD',
      unread: true,
    },
    {
      id: '2',
      name: 'Nomvula Zulu',
      role: 'Software Developer',
      message: 'I would like to discuss the position.',
      time: 'Yesterday',
      initials: 'NZ',
      unread: true,
    },
    {
      id: '3',
      name: 'Lethiwe Khumalo',
      role: 'Data Analyst',
      message: 'Thank you for getting back to me.',
      time: 'Mon',
      initials: 'LK',
      unread: false,
    },
  ];

  const openCompanyProfile = () => {
    Keyboard.dismiss();
    router.replace('/business/company-profile');
  };

  const goBack = () => {
    Keyboard.dismiss();
    router.replace('/business/dashboard');
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Pressable
          onPress={goBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Messages
          </Text>

          <Text style={styles.headerSubtitle}>
            Connect and communicate with candidates
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={openCompanyProfile}
        >
          <Text style={styles.profileText}>
            AT
          </Text>
        </Pressable>

      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* CONNECTIONS */}
        <Pressable
          style={styles.connectionsCard}
          onPress={() =>
            router.push('/business/connections')
          }
        >
          <View style={styles.connectionsIcon}>
            <Text style={styles.connectionsIconText}>
              +
            </Text>
          </View>

          <View style={styles.connectionsInfo}>
            <Text style={styles.connectionsTitle}>
              Connections
            </Text>

            <Text style={styles.connectionsSubtitle}>
              Manage your professional network
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        {/* SELECTED CONNECTION */}
        {hasSelectedPerson && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedAvatar}>
              <Text style={styles.selectedAvatarText}>
                {typeof params.initials === 'string'
                  ? params.initials
                  : 'CF'}
              </Text>
            </View>

            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>
                {selectedName}
              </Text>

              <Text style={styles.selectedRole}>
                {selectedRole}
              </Text>
            </View>
          </View>
        )}

        {/* MESSAGES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Messages
          </Text>

          <Text style={styles.messageCount}>
            {messages.filter((item) => item.unread).length} unread
          </Text>
        </View>

        {messages.map((message) => (
          <Pressable
            key={message.id}
            style={styles.messageCard}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {message.initials}
              </Text>
            </View>

            <View style={styles.messageContent}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageName}>
                  {message.name}
                </Text>

                <Text style={styles.messageTime}>
                  {message.time}
                </Text>
              </View>

              <Text style={styles.messageRole}>
                {message.role}
              </Text>

              <Text
                style={[
                  styles.messagePreview,
                  message.unread &&
                    styles.unreadPreview,
                ]}
                numberOfLines={1}
              >
                {message.message}
              </Text>
            </View>

            {message.unread && (
              <View style={styles.unreadDot} />
            )}
          </Pressable>
        ))}

        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>

        {/* HOME */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace('/business/dashboard')
          }
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.navIcon}>
              ⌂
            </Text>
          </View>

          <Text style={styles.navLabel}>
            Home
          </Text>
        </Pressable>

        {/* MESSAGES */}
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace('/business/messages')
          }
        >
          <View
            style={[
              styles.navIconContainer,
              styles.navIconContainerActive,
            ]}
          >
            <Text
              style={[
                styles.navIcon,
                styles.navIconActive,
              ]}
            >
              ◇
            </Text>
          </View>

          <Text
            style={[
              styles.navLabel,
              styles.navLabelActive,
            ]}
          >
            Messages
          </Text>
        </Pressable>

        {/* PROFILE */}
        <Pressable
          style={styles.navItem}
          onPress={openCompanyProfile}
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.profileNavIcon}>
              AT
            </Text>
          </View>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
  backgroundColor: '#0B1F3A',
  paddingTop: 55,
  paddingBottom: 22,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
},

  backButton: {
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.12)',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 14,
},

backText: {
  fontSize: 32,
  lineHeight: 34,
  color: '#FFFFFF',
  fontWeight: '300',
  marginTop: -3,
},

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  profileText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '900',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  connectionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  connectionsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  connectionsIconText: {
    color: '#2563EB',
    fontSize: 25,
    fontWeight: '500',
  },

  connectionsInfo: {
    flex: 1,
  },

  connectionsTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  connectionsSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: '#64748B',
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },

  selectedCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  selectedAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  selectedAvatarText: {
    color: '#1E4B7A',
    fontSize: 13,
    fontWeight: '900',
  },

  selectedInfo: {
    flex: 1,
  },

  selectedName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  selectedRole: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },

  messageCount: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DCE7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#1E4B7A',
    fontSize: 14,
    fontWeight: '900',
  },

  messageContent: {
    flex: 1,
  },

  messageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  messageName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },

  messageTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 8,
  },

  messageRole: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  messagePreview: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  unreadPreview: {
    color: '#334155',
    fontWeight: '700',
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },

  bottomSpace: {
    height: 90,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingBottom: 4,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },

  navIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainerActive: {
    backgroundColor: '#EFF6FF',
  },

  navIcon: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
  },

  navIconActive: {
    color: '#2563EB',
  },

  profileNavIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '900',
  },

  navLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  navLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
});