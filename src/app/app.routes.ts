import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login').then((module) => module.Login) },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/list/employee-list').then((module) => module.EmployeeList),
  },
  {
    path: 'employees/add',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/add/employee-add').then((module) => module.EmployeeAdd),
  },
  {
    path: 'employees/:username',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/detail/employee-detail').then((module) => module.EmployeeDetail),
  },
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  { path: '**', redirectTo: 'employees' },
];
