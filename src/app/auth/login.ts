import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ToastService } from '../shared/toast/toast.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideCircleHelp } from '@lucide/angular';
import { FormInput } from '../shared/form-input';
import { ActionButton } from '../shared/action-button';
import { AuthService } from './auth.service';
import { DEMO_CREDENTIALS } from './demo-credentials';
import { requiredText } from '../employees/add/employee-validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LucideArrowRight, LucideCircleHelp, FormInput, ActionButton],
  templateUrl: './login.html',
})
export class Login implements OnInit, OnDestroy {
  @ViewChild('formPanel') private formPanel?: ElementRef<HTMLElement>;
  readonly credentials = DEMO_CREDENTIALS;
  readonly mobileHintOpen = signal(false);
  readonly mobileHintClosing = signal(false);
  private hintTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 1023px)').matches) {
      this.hintTimer = setTimeout(() => this.mobileHintOpen.set(true), 2000);
    }
  }

  ngOnDestroy(): void {
    if (this.hintTimer) clearTimeout(this.hintTimer);
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  understandDemoCredentials(): void {
    if (this.mobileHintClosing()) return;
    this.mobileHintClosing.set(true);
    this.closeTimer = setTimeout(() => {
      this.mobileHintOpen.set(false);
      this.formPanel?.nativeElement.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    }, 220);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { username, password } = this.form.getRawValue();
    if (!this.auth.login(username, password)) {
      this.toast.show('Invalid username or password. Please try again.', { tone: 'error' });
      return;
    }
    void this.router.navigateByUrl('/employees');
  }
}
