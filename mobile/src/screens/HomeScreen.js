import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublicAnnouncements = async () => {
    try {
      const res = await client.get('/announcements/public');
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching announcements', err);
    }
  };

  useEffect(() => {
    fetchPublicAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPublicAnnouncements();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.welcomeTitle}>Mabuhay, {user?.first_name || 'Resident'}! 👋</Text>
            <Text style={styles.welcomeSubtitle}>Brgy. La Paz • {user?.role || 'Resident'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Grid - 4 Actions Matching Web */}
        <Text style={styles.sectionHeader}>Barangay E-Services</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RequestCertificate')}
          >
            <Text style={styles.cardIcon}>📜</Text>
            <Text style={styles.cardTitle}>E-Clearance</Text>
            <Text style={styles.cardSub}>Request Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('FileComplaint')}
          >
            <Text style={styles.cardIcon}>⚠️</Text>
            <Text style={styles.cardTitle}>Report Dispute</Text>
            <Text style={styles.cardSub}>File Complaint</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TrackStatus')}
          >
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Track Requests</Text>
            <Text style={styles.cardSub}>Live Status Updates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DigitalId')}
          >
            <Text style={styles.cardIcon}>🆔</Text>
            <Text style={styles.cardTitle}>Digital ID</Text>
            <Text style={styles.cardSub}>Barangay ID Card</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Hotlines Card */}
        <View style={styles.hotlineCard}>
          <Text style={styles.hotlineTitle}>📞 24/7 Emergency Hotlines</Text>
          <Text style={styles.hotlineItem}>• Barangay Tanod: 0917-555-0199</Text>
          <Text style={styles.hotlineItem}>• Rural Health Unit (RHU): 0998-555-0122</Text>
          <Text style={styles.hotlineItem}>• MDRRMO Disaster Rescue: 0922-555-0144</Text>
          <Text style={styles.hotlineItem}>• Municipal Police Station: 0918-555-0177</Text>
        </View>

        {/* Community Bulletins */}
        <Text style={styles.sectionHeader}>Public Advisories & Bulletins</Text>
        {announcements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No active public announcements</Text>
          </View>
        ) : (
          announcements.map((item) => (
            <View key={item.id} style={styles.bulletinCard}>
              <View style={styles.bulletinBadge}>
                <Text style={styles.bulletinBadgeText}>{item.category || 'General'}</Text>
              </View>
              <Text style={styles.bulletinTitle}>{item.title}</Text>
              <Text style={styles.bulletinContent} numberOfLines={3}>{item.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#38bdf8',
    marginTop: 2,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  hotlineCard: {
    backgroundColor: '#0284c7',
    borderRadius: 20,
    padding: 16,
    marginVertical: 14,
  },
  hotlineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  hotlineItem: {
    fontSize: 12,
    color: '#f0f9ff',
    marginVertical: 2,
    fontWeight: '500',
  },
  bulletinCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bulletinBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#38bdf820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  bulletinBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  bulletinTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  bulletinContent: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
