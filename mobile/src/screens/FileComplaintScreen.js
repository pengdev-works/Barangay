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

const CATEGORIES = [
  'Noise Disturbance',
  'Garbage Disposal',
  'Illegal Structures',
  'Domestic Violence',
  'Theft',
  'Physical Injury',
  'Other'
];

export default function FileComplaintScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Noise Disturbance');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please provide a title and detailed description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.post('/complaints', {
        title: title.trim(),
        category,
        location: location.trim() || 'Barangay La Paz',
        description: description.trim(),
      });
      if (res.data.success) {
        Alert.alert(
          'Complaint Filed',
          'Your incident report has been submitted to Barangay Officials for investigation.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>File Community Complaint</Text>
        <Text style={styles.subtitle}>Report incident disputes directly to Barangay Officials</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Incident Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Excessive Late Night Noise"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, category === cat && styles.catPillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Incident Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Purok 3, Near Chapel"
            placeholderTextColor="#94a3b8"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Detailed Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened, date/time, and parties involved..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Complaint Report</Text>
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
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  catPillActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#fbbf24',
  },
  catPillText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  catPillTextActive: {
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
    backgroundColor: '#ef4444',
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
