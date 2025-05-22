
// src/app/api/testReminder/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface TestReminderPayload {
  channel: 'whatsapp' | 'sms' | 'email';
  contact: string; // Phone number for whatsapp/sms, email for email
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TestReminderPayload;
    console.log('Received POST to /api/testReminder:', body);

    const { channel, contact } = body;

    if (!contact) {
      return NextResponse.json({ error: 'Informação de contato é obrigatória.' }, { status: 400 });
    }

    // Simulate sending a test reminder
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a potential failure for demonstration
    if (channel === 'sms' && contact.includes('error')) {
      return NextResponse.json({ error: 'Falha simulada ao enviar SMS de teste.' }, { status: 500 });
    }

    return NextResponse.json({ message: `Lembrete de teste enviado para ${contact} via ${channel} com sucesso!` }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/testReminder POST:', error);
    return NextResponse.json({ error: 'Erro ao enviar lembrete de teste' }, { status: 500 });
  }
}
