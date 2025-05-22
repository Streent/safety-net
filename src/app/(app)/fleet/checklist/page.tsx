
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
import { Car, CheckCircle, CircleEllipsis, Construction, Droplets, FileText, ImagePlus, ListChecks, Save, Send, ShieldAlert, Sparkles, Trash2, UploadCloud, X, GripVertical, Users, Package, AlertTriangle, Fuel, Wrench, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  observation: string;
  requiresPhoto?: boolean;
  photo?: File | null;
  photoPreview?: string | null;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
  isCompleted?: boolean;
}

const initialStepsData: ChecklistSection[] = [
  {
    id: 'documentacao',
    title: 'Documentação do Veículo',
    icon: FileText,
    items: [
      { id: 'doc1', label: 'CRLV atualizado e no veículo', checked: false, observation: '', requiresPhoto: true },
      { id: 'doc2', label: 'Comprovante de Seguro Obrigatório (DPVAT)', checked: false, observation: '' },
      { id: 'doc3', label: 'Manual do proprietário', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
  {
    id: 'exterior',
    title: 'Verificações Externas',
    icon: Car,
    items: [
      { id: 'ext1', label: 'Faróis (alto, baixo, DRL)', checked: false, observation: '' },
      { id: 'ext2', label: 'Lanternas (traseira, freio, ré)', checked: false, observation: '' },
      { id: 'ext3', label: 'Setas e Pisca-alerta', checked: false, observation: '' },
      { id: 'ext4', label: 'Pneus (calibragem, desgaste, avarias)', checked: false, observation: '', requiresPhoto: true },
      { id: 'ext5', label: 'Estepe, macaco e chave de roda', checked: false, observation: '' },
      { id: 'ext6', label: 'Retrovisores (limpos, ajustados, sem trincas)', checked: false, observation: '' },
      { id: 'ext7', label: 'Lataria e Vidros (avarias, trincas)', checked: false, observation: '', requiresPhoto: true },
      { id: 'ext8', label: 'Placas (legíveis e fixadas)', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
  {
    id: 'interior',
    title: 'Verificações Internas e Funcionamento',
    icon: ShieldAlert,
    items: [
      { id: 'int1', label: 'Buzina funcionando', checked: false, observation: '' },
      { id: 'int2', label: 'Luzes do painel (OK, sem alertas)', checked: false, observation: '' },
      { id: 'int3', label: 'Cintos de segurança (todos os assentos)', checked: false, observation: '' },
      { id: 'int4', label: 'Nível de combustível (adequado para o trajeto)', checked: false, observation: '' },
      { id: 'int5', label: 'Freio de estacionamento (funcionando)', checked: false, observation: '' },
      { id: 'int6', label: 'Ar condicionado / Ventilação', checked: false, observation: '' },
      { id: 'int7', label: 'Limpadores de para-brisa e água', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
  {
    id: 'fluidos_mecanica',
    title: 'Níveis de Fluidos e Mecânica Básica',
    icon: Droplets,
    items: [
      { id: 'flu1', label: 'Nível do óleo do motor', checked: false, observation: '' },
      { id: 'flu2', label: 'Nível do líquido de arrefecimento', checked: false, observation: '' },
      { id: 'flu3', label: 'Nível do fluido de freio', checked: false, observation: '' },
      { id: 'flu4', label: 'Vazamentos visíveis sob o veículo', checked: false, observation: '', requiresPhoto: true },
    ],
    isCompleted: false,
  },
  {
    id: 'seguranca_carga',
    title: 'Itens de Segurança e Carga',
    icon: Package,
    items: [
      { id: 'seg1', label: 'Triângulo de sinalização', checked: false, observation: '' },
      { id: 'seg2', label: 'Extintor de incêndio (válido e carregado)', checked: false, observation: '', requiresPhoto: true },
      { id: 'seg3', label: 'Kit de primeiros socorros (se aplicável)', checked: false, observation: '' },
      { id: 'seg4', label: 'Condições de amarração de carga (se aplicável)', checked: false, observation: '' },
    ],
    isCompleted: false,
  },
];


export default function VehicleChecklistWizardPage() {
  const { toast } = useToast();
  const [stepsData, setStepsData] = useState<ChecklistSection[]>(() =>
    JSON.parse(JSON.stringify(initialStepsData)) // Deep copy
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentItemTarget, setCurrentItemTarget] = useState<{ stepIndex: number; itemId: string } | null>(null);

  const totalSteps = stepsData.length;
  const activeStepId = stepsData[currentStepIndex]?.id;

  const isSectionCompleted = useCallback((section: ChecklistSection) => {
    return section.items.every(item => item.checked && (!item.requiresPhoto || (item.requiresPhoto && item.photo)));
  }, []);

  const updateStepCompletionStatus = useCallback(() => {
    setStepsData(prevData =>
      prevData.map(step => ({
        ...step,
        isCompleted: isSectionCompleted(step),
      }))
    );
  }, [isSectionCompleted]);

  const calculateOverallProgress = useCallback(() => {
    const totalItems = stepsData.reduce((acc, step) => acc + step.items.length, 0);
    if (totalItems === 0) return 0;
    const completedItems = stepsData.reduce((acc, step) => 
      acc + step.items.filter(item => item.checked && (!item.requiresPhoto || (item.requiresPhoto && item.photo))).length, 
    0);
    return Math.round((completedItems / totalItems) * 100);
  }, [stepsData]);

  useEffect(() => {
    updateStepCompletionStatus();
    setProgress(calculateOverallProgress());
  }, [stepsData, updateStepCompletionStatus, calculateOverallProgress]);

  const handleCheckboxItemChange = (stepIndex: number, itemId: string, field: 'checked' | 'observation', value: string | boolean) => {
    setStepsData(prevData =>
      prevData.map((step, sIndex) =>
        sIndex === stepIndex
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

  const handlePhotoAttachment = (stepIndex: number, itemId: string) => {
    setCurrentItemTarget({ stepIndex, itemId });
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentItemTarget) {
      const { stepIndex, itemId } = currentItemTarget;
      
      setStepsData(prevData =>
        prevData.map((step, sIndex) => {
          if (sIndex === stepIndex) {
            return {
              ...step,
              items: step.items.map(item => {
                if (item.id === itemId) {
                  // Revoke previous object URL if exists
                  if (item.photoPreview) {
                    URL.revokeObjectURL(item.photoPreview);
                  }
                  return { 
                    ...item, 
                    photo: file, 
                    photoPreview: URL.createObjectURL(file) 
                  };
                }
                return item;
              }),
            };
          }
          return step;
        })
      );
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setCurrentItemTarget(null);
  };

  const removePhoto = (stepIndex: number, itemId: string) => {
    setStepsData(prevData =>
      prevData.map((step, sIndex) => {
        if (sIndex === stepIndex) {
          return {
            ...step,
            items: step.items.map(item => {
              if (item.id === itemId) {
                if (item.photoPreview) {
                  URL.revokeObjectURL(item.photoPreview);
                }
                return { ...item, photo: null, photoPreview: null };
              }
              return item;
            }),
          };
        }
        return step;
      })
    );
  };
  
  useEffect(() => {
    return () => {
      stepsData.forEach(section => {
        section.items.forEach(item => {
          if (item.photoPreview) {
            URL.revokeObjectURL(item.photoPreview);
          }
        });
      });
    };
  }, [stepsData]);

  const handleNextStep = () => {
    const currentSection = stepsData[currentStepIndex];
    if (isSectionCompleted(currentSection)) {
      toast({
        title: `Passo ${currentStepIndex + 1} Concluído!`,
        description: `${currentSection.title} verificado com sucesso.`,
        className: "bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-700",
      });
    } else {
        // Optionally, provide feedback if step is not complete but user tries to proceed
        // For now, we allow proceeding, completion is for the final submit button
    }

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
      description: 'Seu progresso no checklist foi salvo localmente. (Funcionalidade de persistência a ser implementada).',
    });
  };

  const handleSubmitChecklist = () => {
    // TODO: Add actual submission logic (e.g., to Firestore)
    // For now, just a toast and maybe reset
    toast({
      title: 'Checklist Enviado com Sucesso!',
      description: 'O checklist do veículo foi enviado e registrado. (Funcionalidade de processamento a ser implementada).',
      action: <Button variant="outline" size="sm" onClick={() => { /* Confetti logic here or redirect */ }}><Sparkles className="mr-2 h-4 w-4 text-yellow-400"/>Ver Confirmação</Button>
    });
    // Optionally reset state:
    // setStepsData(JSON.parse(JSON.stringify(initialStepsData)));
    // setCurrentStepIndex(0);
  };

  return (
    <>
      <PageHeader
        title="Preencher Checklist de Veículo"
        description="Siga o assistente passo a passo para completar a inspeção do veículo."
      />
      
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
      />

      <Card className="mb-6 shadow-md">
        <CardHeader>
            <CardTitle>Progresso do Checklist: Passo {currentStepIndex + 1} de {totalSteps}</CardTitle>
            <CardDescription>{stepsData[currentStepIndex]?.title}</CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progress} className="w-full h-3" aria-label={`Progresso do checklist: ${progress}%`} />
            <p className="text-sm text-muted-foreground mt-2 text-center">{progress}% concluído ({stepsData.reduce((acc, step) => acc + step.items.filter(i => i.checked && (!i.requiresPhoto || i.photo )).length, 0)}/{stepsData.reduce((acc, step) => acc + step.items.length, 0)} itens)</p>
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
        {stepsData.map((step, stepIndex) => {
          const sectionIsComplete = isSectionCompleted(step);
          return (
            <AccordionItem key={step.id} value={step.id} className="border rounded-lg bg-card shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg text-base sm:text-lg">
                <div className="flex items-center flex-1">
                  <step.icon className={cn("mr-3 h-5 w-5 text-primary", sectionIsComplete && "text-green-500")} />
                  <span className={cn(sectionIsComplete && "line-through text-muted-foreground")}>{step.title}</span>
                  {sectionIsComplete && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 border-t">
                <div className="space-y-4">
                  {step.items.map(item => (
                    <div key={item.id} className="p-3 border rounded-md bg-background space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${step.id}-${item.id}-check`} className="text-sm font-medium flex-1">
                          {item.label} {item.requiresPhoto && <span className="text-destructive ml-1">*</span>}
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
                      {item.photoPreview ? (
                        <div className="relative group w-32 h-32 border rounded-md overflow-hidden">
                          <Image src={item.photoPreview} alt={`Preview ${item.label}`} layout="fill" objectFit="cover" />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => removePhoto(stepIndex, item.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remover Foto</span>
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePhotoAttachment(stepIndex, item.id)}
                          className="w-full sm:w-auto"
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          Anexar Foto{item.requiresPhoto && " Obrigatória"}
                        </Button>
                      )}
                    </div>
                  ))}
                  {currentStepIndex === stepIndex && currentStepIndex < totalSteps - 1 && (
                    <Button onClick={handleNextStep} className="w-full sm:w-auto mt-4">
                      Próximo Passo &rarr;
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button 
            variant="outline" 
            onClick={handlePreviousStep} 
            disabled={currentStepIndex === 0}
            className="w-full sm:w-auto"
        >
          &larr; Voltar
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button 
              onClick={handleSubmitChecklist} 
              disabled={progress < 100} 
              className="w-full sm:w-auto"
            >
                <Send className="mr-2 h-4 w-4" />
                Enviar Checklist
            </Button>
        </div>
      </div>
       <p className="text-xs text-muted-foreground text-center mt-4">
        Complete todos os itens obrigatórios de todas as etapas para habilitar o envio do checklist.
      </p>
    </>
  );
}

    
