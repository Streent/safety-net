
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form'; // Removed FormProvider, not needed directly here
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label can be removed if FormLabel from Form is used exclusively
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, CloudUpload, MapPin, Edit3, LocateFixed, ImageIcon, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removido, usando UiFormDescription
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const incidentFormSchema = z.object({
  incidentType: z.string().min(1, { message: 'Por favor, selecione um tipo de incidente.' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  geolocation: z.string().optional().describe('Coordenadas GPS (latitude, longitude). Espaço reservado para captura automática ou entrada manual.'),
  date: z.date({ required_error: 'A data do incidente é obrigatória.' }),
  media: z.any().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentFormSchema>; // Export type

interface IncidentFormProps {
  initialData?: Partial<IncidentFormValues>;
  onSubmitSuccess?: (data: IncidentFormValues) => void;
  isModalMode?: boolean; // New prop to control button rendering
}

export function IncidentForm({ initialData, onSubmitSuccess, isModalMode = false }: IncidentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    // Use useEffect to reset form when initialData changes or for new entries
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
    setMediaFiles([]); // Reset media files as well
  }, [initialData, form]);


  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
      form.setValue('media', event.target.files); // Store FileList in form
    } else {
      setMediaFiles([]);
      form.setValue('media', undefined);
    }
  };

  async function onSubmit(data: IncidentFormValues) {
    setIsLoading(true);
    console.log('Dados do Relatório de Incidente:', { ...data, mediaNames: mediaFiles.map(f => f.name) });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // No toast here, will be handled by parent component
    setIsLoading(false);
    // form.reset(); // Reset is now handled by useEffect based on initialData
    // setMediaFiles([]);
    if (onSubmitSuccess) onSubmitSuccess(data);
  }
  
  // Determine if it's an edit mode based on initialData having content
  const isEditMode = !!(initialData && initialData.description); // Check a field that would exist in edit mode

  return (
    // Removed Card wrapper if form is in a modal, let the modal provide the card-like structure
    <div className={cn(!isModalMode && "w-full max-w-2xl mx-auto shadow-xl rounded-lg border bg-card")}>
      {!isModalMode && (
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditMode ? 'Editar Relatório de Incidente' : 'Registrar Novo Incidente'}
          </CardTitle>
          <UiFormDescription>
            Forneça informações detalhadas sobre o incidente.
          </UiFormDescription>
        </CardHeader>
      )}
      <div className={cn(!isModalMode && "p-6")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading}>
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
                      disabled={isLoading}
                      data-ai-hint="detalhes da descrição do incidente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <Input placeholder="Ex: Armazém Seção B" {...field} value={field.value || ''} disabled={isLoading} data-ai-hint="endereço da localização do incidente" />
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
                            disabled={isLoading}
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
                            date > new Date() || date < new Date("2000-01-01") || isLoading // Adjusted min date
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
                    <Input placeholder="Ex: -23.5505, -46.6333 (captura automática ou manual)" {...field} value={field.value || ''} disabled={isLoading} data-ai-hint="coordenadas latitude longitude" />
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
                  disabled={isLoading}
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

            {/* Submit button is now part of the form, not the modal footer if isModalMode is true */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {!isModalMode && ( // Only show Save Draft if not in modal mode, as modal has its own close
                <Button type="button" variant="outline" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Rascunho (Offline - Placeholder)
                </Button>
              )}
              <Button type="submit" disabled={isLoading || !form.formState.isDirty && isEditMode && !mediaFiles.length} className="min-w-[180px]">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    {isEditMode ? 'Salvando...' : 'Enviando...'}
                  </>
                ) : (
                  isEditMode ? 'Salvar Alterações' : 'Enviar Relatório'
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
