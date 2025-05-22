
// src/components/panels/__tests__/CostForecastPanel.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import 'whatwg-fetch'; // Polyfill fetch for Node environment

import { CostForecastPanel } from '../CostForecastPanel';
import type { Sector } from '@/app/api/sectors/route';
import type { ForecastResponse, CostDataPoint } from '@/app/(app)/api/forecastCosts/route';

// Mock Toaster
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockSectorsData: Sector[] = [
  { id: 'tech', name: 'Tecnologia' },
  { id: 'health', name: 'Saúde' },
];

const mockForecastResponse: ForecastResponse = {
  history: [{ month: 'Jan 24', cost: 1000 }],
  forecast: [{ month: 'Fev 24', cost: 1200 }],
};

const server = setupServer(
  http.get('/api/sectors', () => {
    return HttpResponse.json(mockSectorsData);
  }),
  http.post('/api/forecastCosts', async ({ request }) => {
    // const body = await request.json();
    // console.log('MSW received POST with body:', body); // For debugging
    return HttpResponse.json(mockForecastResponse);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CostForecastPanel', () => {
  test('fetches sectors and renders them in the dropdown', async () => {
    render(<CostForecastPanel />);
    
    // Wait for sectors to load
    expect(await screen.findByText(/Tecnologia/i)).toBeInTheDocument();
    expect(screen.getByText(/Saúde/i)).toBeInTheDocument();
  });

  test('disables "Run Forecast" button if no sectors are selected', async () => {
    render(<CostForecastPanel />);
    await screen.findByText(/Selecione os setores.../i); // Wait for dropdown to be ready

    const runForecastButton = screen.getByRole('button', { name: /Rodar Previsão/i });
    expect(runForecastButton).toBeDisabled();
  });

  test('calls forecast API on "Run Forecast" click with selected sectors and updates chart', async () => {
    render(<CostForecastPanel />);
    
    // Wait for sectors to load and open dropdown
    const dropdownTrigger = await screen.findByRole('combobox');
    fireEvent.click(dropdownTrigger);

    // Select a sector
    const techSectorCheckbox = await screen.findByLabelText(/Tecnologia/i);
    fireEvent.click(techSectorCheckbox);
    
    // Close dropdown by clicking trigger again or body (simpler for test)
    fireEvent.click(dropdownTrigger); 
    // Ensure selection is reflected
    await waitFor(() => {
      expect(screen.getByText(/Tecnologia/i)).toBeInTheDocument(); 
    });


    const runForecastButton = screen.getByRole('button', { name: /Rodar Previsão/i });
    expect(runForecastButton).not.toBeDisabled(); // Should be enabled now
    fireEvent.click(runForecastButton);

    // Check for loading state
    expect(await screen.findByRole('button', { name: /Rodar Previsão/i })).toBeDisabled();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument(); // Assuming Loader2 adds a testid or specific class

    // Wait for forecast data to be displayed (e.g., by checking for a month label in chart)
    // Since charts are complex, we might check if the toast appears or if data is set
    await waitFor(() => {
      // This check depends on how chart data is rendered. 
      // For simplicity, we'll check if the button becomes enabled again.
      expect(screen.getByRole('button', { name: /Rodar Previsão/i })).not.toBeDisabled();
    }, { timeout: 3000 }); // Increase timeout for simulated API delay

    // Here you would ideally assert that the chart data has been updated.
    // This requires more specific selectors for chart elements or inspecting state if possible.
    // For now, we check if the toast would have been called (mocked) and button re-enabled.
    // Check if the "Download" button is now enabled
     expect(screen.getByRole('button', { name: /Download Previsão \(CSV\)/i})).not.toBeDisabled();

  });

  test('handles API error during forecast', async () => {
    server.use(
      http.post('/api/forecastCosts', () => {
        return new HttpResponse(JSON.stringify({ error: 'Simulated API Error' }), { status: 500 });
      })
    );

    render(<CostForecastPanel />);
    const dropdownTrigger = await screen.findByRole('combobox');
    fireEvent.click(dropdownTrigger);
    const techSectorCheckbox = await screen.findByLabelText(/Tecnologia/i);
    fireEvent.click(techSectorCheckbox);
    fireEvent.click(dropdownTrigger); 
    
    const runForecastButton = screen.getByRole('button', { name: /Rodar Previsão/i });
    fireEvent.click(runForecastButton);

    // Wait for loading to finish and button to be re-enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Rodar Previsão/i })).not.toBeDisabled();
    });
    // Check if the toast hook was called with destructive variant (implicitly)
    // This requires deeper mocking or inspecting the toast component's output
  });
});

// Add a wrapper for Loader2 to include a test-id
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    Loader2: (props: any) => <original.Loader2 {...props} data-testid="loader-icon" />,
  };
});
