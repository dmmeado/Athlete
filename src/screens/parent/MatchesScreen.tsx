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
import { ParentMatchesStackParamList } from '../../navigation/ParentTabNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Match, Team, Player } from '../../types';
import { getPlayersByParent } from '../../services/playerService';
import { getMatchesForPlayer } from '../../services/matchingService';
import { getTeamById } from '../../services/teamService';
import { COLORS, POSITIONS } from '../../config/constants';

type MatchesScreenProps = {
  navigation: NativeStackNavigationProp<ParentMatchesStackParamList, 'MatchesList'>;
};

interface MatchWithDetails extends Match {
  team?: Team;
  player?: Player;
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const players = await getPlayersByParent(user.id);
      const allMatches: MatchWithDetails[] = [];

      for (const player of players) {
        const playerMatches = await getMatchesForPlayer(player.id);

        for (const match of playerMatches) {
          const team = await getTeamById(match.teamId);
          allMatches.push({
            ...match,
            team: team || undefined,
            player,
          });
        }
      }

      // Sort by score
      allMatches.sort((a, b) => b.score - a.score);
      setMatches(allMatches);
    } catch (error) {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.text.secondary;
  };

  const renderMatch = ({ item }: { item: MatchWithDetails }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('TeamDetail', { teamId: item.teamId })}
    >
      <View style={styles.matchHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.team?.name || 'Unknown Team'}</Text>
          <Text style={styles.teamDetails}>
            {item.team?.ageGroup} • {item.team?.location.city}, {item.team?.location.state}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(item.score)}20` }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
            {item.score}%
          </Text>
        </View>
      </View>

      <View style={styles.playerInfo}>
        <Ionicons name="person" size={14} color={COLORS.text.secondary} />
        <Text style={styles.playerName}>
          {item.player?.firstName} {item.player?.lastName}
        </Text>
      </View>

      <View style={styles.matchFactors}>
        {item.matchedOn.position && (
          <View style={styles.factor}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.factorText}>Position</Text>
          </View>
        )}
        {item.matchedOn.ageGroup && (
          <View style={styles.factor}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.factorText}>Age Group</Text>
          </View>
        )}
        {item.matchedOn.location && (
          <View style={styles.factor}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.factorText}>Location</Text>
          </View>
        )}
        {item.matchedOn.availability && (
          <View style={styles.factor}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.factorText}>Availability</Text>
          </View>
        )}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>
          Status: <Text style={styles.statusValue}>{item.status}</Text>
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerStyle={matches.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="baseball-outline" size={64} color={COLORS.text.light} />
              <Text style={styles.emptyTitle}>No Matches Yet</Text>
              <Text style={styles.emptyText}>
                Complete your player profiles and add availability to get matched with teams
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  matchCard: {
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  teamDetails: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  matchFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  factorText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statusValue: {
    textTransform: 'capitalize',
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
    lineHeight: 20,
  },
});
