import type { Metadata, Viewport } from 'next'; // Import Viewport
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SafetyNet',
  description: 'Safety Solutions Platform by Firebase Studio',
  manifest: '/manifest.json', // For PWA
  icons: { apple: '/icon.png' }, // For PWA
};

// Add the viewport export
export const viewport: Viewport = {
  themeColor: '#63B5A5', // Add themeColor here
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><ThemeProvider
          defaultTheme="light"
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
