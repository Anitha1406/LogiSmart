import { ChartCard } from "@/components/analytics/chart-card";
import { useInventory } from "@/hooks/use-inventory";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { items, isLoading } = useInventory();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const categoryData = items.reduce((acc, item) => {
    const existingCategory = acc.find(c => c.name === item.category);
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const stockByCategoryData = [];
  const categoryGroups = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  for (const [category, categoryItems] of Object.entries(categoryGroups)) {
    const totalStock = categoryItems.reduce((sum, item) => sum + item.stock, 0);
    stockByCategoryData.push({ name: category, value: totalStock });
  }

  // Inventory over time data (mock)
  const inventoryTrendsData = [
    { name: 'Jan', Electronics: 42, 'Office Supplies': 50 },
    { name: 'Feb', Electronics: 45, 'Office Supplies': 48 },
    { name: 'Mar', Electronics: 38, 'Office Supplies': 52 },
    { name: 'Apr', Electronics: 40, 'Office Supplies': 47 },
    { name: 'May', Electronics: 35, 'Office Supplies': 45 },
    { name: 'Jun', Electronics: 30, 'Office Supplies': 40 },
  ];

  // Calculate stock status percentages
  const totalItems = items.length || 1; // Avoid division by zero
  const normalItems = items.filter(item => item.status === "normal").length;
  const warningItems = items.filter(item => item.status === "warning").length;
  const dangerItems = items.filter(item => item.status === "danger").length;

  const normalPercentage = (normalItems / totalItems) * 100;
  const warningPercentage = (warningItems / totalItems) * 100;
  const dangerPercentage = (dangerItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Inventory Levels Over Time"
            type="line"
            data={inventoryTrendsData}
            height={300}
          />
        </div>
        <ChartCard
          title="Category Distribution"
          type="pie"
          data={categoryData}
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Stock Levels by Category"
          type="bar"
          data={stockByCategoryData}
          height={300}
        />

        <ChartCard
          title="Stock Health Summary"
          type="custom"
          data={[]}
          height={300}
        >
          <div className="space-y-6 p-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Healthy Stock</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {normalItems}/{totalItems}
                </span>
              </div>
              <Progress value={normalPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
                <div className="bg-green-500 h-2.5 rounded-full"></div>
              </Progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Warning Level</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {warningItems}/{totalItems}
                </span>
              </div>
              <Progress value={warningPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
                <div className="bg-yellow-500 h-2.5 rounded-full"></div>
              </Progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dangerItems}/{totalItems}
                </span>
              </div>
              <Progress value={dangerPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
                <div className="bg-red-500 h-2.5 rounded-full"></div>
              </Progress>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Product Status Distribution</h4>
              <div className="flex items-center justify-center">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="60" fill="transparent" stroke="#E5E7EB" strokeWidth="20" />
                  <circle 
                    cx="75" 
                    cy="75" 
                    r="60" 
                    fill="transparent" 
                    stroke="#10B981" 
                    strokeWidth="20" 
                    strokeDasharray={`${normalPercentage * 3.77} 376.8`} 
                    transform="rotate(-90 75 75)" 
                  />
                  <circle 
                    cx="75" 
                    cy="75" 
                    r="60" 
                    fill="transparent" 
                    stroke="#F59E0B" 
                    strokeWidth="20" 
                    strokeDasharray={`${warningPercentage * 3.77} 376.8`} 
                    transform={`rotate(${normalPercentage * 3.6 - 90} 75 75)`} 
                  />
                  <circle 
                    cx="75" 
                    cy="75" 
                    r="60" 
                    fill="transparent" 
                    stroke="#EF4444" 
                    strokeWidth="20" 
                    strokeDasharray={`${dangerPercentage * 3.77} 376.8`} 
                    transform={`rotate(${(normalPercentage + warningPercentage) * 3.6 - 90} 75 75)`} 
                  />
                  <text x="75" y="75" textAnchor="middle" dy="8" className="fill-current text-gray-700 dark:text-gray-300 text-lg font-medium">
                    100%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
