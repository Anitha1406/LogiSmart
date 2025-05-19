import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks/use-inventory";
import { CategoryCount } from "@/lib/utils";
import { Folder } from "lucide-react";

export function CategorySummary() {
  const { items } = useInventory();

  const getCategoryCount = (): CategoryCount[] => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));
  };

  const categoryData = getCategoryCount();

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Categories</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {categoryData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No categories found. Add inventory items to see categories.
          </p>
        ) : (
          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Folder className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {cat.category}
                  </span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-sm">
                  {cat.count} {cat.count === 1 ? "item" : "items"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
