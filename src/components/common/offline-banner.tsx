'use client';
import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
        setIsOffline(!window.navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  const handleSync = () => {
    // Placeholder for manual sync logic
    alert('Sync Now clicked - Placeholder for sync functionality.'); // i18n: offline.syncAlert
  };

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-md z-50 shadow-lg rounded-lg">
      <WifiOff className="h-5 w-5" />
      <AlertTitle className="font-semibold">{/* i18n: offline.title */}You're Offline</AlertTitle>
      <AlertDescription className="text-sm">
        {/* i18n: offline.message */}
        Showing cached data. Some features may be limited.
        <Button onClick={handleSync} size="sm" variant="outline" className="ml-4 mt-2 sm:mt-0">
          <RefreshCw className="mr-2 h-4 w-4" />
          {/* i18n: offline.syncButton */}
          Sync Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
