/**
 * LLMBridge.js — Bridge between game engine and LLM Web Worker
 * Manages communication with WebLLM running in a Web Worker
 */

export class LLMBridge {
  constructor() {
    this.worker = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.pendingRequests = new Map();
    this.requestId = 0;
    this.onStatusChange = null;
    this.onProgress = null;
  }

  /**
   * Initialize the LLM worker and load the model
   */
  async init(modelId = 'Phi-3.5-mini-instruct-q4f32_1-MLC') {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      try {
        // Create worker from a blob to avoid separate file complexity
        const workerCode = `
          import { CreateMLCEngine } from 'https://esm.run/@mlc-ai/web-llm';

          let engine = null;

          self.onmessage = async (e) => {
            const { type, id, data } = e.data;

            if (type === 'init') {
              try {
                self.postMessage({ type: 'status', status: 'loading', message: 'Downloading AI model...' });

                engine = await CreateMLCEngine(data.modelId, {
                  initProgressCallback: (progress) => {
                    self.postMessage({
                      type: 'progress',
                      progress: progress.progress,
                      text: progress.text
                    });
                  }
                });

                self.postMessage({ type: 'status', status: 'ready', message: 'AI Game Master ready!' });
                self.postMessage({ type: 'initComplete', id });
              } catch (err) {
                self.postMessage({ type: 'error', id, error: err.message });
              }
            }

            if (type === 'generate') {
              if (!engine) {
                self.postMessage({ type: 'error', id, error: 'Engine not initialized' });
                return;
              }

              try {
                self.postMessage({ type: 'status', status: 'thinking', message: 'AI is thinking...' });

                const response = await engine.chat.completions.create({
                  messages: data.messages,
                  temperature: data.temperature || 0.7,
                  max_tokens: data.maxTokens || 500,
                  response_format: data.jsonMode ? { type: 'json_object' } : undefined
                });

                const content = response.choices[0]?.message?.content || '';
                self.postMessage({ type: 'response', id, content });
                self.postMessage({ type: 'status', status: 'ready', message: 'AI Game Master ready!' });
              } catch (err) {
                self.postMessage({ type: 'error', id, error: err.message });
              }
            }
          };
        `;

        this.worker = new Worker(
          URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })),
          { type: 'module' }
        );

        this.worker.onmessage = (e) => {
          const { type, id, content, error, status, message, progress, text } = e.data;

          if (type === 'status' && this.onStatusChange) {
            this.onStatusChange(status, message);
          }

          if (type === 'progress' && this.onProgress) {
            this.onProgress(progress, text);
          }

          if (type === 'initComplete') {
            this.isLoaded = true;
            this.isLoading = false;
            resolve();
          }

          if (type === 'response') {
            const pending = this.pendingRequests.get(id);
            if (pending) {
              pending.resolve(content);
              this.pendingRequests.delete(id);
            }
          }

          if (type === 'error') {
            this.isLoading = false;
            const pending = this.pendingRequests.get(id);
            if (pending) {
              pending.reject(new Error(error));
              this.pendingRequests.delete(id);
            }
            if (!this.isLoaded) {
              reject(new Error(error));
            }
          }
        };

        // Start initialization
        this.worker.postMessage({
          type: 'init',
          id: this.requestId++,
          data: { modelId }
        });

      } catch (err) {
        this.isLoading = false;
        reject(err);
      }
    });
  }

  /**
   * Send a generation request to the LLM
   */
  async generate(messages, options = {}) {
    if (!this.isLoaded) {
      throw new Error('LLM not loaded');
    }

    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      this.pendingRequests.set(id, { resolve, reject });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('LLM request timed out'));
        }
      }, 30000);

      this.worker.postMessage({
        type: 'generate',
        id,
        data: {
          messages,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 500,
          jsonMode: options.jsonMode || false
        }
      });
    });
  }

  /**
   * Generate a game event using the LLM
   */
  async generateEvent(gameContext) {
    const systemPrompt = `You are the Game Master of "Void Studio", an IT project management simulation game. Generate a dynamic event for the current game state.

CURRENT STATE:
- Phase: ${gameContext.currentPhase}
- Phase Progress: ${gameContext.phaseProgress}
- Budget: ${gameContext.resources.budget}%
- Team Morale: ${gameContext.resources.morale}%
- Technical Debt: ${gameContext.resources.techDebt}%
- Time Remaining: ${gameContext.resources.time}%
- Recent Events: ${gameContext.recentHistory.join('; ')}

Generate a contextual event with EXACTLY this JSON structure:
{
  "type": "crisis|opportunity|stakeholder|technical|team",
  "title": "Short dramatic title",
  "description": "2-3 sentence scenario. Be specific and dramatic.",
  "options": [
    {
      "id": "a",
      "text": "Short action description",
      "impact": { "budget": 0, "morale": 0, "techDebt": 0, "time": 0 }
    },
    {
      "id": "b",
      "text": "Short action description",
      "impact": { "budget": 0, "morale": 0, "techDebt": 0, "time": 0 }
    },
    {
      "id": "c",
      "text": "Short action description",
      "impact": { "budget": 0, "morale": 0, "techDebt": 0, "time": 0 }
    }
  ]
}

Rules:
- Impact values should be between -25 and +25
- Negative budget means spending, positive means saving
- Negative morale is bad, positive is good
- Positive techDebt means MORE debt (bad), negative means LESS (good)
- Negative time means time spent, positive means time saved
- Make events relevant to the current SDLC phase
- If resources are critically low, make events that offer recovery opportunities
- Each option should have meaningful trade-offs`;

    try {
      const response = await this.generate(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a new event for the current game state.' }
        ],
        { temperature: 0.8, maxTokens: 400, jsonMode: true }
      );

      return JSON.parse(response);
    } catch (err) {
      console.warn('LLM event generation failed:', err);
      return null;
    }
  }

  /**
   * Evaluate a player's decision
   */
  async evaluateDecision(event, choice, gameContext) {
    const systemPrompt = `You are the Game Master of "Void Studio". The player just made a decision. Provide a brief narrative outcome (2-3 sentences). Be dramatic and specific. Respond in JSON:
{
  "narrative": "What happened as a result...",
  "mood": "positive|negative|neutral"
}`;

    try {
      const response = await this.generate(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Event: "${event.title}" - ${event.description}\nPlayer chose: "${choice.text}"\nGame state: Budget ${gameContext.resources.budget}%, Morale ${gameContext.resources.morale}%` }
        ],
        { temperature: 0.7, maxTokens: 150, jsonMode: true }
      );

      return JSON.parse(response);
    } catch (err) {
      console.warn('LLM evaluation failed:', err);
      return null;
    }
  }

  /**
   * Generate NPC dialogue
   */
  async generateDialogue(character, mood, gameContext) {
    const systemPrompt = `You are ${character.name}, ${character.title}, in a software company. Your personality: ${character.personality}. Current mood: ${mood}. Say ONE sentence that reflects your mood about the project. Be in-character. Respond in JSON: { "dialogue": "your line" }`;

    try {
      const response = await this.generate(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Project status: Phase ${gameContext.currentPhase}, Budget ${gameContext.resources.budget}%, Morale ${gameContext.resources.morale}%, Tech Debt ${gameContext.resources.techDebt}%` }
        ],
        { temperature: 0.9, maxTokens: 80, jsonMode: true }
      );

      return JSON.parse(response);
    } catch (err) {
      console.warn('LLM dialogue failed:', err);
      return null;
    }
  }

  get isAvailable() {
    return this.isLoaded;
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isLoaded = false;
    this.isLoading = false;
  }
}
