import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { CoachTeamStackParamList } from '../../navigation/CoachTabNavigator';
import { TeamNeed, Position, AvailabilityType } from '../../types';
import { getTeamById, addPlayerNeed, removePlayerNeed } from '../../services/teamService';
import { COLORS, POSITIONS, AVAILABILITY_TYPES } from '../../config/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type PlayerNeedsScreenProps = {
  navigation: NativeStackNavigationProp<CoachTeamStackParamList, 'PlayerNeeds'>;
  route: RouteProp<CoachTeamStackParamList, 'PlayerNeeds'>;
};

export default function PlayerNeedsScreen({ navigation, route }: PlayerNeedsScreenProps) {
  const { teamId } = route.params;
  const [needs, setNeeds] = useState<TeamNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPosition, setNewPosition] = useState<Position>('pitcher');
  const [newAvailabilityType, setNewAvailabilityType] = useState<AvailabilityType>('permanent');
  const [newUrgency, setNewUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadNeeds();
  }, [teamId]);

  const loadNeeds = async () => {
    try {
      const team = await getTeamById(teamId);
      if (team) {
        setNeeds(team.playerNeeds);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load player needs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNeed = async () => {
    try {
      const newNeed: TeamNeed = {
        position: newPosition,
        ageGroup: '10U', // Will use team's age group
        availabilityType: newAvailabilityType,
        urgency: newUrgency,
        notes: newNotes || undefined,
      };

      await addPlayerNeed(teamId, newNeed);
      setNeeds([...needs, newNeed]);
      setModalVisible(false);
      setNewNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add player need');
    }
  };

  const handleRemoveNeed = async (position: string) => {
    Alert.alert(
      'Remove Player Need',
      'Are you sure you want to remove this player need?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePlayerNeed(teamId, position);
              setNeeds(needs.filter((n) => n.position !== position));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove player need');
            }
          },
        },
      ]
    );
  };

  const getPositionLabel = (position: string) => {
    return POSITIONS.find((p) => p.value === position)?.label || position;
  };

  const renderNeed = ({ item }: { item: TeamNeed }) => (
    <View style={styles.needCard}>
      <View style={styles.needHeader}>
        <Text style={styles.positionText}>{getPositionLabel(item.position)}</Text>
        <TouchableOpacity onPress={() => handleRemoveNeed(item.position)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.needDetails}>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
          <Text style={styles.urgencyText}>{item.urgency}</Text>
        </View>
        <Text style={styles.typeText}>
          {AVAILABILITY_TYPES.find((t) => t.value === item.availabilityType)?.label}
        </Text>
      </View>
      {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
    </View>
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return `${COLORS.error}20`;
      case 'medium':
        return `${COLORS.warning}20`;
      default:
        return `${COLORS.success}20`;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={needs}
        keyExtractor={(item) => item.position}
        renderItem={renderNeed}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="person-add-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyTitle}>No Player Needs</Text>
            <Text style={styles.emptyText}>
              Add player needs to help the matching system find suitable players
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={COLORS.text.inverse} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Player Need</Text>

            <Text style={styles.label}>Position</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newPosition}
                onValueChange={(value) => setNewPosition(value as Position)}
                style={styles.picker}
              >
                {POSITIONS.map((pos) => (
                  <Picker.Item key={pos.value} label={pos.label} value={pos.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeButtons}>
              {AVAILABILITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    newAvailabilityType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewAvailabilityType(type.value as AvailabilityType)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newAvailabilityType === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Urgency</Text>
            <View style={styles.urgencyButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.urgencyButton,
                    newUrgency === level && styles.urgencyButtonActive,
                  ]}
                  onPress={() => setNewUrgency(level)}
                >
                  <Text
                    style={[
                      styles.urgencyButtonText,
                      newUrgency === level && styles.urgencyButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Notes (Optional)"
              placeholder="Any additional requirements..."
              value={newNotes}
              onChangeText={setNewNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add"
                onPress={handleAddNeed}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
  },
  needCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  needHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  needDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.text.light,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
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
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 11,
    color: COLORS.text.primary,
  },
  typeButtonTextActive: {
    color: COLORS.text.inverse,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  urgencyButtonText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  urgencyButtonTextActive: {
    color: COLORS.text.inverse,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});
