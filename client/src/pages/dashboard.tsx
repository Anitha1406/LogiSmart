import { StatsCard } from "@/components/dashboard/stats-card";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CategorySummary } from "@/components/dashboard/category-summary";
import { useInventory } from "@/hooks/use-inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Archive, 
  AlertTriangle, 
  BarChart2, 
  DollarSign,
  Package,
  ShoppingCart,
  Layers,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { items, isLoading } = useInventory();

  // Calculate dashboard stats
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.status === "danger").length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get unique categories count (or 0 for new users)
  const uniqueCategories = items.length > 0 ? 
    Array.from(new Set(items.map(item => item.category))).length : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 wave-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inventory Items"
          value={totalItems}
          description={`Across ${uniqueCategories} categories`}
          icon={<Archive className="h-5 w-5" />}
          variant="primary"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockItems}
          description="Items below threshold"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          title="Total Stock Quantity"
          value={totalStock}
          description="Units in inventory"
          icon={<Package className="h-5 w-5" />}
          variant="info"
        />
        <StatsCard
          title="Total Categories"
          value={uniqueCategories}
          description="Unique product categories"
          icon={<Layers className="h-5 w-5" />}
          variant="success"
        />
      </div>

      <AlertsSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <CategorySummary />
      </div>
    </div>
  );
}
