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
import { Team, TeamNeed, TeamSearchFilters, Tournament } from '../types';

const TEAMS_COLLECTION = 'teams';

// Convert Firestore document to Team type
const docToTeam = (doc: any): Team => {
  const data = doc.data();
  return {
    id: doc.id,
    coachId: data.coachId,
    name: data.name,
    ageGroup: data.ageGroup,
    location: data.location,
    description: data.description,
    logoUrl: data.logoUrl,
    tournaments: (data.tournaments || []).map((t: any) => ({
      ...t,
      startDate: t.startDate?.toDate(),
      endDate: t.endDate?.toDate(),
    })),
    playerNeeds: (data.playerNeeds || []).map((n: any) => ({
      ...n,
      startDate: n.startDate?.toDate(),
      endDate: n.endDate?.toDate(),
    })),
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    website: data.website,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Get all teams for a coach
export async function getTeamsByCoach(coachId: string): Promise<Team[]> {
  const q = query(
    collection(db, TEAMS_COLLECTION),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTeam);
}

// Get a single team by ID
export async function getTeamById(teamId: string): Promise<Team | null> {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToTeam(snapshot);
}

// Create a new team
export async function createTeam(
  teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();

  const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
    ...teamData,
    tournaments: teamData.tournaments.map((t) => ({
      ...t,
      startDate: Timestamp.fromDate(t.startDate),
      endDate: Timestamp.fromDate(t.endDate),
    })),
    playerNeeds: teamData.playerNeeds.map((n) => ({
      ...n,
      startDate: n.startDate ? Timestamp.fromDate(n.startDate) : null,
      endDate: n.endDate ? Timestamp.fromDate(n.endDate) : null,
    })),
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

// Update a team
export async function updateTeam(
  teamId: string,
  updates: Partial<Omit<Team, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);

  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.tournaments) {
    updateData.tournaments = updates.tournaments.map((t) => ({
      ...t,
      startDate: Timestamp.fromDate(t.startDate),
      endDate: Timestamp.fromDate(t.endDate),
    }));
  }

  if (updates.playerNeeds) {
    updateData.playerNeeds = updates.playerNeeds.map((n) => ({
      ...n,
      startDate: n.startDate ? Timestamp.fromDate(n.startDate) : null,
      endDate: n.endDate ? Timestamp.fromDate(n.endDate) : null,
    }));
  }

  await updateDoc(docRef, updateData);
}

// Delete a team
export async function deleteTeam(teamId: string): Promise<void> {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  await deleteDoc(docRef);
}

// Search teams with filters
export async function searchTeams(filters: TeamSearchFilters): Promise<Team[]> {
  let q = query(collection(db, TEAMS_COLLECTION), where('isActive', '==', true));

  // Apply age group filter
  if (filters.ageGroups && filters.ageGroups.length > 0) {
    q = query(q, where('ageGroup', 'in', filters.ageGroups));
  }

  const snapshot = await getDocs(q);
  let teams = snapshot.docs.map(docToTeam);

  // Filter by teams with openings
  if (filters.hasOpenings) {
    teams = teams.filter((team) => team.playerNeeds.length > 0);
  }

  return teams;
}

// Add a player need to a team
export async function addPlayerNeed(
  teamId: string,
  need: TeamNeed
): Promise<void> {
  const team = await getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  const updatedNeeds = [...team.playerNeeds, need];
  await updateTeam(teamId, { playerNeeds: updatedNeeds });
}

// Remove a player need from a team
export async function removePlayerNeed(
  teamId: string,
  position: string
): Promise<void> {
  const team = await getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  const updatedNeeds = team.playerNeeds.filter((n) => n.position !== position);
  await updateTeam(teamId, { playerNeeds: updatedNeeds });
}

// Add a tournament to a team
export async function addTournament(
  teamId: string,
  tournament: Tournament
): Promise<void> {
  const team = await getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  const updatedTournaments = [...team.tournaments, tournament];
  await updateTeam(teamId, { tournaments: updatedTournaments });
}

// Remove a tournament from a team
export async function removeTournament(
  teamId: string,
  tournamentId: string
): Promise<void> {
  const team = await getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  const updatedTournaments = team.tournaments.filter((t) => t.id !== tournamentId);
  await updateTeam(teamId, { tournaments: updatedTournaments });
}

// Get teams with needs matching player criteria
export async function getTeamsWithMatchingNeeds(
  position: string,
  ageGroup: string
): Promise<Team[]> {
  const q = query(
    collection(db, TEAMS_COLLECTION),
    where('isActive', '==', true),
    where('ageGroup', '==', ageGroup)
  );

  const snapshot = await getDocs(q);
  const teams = snapshot.docs.map(docToTeam);

  // Filter by position need
  return teams.filter((team) =>
    team.playerNeeds.some((need) => need.position === position)
  );
}
