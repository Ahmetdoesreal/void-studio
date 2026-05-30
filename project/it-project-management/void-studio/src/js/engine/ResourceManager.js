/**
 * ResourceManager.js — Manages resource display and animations
 */

export class ResourceManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.elements = {};
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.elements = {
      budget: {
        bar: document.querySelector('#resource-budget .budget-bar'),
        value: document.querySelector('#resource-budget .resource-value'),
        item: document.querySelector('#resource-budget')
      },
      morale: {
        bar: document.querySelector('#resource-morale .morale-bar'),
        value: document.querySelector('#resource-morale .resource-value'),
        item: document.querySelector('#resource-morale')
      },
      techDebt: {
        bar: document.querySelector('#resource-techdebt .techdebt-bar'),
        value: document.querySelector('#resource-techdebt .resource-value'),
        item: document.querySelector('#resource-techdebt')
      },
      time: {
        bar: document.querySelector('#resource-time .time-bar'),
        value: document.querySelector('#resource-time .resource-value'),
        item: document.querySelector('#resource-time')
      }
    };
  }

  bindEvents() {
    this.gameState.on('resourcesChanged', ({ current, delta }) => {
      this.updateDisplay(current, delta);
    });
  }

  updateDisplay(resources, delta) {
    // Budget
    if (this.elements.budget.bar) {
      this.elements.budget.bar.style.width = `${resources.budget}%`;
      this.elements.budget.value.textContent = `$${Math.round(resources.budget * 1000).toLocaleString()}`;
      this.flashResource('budget', delta?.budget);
    }

    // Morale
    if (this.elements.morale.bar) {
      this.elements.morale.bar.style.width = `${resources.morale}%`;
      this.elements.morale.value.textContent = `${resources.morale}%`;
      this.flashResource('morale', delta?.morale);
    }

    // Tech Debt
    if (this.elements.techDebt.bar) {
      this.elements.techDebt.bar.style.width = `${resources.techDebt}%`;
      this.elements.techDebt.value.textContent = `${resources.techDebt}%`;
      this.flashResource('techDebt', delta?.techDebt);
    }

    // Time
    if (this.elements.time.bar) {
      this.elements.time.bar.style.width = `${resources.time}%`;
      this.elements.time.value.textContent = `${Math.round(resources.time * 0.3)} days`;
      this.flashResource('time', delta?.time);
    }

    // Color shifts for critical states
    this.updateBarColors(resources);
  }

  flashResource(key, delta) {
    if (!delta || delta === 0) return;
    const el = this.elements[key]?.item;
    if (!el) return;

    const isNegative = (key === 'techDebt') ? delta > 0 : delta < 0;
    const cls = isNegative ? 'resource-flash-negative' : 'resource-flash-positive';

    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 600);
  }

  updateBarColors(resources) {
    // Budget warning at low levels
    if (resources.budget < 20 && this.elements.budget.bar) {
      this.elements.budget.bar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
    } else if (this.elements.budget.bar) {
      this.elements.budget.bar.style.background = '';
    }

    // Morale warning
    if (resources.morale < 30 && this.elements.morale.bar) {
      this.elements.morale.bar.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa07a)';
    } else if (this.elements.morale.bar) {
      this.elements.morale.bar.style.background = '';
    }

    // Tech debt critical
    if (resources.techDebt > 70 && this.elements.techDebt.bar) {
      this.elements.techDebt.bar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
      this.elements.techDebt.bar.style.animation = 'phasePulse 1s ease-in-out infinite';
    } else if (this.elements.techDebt.bar) {
      this.elements.techDebt.bar.style.animation = '';
    }

    // Time critical
    if (resources.time < 20 && this.elements.time.bar) {
      this.elements.time.bar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
    } else if (this.elements.time.bar) {
      this.elements.time.bar.style.background = '';
    }
  }

  /**
   * Force refresh the display with current state
   */
  refresh() {
    this.updateDisplay(this.gameState.resources, null);
  }
}
