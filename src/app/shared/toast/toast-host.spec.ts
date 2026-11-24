import { TestBed } from '@angular/core/testing';
import { ToastHost } from './toast-host';
import { ToastService } from './toast.service';

it('keeps the bottom-right toast compact without a shadow', () => {
  const fixture = TestBed.createComponent(ToastHost);
  TestBed.inject(ToastService).show('Unable to sign in.', { tone: 'error', position: 'bottom-right', duration: 0 });
  fixture.detectChanges();
  const stack = fixture.nativeElement.querySelector('[data-position="bottom-right"]') as HTMLElement;
  const card = stack.querySelector('[role="alert"]') as HTMLElement;
  expect(stack.classList.contains('p-4')).toBe(false);
  expect(card.className).not.toContain('shadow-');
});

it('uses the original white card and dark message with a red error border', () => {
  const fixture = TestBed.createComponent(ToastHost);
  TestBed.inject(ToastService).show('Unable to sign in.', { tone: 'error', duration: 0 });
  fixture.detectChanges();
  const card = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
  const message = card.querySelector('p') as HTMLElement;
  expect(card.classList.contains('bg-white')).toBe(true);
  expect(card.classList.contains('border-red-300')).toBe(true);
  expect(message.classList.contains('text-red-900')).toBe(false);
});

it('renders an accessible dismissible toast in its requested viewport position', () => {
  const fixture = TestBed.createComponent(ToastHost);
  const toast = TestBed.inject(ToastService);
  toast.show('Invalid username or password.', { tone: 'error', position: 'top-center' });
  fixture.detectChanges();
  const item = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
  expect(item.textContent).toContain('Invalid username or password.');
  expect(item.closest('[data-position="top-center"]')).not.toBeNull();
  expect(item.closest('[data-position="top-center"]')?.className).toContain('fixed');
  const close = item.querySelector('button[aria-label="Dismiss notification"]') as HTMLButtonElement;
  close.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
});
