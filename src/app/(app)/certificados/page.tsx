
// src/app/(app)/certificados/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Search, Filter, Download, Upload } from 'lucide-react';

export default function CertificadosPage() {
  return (
    <>
      <PageHeader
        title="Gestão de Certificados"
        description="Gerencie e emita certificados de treinamentos e qualificações."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Award className="mr-3 h-7 w-7 text-primary" />
            Certificados
          </CardTitle>
          <CardDescription>
            Visualize, filtre e gerencie todos os certificados emitidos. Importe modelos e configure a emissão automática.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Lista de Certificados Emitidos
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma tabela/lista de certificados emitidos será exibida aqui, com campos como: Nome do Colaborador, Nome do Treinamento/Qualificação, Data de Emissão, Data de Validade, Status e opções para Visualizar/Baixar o PDF.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-primary" />
              Filtros Avançados
            </h3>
            <p className="text-sm text-muted-foreground">
              Opções de filtro por colaborador, tipo de treinamento, status de validade (válido, próximo do vencimento, vencido) e período de emissão serão implementadas.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Upload className="mr-2 h-5 w-5 text-primary" />
              Gestão de Modelos de Certificado
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma área para administradores fazerem upload e gerenciarem modelos de certificado (ex: .docx, .pptx) que serão usados para a geração automática dos documentos.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Download className="mr-2 h-5 w-5 text-primary" />
              Emissão e Envio
            </h3>
            <p className="text-sm text-muted-foreground">
              Funcionalidades para emissão manual ou automática de certificados após a conclusão de treinamentos e opções para envio por e-mail aos participantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
