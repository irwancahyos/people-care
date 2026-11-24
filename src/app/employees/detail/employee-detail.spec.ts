import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EmployeeListStateService } from '../data/employee-list-state.service';
import { EmployeeList } from '../list/employee-list';
import { EmployeeDetail } from './employee-detail';
import { formatSalary, formatDateTime } from '../data/employee-format';

it('updates the profile when navigating between employee URLs', async () => {
  const params = new BehaviorSubject(convertToParamMap({ username: 'alex.chen001' }));
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: params.asObservable(), snapshot: { paramMap: params.value } },
      },
    ],
  });
  const fixture = TestBed.createComponent(EmployeeDetail);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Alex Chen');
  params.next(convertToParamMap({ username: 'morgan.chen002' }));
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Morgan Chen');
});

it('shows the Add layout as two read-only information cards with a fixed back footer', () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ username: 'alex.chen001' })), snapshot: { paramMap: convertToParamMap({ username: 'alex.chen001' }) } } },
    ],
  });
  const fixture = TestBed.createComponent(EmployeeDetail);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  const layout = page.querySelector('[data-testid="employee-layout"]') as HTMLElement;
  const sidebar = layout.querySelector('app-employee-sidebar aside') as HTMLElement;
  const content = layout.querySelector('[data-testid="employee-content"]') as HTMLElement;
  const main = content.querySelector('main') as HTMLElement;
  const footer = content.querySelector('[data-testid="detail-footer"]') as HTMLElement;
  expect(layout.classList.contains('h-dvh')).toBe(true);
  expect(sidebar.classList.contains('h-dvh')).toBe(true);
  expect(sidebar.textContent).toContain('Sign out');
  expect(main.classList.contains('overflow-y-auto')).toBe(true);
  expect(main.contains(footer)).toBe(false);
  expect(footer.querySelector('a[href="/employees"]')?.textContent).toContain('OK');
  const sections = [...main.querySelectorAll('[data-testid="detail-section"]')] as HTMLElement[];
  expect(sections.map((section) => section.querySelector('h2')?.textContent?.trim())).toEqual(['Personal information', 'Work details']);
  expect(sections.every((section) => section.querySelector('header')?.classList.contains('bg-surface-soft'))).toBe(true);
  expect(sections[0].querySelectorAll('dt')).toHaveLength(5);
  expect(sections[1].querySelectorAll('dt')).toHaveLength(4);
  expect(main.querySelector('input, select, textarea')).toBeNull();
  expect(main.textContent).toContain('alex.chen001');
  expect(main.textContent).toContain('alex.chen001@example.com');
});

it('uses OK to return to the list with the previous search and page intact', async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'employees', component: EmployeeList }]),
      { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ username: 'alex.chen001' })), snapshot: { paramMap: convertToParamMap({ username: 'alex.chen001' }) } } },
    ],
  });
  const state = TestBed.inject(EmployeeListStateService);
  state.update({ name: 'Alex', page: 2, pageSize: 10 });
  const fixture = TestBed.createComponent(EmployeeDetail);
  fixture.detectChanges();
  const ok = fixture.nativeElement.querySelector('[data-testid="detail-footer"] a[href="/employees"]') as HTMLAnchorElement;
  expect(ok.textContent?.trim()).toBe('OK');
  ok.click();
  await fixture.whenStable();
  expect(state.state()).toMatchObject({ name: 'Alex', page: 2, pageSize: 10 });
});

it('keeps the shared layout and a way back when the employee is missing', () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ username: 'unknown' })), snapshot: { paramMap: convertToParamMap({ username: 'unknown' }) } } },
    ],
  });
  const fixture = TestBed.createComponent(EmployeeDetail);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelector('app-employee-sidebar aside')).not.toBeNull();
  expect(page.querySelector('main')?.textContent).toContain('Employee not found');
  expect(page.querySelector('[data-testid="detail-footer"] a[href="/employees"]')).not.toBeNull();
});

it('displays the time of employee datetime fields', () => {
  expect(formatDateTime('2000-01-15T09:30')).toMatch(/15 January 2000.*09:30/);
  expect(formatDateTime('2000-01-15')).toBe('15 January 2000');
});

it('formats employee basic salary as Indonesian rupiah', () => {
  expect(formatSalary(12500000)).toMatch(/Rp\s*12\.500\.000,00/);
});
