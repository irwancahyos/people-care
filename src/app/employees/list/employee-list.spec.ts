import { TestBed } from '@angular/core/testing';
import { EmployeeListStateService } from '../data/employee-list-state.service';
import { EmployeeStore } from '../data/employee.store';
import { ToastService } from '../../shared/toast/toast.service';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { afterEach, vi } from 'vitest';

afterEach(() => vi.useRealTimers());

@Component({ template: '' })
class EmptyDetail {}
const detailRoutes = [{ path: 'employees/:username', component: EmptyDetail }];

function clickRowCell(row: HTMLTableRowElement, index: number): void {
  row.cells[index].dispatchEvent(new MouseEvent('click', { bubbles: true }));
}
import { EmployeeList } from './employee-list';
import { formatDateTime } from '../data/employee-format';

it('retains searches and pagination when navigating between employee pages', () => {
  const state = TestBed.inject(EmployeeListStateService);
  state.update({ name: 'Alex', group: 'Engineering', page: 2, pageSize: 25 });
  expect(TestBed.inject(EmployeeListStateService).state()).toMatchObject({
    name: 'Alex',
    group: 'Engineering',
    page: 2,
    pageSize: 25,
  });
});

it('keeps the desktop sidebar anchored while the employee directory scrolls independently', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const layout = fixture.nativeElement.querySelector('[data-testid="employee-layout"]') as HTMLElement;
  const sidebar = fixture.nativeElement.querySelector('app-employee-sidebar aside') as HTMLElement;
  const content = fixture.nativeElement.querySelector('[data-testid="employee-content"]') as HTMLElement;
  expect(layout.classList.contains('h-dvh')).toBe(true);
  expect(layout.classList.contains('overflow-hidden')).toBe(true);
  expect(sidebar.classList.contains('h-dvh')).toBe(true);
  expect(content.classList.contains('overflow-y-auto')).toBe(true);
  expect(sidebar.querySelector('button:not([aria-label="Toggle menu"])')?.textContent).toContain('Sign out');
  const activeLink = sidebar.querySelector('a[href="/employees"]') as HTMLAnchorElement;
  expect(activeLink.classList.contains('rounded-[4px]')).toBe(true);
  expect(activeLink.classList.contains('border-0')).toBe(true);
  expect(activeLink.classList.contains('px-3')).toBe(true);
  expect(activeLink.classList.contains('py-2')).toBe(true);
});

it('keeps the workspace light and readable beside the green sidebar', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const sidebar = fixture.nativeElement.querySelector('app-employee-sidebar aside') as HTMLElement;
  const content = fixture.nativeElement.querySelector('[data-testid="employee-content"]') as HTMLElement;
  const directory = fixture.nativeElement.querySelector('[aria-label="Employee directory"]') as HTMLElement;
  const table = directory.querySelector('table') as HTMLTableElement;
  expect(sidebar.classList.contains('bg-ink')).toBe(true);
  expect(content.classList.contains('bg-white')).toBe(true);
  expect(directory.classList.contains('bg-white')).toBe(true);
  expect(table.classList.contains('text-ink')).toBe(true);
  expect(content.querySelector('#name-search')).not.toBeNull();
  expect(content.querySelector('#group-search')).not.toBeNull();
});

it('filters by name AND group using two visible search fields and retains both values', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const name = fixture.nativeElement.querySelector('#name-search') as HTMLInputElement;
  const group = fixture.nativeElement.querySelector('#group-search') as HTMLInputElement;
  name.value = 'Alex';
  name.dispatchEvent(new Event('input', { bubbles: true }));
  group.value = 'Engineering';
  group.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  const matching = fixture.componentInstance.result();
  expect(matching.total).toBeGreaterThan(0);
  expect(matching.rows.every((employee) => employee.firstName === 'Alex' && employee.group === 'Engineering')).toBe(true);
  group.value = 'no-matching-group';
  group.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  expect(fixture.componentInstance.result().total).toBe(0);
  expect(TestBed.inject(EmployeeListStateService).state()).toMatchObject({ name: 'Alex', group: 'no-matching-group' });
});

it('shows Active and On leave counts from the full employee store', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const active = fixture.nativeElement.querySelector('[data-status="Active"]') as HTMLElement;
  const onLeave = fixture.nativeElement.querySelector('[data-status="On leave"]') as HTMLElement;
  expect(active.textContent).toContain('106');
  expect(onLeave.textContent).toContain('14');
  expect(onLeave.textContent).toContain('On leave');
  fixture.componentInstance.search('name', 'not-a-person');
  fixture.detectChanges();
  expect(active.textContent).toContain('106');
  expect(onLeave.textContent).toContain('14');
});

it('updates the status summary when an employee is added', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  const store = TestBed.inject(EmployeeStore);
  fixture.detectChanges();
  store.add({ username: 'new.leave', firstName: 'New', lastName: 'Leave', email: 'new@example.com', birthDate: '1990-01-01T00:00', basicSalary: 1000000, status: 'On leave', group: 'Engineering', description: '2024-01-01T00:00' });
  fixture.detectChanges();
  expect((fixture.nativeElement.querySelector('[data-status="On leave"]') as HTMLElement).textContent).toContain('15');
});

it('keeps compact status cards inside a full-width summary container', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const summary = fixture.nativeElement.querySelector('[aria-label="Employee status"]') as HTMLElement;
  const cards = [...summary.querySelectorAll('[data-status]')] as HTMLElement[];
  expect(summary.classList.contains('flex')).toBe(true);
  expect(summary.classList.contains('py-3')).toBe(true);
  expect(summary.classList.contains('px-4')).toBe(true);
  expect(cards).toHaveLength(2);
  expect(cards.every((card) => card.classList.contains('w-[208px]'))).toBe(true);
  expect(cards.every((card) => card.classList.contains('rounded-lg') && card.classList.contains('py-2') && card.classList.contains('px-3'))).toBe(true);
  expect(cards.every((card) => card.querySelector('[data-testid="status-label"]')?.classList.contains('text-[11px]'))).toBe(true);
  expect(cards.every((card) => {
    const count = card.querySelector('[data-testid="status-count"]');
    return count?.classList.contains('text-base') && count.classList.contains('font-bold');
  })).toBe(true);
});

it('places search and Add employee above and outside the table container', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const controls = fixture.nativeElement.querySelector('[data-testid="employee-controls"]') as HTMLElement;
  const directory = fixture.nativeElement.querySelector('[aria-label="Employee directory"]') as HTMLElement;
  expect(controls.classList.contains('justify-between')).toBe(true);
  expect(controls.querySelector('#name-search')).not.toBeNull();
  expect(controls.querySelector('a[href="/employees/add"]')).not.toBeNull();
  expect(directory.contains(controls)).toBe(false);
  expect(directory.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  expect(controls.querySelector('#name-search')?.classList.contains('rounded-[4px]')).toBe(true);
  expect(controls.querySelector('#name-search')?.classList.contains('h-8')).toBe(true);
  expect(controls.querySelector('a[href="/employees/add"]')?.classList.contains('rounded-[4px]')).toBe(true);
  expect(controls.querySelector('a[href="/employees/add"]')?.classList.contains('h-8')).toBe(true);
  expect(directory.classList.contains('rounded-[4px]')).toBe(true);
  expect(fixture.nativeElement.querySelector('#group-search')).not.toBeNull();
});

it('shows the custom page-size trigger at left and navigation at right', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const footer = fixture.nativeElement.querySelector('[data-testid="employee-pagination"]') as HTMLElement;
  const trigger = footer.querySelector('[data-testid="page-size-trigger"]') as HTMLButtonElement;
  const navigation = footer.querySelector('[data-testid="page-navigation"]') as HTMLElement;
  expect(footer.querySelector('select')).toBeNull();
  expect(footer.firstElementChild?.contains(trigger)).toBe(true);
  expect(footer.lastElementChild).toBe(navigation);
  expect(trigger.textContent).toContain('10');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(footer.textContent).toContain('from 120 employees');
});

it('hides the page-size summary on mobile and centers navigation with side breathing room', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const footer = fixture.nativeElement.querySelector('[data-testid="employee-pagination"]') as HTMLElement;
  const summary = footer.querySelector('[data-testid="page-size-summary"]') as HTMLElement;
  const navigation = footer.querySelector('[data-testid="page-navigation"]') as HTMLElement;
  expect(summary.className).toContain('max-[600px]:hidden');
  expect(navigation.className).toContain('max-[600px]:w-full');
  expect(navigation.className).toContain('max-[600px]:justify-center');
  expect(navigation.className).toContain('max-[600px]:px-4');
  expect(navigation.querySelector('[aria-label="Previous page"]')).not.toBeNull();
  expect(navigation.querySelector('[aria-label="Next page"]')).not.toBeNull();
});

it('shows pagination arrows without boxes and disables unavailable directions', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const previous = fixture.nativeElement.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
  const next = fixture.nativeElement.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
  expect(previous.classList.contains('border-0')).toBe(true);
  expect(previous.classList.contains('bg-transparent')).toBe(true);
  expect(next.classList.contains('border-0')).toBe(true);
  expect(next.classList.contains('bg-transparent')).toBe(true);
  expect(previous.disabled).toBe(true);
  expect(next.disabled).toBe(false);
  for (let page = 2; page <= fixture.componentInstance.result().pages; page++) {
    fixture.componentInstance.changePage(page);
  }
  fixture.detectChanges();
  expect(previous.disabled).toBe(false);
  expect(next.disabled).toBe(true);
});

it('opens page-size options above the trigger and changes the number of rows', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[data-testid="page-size-trigger"]') as HTMLButtonElement;
  trigger.click();
  fixture.detectChanges();
  const options = [...document.querySelectorAll('[data-testid="page-size-option"]')] as HTMLButtonElement[];
  expect(options.map((option) => option.textContent?.trim())).toEqual(['10', '25', '50', '100']);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(options[0].getAttribute('aria-pressed')).toBe('true');
  options[3].click();
  fixture.detectChanges();
  expect(fixture.componentInstance.result().rows).toHaveLength(100);
  expect(trigger.textContent).toContain('100');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});

it('shows stored date and time in the directory', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  expect(formatDateTime('2000-01-15T09:30', 'medium')).toMatch(/15 Jan 2000.*09:30/);
  expect(formatDateTime('2000-01-15', 'medium')).toBe('15 Jan 2000');
});

it('uses employee schema fields as table columns and shows the birth date', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const headings = [...(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>)].map((cell) => cell.textContent?.trim());
  expect(headings).toEqual(['Username', 'First name', 'Last name', 'Email', 'Birth date', 'Basic salary', 'Status', 'Group', 'Description', 'Actions']);
  const firstRow = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
  expect(firstRow.cells).toHaveLength(10);
  expect(firstRow.textContent).toContain('1985');
});

it('keeps Username and Actions fixed while the middle columns scroll', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
  const firstHeader = table.tHead!.rows[0].cells[0] as HTMLElement;
  const lastHeader = table.tHead!.rows[0].cells[9] as HTMLElement;
  const firstCell = table.tBodies[0].rows[0].cells[0] as HTMLElement;
  const lastCell = table.tBodies[0].rows[0].cells[9] as HTMLElement;
  expect([firstHeader, firstCell].every((cell) => cell.classList.contains('sticky') && cell.classList.contains('left-0'))).toBe(true);
  expect([lastHeader, lastCell].every((cell) => cell.classList.contains('sticky') && cell.classList.contains('right-0'))).toBe(true);
  const scroller = fixture.nativeElement.querySelector('[aria-label="Scrollable employee table"]') as HTMLElement;
  Object.defineProperties(scroller, {
    scrollWidth: { value: 1300, configurable: true },
    clientWidth: { value: 400, configurable: true },
  });
  expect([firstHeader, firstCell, lastHeader, lastCell].every((cell) => !cell.className.includes('shadow-'))).toBe(true);
  scroller.scrollLeft = 300;
  scroller.dispatchEvent(new Event('scroll'));
  fixture.detectChanges();
  expect([firstHeader, firstCell, lastHeader, lastCell].every((cell) => cell.className.includes('shadow-'))).toBe(true);
  scroller.scrollLeft = 900;
  scroller.dispatchEvent(new Event('scroll'));
  fixture.detectChanges();
  expect([firstHeader, firstCell].every((cell) => cell.className.includes('shadow-'))).toBe(true);
  expect([lastHeader, lastCell].every((cell) => !cell.className.includes('shadow-'))).toBe(true);
  scroller.scrollLeft = 0;
  scroller.dispatchEvent(new Event('scroll'));
  fixture.detectChanges();
  expect([firstHeader, firstCell, lastHeader, lastCell].every((cell) => !cell.className.includes('shadow-'))).toBe(true);
});

it('hides table sort icons on mobile but keeps header labels visible', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const buttons = [...fixture.nativeElement.querySelectorAll('thead th button')] as HTMLButtonElement[];
  expect(buttons).toHaveLength(5);
  expect(buttons.every((button) => button.querySelector('[aria-hidden="true"]')?.className.includes('max-[600px]:hidden'))).toBe(true);
  expect(buttons[0].textContent).toContain('Username');
});

it('keeps a fixed table layout so sorting cannot resize the columns', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
  expect(table.classList.contains('table-fixed')).toBe(true);
  expect(table.querySelectorAll('colgroup col')).toHaveLength(10);
  (table.tHead!.rows[0].cells[5].querySelector('button') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(table.classList.contains('table-fixed')).toBe(true);
});

it('shows compact, borderless status chips without leading dots', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const chips = [...fixture.nativeElement.querySelectorAll('tbody td span[data-testid="status-chip"]')] as HTMLElement[];
  expect(chips).toHaveLength(10);
  expect(chips.every((chip) => chip.classList.contains('rounded-[4px]') && chip.classList.contains('border-0') && chip.classList.contains('px-2') && chip.classList.contains('py-1'))).toBe(true);
  expect(chips.every((chip) => chip.querySelector('span') === null)).toBe(true);
});

it('offers accessible View, Edit, and Delete actions without changing employee data', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const actions = fixture.nativeElement.querySelector('tbody tr td:last-child') as HTMLElement;
  const store = TestBed.inject(EmployeeStore);
  const before = store.all();
  expect(actions.querySelector('a[aria-label^="View"] svg')).not.toBeNull();
  const edit = actions.querySelector('button[aria-label^="Edit"]') as HTMLButtonElement;
  const remove = actions.querySelector('button[aria-label^="Delete"]') as HTMLButtonElement;
  expect(edit.querySelector('svg')).not.toBeNull();
  expect(remove.querySelector('svg')).not.toBeNull();
  edit.click();
  expect(TestBed.inject(ToastService).items().at(-1)).toMatchObject({ tone: 'warning' });
  remove.click();
  expect(TestBed.inject(ToastService).items().at(-1)).toMatchObject({ tone: 'error' });
  expect(store.all()).toEqual(before);
});

it('keeps View as a link to employee detail', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const actions = fixture.nativeElement.querySelector('tbody tr td:last-child') as HTMLElement;
  expect(actions.querySelector('a')?.getAttribute('aria-label')).toContain('View');
  expect(actions.querySelector('a')?.getAttribute('href')).toContain('/employees/');
  expect(actions.querySelector('a svg')).not.toBeNull();
  expect(actions.querySelector('a')?.textContent?.trim()).toBe('');
  expect(actions.querySelectorAll('button')).toHaveLength(2);
});

it('provides a compact mobile menu that opens and closes without changing desktop navigation', () => {
  vi.useFakeTimers();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const sidebar = fixture.nativeElement.querySelector('app-employee-sidebar aside') as HTMLElement;
  const toggle = sidebar.querySelector('[aria-label="Toggle menu"]') as HTMLButtonElement;
  expect(toggle).not.toBeNull();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(sidebar.querySelector('[data-testid="mobile-navigation"]')).toBeNull();
  toggle.click();
  fixture.detectChanges();
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(sidebar.querySelector('[data-testid="mobile-navigation"] a[href="/employees"]')).not.toBeNull();
  expect(sidebar.querySelector('[data-testid="mobile-navigation"] button')?.textContent).toContain('Sign out');
  toggle.click();
  fixture.detectChanges();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(sidebar.querySelector('[data-testid="mobile-navigation"]')?.classList.contains('is-closing')).toBe(true);
  vi.advanceTimersByTime(220);
  fixture.detectChanges();
  expect(sidebar.querySelector('[data-testid="mobile-navigation"]')).toBeNull();
});

it('keeps only Username sticky on mobile while preserving Actions on desktop', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
  for (const row of [table.tHead!.rows[0], table.tBodies[0].rows[0]]) {
    expect(row.cells[0].classList.contains('sticky')).toBe(true);
    expect(row.cells[9].className).toContain('max-[600px]:static');
    expect(row.cells[9].className).toContain('sticky');
  }
});

it('shows two compact mobile status chips below Sort without a full-width summary box', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const summary = fixture.nativeElement.querySelector('[aria-label="Employee status"]') as HTMLElement;
  const sort = fixture.nativeElement.querySelector('[data-testid="mobile-sort"]') as HTMLElement;
  const cards = [...summary.querySelectorAll('[data-status]')] as HTMLElement[];
  expect(sort.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(summary.className).toContain('max-[600px]:border-0');
  expect(summary.className).toContain('max-[600px]:px-0');
  expect(cards).toHaveLength(2);
  expect(cards.every((card) => card.className.includes('max-[600px]:w-auto') && card.className.includes('max-[600px]:inline-flex'))).toBe(true);
  expect(summary.textContent).toContain('106');
  expect(summary.textContent).toContain('14');
});

it('keeps search beside an icon-only Add link on mobile', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const controls = fixture.nativeElement.querySelector('[data-testid="employee-controls"]') as HTMLElement;
  const add = controls.querySelector('a[href="/employees/add"]') as HTMLAnchorElement;
  expect(controls.className).toContain('max-[600px]:gap-1.5');
  expect(controls.querySelector('#name-search')).not.toBeNull();
  expect(controls.querySelector('#group-search')).not.toBeNull();
  expect(controls.querySelector('#name-search')?.closest('.flex')?.contains(controls.querySelector('#group-search'))).toBe(true);
  expect(add.getAttribute('aria-label')).toBe('Add employee');
  expect(add.querySelector('svg')).not.toBeNull();
  expect(add.querySelector('[data-testid="add-label"]')?.className).toContain('max-[600px]:hidden');
});

it('sorts by the selected mobile column and direction and retains the choice', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[aria-label="Sort employees"]') as HTMLButtonElement;
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  trigger.click();
  fixture.detectChanges();
  const panel = fixture.nativeElement.querySelector('[aria-label="Sort options"]') as HTMLElement;
  expect(panel).not.toBeNull();
  expect(panel.querySelector('select')).toBeNull();
  const column = panel.querySelector('[aria-label="Sort column"]') as HTMLButtonElement;
  expect(column.getAttribute('aria-expanded')).toBe('false');
  column.click();
  fixture.detectChanges();
  (panel.querySelector('[role="listbox"][aria-label="Sort column options"] [data-sort-key="basicSalary"]') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(fixture.nativeElement.querySelector('[aria-label="Sort options"]')).toBeNull();
  trigger.click();
  fixture.detectChanges();
  const reopenedPanel = fixture.nativeElement.querySelector('[aria-label="Sort options"]') as HTMLElement;
  expect(reopenedPanel.querySelector('[aria-label="Sort column"]')?.textContent).toContain('Basic salary');
  const direction = reopenedPanel.querySelector('[aria-label="Sort direction"]') as HTMLButtonElement;
  direction.click();
  fixture.detectChanges();
  (reopenedPanel.querySelector('[role="listbox"][aria-label="Sort direction options"] [data-sort-direction="desc"]') as HTMLButtonElement).click();
  fixture.detectChanges();
  const state = TestBed.inject(EmployeeListStateService).state();
  expect(state).toMatchObject({ sortKey: 'basicSalary', sortDirection: 'desc', page: 1 });
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(fixture.nativeElement.querySelector('[aria-label="Sort options"]')).toBeNull();
  expect(fixture.componentInstance.result().rows[0].basicSalary).toBeGreaterThanOrEqual(fixture.componentInstance.result().rows[1].basicSalary);
});

it('makes the mobile sort trigger and popover full width', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[aria-label="Sort employees"]') as HTMLButtonElement;
  expect(trigger.classList.contains('w-full')).toBe(true);
  trigger.click();
  fixture.detectChanges();
  const panel = fixture.nativeElement.querySelector('[aria-label="Sort options"]') as HTMLElement;
  expect(panel.classList.contains('w-full')).toBe(true);
});

it('dismisses a custom sort dropdown on Escape without closing the outer popover', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[aria-label="Sort employees"]') as HTMLButtonElement;
  trigger.click();
  fixture.detectChanges();
  const column = fixture.nativeElement.querySelector('[aria-label="Sort column"]') as HTMLButtonElement;
  column.click();
  fixture.detectChanges();
  expect(column.getAttribute('aria-expanded')).toBe('true');
  column.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  fixture.detectChanges();
  expect(column.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});

it('dismisses the mobile sort popover on Escape and outside click', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[aria-label="Sort employees"]') as HTMLButtonElement;
  trigger.click();
  fixture.detectChanges();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  fixture.detectChanges();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  trigger.click();
  fixture.detectChanges();
  document.body.click();
  fixture.detectChanges();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});

it('opens Detail when a row cell is tapped but not when Edit or Delete is tapped', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter(detailRoutes)] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const router = TestBed.inject(Router);
  const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
  const username = fixture.componentInstance.result().rows[0].username;
  row.querySelector<HTMLButtonElement>('button[aria-label^="Edit"]')!.click();
  row.querySelector<HTMLButtonElement>('button[aria-label^="Delete"]')!.click();
  await fixture.whenStable();
  expect(router.url).not.toContain(`/employees/${username}`);
  clickRowCell(row, 1);
  await fixture.whenStable();
  expect(router.url).toBe(`/employees/${username}`);
});

it('lets keyboard users open a focused employee row without activating actions', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter(detailRoutes)] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
  const username = fixture.componentInstance.result().rows[0].username;
  expect(row.tabIndex).toBe(0);
  row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await fixture.whenStable();
  expect(TestBed.inject(Router).url).toBe(`/employees/${username}`);
});

it('removes the redundant branding and intro blocks', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const page = fixture.nativeElement as HTMLElement;
  expect(page.textContent).not.toContain('people.desk');
  expect(page.textContent).not.toContain('Admin Demo');
  expect(page.textContent).not.toContain('PEOPLE DIRECTORY');
  expect(page.textContent).not.toContain('All employees');
});

it('announces the active column and sort direction', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(EmployeeList);
  fixture.detectChanges();
  const employeeHeader = [...(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>)].find((cell) => cell.textContent?.includes('First name')) as HTMLElement;
  expect(employeeHeader.getAttribute('aria-sort')).toBe('ascending');
  (employeeHeader.querySelector('button') as HTMLButtonElement).click();
  fixture.detectChanges();
  expect(employeeHeader.getAttribute('aria-sort')).toBe('descending');
});
