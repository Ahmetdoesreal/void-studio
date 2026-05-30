/**
 * main.js — Void Studio Entry Point
 * Orchestrates the game engine, 3D renderer, UI, and LLM integration
 */

import { GameState, GAME_STATUS } from './engine/GameState.js';
import { ResourceManager } from './engine/ResourceManager.js';
import { VoidRenderer } from './renderer/VoidRenderer.js';
import { LLMBridge } from './llm/LLMBridge.js';
import { FallbackLogic } from './llm/FallbackLogic.js';
import { SDLC_PHASES } from './content/SDLCPhases.js';
import { getEventTypeDisplay } from './content/Events.js';
import { getPhaseCharacter, getCharacterMood } from './content/Characters.js';

class VoidStudio {
  constructor() {
    this.gameState = new GameState();
    this.renderer = null;
    this.resourceManager = null;
    this.llmBridge = new LLMBridge();
    this.fallbackLogic = new FallbackLogic();
    this.useLLM = true;
    this.currentEvent = null;
    this.isProcessing = false;

    this.init();
  }

  async init() {
    this.updateLoadingBar(10, 'Initializing engine...');

    // Initialize Three.js renderer
    const container = document.getElementById('canvas-container');
    this.renderer = new VoidRenderer(container);
    this.updateLoadingBar(40, 'Void rendered...');

    // Initialize resource manager
    this.resourceManager = new ResourceManager(this.gameState);
    this.updateLoadingBar(50, 'Systems online...');

    // Bind game state events
    this.bindGameEvents();
    this.updateLoadingBar(60, 'Events wired...');

    // Bind UI events
    this.bindUIEvents();
    this.updateLoadingBar(70, 'Interface ready...');

    // Check LLM toggle
    const llmToggle = document.getElementById('llm-toggle');
    this.useLLM = llmToggle?.checked ?? false;

    // Initialize LLM if enabled
    if (this.useLLM) {
      this.updateLoadingBar(75, 'Preparing AI Game Master...');
      try {
        this.llmBridge.onProgress = (progress, text) => {
          const pct = 75 + (progress * 20);
          this.updateLoadingBar(pct, text || 'Loading AI model...');
        };
        this.llmBridge.onStatusChange = (status, message) => {
          this.updateAIStatus(status, message);
        };
        await this.llmBridge.init();
        this.updateLoadingBar(95, 'AI Game Master ready!');
      } catch (err) {
        console.warn('LLM failed to load, using fallback logic:', err);
        this.useLLM = false;
        this.updateLoadingBar(95, 'AI unavailable — using classic mode');
      }
    } else {
      this.updateLoadingBar(95, 'Classic mode — no AI');
    }

    // Show intro
    this.updateLoadingBar(100, 'Ready!');
    await this.delay(500);

    // Fade out loading screen, show intro
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    await this.delay(1200);
    loadingScreen.style.display = 'none';

    // Show intro screen
    this.gameState.setStatus(GAME_STATUS.INTRO);
    const introScreen = document.getElementById('intro-screen');
    introScreen.classList.remove('hidden');
  }

  // === Event Binding ===

  bindGameEvents() {
    this.gameState.on('statusChange', ({ current }) => {
      this.onStatusChange(current);
    });

    this.gameState.on('taskCompleted', ({ taskId, phase }) => {
      this.onTaskCompleted(taskId, phase);
    });

    this.gameState.on('phaseCompleted', ({ phase, phaseIndex, unlocks }) => {
      this.onPhaseCompleted(phase, phaseIndex, unlocks);
    });

    this.gameState.on('phaseStarted', ({ phase, phaseIndex }) => {
      this.onPhaseStarted(phase, phaseIndex);
    });

    this.gameState.on('resourcesChanged', ({ current }) => {
      // Resource manager handles the UI update
    });

    this.gameState.on('gameOver', ({ reason, score }) => {
      this.onGameOver(reason, score);
    });

    this.gameState.on('victory', ({ score }) => {
      this.onVictory(score);
    });
  }

  bindUIEvents() {
    // Start button
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.startGame();
    });

    // Execute task button
    document.getElementById('btn-advance')?.addEventListener('click', () => {
      this.executeTask();
    });

    // Review button
    document.getElementById('btn-review')?.addEventListener('click', () => {
      this.showReview();
    });

    // Consult AI button
    document.getElementById('btn-consult')?.addEventListener('click', () => {
      this.consultAI();
    });

    // Continue button (phase transition)
    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.continueToNextPhase();
    });

    // LLM toggle on loading screen
    document.getElementById('llm-toggle')?.addEventListener('change', (e) => {
      this.useLLM = e.target.checked;
    });
  }

  // === Game Flow ===

  async startGame() {
    const introScreen = document.getElementById('intro-screen');
    introScreen.classList.add('hidden');

    await this.delay(800);

    // Show HUD
    const hud = document.getElementById('hud');
    hud.classList.remove('hidden');

    // Start the game
    this.gameState.setStatus(GAME_STATUS.PLAYING);
    this.gameState.addHistory('Project started. The void awaits.');

    // Update UI for first phase
    this.updatePhaseProgress();
    this.updateObjectivePanel();
    this.resourceManager.refresh();

    // Update AI status
    if (this.useLLM && this.llmBridge.isAvailable) {
      this.updateAIStatus('active', 'AI Game Master watching...');
    } else {
      this.updateAIStatus('offline', 'Classic mode — no AI');
    }

    // Focus camera
    this.renderer.focusOn(2, 2, false);
  }

  async executeTask() {
    if (this.isProcessing || this.gameState.status !== GAME_STATUS.PLAYING) return;
    this.isProcessing = true;

    const task = this.gameState.advanceTask();
    if (!task) {
      this.isProcessing = false;
      return;
    }

    // Update objective panel
    this.updateObjectivePanel();

    // Check if an event should trigger
    const context = this.gameState.toLLMContext();
    const shouldEvent = this.fallbackLogic.shouldTriggerEvent(context);

    if (shouldEvent && !this.gameState.isPhaseComplete) {
      await this.delay(600);
      await this.triggerEvent();
    }

    this.isProcessing = false;
  }

  async triggerEvent() {
    const context = this.gameState.toLLMContext();
    let event = null;

    // Try LLM first, then fallback
    if (this.useLLM && this.llmBridge.isAvailable) {
      this.updateAIStatus('thinking', 'AI is crafting an event...');
      event = await this.llmBridge.generateEvent(context);
    }

    if (!event) {
      event = this.fallbackLogic.generateEvent(context);
    }

    if (!event) {
      return; // No event to show
    }

    this.currentEvent = event;
    this.gameState.setStatus(GAME_STATUS.EVENT);
    this.showDecisionPanel(event);
  }

  showDecisionPanel(event) {
    const panel = document.getElementById('decision-panel');
    const typeDisplay = getEventTypeDisplay(event.type);

    document.getElementById('decision-type').textContent = `${typeDisplay.emoji} ${typeDisplay.label}`;
    document.getElementById('decision-type').style.color = typeDisplay.color;
    document.getElementById('decision-type').style.background = `${typeDisplay.color}22`;
    document.getElementById('decision-title').textContent = event.title;
    document.getElementById('decision-description').textContent = event.description;

    const optionsContainer = document.getElementById('decision-options');
    optionsContainer.innerHTML = '';

    event.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'decision-option';
      btn.innerHTML = `
        <div class="decision-option-text">${option.text}</div>
        <div class="decision-option-impact">
          ${this.formatImpact(option.impact)}
        </div>
      `;
      btn.addEventListener('click', () => this.resolveEvent(event, option));
      optionsContainer.appendChild(btn);
    });

    panel.classList.remove('hidden');
  }

  async resolveEvent(event, choice) {
    // Hide decision panel
    document.getElementById('decision-panel').classList.add('hidden');

    // Apply the choice
    this.gameState.applyEventChoice(event, choice);

    // Get narrative feedback
    const context = this.gameState.toLLMContext();
    let evaluation = null;

    if (this.useLLM && this.llmBridge.isAvailable) {
      this.updateAIStatus('thinking', 'AI evaluating your decision...');
      evaluation = await this.llmBridge.evaluateDecision(event, choice, context);
    }

    if (!evaluation) {
      evaluation = this.fallbackLogic.evaluateDecision(event, choice, context);
    }

    // Show brief narrative feedback via AI panel
    if (evaluation) {
      const aiThought = document.getElementById('ai-thought');
      aiThought.textContent = evaluation.narrative;
      aiThought.style.color = evaluation.mood === 'positive' ? '#00d4aa' :
                              evaluation.mood === 'negative' ? '#ff6b6b' : '#a0a0c0';

      // Reset color after 5 seconds
      setTimeout(() => {
        aiThought.style.color = '';
      }, 5000);
    }

    this.currentEvent = null;

    // Check if phase was completed during the event resolution
    if (this.gameState.isPhaseComplete) {
      // Phase completion is already handled by the GameState
    } else {
      this.gameState.setStatus(GAME_STATUS.PLAYING);
    }

    this.updatePhaseProgress();
    this.updateObjectivePanel();
  }

  async onPhaseCompleted(phase, phaseIndex, unlocks) {
    this.gameState.setStatus(GAME_STATUS.PHASE_TRANSITION);

    // Show phase transition screen
    const transitionScreen = document.getElementById('phase-transition');
    document.getElementById('transition-badge').textContent = `PHASE ${phaseIndex + 1} COMPLETE`;
    document.getElementById('transition-title').textContent = phase.name;
    document.getElementById('transition-subtitle').textContent = 'New office space materializing from the void...';

    // Show unlocked items
    const unlocksContainer = document.getElementById('transition-unlocks');
    unlocksContainer.innerHTML = '';
    unlocks.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'unlock-item';
      el.style.animationDelay = `${0.6 + i * 0.15}s`;
      el.textContent = `✨ ${item.name}`;
      unlocksContainer.appendChild(el);
    });

    transitionScreen.classList.remove('hidden');

    // Materialize office items in 3D
    this.renderer.unlockItems(unlocks);

    // Update phase progress dots
    this.updatePhaseProgress();

    // Update void class on body
    document.body.className = `void-phase-${phase.id}`;
  }

  async continueToNextPhase() {
    const transitionScreen = document.getElementById('phase-transition');
    transitionScreen.classList.add('hidden');

    await this.delay(500);

    this.gameState.advanceToNextPhase();

    if (this.gameState.status !== GAME_STATUS.VICTORY) {
      this.gameState.setStatus(GAME_STATUS.PLAYING);
    }
  }

  onPhaseStarted(phase, phaseIndex) {
    this.updatePhaseProgress();
    this.updateObjectivePanel();

    // Focus camera on new area
    const firstUnlock = phase.officeUnlocks[0];
    if (firstUnlock) {
      this.renderer.focusOn(firstUnlock.gridPos.x + 2, firstUnlock.gridPos.z + 2);
    }

    // Update AI with phase context
    if (this.useLLM && this.llmBridge.isAvailable) {
      this.updateAIStatus('active', `Monitoring ${phase.name}...`);
    }
  }

  onTaskCompleted(taskId, phase) {
    this.updateObjectivePanel();
    this.updatePhaseProgress();
  }

  onStatusChange(status) {
    // Additional status-specific handling
  }

  async onGameOver(reason, score) {
    // Use the phase transition screen for game over
    const transitionScreen = document.getElementById('phase-transition');
    document.getElementById('transition-badge').textContent = '💀 GAME OVER';
    document.getElementById('transition-badge').style.color = '#ff6b6b';
    document.getElementById('transition-title').textContent = 'The Void Reclaims All';
    document.getElementById('transition-subtitle').textContent = reason;

    const unlocksContainer = document.getElementById('transition-unlocks');
    unlocksContainer.innerHTML = `
      <div class="unlock-item" style="border-color: #ff6b6b; color: #ff6b6b;">
        Final Score: ${score}
      </div>
      <div class="unlock-item" style="border-color: #a0a0c0; color: #a0a0c0;">
        Phases Completed: ${this.gameState.completedPhases.size} / 6
      </div>
      <div class="unlock-item" style="border-color: #a0a0c0; color: #a0a0c0;">
        Events Faced: ${this.gameState.eventsTriggered}
      </div>
    `;

    document.getElementById('btn-continue').textContent = '🔄 Try Again';
    document.getElementById('btn-continue').onclick = () => {
      location.reload();
    };

    transitionScreen.classList.remove('hidden');
  }

  async onVictory(score) {
    const transitionScreen = document.getElementById('phase-transition');
    document.getElementById('transition-badge').textContent = '🏆 VICTORY';
    document.getElementById('transition-badge').style.color = '#ffd93d';
    document.getElementById('transition-title').textContent = 'The Office is Complete!';
    document.getElementById('transition-subtitle').textContent = 'Your software company has materialized from the void. The SDLC is complete.';

    const unlocksContainer = document.getElementById('transition-unlocks');
    unlocksContainer.innerHTML = `
      <div class="unlock-item" style="border-color: #ffd93d; color: #ffd93d; box-shadow: 0 0 12px rgba(255, 217, 61, 0.3);">
        🌟 Final Score: ${score}
      </div>
      <div class="unlock-item">
        Budget Remaining: ${this.gameState.resources.budget}%
      </div>
      <div class="unlock-item">
        Team Morale: ${this.gameState.resources.morale}%
      </div>
      <div class="unlock-item">
        Technical Debt: ${this.gameState.resources.techDebt}%
      </div>
      <div class="unlock-item">
        Events Survived: ${this.gameState.eventsTriggered}
      </div>
    `;

    document.getElementById('btn-continue').innerHTML = '<span class="btn-text">🔄 Play Again</span>';
    document.getElementById('btn-continue').onclick = () => {
      location.reload();
    };

    transitionScreen.classList.remove('hidden');

    // Set void to minimum — office fully lit
    this.renderer.setVoidIntensity(0.1);
  }

  // === UI Updates ===

  updatePhaseProgress() {
    const phaseNodes = document.querySelectorAll('.phase-node');
    const connectors = document.querySelectorAll('.phase-connector');

    phaseNodes.forEach((node, i) => {
      const dot = node.querySelector('.phase-dot');
      const phaseData = SDLC_PHASES[i];

      dot.classList.remove('active', 'completed');

      if (this.gameState.completedPhases.has(phaseData.id)) {
        dot.classList.add('completed');
      } else if (i === this.gameState.currentPhaseIndex) {
        dot.classList.add('active');
      }
    });

    // Fill connectors between completed phases
    connectors.forEach((conn, i) => {
      const phaseData = SDLC_PHASES[i];
      if (this.gameState.completedPhases.has(phaseData.id)) {
        conn.classList.add('filled');
      } else {
        conn.classList.remove('filled');
      }
    });
  }

  updateObjectivePanel() {
    const phase = this.gameState.currentPhase;
    if (!phase) return;

    document.getElementById('objective-text').textContent = phase.description;

    const tasksContainer = document.getElementById('objective-tasks');
    tasksContainer.innerHTML = '';

    phase.tasks.forEach(task => {
      const isCompleted = this.gameState.completedTasks.has(task.id);
      const el = document.createElement('div');
      el.className = `task-item ${isCompleted ? 'completed' : ''}`;
      el.innerHTML = `
        <span class="task-check">${isCompleted ? '☑' : '☐'}</span>
        <span class="task-text">${task.text}</span>
      `;
      tasksContainer.appendChild(el);
    });
  }

  updateAIStatus(status, message) {
    const indicator = document.getElementById('ai-indicator');
    const label = document.getElementById('ai-label');
    const thought = document.getElementById('ai-thought');

    if (indicator) {
      indicator.className = 'ai-indicator';
      if (status === 'active' || status === 'ready') indicator.classList.add('active');
      else if (status === 'thinking' || status === 'loading') indicator.classList.add('thinking');
      else indicator.classList.add('offline');
    }

    if (message && thought) {
      thought.textContent = message;
    }
  }

  updateLoadingBar(percentage, status) {
    const bar = document.getElementById('loading-bar');
    const statusEl = document.getElementById('loading-status');

    if (bar) bar.style.width = `${percentage}%`;
    if (statusEl) statusEl.textContent = status;
  }

  formatImpact(impact) {
    const parts = [];
    if (impact.budget) parts.push(`<span class="${impact.budget > 0 ? 'impact-positive' : 'impact-negative'}">💰${impact.budget > 0 ? '+' : ''}${impact.budget}</span>`);
    if (impact.morale) parts.push(`<span class="${impact.morale > 0 ? 'impact-positive' : 'impact-negative'}">😊${impact.morale > 0 ? '+' : ''}${impact.morale}</span>`);
    if (impact.techDebt) parts.push(`<span class="${impact.techDebt < 0 ? 'impact-positive' : 'impact-negative'}">⚠️${impact.techDebt > 0 ? '+' : ''}${impact.techDebt}</span>`);
    if (impact.time) parts.push(`<span class="${impact.time > 0 ? 'impact-positive' : 'impact-negative'}">⏰${impact.time > 0 ? '+' : ''}${impact.time}</span>`);
    return parts.join(' ');
  }

  async showReview() {
    // Show a quick review of game state via ai panel
    const character = getPhaseCharacter(this.gameState.currentPhase?.id);
    const mood = getCharacterMood(character, this.gameState);

    let dialogue;
    if (this.useLLM && this.llmBridge.isAvailable) {
      this.updateAIStatus('thinking', `${character.name} is evaluating...`);
      const result = await this.llmBridge.generateDialogue(
        character,
        mood,
        this.gameState.toLLMContext()
      );
      dialogue = result?.dialogue;
    }

    if (!dialogue) {
      const result = this.fallbackLogic.generateDialogue(character, mood, this.gameState.toLLMContext());
      dialogue = result?.dialogue;
    }

    const aiThought = document.getElementById('ai-thought');
    const aiLabel = document.getElementById('ai-label');
    if (aiLabel) aiLabel.textContent = `${character.emoji} ${character.name}`;
    if (aiThought) aiThought.textContent = `"${dialogue}"`;

    this.updateAIStatus('active', dialogue);

    // Reset label after 8 seconds
    setTimeout(() => {
      if (aiLabel) aiLabel.textContent = 'AI Game Master';
    }, 8000);
  }

  async consultAI() {
    if (!this.useLLM || !this.llmBridge.isAvailable) {
      this.updateAIStatus('offline', 'AI is not available in classic mode.');
      return;
    }

    this.updateAIStatus('thinking', 'Consulting the AI Game Master...');

    try {
      const context = this.gameState.toLLMContext();
      const response = await this.llmBridge.generate(
        [
          {
            role: 'system',
            content: 'You are the AI Game Master of Void Studio. Give the player ONE brief piece of strategic advice (1-2 sentences) about their current situation. Be specific about their resources and phase.'
          },
          {
            role: 'user',
            content: `My situation: Phase=${context.currentPhase}, Budget=${context.resources.budget}%, Morale=${context.resources.morale}%, TechDebt=${context.resources.techDebt}%, Time=${context.resources.time}%. What should I watch out for?`
          }
        ],
        { temperature: 0.8, maxTokens: 100 }
      );

      this.updateAIStatus('active', response);
    } catch (err) {
      this.updateAIStatus('active', 'The void whispers... but nothing coherent.');
    }
  }

  // === Helpers ===

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// === BOOT ===
document.addEventListener('DOMContentLoaded', () => {
  window.voidStudio = new VoidStudio();
});
