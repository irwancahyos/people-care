import { Employee, EmployeeTableState } from './employee.model';

export function selectEmployees(
  employees: readonly Employee[],
  state: EmployeeTableState,
): { rows: Employee[]; total: number; pages: number } {
  const name = state.name.trim().toLocaleLowerCase();
  const group = state.group.trim().toLocaleLowerCase();
  const filtered = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`.toLocaleLowerCase().includes(name) &&
      employee.group.toLocaleLowerCase().includes(group),
  );
  const direction = state.sortDirection === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((left, right) => {
    const a = left[state.sortKey];
    const b = right[state.sortKey];
    return (
      (typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b))) * direction
    );
  });
  const pageSize = Math.max(1, state.pageSize);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.max(1, Math.min(state.page, pages));
  return {
    rows: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    pages,
  };
}
