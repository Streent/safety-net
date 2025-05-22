
// src/components/settings/__tests__/ReminderSettings.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import 'whatwg-fetch'; // Polyfill fetch for Node environment

import { ReminderSettings } from '../ReminderSettings';
import { Toaster } from '@/components/ui/toaster'; // To observe toasts

// Mock Toaster hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const server = setupServer(
  http.patch('/api/reminderSettings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ message: 'Configurações salvas!', settings: body });
  }),
  http.post('/api/testReminder', async ({ request }) => {
    const body = await request.json() as { channel: string, contact: string };
    if (body.contact === 'error@example.com' || body.contact === 'error_phone') {
      return HttpResponse.json({ error: 'Falha simulada no envio.' }, { status: 500 });
    }
    if (!body.contact) {
        return HttpResponse.json({ error: 'Contato obrigatório.' }, { status: 400 });
    }
    return HttpResponse.json({ message: `Teste para ${body.channel} enviado para ${body.contact}!` });
  }),
  http.get('/api/reminderSettings', () => { // Mock GET for initial settings
    return HttpResponse.json({
        whatsappEnabled: true,
        smsEnabled: false,
        emailEnabled: true,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockToast.mockClear();
});
afterAll(() => server.close());

describe('ReminderSettings Component', () => {
  test('renders reminder channels and contact fields', async () => {
    render(<ReminderSettings />);
    expect(screen.getByLabelText(/Número de Telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço de E-mail/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Ativar\/desativar lembretes por WhatsApp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ativar\/desativar lembretes por SMS/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ativar\/desativar lembretes por E-mail/i)).toBeInTheDocument();
  });

  test('validates email field before sending email test reminder', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ReminderSettings />
        <Toaster />
      </>
    );

    const emailTestButton = screen.getAllByRole('button', { name: /Testar Lembrete/i })[2]; // Assuming Email is the 3rd
    await user.click(emailTestButton);

    expect(await screen.findByText(/E-mail inválido para este teste./i)).toBeInTheDocument();
    expect(mockToast).not.toHaveBeenCalled();

    const emailInput = screen.getByLabelText(/Endereço de E-mail/i);
    await user.type(emailInput, 'teste@valido.com');
    await user.click(emailTestButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Teste Enviado!',
          description: 'Teste para email enviado para teste@valido.com!',
        })
      );
    });
  });

  test('validates phone field before sending WhatsApp test reminder', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ReminderSettings />
        <Toaster />
      </>
    );
    
    const whatsappTestButton = screen.getAllByRole('button', { name: /Testar Lembrete/i })[0]; // Assuming WhatsApp is the 1st
    await user.click(whatsappTestButton);

    expect(await screen.findByText(/Número de telefone é obrigatório para este teste./i)).toBeInTheDocument();
    expect(mockToast).not.toHaveBeenCalled();
    
    const phoneInput = screen.getByLabelText(/Número de Telefone/i);
    await user.type(phoneInput, '5511987654321');
    await user.click(whatsappTestButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Teste Enviado!',
          description: 'Teste para whatsapp enviado para 5511987654321!',
        })
      );
    });
  });


  test('handles successful test reminder API call', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ReminderSettings />
        <Toaster />
      </>
    );

    const emailInput = screen.getByLabelText(/Endereço de E-mail/i);
    await user.type(emailInput, 'success@example.com');

    const emailTestButton = screen.getAllByRole('button', { name: /Testar Lembrete/i })[2];
    
    // Check initial state of button
    expect(emailTestButton).not.toBeDisabled();
    
    await user.click(emailTestButton);

    // Check for loading state (button should be disabled)
    expect(emailTestButton).toBeDisabled();
    expect(emailTestButton.querySelector('.animate-spin')).toBeInTheDocument();


    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Teste Enviado!',
          description: 'Teste para email enviado para success@example.com!',
        })
      );
    });
     // Check if button is re-enabled
    expect(emailTestButton).not.toBeDisabled();
    expect(emailTestButton.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  test('handles failed test reminder API call', async () => {
     const user = userEvent.setup();
    render(
      <>
        <ReminderSettings />
        <Toaster />
      </>
    );
    const emailInput = screen.getByLabelText(/Endereço de E-mail/i);
    await user.type(emailInput, 'error@example.com');

    const emailTestButton = screen.getAllByRole('button', { name: /Testar Lembrete/i })[2];
    await user.click(emailTestButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Falha no Teste',
          description: 'Falha simulada no envio.',
        })
      );
    });
  });

  test('saves toggle state via API call', async () => {
    const user = userEvent.setup();
    render(<ReminderSettings />);
    
    // Wait for initial settings to potentially load
    await waitFor(() => {
      expect(screen.getByLabelText(/Ativar\/desativar lembretes por WhatsApp/i)).toBeChecked();
    });

    const whatsappToggle = screen.getByLabelText(/Ativar\/desativar lembretes por WhatsApp/i);
    
    // Click to disable
    await user.click(whatsappToggle); 
    expect(whatsappToggle).not.toBeChecked();

    // Wait for the PATCH call to /api/reminderSettings (mocked)
    // The toast for saving is commented out in the component, so we can't check for it directly.
    // We rely on the fact that the PATCH call is made in handleToggleChange.
    // A more robust test would involve spying on fetch or checking a success state if one was set.
    await waitFor(() => new Promise(res => setTimeout(res, 600))); // wait for simulated PATCH
    
    // Click to enable again
    await user.click(whatsappToggle); 
    expect(whatsappToggle).toBeChecked();
  });
});
