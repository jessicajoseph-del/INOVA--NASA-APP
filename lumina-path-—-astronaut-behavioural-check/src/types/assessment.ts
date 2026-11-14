export type BigFiveFactor = 'N' | 'E' | 'O' | 'A' | 'C';

export interface TraitItem {
  id: number;
  statement: string;
  factor: BigFiveFactor;
  reversed: boolean;
}

export interface SocialDesirabilityItem {
  id: number;
  statement: string;
}

export interface IceExperienceItem {
  id: number;
  question: string;
  placeholder: string;
}

export interface PartAAnswers {
  traits: Record<number, number>; // item 1..25 => 1..7
  socialDesirability: Record<number, boolean | null>; // item 26..30 => true/false
  iceDays: string;
  iceNotes: Record<number, string>; // item 31..35
  iceEvidence: {
    confined25Plus: boolean;
    concreteCoping: boolean;
    honestConflict: boolean;
  };
  completedAt?: string;
}

export type FactorBand = 'Low' | 'Average' | 'High' | 'Very high';

export interface FactorResult {
  factor: BigFiveFactor;
  label: string;
  rawSum: number;
  mean: number;
  band: FactorBand;
  bandMeaning: string;
  contextNote: string;
}

export interface PartAResult {
  factors: FactorResult[];
  socialDesirabilityScore: number;
  socialDesirabilityAnswered: number;
  isContaminated: boolean;
  iceEvidenceScore: number;
  iceSummaryLabel: string;
  isComplete: boolean;
}

export interface MoodItem {
  id: number;
  statement: string;
  stream: 'Negative' | 'Positive';
}

export type CrewObservation = 'Engaged' | 'Coping' | 'Quiet' | 'Withdrawn' | 'Irritable';

export interface B3FollowUp {
  before: string | null;
  behaviours: string[];
  after: string | null;
}

export interface PartBEntry {
  day: number;
  dateLabel: string;
  mood: Record<number, number>; // item 1..6 => 1..5
  hoursSlept: number;
  sleepQuality: number; // 1..5
  workload: number; // 1..5
  notableEvent: number; // 1..5
  note: string;
  reflectionType?: 'journal' | 'poem';
  reflection?: string;
  b3: B3FollowUp;
  crewObservation: CrewObservation;
}

export interface PVTTrial {
  reactionTimeMs: number | null;
  outcome: 'response' | 'false-start' | 'miss';
}

export interface PVTResult {
  id: string;
  completedAt: string;
  durationSeconds: number;
  medianReactionTimeMs: number | null;
  lapses: number;
  falseStarts: number;
  misses: number;
  validResponses: number;
  lapseThresholdMs: number;
  interrupted: boolean;
  trials: PVTTrial[];
}

export type AssessmentStatus = 'On track' | 'Watch' | 'Drift' | 'Alert';

export interface BaselineMetrics {
  negativeMean: number;
  positiveMean: number;
  daysUsed: number;
  isCalibrated: boolean;
}

export interface ScoredDay {
  day: number;
  dateLabel: string;
  negativeScore: number; // 3..15
  positiveScore: number; // 3..15
  negDeviation: number;
  posDeviation: number;
  hoursSlept: number;
  sleepDebt: number;
  sleepSurplus: number;
  sleepQuality: number;
  workload: number;
  notableEvent: number;
  loadIndex: number;
  loadTier: 'low' | 'moderate' | 'high' | 'critical';
  b3Triggered: boolean;
  hasSubstantiveB3: boolean;
  b3: B3FollowUp;
  b3Hypothesis: string | null;
  status: AssessmentStatus;
  consecutiveDriftDays: number;
  flagAction: string;
  interpretationText: string;
  selfReportLabel: string;
  crewObservation: CrewObservation;
  isDiscordant: boolean;
  recommendedActions: string[];
  note: string;
}
