import { BOOK_CATEGORIES, BOOK_STATUS, TRANSACTION_TYPES } from "@shared/schema";
import { type Book, type Patron, type Transaction, type User } from "@shared/schema";

export interface DashboardMetrics {
  totalBooks: number;
  booksCheckedOut: number;
  activePatrons: number;
  overdueBooks: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface RecentActivity extends Transaction {
  book?: Book;
  patron?: Patron;
}

export interface OverdueBook {
  book: Book;
  patron: Patron;
  dueDate: Date;
  daysLate: number;
}

export interface CirculationFormData {
  bookId: number;
  patronId: number;
  dueDate: string;
  notes?: string;
}

export interface AppContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export type BookCategoryType = typeof BOOK_CATEGORIES[number];
export type BookStatusType = typeof BOOK_STATUS[number];
export type TransactionType = typeof TRANSACTION_TYPES[number];
