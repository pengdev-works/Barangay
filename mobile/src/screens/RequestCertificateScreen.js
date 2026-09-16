import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import client from '../api/client';

const CERT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'Business Clearance',
  'Barangay Permit'
];

export default function RequestCertificateScreen({ navigation }) {
  const [certType, setCertType] = useState('Barangay Clearance');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!purpose.trim()) {
      Alert.alert('Missing Field', 'Please provide the purpose of your request.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.post('/certificates', {
        certificate_type: certType,
        purpose: purpose.trim(),
        amount: 50,
      });
      if (res.data.success) {
        Alert.alert(
          'Request Submitted!',
          'Your certificate request has been created successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Apply for Certificate</Text>
        <Text style={styles.subtitle}>Select document type and state application details</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Certificate Type</Text>
          <View style={styles.optionsGrid}>
            {CERT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typePill, certType === type && styles.typePillActive]}
                onPress={() => setCertType(type)}
              >
                <Text style={[styles.typePillText, certType === type && styles.typePillTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Purpose / Details *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. For Employment / School Registration"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={purpose}
            onChangeText={setPurpose}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Certificate Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  optionsGrid: {
    gap: 8,
    marginBottom: 20,
  },
  typePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typePillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  typePillText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  typePillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
