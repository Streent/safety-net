
// src/app/(app)/settings/templates/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, Eye, Download, Trash2, FileText, FileBarChart2, ClipboardCheck } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'Treinamento' | 'Inspeção' | 'Auditoria' | 'Geral';
  version: string;
  uploadDate: string;
  fileName: string;
}

const mockTemplates: ReportTemplate[] = [
  { id: 'tpl001', name: 'Relatório de Treinamento NR-35', type: 'Treinamento', version: '1.2', uploadDate: '15/07/2024', fileName: 'template_nr35_v1.2.docx' },
  { id: 'tpl002', name: 'Checklist de Inspeção de Equipamentos', type: 'Inspeção', version: '2.0', uploadDate: '10/06/2024', fileName: 'insp_equip_v2.0.pptx' },
  { id: 'tpl003', name: 'Relatório de Auditoria Interna ISO 9001', type: 'Auditoria', version: '1.0', uploadDate: '01/05/2024', fileName: 'audit_iso9001_v1.pptx' },
];

const templateTypeIcons = {
  'Treinamento': <FileText className="h-4 w-4 text-blue-500" />,
  'Inspeção': <ClipboardCheck className="h-4 w-4 text-green-500" />,
  'Auditoria': <FileBarChart2 className="h-4 w-4 text-purple-500" />,
  'Geral': <FileText className="h-4 w-4 text-gray-500" />,
};

export default function ReportTemplatesPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um ou mais arquivos .docx ou .pptx.',
      });
      return;
    }
    // Simulate upload
    const newFileNames = Array.from(selectedFiles).map(file => file.name).join(', ');
    toast({
      title: 'Upload Simulado',
      description: `Arquivos ${newFileNames} "enviados". Lógica de armazenamento e categorização a ser implementada.`,
    });
    // Here you would normally upload to Firebase Storage and update Firestore.
    // For now, just clear selected files
    setSelectedFiles(null); 
    // Optionally, you could add a mock new template to the `templates` list
    // For example:
    // const newMockTemplate: ReportTemplate = {
    //   id: `tpl${Date.now()}`,
    //   name: `Novo Modelo - ${selectedFiles[0].name.split('.')[0]}`,
    //   type: 'Geral', // User would select this
    //   version: '1.0',
    //   uploadDate: new Date().toLocaleDateString('pt-BR'),
    //   fileName: selectedFiles[0].name
    // };
    // setTemplates(prev => [newMockTemplate, ...prev]);
  };

  const handlePreviewTemplate = (templateName: string) => {
    toast({
      title: 'Visualizar Modelo (Placeholder)',
      description: `Funcionalidade para visualizar "${templateName}" com destaque de placeholders será implementada.`,
    });
  };
  
  const handleDownloadTemplate = (fileName: string) => {
    toast({
      title: 'Download (Placeholder)',
      description: `Funcionalidade para baixar o arquivo "${fileName}" será implementada.`,
    });
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (confirm(`Tem certeza que deseja excluir o modelo "${templateName}"? Esta ação não pode ser desfeita.`)) {
      setTemplates(prev => prev.filter(tpl => tpl.id !== templateId));
      toast({
        variant: 'destructive',
        title: 'Modelo Excluído (Simulado)',
        description: `O modelo "${templateName}" foi removido da lista.`,
      });
    }
  };


  return (
    <>
      <PageHeader
        title="Gerenciamento de Modelos de Relatório"
        description="Faça upload, visualize e gerencie seus templates de documentos (.docx, .pptx)."
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <UploadCloud className="mr-3 h-7 w-7 text-primary" />
              Upload de Novos Modelos
            </CardTitle>
            <CardDescription>
              Arraste e solte arquivos .docx ou .pptx, ou clique para selecionar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center hover:border-primary transition-colors">
              <Label
                htmlFor="template-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Arraste arquivos aqui ou clique para selecionar
                </span>
                <span className="text-xs text-muted-foreground">
                  Formatos suportados: .docx, .pptx
                </span>
              </Label>
              <Input
                id="template-upload"
                type="file"
                accept=".docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                multiple
                onChange={handleFileChange}
                className="sr-only" // Visually hidden, label handles click
              />
            </div>
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Arquivos Selecionados:</h4>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Enviar Modelos Selecionados
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Nota: O upload real para Firebase Storage e o processamento por Cloud Functions serão implementados no backend.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-7 w-7 text-primary" />
              Modelos Salvos
            </CardTitle>
            <CardDescription>
              Visualize e gerencie os modelos de relatório existentes. Versionamento e categorização a serem implementados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Modelo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Versão</TableHead>
                      <TableHead>Data de Upload</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs flex items-center gap-1.5">
                            {templateTypeIcons[template.type] || <FileText className="h-4 w-4 text-gray-500"/>}
                            {template.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{template.version}</TableCell>
                        <TableCell>{template.uploadDate}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreviewTemplate(template.name)} aria-label="Visualizar modelo">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadTemplate(template.fileName)} aria-label="Baixar modelo">
                            <Download className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTemplate(template.id, template.name)} aria-label="Excluir modelo">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum modelo salvo ainda. Faça o upload do seu primeiro modelo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
