import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EmployeeSidebar } from './employee-sidebar';
import { afterEach, vi } from 'vitest';

afterEach(() => vi.useRealTimers());

@Component({ template: '' })
class LoginStub {}

function setup() {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'login', component: LoginStub }])] });
  const auth = TestBed.inject(AuthService);
  auth.login('admin', 'admin123');
  const fixture = TestBed.createComponent(EmployeeSidebar);
  fixture.detectChanges();
  return { fixture, auth, router: TestBed.inject(Router) };
}

it('animates the mobile menu open and closed while the hamburger morphs into an X', () => {
  vi.useFakeTimers();
  const { fixture } = setup();
  const toggle = fixture.nativeElement.querySelector('[aria-label="Toggle menu"]') as HTMLButtonElement;
  expect(toggle.querySelectorAll('[data-testid="menu-line"]')).toHaveLength(3);
  toggle.click();
  fixture.detectChanges();
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(toggle.classList.contains('is-open')).toBe(true);
  const navigation = fixture.nativeElement.querySelector('[data-testid="mobile-navigation"]') as HTMLElement;
  expect(navigation.classList.contains('mobile-menu-panel')).toBe(true);
  toggle.click();
  fixture.detectChanges();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(navigation.classList.contains('is-closing')).toBe(true);
  vi.advanceTimersByTime(220);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[data-testid="mobile-navigation"]')).toBeNull();
});

it('keeps the mobile menu visible when reopened during its exit', () => {
  vi.useFakeTimers();
  const { fixture } = setup();
  const toggle = fixture.nativeElement.querySelector('[aria-label="Toggle menu"]') as HTMLButtonElement;
  toggle.click();
  fixture.detectChanges();
  toggle.click();
  fixture.detectChanges();
  vi.advanceTimersByTime(100);
  toggle.click();
  fixture.detectChanges();
  vi.advanceTimersByTime(220);
  fixture.detectChanges();
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(fixture.nativeElement.querySelector('[data-testid="mobile-navigation"]')).not.toBeNull();
});

it('asks for confirmation instead of signing out when the desktop action is clicked', () => {
  const { fixture, auth, router } = setup();
  const signOut = fixture.nativeElement.querySelector('aside > div button') as HTMLButtonElement;
  signOut.click();
  fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
  expect(dialog.getAttribute('aria-modal')).toBe('true');
  expect(dialog.textContent).toContain('Sign out');
  expect(auth.isAuthenticated()).toBe(true);
  expect(router.url).toBe('/');
});

it('keeps the session and dismisses the dialog when Cancel is clicked', () => {
  const { fixture, auth, router } = setup();
  (fixture.nativeElement.querySelector('aside > div button') as HTMLButtonElement).click();
  fixture.detectChanges();
  (fixture.nativeElement.querySelector('[role="dialog"] [data-testid="cancel-sign-out"]') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  expect(auth.isAuthenticated()).toBe(true);
  expect(router.url).toBe('/');
});

it('signs out and navigates to Login only after confirmation', async () => {
  const { fixture, auth, router } = setup();
  (fixture.nativeElement.querySelector('aside > div button') as HTMLButtonElement).click();
  fixture.detectChanges();
  (fixture.nativeElement.querySelector('[role="dialog"] [data-testid="confirm-sign-out"]') as HTMLButtonElement).click();
  await fixture.whenStable();
  expect(auth.isAuthenticated()).toBe(false);
  expect(router.url).toBe('/login');
});

it('uses the same confirmation from the mobile menu', () => {
  const { fixture, auth } = setup();
  (fixture.nativeElement.querySelector('[aria-label="Toggle menu"]') as HTMLButtonElement).click();
  fixture.detectChanges();
  (fixture.nativeElement.querySelector('[data-testid="mobile-navigation"] button') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  expect(auth.isAuthenticated()).toBe(true);
});

it('closes the dialog on Escape without signing out', () => {
  const { fixture, auth } = setup();
  (fixture.nativeElement.querySelector('aside > div button') as HTMLButtonElement).click();
  fixture.detectChanges();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  expect(auth.isAuthenticated()).toBe(true);
});
