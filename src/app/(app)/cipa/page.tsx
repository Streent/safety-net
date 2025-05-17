
// src/app/(app)/cipa/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, TrendingUp, PieChart } from 'lucide-react';

export default function CipaPage() {
  return (
    <>
      <PageHeader 
        title="Gestão da CIPA"
        description="Acompanhe as metas anuais e indicadores da CIPA."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Painel da CIPA
          </CardTitle>
          <CardDescription>
            Defina metas, acompanhe o progresso e visualize os KPIs da Comissão Interna de Prevenção de Acidentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Target className="mr-2 h-5 w-5 text-primary" />
              Definição de Metas Anuais
            </h3>
            <p className="text-sm text-muted-foreground">
              Um formulário para definir metas anuais da CIPA será implementado, incluindo campos para: valor alvo, período e responsável.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-primary" />
              Gráficos de KPIs
            </h3>
            <p className="text-sm text-muted-foreground">
              Gráficos de indicadores chave de desempenho (KPIs) relacionados às metas da CIPA serão exibidos aqui.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Acompanhamento de Progresso
            </h3>
            <p className="text-sm text-muted-foreground">
              Um sistema para acompanhar o progresso das metas, com comparativo (delta) em relação ao ano anterior, será implementado.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
