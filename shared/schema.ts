import { pgTable, text, serial, integer, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Book Categories Enum
export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Reference",
  "Periodicals",
  "Other"
] as const;

// Book Status Enum
export const BOOK_STATUS = [
  "Available",
  "Checked Out",
  "Reserved",
  "Processing",
  "Lost",
  "Damaged"
] as const;

// Transaction Type Enum
export const TRANSACTION_TYPES = [
  "Checkout",
  "Return",
  "New Book",
  "New Patron",
  "Overdue"
] as const;

// Books Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  isbn: text("isbn").notNull().unique(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher").notNull(),
  publicationDate: text("publication_date").notNull(),
  category: text("category").$type<typeof BOOK_CATEGORIES[number]>().notNull(),
  description: text("description"),
  status: text("status").$type<typeof BOOK_STATUS[number]>().notNull().default("Available"),
  addedDate: timestamp("added_date").defaultNow(),
  timesCheckedOut: integer("times_checked_out").default(0),
  lastBorrowed: date("last_borrowed")
});

// Patrons Table
export const patrons = pgTable("patrons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactInfo: text("contact_info").notNull(),
  membershipStatus: text("membership_status").notNull().default("Active"),
  registeredDate: timestamp("registered_date").defaultNow()
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  patronId: integer("patron_id"),
  transactionType: text("transaction_type").$type<typeof TRANSACTION_TYPES[number]>().notNull(),
  checkoutDate: date("checkout_date"),
  dueDate: date("due_date"),
  returnDate: date("return_date"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("staff"),
});

// Create insert schemas
export const insertBookSchema = createInsertSchema(books)
  .omit({ id: true, addedDate: true, timesCheckedOut: true, lastBorrowed: true });

export const insertPatronSchema = createInsertSchema(patrons)
  .omit({ id: true, registeredDate: true });

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, timestamp: true });

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true });

// Create types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Patron = typeof patrons.$inferSelect;
export type InsertPatron = z.infer<typeof insertPatronSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
