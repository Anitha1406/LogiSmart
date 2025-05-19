import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc, Timestamp, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemType, calculateItemStatus } from "@/lib/utils";

export function useInventory() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setItems([]);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Set up the query for the user's inventory items
      const inventoryRef = collection(db, "inventoryItems");
      const q = query(inventoryRef, where("userId", "==", user.uid));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const inventoryItems: InventoryItemType[] = [];
          const uniqueCategories = new Set<string>();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Raw data from database:', data); // Debug log
            inventoryItems.push({
              id: doc.id,
              name: data.name,
              category: data.category,
              quantity: data.quantity,
              reorderPoint: data.reorderPoint,
              unit: data.unit,
              status: data.status,
              userId: data.userId,
              createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
            });
            uniqueCategories.add(data.category);
          });
          
          console.log('Processed inventory items:', inventoryItems); // Debug log
          setItems(inventoryItems);
          setCategories(Array.from(uniqueCategories));
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching inventory items:", error);
          setItems([]);
          setCategories([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up inventory listener:", error);
      setItems([]);
      setCategories([]);
      setIsLoading(false);
      return () => {};
    }
  }, [user, toast]);

  const addItem = async (item: Omit<InventoryItemType, "id">) => {
    if (!user) {
      throw new Error("User must be logged in to add items");
    }

    try {
      console.log('Adding item to database:', item); // Debug log
      const docRef = await addDoc(collection(db, "inventoryItems"), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('Item added with ID:', docRef.id); // Debug log
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
      console.log('Updating item in database:', { id, updates }); // Debug log
      const itemRef = doc(db, "inventoryItems", id.toString());
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        // Recalculate status if quantity or reorderPoint changed
        ...(("quantity" in updates || "reorderPoint" in updates) 
          ? { 
              status: calculateItemStatus(
                "quantity" in updates ? updates.quantity! : items.find(i => i.id === id)!.quantity,
                "reorderPoint" in updates ? updates.reorderPoint! : items.find(i => i.id === id)!.reorderPoint
              ) 
            } 
          : {})
      });
      console.log('Item updated successfully'); // Debug log
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
    const predictedDemand = Math.round(item.reorderPoint * 1.2);
    
    // Update the item with the new predicted demand
    await updateItem(itemId, { reorderPoint: predictedDemand });
    
    return predictedDemand;
  };

  return {
    items,
    categories,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    predictDemand
  };
}
