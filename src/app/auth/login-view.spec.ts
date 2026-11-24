import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

const setViewport = (mobile: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: mobile && query === '(max-width: 1023px)', media: query }));
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { ToastService } from '../shared/toast/toast.service';

it('shows the sign-in form without the removed branding blocks', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();

  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelector('#username')).not.toBeNull();
  expect(page.querySelector('#password')).not.toBeNull();
  expect(page.textContent).not.toMatch(/people\.desk|EMPLOYEE WORKSPACE|WELCOME BACK/);
});

it('provides desktop credential hints on focusable question-mark controls next to labels', () => {
  setViewport(false);
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  const username = page.querySelector('app-form-input[fieldId="username"] [aria-label="Demo username"]') as HTMLButtonElement;
  const password = page.querySelector('app-form-input[fieldId="password"] [aria-label="Demo password"]') as HTMLButtonElement;
  expect(username).not.toBeNull();
  expect(password).not.toBeNull();
  expect(username.closest('[data-testid="credential-help"]')?.textContent).toContain('admin');
  expect(password.closest('[data-testid="credential-help"]')?.textContent).toContain('admin123');
  expect(page.querySelector('[role="dialog"]')).toBeNull();
});

it('delays the mobile credentials modal for two seconds without showing it on desktop', () => {
  vi.useFakeTimers();
  setViewport(true);
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  vi.advanceTimersByTime(1999);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  vi.advanceTimersByTime(1);
  fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
  expect(dialog.getAttribute('aria-modal')).toBe('true');
  expect(dialog.classList.contains('demo-modal-card')).toBe(true);
  expect(dialog.parentElement?.classList.contains('demo-modal-backdrop')).toBe(true);
  expect(dialog.style.backgroundImage).toContain('/img/bg-hello.png');
  expect(dialog.querySelector('[data-testid="demo-login-artwork"]')).toBeNull();
  expect(dialog.querySelector('[data-testid="demo-login-credentials"]')?.classList.contains('bg-white')).toBe(true);
  expect(dialog.querySelector('#demo-login-title')?.textContent?.trim()).toBe('Dummy account');
  expect(dialog.textContent).not.toMatch(/Take a look inside|Your access pass|Use these demo credentials/);
  expect(dialog.textContent).toContain('admin');
  expect(dialog.textContent).toContain('admin123');
  expect(dialog.querySelector('button')?.textContent).toContain('Understand');
});

it('closes the mobile modal and scrolls to the form after Understand without filling credentials', () => {
  vi.useFakeTimers();
  setViewport(true);
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  vi.advanceTimersByTime(2000);
  fixture.detectChanges();
  const formPanel = fixture.nativeElement.querySelector('main') as HTMLElement;
  const scroll = vi.fn();
  formPanel.scrollIntoView = scroll;
  (fixture.nativeElement.querySelector('[role="dialog"] button') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')?.classList.contains('is-closing')).toBe(true);
  expect(scroll).not.toHaveBeenCalled();
  vi.advanceTimersByTime(220);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  expect(scroll).toHaveBeenCalledOnce();
  expect(fixture.componentInstance.form.getRawValue()).toEqual({ username: '', password: '' });
});

it('does not open a mobile modal after leaving the login page before its timer expires', () => {
  vi.useFakeTimers();
  setViewport(true);
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  fixture.destroy();
  vi.advanceTimersByTime(2000);
  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
});

it('gives the sign-in panel a full viewport height after the stacked illustration', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();

  const page = fixture.nativeElement as HTMLElement;
  const hero = page.querySelector('section[aria-label="About the workspace"]');
  const formPanel = page.querySelector('main');
  expect(hero?.classList.contains('min-h-dvh')).toBe(true);
  expect(formPanel?.classList.contains('min-h-dvh')).toBe(true);
  expect(formPanel?.querySelector('form')).not.toBeNull();
});

it('uses the shared input and primary action for login without losing field ids', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelectorAll('app-form-input').length).toBe(2);
  expect(page.querySelector('app-form-input #username')).not.toBeNull();
  expect(page.querySelector('app-form-input #password')).not.toBeNull();
  expect(page.querySelector('#password ~ button[aria-label="Show password"]')).not.toBeNull();
  const username = page.querySelector('#username') as HTMLInputElement;
  const password = page.querySelector('#password') as HTMLInputElement;
  username.value = 'admin';
  username.dispatchEvent(new Event('input', { bubbles: true }));
  password.value = 'admin123';
  password.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  expect(fixture.componentInstance.form.getRawValue()).toEqual({ username: 'admin', password: 'admin123' });
  expect(page.querySelector('app-action-button button[type="submit"]')?.textContent).toContain('Sign in');
});

it('shows the supplied illustration in the left panel', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();

  const page = fixture.nativeElement as HTMLElement;
  const panel = page.querySelector('section[aria-label="About the workspace"]');
  const image = panel?.querySelector('img');
  expect(image?.getAttribute('src')).toBe('/img/hand-holic.png');
  expect(image?.className).toContain('mask-[linear-gradient(to_right,black_78%,transparent_100%)]');
  const bottomFade = panel?.querySelector('[aria-hidden="true"]');
  expect(bottomFade).not.toBeNull();
  expect(bottomFade?.className).toContain('bg-linear-to-b');
  expect(bottomFade?.className).toContain('to-ink');
  expect(image?.getAttribute('width')).toBe('1451');
  expect(image?.getAttribute('height')).toBe('1084');
  expect(image?.getAttribute('alt')).toBeTruthy();
  expect(page.querySelector('main h2')?.textContent).toContain('Sign in');
});

it('shows the tagline below a full-height illustration panel at stacked widths', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();

  const panel = (fixture.nativeElement as HTMLElement).querySelector('section[aria-label="About the workspace"]');
  const tagline = panel?.querySelector('h1');
  expect(tagline?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
    'Know your people. Lead with clarity.',
  );
  expect(panel?.classList.contains('min-h-dvh')).toBe(true);
  expect(tagline?.className).not.toContain('max-[780px]:hidden');
  expect(tagline?.querySelector('br')).toBeNull();
  expect(tagline?.classList.contains('w-full')).toBe(true);
  expect(tagline?.classList.contains('text-left')).toBe(true);
  expect(tagline?.className).toContain('text-[clamp(2rem,4.6vw,3rem)]');
  expect(tagline?.className).toContain('min-[1024px]:text-[clamp(1.75rem,2.6vw,2.5rem)]');
  expect(panel?.classList.contains('min-[1024px]:px-[clamp(24px,4vw,50px)]')).toBe(true);
  expect(panel?.classList.contains('max-[1023px]:justify-between')).toBe(true);
  expect(panel?.classList.contains('max-[1023px]:pt-[clamp(128px,20vh,200px)]')).toBe(true);
  expect(panel?.classList.contains('max-[1023px]:pb-[clamp(44px,8vh,80px)]')).toBe(true);
  const illustration = panel?.querySelector('div');
  expect(illustration?.className).toContain('max-[639px]:w-[112vw]');
  expect(illustration?.className).toContain('max-[639px]:max-w-none');
});

it('surrounds the login illustration with four decorative floating images', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();

  const panel = (fixture.nativeElement as HTMLElement).querySelector('section[aria-label="About the workspace"]');
  const decorations = [
    '/img/passkey.png',
    '/img/kode-verifikasi.png',
    '/img/akun-terverifikasi.png',
    '/img/login-berhasil.png',
  ];

  for (const source of decorations) {
    const image = panel?.querySelector(`img[src="${source}"]`);
    expect(image, `${source} should appear around the main image`).not.toBeNull();
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
    expect(image?.className).toContain('motion-safe:animate-float');
  }

  const position = (source: string) => panel?.querySelector(`img[src="/img/${source}.png"]`)?.className;
  expect(position('passkey')).toContain('w-[clamp(66px,9vw,88px)]');
  expect(position('passkey')).toContain('max-[639px]:left-[9%]');
  expect(position('passkey')).toContain('max-[639px]:-top-8');
  expect(position('passkey')).toContain('max-[639px]:w-20');
  expect(position('passkey')).toContain('left-[12%]');
  expect(position('passkey')).toContain('min-[1024px]:left-[12%]');
  expect(position('kode-verifikasi')).toContain('w-[clamp(130px,17vw,176px)]');
  expect(position('kode-verifikasi')).toContain('max-[639px]:right-[14%]');
  expect(position('kode-verifikasi')).toContain('max-[639px]:top-[-8%]');
  expect(position('kode-verifikasi')).toContain('max-[639px]:w-40');
  expect(position('kode-verifikasi')).toContain('right-[10%]');
  expect(position('kode-verifikasi')).toContain('min-[1024px]:right-[3%]');
  expect(position('akun-terverifikasi')).toContain('w-[clamp(80px,11vw,112px)]');
  expect(position('akun-terverifikasi')).toContain('max-[639px]:left-[16%]');
  expect(position('akun-terverifikasi')).toContain('max-[639px]:w-24');
  expect(position('akun-terverifikasi')).toContain('left-[12%]');
  expect(position('akun-terverifikasi')).toContain('min-[1024px]:bottom-0');
  expect(position('akun-terverifikasi')).toContain('min-[1024px]:left-[10%]');
  expect(position('login-berhasil')).toContain('w-[clamp(130px,17vw,176px)]');
  expect(position('login-berhasil')).toContain('max-[639px]:right-[8%]');
  expect(position('login-berhasil')).toContain('max-[639px]:bottom-3');
  expect(position('login-berhasil')).toContain('max-[639px]:w-40');
  expect(position('login-berhasil')).toContain('right-[10%]');
  expect(position('login-berhasil')).toContain('-bottom-7');
  expect(position('login-berhasil')).toContain('min-[1024px]:-bottom-5');
  expect(position('login-berhasil')).toContain('min-[1024px]:right-[2%]');
});

it('does not direct users to removed demo credentials after a failed sign-in', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Login);
  const component = fixture.componentInstance;
  component.form.setValue({ username: 'wrong', password: 'wrong' });
  component.submit();
  fixture.detectChanges();

  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelector('[role="alert"]')).toBeNull();
  expect(TestBed.inject(ToastService).items()).toEqual([
    expect.objectContaining({
      message: 'Invalid username or password. Please try again.',
      tone: 'error',
      position: 'top-center',
    }),
  ]);
});
