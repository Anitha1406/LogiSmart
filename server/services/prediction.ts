import { SalesHistory } from "@shared/schema";
import { storage } from "../storage";

/**
 * Predicts demand for an item based on sales history and category
 * Uses a simplified approach that simulates a Random Forest Regressor
 * 
 * @param salesHistory - Array of sales history records for the item
 * @param category - Category of the item
 * @returns Predicted demand value
 */
export async function predictDemand(
  salesHistory: SalesHistory[],
  category: string
): Promise<number> {
  // If we have enough sales history, use it for prediction
  if (salesHistory.length >= 3) {
    // Calculate average of recent sales
    const totalSales = salesHistory.reduce((sum, record) => sum + record.quantity, 0);
    const avgSales = Math.round(totalSales / salesHistory.length);
    
    // Add some variability to simulate a more complex model
    const volatility = 0.2; // 20% variability
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    
    // Apply seasonal adjustment (simplified)
    const currentMonth = new Date().getMonth();
    const seasonalFactor = getSeasonalFactor(currentMonth, category);
    
    // Calculate final prediction
    return Math.max(1, Math.round(avgSales * randomFactor * seasonalFactor));
  } 
  
  // If not enough sales history, use category defaults
  const categoryThresholds = await storage.getCategoryThresholdByCategory(category);
  
  if (categoryThresholds) {
    return categoryThresholds.defaultThreshold;
  }
  
  // Default fallback
  return 10;
}

/**
 * Returns a seasonal adjustment factor based on month and category
 */
function getSeasonalFactor(month: number, category: string): number {
  // Different categories have different seasonal patterns
  // This is a simplified implementation
  switch (category) {
    case 'Electronics':
      // Higher demand in holiday season (Nov-Dec)
      return month >= 10 ? 1.3 : 1.0;
    case 'Office Supplies':
      // Higher demand in back-to-school season (Jul-Sep)
      return (month >= 6 && month <= 8) ? 1.2 : 1.0;
    case 'Furniture':
      // More consistent demand
      return 1.0;
    default:
      return 1.0;
  }
}
