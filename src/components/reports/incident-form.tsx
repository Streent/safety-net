
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, CloudUpload, MapPin, Edit3, LocateFixed, ImageIcon, Loader2, Save, Bot, Brain, AlertTriangleIcon } from 'lucide-react'; // Added Bot, Brain, AlertTriangleIcon
import { CardHeader, CardTitle, CardContent as UiCardContent, CardFooter } from '@/components/ui/card'; // Added CardContent, CardFooter
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { extractReportDetails, type ExtractedReportDetailsOutput, type ExtractReportDetailsInput } from '@/ai/flows/extract-report-details-flow'; // Import the new flow
import { Separator } from '../ui/separator';

const incidentFormSchema = z.object({
  incidentType: z.string().min(1, { message: 'Por favor, selecione um tipo de incidente.' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  geolocation: z.string().optional().describe('Coordenadas GPS (latitude, longitude). Espaço reservado para captura automática ou entrada manual.'),
  date: z.date({ required_error: 'A data do incidente é obrigatória.' }),
  media: z.any().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  initialData?: Partial<IncidentFormValues>;
  onSubmitSuccess?: (data: IncidentFormValues) => void;
  isModalMode?: boolean;
}

export function IncidentForm({ initialData, onSubmitSuccess, isModalMode = false }: IncidentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<ExtractedReportDetailsOutput | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);


  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
  });

  useEffect(() => {
    form.reset(initialData || {
      incidentType: '',
      description: '',
      location: '',
      geolocation: '',
      date: new Date(),
      media: undefined,
    });
    setMediaFiles([]);
    setAiAnalysisResults(null);
    setAiAnalysisError(null);
  }, [initialData, form]);


  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
      form.setValue('media', event.target.files);
    } else {
      setMediaFiles([]);
      form.setValue('media', undefined);
    }
  };

  async function onSubmit(data: IncidentFormValues) {
    setIsLoading(true);
    console.log('Dados do Relatório de Incidente:', { ...data, mediaNames: mediaFiles.map(f => f.name) });

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isModalMode && !initialData?.description) { // Only show generic success if it's a new report in modal
        toast({
            title: "Relatório Enviado",
            description: "Seu relatório de incidente foi registrado com sucesso."
        });
    }
    
    setIsLoading(false);
    if (onSubmitSuccess) onSubmitSuccess(data);
  }
  
  const isEditMode = !!(initialData && initialData.description);

  const handleAiAnalysis = async () => {
    const description = form.getValues('description');
    if (!description?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Descrição Necessária',
        description: 'Por favor, insira uma descrição do incidente para a análise com IA.',
      });
      return;
    }

    setIsAiAnalyzing(true);
    setAiAnalysisResults(null);
    setAiAnalysisError(null);

    const photoDataUris: string[] = [];
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        if (file.type.startsWith('image/')) {
          try {
            const dataUri = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
              reader.readAsDataURL(file);
            });
            photoDataUris.push(dataUri);
          } catch (error) {
            console.error("Error converting file to data URI:", error);
            toast({ variant: "destructive", title: "Erro ao processar imagem", description: `Não foi possível ler o arquivo ${file.name}.`});
          }
        }
      }
    }
    
    const input: ExtractReportDetailsInput = {
      incidentDescription: description,
      ...(photoDataUris.length > 0 && { photoDataUris }),
    };

    try {
      const results = await extractReportDetails(input);
      setAiAnalysisResults(results);
      
      if (results.oQueAconteceu) {
        form.setValue('description', results.oQueAconteceu, { shouldValidate: true, shouldDirty: true });
      }
      if (results.local) {
        form.setValue('location', results.local, { shouldValidate: true, shouldDirty: true });
      }

      toast({
        title: 'Análise da IA Concluída',
        description: 'Campos de descrição e localização atualizados. Verifique os detalhes adicionais sugeridos.',
      });

    } catch (error) {
      console.error("AI Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido durante a análise.";
      setAiAnalysisError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Falha na Análise com IA',
        description: errorMessage,
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };


  return (
    <div className={cn(!isModalMode && "w-full max-w-2xl mx-auto shadow-xl rounded-lg border bg-card")}>
      {!isModalMode && (
        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-2xl">
            {isEditMode ? 'Editar Relatório de Incidente' : 'Registrar Novo Incidente'}
          </CardTitle>
          <UiFormDescription className="!mt-1">
            Forneça informações detalhadas sobre o incidente.
          </UiFormDescription>
        </CardHeader>
      )}
      <div className={cn(!isModalMode ? "p-6 pt-4" : "p-0")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading || isAiAnalyzing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de incidente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Quase Acidente">Quase Acidente</SelectItem>
                      <SelectItem value="Observação de Segurança">Observação de Segurança</SelectItem>
                      <SelectItem value="Primeiros Socorros">Primeiros Socorros</SelectItem>
                      <SelectItem value="Dano à Propriedade">Dano à Propriedade</SelectItem>
                      <SelectItem value="Ambiental">Ambiental</SelectItem>
                      <SelectItem value="Inspeção">Inspeção</SelectItem>
                      <SelectItem value="Auditoria">Auditoria</SelectItem>
                      <SelectItem value="DDS">DDS (Diálogo Diário de Segurança)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o incidente em detalhes..."
                      rows={5}
                      {...field}
                      disabled={isLoading || isAiAnalyzing}
                      data-ai-hint="detalhes da descrição do incidente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" onClick={handleAiAnalysis} disabled={isAiAnalyzing || isLoading} className="w-full sm:w-auto">
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analisar Descrição com IA
                </>
              )}
            </Button>

            {aiAnalysisError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Erro na Análise</AlertTitle>
                <AlertDescription>{aiAnalysisError}</AlertDescription>
              </Alert>
            )}

            {aiAnalysisResults && !aiAnalysisError && (
              <div className="space-y-3 p-4 border rounded-md bg-muted/50 mt-4">
                <h3 className="text-md font-semibold text-primary flex items-center">
                  <Bot className="mr-2 h-5 w-5"/>
                  Sugestões Adicionais da IA
                </h3>
                {(aiAnalysisResults.setor && aiAnalysisResults.setor.toLowerCase() !== "não identificado" && aiAnalysisResults.setor.toLowerCase() !== "não aplicável") && <p className="text-sm"><strong>Setor Sugerido:</strong> {aiAnalysisResults.setor}</p>}
                {(aiAnalysisResults.causaProvavel && aiAnalysisResults.causaProvavel.toLowerCase() !== "não identificado" && aiAnalysisResults.causaProvavel.toLowerCase() !== "não aplicável") && <p className="text-sm"><strong>Causa Provável Sugerida:</strong> {aiAnalysisResults.causaProvavel}</p>}
                {(aiAnalysisResults.medidasTomadas && aiAnalysisResults.medidasTomadas.toLowerCase() !== "não identificado" && aiAnalysisResults.medidasTomadas.toLowerCase() !== "não aplicável") && <p className="text-sm"><strong>Medidas Tomadas Sugeridas:</strong> {aiAnalysisResults.medidasTomadas}</p>}
                {(aiAnalysisResults.recomendacao && aiAnalysisResults.recomendacao.toLowerCase() !== "não identificado" && aiAnalysisResults.recomendacao.toLowerCase() !== "não aplicável") && <p className="text-sm"><strong>Recomendação Sugerida:</strong> {aiAnalysisResults.recomendacao}</p>}
                <p className="text-xs text-muted-foreground italic">Revise e incorpore estas sugestões ao relatório conforme necessário.</p>
              </div>
            )}
             <Separator className={cn((!aiAnalysisResults && !aiAnalysisError) && "hidden", "my-4")} />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      Localização
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Armazém Seção B" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} data-ai-hint="endereço da localização do incidente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Data do Incidente</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading || isAiAnalyzing}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01") || isLoading || isAiAnalyzing
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="geolocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <LocateFixed className="h-4 w-4 mr-2 text-muted-foreground" />
                    Geolocalização (Lat, Long)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: -23.5505, -46.6333 (captura automática ou manual)" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} data-ai-hint="coordenadas latitude longitude" />
                  </FormControl>
                  <UiFormDescription className="text-xs">
                    Coordenadas GPS. Tentará capturar automaticamente se a permissão for concedida.
                  </UiFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="flex items-center">
                <CloudUpload className="h-4 w-4 mr-2 text-muted-foreground" />
                Upload de Mídia (Fotos, Vídeos, Áudio)
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  disabled={isLoading || isAiAnalyzing}
                  onChange={handleMediaChange}
                  data-ai-hint="upload fotos videos audio"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </FormControl>
              {mediaFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Arquivos Selecionados ({mediaFiles.length}):</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground max-h-24 overflow-y-auto">
                    {mediaFiles.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
                  </ul>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1.5" />Pré-visualizações de imagem/vídeo aparecerão aqui.
                  </div>
                </div>
              )}
              <UiFormDescription className="text-xs">
                Anexe arquivos de mídia relevantes. (Funcionalidade para pré-visualização e processamento de upload a ser implementada).
              </UiFormDescription>
            </FormItem>

            <FormItem>
              <FormLabel className="flex items-center">
                <Edit3 className="h-4 w-4 mr-2 text-muted-foreground" />
                Assinatura
              </FormLabel>
              <FormControl>
                <div className="w-full h-32 border border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/50">
                  Área de Assinatura (Espaço para assinatura por toque/webcam)
                </div>
              </FormControl>
            </FormItem>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {!isModalMode && ( 
                <Button type="button" variant="outline" disabled={isLoading || isAiAnalyzing}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Rascunho (Offline - Placeholder)
                </Button>
              )}
              <Button type="submit" disabled={isLoading || isAiAnalyzing || (!form.formState.isDirty && isEditMode && !mediaFiles.length)} className="min-w-[180px]">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    {isEditMode ? 'Salvando...' : (isModalMode ? 'Registrando...' : 'Enviar Relatório')}
                  </>
                ) : (
                  isEditMode ? 'Salvar Alterações' : (isModalMode ? 'Registrar Incidente' : 'Enviar Relatório')
                )}
              </Button>
            </div>
            {!isModalMode && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                Opções de exportação (PDF, PPTX) estarão disponíveis após o envio. (Placeholder para integração com Firestore Functions)
              </p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
