import { Injectable, NgZone } from '@angular/core';
import { ToastrService, ActiveToast } from 'ngx-toastr';

export interface BackgroundTaskProgress {
  taskId: string;
  title: string;
  current?: number;
  total?: number;
  message: string;
  status: 'running' | 'completed' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class BackgroundTaskService {
  private activeTasks = new Map<string, {
    toast: ActiveToast<any>;
    title: string;
  }>();

  constructor(
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  /**
   * Starts a non-blocking background task with a persistent toast notification.
   * User can navigate around the app, switch components, or perform other tasks.
   */
  startTask(taskId: string, title: string, initialMessage: string = 'कार्य शुरू किया जा रहा है...'): string {
    if (this.activeTasks.has(taskId)) {
      this.clearTask(taskId);
    }

    const toast = this.toastr.info(initialMessage, title, {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: false,
      tapToDismiss: false,
      progressBar: false,
      positionClass: 'toast-top-right'
    });

    this.activeTasks.set(taskId, { toast, title });
    return taskId;
  }

  /**
   * Updates progress of a running task in-place without flashing new toasts.
   * e.g. updateProgress('image_export', 'फोटो एकत्रित की जा रही हैं...', 15, 100);
   */
  updateProgress(taskId: string, message: string, current?: number, total?: number): void {
    const task = this.activeTasks.get(taskId);
    if (!task || !task.toast) return;

    let fullMessage = message;
    if (total !== undefined && total > 0 && current !== undefined) {
      const pct = Math.min(Math.round((current / total) * 100), 100);
      fullMessage = `(${current}/${total}) [${pct}%] ${message}`;
    }

    this.ngZone.run(() => {
      if (task.toast.toastRef && task.toast.toastRef.componentInstance) {
        task.toast.toastRef.componentInstance.message = fullMessage;
        if ((task.toast.toastRef.componentInstance as any).cd) {
          (task.toast.toastRef.componentInstance as any).cd.markForCheck();
        }
      }
    });
  }

  /**
   * Marks task as completed, clears the progress toast, and displays a success notification.
   */
  completeTask(taskId: string, successMessage: string): void {
    this.clearTask(taskId);
    this.ngZone.run(() => {
      this.toastr.success(successMessage, 'सफलतापूर्वक पूर्ण!', {
        timeOut: 6000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    });
  }

  /**
   * Marks task as failed, clears the progress toast, and displays an error notification.
   */
  failTask(taskId: string, errorMessage: string): void {
    this.clearTask(taskId);
    this.ngZone.run(() => {
      this.toastr.error(errorMessage, 'कार्य में त्रुटि!', {
        timeOut: 8000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    });
  }

  /**
   * Checks if a background task is currently active.
   */
  isTaskRunning(taskId: string): boolean {
    return this.activeTasks.has(taskId);
  }

  private clearTask(taskId: string): void {
    const task = this.activeTasks.get(taskId);
    if (task && task.toast) {
      this.toastr.clear(task.toast.toastId);
    }
    this.activeTasks.delete(taskId);
  }
}
