import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowDown,
  LucideArrowUp,
  LucideArrowUpDown,
  LucideCircleCheck,
  LucideClock3,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronDown,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucidePlus,
  LucideSearch,
  LucideListFilter,
} from '@lucide/angular';
import { EmployeeSidebar } from '../employee-sidebar';
import { EmployeeListStateService } from '../data/employee-list-state.service';
import { EmployeeSortKey } from '../data/employee.model';
import { EmployeeStore } from '../data/employee.store';
import { selectEmployees } from '../data/employee-table';
import { ToastService } from '../../shared/toast/toast.service';
import { Employee } from '../data/employee.model';
import { formatDateTime, formatListSalary } from '../data/employee-format';

@Component({
  selector: 'app-employee-list',
  imports: [
    RouterLink,
    EmployeeSidebar,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    LucidePlus,
    LucideSearch,
    LucideArrowUpDown,
    LucideCircleCheck,
    LucideClock3,
    LucideArrowUp,
    LucideArrowDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronDown,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideListFilter,
  ],
  templateUrl: './employee-list.html',
})
export class EmployeeList {
  readonly store = inject(EmployeeStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly listState = inject(EmployeeListStateService);
  readonly result = computed(() => selectEmployees(this.store.all(), this.listState.state()));
  readonly visiblePage = computed(() => Math.min(this.listState.state().page, this.result().pages));
  readonly pageSizeOpen = signal(false);
  readonly sortOpen = signal(false);
  readonly sortDropdown = signal<'column' | 'direction' | null>(null);
  readonly selectedSortLabel = computed(() => this.sortOptions.find((option) => option.key === this.listState.state().sortKey)?.label ?? 'First name');
  readonly sortOptions: { key: EmployeeSortKey; label: string }[] = [
    { key: 'firstName', label: 'First name' },
    { key: 'username', label: 'Username' },
    { key: 'basicSalary', label: 'Basic salary' },
    { key: 'status', label: 'Status' },
    { key: 'group', label: 'Group' },
    { key: 'email', label: 'Email' },
  ];
  readonly scrolledFromStart = signal(false);
  readonly scrolledFromEnd = signal(false);
  readonly pageSizes = [10, 25, 50, 100];
  readonly pageSizePositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  ];
  readonly statusCounts = computed(() => {
    const employees = this.store.all();
    return {
      active: employees.filter((employee) => employee.status === 'Active').length,
      onLeave: employees.filter((employee) => employee.status === 'On leave').length,
    };
  });

  readonly dateTime = (value: string): string => formatDateTime(value, 'medium');
  readonly salary = formatListSalary;

  search(key: 'name' | 'group', value: string): void {
    this.listState.update({ [key]: value, page: 1 });
  }

  updateTableScroll(element: HTMLElement): void {
    this.scrolledFromStart.set(element.scrollLeft > 1);
    this.scrolledFromEnd.set(element.scrollLeft > 1 && element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }

  setPageSize(value: number): void {
    this.listState.update({ pageSize: value, page: 1 });
    this.pageSizeOpen.set(false);
  }

  sortLabel(key: EmployeeSortKey): 'ascending' | 'descending' | 'none' {
    const state = this.listState.state();
    return state.sortKey === key
      ? state.sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none';
  }

  sort(key: EmployeeSortKey): void {
    const current = this.listState.state();
    this.listState.update({
      sortKey: key,
      sortDirection: current.sortKey === key && current.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  }

  setMobileSort(key: EmployeeSortKey, direction: 'asc' | 'desc'): void {
    this.listState.update({ sortKey: key, sortDirection: direction, page: 1 });
    this.sortDropdown.set(null);
    this.sortOpen.set(false);
  }

  toggleSortDropdown(dropdown: 'column' | 'direction'): void {
    this.sortDropdown.update((current) => current === dropdown ? null : dropdown);
  }

  openEmployee(event: MouseEvent | KeyboardEvent, employee: Employee): void {
    if ((event.target as HTMLElement).closest('a, button')) return;
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return;
    if (event instanceof KeyboardEvent) event.preventDefault();
    void this.router.navigate(['/employees', employee.username]);
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeSortOnEscape(event: Event): void {
    if (this.sortDropdown()) {
      this.sortDropdown.set(null);
      event.stopPropagation();
    } else {
      this.sortOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  closeSortOnOutsideClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('[data-testid="mobile-sort"]')) {
      this.sortDropdown.set(null);
      this.sortOpen.set(false);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.result().pages) this.listState.update({ page });
  }

  notifyAction(action: 'Edit' | 'Delete', employee: Employee): void {
    this.toast.show(`${action} ${employee.firstName} ${employee.lastName} is a demo action.`, {
      tone: action === 'Edit' ? 'warning' : 'error',
    });
  }
}
