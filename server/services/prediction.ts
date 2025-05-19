import { SalesHistory, Prediction } from "@shared/schema";
import { storage } from "../storage";
import { RandomForestRegressor } from "./random-forest";

// Create a singleton instance of the Random Forest model
const randomForest = new RandomForestRegressor();

/**
 * Predicts demand for an item based on sales history and category
 * Uses a Random Forest Regressor model trained on historical data
 * 
 * @param salesHistory - Array of sales history records
 * @param category - Category of the item
 * @returns Predicted demand value
 */
export async function predictDemand(
  salesHistory: SalesHistory[],
  category: string
): Promise<number> {
  try {
    // Train the model only if it is not already trained
    if (!randomForest.isTrained && salesHistory.length >= 4) {
      await randomForest.train(salesHistory, category);
    }
    
    // Make prediction
    return await randomForest.predict(salesHistory, category);
  } catch (error) {
    console.error('Error in prediction:', error);
    
    // Fallback to simple average if prediction fails
    if (salesHistory.length > 0) {
      const avgSales = salesHistory.reduce((sum, record) => sum + record.quantity, 0) / salesHistory.length;
      return Math.max(1, Math.round(avgSales));
    }
    
    // If no sales history, use category defaults
    const categoryThresholds = await storage.getCategoryThresholdByCategory(category);
    if (categoryThresholds) {
      return categoryThresholds.defaultThreshold;
    }
    
    // Default fallback
    return 10;
  }
}

/**
 * Returns a seasonal adjustment factor based on month and category
 */
function getSeasonalFactor(month: number, category: string): number {
  // Different categories have different seasonal patterns
  switch (category) {
    case 'Living Room':
      // Higher demand in holiday season (Nov-Dec)
      return month >= 10 ? 1.3 : 1.0;
    case 'Bedroom':
      // Higher demand in back-to-school season (Jul-Sep)
      return (month >= 6 && month <= 8) ? 1.2 : 1.0;
    case 'Dining Room':
      // Higher demand during holiday season
      return month >= 10 ? 1.4 : 1.0;
    case 'Office':
      // More consistent demand
      return 1.0;
    default:
      return 1.0;
  }
}

/**
 * Creates a new prediction for an item
 */
export async function createPrediction(
  itemId: number,
  userId: string,
  category: string
): Promise<Prediction> {
  // Get sales history for the item
  const salesHistory = await storage.getSalesHistoryByItemId(itemId, userId);
  
  // Predict demand
  const predictedQuantity = await predictDemand(salesHistory, category);
  
  // Create prediction record
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30); // Predict for 30 days ahead
  
  return storage.createPrediction({
    itemId,
    userId,
    predictedQuantity,
    targetDate
  });
}

/**
 * Updates a prediction with actual sales data
 */
export async function updatePredictionWithActual(
  predictionId: number,
  actualQuantity: number
): Promise<Prediction | undefined> {
  return storage.updatePrediction(predictionId, actualQuantity);
}

/**
 * Gets prediction accuracy metrics for an item
 */
export async function getPredictionAccuracy(
  itemId: number,
  userId: string
): Promise<{ mae: number; rmse: number; mape: number; accuracy: number } | null> {
  const predictions = await storage.getPredictionsByItemId(itemId, userId);
  const metrics = await storage.calculatePredictionMetrics(predictions);
  
  if (!metrics) {
    return null;
  }
  
  // Log the performance metrics
  console.log('Prediction Performance Metrics:', metrics);
  
  return {
    ...metrics,
    accuracy: 100 - metrics.mape // Convert MAPE to accuracy percentage
  };
}
