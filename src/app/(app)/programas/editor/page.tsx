
// src/app/(app)/programas/editor/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { CalendarIcon, TextCursorInput, UploadCloud, ListChecks, Save, Send, Loader2, PlusCircle, Trash2, GripVertical, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const programDetailsSchema = z.object({
  tituloPrograma: z.string().min(5, { message: "O título do programa deve ter pelo menos 5 caracteres." }),
  codigoPrograma: z.string().min(3, { message: "O código deve ter pelo menos 3 caracteres." }),
  dataEmissao: z.date({ required_error: "A data de emissão é obrigatória." }),
  responsavelTecnico: z.string().min(3, { message: "O responsável técnico deve ter pelo menos 3 caracteres." }),
});

type ProgramDetailsFormValues = z.infer<typeof programDetailsSchema>;

interface ProgramSection {
  id: string;
  title: string;
  content: string;
}

export default function ProgramEditorPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>('intro'); // Start with first section open

  const [programSections, setProgramSections] = useState<ProgramSection[]>([
    { id: 'intro', title: 'Introdução', content: '' },
    { id: 'obj', title: 'Objetivos', content: '' },
    { id: 'resp', title: 'Responsabilidades', content: '' },
  ]);

  const formDetails = useForm<ProgramDetailsFormValues>({
    resolver: zodResolver(programDetailsSchema),
    defaultValues: {
      tituloPrograma: '',
      codigoPrograma: '',
      dataEmissao: new Date(),
      responsavelTecnico: '',
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDetailsSubmit = async (data: ProgramDetailsFormValues) => {
    setIsSubmitting(true);
    console.log('Detalhes Gerais:', data);
    console.log('Seções do Programa:', programSections);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Programa Publicado (Simulado)",
      description: "Os detalhes gerais e as seções do programa foram 'publicados'.",
      className: "bg-green-500 text-white dark:bg-green-700",
    });
    setIsSubmitting(false);
  };

  const handleSaveDraft = () => {
    const detailsData = formDetails.getValues();
    console.log('Salvando Rascunho - Detalhes:', detailsData);
    console.log('Salvando Rascunho - Seções:', programSections);
    toast({
      title: "Rascunho Salvo (Simulado)",
      description: "O progresso do programa foi salvo localmente.",
    });
  };

  const handleAddSection = () => {
    const newSectionTitle = prompt("Digite o título da nova seção:");
    if (newSectionTitle && newSectionTitle.trim() !== "") {
      const newSection: ProgramSection = {
        id: `section-${Date.now()}`,
        title: newSectionTitle.trim(),
        content: '',
      };
      setProgramSections(prevSections => [...prevSections, newSection]);
      setActiveAccordionItem(newSection.id);
    } else if (newSectionTitle !== null) {
      toast({
        variant: 'destructive',
        title: 'Título Inválido',
        description: 'O título da seção não pode estar vazio.',
      });
    }
  };

  const handleSectionContentChange = (sectionId: string, newContent: string) => {
    setProgramSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
  };

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir a seção "${sectionTitle}"?`)) {
      setProgramSections(prevSections => prevSections.filter(section => section.id !== sectionId));
      toast({
        title: 'Seção Excluída',
        description: `A seção "${sectionTitle}" foi removida.`,
        variant: 'destructive'
      });
    }
  };

  const formFieldWrapperClass = "opacity-0 translate-y-2 transition-all duration-500";
  const formFieldMountedClass = isMounted ? "opacity-100 translate-y-0" : "";

  return (
    <>
      <PageHeader
        title="Editor de Programa de SST"
        description="Crie ou edite programas de segurança, adicione seções, anexos e checklists."
      />
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-7 w-7 text-primary" />
              Detalhes Gerais do Programa
            </CardTitle>
            <CardDescription>
              Informações básicas e identificação do programa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...formDetails}>
              <form onSubmit={formDetails.handleSubmit(handleDetailsSubmit)} className="space-y-6">
                <div className={cn(formFieldWrapperClass, formFieldMountedClass)} style={{ transitionDelay: `${0 * 100}ms` }}>
                  <FormField
                    control={formDetails.control}
                    name="tituloPrograma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Programa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Programa de Gerenciamento de Riscos - Unidade X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className={cn(formFieldWrapperClass, formFieldMountedClass)} style={{ transitionDelay: `${1 * 100}ms` }}>
                  <FormField
                    control={formDetails.control}
                    name="codigoPrograma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Programa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PGR-001-2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={cn(formFieldWrapperClass, formFieldMountedClass)} style={{ transitionDelay: `${2 * 100}ms` }}>
                    <FormField
                      control={formDetails.control}
                      name="dataEmissao"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Emissão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className={cn(formFieldWrapperClass, formFieldMountedClass)} style={{ transitionDelay: `${3 * 100}ms` }}>
                    <FormField
                      control={formDetails.control}
                      name="responsavelTecnico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável Técnico</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do técnico responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TextCursorInput className="mr-3 h-7 w-7 text-primary" />
              Editor de Seções do Programa
            </CardTitle>
            <CardDescription>
              Adicione, edite e organize as seções do seu programa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programSections.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-2"
                value={activeAccordionItem}
                onValueChange={setActiveAccordionItem}
              >
                {programSections.map((section, index) => (
                  <AccordionItem key={section.id} value={section.id} className="border rounded-lg bg-card shadow-sm data-[state=open]:bg-muted/30">
                    <div className="flex items-center justify-between px-4 py-1 border-b data-[state=open]:border-b-0"> {/* Wrapper for trigger and delete button */}
                      <AccordionTrigger className="flex-1 py-2 hover:no-underline text-left"> {/* Ensure text aligns left */}
                        <div className="flex items-center">
                          <span className="mr-2 text-primary">{index + 1}.</span> {section.title}
                        </div>
                      </AccordionTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-2 shrink-0" // Added shrink-0
                        onClick={(e) => {
                          // e.stopPropagation(); // Not strictly needed if button is sibling of trigger's interactive part
                          handleDeleteSection(section.id, section.title);
                        }}
                        aria-label={`Excluir seção ${section.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <AccordionContent className="px-4 pt-2 pb-4">
                      <Textarea
                        placeholder={`Digite o conteúdo da seção "${section.title}" aqui... (Placeholder para editor rich text)`}
                        value={section.content}
                        onChange={(e) => handleSectionContentChange(section.id, e.target.value)}
                        rows={8}
                        className="text-sm w-full"
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma seção adicionada ainda. Clique em "Adicionar Nova Seção" para começar.</p>
            )}
            <Button onClick={handleAddSection} variant="outline" className="mt-4 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Nova Seção
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <UploadCloud className="mr-3 h-7 w-7 text-primary" />
              Anexos e Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">
                Uma área para upload e gerenciamento de arquivos anexos (PDFs, planilhas, imagens) relacionados ao programa será implementada aqui.
                Funcionalidades incluirão drag-and-drop, lista de anexos com visualização e remoção.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ListChecks className="mr-3 h-7 w-7 text-primary" />
              Checklists Integrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">
                Possibilidade de criar ou vincular checklists de auditoria específicos para este programa será implementada aqui.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button
            onClick={formDetails.handleSubmit(handleDetailsSubmit)}
            disabled={isSubmitting || (!formDetails.formState.isValid && formDetails.formState.isDirty)}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publicar Programa
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

    