import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Main Tab Navigators
import ParentTabNavigator from './ParentTabNavigator';
import CoachTabNavigator from './CoachTabNavigator';

export type RootStackParamList = {
  Login: undefined;
  SignUp: { role: 'parent' | 'coach' };
  RoleSelection: undefined;
  ParentTabs: undefined;
  CoachTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in
        user.role === 'parent' ? (
          <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
        ) : (
          <Stack.Screen name="CoachTabs" component={CoachTabNavigator} />
        )
      ) : (
        // User is not signed in
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
