import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

// Parent Screens
import PlayerDashboardScreen from '../screens/parent/PlayerDashboardScreen';
import PlayerProfileScreen from '../screens/parent/PlayerProfileScreen';
import EditPlayerScreen from '../screens/parent/EditPlayerScreen';
import AvailabilityScreen from '../screens/parent/AvailabilityScreen';
import VideosScreen from '../screens/parent/VideosScreen';
import MatchesScreen from '../screens/parent/MatchesScreen';
import TeamDetailScreen from '../screens/shared/TeamDetailScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ConversationScreen from '../screens/shared/ConversationScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

export type ParentStackParamList = {
  PlayerDashboard: undefined;
  PlayerProfile: { playerId: string };
  EditPlayer: { playerId?: string };
  Availability: { playerId: string };
  Videos: { playerId: string };
  TeamDetail: { teamId: string };
};

export type ParentMatchesStackParamList = {
  MatchesList: undefined;
  TeamDetail: { teamId: string };
};

export type ParentMessagesStackParamList = {
  MessagesList: undefined;
  Conversation: { conversationId: string };
};

export type ParentSettingsStackParamList = {
  SettingsMain: undefined;
};

const Tab = createBottomTabNavigator();
const PlayerStack = createNativeStackNavigator<ParentStackParamList>();
const MatchesStack = createNativeStackNavigator<ParentMatchesStackParamList>();
const MessagesStack = createNativeStackNavigator<ParentMessagesStackParamList>();
const SettingsStack = createNativeStackNavigator<ParentSettingsStackParamList>();

function PlayerStackNavigator() {
  return (
    <PlayerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <PlayerStack.Screen
        name="PlayerDashboard"
        component={PlayerDashboardScreen}
        options={{ title: 'My Players' }}
      />
      <PlayerStack.Screen
        name="PlayerProfile"
        component={PlayerProfileScreen}
        options={{ title: 'Player Profile' }}
      />
      <PlayerStack.Screen
        name="EditPlayer"
        component={EditPlayerScreen}
        options={{ title: 'Edit Player' }}
      />
      <PlayerStack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{ title: 'Availability' }}
      />
      <PlayerStack.Screen
        name="Videos"
        component={VideosScreen}
        options={{ title: 'Highlight Videos' }}
      />
      <PlayerStack.Screen
        name="TeamDetail"
        component={TeamDetailScreen}
        options={{ title: 'Team Details' }}
      />
    </PlayerStack.Navigator>
  );
}

function MatchesStackNavigator() {
  return (
    <MatchesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <MatchesStack.Screen
        name="MatchesList"
        component={MatchesScreen}
        options={{ title: 'Team Matches' }}
      />
      <MatchesStack.Screen
        name="TeamDetail"
        component={TeamDetailScreen}
        options={{ title: 'Team Details' }}
      />
    </MatchesStack.Navigator>
  );
}

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <MessagesStack.Screen
        name="MessagesList"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <MessagesStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ title: 'Chat' }}
      />
    </MessagesStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
}

export default function ParentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Players':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Matches':
              iconName = focused ? 'baseball' : 'baseball-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Players" component={PlayerStackNavigator} />
      <Tab.Screen name="Matches" component={MatchesStackNavigator} />
      <Tab.Screen name="Messages" component={MessagesStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}
