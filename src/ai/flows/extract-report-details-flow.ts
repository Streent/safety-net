
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
  incidentDescription: z.string().describe('The detailed textual description of the incident or inspection findings.'),
  photoDataUris: z.array(z.string().url()).optional().describe(
    "Optional array of photos of the incident scene, inspection items, or related documents, as data URIs. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractReportDetailsInput = z.infer<typeof ExtractReportDetailsInputSchema>;

const ExtractedReportDetailsOutputSchema = z.object({
  oQueAconteceu: z.string().describe('Um resumo detalhado do que aconteceu durante o incidente ou dos principais achados da inspeção/auditoria. Se for uma inspeção, foque nos resultados e observações chave.'),
  local: z.string().describe('O local específico onde o incidente ocorreu ou a inspeção/auditoria foi realizada (e.g., "Setor de Montagem, Linha 2", "Escritório Administrativo, Sala da Diretoria").'),
  setor: z.string().optional().describe('O departamento, área ou setor envolvido ou onde o incidente aconteceu/foi inspecionado (e.g., "Logística", "Produção Linha 2", "Manutenção", "TI"). Se for uma inspeção, este é o setor inspecionado.'),
  causaProvavel: z.string().optional().describe('A causa provável do incidente ou a causa raiz das não conformidades identificadas (e.g., "Piso escorregadio devido a derramamento de óleo", "Falha no procedimento X", "Falta de treinamento adequado").'),
  medidasTomadas: z.string().optional().describe('Ações imediatas tomadas após o incidente ou durante/após a inspeção para mitigar riscos ou corrigir problemas (e.g., "Primeiros socorros aplicados", "Área isolada", "Equipamento interditado", "Plano de ação iniciado").'),
  recomendacao: z.string().optional().describe('Sugestões para medidas preventivas/corretivas ou ações futuras para evitar recorrência, mitigar riscos ou melhorar processos (e.g., "Limpar derramamento imediatamente e sinalizar", "Revisar procedimento X", "Fornecer treinamento de reciclagem sobre Y", "Implementar verificação Z").'),
  // Campos adicionados para detalhes de inspeção
  possivelTipoInspecaoSugerido: z.string().optional().describe('Se o texto sugerir um tipo de inspeção (ex: "inspeção de rotina", "auditoria de segurança"), indique aqui.'),
  principaisNaoConformidadesSugeridas: z.string().optional().describe('Um resumo das principais não conformidades ou desvios encontrados, se for uma inspeção ou auditoria.'),
});
export type ExtractedReportDetailsOutput = z.infer<typeof ExtractedReportDetailsOutputSchema>;

export async function extractReportDetails(input: ExtractReportDetailsInput): Promise<ExtractedReportDetailsOutput> {
  return extractReportDetailsFlow(input);
}

const extractDetailsPrompt = ai.definePrompt({
  name: 'extractReportDetailsPrompt',
  input: {schema: ExtractReportDetailsInputSchema},
  output: {schema: ExtractedReportDetailsOutputSchema},
  prompt: `Você é um especialista em análise de incidentes de segurança e relatórios de inspeção. Sua tarefa é extrair informações estruturadas de uma descrição textual e, opcionalmente, de imagens fornecidas. Analise cuidadosamente todos os detalhes.

Se o texto parecer um **relatório de inspeção ou auditoria**, foque em extrair:
- **O Que Aconteceu / Achados Principais:** Um resumo dos resultados chave da inspeção.
- **Local da Inspeção:** Onde a inspeção ocorreu.
- **Setor Inspecionado:** O departamento ou área específica que foi inspecionada.
- **Principais Não Conformidades:** Quais foram os principais problemas ou desvios encontrados.
- **Recomendação:** Sugestões de melhoria ou correção.
- **Possível Tipo de Inspeção:** Se o texto indicar (ex: "inspeção de rotina", "auditoria de segurança").

Se o texto parecer um **relatório de incidente** (quase acidente, primeiros socorros, etc.), foque em extrair:
- **O Que Aconteceu:** Narrativa do evento.
- **Local do Incidente:** Onde ocorreu.
- **Setor Envolvido:** Qual departamento/área.
- **Causa Provável:** O que levou ao incidente.
- **Medidas Tomadas:** Ações imediatas.
- **Recomendação:** Prevenção futura.

Descrição Fornecida:
{{{incidentDescription}}}

{{#if photoDataUris}}
Imagens Fornecidas (Analise-as para contexto adicional, identificação de objetos, condições do local, etc.):
{{#each photoDataUris}}
- {{media url=this}}
{{/each}}
{{/if}}

Com base na descrição e nas imagens (se houver), preencha os seguintes campos da forma mais completa e precisa possível.
Para campos opcionais, se a informação não estiver clara ou não for aplicável ao tipo de relato, responda com "Não identificado" ou "Não aplicável".

Responda APENAS com os campos solicitados, cada um em uma nova linha, seguindo o formato "NomeDoCampoEmCamelCase: Valor".
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
    return output!;
  }
);
