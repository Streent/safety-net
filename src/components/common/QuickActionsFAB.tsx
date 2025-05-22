
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, FilePlus, ShieldPlus, Car, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface QuickAction {
  id: string;
  label: string;
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
    { id: 'new-report', label: 'Novo Relatório', icon: FilePlus, action: () => toast({ title: 'Ação Rápida', description: 'Novo Relatório (Placeholder)' }) },
    { id: 'add-epi', label: 'Adicionar EPI', icon: ShieldPlus, action: () => toast({ title: 'Ação Rápida', description: 'Adicionar EPI (Placeholder)' }) },
    { id: 'request-vehicle', label: 'Solicitar Veículo', icon: Car, action: () => toast({ title: 'Ação Rápida', description: 'Solicitar Veículo (Placeholder)' }) },
  ];

  const chatAction: QuickAction | null = onToggleChat
    ? { id: 'toggle-chat', label: 'Falar com Assistente', icon: Bot, action: onToggleChat }
    : null;

  // Ensures chat action is first if present, then common actions.
  // The visual order in the arc will be from bottom-most to top-most.
  const actions = (chatAction ? [chatAction, ...commonActions] : [...commonActions]);


  const toggleOpen = () => setIsOpen(!isOpen);

  // Define positions for an arc (top-left of the main button)
  // These might need fine-tuning based on exact button sizes and desired spread
  const subButtonPositions = [
    { transform: 'translate(-60px, -20px)' }, // "Novo Relatório" (bottom-most in arc)
    { transform: 'translate(-85px, -65px)' }, // "Adicionar EPI"
    { transform: 'translate(-60px, -110px)'}, // "Solicitar Veículo"
    { transform: 'translate(-15px, -130px)'}, // "Falar com Assistente" (top-most in arc, if present)
  ];
   // If chat action is not present, adjust positions for 3 items
  const threeItemPositions = [
    { transform: 'translate(-50px, -30px)' }, 
    { transform: 'translate(-80px, -80px)' }, 
    { transform: 'translate(-30px, -110px)'},
  ];

  const currentPositions = actions.length === 4 ? subButtonPositions : threeItemPositions;


  return (
    <div className="fixed bottom-[calc(4rem+1.5rem)] right-4 z-50 md:hidden">
      <div className="relative flex flex-col items-center">
        {/* Sub-action buttons container - no longer a separate flex container, items positioned individually */}
        {actions.map((action, index) => (
          <Button
            key={action.id}
            size="icon"
            className={cn(
              "absolute bottom-0 right-0 rounded-full w-12 h-12 bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-600 dark:hover:bg-slate-700 shadow-lg transition-all duration-300 ease-in-out",
              isOpen
                ? `opacity-100 scale-100 ${currentPositions[index]?.transform || ''}` // Apply transform for arc
                : "opacity-0 scale-50 pointer-events-none" // Hidden state
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50 + 50}ms` : "0ms",
              zIndex: 50 - index // Ensure proper stacking if they overlap during animation
            }}
            onClick={() => {
              action.action();
              setIsOpen(false);
            }}
            aria-label={action.label}
          >
            <action.icon className="h-6 w-6" />
          </Button>
        ))}

        {/* Main FAB button */}
        <Button
          onClick={toggleOpen}
          size="icon"
          className={cn(
            "relative rounded-full w-16 h-16 shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 z-[51]", // Higher z-index for main button
            isOpen 
              ? "bg-blue-500 hover:bg-blue-600 text-white rotate-0" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
        >
          <div className={cn("transition-transform duration-300 ease-in-out", isOpen ? "rotate-180 scale-100" : "rotate-0 scale-100")}>
            {isOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Image
                src="/images/mascote-leao.png"
                alt="Ações Rápidas SafetyNet"
                width={48}
                height={48}
                className="rounded-full object-contain"
                style={{ width: 'auto', height: 'auto' }} // Added style here
              />
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
