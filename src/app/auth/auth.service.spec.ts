import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Login } from './login';
import { ToastService } from '../shared/toast/toast.service';
import { DEMO_CREDENTIALS } from './demo-credentials';

describe('AuthService', () => {
  it('accepts demo credentials and rejects other credentials', () => {
    const service = TestBed.inject(AuthService);
    expect(service.login('admin', 'admin123')).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.login('admin', 'wrong')).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('validates the same configured credentials displayed by the login page', () => {
    const service = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const hints = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="credential-help"]'),
    ];

    expect(hints[0].textContent).toContain(DEMO_CREDENTIALS.username);
    expect(hints[1].textContent).toContain(DEMO_CREDENTIALS.password);
    expect(service.login(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password)).toBe(true);
    expect(service.login(DEMO_CREDENTIALS.username, 'wrong-password')).toBe(false);
  });

  it('treats a whitespace-only username as missing', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.controls.username.setValue('   ');
    fixture.componentInstance.form.controls.password.setValue('admin123');
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.controls.username.hasError('required')).toBe(true);
    expect(TestBed.inject(ToastService).items()).toEqual([]);
  });
});
