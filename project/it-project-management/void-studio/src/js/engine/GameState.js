/**
 * GameState.js — Central game state machine
 * Manages SDLC phase progression, resources, and game status
 */

import { SDLC_PHASES, TOTAL_PHASES } from '../content/SDLCPhases.js';

export const GAME_STATUS = {
  LOADING: 'loading',
  INTRO: 'intro',
  PLAYING: 'playing',
  EVENT: 'event',
  PHASE_TRANSITION: 'phase_transition',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

const DEFAULT_RESOURCES = {
  budget: 100,      // 0-100
  morale: 80,       // 0-100
  techDebt: 10,     // 0-100 (higher = worse)
  time: 100         // 0-100
};

export class GameState {
  constructor() {
    this.status = GAME_STATUS.LOADING;
    this.currentPhaseIndex = 0;
    this.currentTaskIndex = 0;
    this.completedTasks = new Set();
    this.completedPhases = new Set();
    this.resources = { ...DEFAULT_RESOURCES };
    this.history = [];
    this.score = 0;
    this.eventsTriggered = 0;
    this.turnNumber = 0;
    this.unlockedOfficeItems = [];
    this.listeners = new Map();
  }

  // === Event System ===
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // === Getters ===
  get currentPhase() {
    return SDLC_PHASES[this.currentPhaseIndex];
  }

  get currentTasks() {
    return this.currentPhase?.tasks || [];
  }

  get currentTask() {
    return this.currentTasks[this.currentTaskIndex];
  }

  get phaseProgress() {
    const totalTasks = this.currentTasks.length;
    const completed = this.currentTasks.filter(t => this.completedTasks.has(t.id)).length;
    return totalTasks > 0 ? completed / totalTasks : 0;
  }

  get isPhaseComplete() {
    return this.currentTasks.every(t => this.completedTasks.has(t.id));
  }

  get isGameComplete() {
    return this.completedPhases.size >= TOTAL_PHASES;
  }

  get isGameOver() {
    return this.resources.budget <= 0 || 
           this.resources.morale <= 0 ||
           this.resources.time <= 0 ||
           this.resources.techDebt >= 100;
  }

  get gameOverReason() {
    if (this.resources.budget <= 0) return 'Budget depleted. The company can\'t sustain operations.';
    if (this.resources.morale <= 0) return 'Team morale collapsed. The entire team has quit.';
    if (this.resources.time <= 0) return 'Time ran out. The deadline passed and the project was cancelled.';
    if (this.resources.techDebt >= 100) return 'Technical debt overwhelmed the codebase. The project is unsalvageable.';
    return 'Unknown failure.';
  }

  // === Actions ===
  setStatus(status) {
    const prev = this.status;
    this.status = status;
    this.emit('statusChange', { prev, current: status });
  }

  completeTask(taskId) {
    if (this.completedTasks.has(taskId)) return;

    this.completedTasks.add(taskId);
    this.turnNumber++;
    this.score += 10;

    // Apply small time/resource cost per task
    this.applyResourceDelta({ time: -3, budget: -2 });

    this.emit('taskCompleted', { taskId, phase: this.currentPhase });

    // Check if phase is now complete
    if (this.isPhaseComplete) {
      this.completePhase();
    }
  }

  completePhase() {
    const phase = this.currentPhase;
    this.completedPhases.add(phase.id);

    // Apply phase completion rewards
    this.applyResourceDelta(phase.resourceReward);
    this.score += 50 * (this.currentPhaseIndex + 1);

    // Record office unlocks
    this.unlockedOfficeItems.push(...phase.officeUnlocks);

    this.emit('phaseCompleted', { 
      phase, 
      phaseIndex: this.currentPhaseIndex,
      unlocks: phase.officeUnlocks 
    });

    this.addHistory(`Phase completed: ${phase.name}`);
  }

  advanceToNextPhase() {
    if (this.currentPhaseIndex < TOTAL_PHASES - 1) {
      this.currentPhaseIndex++;
      this.currentTaskIndex = 0;
      this.emit('phaseStarted', { phase: this.currentPhase, phaseIndex: this.currentPhaseIndex });
      this.addHistory(`Phase started: ${this.currentPhase.name}`);
    } else {
      this.setStatus(GAME_STATUS.VICTORY);
      this.emit('victory', { score: this.score, history: this.history });
    }
  }

  advanceTask() {
    const task = this.currentTask;
    if (!task) return null;

    this.completeTask(task.id);

    // Move to next uncompleted task
    const nextIndex = this.currentTasks.findIndex(
      (t, i) => i > this.currentTaskIndex && !this.completedTasks.has(t.id)
    );
    if (nextIndex >= 0) {
      this.currentTaskIndex = nextIndex;
    }

    return task;
  }

  applyResourceDelta(delta) {
    const prev = { ...this.resources };

    if (delta.budget !== undefined) this.resources.budget = this.clamp(this.resources.budget + delta.budget, 0, 100);
    if (delta.morale !== undefined) this.resources.morale = this.clamp(this.resources.morale + delta.morale, 0, 100);
    if (delta.techDebt !== undefined) this.resources.techDebt = this.clamp(this.resources.techDebt + delta.techDebt, 0, 100);
    if (delta.time !== undefined) this.resources.time = this.clamp(this.resources.time + delta.time, 0, 100);

    this.emit('resourcesChanged', { prev, current: { ...this.resources }, delta });

    // Check game over condition
    if (this.isGameOver) {
      this.setStatus(GAME_STATUS.GAME_OVER);
      this.emit('gameOver', { reason: this.gameOverReason, score: this.score });
    }
  }

  applyEventChoice(event, choice) {
    this.eventsTriggered++;
    this.applyResourceDelta(choice.impact);
    this.addHistory(`Event: ${event.title} → Chose: "${choice.text}"`);
    this.emit('eventResolved', { event, choice });
  }

  addHistory(entry) {
    this.history.push({
      turn: this.turnNumber,
      phase: this.currentPhase?.id,
      text: entry,
      timestamp: Date.now()
    });
  }

  // === Serialization ===
  toJSON() {
    return {
      status: this.status,
      currentPhaseIndex: this.currentPhaseIndex,
      currentTaskIndex: this.currentTaskIndex,
      completedTasks: [...this.completedTasks],
      completedPhases: [...this.completedPhases],
      resources: { ...this.resources },
      history: this.history,
      score: this.score,
      eventsTriggered: this.eventsTriggered,
      turnNumber: this.turnNumber,
      unlockedOfficeItems: this.unlockedOfficeItems
    };
  }

  /**
   * Get a condensed state for LLM context
   */
  toLLMContext() {
    return {
      currentPhase: this.currentPhase?.name,
      phaseProgress: `${Math.round(this.phaseProgress * 100)}%`,
      resources: this.resources,
      completedPhases: [...this.completedPhases],
      recentHistory: this.history.slice(-5).map(h => h.text),
      turnNumber: this.turnNumber,
      difficulty: this.currentPhase?.difficulty || 1
    };
  }

  // === Helpers ===
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  reset() {
    this.status = GAME_STATUS.INTRO;
    this.currentPhaseIndex = 0;
    this.currentTaskIndex = 0;
    this.completedTasks = new Set();
    this.completedPhases = new Set();
    this.resources = { ...DEFAULT_RESOURCES };
    this.history = [];
    this.score = 0;
    this.eventsTriggered = 0;
    this.turnNumber = 0;
    this.unlockedOfficeItems = [];
    this.emit('reset', {});
  }
}
