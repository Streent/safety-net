
// src/app/(app)/esocial/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileText, History, DatabaseZap } from 'lucide-react';

export default function ESocialPage() {
  return (
    <>
      <PageHeader 
        title="Integração eSocial"
        description="Gere e envie os eventos de SST para o eSocial."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <DatabaseZap className="mr-3 h-7 w-7 text-primary" />
            eSocial SST
          </CardTitle>
          <CardDescription>
            Selecione o período, gere o arquivo XML e envie para a API do eSocial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Geração de XML
            </h3>
            <p className="text-sm text-muted-foreground">
              Um formulário para selecionar o período e os dados a serem exportados para o arquivo XML do eSocial (eventos de SST) será implementado aqui.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" />
              Envio para API do eSocial
            </h3>
            <p className="text-sm text-muted-foreground">
              Funcionalidade para realizar o upload do arquivo XML gerado para a API do eSocial.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <History className="mr-2 h-5 w-5 text-primary" />
              Log de Envios
            </h3>
            <p className="text-sm text-muted-foreground">
              Um registro (log) dos envios realizados e as respostas da API do eSocial será mantido e exibido aqui.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
