// src/app/(app)/escalas/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';

export default function EscalasPage() {
  return (
    <>
      <PageHeader title="Planejamento de Escalas (Teste de Rota)" description="Página de teste para a rota /escalas." />
      <div className="p-6 mt-4 border rounded-lg bg-card shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Conteúdo da Página de Teste de Escalas</h2>
        <p className="mt-2 text-muted-foreground">
          Se você está vendo esta mensagem, a rota básica para /escalas está funcionando.
          O erro 404 anterior provavelmente estava no conteúdo mais complexo da página original
          ou em um dos componentes que ela importava (como as abas de Dashboard, Técnicos, etc.).
        </p>
      </div>
    </>
  );
}
