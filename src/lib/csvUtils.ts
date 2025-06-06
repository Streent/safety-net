
// src/lib/csvUtils.ts
// Removida a tipagem específica de CostDataPoint para tornar a função mais genérica
// import type { CostDataPoint } from '@/app/(app)/api/forecastCosts/route';

export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(headerName => {
        const value = row[headerName as keyof typeof row];
        // Stringify para tratar vírgulas e aspas dentro dos valores
        // Se o valor for null ou undefined, retorna string vazia
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // Escapa aspas duplas dentro do valor, duplicando-as
        const escapedValue = stringValue.replace(/"/g, '""');
        // Envolve o valor em aspas duplas se contiver vírgula, aspas duplas ou quebra de linha
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
}

export function downloadCSV(csvString: string, filename: string = 'export.csv'): void {
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

