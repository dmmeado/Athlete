import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Player, PlayerSearchFilters, AvailabilityWindow } from '../types';

const PLAYERS_COLLECTION = 'players';

// Convert Firestore document to Player type
const docToPlayer = (doc: any): Player => {
  const data = doc.data();
  return {
    id: doc.id,
    parentId: data.parentId,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth?.toDate(),
    ageGroup: data.ageGroup,
    location: data.location,
    primaryPosition: data.primaryPosition,
    secondaryPositions: data.secondaryPositions || [],
    currentTeam: data.currentTeam,
    pastTeams: data.pastTeams || [],
    stats: data.stats || {},
    highlightVideos: data.highlightVideos || [],
    availability: (data.availability || []).map((a: any) => ({
      ...a,
      startDate: a.startDate?.toDate(),
      endDate: a.endDate?.toDate(),
    })),
    profileImageUrl: data.profileImageUrl,
    bio: data.bio,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Get all players for a parent
export async function getPlayersByParent(parentId: string): Promise<Player[]> {
  const q = query(
    collection(db, PLAYERS_COLLECTION),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToPlayer);
}

// Get a single player by ID
export async function getPlayerById(playerId: string): Promise<Player | null> {
  const docRef = doc(db, PLAYERS_COLLECTION, playerId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToPlayer(snapshot);
}

// Create a new player
export async function createPlayer(
  playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), {
    ...playerData,
    dateOfBirth: Timestamp.fromDate(playerData.dateOfBirth),
    availability: playerData.availability.map((a) => ({
      ...a,
      startDate: Timestamp.fromDate(a.startDate),
      endDate: Timestamp.fromDate(a.endDate),
    })),
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

// Update a player
export async function updatePlayer(
  playerId: string,
  updates: Partial<Omit<Player, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, PLAYERS_COLLECTION, playerId);

  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.dateOfBirth) {
    updateData.dateOfBirth = Timestamp.fromDate(updates.dateOfBirth);
  }

  if (updates.availability) {
    updateData.availability = updates.availability.map((a) => ({
      ...a,
      startDate: Timestamp.fromDate(a.startDate),
      endDate: Timestamp.fromDate(a.endDate),
    }));
  }

  await updateDoc(docRef, updateData);
}

// Delete a player
export async function deletePlayer(playerId: string): Promise<void> {
  const docRef = doc(db, PLAYERS_COLLECTION, playerId);
  await deleteDoc(docRef);
}

// Search players with filters
export async function searchPlayers(filters: PlayerSearchFilters): Promise<Player[]> {
  let q = query(collection(db, PLAYERS_COLLECTION), where('isActive', '==', true));

  // Apply age group filter
  if (filters.ageGroups && filters.ageGroups.length > 0) {
    q = query(q, where('ageGroup', 'in', filters.ageGroups));
  }

  // Apply position filter
  if (filters.positions && filters.positions.length > 0) {
    q = query(q, where('primaryPosition', 'in', filters.positions));
  }

  const snapshot = await getDocs(q);
  let players = snapshot.docs.map(docToPlayer);

  // Client-side filtering for more complex criteria

  // Filter by availability type
  if (filters.availabilityType) {
    players = players.filter((player) =>
      player.availability.some((a) => a.type === filters.availabilityType)
    );
  }

  // Filter by date range
  if (filters.availabilityStartDate && filters.availabilityEndDate) {
    players = players.filter((player) =>
      player.availability.some(
        (a) =>
          a.startDate <= filters.availabilityEndDate! &&
          a.endDate >= filters.availabilityStartDate!
      )
    );
  }

  // Note: Location radius filtering would require geospatial queries
  // For MVP, we'll filter client-side or use a simpler zip code prefix match

  return players;
}

// Add availability window to a player
export async function addAvailability(
  playerId: string,
  availability: AvailabilityWindow
): Promise<void> {
  const player = await getPlayerById(playerId);
  if (!player) throw new Error('Player not found');

  const updatedAvailability = [...player.availability, availability];
  await updatePlayer(playerId, { availability: updatedAvailability });
}

// Remove availability window from a player
export async function removeAvailability(
  playerId: string,
  availabilityId: string
): Promise<void> {
  const player = await getPlayerById(playerId);
  if (!player) throw new Error('Player not found');

  const updatedAvailability = player.availability.filter(
    (a) => a.id !== availabilityId
  );
  await updatePlayer(playerId, { availability: updatedAvailability });
}
