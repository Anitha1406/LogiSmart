import * as tf from '@tensorflow/tfjs';
import { SalesHistory } from '@shared/schema';

export class RandomForestRegressor {
  private model: tf.Sequential | null = null;
  private isModelTrained: boolean = false;

  constructor() {
    this.initializeModel();
  }

  public get isTrained(): boolean {
    return this.isModelTrained;
  }

  private initializeModel() {
    // Create a sequential model
    this.model = tf.sequential();
    
    // Add layers
    this.model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [5] // [month, dayOfWeek, isHoliday, previousSales, category]
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    this.model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  private preprocessData(salesHistory: SalesHistory[], category: string) {
    return salesHistory.map((sale, index) => {
      const date = sale.date ? new Date(sale.date) : new Date();
      const month = date.getMonth() / 11; // Normalize to 0-1
      const dayOfWeek = date.getDay() / 6; // Normalize to 0-1
      const isHoliday = this.isHoliday(date) ? 1 : 0;
      
      // Get previous 3 sales quantities, pad with 0 if not available
      const previousSales = [
        index > 0 ? salesHistory[index - 1].quantity : 0,
        index > 1 ? salesHistory[index - 2].quantity : 0,
        index > 2 ? salesHistory[index - 3].quantity : 0
      ];

      // Convert category to numeric value
      const categoryValue = this.getCategoryValue(category);

      return {
        month,
        dayOfWeek,
        isHoliday,
        previousSales,
        category: categoryValue
      };
    });
  }

  private isHoliday(date: Date): boolean {
    // Simple holiday check - you can enhance this with a proper holiday calendar
    const month = date.getMonth();
    const day = date.getDate();
    
    // Example holidays (US)
    return (
      (month === 0 && day === 1) || // New Year's Day
      (month === 11 && day === 25) || // Christmas
      (month === 6 && day === 4) // Independence Day
    );
  }

  private getCategoryValue(category: string): number {
    // Convert category string to numeric value
    const categories = ['Living Room', 'Bedroom', 'Dining Room', 'Office'];
    return categories.indexOf(category) / (categories.length - 1);
  }

  public async train(salesHistory: SalesHistory[], category: string): Promise<void> {
    if (salesHistory.length < 4) {
      throw new Error('Insufficient data for training. Need at least 4 sales records.');
    }

    const features = this.preprocessData(salesHistory, category);
    const labels = salesHistory.slice(3).map(sale => sale.quantity);

    // Slice features to match labels length
    const slicedFeatures = features.slice(3);

    // Convert to tensors
    const xs = tf.tensor2d(slicedFeatures.map(f => [
      f.month,
      f.dayOfWeek,
      f.isHoliday,
      f.previousSales[0],
      f.category
    ]));
    const ys = tf.tensor2d(labels.map(l => [l]));

    // Train the model
    await this.model!.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs?: tf.Logs) => {
          if (logs) {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
          }
        }
      }
    });

    this.isModelTrained = true;

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  public async predict(salesHistory: SalesHistory[], category: string): Promise<number> {
    if (!this.isModelTrained) {
      throw new Error('Model needs to be trained before making predictions');
    }

    if (salesHistory.length < 3) {
      // Fallback to simple average if not enough data
      const avgSales = salesHistory.reduce((sum, record) => sum + record.quantity, 0) / salesHistory.length;
      return Math.max(1, Math.round(avgSales));
    }

    const features = this.preprocessData(salesHistory, category);
    const lastFeature = features[features.length - 1];

    // Convert to tensor
    const input = tf.tensor2d([[
      lastFeature.month,
      lastFeature.dayOfWeek,
      lastFeature.isHoliday,
      lastFeature.previousSales[0],
      lastFeature.category
    ]]);

    // Make prediction
    const prediction = this.model!.predict(input) as tf.Tensor;
    const result = await prediction.data();
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();

    // Ensure prediction is at least 1
    return Math.max(1, Math.round(result[0]));
  }

  public async evaluate(salesHistory: SalesHistory[], category: string): Promise<{
    mae: number;
    rmse: number;
    mape: number;
  }> {
    if (!this.isModelTrained) {
      throw new Error('Model needs to be trained before evaluation');
    }

    const features = this.preprocessData(salesHistory, category);
    const actualValues = salesHistory.slice(3).map(sale => sale.quantity);
    const slicedFeatures = features.slice(3);
    
    const predictions: number[] = [];
    for (const feature of slicedFeatures) {
      const input = tf.tensor2d([[
        feature.month,
        feature.dayOfWeek,
        feature.isHoliday,
        feature.previousSales[0],
        feature.category
      ]]);
      
      const prediction = this.model!.predict(input) as tf.Tensor;
      const result = await prediction.data();
      predictions.push(Math.max(1, Math.round(result[0])));
      
      input.dispose();
      prediction.dispose();
    }

    // Calculate metrics
    const mae = this.calculateMAE(predictions, actualValues);
    const rmse = this.calculateRMSE(predictions, actualValues);
    const mape = this.calculateMAPE(predictions, actualValues);

    return { mae, rmse, mape };
  }

  private calculateMAE(predictions: number[], actuals: number[]): number {
    return predictions.reduce((sum, pred, i) => 
      sum + Math.abs(pred - actuals[i]), 0) / predictions.length;
  }

  private calculateRMSE(predictions: number[], actuals: number[]): number {
    return Math.sqrt(predictions.reduce((sum, pred, i) => 
      sum + Math.pow(pred - actuals[i], 2), 0) / predictions.length);
  }

  private calculateMAPE(predictions: number[], actuals: number[]): number {
    return predictions.reduce((sum, pred, i) => {
      if (actuals[i] === 0) return sum;
      return sum + Math.abs((actuals[i] - pred) / actuals[i]);
    }, 0) * 100 / predictions.length;
  }
} 