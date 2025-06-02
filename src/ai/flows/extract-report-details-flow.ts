
'use server';
/**
 * @fileOverview An AI flow to extract structured details from an incident description and optional images.
 *
 * - extractReportDetails - A function that analyzes incident text and images to extract key information.
 * - ExtractReportDetailsInput - The input type for the extractReportDetails function.
 * - ExtractedReportDetailsOutput - The return type for the extractReportDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReportDetailsInputSchema = z.object({
  incidentDescription: z.string().describe('The detailed textual description of the incident.'),
  photoDataUris: z.array(z.string().url()).optional().describe(
    "Optional array of photos of the incident scene or related items, as data URIs. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractReportDetailsInput = z.infer<typeof ExtractReportDetailsInputSchema>;

const ExtractedReportDetailsOutputSchema = z.object({
  oQueAconteceu: z.string().describe('A detailed summary of what happened during the incident. This should be a narrative of the event.'),
  local: z.string().describe('The specific location where the incident occurred (e.g., "Warehouse Section B, near racking 3A", " корпоративный автомобиль по дороге к клиенту X").'),
  setor: z.string().describe('The department, area, or sector involved or where the incident happened (e.g., "Logistics", "Production Line 2", "Maintenance").'),
  causaProvavel: z.string().describe('The likely cause(s) or contributing factors that led to the incident (e.g., "Slippery floor due to oil spill", "Improper use of tool", "Lack of attention").'),
  medidasTomadas: z.string().describe('Immediate actions taken after the incident occurred (e.g., "First aid administered", "Area cordoned off", "Supervisor notified").'),
  recomendacao: z.string().describe('Suggestions for preventative measures or further actions to avoid recurrence or mitigate risks (e.g., "Clean spill immediately", "Provide refresher training on tool usage", "Install anti-slip mats").'),
});
export type ExtractedReportDetailsOutput = z.infer<typeof ExtractedReportDetailsOutputSchema>;

export async function extractReportDetails(input: ExtractReportDetailsInput): Promise<ExtractedReportDetailsOutput> {
  return extractReportDetailsFlow(input);
}

const extractDetailsPrompt = ai.definePrompt({
  name: 'extractReportDetailsPrompt',
  input: {schema: ExtractReportDetailsInputSchema},
  output: {schema: ExtractedReportDetailsOutputSchema},
  prompt: `Você é um especialista em análise de incidentes de segurança. Sua tarefa é extrair informações estruturadas de uma descrição de incidente e, opcionalmente, de imagens fornecidas. Analise cuidadosamente todos os detalhes.

Descrição do Incidente:
{{{incidentDescription}}}

{{#if photoDataUris}}
Imagens Fornecidas:
{{#each photoDataUris}}
- {{media url=this}}
{{/each}}
{{/if}}

Com base na descrição e nas imagens (se houver), preencha os seguintes campos da forma mais completa e precisa possível:

- O que aconteceu: (Resumo detalhado do evento. Seja claro e objetivo.)
- Local: (Localização específica do incidente. Ex: "Armazém B, Corredor 3", "Escritório Administrativo, Sala 201", "Pátio Externo Leste")
- Setor: (Departamento ou área envolvida. Ex: "Logística", "Manutenção", "Produção Linha A")
- Causa Provável: (Fatores que contribuíram para o incidente. Ex: "Piso escorregadio devido a derramamento de óleo", "Uso inadequado de ferramenta", "Falta de sinalização")
- Medidas Tomadas: (Ações imediatas realizadas após o incidente. Ex: "Primeiros socorros aplicados", "Área isolada", "Supervisor notificado")
- Recomendação: (Sugestões para prevenção ou ações futuras. Ex: "Limpar derramamento imediatamente", "Treinamento de reciclagem sobre uso de ferramentas", "Instalar tapetes antiderrapantes")

Responda APENAS com os campos solicitados, cada um em uma nova linha, seguindo o formato "Campo: Valor".
Se alguma informação não puder ser extraída com clareza, indique "Não identificado" ou "Não aplicável" para o respectivo campo.
`,
});

const extractReportDetailsFlow = ai.defineFlow(
  {
    name: 'extractReportDetailsFlow',
    inputSchema: ExtractReportDetailsInputSchema,
    outputSchema: ExtractedReportDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await extractDetailsPrompt(input);
    // Output will already be structured by Genkit if the model respects the output schema instructions
    // and the output schema descriptions.
    return output!;
  }
);

