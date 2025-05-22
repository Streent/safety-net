
// src/app/api/reminderSettings/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface ReminderSettingsPayload {
  whatsappEnabled?: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as ReminderSettingsPayload;
    console.log('Received PATCH to /api/reminderSettings:', body);

    // Simulate saving the settings
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, you'd save this to a database
    // For now, just log and return success

    return NextResponse.json({ message: 'Configurações de lembrete salvas com sucesso!', settings: body }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/reminderSettings PATCH:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações de lembrete' }, { status: 500 });
  }
}

// Optional: GET endpoint to fetch current settings if needed later
export async function GET() {
    // Simulate fetching current settings
    await new Promise(resolve => setTimeout(resolve, 300));
    const currentSettings: ReminderSettingsPayload = {
        whatsappEnabled: true,
        smsEnabled: false,
        emailEnabled: true,
    };
    return NextResponse.json(currentSettings);
}
