// User Types
export type UserRole = 'parent' | 'coach';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Player Types
export type Position =
  | 'pitcher'
  | 'catcher'
  | 'first_base'
  | 'second_base'
  | 'shortstop'
  | 'third_base'
  | 'left_field'
  | 'center_field'
  | 'right_field'
  | 'utility';

export type AvailabilityType = 'temporary' | 'permanent' | 'tryout';

export type AgeGroup = '8U' | '9U' | '10U' | '11U' | '12U' | '13U' | '14U';

export interface PlayerStats {
  battingAverage?: number;
  onBasePercentage?: number;
  sluggingPercentage?: number;
  era?: number; // For pitchers
  strikeouts?: number;
  stolenBases?: number;
  rbi?: number;
  homeRuns?: number;
}

export interface AvailabilityWindow {
  id: string;
  startDate: Date;
  endDate: Date;
  type: AvailabilityType;
  notes?: string;
}

export interface Player {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ageGroup: AgeGroup;
  location: {
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  primaryPosition: Position;
  secondaryPositions: Position[];
  currentTeam?: string;
  pastTeams: string[];
  stats: PlayerStats;
  highlightVideos: VideoClip[];
  availability: AvailabilityWindow[];
  profileImageUrl?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoClip {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  uploadedAt: Date;
}

// Team Types
export interface TeamNeed {
  position: Position;
  ageGroup: AgeGroup;
  availabilityType: AvailabilityType;
  urgency: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

export interface Team {
  id: string;
  coachId: string;
  name: string;
  ageGroup: AgeGroup;
  location: {
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description?: string;
  logoUrl?: string;
  tournaments: Tournament[];
  playerNeeds: TeamNeed[];
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Matching Types
export interface Match {
  id: string;
  playerId: string;
  teamId: string;
  score: number; // 0-100 compatibility score
  matchedOn: {
    position: boolean;
    ageGroup: boolean;
    location: boolean;
    availability: boolean;
  };
  status: 'pending' | 'viewed' | 'contacted' | 'declined';
  createdAt: Date;
}

// Messaging Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  parentId: string;
  coachId: string;
  playerId: string;
  teamId: string;
  lastMessage?: Message;
  unreadCount: {
    parent: number;
    coach: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType =
  | 'new_match'
  | 'new_message'
  | 'team_interest'
  | 'player_available'
  | 'profile_view';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// Search/Filter Types
export interface PlayerSearchFilters {
  ageGroups?: AgeGroup[];
  positions?: Position[];
  locationRadius?: number; // in miles
  zipCode?: string;
  availabilityType?: AvailabilityType;
  availabilityStartDate?: Date;
  availabilityEndDate?: Date;
}

export interface TeamSearchFilters {
  ageGroups?: AgeGroup[];
  locationRadius?: number;
  zipCode?: string;
  hasOpenings?: boolean;
}
