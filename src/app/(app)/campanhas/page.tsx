
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Megaphone, CalendarDays, Eye, Edit, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'ativa' | 'planejada' | 'concluida' | 'arquivada';
}

const mockCampaigns: Campaign[] = [
  {
    id: 'CAMP001',
    title: 'Campanha de Conscientização sobre EPIs',
    description: 'Promover o uso correto de Equipamentos de Proteção Individual em todos os setores.',
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 5, 30),
    progress: 75,
    status: 'ativa',
  },
  {
    id: 'CAMP002',
    title: 'Semana Interna de Prevenção de Acidentes (SIPAT)',
    description: 'Atividades e palestras focadas na prevenção de acidentes e promoção da saúde.',
    startDate: new Date(2024, 8, 16),
    endDate: new Date(2024, 8, 20),
    progress: 20,
    status: 'planejada',
  },
  {
    id: 'CAMP003',
    title: 'Treinamento de Primeiros Socorros',
    description: 'Capacitar colaboradores para agir em situações de emergência.',
    startDate: new Date(2024, 3, 10),
    endDate: new Date(2024, 3, 12),
    progress: 100,
    status: 'concluida',
  },
    {
    id: 'CAMP004',
    title: 'Segurança no Trânsito Corporativo',
    description: 'Conscientizar sobre práticas seguras na condução de veículos da empresa.',
    startDate: new Date(2024, 6, 1),
    endDate: new Date(2024, 6, 31),
    progress: 40,
    status: 'ativa',
  },
];

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { toast } = useToast();

  const handleViewDetails = (campaignId: string) => {
    toast({
      title: 'Ver Detalhes da Campanha',
      description: `Funcionalidade para ver detalhes da campanha ${campaignId} (com descrição em rich text, galeria de mídia, checklist anexado e opções de envio) será implementada aqui.`,
    });
  };

  // TODO: Add logic for 'Edit Campaign' button
  const handleEditCampaign = (campaignId: string) => {
    toast({
      title: 'Editar Campanha',
      description: `Funcionalidade para editar a campanha ${campaignId} será implementada aqui (provavelmente em um modal ou nova página).`,
    });
  };

  // TODO: Add logic for 'Send' button
  const handleSendCampaign = (campaignId: string) => {
    toast({
      title: 'Enviar Campanha',
      description: `Funcionalidade para enviar a campanha ${campaignId} para pessoas ou grupos será implementada aqui.`,
    });
  };
  
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'planejada': return 'bg-blue-500';
      case 'concluida': return 'bg-gray-500';
      case 'arquivada': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg mb-1 flex items-center">
              <Megaphone className="mr-2 h-5 w-5 text-primary" />
              {campaign.title}
            </CardTitle>
            <span className={`px-2 py-0.5 text-xs text-white rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          {format(campaign.startDate, 'dd/MM/yyyy', { locale: ptBR })} - {format(campaign.endDate, 'dd/MM/yyyy', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
          {campaign.description}
        </p>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{campaign.progress}%</span>
          </div>
          <Progress value={campaign.progress} aria-label={`Progresso da campanha: ${campaign.progress}%`} className="h-2.5" />
        </div>
        {/* TODO: Add styling for buttons and layout */}
        <div className="flex space-x-2">
          <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleEditCampaign(campaign.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Campanha
          </Button>
           <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleSendCampaign(campaign.id)}
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampanhasPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const handleCreateCampaign = () => {
    toast({
      title: 'Criar Nova Campanha',
      description: 'Funcionalidade para criar uma nova campanha será implementada aqui (provavelmente em um modal ou nova página).',
    });
  };

  return (
    <>
      <PageHeader
        title="Gerenciamento de Campanhas"
        description="Crie, acompanhe e gerencie campanhas de segurança e conscientização."
        actions={
          <Button onClick={handleCreateCampaign}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Campanha
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <Megaphone className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-sm mb-4">Comece criando uma nova campanha para engajar sua equipe.</p>
              <Button onClick={handleCreateCampaign}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Primeira Campanha
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Detalhes da campanha (editor de rich text, galeria de mídia, anexar checklist, envio) serão acessíveis a partir de cada card.</p>
      </div>
    </>
  );
}
