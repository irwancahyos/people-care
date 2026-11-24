const salaryFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 2,
});

const listSalaryFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatters = {
  medium: {
    date: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }),
    dateTime: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
  },
  long: {
    date: new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }),
    dateTime: new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' }),
  },
};

export function formatSalary(value: number): string {
  return salaryFormatter.format(value);
}

export function formatListSalary(value: number): string {
  return listSalaryFormatter.format(value);
}

export function formatDateTime(value: string, dateStyle: 'medium' | 'long' = 'long'): string {
  const hasTime = value.includes('T');
  const date = new Date(hasTime ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Invalid date'
    : dateFormatters[dateStyle][hasTime ? 'dateTime' : 'date'].format(date);
}
