import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  email: true,
  displayName: true,
});

// Inventory item model
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  reorderPoint: integer("reorder_point").notNull(),
  unit: text("unit").notNull(),
  location: text("location").notNull(),
  supplier: text("supplier").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
  demand: integer("demand"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  demand: z.number().nullable().optional()
});

// Sales history model for demand prediction
export const salesHistory = pgTable("sales_history", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  userId: text("user_id").notNull(),
  quantity: integer("quantity").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertSalesHistorySchema = createInsertSchema(salesHistory).omit({
  id: true,
});

// Category thresholds for default demand prediction
export const categoryThresholds = pgTable("category_thresholds", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().unique(),
  defaultThreshold: integer("default_threshold").notNull(),
});

export const insertCategoryThresholdSchema = createInsertSchema(categoryThresholds).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type SalesHistory = typeof salesHistory.$inferSelect;
export type InsertSalesHistory = z.infer<typeof insertSalesHistorySchema>;

export type CategoryThreshold = typeof categoryThresholds.$inferSelect;
export type InsertCategoryThreshold = z.infer<typeof insertCategoryThresholdSchema>;

export interface Prediction {
  id: number;
  itemId: number;
  userId: string;
  predictedQuantity: number;
  actualQuantity: number | null;
  predictionDate: Date;
  targetDate: Date;
  accuracy: number | null;
  mae: number | null;
  rmse: number | null;
  mape: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPrediction {
  itemId: number;
  userId: string;
  predictedQuantity: number;
  targetDate: Date;
}
