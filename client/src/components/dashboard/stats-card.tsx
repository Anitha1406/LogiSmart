import { Card, CardContent } from "@/components/ui/card";
import { ReactNode, useState, useEffect } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconColor?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  iconColor = "text-primary",
  variant
}: StatsCardProps) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    // Add a small delay for a staggered animation effect
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Determine card class based on variant
  const cardClass = variant ? 
    `stat-card-${variant} hover-card` : 
    'hover-card bg-white dark:bg-gray-800';
  
  // Text colors based on if we're using a colored variant background
  const titleClass = variant ? 'text-white/80' : 'text-gray-500 dark:text-gray-400';
  const valueClass = variant ? 'text-white' : 'text-gray-800 dark:text-white';
  const descClass = variant ? 'text-white/70' : 'text-gray-500 dark:text-gray-400';
  
  return (
    <Card className={`${cardClass} ${animated ? 'animate-chart' : 'opacity-0'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className={`${titleClass} text-sm font-medium`}>{title}</h3>
          <div className={variant ? 'text-white' : iconColor}>
            {icon}
          </div>
        </div>
        <p className={`${valueClass} text-3xl font-semibold mt-2 transition-all duration-500`}>
          {value}
        </p>
        <p className={`${descClass} text-sm mt-2`}>{description}</p>
      </CardContent>
    </Card>
  );
}
