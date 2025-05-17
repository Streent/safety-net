
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Award, BarChartHorizontalBig, TrendingUp, ShieldHalf, Star } from 'lucide-react';

export default function GamificationPage() {
  return (
    <>
      <PageHeader 
        title="Gamificação" 
        description="Acompanhe seu XP, conquistas e veja sua posição no ranking." 
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
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
            {/* Placeholder para animação da barra de XP e badge de nível */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Nível Atual: <span className="text-primary font-bold">5</span></span>
                <span>XP: <span className="text-primary font-bold">750 / 1000</span></span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <div className="bg-primary h-4 rounded-full" style={{ width: '75%' }} aria-label="Progresso de XP: 75%"></div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">Mais 250 XP para o próximo nível!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Award className="mr-3 h-7 w-7 text-accent" />
              Conquistas Recentes
            </CardTitle>
            <CardDescription>
              Seus últimos feitos e medalhas conquistadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder para grid de badges de conquista */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { title: "Primeiro Relatório", icon: ShieldHalf, color: "text-green-500" },
                { title: "Observador Atento", icon: Eye, color: "text-blue-500" },
                { title: "Mestre dos EPIs", icon: ShieldCheck, color: "text-yellow-500" },
                { title: "Participativo", icon: Users, color: "text-purple-500" },
                { title: "Semana Perfeita", icon: Star, color: "text-red-500" },
                { title: "Guardião da Frota", icon: Car, color: "text-teal-500" }
              ].map(achievement => (
                <div key={achievement.title} className="flex flex-col items-center p-3 border rounded-lg bg-muted/50 text-center">
                  <achievement.icon className={`h-8 w-8 mb-2 ${achievement.color}`} />
                  <p className="text-xs font-medium">{achievement.title}</p>
                  {/* Placeholder para animação de desbloqueio */}
                </div>
              ))}
            </div>
             <p className="text-xs text-muted-foreground text-center mt-3">Mais conquistas serão desbloqueadas ao interagir com o sistema!</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BarChartHorizontalBig className="mr-3 h-7 w-7 text-primary" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Veja sua posição em relação aos outros usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder para leaderboard com abas (semanal/mensal) */}
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Um leaderboard com abas (Semanal/Mensal) será exibido aqui, destacando o usuário atual na lista.
              A lista mostrará ranking, nome do usuário, XP total e talvez a última conquista.
            </p>
            <div className="mt-4 h-40 bg-muted rounded flex items-center justify-center">
              <p className="text-muted-foreground italic">Visualização do Leaderboard (Placeholder)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Adicionando alguns ícones que podem ser úteis para conquistas, se não estiverem já importados.
// Import Eye, ShieldCheck, Users, Car from lucide-react
import { Eye, ShieldCheck, Users, Car } from 'lucide-react';
