import { LaneType } from './types';

export interface TemplateCard {
  phaseIndex: number;
  laneIndex: number;
  title: string;
  body?: string;
  color?: string;
}

export interface TemplateLane {
  name: string;
  lane_type: LaneType;
  color_group: string;
}

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  phases: string[];
  lanes: TemplateLane[];
  cards: TemplateCard[];
  emotionValues: number[];
}

const defaultLanes: TemplateLane[] = [
  { name: 'Customer Activities', lane_type: 'customer_activities', color_group: 'customer' },
  { name: 'Needs & Goals',       lane_type: 'needs_quotes',        color_group: 'customer' },
  { name: 'Customer Quotes',     lane_type: 'needs_quotes',        color_group: 'customer' },
  { name: 'Emotion Curve',       lane_type: 'emotion',             color_group: 'customer' },
  { name: 'Touchpoints',         lane_type: 'touchpoints',         color_group: 'touchpoints' },
  { name: 'Channels',            lane_type: 'touchpoints',         color_group: 'touchpoints' },
  { name: 'Backstage Activities',lane_type: 'backstage',           color_group: 'backstage' },
  { name: 'Supporting Systems',  lane_type: 'systems',             color_group: 'backstage' },
  { name: 'KPIs & Metrics',      lane_type: 'kpis',                color_group: 'backstage' },
];

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Purchase Journey',
    description: 'Map the end-to-end experience of an online shopper from awareness to post-purchase.',
    category: 'Retail',
    phases: ['Awareness', 'Consideration', 'Decision', 'Purchase', 'Delivery', 'Post-Purchase'],
    lanes: defaultLanes,
    emotionValues: [0.6, 0.65, 0.55, 0.75, 0.5, 0.8],
    cards: [
      { phaseIndex: 0, laneIndex: 0, title: 'Sees social media ad', color: '#3CBFB0' },
      { phaseIndex: 0, laneIndex: 0, title: 'Gets recommendation from friend', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Browses product catalogue', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Reads reviews & ratings', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Compares prices & options', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Checks delivery times', color: '#3CBFB0' },
      { phaseIndex: 3, laneIndex: 0, title: 'Adds to cart', color: '#3CBFB0' },
      { phaseIndex: 3, laneIndex: 0, title: 'Enters payment details', color: '#3CBFB0' },
      { phaseIndex: 4, laneIndex: 0, title: 'Tracks delivery', color: '#3CBFB0' },
      { phaseIndex: 5, laneIndex: 0, title: 'Leaves review', color: '#3CBFB0' },
      { phaseIndex: 0, laneIndex: 1, title: 'Discover new products', color: '#4A90D9' },
      { phaseIndex: 1, laneIndex: 1, title: 'Find best value', color: '#4A90D9' },
      { phaseIndex: 3, laneIndex: 1, title: 'Easy, secure checkout', color: '#4A90D9' },
      { phaseIndex: 4, laneIndex: 1, title: 'Fast, reliable delivery', color: '#4A90D9' },
      { phaseIndex: 0, laneIndex: 4, title: 'Instagram / TikTok', color: '#E8873A' },
      { phaseIndex: 1, laneIndex: 4, title: 'Product pages', color: '#E8873A' },
      { phaseIndex: 2, laneIndex: 4, title: 'Comparison pages', color: '#E8873A' },
      { phaseIndex: 3, laneIndex: 4, title: 'Checkout flow', color: '#E8873A' },
      { phaseIndex: 4, laneIndex: 4, title: 'Email tracking updates', color: '#E8873A' },
    ],
  },
  {
    id: 'saas-onboarding',
    name: 'SaaS Onboarding Journey',
    description: 'Track how a new user discovers, signs up, and becomes a power user of your SaaS product.',
    category: 'Technology',
    phases: ['Discovery', 'Sign Up', 'First Use', 'Activation', 'Habit', 'Advocacy'],
    lanes: defaultLanes,
    emotionValues: [0.6, 0.7, 0.5, 0.65, 0.75, 0.85],
    cards: [
      { phaseIndex: 0, laneIndex: 0, title: 'Finds product via search', color: '#3CBFB0' },
      { phaseIndex: 0, laneIndex: 0, title: 'Reads blog / case study', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Creates account', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Completes profile setup', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Explores dashboard', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Creates first item', color: '#3CBFB0' },
      { phaseIndex: 3, laneIndex: 0, title: 'Completes key action', color: '#3CBFB0' },
      { phaseIndex: 4, laneIndex: 0, title: 'Returns daily/weekly', color: '#3CBFB0' },
      { phaseIndex: 5, laneIndex: 0, title: 'Refers a colleague', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 1, title: 'Quick & easy sign up', color: '#4A90D9' },
      { phaseIndex: 2, laneIndex: 1, title: 'Understand value immediately', color: '#4A90D9' },
      { phaseIndex: 4, laneIndex: 1, title: 'Saves time every week', color: '#4A90D9' },
      { phaseIndex: 1, laneIndex: 4, title: 'Sign-up page', color: '#E8873A' },
      { phaseIndex: 2, laneIndex: 4, title: 'In-app onboarding', color: '#E8873A' },
      { phaseIndex: 2, laneIndex: 4, title: 'Welcome email', color: '#E8873A' },
      { phaseIndex: 3, laneIndex: 4, title: 'Feature tooltips', color: '#E8873A' },
    ],
  },
  {
    id: 'b2b-sales',
    name: 'B2B Sales Journey',
    description: 'Map the complex B2B buying journey from initial awareness through procurement and expansion.',
    category: 'Sales',
    phases: ['Problem Aware', 'Research', 'Evaluation', 'Negotiation', 'Onboarding', 'Renewal'],
    lanes: [
      { name: 'Buyer Activities',    lane_type: 'customer_activities', color_group: 'customer' },
      { name: 'Buying Committee',    lane_type: 'needs_quotes',        color_group: 'customer' },
      { name: 'Pain Points',         lane_type: 'needs_quotes',        color_group: 'customer' },
      { name: 'Emotion Curve',       lane_type: 'emotion',             color_group: 'customer' },
      { name: 'Sales Touchpoints',   lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'Marketing Channels',  lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'Sales Team Actions',  lane_type: 'backstage',           color_group: 'backstage' },
      { name: 'CRM & Systems',       lane_type: 'systems',             color_group: 'backstage' },
      { name: 'Revenue Metrics',     lane_type: 'kpis',                color_group: 'backstage' },
    ],
    emotionValues: [0.4, 0.55, 0.6, 0.45, 0.7, 0.8],
    cards: [
      { phaseIndex: 0, laneIndex: 0, title: 'Identifies business problem', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Researches solutions online', color: '#3CBFB0' },
      { phaseIndex: 1, laneIndex: 0, title: 'Reads analyst reports', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Books product demo', color: '#3CBFB0' },
      { phaseIndex: 2, laneIndex: 0, title: 'Runs proof of concept', color: '#3CBFB0' },
      { phaseIndex: 3, laneIndex: 0, title: 'Reviews commercial proposal', color: '#3CBFB0' },
      { phaseIndex: 4, laneIndex: 0, title: 'Completes onboarding programme', color: '#3CBFB0' },
      { phaseIndex: 5, laneIndex: 0, title: 'Renewal decision', color: '#3CBFB0' },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Map',
    description: 'Start with a clean canvas and build your journey map from scratch.',
    category: 'General',
    phases: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
    lanes: [
      { name: 'Customer Activities', lane_type: 'customer_activities', color_group: 'customer' },
      { name: 'Needs & Goals',       lane_type: 'needs_quotes',        color_group: 'customer' },
      { name: 'Emotion Curve',       lane_type: 'emotion',             color_group: 'customer' },
      { name: 'Touchpoints',         lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'Backstage Activities',lane_type: 'backstage',           color_group: 'backstage' },
    ],
    emotionValues: [0.5, 0.5, 0.5, 0.5],
    cards: [],
  },
  {
    id: 'service-blueprint',
    name: 'Service Blueprint',
    description: 'A comprehensive blueprint mapping front-stage and back-stage service operations.',
    category: 'Service Design',
    phases: ['Pre-Service', 'Entry', 'Service Delivery', 'Resolution', 'Exit', 'Post-Service'],
    lanes: [
      { name: 'Customer Actions',    lane_type: 'customer_activities', color_group: 'customer' },
      { name: 'Customer Emotions',   lane_type: 'emotion',             color_group: 'customer' },
      { name: 'Line of Interaction', lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'Front-Stage Actions', lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'Line of Visibility',  lane_type: 'backstage',           color_group: 'backstage' },
      { name: 'Back-Stage Actions',  lane_type: 'backstage',           color_group: 'backstage' },
      { name: 'Support Processes',   lane_type: 'systems',             color_group: 'backstage' },
      { name: 'KPIs',                lane_type: 'kpis',                color_group: 'backstage' },
    ],
    emotionValues: [0.55, 0.6, 0.7, 0.65, 0.75, 0.8],
    cards: [],
  },
  {
    id: 'employee-journey',
    name: 'Employee Journey Map',
    description: 'Map the employee experience from recruitment through to offboarding.',
    category: 'HR',
    phases: ['Attract', 'Recruit', 'Hire', 'Onboard', 'Develop', 'Retain', 'Exit'],
    lanes: [
      { name: 'Employee Activities', lane_type: 'customer_activities', color_group: 'customer' },
      { name: 'Employee Needs',      lane_type: 'needs_quotes',        color_group: 'customer' },
      { name: 'Emotion Curve',       lane_type: 'emotion',             color_group: 'customer' },
      { name: 'HR Touchpoints',      lane_type: 'touchpoints',         color_group: 'touchpoints' },
      { name: 'HR Team Actions',     lane_type: 'backstage',           color_group: 'backstage' },
      { name: 'HRIS & Systems',      lane_type: 'systems',             color_group: 'backstage' },
    ],
    emotionValues: [0.65, 0.6, 0.75, 0.55, 0.7, 0.65, 0.5],
    cards: [],
  },
];
