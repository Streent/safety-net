
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';

export default function FleetPage() {
  return (
    <>
      <PageHeader 
        title="Fleet Management" // i18n: fleet.title
        description="Oversee vehicle requests, checklists, and fuel logs." // i18n: fleet.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="mr-2 h-6 w-6 text-primary" />
            {/* i18n: fleet.contentTitle */}
            Vehicle Dashboard
          </CardTitle>
          <CardDescription>
            {/* i18n: fleet.contentDescription */}
            This is the placeholder page for Fleet Management. Content coming soon!
            Refer to the wireframe for vehicle cards, request forms, and logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: fleet.placeholderText */}
            Vehicle listings, request forms, checklist functionality, and fuel logging will be implemented here.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
