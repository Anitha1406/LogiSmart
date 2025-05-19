import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc, Timestamp, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemType, calculateItemStatus } from "@/lib/utils";

export function useInventory() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // For Firebase applications, we'll use a simpler approach
    // Since we're using the client directly for data operations
    try {
      // Set up the query for the user's inventory items
      const inventoryRef = collection(db, "inventoryItems");
      const q = query(inventoryRef, where("userId", "==", user.uid));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const inventoryItems: InventoryItemType[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            inventoryItems.push({
              id: doc.id,
              name: data.name,
              category: data.category,
              stock: data.stock,
              threshold: data.threshold,
              demand: data.demand || 0,
              status: data.status,
              userId: data.userId,
            });
          });
          setItems(inventoryItems);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching inventory items:", error);
          // If we get a permissions error, just show an empty list
          setItems([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up inventory listener:", error);
      setItems([]);
      setIsLoading(false);
      return () => {};
    }
  }, [user, toast]);

  const addItem = async (item: Omit<InventoryItemType, "id">) => {
    if (!user) {
      throw new Error("User must be logged in to add items");
    }

    try {
      await addDoc(collection(db, "inventoryItems"), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  const updateItem = async (id: string | number, updates: Partial<InventoryItemType>) => {
    if (!user) {
      throw new Error("User must be logged in to update items");
    }

    try {
      const itemRef = doc(db, "inventoryItems", id.toString());
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        // Recalculate status if stock, threshold or demand changed
        ...(("stock" in updates || "threshold" in updates || "demand" in updates) 
          ? { 
              status: calculateItemStatus(
                "stock" in updates ? updates.stock! : items.find(i => i.id === id)!.stock,
                "threshold" in updates ? updates.threshold! : items.find(i => i.id === id)!.threshold,
                "demand" in updates ? updates.demand! : items.find(i => i.id === id)!.demand
              ) 
            } 
          : {})
      });
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const deleteItem = async (id: string | number) => {
    if (!user) {
      throw new Error("User must be logged in to delete items");
    }

    try {
      const itemRef = doc(db, "inventoryItems", id.toString());
      await deleteDoc(itemRef);
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  const predictDemand = async (itemId: string | number, category: string) => {
    if (!user) {
      throw new Error("User must be logged in to predict demand");
    }

    // This would call the backend ML prediction service
    // For now, we'll use a simpler approach to simulate
    const item = items.find(item => item.id === itemId);
    if (!item) throw new Error("Item not found");

    // Simple prediction heuristic - in real app, this would call the ML model
    const predictedDemand = Math.round(item.threshold * 1.2);
    
    // Update the item with the new predicted demand
    await updateItem(itemId, { demand: predictedDemand });
    
    return predictedDemand;
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
