import React, { useCallback, useState } from 'react';
import {
ActivityIndicator,
Alert,
Pressable,
ScrollView,
StyleSheet,
Text,
View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';

type ImprovementItem = {
id: string;
status: 'pending' | 'completed';
};

type AIResponse = {
success: boolean;
message?: string;
area?: string;
area_label?: string;
recommendation?: string;
suggested_version?: string;
why_better?: string;
actionable_tips?: string[];
};

const STORAGE_KEY = 'careerforge_cv_improvements';

const areaLabels: Record<string, string> = {
personal: 'Personal Information',
summary: 'Professional Summary',
skills: 'Skills',
education: 'Education',
experience: 'Experience',
projects: 'Projects & Achievements',
};

export default function CVAISuggestions() {
const params = useLocalSearchParams<{ area?: string }>();

const area = Array.isArray(params.area)
? params.area[0]
: params.area;

const [loading, setLoading] = useState(true);
const [retrying, setRetrying] = useState(false);
const [data, setData] = useState<AIResponse | null>(null);

const generateSuggestions = useCallback(async () => {
try {
if (!area) {
setData({
success: false,
message: 'No CV improvement area was selected.',
});

    return;
  }

  const authToken = await AsyncStorage.getItem('authToken');

  if (!authToken) {
    router.replace('/login');
    return;
  }

  setData(null);

  const response = await fetch(
    `${API_BASE_URL}/cv-ai-suggestions.php`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        area,
      }),
    }
  );

  const result: AIResponse = await response.json();

  if (response.status === 401) {
    await AsyncStorage.multiRemove([
      'authToken',
      'user',
    ]);

    router.replace('/login');
    return;
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        'Unable to generate AI suggestions.'
    );
  }

  setData(result);

} catch (error) {
  console.log('AI CV error:', error);

  setData({
    success: false,
    message:
      error instanceof Error
        ? error.message
        : 'Unable to generate AI suggestions.',
  });
} finally {
  setLoading(false);
  setRetrying(false);
}

}, [area]);

useFocusEffect(
useCallback(() => {
setLoading(true);
generateSuggestions();
}, [generateSuggestions])
);

const markAsCompleted = async () => {
try {
const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return;
  }

  const parsed = JSON.parse(stored);

  let plan: ImprovementItem[] = [];

  if (Array.isArray(parsed)) {
    if (
      parsed.length > 0 &&
      typeof parsed[0] === 'string'
    ) {
      plan = parsed.map((id: string) => ({
        id,
        status: 'pending',
      }));
    } else {
      plan = parsed;
    }
  }

  const updatedPlan = plan.map((item) =>
    item.id === area
      ? {
          ...item,
          status: 'completed' as const,
        }
      : item
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedPlan)
  );

  Alert.alert(
    'Improvement Completed',
    `${areaLabels[area || ''] || 'This section'} has been marked as completed.`,
    [
      {
        text: 'OK',
        onPress: () =>
          router.replace(
            '/student/cv-improvement-plan'
          ),
      },
    ]
  );

} catch (error) {
  console.log(
    'Error updating CV improvement:',
    error
  );

  Alert.alert(
    'Error',
    'Unable to update your CV improvement plan.'
  );
}

};

const handleRetry = () => {
setRetrying(true);
generateSuggestions();
};

if (loading) {
return (
<View style={styles.loadingScreen}>
<View style={styles.aiIconLarge}>
<Text style={styles.aiIconText}>🤖</Text>
</View>

    <ActivityIndicator
      size="large"
      color="#7C3AED"
    />

    <Text style={styles.loadingTitle}>
      CareerForge AI is thinking...
    </Text>

    <Text style={styles.loadingText}>
      Analysing your profile and generating
      personalised CV suggestions.
    </Text>
  </View>
);

}

if (!data?.success) {
return (
<View style={styles.errorScreen}>
<Text style={styles.errorIcon}>⚠️</Text>

    <Text style={styles.errorTitle}>
      Unable to Generate Suggestions
    </Text>

    <Text style={styles.errorText}>
      {data?.message ||
        'Something went wrong while contacting CareerForge AI.'}
    </Text>

    <Pressable
      style={styles.retryButton}
      onPress={handleRetry}
      disabled={retrying}
    >
      {retrying ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.retryButtonText}>
          Try Again
        </Text>
      )}
    </Pressable>

    <Pressable
      style={styles.backButton}
      onPress={() => router.back()}
    >
      <Text style={styles.backButtonText}>
        ← Back
      </Text>
    </Pressable>
  </View>
);

}

return (
<View style={styles.screen}>
<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} >

    <Pressable
      style={styles.backButtonTop}
      onPress={() => router.back()}
    >
      <Text style={styles.backButtonTopText}>
        ← Back
      </Text>
    </Pressable>

    <View style={styles.header}>
      <View style={styles.aiIcon}>
        <Text style={styles.aiIconText}>
          🤖
        </Text>
      </View>

      <Text style={styles.title}>
        AI CV Suggestions
      </Text>

      <Text style={styles.subtitle}>
        Personalised advice for your{' '}
        {data.area_label ||
          areaLabels[area || ''] ||
          'CV'}.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        AI Recommendation
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          {data.recommendation}
        </Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Suggested Version
      </Text>

      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionText}>
          {data.suggested_version}
        </Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Why This Is Better
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          {data.why_better}
        </Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Actionable Tips
      </Text>

      <View style={styles.card}>
        {(data.actionable_tips || []).map(
          (tip, index) => (
            <View
              key={`${tip}-${index}`}
              style={styles.tipRow}
            >
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.tipText}>
                {tip}
              </Text>
            </View>
          )
        )}
      </View>
    </View>

    <Pressable
      style={styles.useButton}
      onPress={markAsCompleted}
    >
      <Text style={styles.useButtonText}>
        ✓ Use Suggestion
      </Text>
    </Pressable>

    <Pressable
      style={styles.tryAgainButton}
      onPress={handleRetry}
      disabled={retrying}
    >
      {retrying ? (
        <ActivityIndicator color="#7C3AED" />
      ) : (
        <Text style={styles.tryAgainText}>
          ↻ Generate Another Suggestion
        </Text>
      )}
    </Pressable>

    <View style={{ height: 30 }} />

  </ScrollView>
</View>

);
}

const styles = StyleSheet.create({
screen: {
flex: 1,
backgroundColor: '#F8F7FC',
},

container: {
padding: 20,
paddingTop: 55,
},

loadingScreen: {
flex: 1,
backgroundColor: '#F8F7FC',
alignItems: 'center',
justifyContent: 'center',
padding: 30,
},

aiIconLarge: {
width: 80,
height: 80,
borderRadius: 40,
backgroundColor: '#EDE9FE',
alignItems: 'center',
justifyContent: 'center',
marginBottom: 25,
},

aiIconText: {
fontSize: 34,
},

loadingTitle: {
fontSize: 20,
fontWeight: '700',
color: '#1F2937',
marginTop: 20,
textAlign: 'center',
},

loadingText: {
fontSize: 14,
color: '#6B7280',
textAlign: 'center',
lineHeight: 21,
marginTop: 10,
},

backButtonTop: {
marginBottom: 15,
},

backButtonTopText: {
color: '#7C3AED',
fontSize: 15,
fontWeight: '600',
},

header: {
alignItems: 'center',
marginBottom: 25,
},

aiIcon: {
width: 64,
height: 64,
borderRadius: 32,
backgroundColor: '#EDE9FE',
alignItems: 'center',
justifyContent: 'center',
marginBottom: 12,
},

title: {
fontSize: 25,
fontWeight: '800',
color: '#1F2937',
},

subtitle: {
fontSize: 14,
color: '#6B7280',
textAlign: 'center',
marginTop: 7,
lineHeight: 20,
},

section: {
marginBottom: 20,
},

sectionTitle: {
fontSize: 17,
fontWeight: '700',
color: '#1F2937',
marginBottom: 10,
},

card: {
backgroundColor: '#FFFFFF',
borderRadius: 16,
padding: 17,
borderWidth: 1,
borderColor: '#E5E7EB',
},

suggestionCard: {
backgroundColor: '#F5F3FF',
borderRadius: 16,
padding: 18,
borderWidth: 1,
borderColor: '#DDD6FE',
},

cardText: {
fontSize: 15,
color: '#4B5563',
lineHeight: 23,
},

suggestionText: {
fontSize: 15,
color: '#312E81',
lineHeight: 24,
fontWeight: '500',
},

tipRow: {
flexDirection: 'row',
alignItems: 'flex-start',
marginBottom: 14,
},

tipNumber: {
width: 28,
height: 28,
borderRadius: 14,
backgroundColor: '#EDE9FE',
alignItems: 'center',
justifyContent: 'center',
marginRight: 10,
},

tipNumberText: {
color: '#7C3AED',
fontWeight: '700',
},

tipText: {
flex: 1,
fontSize: 14,
color: '#4B5563',
lineHeight: 21,
},

useButton: {
backgroundColor: '#7C3AED',
paddingVertical: 16,
borderRadius: 15,
alignItems: 'center',
marginTop: 5,
},

useButtonText: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: '700',
},

tryAgainButton: {
backgroundColor: '#EDE9FE',
paddingVertical: 15,
borderRadius: 15,
alignItems: 'center',
marginTop: 12,
},

tryAgainText: {
color: '#7C3AED',
fontSize: 15,
fontWeight: '700',
},

errorScreen: {
flex: 1,
backgroundColor: '#F8F7FC',
alignItems: 'center',
justifyContent: 'center',
padding: 30,
},

errorIcon: {
fontSize: 42,
marginBottom: 15,
},

errorTitle: {
fontSize: 21,
fontWeight: '800',
color: '#1F2937',
textAlign: 'center',
},

errorText: {
fontSize: 14,
color: '#6B7280',
textAlign: 'center',
lineHeight: 21,
marginTop: 10,
marginBottom: 25,
},

retryButton: {
backgroundColor: '#7C3AED',
paddingVertical: 15,
paddingHorizontal: 35,
borderRadius: 14,
},

retryButtonText: {
color: '#FFFFFF',
fontSize: 15,
fontWeight: '700',
},

backButton: {
marginTop: 15,
paddingVertical: 12,
},

backButtonText: {
color: '#7C3AED',
fontSize: 15,
fontWeight: '600',
},
});