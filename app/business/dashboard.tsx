import React, {
useCallback,
useState,
} from 'react';

import {
View,
Text,
StyleSheet,
Pressable,
ScrollView,
ActivityIndicator,
Alert,
} from 'react-native';

import {
router,
useFocusEffect,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../constants/api';

type RecentApplication = {
id: number;
opportunity_id: number;
candidate_name: string;
initials: string;
opportunity_title: string;
opportunity_type: string;
status: string;
applied_at: string;
};

type DashboardData = {
business: {
user_id: number;
business_profile_id: number;
name: string;
email: string;
company_name: string;
registration_number?: string | null;
industry?: string | null;
description?: string | null;
verification_status?: string | null;
};

stats: {
active_opportunities: number;
total_applications: number;
shortlisted: number;
interviews: number;
new_applications_this_week: number;
applications_needing_review: number;
};

ai_insight: {
available: boolean;
strong_matches: number;
potential_matches: number;
need_review: number;
top_recommendation: {
candidate_name?: string;
opportunity_title?: string;
match_percentage?: number;
} | null;
message?: string;
};

recent_applications: RecentApplication[];
};

export default function BusinessDashboard() {

const [
dashboard,
setDashboard,
] = useState<DashboardData | null>(null);

const [
loading,
setLoading,
] = useState(true);

const loadDashboard = async () => {

try {

  setLoading(true);

  const token =
    await AsyncStorage.getItem(
      'authToken'
    );


  if (!token) {

    router.replace('/login');

    return;
  }


  const response =
    await fetch(
      `${API_BASE_URL}/business/dashboard.php`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,

          Accept:
            'application/json',
        },
      }
    );


  const data =
    await response.json();


  console.log(
    'Business dashboard response:',
    data
  );


  if (response.status === 401) {

    await AsyncStorage.multiRemove([
      'authToken',
      'user',
    ]);

    Alert.alert(
      'Session Expired',
      'Please log in again.',
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/login'),
        },
      ]
    );

    return;
  }


  if (
    !response.ok ||
    !data.success
  ) {

    throw new Error(
      data.message ||
      'Unable to load business dashboard.'
    );
  }


  setDashboard(data);

} catch (error) {

  console.error(
    'Business dashboard error:',
    error
  );

  Alert.alert(
    'Dashboard Error',
    error instanceof Error
      ? error.message
      : 'Unable to load the business dashboard.'
  );

} finally {

  setLoading(false);
}

};

useFocusEffect(
useCallback(() => {

  loadDashboard();

}, [])

);

/*
Loading state
--------------------------------------------------------------------------
*/

if (loading && !dashboard) {

return (
  <View style={styles.loadingScreen}>

    <ActivityIndicator
      size="large"
      color="#2563EB"
    />

    <Text style={styles.loadingText}>
      Loading dashboard...
    </Text>

  </View>
);

}

/*
Safe fallback values
--------------------------------------------------------------------------
*/

const companyName =
dashboard?.business.company_name ||
'Business';

const companyInitials =
getInitials(companyName);

const stats = [
{
label: 'Active Opportunities',

  value: String(
    dashboard?.stats.active_opportunities ??
    0
  ),

  icon: '▣',
},

{
  label: 'Total Applications',

  value: String(
    dashboard?.stats.total_applications ??
    0
  ),

  icon: '▤',
},

{
  label: 'Shortlisted',

  value: String(
    dashboard?.stats.shortlisted ??
    0
  ),

  icon: '☆',
},

{
  label: 'Interviews',

  value: String(
    dashboard?.stats.interviews ??
    0
  ),

  icon: '□',
},

];

const recentApplications =
dashboard?.recent_applications ??
[];

const newApplicationsThisWeek =
dashboard?.stats
.new_applications_this_week ??
0;

const applicationsNeedingReview =
dashboard?.stats
.applications_needing_review ??
0;

const aiInsight =
dashboard?.ai_insight;

const aiAvailable =
aiInsight?.available === true;

const strongMatches =
aiInsight?.strong_matches ??
0;

const potentialMatches =
aiInsight?.potential_matches ??
0;

const needReview =
aiInsight?.need_review ??
0;

const topRecommendation =
aiInsight?.top_recommendation;

const openCompanyProfile = () => {

router.replace(
  '/business/company-profile'
);

};

const handleLogout = async () => {

try {

  await AsyncStorage.multiRemove([
    'authToken',
    'user',
  ]);

} catch (error) {

  console.error(
    'Logout error:',
    error
  );

} finally {

  router.replace('/login');
}

};

return (
<View style={styles.container}>

  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={
      styles.scrollContent
    }
  >

    {/* HEADER */}

    <View style={styles.header}>

      <View style={styles.headerTop}>

        {/* COMPANY PROFILE */}

        <Pressable
          style={styles.profileArea}
          onPress={
            openCompanyProfile
          }
          android_ripple={{
            color: '#1E40AF',
          }}
        >

          <View
            style={
              styles.companyAvatar
            }
          >

            <Text
              style={
                styles.avatarText
              }
            >
              {companyInitials}
            </Text>

          </View>


          <View
            style={
              styles.companyInfo
            }
          >

            <Text
              style={
                styles.greeting
              }
            >
              Good morning
            </Text>


            <Text
              style={
                styles.companyName
              }
            >
              {companyName}
            </Text>


            <Text
              style={
                styles.profileHint
              }
            >
              View company profile
            </Text>

          </View>

        </Pressable>


        {/* NOTIFICATIONS */}

        <Pressable
          style={
            styles.notificationButton
          }
          onPress={() =>
            router.push(
              '/business/notifications'
            )
          }
          hitSlop={10}
        >

          <Text
            style={
              styles.notificationIcon
            }
          >
            🔔
          </Text>

          <View
            style={
              styles.notificationDot
            }
          />

        </Pressable>

      </View>


      <Text
        style={
          styles.headerTitle
        }
      >
        Business Dashboard
      </Text>


      <Text
        style={
          styles.headerSubtitle
        }
      >
        {newApplicationsThisWeek}{' '}
        new applications this week.
      </Text>

    </View>


    <View style={styles.content}>

      {/* STATISTICS */}

      <View
        style={
          styles.statsGrid
        }
      >

        {stats.map((stat) => (

          <View
            style={
              styles.statCard
            }
            key={stat.label}
          >

            <View
              style={
                styles.statIcon
              }
            >

              <Text
                style={
                  styles.statIconText
                }
              >
                {stat.icon}
              </Text>

            </View>


            <Text
              style={
                styles.statValue
              }
            >
              {stat.value}
            </Text>


            <Text
              style={
                styles.statLabel
              }
            >
              {stat.label}
            </Text>

          </View>

        ))}

      </View>


      {/* AI HIRING INSIGHT */}

      <View style={styles.aiCard}>

        <View
          style={
            styles.aiHeader
          }
        >

          <View
            style={
              styles.aiIconContainer
            }
          >

            <Text
              style={
                styles.aiIcon
              }
            >
              AI
            </Text>

          </View>


          <View
            style={
              styles.aiHeaderText
            }
          >

            <Text
              style={
                styles.aiTitle
              }
            >
              AI Hiring Insight
            </Text>


            <Text
              style={
                styles.aiSubtitle
              }
            >
              Smart analysis of your applications
            </Text>

          </View>

        </View>


        {/* PENDING APPLICATIONS */}

        <View
          style={
            styles.pendingBanner
          }
        >

          <View
            style={
              styles.pendingContent
            }
          >

            <View
              style={
                styles.pendingIndicator
              }
            >

              <Text
                style={
                  styles.pendingIndicatorText
                }
              >
                !
              </Text>

            </View>


            <Text
              style={
                styles.pendingNumber
              }
            >
              {applicationsNeedingReview}
            </Text>


            <View
              style={
                styles.pendingCopy
              }
            >

              <Text
                style={
                  styles.pendingTitle
                }
              >
                Applications need review
              </Text>


              <Text
                style={
                  styles.pendingDescription
                }
              >
                These applications are waiting for
                your attention.
              </Text>

            </View>

          </View>

        </View>


        {/* AI ANALYSIS */}

        <Text
          style={
            styles.analysisTitle
          }
        >
          Candidate Analysis
        </Text>


        <View
          style={
            styles.insightStats
          }
        >

          <InsightStat
            value={
              String(strongMatches)
            }
            label="Strong Matches"
          />


          <InsightStat
            value={
              String(potentialMatches)
            }
            label="Potential Matches"
          />


          <InsightStat
            value={
              String(needReview)
            }
            label="Need Review"
          />

        </View>


        {/* TOP RECOMMENDATION */}

        <View
          style={
            styles.insightMessage
          }
        >

          <View
            style={
              styles.recommendationHeader
            }
          >

            <View
              style={
                styles.recommendationDot
              }
            />

            <Text
              style={
                styles.insightMessageTitle
              }
            >
              Top Recommendation
            </Text>

          </View>


          <Text
            style={
              styles.insightMessageText
            }
          >

            {aiAvailable &&
            topRecommendation
              ? `${topRecommendation.candidate_name || 'Candidate'} has a ${topRecommendation.match_percentage ?? 0}% match for the ${topRecommendation.opportunity_title || 'opportunity'}.`
              : 'AI candidate matching will appear here once candidate analysis is available.'}

          </Text>

        </View>


        <Pressable
          style={
            styles.aiButton
          }
          onPress={() =>
            router.push(
              '/business/candidates'
            )
          }
        >

          <Text
            style={
              styles.aiButtonText
            }
          >
            Review Candidates
          </Text>


          <Text
            style={
              styles.aiButtonArrow
            }
          >
            →
          </Text>

        </Pressable>

      </View>


      {/* QUICK ACTIONS */}

      <View style={styles.card}>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Quick Actions
        </Text>


        <View
          style={
            styles.actionsGrid
          }
        >

          <ActionButton
            icon="+"
            title="Post Opportunity"
            onPress={() =>
              router.push(
                '/business/post-opportunity'
              )
            }
          />


          <ActionButton
            icon="▣"
            title="Manage Jobs"
            onPress={() =>
              router.push(
                '/business/manage-opportunities'
              )
            }
          />


          <ActionButton
            icon="○"
            title="View Candidates"
            onPress={() =>
              router.push(
                '/business/candidates'
              )
            }
          />


          <ActionButton
            icon="▤"
            title="Applications"
            onPress={() =>
              router.push(
                '/business/applications'
              )
            }
          />

          <ActionButton
            icon="♧"
            title="Connections"
            onPress={() =>
              router.push(
                '/business/connections'
              )
            }
          />

        </View>

      </View>


      {/* RECENT APPLICATIONS */}

      <View style={styles.card}>

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent Applications
          </Text>


          <Pressable
            onPress={() =>
              router.push(
                '/business/applications'
              )
            }
          >

            <Text
              style={
                styles.seeAll
              }
            >
              See all
            </Text>

          </Pressable>

        </View>


        {recentApplications.length > 0 ? (

          recentApplications.map(
            (application) => (

              <CandidateRow
                key={
                  application.id
                }
                initials={
                  application.initials
                }
                name={
                  application.candidate_name
                }
                title={
                  application.opportunity_title
                }
                match=""
              />

            )
          )

        ) : (

          <Text
            style={
              styles.noApplicationsText
            }
          >
            No applications yet.
          </Text>

        )}

      </View>


      {/* LOGOUT */}

      <Pressable
        style={
          styles.logoutButton
        }
        onPress={
          handleLogout
        }
      >

        <Text
          style={
            styles.logoutIcon
          }
        >
          ↪
        </Text>


        <Text
          style={
            styles.logoutText
          }
        >
          Logout
        </Text>

      </Pressable>


      {/* EXTRA SPACE FOR BOTTOM NAV */}

      <View
        style={
          styles.bottomSpace
        }
      />

    </View>

  </ScrollView>


  {/* BOTTOM NAVIGATION */}

  <View
    style={
      styles.bottomNav
    }
  >

    {/* HOME */}

    <Pressable
      style={
        styles.navItem
      }
      onPress={() =>
        router.replace(
          '/business/dashboard'
        )
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
          ⌂
        </Text>

      </View>


      <Text
        style={[
          styles.navLabel,
          styles.navLabelActive,
        ]}
      >
        Home
      </Text>

    </Pressable>


    {/* MESSAGES */}

    <Pressable
      style={
        styles.navItem
      }
      onPress={() =>
        router.replace(
          '/business/messages'
        )
      }
    >

      <View
        style={
          styles.navIconContainer
        }
      >

        <Text
          style={
            styles.navIcon
          }
        >
          ◇
        </Text>

      </View>


      <Text
        style={
          styles.navLabel
        }
      >
        Messages
      </Text>

    </Pressable>


    {/* PROFILE */}

    <Pressable
      style={
        styles.navItem
      }
      onPress={
        openCompanyProfile
      }
    >

      <View
        style={
          styles.navIconContainer
        }
      >

        <Text
          style={
            styles.profileNavIcon
          }
        >
          {companyInitials}
        </Text>

      </View>


      <Text
        style={
          styles.navLabel
        }
      >
        Profile
      </Text>

    </Pressable>

  </View>

</View>

);
}

function getInitials(
name: string
) {

const cleanName =
name.trim();

if (!cleanName) {
return 'BU';
}

const parts =
cleanName.split(/\s+/);

if (parts.length >= 2) {

return (
  parts[0].charAt(0) +
  parts[parts.length - 1]
    .charAt(0)
).toUpperCase();

}

return cleanName
.substring(0, 2)
.toUpperCase();
}

function ActionButton({
icon,
title,
onPress,
}: {
icon: string;
title: string;
onPress: () => void;
}) {

return (
<Pressable
style={
styles.actionButton
}
onPress={onPress}
>

  <View
    style={
      styles.actionIconContainer
    }
  >

    <Text
      style={
        styles.actionIcon
      }
    >
      {icon}
    </Text>

  </View>


  <Text
    style={
      styles.actionText
    }
  >
    {title}
  </Text>

</Pressable>

);
}

function CandidateRow({
initials,
name,
title,
match,
}: {
initials: string;
name: string;
title: string;
match: string;
}) {

return (
<View
style={
styles.candidateRow
}
>

  <View
    style={
      styles.candidateAvatar
    }
  >

    <Text
      style={
        styles.candidateAvatarText
      }
    >
      {initials}
    </Text>

  </View>


  <View
    style={
      styles.candidateInfo
    }
  >

    <Text
      style={
        styles.candidateName
      }
    >
      {name}
    </Text>


    <Text
      style={
        styles.candidateTitle
      }
    >
      {title}
    </Text>

  </View>


  {match ? (

    <Text
      style={
        styles.match
      }
    >
      {match}
    </Text>

  ) : null}

</View>

);
}

function InsightStat({
value,
label,
}: {
value: string;
label: string;
}) {

return (
<View
style={
styles.insightStat
}
>

  <Text
    style={
      styles.insightStatValue
    }
  >
    {value}
  </Text>


  <Text
    style={
      styles.insightStatLabel
    }
  >
    {label}
  </Text>

</View>

);
}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor: '#F8FAFC',
},

scrollContent: {
paddingBottom: 25,
},

loadingScreen: {
flex: 1,
backgroundColor: '#F8FAFC',
justifyContent: 'center',
alignItems: 'center',
},

loadingText: {
marginTop: 12,
color: '#64748B',
fontSize: 14,
},

/* HEADER */

header: {
backgroundColor: '#0B1F3A',
paddingTop: 55,
paddingHorizontal: 20,
paddingBottom: 30,
},

headerTop: {
flexDirection: 'row',
alignItems: 'center',
},

profileArea: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 8,
paddingRight: 14,
borderRadius: 14,
minHeight: 62,
overflow: 'hidden',
},

companyAvatar: {
width: 46,
height: 46,
borderRadius: 14,
backgroundColor: '#2563EB',
justifyContent: 'center',
alignItems: 'center',
},

avatarText: {
color: '#FFFFFF',
fontWeight: '800',
fontSize: 14,
},

companyInfo: {
marginLeft: 12,
flex: 1,
},

greeting: {
color: '#CBD5E1',
fontSize: 12,
},

companyName: {
color: '#FFFFFF',
fontWeight: '700',
fontSize: 14,
marginTop: 2,
},

profileHint: {
color: '#93C5FD',
fontSize: 10,
marginTop: 3,
fontWeight: '600',
},

/* NOTIFICATIONS */

notificationButton: {
width: 42,
height: 42,
borderRadius: 21,
backgroundColor: '#172B4D',
justifyContent: 'center',
alignItems: 'center',
position: 'relative',
},

notificationIcon: {
fontSize: 21,
},

notificationDot: {
position: 'absolute',
right: 7,
top: 7,
width: 8,
height: 8,
borderRadius: 4,
backgroundColor: '#EF4444',
},

headerTitle: {
color: '#FFFFFF',
fontSize: 25,
fontWeight: '800',
marginTop: 25,
},

headerSubtitle: {
color: '#BFDBFE',
fontSize: 14,
marginTop: 6,
},

/* CONTENT */

content: {
padding: 20,
marginTop: -10,
},

/* STATISTICS */

statsGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
},

statCard: {
width: '48%',
backgroundColor: '#FFFFFF',
borderRadius: 17,
padding: 16,
marginBottom: 12,
borderWidth: 1,
borderColor: '#E2E8F0',
},

statIcon: {
width: 40,
height: 40,
borderRadius: 12,
backgroundColor: '#EFF6FF',
justifyContent: 'center',
alignItems: 'center',
marginBottom: 10,
},

statIconText: {
fontSize: 20,
color: '#2563EB',
fontWeight: '800',
},

statValue: {
fontSize: 25,
fontWeight: '800',
color: '#0F172A',
},

statLabel: {
fontSize: 12,
color: '#64748B',
marginTop: 3,
},

/* GENERAL CARD */

card: {
backgroundColor: '#FFFFFF',
borderRadius: 17,
padding: 17,
marginBottom: 15,
borderWidth: 1,
borderColor: '#E2E8F0',
},

sectionTitle: {
fontSize: 16,
fontWeight: '800',
color: '#0F172A',
marginBottom: 13,
},

/* AI HIRING INSIGHT */

aiCard: {
backgroundColor: '#FFFFFF',
borderRadius: 18,
padding: 18,
marginBottom: 15,
borderWidth: 1,
borderColor: '#BFDBFE',
},

aiHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 17,
},

aiIconContainer: {
width: 44,
height: 44,
borderRadius: 13,
backgroundColor: '#0B1F3A',
justifyContent: 'center',
alignItems: 'center',
},

aiIcon: {
color: '#FFFFFF',
fontSize: 13,
fontWeight: '900',
},

aiHeaderText: {
marginLeft: 11,
flex: 1,
},

aiTitle: {
color: '#0F172A',
fontSize: 17,
fontWeight: '800',
},

aiSubtitle: {
color: '#64748B',
fontSize: 12,
marginTop: 3,
},

pendingBanner: {
backgroundColor: '#FFF7ED',
borderRadius: 14,
padding: 14,
marginBottom: 17,
},

pendingContent: {
flexDirection: 'row',
alignItems: 'center',
},

pendingIndicator: {
width: 34,
height: 34,
borderRadius: 17,
backgroundColor: '#F97316',
justifyContent: 'center',
alignItems: 'center',
marginRight: 11,
},

pendingIndicatorText: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '900',
},

pendingNumber: {
fontSize: 23,
fontWeight: '900',
color: '#C2410C',
},

pendingCopy: {
flex: 1,
marginLeft: 7,
},

pendingTitle: {
color: '#7C2D12',
fontSize: 13,
fontWeight: '800',
},

pendingDescription: {
color: '#9A3412',
fontSize: 11,
marginTop: 2,
},

analysisTitle: {
fontSize: 13,
color: '#334155',
fontWeight: '800',
marginBottom: 9,
},

insightStats: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 15,
},

insightStat: {
width: '31%',
backgroundColor: '#F8FAFC',
borderRadius: 12,
paddingVertical: 12,
paddingHorizontal: 5,
alignItems: 'center',
borderWidth: 1,
borderColor: '#E2E8F0',
},

insightStatValue: {
fontSize: 20,
fontWeight: '900',
color: '#0B1F3A',
},

insightStatLabel: {
fontSize: 10,
color: '#64748B',
textAlign: 'center',
marginTop: 3,
},

insightMessage: {
backgroundColor: '#F8FAFC',
borderRadius: 12,
padding: 13,
marginBottom: 13,
borderWidth: 1,
borderColor: '#E2E8F0',
},

recommendationHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 5,
},

recommendationDot: {
width: 7,
height: 7,
borderRadius: 4,
backgroundColor: '#2563EB',
marginRight: 7,
},

insightMessageTitle: {
fontSize: 12,
color: '#334155',
fontWeight: '800',
},

insightMessageText: {
fontSize: 12,
lineHeight: 18,
color: '#475569',
},

aiButton: {
backgroundColor: '#0B1F3A',
paddingHorizontal: 16,
paddingVertical: 12,
borderRadius: 11,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
alignSelf: 'stretch',
},

aiButtonText: {
color: '#FFFFFF',
fontWeight: '800',
fontSize: 13,
},

aiButtonArrow: {
color: '#FFFFFF',
fontSize: 17,
marginLeft: 8,
},

/* QUICK ACTIONS */

actionsGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
},

actionButton: {
width: '48%',
backgroundColor: '#F8FAFC',
borderRadius: 13,
padding: 13,
marginBottom: 9,
flexDirection: 'row',
alignItems: 'center',
borderWidth: 1,
borderColor: '#E2E8F0',
},

actionIconContainer: {
width: 32,
height: 32,
borderRadius: 9,
backgroundColor: '#EFF6FF',
justifyContent: 'center',
alignItems: 'center',
marginRight: 8,
},

actionIcon: {
fontSize: 17,
color: '#2563EB',
fontWeight: '800',
},

actionText: {
fontSize: 12,
color: '#334155',
fontWeight: '700',
flex: 1,
},

/* RECENT APPLICATIONS */

sectionHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},

seeAll: {
color: '#2563EB',
fontWeight: '700',
fontSize: 13,
},

candidateRow: {
flexDirection: 'row',
alignItems: 'center',
marginTop: 14,
},

candidateAvatar: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: '#0B1F3A',
justifyContent: 'center',
alignItems: 'center',
marginRight: 10,
},

candidateAvatarText: {
color: '#FFFFFF',
fontSize: 12,
fontWeight: '800',
},

candidateInfo: {
flex: 1,
},

candidateName: {
fontWeight: '700',
color: '#0F172A',
fontSize: 14,
},

candidateTitle: {
color: '#94A3B8',
fontSize: 12,
marginTop: 2,
},

match: {
color: '#047857',
backgroundColor: '#ECFDF5',
paddingHorizontal: 8,
paddingVertical: 5,
borderRadius: 9,
fontSize: 12,
fontWeight: '800',
},

noApplicationsText: {
color: '#64748B',
fontSize: 13,
marginTop: 5,
},

/* LOGOUT */

logoutButton: {
height: 50,
borderRadius: 13,
borderWidth: 1,
borderColor: '#CBD5E1',
backgroundColor: '#FFFFFF',
justifyContent: 'center',
alignItems: 'center',
flexDirection: 'row',
marginBottom: 15,
},

logoutIcon: {
fontSize: 17,
marginRight: 7,
color: '#0B1F3A',
},

logoutText: {
color: '#0B1F3A',
fontSize: 15,
fontWeight: '700',
},

bottomSpace: {
height: 90,
},

/* BOTTOM NAVIGATION */

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