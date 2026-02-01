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
import { ParentStackParamList } from '../../navigation/ParentTabNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Player } from '../../types';
import { getPlayersByParent } from '../../services/playerService';
import { COLORS, POSITIONS, AGE_GROUPS } from '../../config/constants';

type PlayerDashboardScreenProps = {
  navigation: NativeStackNavigationProp<ParentStackParamList, 'PlayerDashboard'>;
};

export default function PlayerDashboardScreen({ navigation }: PlayerDashboardScreenProps) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlayers = async () => {
    if (!user) return;

    try {
      const playerList = await getPlayersByParent(user.id);
      setPlayers(playerList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPlayers();
  };

  const getPositionLabel = (position: string) => {
    return POSITIONS.find((p) => p.value === position)?.label || position;
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerProfile', { playerId: item.id })}
    >
      <View style={styles.playerAvatar}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}{item.lastName[0]}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.playerDetails}>
          {item.ageGroup} • {getPositionLabel(item.primaryPosition)}
        </Text>
        <Text style={styles.playerLocation}>
          {item.location.city}, {item.location.state}
        </Text>
      </View>
      <View style={styles.availabilityBadge}>
        <Text style={styles.availabilityText}>
          {item.availability.length} windows
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="person-add-outline" size={64} color={COLORS.text.light} />
      <Text style={styles.emptyTitle}>No Players Yet</Text>
      <Text style={styles.emptyText}>
        Add your first player profile to start connecting with travel teams
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('EditPlayer', {})}
      >
        <Ionicons name="add" size={24} color={COLORS.text.inverse} />
        <Text style={styles.addButtonText}>Add Player</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={players.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {players.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('EditPlayer', {})}
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
  playerCard: {
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
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  playerDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  playerLocation: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  availabilityBadge: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
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
