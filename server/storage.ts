import {
  Book, InsertBook, books,
  Patron, InsertPatron, patrons,
  Transaction, InsertTransaction, transactions,
  User, InsertUser, users, BOOK_STATUS
} from "@shared/schema";

export interface IStorage {
  // Books
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getBookByISBN(isbn: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  getBooksByCategory(category: string): Promise<Book[]>;
  getBooksByStatus(status: string): Promise<Book[]>;
  
  // Patrons
  getAllPatrons(): Promise<Patron[]>;
  getPatron(id: number): Promise<Patron | undefined>;
  createPatron(patron: InsertPatron): Promise<Patron>;
  updatePatron(id: number, patron: Partial<Patron>): Promise<Patron | undefined>;
  deletePatron(id: number): Promise<boolean>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getRecentTransactions(limit: number): Promise<Transaction[]>;
  getTransactionsByPatron(patronId: number): Promise<Transaction[]>;
  getTransactionsByBook(bookId: number): Promise<Transaction[]>;
  getOverdueTransactions(): Promise<Transaction[]>;
  
  // Dashboard Metrics
  getDashboardMetrics(): Promise<{
    totalBooks: number;
    booksCheckedOut: number;
    activePatrons: number;
    overdueBooks: number;
  }>;
  
  // Category Statistics
  getBookCategoryStats(): Promise<{ category: string; count: number }[]>;

  // Users 
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private books: Map<number, Book>;
  private patrons: Map<number, Patron>;
  private transactions: Map<number, Transaction>;
  private users: Map<number, User>;
  private currentBookId: number;
  private currentPatronId: number;
  private currentTransactionId: number;
  private currentUserId: number;

  constructor() {
    this.books = new Map();
    this.patrons = new Map();
    this.transactions = new Map();
    this.users = new Map();
    this.currentBookId = 1;
    this.currentPatronId = 1;
    this.currentTransactionId = 1;
    this.currentUserId = 1;
    
    // Add a default admin user
    this.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
      name: "Administrator",
      role: "admin"
    });
    
    // Add a default library staff user
    this.createUser({
      username: "staff",
      password: "password", // In a real app, this would be hashed
      name: "John Doe",
      role: "staff"
    });

    // Add some sample books
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample books
    const sampleBooks: InsertBook[] = [
      {
        isbn: "9780743273565",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        publisher: "Scribner",
        publicationDate: "1925",
        category: "Fiction",
        description: "Set in the Jazz Age on Long Island, this novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
        status: "Available"
      },
      {
        isbn: "9780061120084",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        publisher: "HarperCollins",
        publicationDate: "1960",
        category: "Fiction",
        description: "The story of young Scout Finch and her father, attorney Atticus Finch, who defends a Black man accused of raping a white woman in the American South.",
        status: "Available"
      },
      {
        isbn: "9781501173219",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        publisher: "Celadon Books",
        publicationDate: "2019",
        category: "Fiction",
        description: "A psychological thriller about a woman who shoots her husband and then never speaks another word.",
        status: "Available"
      },
      {
        isbn: "9780451524935",
        title: "1984",
        author: "George Orwell",
        publisher: "Signet Classics",
        publicationDate: "1949",
        category: "Fiction",
        description: "A dystopian novel set in a totalitarian society ruled by the Party, which has total control over every aspect of people's lives.",
        status: "Checked Out"
      },
      {
        isbn: "9780062315007",
        title: "The Alchemist",
        author: "Paulo Coelho",
        publisher: "HarperOne",
        publicationDate: "1988",
        category: "Fiction",
        description: "A philosophical novel about a young Andalusian shepherd who dreams of finding a worldly treasure.",
        status: "Checked Out"
      },
      {
        isbn: "9780399590504",
        title: "Educated",
        author: "Tara Westover",
        publisher: "Random House",
        publicationDate: "2018",
        category: "Non-Fiction",
        description: "A memoir about a woman who leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
        status: "Checked Out"
      },
      {
        isbn: "9780062316097",
        title: "Sapiens",
        author: "Yuval Noah Harari",
        publisher: "Harper",
        publicationDate: "2015",
        category: "Non-Fiction",
        description: "A brief history of humankind, exploring the evolution of humans from the Stone Age to the 21st century.",
        status: "Checked Out"
      }
    ];

    for (const book of sampleBooks) {
      this.createBook(book);
    }

    // Add sample patrons
    const samplePatrons: InsertPatron[] = [
      {
        name: "Maria Santos",
        contactInfo: "maria.santos@example.com",
        membershipStatus: "Active"
      },
      {
        name: "James Wilson",
        contactInfo: "james.wilson@example.com",
        membershipStatus: "Active"
      },
      {
        name: "Ana Reyes",
        contactInfo: "ana.reyes@example.com",
        membershipStatus: "Active"
      },
      {
        name: "Emily Johnson",
        contactInfo: "emily.johnson@example.com",
        membershipStatus: "Active"
      },
      {
        name: "Michael Brown",
        contactInfo: "michael.brown@example.com",
        membershipStatus: "Active"
      },
      {
        name: "David Lee",
        contactInfo: "david.lee@example.com",
        membershipStatus: "Active"
      },
      {
        name: "Robert Chen",
        contactInfo: "robert.chen@example.com",
        membershipStatus: "Active"
      }
    ];

    for (const patron of samplePatrons) {
      this.createPatron(patron);
    }

    // Create sample transactions
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const dueDatePast = new Date();
    dueDatePast.setDate(today.getDate() - 8);
    
    const dueDatePast2 = new Date();
    dueDatePast2.setDate(today.getDate() - 5);
    
    const dueDatePast3 = new Date();
    dueDatePast3.setDate(today.getDate() - 3);

    const sampleTransactions: InsertTransaction[] = [
      {
        bookId: 1,
        patronId: 1,
        transactionType: "Checkout",
        checkoutDate: today,
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        bookId: 2,
        patronId: 2,
        transactionType: "Return",
        checkoutDate: yesterday,
        returnDate: today,
      },
      {
        bookId: 3,
        transactionType: "New Book",
      },
      {
        patronId: 7,
        transactionType: "New Patron",
      },
      {
        bookId: 4,
        patronId: 3,
        transactionType: "Overdue",
        checkoutDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        bookId: 5,
        patronId: 4,
        transactionType: "Checkout",
        checkoutDate: new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000),
        dueDate: dueDatePast,
      },
      {
        bookId: 6,
        patronId: 5,
        transactionType: "Checkout",
        checkoutDate: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000),
        dueDate: dueDatePast2,
      },
      {
        bookId: 7,
        patronId: 6,
        transactionType: "Checkout",
        checkoutDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        dueDate: dueDatePast3,
      }
    ];

    for (const transaction of sampleTransactions) {
      this.createTransaction(transaction);
    }
  }

  // Book Methods
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(book => book.isbn === isbn);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = { ...insertBook, id, addedDate: new Date(), timesCheckedOut: 0 };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const existingBook = this.books.get(id);
    if (!existingBook) return undefined;
    
    const updatedBook = { ...existingBook, ...bookUpdate };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.category === category);
  }

  async getBooksByStatus(status: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.status === status);
  }

  // Patron Methods
  async getAllPatrons(): Promise<Patron[]> {
    return Array.from(this.patrons.values());
  }

  async getPatron(id: number): Promise<Patron | undefined> {
    return this.patrons.get(id);
  }

  async createPatron(insertPatron: InsertPatron): Promise<Patron> {
    const id = this.currentPatronId++;
    const patron: Patron = { ...insertPatron, id, registeredDate: new Date() };
    this.patrons.set(id, patron);
    
    // Create a new patron transaction
    this.createTransaction({
      patronId: id,
      transactionType: "New Patron"
    });
    
    return patron;
  }

  async updatePatron(id: number, patronUpdate: Partial<Patron>): Promise<Patron | undefined> {
    const existingPatron = this.patrons.get(id);
    if (!existingPatron) return undefined;
    
    const updatedPatron = { ...existingPatron, ...patronUpdate };
    this.patrons.set(id, updatedPatron);
    return updatedPatron;
  }

  async deletePatron(id: number): Promise<boolean> {
    return this.patrons.delete(id);
  }

  // Transaction Methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      timestamp: new Date() 
    };
    this.transactions.set(id, transaction);
    
    // Update book status if it's a checkout or return
    if (transaction.bookId) {
      const book = await this.getBook(transaction.bookId);
      if (book) {
        let bookUpdate: Partial<Book> = {};
        
        if (transaction.transactionType === "Checkout") {
          bookUpdate = { 
            status: "Checked Out", 
            timesCheckedOut: (book.timesCheckedOut || 0) + 1,
            lastBorrowed: transaction.checkoutDate
          };
        } else if (transaction.transactionType === "Return") {
          bookUpdate = { status: "Available" };
        }
        
        await this.updateBook(transaction.bookId, bookUpdate);
      }
    }
    
    return transaction;
  }

  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    
    return allTransactions.slice(0, limit);
  }

  async getTransactionsByPatron(patronId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.patronId === patronId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getTransactionsByBook(bookId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.bookId === bookId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getOverdueTransactions(): Promise<Transaction[]> {
    const today = new Date();
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.transactionType === "Checkout" && 
        transaction.dueDate && 
        !transaction.returnDate &&
        new Date(transaction.dueDate) < today
      )
      .sort((a, b) => 
        (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)
      );
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<{
    totalBooks: number;
    booksCheckedOut: number;
    activePatrons: number;
    overdueBooks: number;
  }> {
    const allBooks = await this.getAllBooks();
    const allPatrons = await this.getAllPatrons();
    const overdueTransactions = await this.getOverdueTransactions();
    
    return {
      totalBooks: allBooks.length,
      booksCheckedOut: allBooks.filter(book => book.status === "Checked Out").length,
      activePatrons: allPatrons.filter(patron => patron.membershipStatus === "Active").length,
      overdueBooks: overdueTransactions.length
    };
  }

  // Category Statistics
  async getBookCategoryStats(): Promise<{ category: string; count: number }[]> {
    const allBooks = await this.getAllBooks();
    const categoryMap = new Map<string, number>();
    
    for (const book of allBooks) {
      const current = categoryMap.get(book.category) || 0;
      categoryMap.set(book.category, current + 1);
    }
    
    return Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
