import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../shared/toast/toast.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeSidebar } from '../employee-sidebar';
import { FormInput } from '../../shared/form-input';
import { EMPLOYEE_GROUPS } from '../data/employee-groups';
import { EmployeeStore } from '../data/employee.store';
import { EmployeeListStateService } from '../data/employee-list-state.service';
import { selectEmployees } from '../data/employee-table';
import {
  birthDateNotFuture,
  nonNegativeNumber,
  requiredText,
  selectedGroup,
  validDateTime,
} from './employee-validators';

@Component({
  selector: 'app-employee-add',
  imports: [ReactiveFormsModule, RouterLink, EmployeeSidebar, FormInput],
  templateUrl: './employee-add.html',
})
export class EmployeeAdd {
  private readonly store = inject(EmployeeStore);
  private readonly listState = inject(EmployeeListStateService);
  private readonly router = inject(Router);
  readonly groupSearch = signal('');
  readonly groupOpen = signal(false);
  readonly statusSearch = signal('');
  readonly statusOpen = signal(false);
  readonly statuses = computed(() =>
    (['Active', 'On leave'] as const).filter((status) =>
      status.toLowerCase().includes(this.statusSearch().toLowerCase()),
    ),
  );
  readonly salaryDisplay = signal('');
  private readonly toast = inject(ToastService);
  readonly groups = computed(() =>
    EMPLOYEE_GROUPS.filter((group) =>
      group.toLowerCase().includes(this.groupSearch().toLowerCase()),
    ),
  );
  readonly now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    firstName: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    lastName: new FormControl('', { nonNullable: true, validators: [requiredText] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [requiredText, Validators.email],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, birthDateNotFuture],
    }),
    basicSalary: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nonNegativeNumber],
    }),
    status: new FormControl('Active', { nonNullable: true, validators: [Validators.required] }),
    group: new FormControl('', { nonNullable: true, validators: [selectedGroup] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, validDateTime] }),
  });

  updateSalary(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.form.controls.basicSalary.setValue(digits);
    this.salaryDisplay.set(formatted);
    input.value = formatted;
  }

  closeGroupOnFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.groupOpen.set(false);
    }
  }

  selectGroup(group: string): void {
    this.form.controls.group.setValue(group);
    this.form.controls.group.markAsTouched();
    this.groupSearch.set('');
    this.groupOpen.set(false);
  }

  selectStatus(status: 'Active' | 'On leave'): void {
    this.form.controls.status.setValue(status);
    this.form.controls.status.markAsTouched();
    this.statusSearch.set('');
    this.statusOpen.set(false);
  }

  closeStatusOnFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.statusOpen.set(false);
    }
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    try {
      this.store.add({
        ...values,
        username: values.username.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        basicSalary: Number(values.basicSalary),
      });
      const state = this.listState.state();
      const allRows = selectEmployees(this.store.all(), {
        ...state, name: '', group: '', page: 1, pageSize: this.store.all().length,
      }).rows;
      const index = allRows.findIndex((employee) => employee.username === values.username.trim());
      this.listState.update({ name: '', group: '', page: Math.floor(index / state.pageSize) + 1 });
      this.toast.show(`${values.firstName.trim()} ${values.lastName.trim()} added successfully.`, { tone: 'success' });
      void this.router.navigateByUrl('/employees');
    } catch (error) {
      this.toast.show(error instanceof Error ? error.message : 'Employee could not be saved.', { tone: 'error' });
    }
  }
}
