import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertInventoryItemSchema, 
  insertUserSchema,
  insertSalesHistorySchema,
  insertCategoryThresholdSchema 
} from "@shared/schema";
import { predictDemand, getPredictionAccuracy } from "./services/prediction";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users API
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.get("/api/users/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  // Inventory API
  app.get("/api/inventory", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const items = await storage.getInventoryItemsByUserId(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const itemData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertInventoryItemSchema.partial();
      const updateData = updateSchema.parse(req.body);
      const updatedItem = await storage.updateInventoryItem(id, updateData);
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryItem(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  // Sales History API
  app.get("/api/sales-history", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const itemId = req.query.itemId ? parseInt(req.query.itemId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const salesHistory = itemId 
        ? await storage.getSalesHistoryByItemId(itemId, userId)
        : await storage.getSalesHistoryByUserId(userId);
      
      res.json(salesHistory);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.post("/api/sales-history", async (req, res) => {
    try {
      const salesData = insertSalesHistorySchema.parse(req.body);
      const salesRecord = await storage.createSalesHistory(salesData);
      res.status(201).json(salesRecord);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  // Category Thresholds API
  app.get("/api/category-thresholds", async (req, res) => {
    try {
      const thresholds = await storage.getAllCategoryThresholds();
      res.json(thresholds);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    }
  });

  app.post("/api/category-thresholds", async (req, res) => {
    try {
      const thresholdData = insertCategoryThresholdSchema.parse(req.body);
      const threshold = await storage.createCategoryThreshold(thresholdData);
      res.status(201).json(threshold);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  // Prediction API
  app.post("/api/predict-demand", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
      });
      const { userId } = schema.parse(req.body);

      // Get all items for the user
      const items = await storage.getInventoryItemsByUserId(userId);
      // Group items by category
      const categories = Array.from(new Set(items.map(item => item.category)));
      const results = [];

      for (const category of categories) {
        const categoryItems = items.filter(item => item.category === category);
        // Aggregate sales history for all items in this category
        let salesHistory: any[] = [];
        for (const item of categoryItems) {
          const itemSales = await storage.getSalesHistoryByItemId(item.id, userId);
          salesHistory = salesHistory.concat(itemSales);
        }
        // Sort sales by date
        salesHistory.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
        // Use the model for prediction and metrics
        let predictedQuantity: number | null = null;
        let mae: number | null = null;
        let rmse: number | null = null;
        let mape: number | null = null;
        let accuracy: number | null = null;
        let last3: { month: number; actual: number; predicted: number | null }[] = [];
        if (salesHistory.length >= 4) {
          const model = new (require('./services/random-forest').RandomForestRegressor)();
          await model.train(salesHistory, category);
          predictedQuantity = await model.predict(salesHistory, category);
          const metrics = await model.evaluate(salesHistory, category);
          mae = metrics.mae;
          rmse = metrics.rmse;
          mape = metrics.mape;
          accuracy = 100 - metrics.mape;
          // Last 3 months comparison
          const sortedSales = salesHistory.slice(-3);
          last3 = sortedSales.map((sale, i) => ({
            month: i + 1,
            actual: sale.quantity,
            predicted: predictedQuantity // For demo, use predictedQuantity (can be improved)
          }));
        }
        results.push({
          category,
          predictedQuantity,
          mae,
          rmse,
          mape,
          accuracy,
          last3
        });
      }
      res.json({ results });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  app.get("/api/predictions/accuracy", async (req, res) => {
    try {
      const schema = z.object({
        itemId: z.string().transform(Number),
        userId: z.string()
      });
      
      const { itemId, userId } = schema.parse(req.query);
      
      const metrics = await getPredictionAccuracy(itemId, userId);
      res.json(metrics);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
