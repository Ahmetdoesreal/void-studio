/**
 * FallbackLogic.js — Predefined game logic when LLM is unavailable
 * Ensures the game is fully playable without AI
 */

import { getRandomEvent, getEventTypeDisplay } from '../content/Events.js';
import { getPhaseCharacter, getCharacterMood } from '../content/Characters.js';

export class FallbackLogic {
  constructor() {
    this.usedEvents = new Set();
  }

  /**
   * Generate an event using predefined templates
   */
  generateEvent(gameContext) {
    const phaseId = gameContext.currentPhase?.toLowerCase()?.replace(/\s+/g, '') || 'requirements';

    // Map phase names to event keys
    const phaseKeyMap = {
      'requirementsgathering': 'requirements',
      'requirements': 'requirements',
      'systemdesign': 'design',
      'design': 'design',
      'implementation': 'implementation',
      'testing&qa': 'testing',
      'testing': 'testing',
      'deployment': 'deployment',
      'maintenance&support': 'maintenance',
      'maintenance': 'maintenance'
    };

    const eventKey = phaseKeyMap[phaseId] || 'requirements';
    const event = getRandomEvent(eventKey);

    if (!event) return null;

    // Adjust impacts based on current state (scale difficulty)
    const adjusted = { ...event };
    if (gameContext.resources.budget < 30) {
      // Give more budget opportunities when low
      adjusted.options = adjusted.options.map(opt => ({
        ...opt,
        impact: {
          ...opt.impact,
          budget: opt.impact.budget + 5
        }
      }));
    }
    if (gameContext.resources.morale < 30) {
      // Give more morale boosts when low
      adjusted.options = adjusted.options.map(opt => ({
        ...opt,
        impact: {
          ...opt.impact,
          morale: opt.impact.morale + 5
        }
      }));
    }

    return adjusted;
  }

  /**
   * Generate a narrative outcome for a decision
   */
  evaluateDecision(event, choice, gameContext) {
    const isPositive = (choice.impact.morale >= 0 && choice.impact.budget >= 0) ||
                        (choice.impact.techDebt <= 0);

    const positiveNarratives = [
      'The team rallied behind your decision. It paid off.',
      'A smart call. The project is on stronger footing now.',
      'Your leadership shines through. The team trusts your judgment.',
      'Risk managed successfully. The office hums with renewed energy.',
      'Well played. The void recedes just a little more.'
    ];

    const negativeNarratives = [
      'A tough decision, but sometimes there are no good options.',
      'The consequences ripple through the project. Time will tell if it was right.',
      'The team is shaken, but they press on.',
      'A setback, but not a fatal one. Yet.',
      'The void seems to press closer for a moment.'
    ];

    const narratives = isPositive ? positiveNarratives : negativeNarratives;

    return {
      narrative: narratives[Math.floor(Math.random() * narratives.length)],
      mood: isPositive ? 'positive' : 'negative'
    };
  }

  /**
   * Generate character dialogue without LLM
   */
  generateDialogue(character, mood, gameContext) {
    const dialogue = character.dialogue[mood] || character.dialogue.greeting;
    return { dialogue };
  }

  /**
   * Decide if an event should trigger (probability-based)
   */
  shouldTriggerEvent(gameContext) {
    // Higher chance of events when resources are extreme
    let baseChance = 0.35; // 35% base chance per task

    if (gameContext.resources.budget < 20) baseChance += 0.15;
    if (gameContext.resources.morale < 20) baseChance += 0.15;
    if (gameContext.resources.techDebt > 70) baseChance += 0.15;
    if (gameContext.resources.time < 20) baseChance += 0.15;

    // Cap at 70%
    baseChance = Math.min(baseChance, 0.70);

    return Math.random() < baseChance;
  }
}
