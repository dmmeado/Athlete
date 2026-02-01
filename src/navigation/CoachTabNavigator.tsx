import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

// Coach Screens
import TeamDashboardScreen from '../screens/coach/TeamDashboardScreen';
import TeamProfileScreen from '../screens/coach/TeamProfileScreen';
import EditTeamScreen from '../screens/coach/EditTeamScreen';
import PlayerNeedsScreen from '../screens/coach/PlayerNeedsScreen';
import PlayerSearchScreen from '../screens/coach/PlayerSearchScreen';
import PlayerDetailScreen from '../screens/shared/PlayerDetailScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ConversationScreen from '../screens/shared/ConversationScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

export type CoachTeamStackParamList = {
  TeamDashboard: undefined;
  TeamProfile: { teamId: string };
  EditTeam: { teamId?: string };
  PlayerNeeds: { teamId: string };
};

export type CoachSearchStackParamList = {
  PlayerSearch: undefined;
  PlayerDetail: { playerId: string };
};

export type CoachMessagesStackParamList = {
  MessagesList: undefined;
  Conversation: { conversationId: string };
};

export type CoachSettingsStackParamList = {
  SettingsMain: undefined;
};

const Tab = createBottomTabNavigator();
const TeamStack = createNativeStackNavigator<CoachTeamStackParamList>();
const SearchStack = createNativeStackNavigator<CoachSearchStackParamList>();
const MessagesStack = createNativeStackNavigator<CoachMessagesStackParamList>();
const SettingsStack = createNativeStackNavigator<CoachSettingsStackParamList>();

function TeamStackNavigator() {
  return (
    <TeamStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <TeamStack.Screen
        name="TeamDashboard"
        component={TeamDashboardScreen}
        options={{ title: 'My Teams' }}
      />
      <TeamStack.Screen
        name="TeamProfile"
        component={TeamProfileScreen}
        options={{ title: 'Team Profile' }}
      />
      <TeamStack.Screen
        name="EditTeam"
        component={EditTeamScreen}
        options={{ title: 'Edit Team' }}
      />
      <TeamStack.Screen
        name="PlayerNeeds"
        component={PlayerNeedsScreen}
        options={{ title: 'Player Needs' }}
      />
    </TeamStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <SearchStack.Screen
        name="PlayerSearch"
        component={PlayerSearchScreen}
        options={{ title: 'Find Players' }}
      />
      <SearchStack.Screen
        name="PlayerDetail"
        component={PlayerDetailScreen}
        options={{ title: 'Player Profile' }}
      />
    </SearchStack.Navigator>
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

export default function CoachTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Team':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
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
      <Tab.Screen name="Team" component={TeamStackNavigator} />
      <Tab.Screen name="Search" component={SearchStackNavigator} />
      <Tab.Screen name="Messages" component={MessagesStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}
