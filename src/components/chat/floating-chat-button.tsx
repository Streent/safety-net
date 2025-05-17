
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Importar o componente Image

interface FloatingChatButtonProps {
  onClick: () => void;
  isChatOpen?: boolean;
}

export function FloatingChatButton({ onClick, isChatOpen }: FloatingChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl w-16 h-16 p-0 hover:scale-110 active:scale-105 transition-transform duration-200 ease-in-out flex items-center justify-center"
      aria-label={isChatOpen ? "Fechar chat com Leão Assistente" : "Abrir chat com Leão Assistente"}
      data-ai-hint="chat assistant button"
      variant={isChatOpen ? "secondary" : "default"}
    >
      {/* Substituir o ícone Bot pela imagem do mascote */}
      <Image
        src="/images/mascote-leao.png" // Caminho para a imagem na pasta public
        alt="Leão Assistente SafetyNet"
        width={48} // Ajuste o tamanho conforme necessário
        height={48} // Ajuste o tamanho conforme necessário
        className="rounded-full object-contain" // object-contain para evitar cortes indesejados
      />
    </Button>
  );
}
