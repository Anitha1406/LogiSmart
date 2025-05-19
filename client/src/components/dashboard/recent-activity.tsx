import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, PlusCircle, LineChart, AlertCircle } from "lucide-react";

interface ActivityItem {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      icon: <UserPlus className="text-blue-500 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-500 dark:text-blue-400",
      title: "You logged in to the system",
      time: "Just now",
    },
    {
      icon: <PlusCircle className="text-green-500 dark:text-green-400" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500 dark:text-green-400",
      title: "Added 15 new Laptop Stand units",
      time: "2 hours ago",
    },
    {
      icon: <LineChart className="text-purple-500 dark:text-purple-400" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-500 dark:text-purple-400",
      title: "Updated demand prediction for Office Supplies",
      time: "Yesterday",
    },
    {
      icon: <AlertCircle className="text-red-500 dark:text-red-400" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-500 dark:text-red-400",
      title: "Low stock alert for Monitors",
      time: "2 days ago",
    },
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className={`p-2 rounded-full ${activity.iconBg}`}>
                {activity.icon}
              </div>
              <div className="ml-4">
                <p className="text-gray-800 dark:text-white font-medium">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
