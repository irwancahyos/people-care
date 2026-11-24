import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmployeeStore } from '../data/employee.store';
import { EmployeeSidebar } from '../employee-sidebar';
import { formatDateTime, formatSalary } from '../data/employee-format';

@Component({
  selector: 'app-employee-detail',
  imports: [RouterLink, EmployeeSidebar],
  templateUrl: './employee-detail.html',
})
export class EmployeeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(EmployeeStore);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly employee = computed(() => this.store.find(this.params().get('username') ?? ''));
  readonly salary = formatSalary;
  readonly dateTime = formatDateTime;
}
