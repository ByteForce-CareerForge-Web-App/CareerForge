import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/api';

export default function TestAIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'No login token was found. Please log in again.'
        );
        setLoading(false);
        return;
      }

      console.log('Calling AI Analysis endpoint...');
      console.log(
        `${API_BASE_URL}/ai-analysis.php`
      );

      const response = await fetch(
        `${API_BASE_URL}/ai-analysis.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_role: 'Software Developer',
          }),
        }
      );

      const rawText = await response.text();

      console.log('HTTP Status:', response.status);
      console.log('Raw Response:', rawText);

      let data;

      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        setResult({
          success: false,
          message: 'Backend returned invalid JSON.',
          http_status: response.status,
          raw_response: rawText,
        });

        setLoading(false);
        return;
      }

      setResult({
        http_status: response.status,
        ...data,
      });

      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your login token is invalid or expired. Please log in again.'
        );
      } else if (data.success) {
        Alert.alert(
          'Success',
          'CareerForge AI analysis was generated successfully.'
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          data.message || 'The AI analysis could not be generated.'
        );
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);

      setResult({
        success: false,
        message:
          'Unable to connect to the CareerForge backend.',
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });

      Alert.alert(
        'Connection Error',
        'Could not connect to the CareerForge backend. Make sure XAMPP is running and your phone is connected to the same network as your computer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        CareerForge AI Analysis Test
      </Text>

      <Text style={styles.subtitle}>
        This temporary screen tests the central AI analysis
        endpoint using your current login session.
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={runAnalysis}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.buttonText}>
              Running Analysis...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>
            Run CareerForge AI Analysis
          </Text>
        )}
      </TouchableOpacity>

      {result && (
        <ScrollView
          style={styles.resultContainer}
          contentContainerStyle={styles.resultContent}
        >
          <Text style={styles.resultTitle}>
            Response
          </Text>

          <Text style={styles.status}>
            HTTP Status: {result.http_status ?? 'Unknown'}
          </Text>

          <Text
            style={[
              styles.success,
              {
                color: result.success
                  ? '#15803D'
                  : '#DC2626',
              },
            ]}
          >
            Success: {String(result.success)}
          </Text>

          {result.message && (
            <Text style={styles.message}>
              {result.message}
            </Text>
          )}

          {result.data ? (
            <>
              {result.data.employability && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Employability
                  </Text>

                  <Text style={styles.dataText}>
                    Score:{' '}
                    {result.data.employability.score}
                  </Text>

                  <Text style={styles.dataText}>
                    Level:{' '}
                    {result.data.employability.level}
                  </Text>

                  <Text style={styles.dataText}>
                    Assessment:{' '}
                    {
                      result.data.employability
                        .overall_assessment
                    }
                  </Text>
                </View>
              )}

              {result.data.skill_gap && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Skill Gap
                  </Text>

                  <Text style={styles.dataText}>
                    Existing Skills:{' '}
                    {(
                      result.data.skill_gap
                        .existing_skills || []
                    ).join(', ') || 'None'}
                  </Text>

                  <Text style={styles.dataText}>
                    Skills to Improve:{' '}
                    {(
                      result.data.skill_gap
                        .skills_to_improve || []
                    ).join(', ') || 'None'}
                  </Text>

                  <Text style={styles.dataText}>
                    Missing Skills:{' '}
                    {(
                      result.data.skill_gap
                        .missing_skills || []
                    ).join(', ') || 'None'}
                  </Text>
                </View>
              )}

              {result.data.career_paths && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Career Paths
                  </Text>

                  {result.data.career_paths.map(
                    (career: any, index: number) => (
                      <View
                        key={index}
                        style={styles.item}
                      >
                        <Text style={styles.itemTitle}>
                          {career.career}
                        </Text>

                        <Text style={styles.dataText}>
                          Readiness:{' '}
                          {career.readiness}
                        </Text>

                        <Text style={styles.dataText}>
                          Why it fits:{' '}
                          {career.why_it_fits}
                        </Text>

                        <Text style={styles.dataText}>
                          Next step:{' '}
                          {career.next_step}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

              {result.data.roadmap && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Roadmap
                  </Text>

                  {result.data.roadmap.map(
                    (step: any, index: number) => (
                      <View
                        key={index}
                        style={styles.item}
                      >
                        <Text style={styles.itemTitle}>
                          Step {step.step}: {step.title}
                        </Text>

                        <Text style={styles.dataText}>
                          {step.description}
                        </Text>

                        <Text style={styles.dataText}>
                          Priority:{' '}
                          {step.priority}
                        </Text>

                        <Text style={styles.dataText}>
                          Action:{' '}
                          {step.action}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

              {result.data.recommendations && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Recommendations
                  </Text>

                  {result.data.recommendations.map(
                    (recommendation: string, index: number) => (
                      <Text
                        key={index}
                        style={styles.bullet}
                      >
                        • {recommendation}
                      </Text>
                    )
                  )}
                </View>
              )}
            </>
          ) : null}

          {result.raw_response && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Raw Backend Response
              </Text>

              <Text style={styles.rawText}>
                {result.raw_response}
              </Text>
            </View>
          )}

          {result.error && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Error
              </Text>

              <Text style={styles.errorText}>
                {result.error}
              </Text>
            </View>
          )}

          <View style={styles.rawSection}>
            <Text style={styles.sectionTitle}>
              Complete JSON Response
            </Text>

            <Text style={styles.rawText}>
              {JSON.stringify(result, null, 2)}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FC',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F1B2D',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B6578',
    marginBottom: 25,
  },

  button: {
    backgroundColor: '#6C3FCB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  resultContainer: {
    flex: 1,
    marginTop: 25,
  },

  resultContent: {
    paddingBottom: 50,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F1B2D',
    marginBottom: 10,
  },

  status: {
    fontSize: 14,
    color: '#6B6578',
    marginBottom: 5,
  },

  success: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    color: '#393343',
    lineHeight: 22,
    marginBottom: 15,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E7E2F0',
  },

  rawSection: {
    backgroundColor: '#1F1B2D',
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C3FCB',
    marginBottom: 10,
  },

  item: {
    borderTopWidth: 1,
    borderTopColor: '#E7E2F0',
    paddingTop: 12,
    marginTop: 12,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1B2D',
    marginBottom: 6,
  },

  dataText: {
    fontSize: 14,
    color: '#4F495A',
    lineHeight: 21,
    marginBottom: 5,
  },

  bullet: {
    fontSize: 14,
    color: '#4F495A',
    lineHeight: 21,
    marginBottom: 7,
  },

  rawText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#DC2626',
  },
});

