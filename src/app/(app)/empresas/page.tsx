
// src/app/(app)/empresas/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react'; // Example Icon

export default function EmpresasPage() {
  return (
    <>
      <PageHeader 
        title="Empresas" // i18n: empresas.title
        description="Gerenciar informações de empresas e clientes." // i18n: empresas.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-6 w-6 text-primary" />
            Gestão de Empresas {/* i18n: empresas.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: empresas.contentDescription */}
            Esta é a página de espaço reservado para Empresas. Conteúdo em breve!
            Consulte o wireframe para lista, busca e detalhes da empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: empresas.placeholderText */}
            Lista de empresas, funcionalidade de busca, detalhes da empresa, documentos e portal do cliente serão implementados aqui.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
