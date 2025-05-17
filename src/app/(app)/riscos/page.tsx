
// src/app/(app)/riscos/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertOctagon, ShieldAlert, Layers, Link2 } from 'lucide-react';

export default function RiscosPage() {
  return (
    <>
      <PageHeader 
        title="Gerenciamento de Riscos"
        description="Identifique, analise e controle os riscos de SST."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <AlertOctagon className="mr-3 h-7 w-7 text-primary" />
            Análise de Riscos
          </CardTitle>
          <CardDescription>
            Utilize formulários para identificação de perigos e visualize a matriz de riscos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
              Identificação de Riscos
            </h3>
            <p className="text-sm text-muted-foreground">
              Um formulário para identificação de riscos será implementado aqui, incluindo campos para: perigo, consequência, probabilidade, medidas de controle existentes e propostas.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-primary" />
              Matriz de Riscos
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma matriz de riscos (heatmap) interativa será exibida, permitindo a visualização da severidade e probabilidade dos riscos identificados.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Link2 className="mr-2 h-5 w-5 text-primary" />
              Integração com PGR e Auditorias
            </h3>
            <p className="text-sm text-muted-foreground">
              Os riscos identificados poderão ser vinculados aos registros do PGR (Programa de Gerenciamento de Riscos) e aos relatórios de auditorias.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
