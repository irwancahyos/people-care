import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmployeeStore } from '../data/employee.store';
import { EmployeeListStateService } from '../data/employee-list-state.service';
import { selectEmployees } from '../data/employee-table';
import { EmployeeList } from '../list/employee-list';
import { ToastService } from '../../shared/toast/toast.service';
import { EmployeeAdd } from './employee-add';
import {
  birthDateNotFuture,
  nonNegativeNumber,
  requiredText,
  selectedGroup,
} from './employee-validators';

it('rejects nonnumeric salary and negative values', () => {
  expect(nonNegativeNumber(new FormControl('abc'))).toEqual({ salary: true });
  expect(nonNegativeNumber(new FormControl('-1'))).toEqual({ salary: true });
  expect(nonNegativeNumber(new FormControl('0'))).toBeNull();
});

it('rejects whitespace-only required fields', () => {
  expect(requiredText(new FormControl('   '))).toEqual({ required: true });
  expect(requiredText(new FormControl('Alex'))).toBeNull();
});

it('requires a group from the offered choices', () => {
  expect(selectedGroup(new FormControl('Unknown'))).toEqual({ group: true });
  expect(selectedGroup(new FormControl('Finance'))).toBeNull();
});

it('dismisses group options when leaving the group picker', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const search = fixture.nativeElement.querySelector('#group-search') as HTMLInputElement;
  search.focus();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelectorAll('[role="listbox"] button').length).toBe(10);
  search.dispatchEvent(
    new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: fixture.nativeElement.querySelector('#basicSalary'),
    }),
  );
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();
});

it('reuses shared fields while retaining the custom group picker', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelectorAll('app-form-input').length).toBe(6);
  expect(page.querySelector('app-form-input #email')).not.toBeNull();
  expect(page.querySelector('#basicSalary')).not.toBeNull();
  expect(page.querySelector('#group-search[role="combobox"]')).not.toBeNull();
  expect(page.querySelector('#status-search[role="combobox"]')).not.toBeNull();
  expect(page.querySelector('[data-testid="add-footer"] button[type="submit"]')?.textContent).toContain('Save employee');
});

it('keeps the same sidebar and a fixed action footer while the form scrolls', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  const layout = page.querySelector('[data-testid="employee-layout"]') as HTMLElement;
  const sidebar = layout.querySelector('aside') as HTMLElement;
  const content = layout.querySelector('[data-testid="employee-content"]') as HTMLElement;
  const main = content.querySelector('main') as HTMLElement;
  const footer = content.querySelector('[data-testid="add-footer"]') as HTMLElement;
  const form = content.querySelector('form') as HTMLFormElement;
  const save = footer.querySelector('button[type="submit"]') as HTMLButtonElement;
  expect(layout.classList.contains('h-dvh')).toBe(true);
  expect(sidebar.classList.contains('bg-ink')).toBe(true);
  expect(sidebar.classList.contains('h-dvh')).toBe(true);
  expect(sidebar.textContent).toContain('Employees');
  expect(sidebar.textContent).toContain('Sign out');
  expect(content.classList.contains('bg-white')).toBe(true);
  expect(main.classList.contains('overflow-y-auto')).toBe(true);
  expect(main.contains(form)).toBe(true);
  expect(main.contains(footer)).toBe(false);
  expect(save.getAttribute('form')).toBe(form.id);
  expect(footer.querySelector('a[href="/employees"]')?.textContent).toContain('Cancel');
});

it('keeps Cancel free of an underline on hover', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const cancel = fixture.nativeElement.querySelector('[data-testid="add-footer"] a[href="/employees"]') as HTMLAnchorElement;
  expect(cancel.classList.contains('no-underline')).toBe(true);
  expect(cancel.classList.contains('hover:underline')).toBe(false);
});

it('separates personal information and work details into two cards with header bands', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  const sections = [...form.querySelectorAll('[data-testid="form-section"]')] as HTMLElement[];
  expect(sections).toHaveLength(2);
  expect(sections.map((section) => section.querySelector('h2')?.textContent?.trim())).toEqual(['Personal information', 'Work details']);
  expect(sections.every((section) => section.classList.contains('border'))).toBe(true);
  expect(sections.every((section) => section.querySelector('header')?.classList.contains('bg-surface-soft'))).toBe(true);
  expect(form.querySelector('app-form-input #firstName')?.classList.contains('h-8')).toBe(true);
  expect(form.querySelector('#group-search')?.classList.contains('h-8')).toBe(true);
  expect(form.querySelector('#status-search')?.classList.contains('h-8')).toBe(true);
  expect((fixture.nativeElement.querySelector('[data-testid="add-footer"] button[type="submit"]') as HTMLElement).classList.contains('h-8')).toBe(true);
});

it('formats salary with a Rp prefix and dot-separated thousands while preserving numeric data', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('#basicSalary') as HTMLInputElement;
  expect(input.type).toBe('text');
  expect(input.inputMode).toBe('numeric');
  expect(input.parentElement?.textContent).toContain('Rp');
  input.value = '8500000';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  expect(input.value).toBe('8.500.000');
  expect(fixture.componentInstance.form.controls.basicSalary.value).toBe('8500000');
});

it('shows a toast when saving fails instead of an inline alert', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  const component = fixture.componentInstance;
  component.form.setValue({
    username: 'alex', firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com',
    birthDate: '2000-01-01T12:00', basicSalary: '100000', status: 'Active',
    group: 'Finance', description: '2020-01-01T12:00',
  });
  const store = TestBed.inject(EmployeeStore);
  const originalAdd = store.add;
  store.add = () => { throw new Error('Employee could not be saved.'); };
  component.save();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  store.add = originalAdd;
  expect(TestBed.inject(ToastService).items()).toEqual([
    expect.objectContaining({ message: 'Employee could not be saved.', tone: 'error', position: 'top-center' }),
  ]);
});

it('shows the newly saved employee on the list and confirms success', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'employees', component: EmployeeList }])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const component = fixture.componentInstance;
  expect(component.form.controls.status.value).toBe('Active');
  component.form.patchValue({
    username: 'new.hire.1124', firstName: 'New', lastName: 'Hire', email: 'new@example.com',
    birthDate: '2000-01-01T10:00', basicSalary: '8500000',
    group: 'Finance', description: '2020-01-01T10:00',
  });
  const list = TestBed.inject(EmployeeListStateService);
  list.update({ name: 'Alex', group: 'Engineering', page: 5, sortKey: 'firstName', sortDirection: 'asc' });
  component.save();
  await fixture.whenStable();
  const store = TestBed.inject(EmployeeStore);
  const result = selectEmployees(store.all(), { ...list.state(), group: '' });
  expect(list.state().name).toBe('');
  expect(result.total).toBe(121);
  expect(result.rows).toHaveLength(10);
  expect(result.rows.some((employee) => employee.username === 'new.hire.1124')).toBe(true);
  expect(store.find('new.hire.1124')).toMatchObject({ basicSalary: 8500000, status: 'Active' });
  expect(TestBed.inject(ToastService).items()).toEqual([
    expect.objectContaining({ tone: 'success', message: expect.stringContaining('New Hire') }),
  ]);
});

it('filters a custom status picker like the Group picker and selects On leave', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  expect(page.querySelector('#status')).toBeNull();
  expect(page.querySelector('select')).toBeNull();
  const search = page.querySelector('#status-search') as HTMLInputElement;
  search.focus();
  fixture.detectChanges();
  expect(page.querySelectorAll('#status-options [role="option"]')).toHaveLength(2);
  search.value = 'leave';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  const options = [...page.querySelectorAll('#status-options [role="option"]')] as HTMLButtonElement[];
  expect(options.map((option) => option.textContent?.trim())).toEqual(['On leave']);
  options[0].click();
  fixture.detectChanges();
  expect(fixture.componentInstance.form.controls.status.value).toBe('On leave');
  expect(search.value).toBe('On leave');
  expect(search.getAttribute('aria-expanded')).toBe('false');
});

it('uses styled date-and-time pickers and saves complete datetime values', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'employees', component: EmployeeList }])] });
  const fixture = TestBed.createComponent(EmployeeAdd);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  const birth = page.querySelector('#birthDate') as HTMLInputElement;
  const description = page.querySelector('#description') as HTMLInputElement;
  expect(birth.type).toBe('datetime-local');
  expect(description.type).toBe('datetime-local');
  expect(birth.max).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  expect(birth.classList.contains('bg-white')).toBe(true);
  expect(birth.classList.contains('focus:border-teal')).toBe(true);
  birth.value = '2000-01-15T09:30';
  birth.dispatchEvent(new Event('input', { bubbles: true }));
  const component = fixture.componentInstance;
  component.form.patchValue({ username: 'date.time', firstName: 'Date', lastName: 'Time', email: 'date@example.com', basicSalary: '500000', group: 'Finance', description: '2020-02-29T13:45' });
  component.save();
  await fixture.whenStable();
  expect(TestBed.inject(EmployeeStore).find('date.time')).toMatchObject({ birthDate: '2000-01-15T09:30', description: '2020-02-29T13:45' });
});

it('rejects future birth datetimes, including later today, and invalid dates', () => {
  expect(birthDateNotFuture(new FormControl('2999-01-01T12:00'))).toEqual({ futureDate: true });
  expect(birthDateNotFuture(new FormControl('2000-01-01T12:00'))).toBeNull();
  const later = new Date(Date.now() + 60_000);
  const futureLocal = new Date(later.getTime() - later.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  expect(birthDateNotFuture(new FormControl(futureLocal))).toEqual({ futureDate: true });
  expect(birthDateNotFuture(new FormControl('2024-02-31T12:00'))).toEqual({ futureDate: true });
  expect(birthDateNotFuture(new FormControl('2000-01-01'))).toEqual({ futureDate: true });
});
