import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { CoachTeamStackParamList } from '../../navigation/CoachTabNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Team, AgeGroup } from '../../types';
import { getTeamById, createTeam, updateTeam } from '../../services/teamService';
import { COLORS, AGE_GROUPS, US_STATES } from '../../config/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type EditTeamScreenProps = {
  navigation: NativeStackNavigationProp<CoachTeamStackParamList, 'EditTeam'>;
  route: RouteProp<CoachTeamStackParamList, 'EditTeam'>;
};

export default function EditTeamScreen({ navigation, route }: EditTeamScreenProps) {
  const { teamId } = route.params || {};
  const { user } = useAuth();
  const isEditing = !!teamId;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10U');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (teamId) {
      loadTeam();
    } else if (user) {
      setContactEmail(user.email);
    }
  }, [teamId, user]);

  const loadTeam = async () => {
    try {
      const team = await getTeamById(teamId!);
      if (team) {
        setName(team.name);
        setAgeGroup(team.ageGroup);
        setCity(team.location.city);
        setState(team.location.state);
        setZipCode(team.location.zipCode);
        setDescription(team.description || '');
        setContactEmail(team.contactEmail);
        setContactPhone(team.contactPhone || '');
        setWebsite(team.website || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load team');
    }
  };

  const handleSave = async () => {
    if (!name || !city || !zipCode || !contactEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const teamData = {
        coachId: user.id,
        name,
        ageGroup,
        location: {
          city,
          state,
          zipCode,
        },
        description: description || undefined,
        tournaments: [],
        playerNeeds: [],
        contactEmail,
        contactPhone: contactPhone || undefined,
        website: website || undefined,
        isActive: true,
      };

      if (isEditing) {
        await updateTeam(teamId!, teamData);
      } else {
        await createTeam(teamData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} team`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Information</Text>

        <Input
          label="Team Name *"
          placeholder="Enter team name"
          value={name}
          onChangeText={setName}
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

        <Input
          label="Description"
          placeholder="Tell parents about your team..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
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
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Input
          label="Email *"
          placeholder="Contact email"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone"
          placeholder="Contact phone number"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />

        <Input
          label="Website"
          placeholder="Team website URL"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Save Changes' : 'Create Team'}
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
  textArea: {
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
