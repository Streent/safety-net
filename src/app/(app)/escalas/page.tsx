
// src/app/(app)/escalas/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, Plane, Settings2 } from 'lucide-react';

// Importe os componentes de aba usando path aliases e a extensão .tsx
import EscalasDashboardTab from './escalas-dashboard.tsx';
import EscalasTecnicosTab from './escalas-tecnicos.tsx';
import EscalasViagensTab from './escalas-viagens.tsx';
import EscalasControleTab from './escalas-controle.tsx';

export default function EscalasPage() {
  return (
    <>
      <PageHeader
        title="Planejamento de Escalas e Viagens"
        description="Monitore, gerencie e simule escalas de técnicos e o histórico de viagens."
      />
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tecnicos">
            <Users className="mr-2 h-4 w-4" />
            Técnicos
          </TabsTrigger>
          <TabsTrigger value="viagens">
            <Plane className="mr-2 h-4 w-4" />
            Viagens
          </TabsTrigger>
          <TabsTrigger value="controle">
            <Settings2 className="mr-2 h-4 w-4" />
            Controlo e Simulação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <EscalasDashboardTab />
        </TabsContent>
        <TabsContent value="tecnicos">
          <EscalasTecnicosTab />
        </TabsContent>
        <TabsContent value="viagens">
          <EscalasViagensTab />
        </TabsContent>
        <TabsContent value="controle">
          <EscalasControleTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
