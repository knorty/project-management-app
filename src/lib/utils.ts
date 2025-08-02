import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatProjectStatus(status: string): string {
  switch (status) {
    case 'ON_HOLD':
      return 'On Hold'
    case 'ACTIVE':
      return 'Active'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'ARCHIVED':
      return 'Archived'
    default:
      return status
  }
}
