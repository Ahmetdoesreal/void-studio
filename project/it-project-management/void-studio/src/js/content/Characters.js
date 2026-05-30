/**
 * Characters.js — NPC definitions with personality traits for LLM dialogue
 */

export const CHARACTERS = {
  stakeholder: {
    id: 'stakeholder',
    name: 'Alex Thornton',
    title: 'Primary Stakeholder',
    emoji: '👔',
    personality: 'Ambitious, impatient, has big vision but doesn\'t understand technical complexity. Frequently changes requirements. Responds well to data.',
    traits: ['demanding', 'visionary', 'impatient', 'data-responsive'],
    dialogue: {
      greeting: 'We need to talk about the project timeline...',
      happy: 'Now THIS is what I\'m talking about! The board will love this.',
      concerned: 'I\'m not sure this is moving fast enough. Our competitors aren\'t sleeping.',
      angry: 'This is unacceptable. We\'re burning through budget with nothing to show for it.',
      impressed: 'I have to admit, you\'ve exceeded expectations here. Well done.'
    }
  },
  techLead: {
    id: 'techLead',
    name: 'Sam Rivera',
    title: 'Tech Lead',
    emoji: '🧑‍💻',
    personality: 'Pragmatic, slightly cynical, deeply cares about code quality. Hates technical debt. Will fight scope creep. Respects well-reasoned decisions even if they disagree.',
    traits: ['pragmatic', 'quality-focused', 'cynical', 'loyal'],
    dialogue: {
      greeting: 'Let me show you the current sprint burndown...',
      happy: 'Clean architecture, good test coverage — this is how you build software.',
      concerned: 'We\'re accumulating tech debt faster than I\'m comfortable with.',
      angry: 'We can\'t keep cutting corners. This codebase is turning into spaghetti.',
      impressed: 'Solid decision. The team respects a PM who understands trade-offs.'
    }
  },
  tester: {
    id: 'tester',
    name: 'Jordan Chen',
    title: 'QA Lead',
    emoji: '🔍',
    personality: 'Meticulous, slightly paranoid (in a good way), finds bugs everywhere. Takes pride in breaking things. Advocate for the end user.',
    traits: ['meticulous', 'persistent', 'user-advocate', 'bug-hunter'],
    dialogue: {
      greeting: 'I found 3 bugs before my coffee this morning.',
      happy: 'All tests passing, no regressions. Today is a good day.',
      concerned: 'Test coverage is dropping. We\'re flying blind in some modules.',
      angry: 'You want to ship THIS? I have 47 open bugs, 12 are critical.',
      impressed: 'A PM who prioritizes testing? I might actually enjoy this project.'
    }
  },
  ops: {
    id: 'ops',
    name: 'Morgan Park',
    title: 'DevOps Engineer',
    emoji: '🔧',
    personality: 'Calm under pressure, speaks in infrastructure metaphors, obsessed with monitoring. Believes everything should be automated. Coffee-powered.',
    traits: ['calm', 'monitoring-obsessed', 'automation-focused', 'coffee-dependent'],
    dialogue: {
      greeting: 'All systems nominal. For now.',
      happy: 'Uptime is 99.99%. The pipeline is flowing like a well-oiled machine.',
      concerned: 'CPU usage is spiking. We might need to scale before launch.',
      angry: 'Someone deployed to prod without going through the pipeline. AGAIN.',
      impressed: 'Proper infrastructure planning? You must be the chosen one.'
    }
  }
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

/**
 * Get a relevant character for the current phase
 */
export function getPhaseCharacter(phaseId) {
  const phaseCharacterMap = {
    requirements: 'stakeholder',
    design: 'techLead',
    implementation: 'techLead',
    testing: 'tester',
    deployment: 'ops',
    maintenance: 'stakeholder'
  };
  return CHARACTERS[phaseCharacterMap[phaseId]] || CHARACTERS.techLead;
}

/**
 * Get character mood based on game state
 */
export function getCharacterMood(character, gameState) {
  const { morale, techDebt, budget, time } = gameState.resources;

  if (morale > 80 && techDebt < 20) return 'impressed';
  if (morale > 60 && budget > 50) return 'happy';
  if (morale < 30 || techDebt > 70) return 'angry';
  if (morale < 50 || budget < 30 || time < 20) return 'concerned';
  return 'happy';
}
