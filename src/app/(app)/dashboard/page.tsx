import { BarChart3, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCharts } from '@/components/dashboard/charts/overview-charts';
import { OfflineBanner } from '@/components/common/offline-banner';
import { GamificationSummary } from '@/components/dashboard/gamification-summary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder for Reports List
function RecentReportsListPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{/* i18n: dashboard.recentReportsTitle */}Recent Reports</CardTitle>
        <CardDescription>{/* i18n: dashboard.recentReportsDesc */}Latest incidents and safety observations.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Placeholder for Alerts List
function AlertsListPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{/* i18n: dashboard.alertsTitle */}Active Alerts</CardTitle>
        <CardDescription>{/* i18n: dashboard.alertsDesc */}Unread notifications and critical alerts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 border rounded-md bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive"> {/* i18n: dashboard.alertItemTitle */}High Priority Alert {i + 1}</p>
                  <p className="text-xs text-muted-foreground">{/* i18n: dashboard.alertItemDesc */}Details about the alert requiring attention.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs"> {/* i18n: dashboard.dismissAlertButton */}Dismiss</Button>
              </div>
            ))}
             <div className="text-center text-sm text-muted-foreground py-4">
              {/* i18n: dashboard.noNewAlerts */}
              No new alerts.
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" description="Welcome to SafetyNet. Here's your safety overview." /> {/* i18n: dashboard.title, dashboard.description */}
      
      <div className="flex-grow overflow-y-auto pb-4"> {/* Added for scrollability of content */}
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Reports This Month" value={125} icon={FileText} subtitle="+15 since last month" iconColor="text-blue-500" /> {/* i18n: dashboard.statReports */}
          <StatCard title="Scheduled Trainings" value={8} icon={ShieldCheck} subtitle="2 upcoming this week" iconColor="text-green-500" /> {/* i18n: dashboard.statTrainings */}
          <StatCard title="EPIs Low Stock" value={3} icon={AlertTriangle} subtitle="Order new masks" iconColor="text-yellow-500" /> {/* i18n: dashboard.statEPIs */}
          <StatCard title="Incidents (30 Days)" value={22} icon={BarChart3} subtitle="-5 since last month" iconColor="text-red-500" /> {/* i18n: dashboard.statIncidents */}
        </div>

        {/* Charts and Lists Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="overview">{/* i18n: dashboard.tabOverview */}Overview</TabsTrigger>
            <TabsTrigger value="reports">{/* i18n: dashboard.tabReports */}Reports</TabsTrigger>
            <TabsTrigger value="alerts">{/* i18n: dashboard.tabAlerts */}Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <OverviewCharts />
          </TabsContent>
          <TabsContent value="reports">
            <RecentReportsListPlaceholder />
          </TabsContent>
          <TabsContent value="alerts">
            <AlertsListPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
      
      <OfflineBanner />
      <div className="mt-auto"> {/* Pushes GamificationSummary to the bottom */}
        <GamificationSummary />
      </div>
    </div>
  );
}
