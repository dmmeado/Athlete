import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Team } from '../../types';
import { getTeamById } from '../../services/teamService';
import { COLORS, POSITIONS, AVAILABILITY_TYPES } from '../../config/constants';
import Button from '../../components/common/Button';

type TeamDetailScreenProps = {
  route: RouteProp<{ TeamDetail: { teamId: string } }, 'TeamDetail'>;
};

export default function TeamDetailScreen({ route }: TeamDetailScreenProps) {
  const { teamId } = route.params;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const loadTeam = async () => {
    try {
      const teamData = await getTeamById(teamId);
      setTeam(teamData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load team profile');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Team',
      'Messaging functionality will be available soon. You can reach out to teams through the Messages tab.'
    );
  };

  const getPositionLabel = (position: string) => {
    return POSITIONS.find((p) => p.value === position)?.label || position;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="people" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.ageGroup}>{team.ageGroup}</Text>
        <Text style={styles.location}>
          {team.location.city}, {team.location.state}
        </Text>
      </View>

      {/* Contact Button */}
      <View style={styles.contactContainer}>
        <Button title="Contact This Team" onPress={handleContact} />
      </View>

      {/* Description */}
      {team.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{team.description}</Text>
        </View>
      )}

      {/* Player Needs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Looking For Players</Text>
        {team.playerNeeds.length > 0 ? (
          team.playerNeeds.map((need, index) => (
            <View key={index} style={styles.needCard}>
              <View style={styles.needHeader}>
                <Text style={styles.needPosition}>{getPositionLabel(need.position)}</Text>
                <View style={[styles.urgencyBadge, styles[`urgency${need.urgency}`]]}>
                  <Text style={styles.urgencyText}>{need.urgency}</Text>
                </View>
              </View>
              <Text style={styles.needType}>
                Looking for: {AVAILABILITY_TYPES.find((t) => t.value === need.availabilityType)?.label}
              </Text>
              {need.notes && <Text style={styles.needNotes}>{need.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No current player needs listed</Text>
        )}
      </View>

      {/* Upcoming Tournaments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournaments</Text>
        {team.tournaments.length > 0 ? (
          team.tournaments.map((tournament) => (
            <View key={tournament.id} style={styles.tournamentCard}>
              <Ionicons name="trophy" size={20} color={COLORS.secondary} />
              <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentLocation}>{tournament.location}</Text>
                <Text style={styles.tournamentDates}>
                  {format(tournament.startDate, 'MMM d')} - {format(tournament.endDate, 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming tournaments listed</Text>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={18} color={COLORS.text.secondary} />
          <Text style={styles.contactText}>{team.contactEmail}</Text>
        </View>
        {team.contactPhone && (
          <View style={styles.contactItem}>
            <Ionicons name="call" size={18} color={COLORS.text.secondary} />
            <Text style={styles.contactText}>{team.contactPhone}</Text>
          </View>
        )}
        {team.website && (
          <View style={styles.contactItem}>
            <Ionicons name="globe" size={18} color={COLORS.text.secondary} />
            <Text style={styles.contactText}>{team.website}</Text>
          </View>
        )}
      </View>

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
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
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
  contactContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  needCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  needHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  needPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgencylow: {
    backgroundColor: `${COLORS.success}20`,
  },
  urgencymedium: {
    backgroundColor: `${COLORS.warning}20`,
  },
  urgencyhigh: {
    backgroundColor: `${COLORS.error}20`,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  needType: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  needNotes: {
    fontSize: 12,
    color: COLORS.text.light,
    marginTop: 4,
  },
  tournamentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  tournamentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tournamentLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  tournamentDates: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.light,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 32,
  },
});
