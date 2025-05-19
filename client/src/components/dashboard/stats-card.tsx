import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
          <div className={`${iconColor}`}>{icon}</div>
        </div>
        <p className="text-3xl font-semibold text-gray-800 dark:text-white mt-2">
          {value}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}
