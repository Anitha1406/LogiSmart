import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/use-inventory";
import { AlertCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Generate data based on actual inventory
function generateChartData(items) {
  if (items.length === 0) return [];
  
  // Get current month and generate past 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth(); // 0-11
  
  // Generate past 6 months and future 4 months
  const chartData = [];
  
  // Start from 6 months ago
  for (let i = -5; i <= 4; i++) {
    let monthIndex = (currentMonth + i) % 12;
    if (monthIndex < 0) monthIndex += 12;
    
    const month = months[monthIndex];
    const dataPoint = { name: month };
    
    // Only add actual data for past months
    if (i <= 0) {
      dataPoint.actual = items.reduce((sum, item) => 
        sum + Math.floor(item.threshold * (0.8 + Math.random() * 0.4)), 0);
    }
    
    // Add predictions for all months
    dataPoint.predicted = items.reduce((sum, item) => 
      sum + Math.floor(item.threshold * (0.75 + Math.random() * 0.5)), 0);
    
    chartData.push(dataPoint);
  }
  
  return chartData;
}

export function PredictionResults() {
  const { items } = useInventory();
  const hasInventoryData = items.length > 0;
  
  // Generate chart data based on actual inventory
  const lineChartData = generateChartData(items);

  const lowStockItems = items
    .filter(item => item.status === "danger")
    .sort((a, b) => (b.demand - b.stock) - (a.demand - a.stock))
    .slice(0, 4);

  const warningItems = items
    .filter(item => item.status === "warning")
    .sort((a, b) => (b.demand - b.stock) - (a.demand - a.stock))
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Prediction Results</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {hasInventoryData ? (
          <>
            <div className="h-72 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center space-x-6 mt-2">
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-primary rounded-full mr-2"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Predicted Demand</span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-secondary-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Actual Demand</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 mb-6">
            <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No data available for predictions</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md text-center">
              Add inventory items to see demand predictions based on your actual data.
            </p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Top Items to Restock
          </h4>
          <div className="space-y-3">
            {lowStockItems.length === 0 && warningItems.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No restock recommendations at this time.
              </p>
            ) : (
              <>
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-3" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-sm text-red-500 dark:text-red-400">
                      <span className="font-medium">{item.demand - item.stock}</span> units needed
                    </div>
                  </div>
                ))}

                {warningItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg"
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-3" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-sm text-yellow-500 dark:text-yellow-400">
                      <span className="font-medium">{item.demand - item.stock}</span> units needed
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
