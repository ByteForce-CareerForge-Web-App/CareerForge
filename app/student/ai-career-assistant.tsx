import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
};

export default function AICareerAssistant() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text:
        "Hi! I'm your CareerForgeAI Career Assistant. I can help you with career planning, CV improvement, skills development, interview preparation, and finding the right career path.",
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  /*
   * FRONTEND-ONLY DEMO
   *
   * These responses are temporary and are only used
   * to test the chat interface.
   *
   * The real AI/backend connection will be added later.
   */

  const getDemoResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('cv') ||
      lowerMessage.includes('resume')
    ) {
      return "I'd recommend starting with a clear professional summary, highlighting your strongest skills, and tailoring your CV to each opportunity. You should also include relevant projects, education, certifications, and measurable achievements.";
    }

    if (
      lowerMessage.includes('career') ||
      lowerMessage.includes('job')
    ) {
      return "A good career choice should consider your qualifications, interests, strengths, and the skills employers are looking for. Based on your CareerForgeAI profile, you can explore different career paths and compare the skills required for each one.";
    }

    if (
      lowerMessage.includes('skill') ||
      lowerMessage.includes('learn')
    ) {
      return "Focus on developing both technical and professional skills. Depending on your career goal, useful areas could include programming, data analysis, communication, problem-solving, teamwork, and digital literacy.";
    }

    if (lowerMessage.includes('interview')) {
      return "For interviews, research the organisation, understand the role, prepare examples of your achievements, and practise common questions. Try using the STAR method when answering behavioural questions.";
    }

    if (
      lowerMessage.includes('employability') ||
      lowerMessage.includes('score')
    ) {
      return "Your employability score is currently 82%. You can improve it by completing your profile, adding relevant skills, improving your CV, completing career activities, and gaining experience through internships, projects, or volunteering.";
    }

    if (lowerMessage.includes('internship')) {
      return "Internships are a great way to gain practical experience. Look for opportunities that match your qualification and career interests, and focus on building skills that will strengthen your future applications.";
    }

    return "That's a great career question! I can help you explore career paths, improve your CV, develop skills, prepare for interviews, and understand how to improve your employability.";
  };

  const sendMessage = () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: cleanMessage,
      sender: 'user',
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: getDemoResponse(cleanMessage),
        sender: 'ai',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);

      setIsTyping(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }, 1200);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  };

  const askSuggestedQuestion = (question: string) => {
    if (isTyping) {
      return;
    }

    setMessage(question);

    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now(),
        text: question,
        sender: 'user',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        userMessage,
      ]);

      setMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: getDemoResponse(question),
          sender: 'ai',
        };

        setMessages((previousMessages) => [
          ...previousMessages,
          aiMessage,
        ]);

        setIsTyping(false);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({
            animated: true,
          });
        }, 100);
      }, 1200);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }, 50);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 10 : 0
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerIdentity}>
          <View style={styles.headerAiIcon}>
            <Ionicons
              name="sparkles"
              size={25}
              color="#2563EB"
            />
          </View>

          <View style={styles.headerDetails}>
            <Text style={styles.headerEyebrow}>
              CAREERFORGE AI
            </Text>

            <Text style={styles.headerTitle}>
              AI Career Assistant
            </Text>

            <View style={styles.statusRow}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                Career guidance assistant
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CHAT */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({
            animated: true,
          })
        }
      >
        {/* HERO */}
        {messages.length === 1 && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="sparkles"
                  size={30}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  AI POWERED
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Build your career
              {'\n'}
              with confidence.
            </Text>

            <Text style={styles.heroDescription}>
              Your personal career assistant for
              planning, skills, CV improvement,
              interviews and opportunities.
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooter}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#60A5FA"
              />

              <Text style={styles.heroFooterText}>
                Personalised career guidance
              </Text>
            </View>
          </View>
        )}

        {/* MESSAGES */}
        {messages.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageRow,
              item.sender === 'user'
                ? styles.userRow
                : styles.aiRow,
            ]}
          >
            {item.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Ionicons
                  name="sparkles"
                  size={15}
                  color="#2563EB"
                />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                item.sender === 'user'
                  ? styles.userBubble
                  : styles.aiBubble,
              ]}
            >
              {item.sender === 'ai' && (
                <Text style={styles.aiLabel}>
                  CAREERFORGE AI
                </Text>
              )}

              <Text
                style={[
                  styles.messageText,
                  item.sender === 'user'
                    ? styles.userMessageText
                    : styles.aiMessageText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        ))}

        {/* TYPING */}
        {isTyping && (
          <View style={styles.messageRow}>
            <View style={styles.aiAvatar}>
              <Ionicons
                name="sparkles"
                size={15}
                color="#2563EB"
              />
            </View>

            <View style={styles.typingBubble}>
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <Text style={styles.typingText}>
                AI is preparing your response...
              </Text>
            </View>
          </View>
        )}

        {/* SUGGESTIONS */}
        {messages.length === 1 && !isTyping && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  GET STARTED
                </Text>

                <Text style={styles.sectionTitle}>
                  What can I help with?
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={19}
                  color="#2563EB"
                />
              </View>
            </View>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How can I improve my CV?'
                )
              }
            >
              <View
                style={[
                  styles.suggestionIcon,
                  styles.blueSuggestion,
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>
                  Improve my CV
                </Text>

                <Text style={styles.suggestionSubtitle}>
                  Make your CV stronger for employers
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'What skills should I learn?'
                )
              }
            >
              <View
                style={[
                  styles.suggestionIcon,
                  styles.blueSuggestion,
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>
                  Develop my skills
                </Text>

                <Text style={styles.suggestionSubtitle}>
                  Discover skills employers value
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How can I improve my employability score?'
                )
              }
            >
              <View
                style={[
                  styles.suggestionIcon,
                  styles.greenSuggestion,
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={21}
                  color="#16A34A"
                />
              </View>

              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>
                  Improve employability
                </Text>

                <Text style={styles.suggestionSubtitle}>
                  Increase your CareerForge score
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How should I prepare for an interview?'
                )
              }
            >
              <View
                style={[
                  styles.suggestionIcon,
                  styles.darkSuggestion,
                ]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>
                  Prepare for interviews
                </Text>

                <Text style={styles.suggestionSubtitle}>
                  Practise and improve interview skills
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* INPUT */}
      <View style={styles.inputArea}>
        <View style={styles.inputHeader}>
          <View style={styles.inputStatus}>
            <View style={styles.inputStatusDot} />

            <Text style={styles.inputStatusText}>
              AI ASSISTANT
            </Text>
          </View>

          <Text style={styles.characterCount}>
            {message.length}/500
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your career..."
            placeholderTextColor="#7F8DA3"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isTyping}
          />

          <Pressable
            style={[
              styles.sendButton,
              (!message.trim() || isTyping) &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || isTyping}
          >
            <Ionicons
              name="arrow-up"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          CareerForgeAI Assistant • Frontend demo
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF3F8',
  },

  /* HEADER */

  header: {
    backgroundColor: '#02060C',
    minHeight: 100,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 42 : 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#101A29',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1E2D43',
  },

  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAiIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerDetails: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#60A5FA',
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  statusText: {
    fontSize: 10,
    color: '#8D9AAF',
  },

  /* CHAT */

  chat: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 22,
  },

  /* HERO */

  heroCard: {
    backgroundColor: '#02060C',
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#16253A',
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBadge: {
    backgroundColor: '#101B2B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20334D',
  },

  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#60A5FA',
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#AAB7C9',
  },

  heroDivider: {
    height: 1,
    backgroundColor: '#18263A',
    marginVertical: 17,
  },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroFooterText: {
    fontSize: 11,
    color: '#8EA0B8',
    marginLeft: 7,
    fontWeight: '600',
  },

  /* MESSAGES */

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  aiRow: {
    justifyContent: 'flex-start',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D4E2FA',
  },

  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 5,
  },

  aiLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#2563EB',
    marginBottom: 6,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },

  aiMessageText: {
    color: '#26364A',
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  /* TYPING */

  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },

  /* SUGGESTIONS */

  suggestionsContainer: {
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#2563EB',
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  suggestion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE4ED',
  },

  suggestionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  blueSuggestion: {
    backgroundColor: '#E8F0FF',
  },

  greenSuggestion: {
    backgroundColor: '#E8F7EF',
  },

  darkSuggestion: {
    backgroundColor: '#0B1F3A',
  },

  suggestionContent: {
    flex: 1,
  },

  suggestionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172B45',
    marginBottom: 3,
  },

  suggestionSubtitle: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 16,
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  bottomSpace: {
    height: 10,
  },

  /* INPUT */

  inputArea: {
    backgroundColor: '#02060C',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 13 : 10,
    borderTopWidth: 2,
    borderTopColor: '#2563EB',
  },

  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 3,
  },

  inputStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  inputStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#8EA0B8',
  },

  characterCount: {
    fontSize: 9,
    color: '#65758B',
  },

  inputContainer: {
    minHeight: 58,
    backgroundColor: '#101A29',
    borderWidth: 1,
    borderColor: '#263850',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 7,
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    fontSize: 14,
    color: '#FFFFFF',
    paddingTop: 11,
    paddingBottom: 11,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },

  sendButtonDisabled: {
    backgroundColor: '#263850',
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 9,
    color: '#65758B',
    marginTop: 7,
  },
});
