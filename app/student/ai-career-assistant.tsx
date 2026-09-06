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
        "Hi! 👋 I'm your CareerForgeAI Career Assistant. I can help you with career planning, CV improvement, skills development, interview preparation, and finding the right career path.",
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

    if (
      lowerMessage.includes('interview')
    ) {
      return "For interviews, research the organisation, understand the role, prepare examples of your achievements, and practise common questions. Try using the STAR method when answering behavioural questions.";
    }

    if (
      lowerMessage.includes('employability') ||
      lowerMessage.includes('score')
    ) {
      return "Your employability score is currently 82%. You can improve it by completing your profile, adding relevant skills, improving your CV, completing career activities, and gaining experience through internships, projects, or volunteering.";
    }

    if (
      lowerMessage.includes('internship')
    ) {
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>🤖</Text>
          </View>

          <View>
            <Text style={styles.headerTitle}>
              AI Career Assistant
            </Text>

            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                Career guidance assistant
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Chat */}
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
        {/* Welcome section */}
        {messages.length === 1 && (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeIcon}>✨</Text>

            <Text style={styles.welcomeTitle}>
              Let's build your career
            </Text>

            <Text style={styles.welcomeText}>
              Ask me anything about your career,
              skills, CV, interviews, or future
              opportunities.
            </Text>
          </View>
        )}

        {/* Messages */}
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
              <View style={styles.smallAiIcon}>
                <Text>🤖</Text>
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

        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.messageRow}>
            <View style={styles.smallAiIcon}>
              <Text>🤖</Text>
            </View>

            <View style={styles.typingBubble}>
              <ActivityIndicator
                size="small"
                color="#4F46E5"
              />

              <Text style={styles.typingText}>
                AI is typing...
              </Text>
            </View>
          </View>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && !isTyping && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              Try asking:
            </Text>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How can I improve my CV?'
                )
              }
            >
              <Text style={styles.suggestionIcon}>
                📄
              </Text>

              <Text style={styles.suggestionText}>
                How can I improve my CV?
              </Text>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'What skills should I learn?'
                )
              }
            >
              <Text style={styles.suggestionIcon}>
                🎯
              </Text>

              <Text style={styles.suggestionText}>
                What skills should I learn?
              </Text>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How can I improve my employability score?'
                )
              }
            >
              <Text style={styles.suggestionIcon}>
                📈
              </Text>

              <Text style={styles.suggestionText}>
                How can I improve my employability score?
              </Text>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                askSuggestedQuestion(
                  'How should I prepare for an interview?'
                )
              }
            >
              <Text style={styles.suggestionIcon}>
                💼
              </Text>

              <Text style={styles.suggestionText}>
                How should I prepare for an interview?
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your career..."
            placeholderTextColor="#94A3B8"
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
            <Text style={styles.sendIcon}>
              ➤
            </Text>
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
    backgroundColor: '#F8FAFC',
  },

  header: {
    height: 76,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 38,
    color: '#4F46E5',
    marginTop: -5,
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  aiIconText: {
    fontSize: 22,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  onlineText: {
    fontSize: 11,
    color: '#64748B',
  },

  headerSpacer: {
    width: 42,
  },

  chat: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },

  welcomeCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  welcomeIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  welcomeTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 7,
    textAlign: 'center',
  },

  welcomeText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    textAlign: 'center',
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  aiRow: {
    justifyContent: 'flex-start',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  smallAiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  aiMessageText: {
    color: '#334155',
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },

  suggestionsContainer: {
    marginTop: 5,
  },

  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },

  suggestion: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestionIcon: {
    fontSize: 19,
    marginRight: 10,
  },

  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  bottomSpace: {
    height: 10,
  },

  inputArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 9,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  inputContainer: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 6,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 14,
    color: '#0F172A',
    paddingTop: 11,
    paddingBottom: 11,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },

  sendIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 2,
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
});

