
// src/app/(app)/fleet/checklist/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Car, CheckCircle, CircleEllipsis, Construction, Droplets, FileText, ImagePlus, ListChecks, Save, Send, ShieldAlert, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChecklistItem { // For checkbox items
  id: string;
  label: string;
  checked: boolean;
  observation: string;
}

interface DocumentFile {
  id: string;
  file: File;
  previewUrl?: string; // For image previews if applicable
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  type: 'checkbox' | 'document_upload';
  items?: ChecklistItem[];
  uploadedDocuments?: DocumentFile[]; // Only for 'document_upload' type
  isCompleted?: boolean; // To track step completion for progress bar
}

const initialStepsData: ChecklistSection[] = [
  {
    id: 'exterior',
    title: 'Passo 1: Verificações Externas',
    icon: Car,
    type: 'checkbox',
    items: [
      { id: 'ext1', label: 'Luzes (faróis, setas, freio, ré)', checked: false, observation: '' },
      { id: 'ext2', label: 'Pneus (calibragem e estado geral)', checked: false, observation: '' },
      { id: 'ext3', label: 'Retrovisores (limpos e ajustados)', checked: false, observation: '' },
      { id: 'ext4', label: 'Lataria (avarias visíveis)', checked: false, observation: '' },
      { id: 'ext5', label: 'Placas (legíveis e fixadas)', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
  {
    id: 'interior',
    title: 'Passo 2: Verificações Internas',
    icon: ShieldAlert, // Using ShieldAlert for general interior safety checks
    type: 'checkbox',
    items: [
      { id: 'int1', label: 'Buzina funcionando', checked: false, observation: '' },
      { id: 'int2', label: 'Luzes do painel (indicadores OK)', checked: false, observation: '' },
      { id: 'int3', label: 'Cintos de segurança (todos)', checked: false, observation: '' },
      { id: 'int4', label: 'Nível de combustível', checked: false, observation: '' },
      { id: 'int5', label: 'Freio de estacionamento', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
  {
    id: 'documentos',
    title: 'Passo 3: Documentação e Itens Obrigatórios',
    icon: FileText,
    type: 'document_upload',
    uploadedDocuments: [],
    isCompleted: false,
    items: [ // Add a dummy item for consistency if needed for observation field, or handle observation differently for this step
        {id: 'doc_obs', label: 'Observações Gerais sobre Documentos/Itens', checked: false, observation: ''} // 'checked' is irrelevant here
    ]
  },
];


export default function VehicleChecklistWizardPage() {
  const { toast } = useToast();
  const [stepsData, setStepsData] = useState<ChecklistSection[]>(() =>
    JSON.parse(JSON.stringify(initialStepsData)) // Deep copy
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const activeStepId = stepsData[currentStepIndex]?.id;

  const updateStepCompletion = useCallback(() => {
    const newStepsData = stepsData.map((step, index) => {
      let completed = false;
      if (step.type === 'checkbox' && step.items) {
        completed = step.items.every(item => item.checked);
      } else if (step.type === 'document_upload') {
        completed = (step.uploadedDocuments?.length || 0) > 0;
      }
      return { ...step, isCompleted: completed };
    });
    setStepsData(newStepsData);
  }, [stepsData]);


  useEffect(() => {
    updateStepCompletion();
  }, [stepsData.flatMap(s => s.items?.map(i => i.checked) ?? []), stepsData.find(s => s.type === 'document_upload')?.uploadedDocuments?.length, updateStepCompletion]);


  useEffect(() => {
    const completedStepsCount = stepsData.filter(step => step.isCompleted).length;
    const newProgress = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
    setProgress(newProgress);
  }, [stepsData]);

  const totalSteps = stepsData.length;

  const handleCheckboxItemChange = (stepIndex: number, itemId: string, field: 'checked' | 'observation', value: string | boolean) => {
    setStepsData(prevData =>
      prevData.map((step, sIndex) =>
        sIndex === stepIndex && step.items
          ? {
              ...step,
              items: step.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : step
      )
    );
  };
  
  const handleDocumentObservationChange = (stepIndex: number, value: string) => {
     setStepsData(prevData =>
      prevData.map((step, sIndex) =>
        sIndex === stepIndex && step.type === 'document_upload' && step.items && step.items.length > 0
          ? {
              ...step,
              items: [{...step.items[0], observation: value}]
            }
          : step
      )
    );
  }


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && stepsData[currentStepIndex]?.type === 'document_upload') {
      const newFiles: DocumentFile[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}`, // Simple unique ID
        file: file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setStepsData(prevData =>
        prevData.map((step, index) =>
          index === currentStepIndex
            ? {
                ...step,
                uploadedDocuments: [...(step.uploadedDocuments || []), ...newFiles],
              }
            : step
        )
      );
    }
    if (documentFileInputRef.current) {
      documentFileInputRef.current.value = ""; // Reset file input
    }
  };

  const removeDocument = (stepIndex: number, documentId: string) => {
    setStepsData(prevData =>
      prevData.map((step, index) => {
        if (index === stepIndex && step.uploadedDocuments) {
          const docToRemove = step.uploadedDocuments.find(doc => doc.id === documentId);
          if (docToRemove?.previewUrl) {
            URL.revokeObjectURL(docToRemove.previewUrl);
          }
          return {
            ...step,
            uploadedDocuments: step.uploadedDocuments.filter(doc => doc.id !== documentId),
          };
        }
        return step;
      })
    );
  };
  
  // Cleanup Object URLs on component unmount
  useEffect(() => {
    return () => {
      stepsData.forEach(section => {
        if (section.type === 'document_upload' && section.uploadedDocuments) {
          section.uploadedDocuments.forEach(doc => {
            if (doc.previewUrl) {
              URL.revokeObjectURL(doc.previewUrl);
            }
          });
        }
      });
    };
  }, [stepsData]);


  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleSaveDraft = () => {
    toast({
      title: 'Rascunho Salvo!',
      description: 'Seu progresso no checklist foi salvo localmente como rascunho. (Funcionalidade de persistência a ser implementada).',
    });
  };

  const handleSubmitChecklist = () => {
    toast({
      title: 'Checklist Enviado com Sucesso!',
      description: 'O checklist do veículo foi enviado e registrado. (Funcionalidade de processamento a ser implementada).',
      action: <Button variant="outline" size="sm" onClick={() => { /* Confetti logic here or redirect */ }}><Sparkles className="mr-2 h-4 w-4 text-yellow-400"/>Ver Confirmação</Button>
    });
  };

  const currentStepIsCompleted = stepsData[currentStepIndex]?.isCompleted || false;

  return (
    <>
      <PageHeader
        title="Checklist de Veículo (Wizard)"
        description="Siga o passo a passo para completar a inspeção do veículo."
      />
      
      <input 
        type="file" 
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" 
        ref={documentFileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
        multiple
      />

      <Card className="mb-6 shadow-md">
        <CardHeader>
            <CardTitle>Progresso do Checklist: Passo {currentStepIndex + 1} de {totalSteps}</CardTitle>
            <CardDescription>{stepsData[currentStepIndex]?.title}</CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progress} className="w-full h-3" aria-label={`Progresso do checklist: ${progress}%`} />
            <p className="text-sm text-muted-foreground mt-2 text-center">{progress}% concluído ({stepsData.filter(s => s.isCompleted).length}/{totalSteps} passos)</p>
        </CardContent>
      </Card>

      <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-2" 
        value={activeStepId}
        onValueChange={(value) => {
            const newIndex = stepsData.findIndex(step => step.id === value);
            if (newIndex !== -1) setCurrentStepIndex(newIndex);
        }}
      >
        {stepsData.map((step, stepIndex) => (
            <AccordionItem key={step.id} value={step.id} className="border rounded-lg bg-card shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg text-base sm:text-lg">
                <div className="flex items-center flex-1">
                  <step.icon className={cn("mr-3 h-5 w-5 text-primary", step.isCompleted && "text-green-500")} />
                  <span className={cn(step.isCompleted && "line-through text-muted-foreground")}>{step.title}</span>
                  {step.isCompleted && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 border-t">
                {step.type === 'checkbox' && step.items && (
                  <div className="space-y-4">
                    {step.items.map(item => (
                      <div key={item.id} className="p-3 border rounded-md bg-background space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${step.id}-${item.id}-check`} className="text-sm font-medium flex-1">
                            {item.label}
                          </Label>
                          <Checkbox
                            id={`${step.id}-${item.id}-check`}
                            checked={item.checked}
                            onCheckedChange={checked => handleCheckboxItemChange(stepIndex, item.id, 'checked', !!checked)}
                            className="ml-4"
                          />
                        </div>
                        <Textarea
                          id={`${step.id}-${item.id}-obs`}
                          placeholder="Observações (opcional)"
                          value={item.observation}
                          onChange={e => handleCheckboxItemChange(stepIndex, item.id, 'observation', e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {step.type === 'document_upload' && (
                  <div className="space-y-4">
                    <Button 
                        variant="outline" 
                        onClick={() => documentFileInputRef.current?.click()}
                        className="w-full"
                    >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Anexar Documentos (CRLV, Seguro, etc.)
                    </Button>
                    {step.uploadedDocuments && step.uploadedDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Documentos Anexados:</h4>
                        <ul className="space-y-2">
                          {step.uploadedDocuments.map(docFile => (
                            <li key={docFile.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                              <div className="flex items-center space-x-2 overflow-hidden">
                                {docFile.previewUrl ? (
                                    <Image src={docFile.previewUrl} alt={docFile.file.name} width={32} height={32} className="rounded object-cover h-8 w-8"/>
                                ) : (
                                    <FileText className="h-6 w-6 text-muted-foreground"/>
                                )}
                                <span className="text-xs truncate">{docFile.file.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeDocument(stepIndex, docFile.id)} className="h-7 w-7">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.items && step.items.length > 0 && ( // For general observations for this step
                         <Textarea
                          placeholder="Observações gerais sobre documentos/itens obrigatórios"
                          value={step.items[0].observation}
                          onChange={e => handleDocumentObservationChange(stepIndex, e.target.value)}
                          rows={3}
                          className="text-sm mt-4"
                        />
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button 
            variant="outline" 
            onClick={handlePreviousStep} 
            disabled={currentStepIndex === 0}
        >
          &larr; Voltar
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
            </Button>
            {currentStepIndex === totalSteps - 1 ? (
            <Button onClick={handleSubmitChecklist} disabled={progress < 100}>
                <Send className="mr-2 h-4 w-4" />
                Enviar Checklist
            </Button>
            ) : (
            <Button onClick={handleNextStep} disabled={!currentStepIsCompleted && stepsData[currentStepIndex]?.type === 'checkbox'}> 
            {/* For document step, allow next even if no docs, rely on overall progress for final submit */}
                Próximo Passo &rarr;
            </Button>
            )}
        </div>
      </div>
       <p className="text-xs text-muted-foreground text-center mt-4">
        Complete todos os passos para habilitar o envio do checklist.
      </p>
    </>
  );
}

    