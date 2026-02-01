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
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ParentStackParamList } from '../../navigation/ParentTabNavigator';
import { AvailabilityWindow, AvailabilityType } from '../../types';
import { getPlayerById, addAvailability, removeAvailability } from '../../services/playerService';
import { COLORS, AVAILABILITY_TYPES } from '../../config/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type AvailabilityScreenProps = {
  navigation: NativeStackNavigationProp<ParentStackParamList, 'Availability'>;
  route: RouteProp<ParentStackParamList, 'Availability'>;
};

export default function AvailabilityScreen({ navigation, route }: AvailabilityScreenProps) {
  const { playerId } = route.params;
  const [availability, setAvailability] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newType, setNewType] = useState<AvailabilityType>('temporary');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadAvailability();
  }, [playerId]);

  const loadAvailability = async () => {
    try {
      const player = await getPlayerById(playerId);
      if (player) {
        setAvailability(player.availability);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const newWindow: AvailabilityWindow = {
        id: Date.now().toString(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        type: newType,
        notes: newNotes || undefined,
      };

      await addAvailability(playerId, newWindow);
      setAvailability([...availability, newWindow]);
      setModalVisible(false);
      setNewNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add availability');
    }
  };

  const handleRemoveAvailability = async (windowId: string) => {
    Alert.alert(
      'Remove Availability',
      'Are you sure you want to remove this availability window?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAvailability(playerId, windowId);
              setAvailability(availability.filter((a) => a.id !== windowId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove availability');
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type: AvailabilityType) => {
    return AVAILABILITY_TYPES.find((t) => t.value === type)?.label || type;
  };

  const renderItem = ({ item }: { item: AvailabilityWindow }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
        <TouchableOpacity onPress={() => handleRemoveAvailability(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.dateRange}>
        {format(item.startDate, 'MMM d, yyyy')} - {format(item.endDate, 'MMM d, yyyy')}
      </Text>
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={availability}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyTitle}>No Availability Set</Text>
            <Text style={styles.emptyText}>
              Add availability windows to let coaches know when your player is available
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
            <Text style={styles.modalTitle}>Add Availability</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeButtons}>
              {AVAILABILITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    newType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewType(type.value as AvailabilityType)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newType === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Notes (Optional)"
              placeholder="Any additional details..."
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
                onPress={handleAddAvailability}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dateRange: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  notes: {
    fontSize: 12,
    color: COLORS.text.secondary,
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
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
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
    fontSize: 12,
    color: COLORS.text.primary,
  },
  typeButtonTextActive: {
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
