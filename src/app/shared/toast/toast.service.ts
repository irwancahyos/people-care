import { Injectable, OnDestroy, signal } from '@angular/core';

export type ToastTone = 'success' | 'warning' | 'error';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  position: ToastPosition;
}

@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private readonly state = signal<ToastItem[]>([]);
  readonly items = this.state.asReadonly();
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(
    message: string,
    options: { tone?: ToastTone; position?: ToastPosition; duration?: number } = {},
  ): number {
    const id = ++this.nextId;
    this.state.update((items) => [
      ...items,
      { id, message, tone: options.tone ?? 'success', position: options.position ?? 'top-center' },
    ]);
    const duration = options.duration ?? 4000;
    if (duration > 0) this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    return id;
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.state.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
    this.state.set([]);
  }

  ngOnDestroy(): void {
    this.clear();
  }
}
