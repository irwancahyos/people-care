import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideLayoutGrid, LucideLogOut } from '@lucide/angular';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-employee-sidebar',
  imports: [RouterLink, LucideLayoutGrid, LucideLogOut],
  template: `
    <aside class="flex h-dvh min-h-0 flex-col border-r border-white/10 bg-ink px-4 py-7 text-white max-[900px]:h-auto max-[900px]:min-h-0 max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:items-center max-[900px]:gap-4 max-[900px]:border-r-0 max-[900px]:px-5 max-[900px]:py-3 max-[600px]:relative max-[600px]:h-14 max-[600px]:flex-nowrap max-[600px]:justify-between max-[600px]:px-4 max-[600px]:py-2">
      <div class="mx-3 mb-5 pt-3 text-[0.7rem] font-bold tracking-[0.17em] text-[#a9c5c4] max-[900px]:m-0 max-[900px]:p-0">WORKSPACE</div>
      <button type="button" aria-label="Toggle menu" aria-controls="mobile-navigation" [attr.aria-expanded]="menuOpen()" [class.is-open]="menuOpen()" (click)="toggleMenu()" class="menu-toggle hidden size-10 cursor-pointer items-center justify-center rounded-[4px] border border-white/20 bg-transparent text-white focus-visible:outline-2 focus-visible:outline-mint max-[600px]:inline-flex">
        <span class="menu-lines" aria-hidden="true"><span data-testid="menu-line"></span><span data-testid="menu-line"></span><span data-testid="menu-line"></span></span>
      </button>
      <a routerLink="/employees" class="flex items-center gap-2.5 rounded-[4px] border-0 bg-white/10 px-3 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/15 max-[600px]:hidden">
        <svg lucideLayoutGrid size="18" class="text-[var(--mint)]" aria-hidden="true"></svg> Employees
      </a>
      <div class="mt-auto border-t border-white/15 pt-4 max-[900px]:mt-0 max-[900px]:mr-0 max-[900px]:mb-0 max-[900px]:ml-auto max-[900px]:border-0 max-[900px]:pt-0 max-[600px]:hidden">
        <button type="button" class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-0 bg-transparent px-3 py-2 font-body text-sm font-semibold text-[#b3c6c8] transition-colors hover:bg-white/10 hover:text-white max-[900px]:whitespace-nowrap" (click)="requestLogout()">
          Sign out <svg lucideLogOut size="16" aria-hidden="true"></svg>
        </button>
      </div>
      @if (menuVisible()) {
        <nav id="mobile-navigation" data-testid="mobile-navigation" aria-label="Employee menu" [class.is-closing]="menuClosing()" [attr.inert]="menuOpen() ? null : ''" class="mobile-menu-panel absolute top-full right-0 left-0 z-40 hidden border-t border-white/15 bg-ink px-4 py-3 shadow-[0_16px_30px_rgba(24,52,58,0.2)] max-[600px]:flex max-[600px]:flex-col max-[600px]:gap-2">
          <a routerLink="/employees" (click)="closeMenu()" class="flex items-center gap-2.5 rounded-[4px] bg-white/10 px-3 py-3 text-sm font-semibold text-white no-underline"><svg lucideLayoutGrid size="18" class="text-[var(--mint)]" aria-hidden="true"></svg> Employees</a>
          <button type="button" (click)="requestLogout()" class="flex cursor-pointer items-center justify-between rounded-[4px] border-0 bg-transparent px-3 py-3 font-body text-sm font-semibold text-white"><span>Sign out</span><svg lucideLogOut size="16" aria-hidden="true"></svg></button>
        </nav>
      }
    </aside>
    @if (confirmLogoutOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-4" (click)="cancelLogout()">
        <section role="dialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description" class="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-ink shadow-[0_24px_64px_rgba(20,48,53,0.25)]" (click)="$event.stopPropagation()">
          <h2 id="logout-title" class="font-display text-lg font-semibold">Sign out?</h2>
          <p id="logout-description" class="mt-2 text-sm text-muted">Are you sure you want to sign out of your workspace?</p>
          <div class="mt-6 flex justify-end gap-2">
            <button data-testid="cancel-sign-out" type="button" (click)="cancelLogout()" class="h-9 cursor-pointer rounded-[4px] border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-teal">Cancel</button>
            <button data-testid="confirm-sign-out" type="button" (click)="logout()" class="h-9 cursor-pointer rounded-[4px] border-0 bg-teal px-4 text-sm font-semibold text-white hover:bg-[#1d665d] focus-visible:outline-2 focus-visible:outline-teal">Sign out</button>
          </div>
        </section>
      </div>
    }
  `,
})
export class EmployeeSidebar implements OnDestroy {
  readonly menuOpen = signal(false);
  readonly menuVisible = signal(false);
  readonly menuClosing = signal(false);
  readonly confirmLogoutOpen = signal(false);
  private closeTimer?: ReturnType<typeof setTimeout>;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      return;
    }
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.menuClosing.set(false);
    this.menuVisible.set(true);
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuClosing.set(true);
    this.closeTimer = setTimeout(() => {
      this.menuVisible.set(false);
      this.menuClosing.set(false);
      this.closeTimer = undefined;
    }, 220);
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  requestLogout(): void {
    this.closeMenu();
    this.confirmLogoutOpen.set(true);
  }

  cancelLogout(): void {
    this.confirmLogoutOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeDialogOnEscape(): void {
    this.cancelLogout();
  }

  logout(): void {
    this.confirmLogoutOpen.set(false);
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
