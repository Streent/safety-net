
// src/app/(app)/biblioteca/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, Search, FileText, Video, UploadCloud } from 'lucide-react'; // Example Icons

export default function BibliotecaPage() {
  return (
    <>
      <PageHeader 
        title="Biblioteca de Recursos" // i18n: biblioteca.title (Updated)
        description="Acesse documentos, vídeos, normas regulamentadoras (NRs) e outros materiais de segurança." // i18n: biblioteca.description (Updated)
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Library className="mr-3 h-7 w-7 text-primary" />
            Recursos da Biblioteca {/* i18n: biblioteca.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: biblioteca.contentDescription */}
            Navegue, pesquise e acesse todos os materiais de apoio. Administradores podem realizar uploads de novos conteúdos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Busca e Categorias {/* i18n: biblioteca.searchAndCategoriesTitle */}
            </h3>
            <p className="text-sm text-muted-foreground">
              {/* i18n: biblioteca.searchAndCategoriesPlaceholder */}
              Uma barra de busca com sugestões instantâneas será implementada aqui, junto com blocos de categorias visuais (Ex: Normas Regulamentadoras, Manuais em PDF, Vídeos de Treinamento).
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> {/* Or Video icon depending on context */}
              Visualizador de Conteúdo {/* i18n: biblioteca.contentViewerTitle */}
            </h3>
            <p className="text-sm text-muted-foreground">
              {/* i18n: biblioteca.contentViewerPlaceholder */}
              Um visualizador integrado para PDFs e vídeos será implementado, além de suporte para links externos.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" />
              Upload de Conteúdo (Admin) {/* i18n: biblioteca.uploadAdminTitle */}
            </h3>
            <p className="text-sm text-muted-foreground">
              {/* i18n: biblioteca.uploadAdminPlaceholder */}
              Administradores terão um formulário para upload de novos arquivos com metadados (título, descrição, categoria).
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
