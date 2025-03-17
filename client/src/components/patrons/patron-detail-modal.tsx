import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Patron, Transaction, Book } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PatronDetailModalProps {
  patron: Patron | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatronDetailModal({ patron, isOpen, onClose }: PatronDetailModalProps) {
  // Get transactions for this patron
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: isOpen && !!patron,
  });

  // Get books for cross-referencing
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    enabled: isOpen && !!patron,
  });

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get patron's transactions
  const patronTransactions = transactions && patron
    ? transactions.filter(t => t.patronId === patron.id)
    : [];

  // Get active checkouts
  const activeCheckouts = transactions && books && patron
    ? transactions
        .filter(t => 
          t.patronId === patron.id && 
          t.transactionType === "Checkout" &&
          !transactions.some(rt => 
            rt.transactionType === "Return" && 
            rt.patronId === patron.id && 
            rt.bookId === t.bookId && 
            rt.checkoutDate === t.checkoutDate
          )
        )
        .map(t => ({
          transaction: t,
          book: books.find(b => b.id === t.bookId)
        }))
        .filter(item => item.book)
    : [];

  // Get transaction history with book details
  const transactionHistory = transactions && books && patron
    ? patronTransactions
        .map(t => ({
          ...t,
          book: books.find(b => b.id === t.bookId)
        }))
        .sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA; // Most recent first
        })
    : [];

  if (!patron) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Patron Profile</DialogTitle>
          <DialogDescription>
            View detailed information about {patron.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          {/* Patron Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{patron.name}</div>
                  
                  <div className="font-medium">Contact:</div>
                  <div>{patron.contactInfo}</div>
                  
                  <div className="font-medium">Member Since:</div>
                  <div>{formatDate(patron.registeredDate)}</div>
                  
                  <div className="font-medium">Status:</div>
                  <div>
                    <Badge className={patron.membershipStatus === "Active" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }>
                      {patron.membershipStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Borrowing Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Total Transactions:</div>
                  <div>{transactionsLoading ? <Skeleton className="h-5 w-12" /> : patronTransactions.length}</div>
                  
                  <div className="font-medium">Books Currently Out:</div>
                  <div>{transactionsLoading ? <Skeleton className="h-5 w-12" /> : activeCheckouts.length}</div>
                  
                  <div className="font-medium">Checkouts:</div>
                  <div>{transactionsLoading ? <Skeleton className="h-5 w-12" /> : 
                    patronTransactions.filter(t => t.transactionType === "Checkout").length
                  }</div>
                  
                  <div className="font-medium">Returns:</div>
                  <div>{transactionsLoading ? <Skeleton className="h-5 w-12" /> : 
                    patronTransactions.filter(t => t.transactionType === "Return").length
                  }</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Current Checkouts */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Currently Checked Out Books</h3>
              {transactionsLoading || booksLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : activeCheckouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Checkout Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCheckouts.map(({ transaction, book }) => {
                      // Calculate if overdue
                      const dueDate = transaction.dueDate ? new Date(transaction.dueDate) : null;
                      const isOverdue = dueDate && dueDate < new Date();
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{book?.title}</TableCell>
                          <TableCell>{book?.author}</TableCell>
                          <TableCell>{formatDate(transaction.checkoutDate)}</TableCell>
                          <TableCell>{formatDate(transaction.dueDate)}</TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Current</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 italic">No books currently checked out</p>
              )}
            </div>
            
            <Separator />
            
            {/* Transaction History */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              {transactionsLoading || booksLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : transactionHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionHistory.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              transaction.transactionType === "Checkout" 
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : transaction.transactionType === "Return"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.book?.title || "N/A"}</TableCell>
                        <TableCell>{transaction.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 italic">No transaction history</p>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}