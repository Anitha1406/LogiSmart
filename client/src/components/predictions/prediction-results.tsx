import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/use-inventory";
import { InventoryItemType } from "@/lib/utils";
import { Package } from "lucide-react";

export function PredictionResults() {
  const { items } = useInventory();
  const hasInventoryData = items.length > 0;
  
  const lowStockItems = items
    .filter(item => item.status === "danger")
    .sort((a, b) => (b.reorderPoint - b.quantity) - (a.reorderPoint - a.quantity))
    .slice(0, 4);

  const warningItems = items
    .filter(item => item.status === "warning")
    .sort((a, b) => (b.reorderPoint - b.quantity) - (a.reorderPoint - a.quantity))
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Prediction Results</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {hasInventoryData ? (
          <div className="space-y-6">
            {/* Low Stock Items */}
            <div>
              <h3 className="text-sm font-medium mb-3">Low Stock Items</h3>
              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-red-500 dark:text-red-400" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-red-500 dark:text-red-400">
                          <span className="font-medium">{item.reorderPoint - item.quantity}</span> units needed
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Items */}
            <div>
              <h3 className="text-sm font-medium mb-3">Warning Items</h3>
              <div className="space-y-2">
                {warningItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-yellow-500 dark:text-yellow-400">
                          <span className="font-medium">{item.reorderPoint - item.quantity}</span> units needed
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Prediction Data</h3>
            <p className="text-muted-foreground mt-2">
              Add items to your inventory to see prediction results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
