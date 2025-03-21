import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BookDetailModal } from "@/components/books/book-detail-modal";
import { BookAdminModal } from "@/components/books/book-admin-modal";
import { CheckoutModal } from "@/components/circulation/checkout-modal";
import { InteractiveBookshelf } from "@/components/books/interactive-bookshelf";
import { BOOK_CATEGORIES, BOOK_STATUS } from "@shared/schema";
import { Book } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  LayoutList, 
  Library, 
  QrCode 
} from "lucide-react";
import { BarcodeScannerModal } from "@/components/books/barcode-scanner-modal";
import { useToast } from "@/hooks/use-toast";

export default function Books() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "bookshelf">("bookshelf");
  
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });

  // Filter books based on search and filters
  const filteredBooks = books ? books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  // Handle book actions
  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  const handleAdminDetails = (book: Book) => {
    setSelectedBook(book);
    setIsAdminModalOpen(true);
  };

  const handleCheckout = (book: Book) => {
    setSelectedBook(book);
    setIsCheckoutModalOpen(true);
  };

  const handleScanResult = (barcode: string) => {
    // Close scanner
    setIsScannerModalOpen(false);
    
    // Set search term
    setSearchTerm(barcode);
    
    // Find book with this barcode/ISBN
    const foundBook = books?.find(b => b.isbn === barcode);
    
    if (foundBook) {
      // Show book details
      setSelectedBook(foundBook);
      setIsDetailModalOpen(true);
    } else {
      toast({
        title: "Book not found",
        description: `No book found with ISBN/barcode: ${barcode}`,
        variant: "destructive"
      });
    }
  };

  // Generate status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case "Checked Out":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{status}</Badge>;
      case "Reserved":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case "Processing":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{status}</Badge>;
      case "Lost":
      case "Damaged":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Books Catalog</h1>
          <p className="text-gray-500">Manage your library collection</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setIsScannerModalOpen(true)}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
          <Button 
            onClick={() => navigate("/add-book")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find books by title, author, or ISBN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search by title, author, or ISBN..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {BOOK_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "bookshelf" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none px-3"
                  onClick={() => setViewMode("bookshelf")}
                >
                  <Library className="h-4 w-4" />
                  <span className="sr-only">Bookshelf View</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none px-3"
                  onClick={() => setViewMode("table")}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">Table View</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Book collection view - either table or bookshelf */}
      {viewMode === "bookshelf" ? (
        <div className="mb-6">
          {isLoading ? (
            <Card className="p-6">
              <div className="h-48 flex items-center justify-center">
                <Skeleton className="h-36 w-full rounded-lg" />
              </div>
            </Card>
          ) : (
            <InteractiveBookshelf
              books={filteredBooks}
              onBookClick={handleViewDetails}
              onAdminClick={handleAdminDetails}
              isAdmin={true}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Book Inventory</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Loading books..." 
                : `${filteredBooks.length} book${filteredBooks.length !== 1 ? 's' : ''} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.isbn}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{getStatusBadge(book.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(book)}
                            >
                              Details
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdminDetails(book)}
                            >
                              Edit
                            </Button>
                            
                            {book.status === "Available" && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckout(book)}
                              >
                                Checkout
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No books found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modals */}
      <BookDetailModal 
        book={selectedBook}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      
      <BookAdminModal
        book={selectedBook}
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
      
      {selectedBook && (
        <CheckoutModal 
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          preselectedBookId={selectedBook.id}
        />
      )}
      
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
