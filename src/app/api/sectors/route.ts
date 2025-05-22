
// src/app/api/sectors/route.ts
import { NextResponse } from 'next/server';

export type Sector = {
  id: string;
  name: string;
};

const mockSectors: Sector[] = [
  { id: 'tech', name: 'Tecnologia' },
  { id: 'health', name: 'Saúde' },
  { id: 'finance', name: 'Finanças' },
  { id: 'retail', name: 'Varejo' },
  { id: 'manufacturing', name: 'Manufatura' },
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockSectors);
}
