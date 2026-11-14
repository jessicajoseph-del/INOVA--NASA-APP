import {
  IceExperienceItem,
  MoodItem,
  PartAAnswers,
  PartBEntry,
  SocialDesirabilityItem,
  TraitItem,
} from '../types/assessment';

export const TRAIT_SCALE_LABELS = [
  { value: 1, short: '1', label: 'Very inaccurate' },
  { value: 2, short: '2', label: 'Mostly inaccurate' },
  { value: 3, short: '3', label: 'Slightly inaccurate' },
  { value: 4, short: '4', label: 'Neutral' },
  { value: 5, short: '5', label: 'Slightly accurate' },
  { value: 6, short: '6', label: 'Mostly accurate' },
  { value: 7, short: '7', label: 'Very accurate' },
];

export const PART_A_TRAIT_ITEMS: TraitItem[] = [
  // N — Neuroticism / Emotional Reactivity
  { id: 1, statement: 'I get stressed out easily.', factor: 'N', reversed: false },
  { id: 2, statement: 'I keep my emotions under control.', factor: 'N', reversed: true },
  { id: 3, statement: 'I rarely feel blue or down.', factor: 'N', reversed: true },
  { id: 4, statement: 'I am easily irritated by small things.', factor: 'N', reversed: false },
  { id: 5, statement: 'I worry about things that might go wrong.', factor: 'N', reversed: false },

  // E — Extraversion
  { id: 6, statement: 'I am the life of the group.', factor: 'E', reversed: false },
  { id: 7, statement: "I start conversations with people I don't know.", factor: 'E', reversed: false },
  { id: 8, statement: 'I prefer to keep to myself.', factor: 'E', reversed: true },
  { id: 9, statement: 'I enjoy being around other people.', factor: 'E', reversed: false },
  { id: 10, statement: "I speak up when there's a problem.", factor: 'E', reversed: false },

  // O — Openness
  { id: 11, statement: 'I have a vivid imagination.', factor: 'O', reversed: false },
  { id: 12, statement: 'I enjoy trying new ways of doing things.', factor: 'O', reversed: false },
  { id: 13, statement: 'I am curious about many different things.', factor: 'O', reversed: false },
  { id: 14, statement: "I'm comfortable when plans change at the last minute.", factor: 'O', reversed: false },
  { id: 15, statement: 'I am interested in abstract ideas.', factor: 'O', reversed: false },

  // A — Agreeableness
  { id: 16, statement: 'I take time out for others.', factor: 'A', reversed: false },
  { id: 17, statement: "I sympathise with others' feelings.", factor: 'A', reversed: false },
  { id: 18, statement: "I am not really interested in other people's problems.", factor: 'A', reversed: true },
  { id: 19, statement: 'I go out of my way to help crewmates.', factor: 'A', reversed: false },
  { id: 20, statement: 'I trust people until they give me a reason not to.', factor: 'A', reversed: false },

  // C — Conscientiousness
  { id: 21, statement: 'I get chores done right away.', factor: 'C', reversed: false },
  { id: 22, statement: 'I follow a schedule and stick to it.', factor: 'C', reversed: false },
  { id: 23, statement: 'I leave my belongings around.', factor: 'C', reversed: true },
  { id: 24, statement: 'I am exacting in my work.', factor: 'C', reversed: false },
  { id: 25, statement: 'I complete tasks even when they get tedious.', factor: 'C', reversed: false },
];

export const FACTOR_METADATA: Record<
  'N' | 'E' | 'O' | 'A' | 'C',
  { name: string; contextNote: string }
> = {
  N: {
    name: 'Emotional Reactivity (N)',
    contextNote: 'High N → emotionally reactive under load.',
  },
  E: {
    name: 'Extraversion (E)',
    contextNote: 'High E → vocal in a small crew, needs social contact.',
  },
  O: {
    name: 'Openness (O)',
    contextNote: 'High O → adapts to novelty, may find routine dull.',
  },
  A: {
    name: 'Agreeableness (A)',
    contextNote: 'High A → low friction, may under-report own needs.',
  },
  C: {
    name: 'Conscientiousness (C)',
    contextNote: 'High C → best predictor of adherence to a dull countermeasure schedule.',
  },
};

export const PART_A_SOCIAL_DESIRABILITY: SocialDesirabilityItem[] = [
  { id: 26, statement: 'I have never been annoyed at anyone.' },
  { id: 27, statement: "I never make a promise I can't keep." },
  { id: 28, statement: "I'm always willing to admit it when I make a mistake." },
  { id: 29, statement: 'I have never felt like snapping at someone.' },
  { id: 30, statement: "I am always a good listener no matter who I'm talking to." },
];

export const PART_A_ICE_ITEMS: IceExperienceItem[] = [
  {
    id: 31,
    question: 'Longest previous confinement posting',
    placeholder: 'e.g., 45 days · HERA Campaign / Antarctic winter-over',
  },
  {
    id: 32,
    question: 'What went well in it?',
    placeholder: 'Describe routines, crew dynamics, or communication habits that worked',
  },
  {
    id: 33,
    question: 'What was hardest?',
    placeholder: 'e.g., monotonous week-4 maintenance, delayed ground comms',
  },
  {
    id: 34,
    question: 'Was there a crewmate you disliked? How did you handle it?',
    placeholder: 'Note specific behaviour and concrete coping strategy used',
  },
  {
    id: 35,
    question: 'Was there a conflict that never got resolved? What happened?',
    placeholder: 'Describe honestly without attributing blame',
  },
];

export const PART_B_MOOD_ITEMS: MoodItem[] = [
  { id: 1, statement: 'I felt tense or on edge.', stream: 'Negative' },
  { id: 2, statement: 'I felt irritable or easily annoyed.', stream: 'Negative' },
  { id: 3, statement: 'I felt low or flat.', stream: 'Negative' },
  { id: 4, statement: 'I felt cheerful.', stream: 'Positive' },
  { id: 5, statement: 'I felt confident about the work ahead.', stream: 'Positive' },
  { id: 6, statement: 'I felt connected to my crewmates.', stream: 'Positive' },
];

export const MOOD_SCALE_LABELS = [
  'Not at all',
  'A little',
  'Moderately',
  'Quite a bit',
  'Extremely',
];

export const B3_BEFORE_OPTIONS = [
  'task overload',
  'sleep debt',
  'a specific crewmate',
  'comms delay',
  'family news',
  'failed sim',
  'other',
];

export const B3_BEHAVIOUR_OPTIONS = [
  'Raised voice',
  'missed checklist item',
  'withdrew from the group',
  'delayed a report',
  'skipped a meal',
  'none of these',
];

export const B3_AFTER_OPTIONS = [
  'task removed',
  'someone stepped in',
  'attention',
  'conflict avoided',
  'nothing changed',
];

export const CREW_OBSERVATION_OPTIONS = [
  'Engaged',
  'Coping',
  'Quiet',
  'Withdrawn',
  'Irritable',
] as const;

export const DEFAULT_PART_A: PartAAnswers = {
  traits: {
    1: 2, 2: 6, 3: 6, 4: 2, 5: 3,
    6: 4, 7: 5, 8: 3, 9: 5, 10: 6,
    11: 5, 12: 6, 13: 6, 14: 5, 15: 5,
    16: 5, 17: 6, 18: 2, 19: 6, 20: 5,
    21: 6, 22: 6, 23: 2, 24: 6, 25: 6,
  },
  socialDesirability: {
    26: false,
    27: false,
    28: true,
    29: false,
    30: false,
  },
  iceDays: '45',
  iceNotes: {
    31: '45 days · Analog habitat isolation campaign (HERA)',
    32: 'Structured shared galley meals and concise handoff checklists kept friction low.',
    33: 'Week 4 comms latency paired with repetitive water-recovery filter swaps.',
    34: 'Kept interactions task-focused, scheduled solo treadmill blocks before shift handoffs.',
    35: 'Disagreement on lab bench storage persisted; agreed to split shelf zones until debrief.',
  },
  iceEvidence: {
    confined25Plus: true,
    concreteCoping: true,
    honestConflict: true,
  },
  completedAt: 'L-30 Check',
};

export const INITIAL_MISSION_LOG: PartBEntry[] = [
  // Days 1-7: In-flight Baseline (Neg avg ~ 4.4, Pos avg ~ 12.6)
  {
    day: 1,
    dateLabel: 'FD 01',
    mood: { 1: 2, 2: 1, 3: 1, 4: 4, 5: 5, 6: 4 },
    hoursSlept: 7.2,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: 'Insertion orbit checkout smooth.',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 2,
    dateLabel: 'FD 02',
    mood: { 1: 2, 2: 1, 3: 1, 4: 4, 5: 4, 6: 5 },
    hoursSlept: 7.4,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 3,
    dateLabel: 'FD 03',
    mood: { 1: 1, 2: 2, 3: 1, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 6.9,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Coping',
  },
  {
    day: 4,
    dateLabel: 'FD 04',
    mood: { 1: 2, 2: 2, 3: 1, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 7.0,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 5,
    dateLabel: 'FD 05',
    mood: { 1: 2, 2: 1, 3: 2, 4: 4, 5: 5, 6: 4 },
    hoursSlept: 7.1,
    sleepQuality: 4,
    workload: 2,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 6,
    dateLabel: 'FD 06',
    mood: { 1: 2, 2: 1, 3: 1, 4: 4, 5: 4, 6: 5 },
    hoursSlept: 7.5,
    sleepQuality: 5,
    workload: 2,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 7,
    dateLabel: 'FD 07',
    mood: { 1: 2, 2: 2, 3: 1, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 6.8,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: 'Baseline week complete.',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  // Recent week leading up to Day 24 (Days 18-23)
  {
    day: 18,
    dateLabel: 'FD 18',
    mood: { 1: 2, 2: 1, 3: 1, 4: 4, 5: 4, 6: 5 },
    hoursSlept: 7.1,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  },
  {
    day: 19,
    dateLabel: 'FD 19',
    mood: { 1: 2, 2: 2, 3: 1, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 6.8,
    sleepQuality: 4,
    workload: 3,
    notableEvent: 1,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Coping',
  },
  {
    day: 20,
    dateLabel: 'FD 20',
    mood: { 1: 2, 2: 2, 3: 2, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 6.5,
    sleepQuality: 3,
    workload: 3,
    notableEvent: 2,
    note: 'Cargo stowage run took longer than planned.',
    reflectionType: 'poem',
    reflection:
      'Quiet hull hums through the bulkhead,\nblue earth turns slow below the hatch,\nstill hands measure every breath.',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Coping',
  },
  {
    day: 21,
    dateLabel: 'FD 21',
    mood: { 1: 2, 2: 2, 3: 2, 4: 4, 5: 4, 6: 3 },
    hoursSlept: 6.3,
    sleepQuality: 3,
    workload: 4,
    notableEvent: 2,
    note: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Quiet',
  },
  // Days 22 & 23 show classic early drift (Pos <= -2 dev while Neg remains modest)
  {
    day: 22,
    dateLabel: 'FD 22',
    mood: { 1: 2, 2: 2, 3: 2, 4: 3, 5: 4, 6: 3 },
    hoursSlept: 5.9,
    sleepQuality: 3,
    workload: 4,
    notableEvent: 2,
    note: 'Skipped evening group call to catch up on logs.',
    reflectionType: 'journal',
    reflection:
      'Felt quieter than usual after finishing the inventory checklist. Wanted an hour of uninterrupted silence before sleep shift.',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Quiet',
  },
  {
    day: 23,
    dateLabel: 'FD 23',
    mood: { 1: 3, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3 },
    hoursSlept: 5.6,
    sleepQuality: 2,
    workload: 4,
    notableEvent: 3,
    note: 'Short sleep before O2 scrubber maintenance.',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Withdrawn',
  },
];

export const DEFAULT_DAY_24_DRAFT: PartBEntry = {
  day: 24,
  dateLabel: 'FD 24',
  mood: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 },
  hoursSlept: 5.2,
  sleepQuality: 2,
  workload: 4,
  notableEvent: 3,
  note: 'Failed docking sim after short sleep.',
  reflectionType: 'journal',
  reflection: '',
  b3: {
    before: 'failed sim',
    behaviours: ['withdrew from the group', 'delayed a report'],
    after: 'someone stepped in',
  },
  crewObservation: 'Withdrawn',
};
