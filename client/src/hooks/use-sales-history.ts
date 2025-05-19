import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SalesHistory {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  salePrice: number;
  totalValue: number;
  saleDate: Date;
  userId: string;
  createdAt: Date;
}

export function useSalesHistory() {
  const { user } = useAuth();
  const [salesHistory, setSalesHistory] = useState<SalesHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSalesHistory() {
      if (!user) {
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        const salesRef = collection(db, "salesHistory");
        const q = query(salesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const sales = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            saleDate: data.saleDate.toDate(),
            createdAt: data.createdAt.toDate()
          } as SalesHistory;
        });

        setSalesHistory(sales);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch sales history"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesHistory();
  }, [user]);

  return { salesHistory, isLoading, error };
} 