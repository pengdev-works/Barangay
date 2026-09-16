import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DigitalIdScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Digital Barangay ID</Text>
        <Text style={styles.subtitle}>Official Digital Resident Identification Card</Text>

        {/* Digital ID Card Container */}
        <View style={styles.idCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.headerTitle}>REPUBLIC OF THE PHILIPPINES</Text>
            <Text style={styles.headerSub}>BARANGAY POBLACION CENTRAL / LA PAZ</Text>
            <Text style={styles.headerBadge}>RESIDENT IDENTIFICATION CARD</Text>
          </View>

          {/* Resident Details */}
          <View style={styles.cardBody}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.nameLabel}>FULL NAME</Text>
              <Text style={styles.nameText}>
                {user ? `${user.first_name} ${user.last_name}`.toUpperCase() : 'RESIDENT NAME'}
              </Text>

              <Text style={styles.metaLabel}>ROLE / CIVIL STATUS</Text>
              <Text style={styles.metaText}>{user?.role || 'Resident'} • Active</Text>

              <Text style={styles.metaLabel}>EMAIL</Text>
              <Text style={styles.metaText}>{user?.email || 'N/A'}</Text>
            </View>
          </View>

          {/* QR Code Placeholder */}
          <View style={styles.qrSection}>
            <Text style={styles.qrCodeText}>[ OFFICIAL VERIFICATION QR CODE ]</Text>
            <Text style={styles.qrSub}>Scan for digital verification</Text>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>ID Ref: {user?.id || 'BRGY-2026-001'}</Text>
            <Text style={styles.footerStatus}>● VERIFIED</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 24,
  },
  idCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    padding: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 2,
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 36,
  },
  infoBox: {
    flex: 1,
  },
  nameLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  qrSection: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 8,
  },
  qrCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  qrSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
  },
});
