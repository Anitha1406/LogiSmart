import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  LineChart,
  Settings,
  LogOut,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onCloseSidebar: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
    href: "/",
  },
  {
    label: "Inventory",
    icon: <Package className="mr-3 h-5 w-5" />,
    href: "/inventory",
  },
  {
    label: "Analytics",
    icon: <BarChart3 className="mr-3 h-5 w-5" />,
    href: "/analytics",
  },
  {
    label: "Predictions",
    icon: <LineChart className="mr-3 h-5 w-5" />,
    href: "/predictions",
  },
  {
    label: "Settings",
    icon: <Settings className="mr-3 h-5 w-5" />,
    href: "/settings",
  },
];

export function Sidebar({ isMobile, isOpen, onCloseSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen && isMobile,
        }
      )}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Layers className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-gray-800 dark:text-white">LogiSmart</span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>
      <nav className="px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onCloseSidebar : undefined}
              className={cn(
                "flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                {
                  "bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400":
                    location === item.href || 
                    (item.href === "/" && location === ""),
                }
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Separator className="my-6" />
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
