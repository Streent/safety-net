
// src/app/(app)/biblioteca/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, Search, FileText, UploadCloud } from 'lucide-react'; // Removed Video icon as it's not explicitly in the OCR for general sections

export default function BibliotecaPage() {
  return (
    <>
      <PageHeader 
        title="Recursos da Biblioteca" // Title from OCR
        description="Navegue, pesquise e acesse todos os materiais de apoio. Administradores podem realizar uploads de novos conteúdos." // Description from OCR
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Library className="mr-3 h-7 w-7 text-primary" /> {/* Icon for main library card title */}
            Recursos da Biblioteca {/* Title from OCR */}
          </CardTitle>
          <CardDescription>
            Explore os materiais disponíveis, utilize a busca avançada e filtros por categoria. Administradores podem gerenciar e adicionar novos conteúdos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Busca e Categorias {/* Title from OCR */}
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma barra de busca com sugestões instantâneas será implementada aqui, junto com blocos de categorias visuais (Ex: Normas Regulamentadoras, Manuais em PDF, Vídeos de Treinamento). {/* Description from OCR */}
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> 
              Visualizador de Conteúdo {/* Title from OCR */}
            </h3>
            <p className="text-sm text-muted-foreground">
              Um visualizador integrado para PDFs e vídeos será implementado, além de suporte para links externos. {/* Description from OCR */}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" />
              Upload de Conteúdo (Admin) {/* Title from OCR */}
            </h3>
            <p className="text-sm text-muted-foreground">
              Administradores terão um formulário para upload de novos arquivos com metadados (título, descrição, categoria). {/* Description from OCR */}
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
