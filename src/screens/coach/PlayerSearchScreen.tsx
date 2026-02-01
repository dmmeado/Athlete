import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CoachSearchStackParamList } from '../../navigation/CoachTabNavigator';
import { Player, PlayerSearchFilters, AgeGroup, Position } from '../../types';
import { searchPlayers } from '../../services/playerService';
import { COLORS, POSITIONS, AGE_GROUPS, AVAILABILITY_TYPES } from '../../config/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type PlayerSearchScreenProps = {
  navigation: NativeStackNavigationProp<CoachSearchStackParamList, 'PlayerSearch'>;
};

export default function PlayerSearchScreen({ navigation }: PlayerSearchScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filters
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<AgeGroup[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [zipCode, setZipCode] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const filters: PlayerSearchFilters = {};

      if (selectedAgeGroups.length > 0) {
        filters.ageGroups = selectedAgeGroups;
      }
      if (selectedPositions.length > 0) {
        filters.positions = selectedPositions;
      }
      if (zipCode) {
        filters.zipCode = zipCode;
      }

      const results = await searchPlayers(filters);
      setPlayers(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setFilterModalVisible(false);
    }
  };

  const toggleAgeGroup = (ageGroup: AgeGroup) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(ageGroup)
        ? prev.filter((g) => g !== ageGroup)
        : [...prev, ageGroup]
    );
  };

  const togglePosition = (position: Position) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const getPositionLabel = (position: string) => {
    return POSITIONS.find((p) => p.value === position)?.label || position;
  };

  const clearFilters = () => {
    setSelectedAgeGroups([]);
    setSelectedPositions([]);
    setZipCode('');
  };

  const activeFiltersCount =
    selectedAgeGroups.length + selectedPositions.length + (zipCode ? 1 : 0);

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
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
        <View style={styles.availabilityRow}>
          {item.availability.length > 0 && (
            <View style={styles.availabilityBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <Text style={styles.availabilityText}>Available</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={20} color={COLORS.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Button title="Search" onPress={handleSearch} loading={loading} size="small" />
      </View>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFilters}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {selectedAgeGroups.map((ag) => (
            <View key={ag} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{ag}</Text>
              <TouchableOpacity onPress={() => toggleAgeGroup(ag)}>
                <Ionicons name="close" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedPositions.map((pos) => (
            <View key={pos} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{getPositionLabel(pos)}</Text>
              <TouchableOpacity onPress={() => togglePosition(pos)}>
                <Ionicons name="close" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
          {zipCode && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Near {zipCode}</Text>
              <TouchableOpacity onPress={() => setZipCode('')}>
                <Ionicons name="close" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Results */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {searched ? (
              <>
                <Ionicons name="search-outline" size={64} color={COLORS.text.light} />
                <Text style={styles.emptyTitle}>No Players Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your filters to see more results
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={64} color={COLORS.text.light} />
                <Text style={styles.emptyTitle}>Find Players</Text>
                <Text style={styles.emptyText}>
                  Set your filters and search to find available players
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.filterLabel}>Age Group</Text>
              <View style={styles.chipContainer}>
                {AGE_GROUPS.map((ag) => (
                  <TouchableOpacity
                    key={ag.value}
                    style={[
                      styles.chip,
                      selectedAgeGroups.includes(ag.value) && styles.chipSelected,
                    ]}
                    onPress={() => toggleAgeGroup(ag.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedAgeGroups.includes(ag.value) && styles.chipTextSelected,
                      ]}
                    >
                      {ag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Position</Text>
              <View style={styles.chipContainer}>
                {POSITIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos.value}
                    style={[
                      styles.chip,
                      selectedPositions.includes(pos.value) && styles.chipSelected,
                    ]}
                    onPress={() => togglePosition(pos.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPositions.includes(pos.value) && styles.chipTextSelected,
                      ]}
                    >
                      {pos.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Near ZIP Code"
                placeholder="Enter ZIP code"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setFilterModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Apply & Search"
                onPress={handleSearch}
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filterBadgeText: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilters: {
    backgroundColor: COLORS.surface,
    maxHeight: 50,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    color: COLORS.primary,
    fontSize: 12,
    marginRight: 4,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 2,
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
  availabilityRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 10,
    color: COLORS.success,
    marginLeft: 2,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  clearText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  chipTextSelected: {
    color: COLORS.text.inverse,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});
