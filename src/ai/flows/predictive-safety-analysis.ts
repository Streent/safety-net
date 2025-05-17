// PredictiveSafetyAnalysis flow analyzes incident reports to identify hazards and suggest preventative measures.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncidentReportSchema = z.object({
  reportText: z
    .string()
    .describe(
      'Full text of the incident report, with detailed descriptions of the event, environment, and people involved.'
    ),
});
export type IncidentReport = z.infer<typeof IncidentReportSchema>;

const HazardAnalysisSchema = z.object({
  hazardsIdentified: z
    .array(z.string())
    .describe('A list of potential hazards identified in the incident report.'),
  preventativeMeasures: z
    .array(z.string())
    .describe(
      'A list of preventative measures that should be implemented to reduce the likelihood of future incidents.'
    ),
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('An overall risk level assessment based on the incident.'),
  justification: z
    .string()
    .describe(
      'A detailed explanation supporting the identified hazards, suggested preventative measures, and assessed risk level.'
    ),
});
export type HazardAnalysis = z.infer<typeof HazardAnalysisSchema>;

export async function predictiveSafetyAnalysis(report: IncidentReport): Promise<HazardAnalysis> {
  return predictiveSafetyAnalysisFlow(report);
}

const predictiveSafetyAnalysisPrompt = ai.definePrompt({
  name: 'predictiveSafetyAnalysisPrompt',
  input: {schema: IncidentReportSchema},
  output: {schema: HazardAnalysisSchema},
  prompt: `You are a safety expert tasked with analyzing incident reports to identify potential hazards and suggest preventative measures.

  Analyze the following incident report and extract key information to identify potential hazards, suggest preventative measures, assess the risk level (low, medium, or high), and provide a justification for your analysis.

  Incident Report:
  {{reportText}}
  `,
});

const predictiveSafetyAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveSafetyAnalysisFlow',
    inputSchema: IncidentReportSchema,
    outputSchema: HazardAnalysisSchema,
  },
  async report => {
    const {output} = await predictiveSafetyAnalysisPrompt(report);
    return output!;
  }
);
