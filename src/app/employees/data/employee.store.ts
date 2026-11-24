import { Injectable, signal } from '@angular/core';
import { Employee } from './employee.model';
import { createSeedEmployees } from './employee-seed';

@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  private readonly employees = signal<Employee[]>(createSeedEmployees());

  all(): Employee[] {
    return this.employees();
  }

  find(username: string): Employee | undefined {
    return this.employees().find((employee) => employee.username === username);
  }

  add(employee: Employee): void {
    if (this.find(employee.username)) {
      throw new Error('Username already exists.');
    }
    this.employees.update((employees) => [...employees, employee]);
  }
}
