import { describe, expect, it } from 'vitest';
import { selectEmployees } from './employee-table';
import { createSeedEmployees } from './employee-seed';
import { Employee, EmployeeTableState } from './employee.model';

const employees: Employee[] = [
  {
    username: 'zara',
    firstName: 'Zara',
    lastName: 'Lee',
    email: 'zara@example.com',
    birthDate: '1990-01-01T00:00',
    basicSalary: 5000000,
    status: 'Active',
    group: 'Finance',
    description: '2024-01-01T00:00',
  },
  {
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Ng',
    email: 'alice@example.com',
    birthDate: '1991-01-01T00:00',
    basicSalary: 6000000,
    status: 'Active',
    group: 'Design',
    description: '2024-01-01T00:00',
  },
  {
    username: 'adam',
    firstName: 'Adam',
    lastName: 'Ray',
    email: 'adam@example.com',
    birthDate: '1992-01-01T00:00',
    basicSalary: 7000000,
    status: 'Active',
    group: 'Finance',
    description: '2024-01-01T00:00',
  },
];
const state: EmployeeTableState = {
  name: '',
  group: '',
  sortKey: 'firstName',
  sortDirection: 'asc',
  page: 1,
  pageSize: 10,
};

describe('employee table', () => {
  it('combines name and group search using AND', () => {
    expect(
      selectEmployees(employees, { ...state, name: 'a', group: 'finance' }).rows.map(
        (row) => row.username,
      ),
    ).toEqual(['adam', 'zara']);
  });
  it('sorts filtered records before slicing the requested page', () => {
    expect(
      selectEmployees(employees, { ...state, page: 2, pageSize: 1 }).rows.map(
        (row) => row.username,
      ),
    ).toEqual(['alice']);
  });
  it('keeps all employees when both search fields are empty', () => {
    expect(selectEmployees(employees, state).total).toBe(3);
  });
  it('uses Active and On leave as seed statuses', () => {
    const statuses = new Set(createSeedEmployees().map((employee) => employee.status));
    expect(statuses).toEqual(new Set(['Active', 'On leave']));
  });
  it('seeds at least 100 employees with unique usernames', () => {
    const seed = createSeedEmployees();
    expect(seed.length).toBeGreaterThanOrEqual(100);
    expect(new Set(seed.map((employee) => employee.username)).size).toBe(seed.length);
  });
});
