import { useState } from "react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddItemForm } from "@/components/inventory/add-item-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInventory } from "@/hooks/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isLoading } = useInventory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <InventoryTable />
      )}

      <AddItemForm open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
