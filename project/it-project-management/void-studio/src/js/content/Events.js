/**
 * Events.js — Predefined event library
 * Used as fallback when LLM is unavailable, and as seed data for LLM
 */

export const EVENT_TYPES = {
  CRISIS: 'crisis',
  OPPORTUNITY: 'opportunity',
  STAKEHOLDER: 'stakeholder',
  TECHNICAL: 'technical',
  TEAM: 'team'
};

export const EVENTS = {
  requirements: [
    {
      id: 'req-evt-1',
      type: EVENT_TYPES.STAKEHOLDER,
      title: 'Scope Creep Emergency',
      description: 'The primary stakeholder just called. They want to add 3 new features to the requirements before sign-off. The deadline hasn\'t changed.',
      options: [
        { id: 'a', text: 'Accept all features and adjust timeline', impact: { budget: -15, morale: -10, techDebt: 5, time: -8 } },
        { id: 'b', text: 'Push back with data — show the cost', impact: { budget: 0, morale: 5, techDebt: 0, time: 0 } },
        { id: 'c', text: 'Accept 1 feature, defer the rest to v2', impact: { budget: -5, morale: 0, techDebt: 2, time: -3 } }
      ]
    },
    {
      id: 'req-evt-2',
      type: EVENT_TYPES.TEAM,
      title: 'Requirements Analyst Quits',
      description: 'Your lead requirements analyst just gave their two-week notice. Critical domain knowledge is at risk.',
      options: [
        { id: 'a', text: 'Offer a retention bonus', impact: { budget: -20, morale: 5, techDebt: 0, time: 0 } },
        { id: 'b', text: 'Start immediate knowledge transfer', impact: { budget: -5, morale: -5, techDebt: 5, time: -3 } },
        { id: 'c', text: 'Hire a contractor quickly', impact: { budget: -25, morale: 0, techDebt: 10, time: -2 } }
      ]
    },
    {
      id: 'req-evt-3',
      type: EVENT_TYPES.OPPORTUNITY,
      title: 'Competitor Analysis Gold',
      description: 'A team member found a detailed public analysis of your competitor\'s failed product. It contains valuable insights.',
      options: [
        { id: 'a', text: 'Dedicate a day to study it thoroughly', impact: { budget: 0, morale: 5, techDebt: -5, time: -1 } },
        { id: 'b', text: 'Quick skim and move on', impact: { budget: 0, morale: 0, techDebt: 0, time: 0 } },
        { id: 'c', text: 'Share with the team for group analysis', impact: { budget: 0, morale: 10, techDebt: -8, time: -2 } }
      ]
    }
  ],
  design: [
    {
      id: 'des-evt-1',
      type: EVENT_TYPES.TECHNICAL,
      title: 'Architecture Debate',
      description: 'The team is split: microservices or monolith? Both sides have strong arguments and the debate is getting heated.',
      options: [
        { id: 'a', text: 'Go microservices — future-proof', impact: { budget: -15, morale: -5, techDebt: -10, time: -5 } },
        { id: 'b', text: 'Go monolith — ship faster', impact: { budget: 5, morale: 5, techDebt: 15, time: 3 } },
        { id: 'c', text: 'Modular monolith — compromise', impact: { budget: -5, morale: 10, techDebt: 0, time: 0 } }
      ]
    },
    {
      id: 'des-evt-2',
      type: EVENT_TYPES.STAKEHOLDER,
      title: 'UI Overhaul Request',
      description: 'The CEO saw a competitor\'s app and now wants a complete redesign of the UI. "Make it look like that but better."',
      options: [
        { id: 'a', text: 'Full redesign — the CEO is the boss', impact: { budget: -20, morale: -15, techDebt: 10, time: -8 } },
        { id: 'b', text: 'Propose a phased approach', impact: { budget: -8, morale: -5, techDebt: 3, time: -3 } },
        { id: 'c', text: 'Show data that current design tests better', impact: { budget: 0, morale: 5, techDebt: 0, time: 0 } }
      ]
    }
  ],
  implementation: [
    {
      id: 'imp-evt-1',
      type: EVENT_TYPES.TECHNICAL,
      title: 'Critical Dependency Vulnerability',
      description: 'A zero-day vulnerability has been discovered in a core library you depend on. No patch is available yet.',
      options: [
        { id: 'a', text: 'Write a temporary workaround', impact: { budget: -5, morale: -5, techDebt: 20, time: -2 } },
        { id: 'b', text: 'Fork the library and fix it yourself', impact: { budget: -10, morale: 0, techDebt: 5, time: -5 } },
        { id: 'c', text: 'Switch to an alternative library', impact: { budget: -15, morale: -10, techDebt: -5, time: -8 } }
      ]
    },
    {
      id: 'imp-evt-2',
      type: EVENT_TYPES.CRISIS,
      title: 'The 3 AM Database Incident',
      description: 'The dev database was accidentally wiped. Last backup is 3 days old. Sprint work is at risk.',
      options: [
        { id: 'a', text: 'Restore from backup, lose 3 days of data', impact: { budget: 0, morale: -15, techDebt: 5, time: -3 } },
        { id: 'b', text: 'Attempt manual recovery (risky)', impact: { budget: -10, morale: -10, techDebt: 10, time: -5 } },
        { id: 'c', text: 'Rally the team for a recovery sprint', impact: { budget: -5, morale: -20, techDebt: 0, time: -2 } }
      ]
    },
    {
      id: 'imp-evt-3',
      type: EVENT_TYPES.OPPORTUNITY,
      title: 'Open Source Jackpot',
      description: 'You found an open-source project that implements 40% of your planned functionality. Well-maintained, MIT licensed.',
      options: [
        { id: 'a', text: 'Integrate it — save weeks of work', impact: { budget: 10, morale: 15, techDebt: 8, time: 5 } },
        { id: 'b', text: 'Study it for inspiration, build your own', impact: { budget: 0, morale: 5, techDebt: -5, time: -2 } },
        { id: 'c', text: 'Fork and customize it', impact: { budget: 5, morale: 10, techDebt: 12, time: 3 } }
      ]
    }
  ],
  testing: [
    {
      id: 'tst-evt-1',
      type: EVENT_TYPES.CRISIS,
      title: 'Test Environment Down',
      description: 'The staging environment has been down for 6 hours. Testing is completely blocked.',
      options: [
        { id: 'a', text: 'All hands on deck — fix staging', impact: { budget: -5, morale: -10, techDebt: 0, time: -2 } },
        { id: 'b', text: 'Test locally while waiting for DevOps', impact: { budget: 0, morale: -5, techDebt: 5, time: -1 } },
        { id: 'c', text: 'Use this time for documentation', impact: { budget: 0, morale: 5, techDebt: -3, time: -1 } }
      ]
    },
    {
      id: 'tst-evt-2',
      type: EVENT_TYPES.TECHNICAL,
      title: 'Flaky Tests Epidemic',
      description: '30% of your automated tests are flaky — they pass sometimes, fail other times. The team is losing trust in the test suite.',
      options: [
        { id: 'a', text: 'Dedicate a sprint to fix flaky tests', impact: { budget: -5, morale: 5, techDebt: -15, time: -5 } },
        { id: 'b', text: 'Disable flaky tests, focus on manual QA', impact: { budget: 0, morale: 0, techDebt: 15, time: 2 } },
        { id: 'c', text: 'Quarantine and fix incrementally', impact: { budget: -3, morale: 5, techDebt: -5, time: -2 } }
      ]
    }
  ],
  deployment: [
    {
      id: 'dep-evt-1',
      type: EVENT_TYPES.CRISIS,
      title: 'Production Rollback',
      description: 'The deployment went live but users are reporting critical errors. Response times are 10x normal.',
      options: [
        { id: 'a', text: 'Immediate rollback to previous version', impact: { budget: -5, morale: -15, techDebt: 5, time: -3 } },
        { id: 'b', text: 'Hot-fix in production (dangerous)', impact: { budget: 0, morale: -20, techDebt: 20, time: -1 } },
        { id: 'c', text: 'Scale up infrastructure as stopgap', impact: { budget: -20, morale: -5, techDebt: 10, time: -2 } }
      ]
    },
    {
      id: 'dep-evt-2',
      type: EVENT_TYPES.OPPORTUNITY,
      title: 'Press Coverage',
      description: 'A tech blog wants to cover your launch. Great publicity but they need a demo in 24 hours.',
      options: [
        { id: 'a', text: 'All-nighter to prep the demo', impact: { budget: 0, morale: -10, techDebt: 5, time: -1 } },
        { id: 'b', text: 'Show what we have — warts and all', impact: { budget: 0, morale: 5, techDebt: 0, time: 0 } },
        { id: 'c', text: 'Decline — focus on stability', impact: { budget: 0, morale: -5, techDebt: -5, time: 1 } }
      ]
    }
  ],
  maintenance: [
    {
      id: 'mnt-evt-1',
      type: EVENT_TYPES.STAKEHOLDER,
      title: 'Feature Request Flood',
      description: 'Users love the product — but they have 47 feature requests, 12 of which are "critical." The team is overwhelmed.',
      options: [
        { id: 'a', text: 'Structured prioritization session', impact: { budget: 0, morale: 10, techDebt: 0, time: -2 } },
        { id: 'b', text: 'Quick wins first — build momentum', impact: { budget: -5, morale: 15, techDebt: 5, time: -3 } },
        { id: 'c', text: 'Hire additional developers', impact: { budget: -25, morale: 5, techDebt: 0, time: 2 } }
      ]
    },
    {
      id: 'mnt-evt-2',
      type: EVENT_TYPES.TEAM,
      title: 'Team Celebration',
      description: 'The team has been working incredibly hard. Morale is fragile. Someone suggests a team dinner.',
      options: [
        { id: 'a', text: 'Company-sponsored dinner + bonuses', impact: { budget: -15, morale: 25, techDebt: 0, time: 0 } },
        { id: 'b', text: 'Virtual celebration (cheaper)', impact: { budget: -3, morale: 10, techDebt: 0, time: 0 } },
        { id: 'c', text: 'Ship first, celebrate later', impact: { budget: 0, morale: -10, techDebt: 0, time: 1 } }
      ]
    }
  ]
};

/**
 * Get a random event for the given phase
 */
export function getRandomEvent(phaseId) {
  const phaseEvents = EVENTS[phaseId];
  if (!phaseEvents || phaseEvents.length === 0) return null;
  return phaseEvents[Math.floor(Math.random() * phaseEvents.length)];
}

/**
 * Get event type styling
 */
export function getEventTypeDisplay(type) {
  const displays = {
    [EVENT_TYPES.CRISIS]: { emoji: '🔥', label: 'CRISIS', color: '#ff6b6b' },
    [EVENT_TYPES.OPPORTUNITY]: { emoji: '⭐', label: 'OPPORTUNITY', color: '#ffd93d' },
    [EVENT_TYPES.STAKEHOLDER]: { emoji: '👔', label: 'STAKEHOLDER', color: '#a855f7' },
    [EVENT_TYPES.TECHNICAL]: { emoji: '⚙️', label: 'TECHNICAL', color: '#3b82f6' },
    [EVENT_TYPES.TEAM]: { emoji: '👥', label: 'TEAM', color: '#00d4aa' }
  };
  return displays[type] || displays[EVENT_TYPES.TECHNICAL];
}
