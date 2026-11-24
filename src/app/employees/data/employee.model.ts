export interface Employee {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: string;
  group: string;
  description: string;
}

export type EmployeeSortKey = keyof Pick<
  Employee,
  'firstName' | 'username' | 'email' | 'basicSalary' | 'status' | 'group'
>;

export interface EmployeeTableState {
  name: string;
  group: string;
  sortKey: EmployeeSortKey;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
