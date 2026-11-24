import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

it('shows reusable tones at six positions and allows dismissal', () => {
  const toast = TestBed.inject(ToastService);
  const first = toast.show('Saved', { tone: 'success', position: 'top-center' });
  const second = toast.show('Check data', { tone: 'warning', position: 'bottom-left' });
  const third = toast.show('Failed', { tone: 'error', position: 'top-right' });
  expect(toast.items().map((item) => [item.message, item.tone, item.position])).toEqual([
    ['Saved', 'success', 'top-center'],
    ['Check data', 'warning', 'bottom-left'],
    ['Failed', 'error', 'top-right'],
  ]);
  toast.dismiss(second);
  expect(toast.items().map((item) => item.id)).toEqual([first, third]);
  toast.clear();
  expect(toast.items()).toEqual([]);
});

it('dismisses automatically and replaces the expiry timer when the same toast closes', () => {
  vi.useFakeTimers();
  try {
    const toast = TestBed.inject(ToastService);
    const first = toast.show('Try again', { tone: 'error', duration: 2000 });
    toast.dismiss(first);
    toast.show('Updated', { tone: 'success', duration: 4000 });
    vi.advanceTimersByTime(2000);
    expect(toast.items().map((item) => item.message)).toEqual(['Updated']);
    vi.advanceTimersByTime(2000);
    expect(toast.items()).toEqual([]);
  } finally {
    vi.useRealTimers();
  }
});
