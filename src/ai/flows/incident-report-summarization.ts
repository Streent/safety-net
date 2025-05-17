'use server';

/**
 * @fileOverview Summarizes incident reports using AI to quickly understand key details.
 *
 * - summarizeIncidentReport - A function that summarizes incident reports.
 * - SummarizeIncidentReportInput - The input type for the summarizeIncidentReport function.
 * - SummarizeIncidentReportOutput - The return type for the summarizeIncidentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentReportInputSchema = z.object({
  reportText: z.string().describe('The full text of the incident report.'),
});

export type SummarizeIncidentReportInput = z.infer<
  typeof SummarizeIncidentReportInputSchema
>;

const SummarizeIncidentReportOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incident report.'),
});

export type SummarizeIncidentReportOutput = z.infer<
  typeof SummarizeIncidentReportOutputSchema
>;

export async function summarizeIncidentReport(
  input: SummarizeIncidentReportInput
): Promise<SummarizeIncidentReportOutput> {
  return summarizeIncidentReportFlow(input);
}

const summarizeIncidentReportPrompt = ai.definePrompt({
  name: 'summarizeIncidentReportPrompt',
  input: {schema: SummarizeIncidentReportInputSchema},
  output: {schema: SummarizeIncidentReportOutputSchema},
  prompt: `You are an expert safety inspector. Please summarize the following incident report, highlighting the key details and potential safety concerns:\n\n{{{reportText}}}`,
});

const summarizeIncidentReportFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentReportFlow',
    inputSchema: SummarizeIncidentReportInputSchema,
    outputSchema: SummarizeIncidentReportOutputSchema,
  },
  async input => {
    const {output} = await summarizeIncidentReportPrompt(input);
    return output!;
  }
);
