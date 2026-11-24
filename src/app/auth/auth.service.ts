import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);

  login(username: string, password: string): boolean {
    const valid = username.trim() === 'admin' && password === 'admin123';
    this.authenticated.set(valid);
    return valid;
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  logout(): void {
    this.authenticated.set(false);
  }
}
