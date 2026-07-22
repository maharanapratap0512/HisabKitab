import { Injectable } from '@angular/core';
import { driver, Driver } from 'driver.js';
import { ComponentTourGroup, TourStepConfig, TourStepAction } from '../tours/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private activeDriver: Driver | null = null;

  constructor() {}

  /**
   * Start a tour for a specific component tour configuration.
   * Optionally pass mini-tour stepIndexes to run a subset of steps.
   */
  startTour(tourGroup: ComponentTourGroup, stepIndexes?: number[]) {
    // Determine steps to play (master or mini-tour subset)
    const rawSteps: TourStepConfig[] = stepIndexes
      ? stepIndexes.map((i) => tourGroup.masterSteps[i]).filter(Boolean)
      : tourGroup.masterSteps;

    if (!rawSteps || rawSteps.length === 0) {
      console.warn(`[TourService] No steps found for tour: ${tourGroup.id}`);
      return;
    }

    // Transform TourStepConfig to Driver.js step objects with declarative actions
    const driverSteps = rawSteps.map((step) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side || 'bottom',
        align: step.popover.align || 'start'
      },
      onHighlightStarted: async (element: Element | undefined, stepObj: any, { driver }: { driver: Driver }) => {
        if (step.beforeShowAction) {
          await this.executeAction(step.beforeShowAction);
        }
      },
      onDeselected: async (element: Element | undefined, stepObj: any) => {
        if (step.afterHideAction) {
          await this.executeAction(step.afterHideAction);
        }
      }
    }));

    // Initialize Driver.js instance
    this.activeDriver = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      steps: driverSteps,
      onDestroyed: () => {
        this.markCompleted(tourGroup.id);
        this.activeDriver = null;
      }
    });

    // Launch the tour
    this.activeDriver.drive();
  }

  /**
   * Helper to execute declarative step actions (click, select_row, toggle_hl, add_class, etc.)
   */
  private async executeAction(action: TourStepAction | TourStepAction[]) {
    if (Array.isArray(action)) {
      for (const act of action) {
        await this.executeSingleAction(act);
      }
    } else {
      await this.executeSingleAction(action);
    }
  }

  private async executeSingleAction(action: TourStepAction) {
    const { type, target, className, delayMs } = action;

    if (type === 'click' && target) {
      const targetEl = await this.waitForElement(target);
      if (targetEl) {
        targetEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        targetEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        targetEl.click();
        targetEl.focus();
      }
    } else if (type === 'close_hover' && target) {
      const targetEl = await this.waitForElement(target);
      if (targetEl) {
        targetEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        targetEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        targetEl.blur();
      }
    } else if (type === 'close_select') {
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(escapeEvent);
      window.dispatchEvent(escapeEvent);
      if (target) {
        const targetEl = await this.waitForElement(target);
        targetEl?.dispatchEvent(escapeEvent);
      }
      document.body.click();
    }
 else if (type === 'add_class' && target && className) {
      const targetEl = await this.waitForElement(target);
      if (targetEl) {
        targetEl.classList.add(className);
      }
    } else if (type === 'remove_class' && target && className) {
      const targetEl = await this.waitForElement(target);
      if (targetEl) {
        targetEl.classList.remove(className);
      }
    } else if (type === 'select_row') {
      const rowCheckbox = await this.waitForElement('.smart-selection-row input[type="checkbox"]');
      if (rowCheckbox) {
        rowCheckbox.click();
      }
    } else if (type === 'toggle_hl') {
      const hlLabel = await this.waitForElement('#tour-row-hl-switch');
      if (hlLabel) {
        hlLabel.click();
      }
    }

    if (delayMs) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }


  /**
   * Helper to wait for dynamic DOM elements before executing action/step.
   */
  private async waitForElement(selector: string, timeoutMs = 2000): Promise<HTMLElement | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        return el;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return null;
  }

  /**
   * Mark a tour as completed in LocalStorage.
   */
  markCompleted(tourId: string) {
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
  }

  /**
   * Check if a tour has already been completed.
   */
  isCompleted(tourId: string): boolean {
    return localStorage.getItem(`tour_completed_${tourId}`) === 'true';
  }

  /**
   * Reset completion status for all tours.
   */
  resetAllTours() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('tour_completed_'))
      .forEach((k) => localStorage.removeItem(k));
  }
}
