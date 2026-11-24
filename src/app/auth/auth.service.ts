import { Injectable, signal } from '@angular/core';
import { DEMO_CREDENTIALS } from './demo-credentials';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);

  login(username: string, password: string): boolean {
    const valid =
      username.trim() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;
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
