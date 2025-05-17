
import type { ReactNode } from 'react';

export default function ClientPortalLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 dark animate-fadeInLayout">
      {children}
    </div>
  );
}
