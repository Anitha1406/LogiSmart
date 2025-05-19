import { PredictionModel } from "@/components/predictions/prediction-model";
import { PredictionResults } from "@/components/predictions/prediction-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Predictions() {
  const { items, isLoading } = useInventory();

  // Prepare forecast data for the table
  const categoryForecasts = [
    {
      category: "Electronics",
      currentStock: items.filter(item => item.category === "Electronics").reduce((sum, item) => sum + item.stock, 0),
      forecast30: 83,
      forecast90: 210,
      confidence: "High (92%)",
      confidenceLevel: "high"
    },
    {
      category: "Office Supplies",
      currentStock: items.filter(item => item.category === "Office Supplies").reduce((sum, item) => sum + item.stock, 0),
      forecast30: 65,
      forecast90: 145,
      confidence: "High (88%)",
      confidenceLevel: "high"
    },
    {
      category: "Furniture",
      currentStock: items.filter(item => item.category === "Furniture").reduce((sum, item) => sum + item.stock, 0),
      forecast30: 22,
      forecast90: 48,
      confidence: "Medium (76%)",
      confidenceLevel: "medium"
    },
    {
      category: "Other Categories",
      currentStock: items.filter(item => !["Electronics", "Office Supplies", "Furniture"].includes(item.category)).reduce((sum, item) => sum + item.stock, 0),
      forecast30: 18,
      forecast90: 40,
      confidence: "Medium (70%)",
      confidenceLevel: "medium"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictionModel />
        <PredictionResults />
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-medium">Demand Forecasts by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">30-Day Forecast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">90-Day Forecast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categoryForecasts.map((forecast, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{forecast.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{forecast.currentStock} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{forecast.forecast30} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{forecast.forecast90} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        forecast.confidenceLevel === "high" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }>
                        {forecast.confidence}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
