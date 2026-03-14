export type LaneType =
  | 'customer_phases'
  | 'customer_activities'
  | 'needs_quotes'
  | 'emotion'
  | 'touchpoints'
  | 'backstage'
  | 'systems'
  | 'kpis'
  | 'custom';

export type CardStatus = 'current' | 'to_develop' | 'in_progress' | 'done' | 'remove';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

export interface PersonaAttribute {
  label: string;
  value: string;
}

export interface Persona {
  id: string;
  workspace_id: string;
  name: string;
  role: string;
  quote: string;
  photo_url: string;
  attributes: PersonaAttribute[];
  goals: string;
  frustrations: string;
  created_at: string;
}

export interface JourneyMap {
  id: string;
  workspace_id: string;
  collection_id: string | null;
  persona_id: string | null;
  title: string;
  description: string;
  tags: string[];
  owner_id: string;
  phase_width: number;
  created_at: string;
  updated_at: string;
}

export interface Phase {
  id: string;
  map_id: string;
  name: string;
  position: number;
}

export interface Lane {
  id: string;
  map_id: string;
  parent_lane_id: string | null;
  name: string;
  lane_type: LaneType;
  position: number;
  color_group: string;
  is_collapsed: boolean;
}

export interface CardLink {
  url: string;
  title?: string;
}

export interface Card {
  id: string;
  map_id: string;
  phase_id: string;
  lane_id: string;
  title: string;
  body: string;
  color: string;
  status: CardStatus;
  tags: string[];
  links: CardLink[];
  position: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmotionPoint {
  id: string;
  map_id: string;
  phase_id: string;
  value: number;
}

export interface Comment {
  id: string;
  map_id: string;
  card_id: string | null;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
}

export const LANE_COLORS: Record<string, { bg: string; accent: string }> = {
  customer_phases:     { bg: '#FAFAF8', accent: '#3CBFB0' },
  customer_activities: { bg: '#F5F4F0', accent: '#3CBFB0' },
  needs_quotes:        { bg: '#F5F4F0', accent: '#3CBFB0' },
  emotion:             { bg: '#FFFFFF', accent: '#3CBFB0' },
  touchpoints:         { bg: '#F0F4F8', accent: '#4A90D9' },
  backstage:           { bg: '#FDF4EE', accent: '#E8873A' },
  systems:             { bg: '#FDF4EE', accent: '#E8873A' },
  kpis:                { bg: '#FDF4EE', accent: '#E8873A' },
  custom:              { bg: '#F5F4F0', accent: '#3CBFB0' },
};

export const STATUS_CONFIG: Record<CardStatus, { label: string; color: string; bg: string }> = {
  current:    { label: 'Current',     color: '#fff', bg: '#6B7280' },
  to_develop: { label: 'To Develop',  color: '#fff', bg: '#4A90D9' },
  in_progress:{ label: 'In Progress', color: '#fff', bg: '#F5A623' },
  done:       { label: 'Done',        color: '#fff', bg: '#3CBFB0' },
  remove:     { label: 'Remove',      color: '#fff', bg: '#E04C4C' },
};

export const LANE_TYPE_OPTIONS: { value: LaneType; label: string; group: string }[] = [
  { value: 'customer_phases',     label: 'Customer Phases',     group: 'Front-Stage' },
  { value: 'customer_activities', label: 'Customer Activities', group: 'Front-Stage' },
  { value: 'needs_quotes',        label: 'Needs & Quotes',      group: 'Front-Stage' },
  { value: 'emotion',             label: 'Emotion Curve',       group: 'Front-Stage' },
  { value: 'touchpoints',         label: 'Touchpoints',         group: 'Channels' },
  { value: 'backstage',           label: 'Backstage Activities',group: 'Back-Stage' },
  { value: 'systems',             label: 'Systems & Technology',group: 'Back-Stage' },
  { value: 'kpis',                label: 'KPIs & Metrics',      group: 'Back-Stage' },
  { value: 'custom',              label: 'Custom',              group: 'Custom' },
];
