import { AgeGroup, Position } from '../types';

export const POSITIONS: { value: Position; label: string }[] = [
  { value: 'pitcher', label: 'Pitcher' },
  { value: 'catcher', label: 'Catcher' },
  { value: 'first_base', label: 'First Base' },
  { value: 'second_base', label: 'Second Base' },
  { value: 'shortstop', label: 'Shortstop' },
  { value: 'third_base', label: 'Third Base' },
  { value: 'left_field', label: 'Left Field' },
  { value: 'center_field', label: 'Center Field' },
  { value: 'right_field', label: 'Right Field' },
  { value: 'utility', label: 'Utility' },
];

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: '8U', label: '8 & Under' },
  { value: '9U', label: '9 & Under' },
  { value: '10U', label: '10 & Under' },
  { value: '11U', label: '11 & Under' },
  { value: '12U', label: '12 & Under' },
  { value: '13U', label: '13 & Under' },
  { value: '14U', label: '14 & Under' },
];

export const AVAILABILITY_TYPES = [
  { value: 'temporary', label: 'Temporary Fill-In' },
  { value: 'permanent', label: 'Permanent Position' },
  { value: 'tryout', label: 'Open to Tryouts' },
];

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// App Theme Colors
export const COLORS = {
  primary: '#1E3A5F', // Deep navy blue - trust, professionalism
  secondary: '#E63946', // Baseball red accent
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    light: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
};

// Default search radius in miles
export const DEFAULT_SEARCH_RADIUS = 50;

// Maximum video duration in seconds (2 minutes)
export const MAX_VIDEO_DURATION = 120;

// Maximum video file size in bytes (100MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
