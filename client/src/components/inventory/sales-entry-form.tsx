import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useInventory } from "@/hooks/use-inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { InventoryItemType } from "@/lib/utils";
import { collection, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Schema for sales data entry
const salesFormSchema = z.object({
  itemId: z.string().min(1, {
    message: "Please select an item.",
  }),
  quantity: z.coerce.number().int().positive({
    message: "Quantity must be a positive number.",
  }),
  saleDate: z.string().min(1, {
    message: "Please select a date.",
  }),
  salePrice: z.coerce.number().min(0, {
    message: "Sale price must be a positive number.",
  }),
});

type SalesFormValues = z.infer<typeof salesFormSchema>;

interface SalesEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalesEntryForm({ open, onOpenChange }: SalesEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, updateItem } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      saleDate: new Date().toISOString().split('T')[0],
      salePrice: 0,
    },
  });

  // Update sale price when item is selected
  const onItemChange = (itemId: string) => {
    const selectedItem = items.find(item => item.id.toString() === itemId);
    if (selectedItem) {
      form.setValue("salePrice", selectedItem.price);
    }
  };

  const onSubmit = async (values: SalesFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to record sales.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected item
      const selectedItem = items.find(item => item.id.toString() === values.itemId);
      
      if (!selectedItem) {
        throw new Error("Selected item not found");
      }

      // Check if quantity is available
      if (selectedItem.stock < values.quantity) {
        toast({
          title: "Error",
          description: "Cannot sell more than available stock.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Add sales record to Firebase
      const salesRef = collection(db, "salesHistory");
      await addDoc(salesRef, {
        itemId: values.itemId,
        itemName: selectedItem.name,
        category: selectedItem.category,
        quantity: values.quantity,
        salePrice: values.salePrice,
        totalValue: values.quantity * values.salePrice,
        saleDate: new Date(values.saleDate),
        userId: user.uid,
        createdAt: Timestamp.now(),
      });

      // Update item stock
      const newStock = selectedItem.stock - values.quantity;
      await updateItem(selectedItem.id, {
        stock: newStock,
        // Recalculate status as stock changed
        status: selectedItem.stock < selectedItem.threshold ? "danger" : 
                newStock < selectedItem.demand ? "warning" : "normal",
      });

      toast({
        title: "Success",
        description: `Sale of ${values.quantity} ${selectedItem.name} has been recorded.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record sale.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            Record a sale to update inventory and improve demand predictions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onItemChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.length === 0 ? (
                        <SelectItem value="no-items" disabled>
                          No items available
                        </SelectItem>
                      ) : (
                        items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} ({item.stock} in stock)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Sold</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Sale
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}