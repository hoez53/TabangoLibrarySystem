import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";

// Extend Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
  }
}

// Declare session on Request type
declare module "express" {
  interface Request {
    session: session.Session & Partial<session.SessionData>;
  }
}
import { storage } from "./storage";
import { z } from "zod";
import {
  insertBookSchema,
  insertPatronSchema,
  insertTransactionSchema,
  insertUserSchema,
  BOOK_CATEGORIES,
  BOOK_STATUS,
  TRANSACTION_TYPES
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Books routes
  apiRouter.get("/books", async (req: Request, res: Response) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  apiRouter.get("/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  apiRouter.post("/books", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      
      // Create "New Book" transaction
      await storage.createTransaction({
        bookId: book.id,
        transactionType: "New Book"
      });
      
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  apiRouter.put("/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingBook = await storage.getBook(id);
      
      if (!existingBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const updatedBook = await storage.updateBook(id, req.body);
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  apiRouter.delete("/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);
      
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Patrons routes
  apiRouter.get("/patrons", async (req: Request, res: Response) => {
    try {
      const patrons = await storage.getAllPatrons();
      res.json(patrons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patrons" });
    }
  });

  apiRouter.get("/patrons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patron = await storage.getPatron(id);
      
      if (!patron) {
        return res.status(404).json({ message: "Patron not found" });
      }
      
      res.json(patron);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patron" });
    }
  });

  apiRouter.post("/patrons", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPatronSchema.parse(req.body);
      const patron = await storage.createPatron(validatedData);
      res.status(201).json(patron);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create patron" });
    }
  });

  apiRouter.put("/patrons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existingPatron = await storage.getPatron(id);
      
      if (!existingPatron) {
        return res.status(404).json({ message: "Patron not found" });
      }
      
      const updatedPatron = await storage.updatePatron(id, req.body);
      res.json(updatedPatron);
    } catch (error) {
      res.status(500).json({ message: "Failed to update patron" });
    }
  });

  apiRouter.delete("/patrons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePatron(id);
      
      if (!success) {
        return res.status(404).json({ message: "Patron not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patron" });
    }
  });

  // Transactions routes
  apiRouter.get("/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  apiRouter.get("/transactions/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || "5");
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  apiRouter.get("/transactions/overdue", async (req: Request, res: Response) => {
    try {
      const overdueTransactions = await storage.getOverdueTransactions();
      res.json(overdueTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue transactions" });
    }
  });

  apiRouter.post("/transactions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Circulation routes
  apiRouter.post("/circulation/checkout", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        bookId: z.number(),
        patronId: z.number(),
        dueDate: z.string().transform(str => new Date(str)),
        notes: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if book exists and is available
      const book = await storage.getBook(validatedData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.status !== "Available") {
        return res.status(400).json({ message: "Book is not available for checkout" });
      }
      
      // Check if patron exists
      const patron = await storage.getPatron(validatedData.patronId);
      if (!patron) {
        return res.status(404).json({ message: "Patron not found" });
      }
      
      // Create checkout transaction
      const transaction = await storage.createTransaction({
        bookId: validatedData.bookId,
        patronId: validatedData.patronId,
        transactionType: "Checkout",
        checkoutDate: new Date(),
        dueDate: validatedData.dueDate,
        notes: validatedData.notes
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  apiRouter.post("/circulation/return", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        bookId: z.number(),
        notes: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if book exists and is checked out
      const book = await storage.getBook(validatedData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (book.status !== "Checked Out") {
        return res.status(400).json({ message: "Book is not checked out" });
      }
      
      // Find the checkout transaction for this book
      const bookTransactions = await storage.getTransactionsByBook(validatedData.bookId);
      const checkoutTransaction = bookTransactions.find(
        t => t.transactionType === "Checkout" && !t.returnDate
      );
      
      if (!checkoutTransaction) {
        return res.status(400).json({ message: "No active checkout found for this book" });
      }
      
      // Create return transaction
      const transaction = await storage.createTransaction({
        bookId: validatedData.bookId,
        patronId: checkoutTransaction.patronId,
        transactionType: "Return",
        checkoutDate: checkoutTransaction.checkoutDate,
        returnDate: new Date(),
        notes: validatedData.notes
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to process return" });
    }
  });

  // Dashboard metrics
  apiRouter.get("/dashboard/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Book category stats
  apiRouter.get("/dashboard/category-stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getBookCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category statistics" });
    }
  });

  // Reference data
  apiRouter.get("/reference/categories", (req: Request, res: Response) => {
    res.json(BOOK_CATEGORIES);
  });

  apiRouter.get("/reference/statuses", (req: Request, res: Response) => {
    res.json(BOOK_STATUS);
  });

  apiRouter.get("/reference/transaction-types", (req: Request, res: Response) => {
    res.json(TRANSACTION_TYPES);
  });

  // User/auth routes
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would compare hashed passwords
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create a session
      if (req.session) {
        req.session.userId = user.id;
        req.session.role = user.role;
      }
      
      // Return user info (except password)
      const { password: _, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "No active session" });
    }
  });

  apiRouter.get("/auth/me", async (req: Request, res: Response) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user info (except password)
      const { password: _, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
