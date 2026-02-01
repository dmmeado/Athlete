import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { ParentStackParamList } from '../../navigation/ParentTabNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Player, Position, AgeGroup } from '../../types';
import { getPlayerById, createPlayer, updatePlayer } from '../../services/playerService';
import { COLORS, POSITIONS, AGE_GROUPS, US_STATES } from '../../config/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type EditPlayerScreenProps = {
  navigation: NativeStackNavigationProp<ParentStackParamList, 'EditPlayer'>;
  route: RouteProp<ParentStackParamList, 'EditPlayer'>;
};

export default function EditPlayerScreen({ navigation, route }: EditPlayerScreenProps) {
  const { playerId } = route.params || {};
  const { user } = useAuth();
  const isEditing = !!playerId;

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10U');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('');
  const [primaryPosition, setPrimaryPosition] = useState<Position>('pitcher');
  const [secondaryPositions, setSecondaryPositions] = useState<Position[]>([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [bio, setBio] = useState('');

  // Stats
  const [battingAverage, setBattingAverage] = useState('');
  const [homeRuns, setHomeRuns] = useState('');
  const [rbi, setRbi] = useState('');
  const [stolenBases, setStolenBases] = useState('');
  const [era, setEra] = useState('');

  useEffect(() => {
    if (playerId) {
      loadPlayer();
    }
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      const player = await getPlayerById(playerId!);
      if (player) {
        setFirstName(player.firstName);
        setLastName(player.lastName);
        setAgeGroup(player.ageGroup);
        setCity(player.location.city);
        setState(player.location.state);
        setZipCode(player.location.zipCode);
        setPrimaryPosition(player.primaryPosition);
        setSecondaryPositions(player.secondaryPositions);
        setCurrentTeam(player.currentTeam || '');
        setBio(player.bio || '');

        if (player.stats.battingAverage) {
          setBattingAverage(player.stats.battingAverage.toString());
        }
        if (player.stats.homeRuns !== undefined) {
          setHomeRuns(player.stats.homeRuns.toString());
        }
        if (player.stats.rbi !== undefined) {
          setRbi(player.stats.rbi.toString());
        }
        if (player.stats.stolenBases !== undefined) {
          setStolenBases(player.stats.stolenBases.toString());
        }
        if (player.stats.era !== undefined) {
          setEra(player.stats.era.toString());
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load player');
    }
  };

  const toggleSecondaryPosition = (position: Position) => {
    if (position === primaryPosition) return;

    setSecondaryPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !city || !zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const playerData = {
        parentId: user.id,
        firstName,
        lastName,
        dateOfBirth: new Date(), // TODO: Add date picker
        ageGroup,
        location: {
          city,
          state,
          zipCode,
        },
        primaryPosition,
        secondaryPositions: secondaryPositions.filter((p) => p !== primaryPosition),
        currentTeam: currentTeam || undefined,
        pastTeams: [],
        stats: {
          ...(battingAverage && { battingAverage: parseFloat(battingAverage) }),
          ...(homeRuns && { homeRuns: parseInt(homeRuns, 10) }),
          ...(rbi && { rbi: parseInt(rbi, 10) }),
          ...(stolenBases && { stolenBases: parseInt(stolenBases, 10) }),
          ...(era && { era: parseFloat(era) }),
        },
        highlightVideos: [],
        availability: [],
        bio: bio || undefined,
        isActive: true,
      };

      if (isEditing) {
        await updatePlayer(playerId!, playerData);
      } else {
        await createPlayer(playerData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} player`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <Input
          label="First Name *"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Input
          label="Last Name *"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Age Group *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={ageGroup}
            onValueChange={(value) => setAgeGroup(value as AgeGroup)}
            style={styles.picker}
          >
            {AGE_GROUPS.map((group) => (
              <Picker.Item key={group.value} label={group.label} value={group.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>

        <Input
          label="City *"
          placeholder="Enter city"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>State *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={state}
            onValueChange={(value) => setState(value)}
            style={styles.picker}
          >
            {US_STATES.map((s) => (
              <Picker.Item key={s.value} label={s.label} value={s.value} />
            ))}
          </Picker>
        </View>

        <Input
          label="ZIP Code *"
          placeholder="Enter ZIP code"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Positions</Text>

        <Text style={styles.label}>Primary Position *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={primaryPosition}
            onValueChange={(value) => setPrimaryPosition(value as Position)}
            style={styles.picker}
          >
            {POSITIONS.map((pos) => (
              <Picker.Item key={pos.value} label={pos.label} value={pos.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Secondary Positions</Text>
        <View style={styles.positionGrid}>
          {POSITIONS.filter((p) => p.value !== primaryPosition).map((pos) => (
            <TouchableOpacity
              key={pos.value}
              style={[
                styles.positionChip,
                secondaryPositions.includes(pos.value) && styles.positionChipSelected,
              ]}
              onPress={() => toggleSecondaryPosition(pos.value)}
            >
              <Text
                style={[
                  styles.positionChipText,
                  secondaryPositions.includes(pos.value) && styles.positionChipTextSelected,
                ]}
              >
                {pos.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats (Optional)</Text>

        <View style={styles.statsRow}>
          <View style={styles.statInput}>
            <Input
              label="Batting Avg"
              placeholder="0.000"
              value={battingAverage}
              onChangeText={setBattingAverage}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.statInput}>
            <Input
              label="Home Runs"
              placeholder="0"
              value={homeRuns}
              onChangeText={setHomeRuns}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statInput}>
            <Input
              label="RBI"
              placeholder="0"
              value={rbi}
              onChangeText={setRbi}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.statInput}>
            <Input
              label="Stolen Bases"
              placeholder="0"
              value={stolenBases}
              onChangeText={setStolenBases}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statInput}>
            <Input
              label="ERA (Pitchers)"
              placeholder="0.00"
              value={era}
              onChangeText={setEra}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.statInput} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Info</Text>

        <Input
          label="Current Team"
          placeholder="Enter current team name"
          value={currentTeam}
          onChangeText={setCurrentTeam}
        />

        <Input
          label="Bio"
          placeholder="Tell coaches about this player..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Save Changes' : 'Create Player'}
          onPress={handleSave}
          loading={loading}
        />
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
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  positionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  positionChipText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  positionChipTextSelected: {
    color: COLORS.text.inverse,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statInput: {
    flex: 1,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
