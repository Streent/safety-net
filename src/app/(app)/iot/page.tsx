
// src/app/(app)/iot/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Signal, Activity, BellRing, Thermometer, Wind, Ear } from 'lucide-react'; // Ear para ruído, Wind para gás/ar

export default function IotPage() {
  return (
    <>
      <PageHeader 
        title="Monitoramento IOT"
        description="Acompanhe sensores e configure alertas em tempo real."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Signal className="mr-3 h-7 w-7 text-primary" />
            Painel de Sensores IOT
          </CardTitle>
          <CardDescription>
            Visualize dados de sensores (ruído, gases, temperatura) e configure limiares de alerta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Signal className="mr-2 h-5 w-5 text-primary" /> {/* Reutilizando Signal */}
              Dashboard de Sensores
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma lista de sensores (Ex: <Ear className="inline h-4 w-4 text-muted-foreground"/> Ruído, <Wind className="inline h-4 w-4 text-muted-foreground"/> Gases, <Thermometer className="inline h-4 w-4 text-muted-foreground"/> Temperatura) será exibida aqui, cada um com um indicador de status (online/offline, normal/alerta).
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Gráficos em Tempo Real
            </h3>
            <p className="text-sm text-muted-foreground">
              Gráficos para visualização de dados dos sensores em tempo real (via WebSocket) serão implementados aqui.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BellRing className="mr-2 h-5 w-5 text-primary" />
              Configuração de Alertas
            </h3>
            <p className="text-sm text-muted-foreground">
              Um formulário para configurar limiares de alerta para cada sensor e as notificações associadas será disponibilizado.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
