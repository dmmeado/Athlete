import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CoachTeamStackParamList } from '../../navigation/CoachTabNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Team } from '../../types';
import { getTeamsByCoach } from '../../services/teamService';
import { COLORS, AGE_GROUPS } from '../../config/constants';

type TeamDashboardScreenProps = {
  navigation: NativeStackNavigationProp<CoachTeamStackParamList, 'TeamDashboard'>;
};

export default function TeamDashboardScreen({ navigation }: TeamDashboardScreenProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTeams = async () => {
    if (!user) return;

    try {
      const teamList = await getTeamsByCoach(user.id);
      setTeams(teamList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTeams();
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate('TeamProfile', { teamId: item.id })}
    >
      <View style={styles.teamLogo}>
        <Ionicons name="people" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDetails}>
          {item.ageGroup} • {item.location.city}, {item.location.state}
        </Text>
        <View style={styles.needsBadge}>
          <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
          <Text style={styles.needsText}>
            {item.playerNeeds.length} player {item.playerNeeds.length === 1 ? 'need' : 'needs'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.text.light} />
      <Text style={styles.emptyTitle}>No Teams Yet</Text>
      <Text style={styles.emptyText}>
        Create your first team profile to start finding players
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('EditTeam', {})}
      >
        <Ionicons name="add" size={24} color={COLORS.text.inverse} />
        <Text style={styles.addButtonText}>Add Team</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeam}
        contentContainerStyle={teams.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {teams.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('EditTeam', {})}
        >
          <Ionicons name="add" size={28} color={COLORS.text.inverse} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  teamDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  needsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  needsText: {
    fontSize: 12,
    color: COLORS.warning,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
