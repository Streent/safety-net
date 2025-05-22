
// src/lib/csvUtils.ts
import type { CostDataPoint } from '@/app/(app)/api/forecastCosts/route';

export function convertToCSV(data: CostDataPoint[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => JSON.stringify(row[header as keyof CostDataPoint], (_, value) => value === null ? '' : value)).join(',')
    ),
  ];

  return csvRows.join('\n');
}

export function downloadCSV(csvString: string, filename: string = 'forecast.csv'): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
