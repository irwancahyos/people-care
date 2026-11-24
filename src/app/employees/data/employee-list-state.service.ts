import { Injectable, signal } from '@angular/core';
import { EmployeeTableState } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeListStateService {
  readonly state = signal<EmployeeTableState>({
    name: '',
    group: '',
    sortKey: 'firstName',
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  update(changes: Partial<EmployeeTableState>): void {
    this.state.update((previous) => ({ ...previous, ...changes }));
  }
}
