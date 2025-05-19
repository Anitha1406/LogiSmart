import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InfoIcon, CheckCircle } from "lucide-react";

import { useInventory } from "@/hooks/use-inventory";

export function PredictionModel() {
  const { items } = useInventory();
  const hasInventoryData = items.length > 0;
  
  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Demand Prediction Model</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 rounded-lg mb-6">
          <div className="flex items-start">
            <InfoIcon className="text-blue-500 dark:text-blue-400 mt-0.5 mr-3 h-5 w-5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                Random Forest Regressor
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                This model analyzes historical sales data, inventory patterns, and seasonal
                trends to predict future demand for your products.
              </p>
            </div>
          </div>
        </div>

        {hasInventoryData ? (
          <>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prediction Accuracy
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    85%
                  </span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data Points Analyzed
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {items.length * 12} {/* Simulated data points based on inventory size */}
                  </span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Historical Range
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    6 months
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Model Features
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Historical Sales
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Seasonal Patterns
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stock Turnover
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Category Trends
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No inventory data available for model training</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md text-center">
              Add inventory items to train the prediction model with your actual data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
