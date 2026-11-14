import { TaskNode } from '../types';

export const INITIAL_TASKS: TaskNode[] = [
  {
    id: 'stage-1',
    title: 'Light the First Beacon',
    description: 'Awaken the luminous oat conduit at the top ridge and power up the very first stage.',
    status: 'unlocked',
    stars: 0,
    subtasks: [
      { id: 's1-1', title: 'Ignite base power core', done: false },
      { id: 's1-2', title: 'Sync twin star prism', done: false },
    ],
  },
  {
    id: 'stage-2',
    title: 'Cross the Ink Trench',
    description: 'Bridge the deep current bend and channel bright shooting energy across the upper valley.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's2-1', title: 'Stabilize optical arch', done: false },
      { id: 's2-2', title: 'Collect valley starlight', done: false },
    ],
  },
  {
    id: 'stage-3',
    title: 'Ignite the Gold Relay',
    description: 'Channel the fast fiber pulse through the mid-ridge relay to unlock the lower spiral.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's3-1', title: 'Align gold prism lock', done: false },
      { id: 's3-2', title: 'Send surge down the bend', done: false },
    ],
  },
  {
    id: 'stage-4',
    title: 'Ride the Optical Current',
    description: 'Sweep around the outer right hairpin and boost photon speed along the main circuit.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's4-1', title: 'Open hairpin conduit', done: false },
      { id: 's4-2', title: 'Boost relay velocity', done: false },
    ],
  },
  {
    id: 'stage-5',
    title: 'Balance the Star Prism',
    description: 'Cross back into the western sector and harmonize the three golden resonance crystals.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's5-1', title: 'Tune crystal frequency', done: false },
      { id: 's5-2', title: 'Lock western anchor', done: false },
    ],
  },
  {
    id: 'stage-6',
    title: 'Unlock the Twin Gate',
    description: 'Loop around the western crest and energize the twin optical gates guarding the lower descent.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's6-1', title: 'Charge twin gate coils', done: false },
      { id: 's6-2', title: 'Clear lower crossing', done: false },
    ],
  },
  {
    id: 'stage-7',
    title: 'Charge the Vault Core',
    description: 'Direct full optical voltage toward the final bend right above the golden trophy vault.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's7-1', title: 'Link high-speed conduit', done: false },
      { id: 's7-2', title: 'Prime vault capacitor', done: false },
    ],
  },
  {
    id: 'stage-8',
    title: 'Claim the Crown Circuit',
    description: 'Complete the final stage to unleash full shooting fiber-optic power into the Trophy Vault.',
    status: 'locked',
    stars: 0,
    subtasks: [
      { id: 's8-1', title: 'Seal final star lock', done: false },
      { id: 's8-2', title: 'Unlock golden trophy vault', done: false },
    ],
  },
];
