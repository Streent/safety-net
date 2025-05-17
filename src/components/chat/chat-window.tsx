
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          text: 'Olá! Sou o Leão Assistente do SafetyNet. Como posso ajudar você hoje?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 0);
      }
    }
  }, [messages]);


  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        text: 'Obrigado pela sua mensagem! Ainda estou aprendendo, mas farei o meu melhor para ajudar. Rugidos de sabedoria em breve!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card className="fixed bottom-[5.5rem] right-4 sm:right-6 z-[60] w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-sm sm:max-w-md h-[60vh] max-h-[500px] shadow-2xl rounded-xl flex flex-col overflow-hidden border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 animate-in slide-in-from-bottom-4 fade-in-25 duration-300 ease-out">
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 hidden sm:flex">
            <AvatarImage src="/images/mascote-leao.png" alt="Leão Assistente" />
            <AvatarFallback><Bot size={18}/></AvatarFallback> 
          </Avatar>
          <CardTitle className="text-base sm:text-lg">Leão Assistente SafetyNet</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar chat">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 sm:p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2 text-sm',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 self-start shrink-0">
                    <AvatarImage src="/images/mascote-leao.png" alt="Leão Assistente" />
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] sm:max-w-[70%] rounded-lg p-2.5 shadow-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1.5",
                      message.sender === 'user' ? 'text-primary-foreground/80 text-right' : 'text-muted-foreground text-left'
                    )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start shrink-0">
                     <AvatarFallback><User size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 border-t shrink-0">
        <div className="flex w-full items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 text-sm"
            data-ai-hint="chat message input"
            autoComplete="off"
          />
          <Button onClick={handleSendMessage} aria-label="Enviar mensagem" disabled={!inputValue.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
