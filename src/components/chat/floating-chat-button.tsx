
'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react'; // Placeholder for the lion mascot

interface FloatingChatButtonProps {
  onClick: () => void;
  isChatOpen?: boolean;
}

export function FloatingChatButton({ onClick, isChatOpen }: FloatingChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl w-16 h-16 p-0 hover:scale-110 active:scale-105 transition-transform duration-200 ease-in-out"
      aria-label={isChatOpen ? "Fechar chat" : "Abrir chat com assistente"} // i18n: chat.toggleChatAriaLabel
      data-ai-hint="chat assistant button"
      variant={isChatOpen ? "secondary" : "default"}
    >
      <Bot className="h-8 w-8" />
    </Button>
  );
}
