import { 
  users, 
  type User, 
  type InsertUser, 
  type InventoryItem, 
  type InsertInventoryItem,
  type SalesHistory,
  type InsertSalesHistory,
  type CategoryThreshold,
  type InsertCategoryThreshold
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private salesHistory: Map<number, SalesHistory>;
  private categoryThresholds: Map<number, CategoryThreshold>;
  private currentUserId: number;
  private currentItemId: number;
  private currentSalesId: number;
  private currentThresholdId: number;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.salesHistory = new Map();
    this.categoryThresholds = new Map();
    this.currentUserId = 1;
    this.currentItemId = 1;
    this.currentSalesId = 1;
    this.currentThresholdId = 1;
    
    // Initialize with default categories
    this.createCategoryThreshold({ category: 'Electronics', defaultThreshold: 5 });
    this.createCategoryThreshold({ category: 'Office Supplies', defaultThreshold: 10 });
    this.createCategoryThreshold({ category: 'Furniture', defaultThreshold: 3 });
    this.createCategoryThreshold({ category: 'Kitchen', defaultThreshold: 8 });
    this.createCategoryThreshold({ category: 'Tools', defaultThreshold: 5 });
    this.createCategoryThreshold({ category: 'Other', defaultThreshold: 5 });
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
    // This is here for compatibility but not used with Firebase auth
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
      demand: item.demand || null,
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
}

export const storage = new MemStorage();
