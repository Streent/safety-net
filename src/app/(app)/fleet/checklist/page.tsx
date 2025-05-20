// src/app/(app)/fleet/checklist/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Camera, Save, Send, FileText, Construction, Droplets, CircleEllipsis, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  observation: string;
  requiresPhoto?: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

const initialChecklistData: ChecklistSection[] = [
  {
    id: 'docs',
    title: 'Documentação do Veículo',
    icon: FileText,
    items: [
      { id: 'doc1', label: 'CRLV válido e no veículo', checked: false, observation: '' },
      { id: 'doc2', label: 'Seguro obrigatório (DPVAT) em dia', checked: false, observation: '' },
      { id: 'doc3', label: 'Manual do proprietário', checked: false, observation: '' },
    ],
  },
  {
    id: 'tires',
    title: 'Pneus e Rodas',
    icon: CircleEllipsis, 
    items: [
      { id: 'tire1', label: 'Calibragem dos pneus (conforme manual)', checked: false, observation: '' },
      { id: 'tire2', label: 'Estado de conservação dos pneus (sem cortes/bolhas)', checked: false, observation: '', requiresPhoto: true },
      { id: 'tire3', label: 'Estepe em condições de uso', checked: false, observation: '' },
      { id: 'tire4', label: 'Apertos das porcas das rodas', checked: false, observation: '' },
    ],
  },
  {
    id: 'fluids',
    title: 'Níveis de Fluido',
    icon: Droplets,
    items: [
      { id: 'fluid1', label: 'Nível do óleo do motor', checked: false, observation: '' },
      { id: 'fluid2', label: 'Nível do fluido de arrefecimento', checked: false, observation: '' },
      { id: 'fluid3', label: 'Nível do fluido de freio', checked: false, observation: '' },
      { id: 'fluid4', label: 'Nível do fluido da direção hidráulica (se aplicável)', checked: false, observation: '' },
    ],
  },
  {
    id: 'lights',
    title: 'Luzes e Sinalização',
    icon: AlertTriangle, 
    items: [
      { id: 'light1', label: 'Faróis (baixo e alto)', checked: false, observation: '' },
      { id: 'light2', label: 'Lanternas dianteiras e traseiras', checked: false, observation: '' },
      { id: 'light3', label: 'Luzes de freio', checked: false, observation: '' },
      { id: 'light4', label: 'Setas (dianteiras, traseiras, laterais)', checked: false, observation: '' },
      { id: 'light5', label: 'Luz de ré', checked: false, observation: '' },
      { id: 'light6', label: 'Pisca-alerta', checked: false, observation: '' },
    ],
  },
  {
    id: 'safety_items',
    title: 'Itens de Segurança Obrigatórios',
    icon: Construction, 
    items: [
      { id: 'safety1', label: 'Triângulo de sinalização', checked: false, observation: '' },
      { id: 'safety2', label: 'Macaco e chave de roda', checked: false, observation: '' },
      { id: 'safety3', label: 'Cintos de segurança (todos os assentos)', checked: false, observation: '' },
      { id: 'safety4', label: 'Extintor de incêndio (validade e carga)', checked: false, observation: '', requiresPhoto: true },
    ],
  },
];

export default function VehicleChecklistPage() {
  const { toast } = useToast();
  const [checklistData, setChecklistData] = useState<ChecklistSection[]>(initialChecklistData);
  const [progress, setProgress] = useState(0);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(initialChecklistData[0]?.id);

  const totalItems = checklistData.reduce((acc, section) => acc + section.items.length, 0);

  const updateProgress = useCallback(() => {
    const checkedItemsCount = checklistData.reduce((acc, section) => 
      acc + section.items.filter(item => item.checked).length, 0
    );
    setProgress(totalItems > 0 ? Math.round((checkedItemsCount / totalItems) * 100) : 0);
  }, [checklistData, totalItems]);
  
  useEffect(() => {
    updateProgress();
  }, [updateProgress]); 

  const handleItemChange = (sectionId: string, itemId: string, field: 'checked' | 'observation', value: string | boolean) => {
    setChecklistData(prevData =>
      prevData.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : section
      )
    );
  };

  const handleAccordionChange = (value: string | string[]) => {
    setActiveAccordionItem(typeof value === 'string' ? value : value[0]);
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Rascunho Salvo!',
      description: 'Seu progresso no checklist foi salvo como rascunho. (Funcionalidade de persistência a ser implementada).',
      variant: 'default',
    });
  };

  const handleSubmitChecklist = () => {
    // TODO: Implementar lógica de envio real
    // Por agora, apenas simular e limpar o checklist
    toast({
      title: 'Checklist Enviado com Sucesso!',
      description: 'O checklist do veículo foi enviado e registrado. (Funcionalidade de processamento a ser implementada).',
      variant: 'default',
    });
    // Opcional: Resetar o checklist após envio
    // setChecklistData(initialChecklistData.map(section => ({ ...section, items: section.items.map(item => ({...item, checked: false, observation: ''})) })));
    // setActiveAccordionItem(initialChecklistData[0]?.id);
  };

  const handleAttachPhoto = (sectionTitle: string, itemLabel: string) => {
     toast({
      title: 'Anexar Foto (Placeholder)',
      description: `Funcionalidade para anexar foto para o item "${itemLabel}" da seção "${sectionTitle}" será implementada aqui.`,
    });
  };

  const goToNextSection = (currentIndex: number) => {
    if (currentIndex < checklistData.length - 1) {
      setActiveAccordionItem(checklistData[currentIndex + 1]?.id);
    }
  };

  const isSectionCompleted = (section: ChecklistSection): boolean => {
    return section.items.every(item => item.checked);
  };

  return (
    <>
      <PageHeader
        title="Checklist de Veículo"
        description="Preencha todos os itens do checklist antes de iniciar ou após concluir o uso do veículo."
        // Placeholder: Adicionar informações do veículo/solicitação aqui
      />

      <Card className="mb-6 shadow-md">
        <CardHeader>
            <CardTitle>Progresso do Checklist</CardTitle>
            <CardDescription>Complete todas as seções para finalizar.</CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progress} className="w-full h-3" aria-label={`Progresso do checklist: ${progress}%`} />
            <p className="text-sm text-muted-foreground mt-2 text-center">{progress}% concluído</p>
        </CardContent>
      </Card>

      <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-2" 
        value={activeAccordionItem}
        onValueChange={handleAccordionChange}
      >
        {checklistData.map((section, sectionIndex) => {
          const completed = isSectionCompleted(section);
          return (
            <AccordionItem key={section.id} value={section.id} className="border rounded-lg bg-card shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg text-base sm:text-lg">
                <div className="flex items-center flex-1">
                  <section.icon className={cn("mr-3 h-5 w-5 text-primary", completed && "text-green-500")} />
                  <span className={cn(completed && "line-through text-muted-foreground")}>{section.title}</span>
                  {completed && <CheckCircle className="ml-2 h-5 w-5 text-green-500" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 border-t">
                <div className="space-y-4">
                  {section.items.map(item => (
                    <div key={item.id} className="p-3 border rounded-md bg-background space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${section.id}-${item.id}-check`} className="text-sm font-medium flex-1">
                          {item.label}
                        </Label>
                        <Checkbox
                          id={`${section.id}-${item.id}-check`}
                          checked={item.checked}
                          onCheckedChange={checked => handleItemChange(section.id, item.id, 'checked', !!checked)}
                          className="ml-4"
                        />
                      </div>
                      <Textarea
                        id={`${section.id}-${item.id}-obs`}
                        placeholder="Observações (opcional)"
                        value={item.observation}
                        onChange={e => handleItemChange(section.id, item.id, 'observation', e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      {item.requiresPhoto && (
                          <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAttachPhoto(section.title, item.label)}
                              className="w-full sm:w-auto"
                          >
                              <Camera className="mr-2 h-4 w-4" />
                              Anexar Foto
                          </Button>
                      )}
                    </div>
                  ))}
                  {sectionIndex < checklistData.length - 1 && (
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="secondary" 
                        onClick={() => goToNextSection(sectionIndex)}
                      >
                        Próxima Seção &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Rascunho
        </Button>
        <Button onClick={handleSubmitChecklist} disabled={progress < 100}>
          <Send className="mr-2 h-4 w-4" />
          Enviar Checklist
        </Button>
      </div>
       <p className="text-xs text-muted-foreground text-center mt-4">
        Após o envio, o checklist ficará registrado no histórico do veículo e da solicitação.
      </p>
    </>
  );
}
