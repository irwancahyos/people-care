import { Employee } from './employee.model';
import { EMPLOYEE_GROUPS } from './employee-groups';

const FIRST_NAMES = [
  'Alex',
  'Morgan',
  'Taylor',
  'Jordan',
  'Casey',
  'Riley',
  'Sam',
  'Jamie',
  'Avery',
  'Drew',
  'Cameron',
  'Robin',
];
const LAST_NAMES = [
  'Chen',
  'Santos',
  'Patel',
  'Wong',
  'Kim',
  'Garcia',
  'Rahman',
  'Tan',
  'Lee',
  'Nguyen',
  'Wilson',
  'Park',
];

export function createSeedEmployees(): Employee[] {
  return Array.from({ length: 120 }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${String(index + 1).padStart(3, '0')}`;
    return {
      username,
      firstName,
      lastName,
      email: `${username}@example.com`,
      birthDate: `${1985 + (index % 17)}-${String((index % 12) + 1).padStart(2, '0')}-15T09:00`,
      basicSalary: 4500000 + (index % 14) * 750000,
      status: index % 9 === 0 ? 'On leave' : 'Active',
      group: EMPLOYEE_GROUPS[index % EMPLOYEE_GROUPS.length],
      description: `2024-${String((index % 12) + 1).padStart(2, '0')}-01T09:00`,
    };
  });
}
