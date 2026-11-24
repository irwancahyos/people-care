import { AbstractControl, ValidationErrors } from '@angular/forms';
import { EMPLOYEE_GROUPS } from '../data/employee-groups';

export function requiredText(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { required: true };
}

export function selectedGroup(control: AbstractControl): ValidationErrors | null {
  return EMPLOYEE_GROUPS.some(group => group === control.value) ? null : { group: true };
}

export function nonNegativeNumber(control: AbstractControl): ValidationErrors | null {
  if (control.value === '' || control.value === null) return null;
  const value = Number(control.value);
  return Number.isFinite(value) && value >= 0 ? null : { salary: true };
}

export function validDateTime(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const value = String(control.value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return { dateTime: true };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { dateTime: true };
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return local === value ? null : { dateTime: true };
}

export function birthDateNotFuture(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  if (validDateTime(control)) return { futureDate: true };
  return new Date(control.value).getTime() <= Date.now() ? null : { futureDate: true };
}
