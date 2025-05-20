
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, FilePlus, ShieldPlus, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// TODO: Define profile-specific actions
const actions = [
  { id: 'new-report', label: 'Novo Relatório', icon: FilePlus, action: () => console.log('Novo Relatório') },
  { id: 'add-epi', label: 'Adicionar EPI', icon: ShieldPlus, action: () => console.log('Adicionar EPI') },
  { id: 'request-vehicle', label: 'Solicitar Veículo', icon: Car, action: () => console.log('Solicitar Veículo') },
];

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleActionClick = (label: string, actionFunc: () => void) => {
    actionFunc(); // Placeholder for actual navigation or function call
    toast({
      title: 'Ação Rápida (Placeholder)',
      description: `${label} acionado. Funcionalidade a ser implementada.`,
    });
    setIsOpen(false); // Close FAB after action
  };

  return (
    <div className="fixed bottom-[calc(4rem+1.5rem+4.5rem)] right-4 z-50 md:hidden"> {/* Position above chat button */}
      <div className="relative flex flex-col items-center">
        {/* Sub-action buttons - revealed when isOpen is true */}
        {isOpen && (
          <div
            className={cn(
              "absolute bottom-full right-0 mb-3 flex flex-col items-end space-y-2 transition-all duration-300 ease-in-out",
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            {actions.map((action) => (
              <div key={action.id} className="flex items-center justify-end">
                <span 
                  className="mr-3 px-2 py-1 text-xs bg-card text-card-foreground rounded-md shadow-md whitespace-nowrap"
                >
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className="rounded-full w-12 h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
                  onClick={() => handleActionClick(action.label, action.action)}
                  aria-label={action.label}
                >
                  <action.icon className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB button */}
        <Button
          onClick={toggleOpen}
          size="icon"
          className="rounded-full w-16 h-16 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
        >
          {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </Button>
      </div>
    </div>
  );
}
