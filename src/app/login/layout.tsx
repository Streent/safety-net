
import type { ReactNode } from 'react';

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // Ensure dark theme is applied and use a very dark background
    // The 'dark' class on html and bg-background should handle this based on globals.css
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 dark animate-fadeInLayout">
      {children}
    </div>
  );
}

// Added animate-fadeInLayout to globals.css for a subtle page load animation
