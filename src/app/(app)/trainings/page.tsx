
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function TrainingsPage() {
  return (
    <>
      <PageHeader 
        title="Trainings" // i18n: trainings.title
        description="Manage and schedule safety trainings." // i18n: trainings.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            {/* i18n: trainings.contentTitle */}
            Training Schedule
          </CardTitle>
          <CardDescription>
            {/* i18n: trainings.contentDescription */}
            This is the placeholder page for Trainings. Content coming soon!
            Refer to the wireframe for calendar views and session details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: trainings.placeholderText */}
            Calendar view, session listings, check-in functionality, and certificate generation will be implemented here.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
