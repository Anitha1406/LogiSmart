import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { getStatusBadgeColor, Status, type InventoryItemType } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryTable() {
  const { items, isLoading, deleteItem } = useInventory();
  const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);

  console.log('Inventory items:', items);

  const handleDelete = async () => {
    if (itemToDelete !== null) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Unit",
      accessorKey: "unit",
    },
    {
      header: "Threshold",
      accessorKey: "reorderPoint",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: InventoryItemType) => {
        const status = row.status as Status;
        const statusText = 
          status === 'normal' ? 'Healthy' : 
          status === 'warning' ? 'Warning' : 
          'Low Stock';
        
        const badgeClass = getStatusBadgeColor(status);
        
        return (
          <Badge variant="outline" className={badgeClass}>
            {statusText}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: InventoryItemType) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4 text-primary" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setItemToDelete(row.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {row.name} from your inventory.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ] as {
    header: string;
    accessorKey: keyof InventoryItemType;
    cell?: (row: InventoryItemType) => React.ReactNode;
  }[];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] relative">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">No items in your inventory</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Get started by adding your first inventory item.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      data={items}
      columns={columns}
      searchKey="name"
      filterKey="category"
      filterOptions={Array.from(new Set(items.map(item => item.category)))}
    />
  );
}
