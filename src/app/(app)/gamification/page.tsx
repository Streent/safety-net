
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Award, BarChartHorizontalBig, TrendingUp, ShieldHalf, Star, Eye, ShieldCheck as ShieldCheckIconLucide, Users as UsersIconLucide, Car as CarIconLucide } from 'lucide-react'; // Renomeado para evitar conflito
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Ícones para conquistas
const achievementIcons = {
  ShieldHalf,
  Eye,
  ShieldCheck: ShieldCheckIconLucide, // Usando o alias
  Users: UsersIconLucide,             // Usando o alias
  Star,
  Car: CarIconLucide,                 // Usando o alias
};

export default function GamificationPage() {
  // Mock data for demonstration
  const currentXP = 750;
  const nextLevelXP = 1000;
  const currentLevel = 5;
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  const mockAchievements = [
    { title: "Primeiro Relatório", iconName: "ShieldHalf", color: "text-green-500" },
    { title: "Observador Atento", iconName: "Eye", color: "text-blue-500" },
    { title: "Mestre dos EPIs", iconName: "ShieldCheck", color: "text-yellow-500" },
    { title: "Participativo", iconName: "Users", color: "text-purple-500" },
    { title: "Semana Perfeita", iconName: "Star", color: "text-red-500" },
    { title: "Guardião da Frota", iconName: "Car", color: "text-teal-500" },
    // Adicione mais conquistas fictícias se desejar
  ];


  return (
    <>
      <PageHeader 
        title="Gamificação e Performance" 
        description="Acompanhe seu XP, conquistas e veja sua posição no ranking de engajamento." 
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Gem className="mr-3 h-7 w-7 text-primary" />
              XP & Níveis
            </CardTitle>
            <CardDescription>
              Seu progresso atual e nível no sistema SafetyNet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <Badge variant="secondary" className="text-base px-3 py-1">Nível: <span className="text-primary font-bold ml-1">{currentLevel}</span></Badge>
                <span className="text-muted-foreground">XP: <span className="text-primary font-bold">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()}</span></span>
              </div>
              <Progress value={progressPercentage} aria-label={`Progresso de XP: ${progressPercentage.toFixed(0)}%`} className="h-3.5" />
              <p className="text-xs text-muted-foreground text-center mt-1">Faltam { (nextLevelXP - currentXP).toLocaleString() } XP para o próximo nível!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Award className="mr-3 h-7 w-7 text-accent" />
              Conquistas Desbloqueadas
            </CardTitle>
            <CardDescription>
              Seus últimos feitos e medalhas conquistadas no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockAchievements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockAchievements.map(achievement => {
                  const IconComponent = achievementIcons[achievement.iconName as keyof typeof achievementIcons] || Star;
                  return (
                    <div 
                      key={achievement.title} 
                      className="flex flex-col items-center p-3 border rounded-lg bg-muted/50 text-center hover:bg-muted/70 transition-colors cursor-pointer group"
                      title={achievement.title}
                    >
                      <IconComponent className={`h-10 w-10 mb-2 ${achievement.color} transition-transform duration-300 ease-out group-hover:scale-110`} />
                      <p className="text-xs font-medium truncate w-full">{achievement.title}</p>
                      {/* Placeholder para animação de desbloqueio/flip */}
                    </div>
                  );
                })}
              </div>
            ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma conquista desbloqueada ainda.</p>
            )}
             <p className="text-xs text-muted-foreground text-center mt-4">Mais conquistas serão desbloqueadas ao interagir com o sistema!</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BarChartHorizontalBig className="mr-3 h-7 w-7 text-primary" />
            Leaderboard Geral
          </CardTitle>
          <CardDescription>
            Veja sua posição em relação aos outros usuários. Filtre por período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder para leaderboard com abas (semanal/mensal) */}
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Uma tabela ou carrossel (para mobile) com o ranking (Semanal/Mensal) será exibido aqui.
              A lista mostrará: Posição, Nome do Usuário, XP Total e talvez a última conquista.
              Seu nome será destacado na lista.
            </p>
            <div className="mt-4 h-60 bg-muted rounded flex items-center justify-center">
              <p className="text-muted-foreground italic">Visualização do Leaderboard (Placeholder)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
