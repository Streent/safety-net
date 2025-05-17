
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Award, BarChartHorizontalBig } from 'lucide-react'; // Changed to BarChartHorizontalBig for Leaderboard

export default function GamificationPage() {
  return (
    <>
      <PageHeader 
        title="Gamification" // i18n: gamificationPage.title
        description="Track your XP, achievements, and see how you rank on the leaderboard." // i18n: gamificationPage.description
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gem className="mr-2 h-6 w-6 text-primary" />
              {/* i18n: gamificationPage.xpLevelTitle */}
              XP & Levels
            </CardTitle>
            <CardDescription>
              {/* i18n: gamificationPage.xpLevelDescription */}
              Your current progress and level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {/* i18n: gamificationPage.xpLevelPlaceholder */}
              XP bar animation and level badge will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-6 w-6 text-accent" />
              {/* i18n: gamificationPage.achievementsTitle */}
              Achievements
            </CardTitle>
            <CardDescription>
              {/* i18n: gamificationPage.achievementsDescription */}
              Badges you've earned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {/* i18n: gamificationPage.achievementsPlaceholder */}
              A grid of achievement badges with unlock animations will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChartHorizontalBig className="mr-2 h-6 w-6 text-primary" /> {/* Changed icon */}
            {/* i18n: gamificationPage.leaderboardTitle */}
            Leaderboard
          </CardTitle>
          <CardDescription>
            {/* i18n: gamificationPage.leaderboardDescription */}
            See how you rank against others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: gamificationPage.leaderboardPlaceholder */}
            Tabbed weekly/monthly leaderboard will be displayed here, highlighting the current user.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
