import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Status = 'normal' | 'warning' | 'danger';

export type InventoryItemType = {
  id: number | string;
  name: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  unit: string;
  status: Status;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryCount = {
  category: string;
  count: number;
};

export function calculateItemStatus(quantity: number, reorderPoint: number): Status {
  if (quantity <= reorderPoint) {
    return 'danger';
  } else if (quantity <= reorderPoint * 1.5) {
    return 'warning';
  } else {
    return 'normal';
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function getStatusBadgeColor(status: Status) {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'danger':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}
