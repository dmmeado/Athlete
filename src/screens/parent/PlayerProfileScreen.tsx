import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ParentStackParamList } from '../../navigation/ParentTabNavigator';
import { Player } from '../../types';
import { getPlayerById, deletePlayer } from '../../services/playerService';
import { COLORS, POSITIONS, AVAILABILITY_TYPES } from '../../config/constants';

type PlayerProfileScreenProps = {
  navigation: NativeStackNavigationProp<ParentStackParamList, 'PlayerProfile'>;
  route: RouteProp<ParentStackParamList, 'PlayerProfile'>;
};

export default function PlayerProfileScreen({ navigation, route }: PlayerProfileScreenProps) {
  const { playerId } = route.params;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      const playerData = await getPlayerById(playerId);
      setPlayer(playerData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load player profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Player',
      'Are you sure you want to delete this player profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(playerId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete player');
            }
          },
        },
      ]
    );
  };

  const getPositionLabel = (position: string) => {
    return POSITIONS.find((p) => p.value === position)?.label || position;
  };

  const getAvailabilityLabel = (type: string) => {
    return AVAILABILITY_TYPES.find((a) => a.value === type)?.label || type;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Player not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {player.firstName[0]}{player.lastName[0]}
          </Text>
        </View>
        <Text style={styles.playerName}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.ageGroup}>{player.ageGroup}</Text>
        <Text style={styles.location}>
          {player.location.city}, {player.location.state}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditPlayer', { playerId })}
        >
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Availability', { playerId })}
        >
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Availability</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Videos', { playerId })}
        >
          <Ionicons name="videocam" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Videos</Text>
        </TouchableOpacity>
      </View>

      {/* Positions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Positions</Text>
        <View style={styles.positionContainer}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {getPositionLabel(player.primaryPosition)}
            </Text>
            <Text style={styles.primaryLabel}>Primary</Text>
          </View>
          {player.secondaryPositions.map((pos) => (
            <View key={pos} style={[styles.positionBadge, styles.secondaryBadge]}>
              <Text style={styles.secondaryPositionText}>
                {getPositionLabel(pos)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      {Object.keys(player.stats).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            {player.stats.battingAverage && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {player.stats.battingAverage.toFixed(3)}
                </Text>
                <Text style={styles.statLabel}>AVG</Text>
              </View>
            )}
            {player.stats.homeRuns !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.stats.homeRuns}</Text>
                <Text style={styles.statLabel}>HR</Text>
              </View>
            )}
            {player.stats.rbi !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.stats.rbi}</Text>
                <Text style={styles.statLabel}>RBI</Text>
              </View>
            )}
            {player.stats.stolenBases !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.stats.stolenBases}</Text>
                <Text style={styles.statLabel}>SB</Text>
              </View>
            )}
            {player.stats.era !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {player.stats.era.toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>ERA</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Availability Windows */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        {player.availability.length > 0 ? (
          player.availability.map((window) => (
            <View key={window.id} style={styles.availabilityCard}>
              <View style={styles.availabilityHeader}>
                <Text style={styles.availabilityType}>
                  {getAvailabilityLabel(window.type)}
                </Text>
              </View>
              <Text style={styles.availabilityDates}>
                {format(window.startDate, 'MMM d, yyyy')} -{' '}
                {format(window.endDate, 'MMM d, yyyy')}
              </Text>
              {window.notes && (
                <Text style={styles.availabilityNotes}>{window.notes}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No availability windows set</Text>
        )}
      </View>

      {/* Team History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        {player.currentTeam && (
          <View style={styles.teamItem}>
            <Ionicons name="baseball" size={20} color={COLORS.primary} />
            <Text style={styles.teamName}>{player.currentTeam}</Text>
            <Text style={styles.currentBadge}>Current</Text>
          </View>
        )}
        {player.pastTeams.map((team, index) => (
          <View key={index} style={styles.teamItem}>
            <Ionicons name="baseball-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.pastTeamName}>{team}</Text>
          </View>
        ))}
        {!player.currentTeam && player.pastTeams.length === 0 && (
          <Text style={styles.emptyText}>No team history</Text>
        )}
      </View>

      {/* Bio */}
      {player.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{player.bio}</Text>
        </View>
      )}

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        <Text style={styles.deleteText}>Delete Player Profile</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: 4,
  },
  ageGroup: {
    fontSize: 16,
    color: COLORS.text.inverse,
    opacity: 0.9,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.text.inverse,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  positionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryBadge: {
    backgroundColor: `${COLORS.primary}20`,
  },
  positionText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  primaryLabel: {
    color: COLORS.text.inverse,
    fontSize: 10,
    opacity: 0.8,
  },
  secondaryPositionText: {
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  availabilityCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  availabilityHeader: {
    marginBottom: 4,
  },
  availabilityType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  availabilityDates: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  availabilityNotes: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  teamName: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  pastTeamName: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  currentBadge: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.light,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
  },
  deleteText: {
    color: COLORS.error,
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});
