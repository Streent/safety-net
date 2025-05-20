
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, FilePlus, ShieldPlus, Car, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface QuickAction {
  id: string;
  label: string; // Manter o label para a função handleActionClick e tooltip futuro
  icon: React.ElementType;
  action: () => void;
}

interface QuickActionsFABProps {
  onToggleChat?: () => void;
}

export function QuickActionsFAB({ onToggleChat }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const commonActions: QuickAction[] = [
    { id: 'new-report', label: 'Novo Relatório', icon: FilePlus, action: () => console.log('Novo Relatório Placeholder') },
    { id: 'add-epi', label: 'Adicionar EPI', icon: ShieldPlus, action: () => console.log('Adicionar EPI Placeholder') },
    { id: 'request-vehicle', label: 'Solicitar Veículo', icon: Car, action: () => console.log('Solicitar Veículo Placeholder') },
  ];

  const chatAction: QuickAction | null = onToggleChat
    ? { id: 'toggle-chat', label: 'Falar com Assistente', icon: Bot, action: onToggleChat }
    : null;

  const actions = chatAction ? [...commonActions, chatAction].reverse() : [...commonActions].reverse(); // .reverse() para que o chat fique no topo

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleActionClick = (label: string, actionFunc: () => void) => {
    actionFunc();
    if (label !== 'Falar com Assistente') {
      toast({
        title: 'Ação Rápida (Placeholder)',
        description: `${label} acionado. Funcionalidade a ser implementada.`,
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-[calc(4rem+1.5rem)] right-4 z-50 md:hidden">
      <div className="relative flex flex-col items-center">
        {/* Sub-action buttons container */}
        <div
          className={cn(
            "absolute bottom-full right-0 mb-3 flex flex-col items-end space-y-2 transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          {actions.map((action, index) => (
            <div key={action.id} className="flex items-center justify-end">
               <span 
                  className={cn(
                    "mr-3 px-2 py-1 text-xs bg-card text-card-foreground rounded-md shadow-md whitespace-nowrap transition-all duration-200 ease-out",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                  style={{ transitionDelay: isOpen ? `${index * 50 + 100}ms` : "0ms" }}
                >
                  {action.label}
                </span>
              <Button
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12 bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-600 dark:hover:bg-slate-700 shadow-lg transition-all duration-200 ease-out",
                  isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
                style={{ transitionDelay: isOpen ? `${index * 50 + 50}ms` : "0ms" }}
                onClick={() => handleActionClick(action.label, action.action)}
                aria-label={action.label}
              >
                <action.icon className="h-6 w-6" />
              </Button>
            </div>
          ))}
        </div>

        {/* Main FAB button */}
        <Button
          onClick={toggleOpen}
          size="icon"
          className={cn(
            "rounded-full w-16 h-16 shadow-xl flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105",
            isOpen ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
        >
          {isOpen ? (
            <X className="h-7 w-7 transition-transform duration-300 ease-in-out rotate-0 group-aria-expanded:rotate-180" />
          ) : (
            <Image
              src="/images/mascote-leao.png"
              alt="Ações Rápidas SafetyNet"
              width={48}
              height={48}
              className="rounded-full object-contain transition-transform duration-300 ease-in-out scale-100 group-aria-expanded:scale-90"
            />
          )}
        </Button>
      </div>
    </div>
  );
}
