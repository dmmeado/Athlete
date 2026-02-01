import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Match, Player, Team, TeamNeed } from '../types';
import { getPlayerById } from './playerService';
import { getTeamById } from './teamService';

const MATCHES_COLLECTION = 'matches';

// Convert Firestore document to Match type
const docToMatch = (doc: any): Match => {
  const data = doc.data();
  return {
    id: doc.id,
    playerId: data.playerId,
    teamId: data.teamId,
    score: data.score,
    matchedOn: data.matchedOn,
    status: data.status,
    createdAt: data.createdAt?.toDate(),
  };
};

// Calculate match score between a player and a team need
function calculateMatchScore(
  player: Player,
  team: Team,
  need: TeamNeed
): { score: number; matchedOn: Match['matchedOn'] } {
  let score = 0;
  const matchedOn = {
    position: false,
    ageGroup: false,
    location: false,
    availability: false,
  };

  // Position match (40 points max)
  if (player.primaryPosition === need.position) {
    score += 40;
    matchedOn.position = true;
  } else if (player.secondaryPositions.includes(need.position)) {
    score += 25;
    matchedOn.position = true;
  }

  // Age group match (30 points)
  if (player.ageGroup === team.ageGroup) {
    score += 30;
    matchedOn.ageGroup = true;
  }

  // Location proximity (20 points max)
  // For MVP, simple state match. Could be enhanced with actual distance calculation
  if (player.location.state === team.location.state) {
    score += 20;
    matchedOn.location = true;

    // Bonus for same city
    if (player.location.city === team.location.city) {
      score += 5;
    }
  }

  // Availability match (10 points)
  if (need.availabilityType) {
    const hasMatchingAvailability = player.availability.some(
      (a) => a.type === need.availabilityType
    );
    if (hasMatchingAvailability) {
      score += 10;
      matchedOn.availability = true;
    }

    // Check date overlap if specified
    if (need.startDate && need.endDate) {
      const hasDateOverlap = player.availability.some(
        (a) =>
          a.startDate <= need.endDate! && a.endDate >= need.startDate!
      );
      if (hasDateOverlap) {
        score += 5;
      }
    }
  } else {
    // If no specific availability type needed, give partial points for any availability
    if (player.availability.length > 0) {
      score += 5;
      matchedOn.availability = true;
    }
  }

  return { score, matchedOn };
}

// Generate matches for a player
export async function generateMatchesForPlayer(playerId: string): Promise<Match[]> {
  const player = await getPlayerById(playerId);
  if (!player) throw new Error('Player not found');

  // Get all active teams with the same age group
  const teamsQuery = query(
    collection(db, 'teams'),
    where('isActive', '==', true),
    where('ageGroup', '==', player.ageGroup)
  );

  const teamsSnapshot = await getDocs(teamsQuery);
  const matches: Match[] = [];

  for (const teamDoc of teamsSnapshot.docs) {
    const team = {
      id: teamDoc.id,
      ...teamDoc.data(),
    } as Team;

    // Check if team has relevant needs
    for (const need of team.playerNeeds) {
      const { score, matchedOn } = calculateMatchScore(player, team, need);

      // Only create match if score is above threshold (e.g., 50)
      if (score >= 50) {
        // Check if match already exists
        const existingMatchQuery = query(
          collection(db, MATCHES_COLLECTION),
          where('playerId', '==', playerId),
          where('teamId', '==', team.id)
        );
        const existingMatches = await getDocs(existingMatchQuery);

        if (existingMatches.empty) {
          const matchRef = await addDoc(collection(db, MATCHES_COLLECTION), {
            playerId,
            teamId: team.id,
            score,
            matchedOn,
            status: 'pending',
            createdAt: Timestamp.now(),
          });

          matches.push({
            id: matchRef.id,
            playerId,
            teamId: team.id,
            score,
            matchedOn,
            status: 'pending',
            createdAt: new Date(),
          });
        }
      }
    }
  }

  return matches;
}

// Generate matches for a team
export async function generateMatchesForTeam(teamId: string): Promise<Match[]> {
  const team = await getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  // Get all active players with the same age group
  const playersQuery = query(
    collection(db, 'players'),
    where('isActive', '==', true),
    where('ageGroup', '==', team.ageGroup)
  );

  const playersSnapshot = await getDocs(playersQuery);
  const matches: Match[] = [];

  for (const playerDoc of playersSnapshot.docs) {
    const player = {
      id: playerDoc.id,
      ...playerDoc.data(),
    } as Player;

    for (const need of team.playerNeeds) {
      const { score, matchedOn } = calculateMatchScore(player, team, need);

      if (score >= 50) {
        // Check if match already exists
        const existingMatchQuery = query(
          collection(db, MATCHES_COLLECTION),
          where('playerId', '==', player.id),
          where('teamId', '==', teamId)
        );
        const existingMatches = await getDocs(existingMatchQuery);

        if (existingMatches.empty) {
          const matchRef = await addDoc(collection(db, MATCHES_COLLECTION), {
            playerId: player.id,
            teamId,
            score,
            matchedOn,
            status: 'pending',
            createdAt: Timestamp.now(),
          });

          matches.push({
            id: matchRef.id,
            playerId: player.id,
            teamId,
            score,
            matchedOn,
            status: 'pending',
            createdAt: new Date(),
          });
        }
      }
    }
  }

  return matches;
}

// Get matches for a player
export async function getMatchesForPlayer(playerId: string): Promise<Match[]> {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('playerId', '==', playerId),
    orderBy('score', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToMatch);
}

// Get matches for a team
export async function getMatchesForTeam(teamId: string): Promise<Match[]> {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('teamId', '==', teamId),
    orderBy('score', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToMatch);
}

// Update match status
export async function updateMatchStatus(
  matchId: string,
  status: Match['status']
): Promise<void> {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await updateDoc(docRef, { status });
}

// Get a single match by ID
export async function getMatchById(matchId: string): Promise<Match | null> {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToMatch(snapshot);
}
