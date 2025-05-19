import { 
  users, 
  type User, 
  type InsertUser, 
  type InventoryItem, 
  type InsertInventoryItem,
  type SalesHistory,
  type InsertSalesHistory,
  type CategoryThreshold,
  type InsertCategoryThreshold,
  type Prediction,
  type InsertPrediction
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory management
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemsByUserId(userId: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Sales history
  getSalesHistoryByItemId(itemId: number, userId: string): Promise<SalesHistory[]>;
  getSalesHistoryByUserId(userId: string): Promise<SalesHistory[]>;
  createSalesHistory(salesData: InsertSalesHistory): Promise<SalesHistory>;
  
  // Category thresholds
  getAllCategoryThresholds(): Promise<CategoryThreshold[]>;
  getCategoryThresholdByCategory(category: string): Promise<CategoryThreshold | undefined>;
  createCategoryThreshold(threshold: InsertCategoryThreshold): Promise<CategoryThreshold>;

  // Prediction methods
  getPredictionsByItemId(itemId: number, userId: string): Promise<Prediction[]>;
  getPredictionsByUserId(userId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, actualQuantity: number): Promise<Prediction | undefined>;
  calculatePredictionMetrics(predictions: Prediction[]): Promise<{ mae: number; rmse: number; mape: number } | null>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private salesHistory: Map<number, SalesHistory>;
  private categoryThresholds: Map<number, CategoryThreshold>;
  private predictions: Map<number, Prediction>;
  private currentUserId: number;
  private currentItemId: number;
  private currentSalesId: number;
  private currentThresholdId: number;
  private currentPredictionId: number;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.salesHistory = new Map();
    this.categoryThresholds = new Map();
    this.predictions = new Map();
    this.currentUserId = 1;
    this.currentItemId = 1;
    this.currentSalesId = 1;
    this.currentThresholdId = 1;
    this.currentPredictionId = 1;
    
    // Initialize with default categories
    this.createCategoryThreshold({ category: 'Living Room', defaultThreshold: 5 });
    this.createCategoryThreshold({ category: 'Bedroom', defaultThreshold: 10 });
    this.createCategoryThreshold({ category: 'Dining Room', defaultThreshold: 3 });
    this.createCategoryThreshold({ category: 'Office', defaultThreshold: 8 });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.uid === uid,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, displayName: insertUser.displayName || null };
    this.users.set(id, user);
    return user;
  }

  // Inventory management methods
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async getInventoryItemsByUserId(userId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentItemId++;
    const now = new Date();
    const inventoryItem: InventoryItem = { 
      ...item, 
      id,
      notes: item.notes ?? null,
      demand: item.demand ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.inventoryItems.set(id, inventoryItem);
    return inventoryItem;
  }

  async updateInventoryItem(id: number, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: InventoryItem = { 
      ...item, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  // Sales history methods
  async getSalesHistoryByItemId(itemId: number, userId: string): Promise<SalesHistory[]> {
    return Array.from(this.salesHistory.values()).filter(
      (record) => record.itemId === itemId && record.userId === userId
    );
  }

  async getSalesHistoryByUserId(userId: string): Promise<SalesHistory[]> {
    return Array.from(this.salesHistory.values()).filter(
      (record) => record.userId === userId
    );
  }

  async createSalesHistory(salesData: InsertSalesHistory): Promise<SalesHistory> {
    const id = this.currentSalesId++;
    const salesRecord: SalesHistory = { 
      ...salesData, 
      id, 
      date: salesData.date || new Date()
    };
    this.salesHistory.set(id, salesRecord);
    return salesRecord;
  }

  // Category threshold methods
  async getAllCategoryThresholds(): Promise<CategoryThreshold[]> {
    return Array.from(this.categoryThresholds.values());
  }

  async getCategoryThresholdByCategory(category: string): Promise<CategoryThreshold | undefined> {
    return Array.from(this.categoryThresholds.values()).find(
      (threshold) => threshold.category === category
    );
  }

  async createCategoryThreshold(threshold: InsertCategoryThreshold): Promise<CategoryThreshold> {
    const id = this.currentThresholdId++;
    const categoryThreshold: CategoryThreshold = { 
      ...threshold, 
      id 
    };
    this.categoryThresholds.set(id, categoryThreshold);
    return categoryThreshold;
  }

  // Prediction methods
  async getPredictionsByItemId(itemId: number, userId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.itemId === itemId && prediction.userId === userId
    );
  }

  async getPredictionsByUserId(userId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.userId === userId
    );
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const now = new Date();
    const newPrediction: Prediction = {
      ...prediction,
      id,
      predictionDate: now,
      actualQuantity: null,
      accuracy: null,
      mae: null,
      rmse: null,
      mape: null,
      createdAt: now,
      updatedAt: now
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  async updatePrediction(id: number, actualQuantity: number): Promise<Prediction | undefined> {
    const prediction = this.predictions.get(id);
    if (!prediction) return undefined;

    const updatedPrediction: Prediction = {
      ...prediction,
      actualQuantity,
      updatedAt: new Date()
    };

    // Calculate accuracy metrics
    const metrics = await this.calculatePredictionMetrics([updatedPrediction]);
    if (metrics) {
      updatedPrediction.mae = metrics.mae;
      updatedPrediction.rmse = metrics.rmse;
      updatedPrediction.mape = metrics.mape;
      updatedPrediction.accuracy = 100 - metrics.mape; // Convert MAPE to accuracy percentage
    } else {
      // If no metrics available, set all to null
      updatedPrediction.mae = null;
      updatedPrediction.rmse = null;
      updatedPrediction.mape = null;
      updatedPrediction.accuracy = null;
    }

    this.predictions.set(id, updatedPrediction);
    return updatedPrediction;
  }

  async calculatePredictionMetrics(predictions: Prediction[]): Promise<{ mae: number; rmse: number; mape: number } | null> {
    const validPredictions = predictions.filter(p => p.actualQuantity !== null);
    if (validPredictions.length === 0) {
      return null; // Return null instead of zeros when no data
    }

    // Calculate Mean Absolute Error (MAE)
    const mae = validPredictions.reduce((sum, p) => 
      sum + Math.abs((p.actualQuantity || 0) - p.predictedQuantity), 0) / validPredictions.length;

    // Calculate Root Mean Square Error (RMSE)
    const rmse = Math.sqrt(validPredictions.reduce((sum, p) => 
      sum + Math.pow((p.actualQuantity || 0) - p.predictedQuantity, 2), 0) / validPredictions.length);

    // Calculate Mean Absolute Percentage Error (MAPE)
    const mape = validPredictions.reduce((sum, p) => {
      const actual = p.actualQuantity || 0;
      if (actual === 0) return sum;
      return sum + Math.abs((actual - p.predictedQuantity) / actual);
    }, 0) * 100 / validPredictions.length;

    return { mae, rmse, mape };
  }
}

export const storage = new MemStorage();
