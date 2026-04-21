export function formatSalary(value?: string) {
  return value?.trim() ? value : 'Compensation discussed during screening';
}
