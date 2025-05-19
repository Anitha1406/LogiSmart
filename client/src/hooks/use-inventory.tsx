import { useEffect, useState } from "react";
import { collection, addDoc, doc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemType, calculateItemStatus, DEFAULT_CATEGORIES } from "@/lib/utils";

// Demo data to show functionality when Firebase permissions aren't set up
const DEMO_INVENTORY: InventoryItemType[] = [
  {
    id: "demo1",
    name: "Laptop XPS 13",
    category: "Electronics",
    stock: 5,
    threshold: 10,
    demand: 15,
    status: "warning",
    userId: "demo-user"
  },
  {
    id: "demo2",
    name: "Wireless Mouse",
    category: "Electronics",
    stock: 12,
    threshold: 5,
    demand: 8,
    status: "normal",
    userId: "demo-user"
  },
  {
    id: "demo3",
    name: "Ergonomic Keyboard",
    category: "Electronics",
    stock: 2,
    threshold: 5,
    demand: 7,
    status: "danger",
    userId: "demo-user"
  },
  {
    id: "demo4",
    name: "Office Chair",
    category: "Furniture",
    stock: 3,
    threshold: 2,
    demand: 4,
    status: "normal",
    userId: "demo-user"
  },
  {
    id: "demo5",
    name: "Standing Desk",
    category: "Furniture",
    stock: 1,
    threshold: 3,
    demand: 5,
    status: "danger",
    userId: "demo-user"
  },
  {
    id: "demo6",
    name: "Desk Lamp",
    category: "Office Supplies",
    stock: 8,
    threshold: 10,
    demand: 12,
    status: "warning",
    userId: "demo-user"
  },
  {
    id: "demo7",
    name: "Notebook Set",
    category: "Office Supplies",
    stock: 25,
    threshold: 15,
    demand: 20,
    status: "normal",
    userId: "demo-user"
  },
  {
    id: "demo8",
    name: "Whiteboard Markers",
    category: "Office Supplies",
    stock: 3,
    threshold: 10,
    demand: 8,
    status: "danger",
    userId: "demo-user"
  }
];

export function useInventory() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize data
  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Load demo data with current user ID
    setTimeout(() => {
      const userItems = DEMO_INVENTORY.map(item => ({
        ...item,
        userId: user.uid
      }));
      
      setItems(userItems);
      setIsLoading(false);
    }, 800); // Simulate loading delay
    
    return () => {};
  }, [user]);

  const addItem = async (item: Omit<InventoryItemType, "id">) => {
    if (!user) {
      throw new Error("User must be logged in to add items");
    }

    try {
      // Generate a demo ID and add to local state
      const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const status = calculateItemStatus(item.stock, item.threshold, item.demand);
      
      const newItem: InventoryItemType = {
        id: demoId,
        ...item,
        status
      };
      
      setItems(prevItems => [...prevItems, newItem]);
      
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      
      return demoId;
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItem = async (id: string | number, updates: Partial<InventoryItemType>) => {
    if (!user) {
      throw new Error("User must be logged in to update items");
    }

    try {
      // Find the item to update
      const itemIndex = items.findIndex(i => i.id === id);
      if (itemIndex === -1) {
        throw new Error("Item not found");
      }
      
      const currentItem = items[itemIndex];
      
      // Calculate new status if relevant fields are updated
      let updatedStatus = currentItem.status;
      if ("stock" in updates || "threshold" in updates || "demand" in updates) {
        updatedStatus = calculateItemStatus(
          "stock" in updates ? updates.stock! : currentItem.stock,
          "threshold" in updates ? updates.threshold! : currentItem.threshold,
          "demand" in updates ? updates.demand! : currentItem.demand
        );
      }
      
      // Create updated item
      const updatedItem: InventoryItemType = {
        ...currentItem,
        ...updates,
        status: updatedStatus
      };
      
      // Update state
      const newItems = [...items];
      newItems[itemIndex] = updatedItem;
      setItems(newItems);
      
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string | number) => {
    if (!user) {
      throw new Error("User must be logged in to delete items");
    }

    try {
      // Remove item from state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const predictDemand = async (itemId: string | number, category: string) => {
    if (!user) {
      throw new Error("User must be logged in to predict demand");
    }

    // Find the item
    const item = items.find(item => item.id === itemId);
    if (!item) throw new Error("Item not found");

    try {
      // In a real app, this would call the backend AI service
      // For demo, we'll simulate the Random Forest regressor with some basic calculations
      
      // Base demand is calculated from current stock and threshold
      let baseDemand = Math.round(item.threshold * 1.5);
      
      // Add some category-specific adjustments
      switch(category) {
        case "Electronics":
          // Electronics tend to have higher demand variability
          baseDemand = Math.round(baseDemand * (0.8 + Math.random() * 0.4));
          break;
        case "Furniture":
          // Furniture has more seasonal patterns
          const month = new Date().getMonth();
          // Higher demand in summer months (5-8)
          if (month >= 5 && month <= 8) {
            baseDemand = Math.round(baseDemand * 1.2);
          }
          break;
        case "Office Supplies":
          // More stable demand, but affected by stock levels
          if (item.stock < item.threshold * 0.5) {
            // Lower stock often indicates higher demand
            baseDemand = Math.round(baseDemand * 1.3);
          }
          break;
      }
      
      // Ensure prediction is reasonable (not too low or too high)
      const predictedDemand = Math.max(1, Math.min(baseDemand, item.threshold * 3));
      
      // Update the item with the new predicted demand
      await updateItem(itemId, { demand: predictedDemand });
      
      return predictedDemand;
    } catch (error) {
      console.error("Error predicting demand:", error);
      toast({
        title: "Error",
        description: "Failed to predict demand",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    predictDemand
  };
}