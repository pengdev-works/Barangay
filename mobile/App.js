import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RequestCertificateScreen from './src/screens/RequestCertificateScreen';
import FileComplaintScreen from './src/screens/FileComplaintScreen';
import TrackStatusScreen from './src/screens/TrackStatusScreen';
import DigitalIdScreen from './src/screens/DigitalIdScreen';

const Stack = createStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Brgy. La Paz Mobile' }}
            />
            <Stack.Screen
              name="RequestCertificate"
              component={RequestCertificateScreen}
              options={{ title: 'E-Clearance & Certificates' }}
            />
            <Stack.Screen
              name="FileComplaint"
              component={FileComplaintScreen}
              options={{ title: 'Report Community Dispute' }}
            />
            <Stack.Screen
              name="TrackStatus"
              component={TrackStatusScreen}
              options={{ title: 'My Requests & Disputes' }}
            />
            <Stack.Screen
              name="DigitalId"
              component={DigitalIdScreen}
              options={{ title: 'Barangay Resident ID' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justify.content: 'center',
  },
});
