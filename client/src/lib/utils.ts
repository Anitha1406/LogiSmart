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
  stock: number;
  threshold: number;
  price: number;
  demand: number;
  status: Status;
  userId: string;
};

export type CategoryCount = {
  category: string;
  count: number;
};

export function calculateItemStatus(stock: number, threshold: number, demand: number): Status {
  if (stock <= threshold) {
    return 'danger';
  } else if (stock <= demand) {
    return 'warning';
  }
  return 'normal';
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

export const DEFAULT_CATEGORIES = [
  'Electronics',
  'Office Supplies',
  'Furniture',
  'Kitchen',
  'Tools',
  'Other'
];
