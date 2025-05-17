
'use client';
import type { LucideIcon } from 'lucide-react';
import { FileText, ShieldCheck, AlertTriangle, BarChart3, Archive, AlertCircle, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Map string names to actual icon components
const iconMap = {
  FileText,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Archive, // Added
  AlertCircle, // Added
  CalendarClock, // Added
};

interface StatCardProps {
  title: string;
  value: number;
  iconName: keyof typeof iconMap;
  subtitle?: string;
  className?: string;
  iconColor?: string;
}

export function StatCard({ title, value, iconName, subtitle, className, iconColor }: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const step = value / 50; // Animate in 50 steps
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setAnimatedValue(value);
        clearInterval(interval);
      } else {
        setAnimatedValue(Math.ceil(current));
      }
    }, 20); // Adjust interval for speed

    return () => clearInterval(interval);
  }, [value]);
  
  const IconComponent = iconMap[iconName];

  if (!IconComponent) {
    console.error(`Invalid iconName provided to StatCard: ${iconName}`);
    return null; 
  }

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <IconComponent className={cn("h-5 w-5 text-muted-foreground", iconColor)} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-3xl font-bold text-foreground">{animatedValue.toLocaleString()}</div>
        {subtitle && <p className="text-xs text-muted-foreground pt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
