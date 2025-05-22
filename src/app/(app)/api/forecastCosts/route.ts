
// src/app/(app)/api/forecastCosts/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface CostDataPoint {
  month: string; // e.g., "Jan 23", "Fev 23"
  cost: number;
}

export interface ForecastPayload {
  sectors: string[];
  historyMonths: number;
  forecastMonths: number;
}

export interface ForecastResponse {
  history: CostDataPoint[];
  forecast: CostDataPoint[];
}

// Helper to generate month labels
const getMonthLabels = (startDate: Date, numMonths: number, isForecast: boolean = false): string[] => {
  const labels: string[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numMonths; i++) {
    if (isForecast && i === 0) {
      // For forecast, the first month is the next month after history ends
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const month = currentDate.toLocaleString('pt-BR', { month: 'short' });
    const year = currentDate.getFullYear().toString().slice(-2);
    labels.push(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`);
    if (!(isForecast && i ===0)) { // Don't advance month again if it's the first forecast month
        currentDate.setMonth(currentDate.getMonth() + (isForecast ? 1 : -1));
    } else if (isForecast && i > 0) {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  return isForecast ? labels : labels.reverse();
};


export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForecastPayload;
    const { sectors, historyMonths, forecastMonths } = body;

    if (!sectors || sectors.length === 0 || !historyMonths || !forecastMonths) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const today = new Date();
    const historyStartDate = new Date(today);
    historyStartDate.setMonth(today.getMonth() - (historyMonths -1) ); // Ensure correct start for labels

    const historyLabels = getMonthLabels(historyStartDate, historyMonths);
    
    const history: CostDataPoint[] = historyLabels.map(label => ({
      month: label,
      cost: Math.floor(Math.random() * (5000 - 1000 + 1) + 1000) * sectors.length,
    }));
    
    // Set forecast start date to be the month after the last history month
    const lastHistoryMonthStr = history[history.length -1].month;
    const [lastMonthName, lastYearSuffix] = lastHistoryMonthStr.split(' ');
    const monthNamesPt = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const lastMonthIndex = monthNamesPt.findIndex(m => m === lastMonthName.toLowerCase());
    const forecastStartDate = new Date(parseInt(`20${lastYearSuffix}`), lastMonthIndex);
    // forecastStartDate.setMonth(forecastStartDate.getMonth() + 1); // This was advancing twice


    const forecastLabels = getMonthLabels(new Date(forecastStartDate), forecastMonths, true);

    const forecast: CostDataPoint[] = forecastLabels.map(label => {
      const lastMonthCost = history.length > 0 ? history[history.length -1].cost / sectors.length : Math.random() * 3000 + 1000;
      const randomFactor = (Math.random() - 0.4) * 500; // Fluctuation
      return {
        month: label,
        cost: Math.max(500, Math.floor(lastMonthCost + randomFactor) * sectors.length),
      };
    });
    
    return NextResponse.json({ history, forecast });

  } catch (error) {
    console.error('Error in /api/forecastCosts:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
