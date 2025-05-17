import Link from 'next/link';
import { Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GamificationSummary() {
  // Placeholder data
  const currentXP = 750;
  const nextLevelXP = 1000;
  const currentLevel = 5;
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  return (
    <Card className="mt-8 shadow-md sticky bottom-0 md:bottom-4 bg-card/90 backdrop-blur-sm border-t md:border rounded-none md:rounded-lg">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">
                {/* i18n: gamification.xpProgress */}
                XP: {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()}
              </p>
              <Badge variant="secondary" className="flex items-center">
                <Award className="h-3.5 w-3.5 mr-1" />
                {/* i18n: gamification.level */}
                Level {currentLevel}
              </Badge>
            </div>
            <Progress value={progressPercentage} aria-label={`${progressPercentage}% to next level`} className="h-3"/>
          </div>
          <Link href="/gamification" passHref>
            <Button variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              {/* i18n: gamification.viewLeaderboard */}
              View Leaderboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
