import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/use-inventory";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

export function AlertsSection() {
  const { items } = useInventory();

  const lowStockItems = items.filter((item) => item.status === "danger");
  const warningItems = items.filter((item) => item.status === "warning");

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {lowStockItems.length === 0 && warningItems.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-secondary-500 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No alerts at this time. All inventory levels are healthy.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current stock:{" "}
                      <span className="font-medium text-red-500">{item.quantity}</span> (below
                      threshold of {item.reorderPoint})
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {warningItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current stock:{" "}
                      <span className="font-medium text-yellow-500">{item.quantity}</span> (approaching
                      threshold of {item.reorderPoint})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
