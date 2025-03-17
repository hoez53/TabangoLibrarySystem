import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Transaction } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { CheckoutModal } from "@/components/circulation/checkout-modal";

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookDetailModal({ book, isOpen, onClose }: BookDetailModalProps) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: book ? [`/api/transactions/book/${book.id}`] : null,
    enabled: !!book
  });

  // Format a date for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "None";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate borrowing history stats
  const calculateBorrowingStats = () => {
    if (!transactions) return { isCheckedOut: false, totalBorrowed: 0, lastBorrowed: null };
    
    const checkouts = transactions.filter(t => t.transactionType === "Checkout");
    const nonReturnedCheckout = checkouts.find(t => !transactions.some(
      rt => rt.transactionType === "Return" && rt.bookId === t.bookId && rt.checkoutDate === t.checkoutDate
    ));
    
    return {
      isCheckedOut: !!nonReturnedCheckout,
      totalBorrowed: checkouts.length,
      lastBorrowed: book?.lastBorrowed || null
    };
  };

  const borrowingStats = calculateBorrowingStats();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{book?.title || <Skeleton className="h-6 w-48" />}</DialogTitle>
          </DialogHeader>
          
          {!book ? (
            <div className="p-6 space-y-4">
              <div className="flex">
                <Skeleton className="w-1/3 h-40" />
                <div className="w-2/3 pl-6 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="flex">
                <div className="w-1/3">
                  <div className="bg-gray-200 h-40 rounded-md flex items-center justify-center">
                    <span className="material-icons text-4xl text-gray-400">menu_book</span>
                  </div>
                </div>
                <div className="w-2/3 pl-6">
                  <p className="text-sm"><span className="text-gray-500">Author:</span> {book.author}</p>
                  <p className="text-sm mt-2"><span className="text-gray-500">ISBN:</span> {book.isbn}</p>
                  <p className="text-sm mt-2"><span className="text-gray-500">Publisher:</span> {book.publisher}</p>
                  <p className="text-sm mt-2"><span className="text-gray-500">Publication Date:</span> {book.publicationDate}</p>
                  <p className="text-sm mt-2"><span className="text-gray-500">Category:</span> {book.category}</p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      book.status === "Available" 
                        ? "bg-green-100 text-green-800" 
                        : book.status === "Checked Out"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {book.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-500">{book.description || "No description available."}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Borrowing History</h3>
                {isLoadingTransactions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="text-sm">
                    <p>
                      Currently checked out: 
                      <span className={`font-medium ml-1 ${borrowingStats.isCheckedOut ? "text-red-500" : "text-green-500"}`}>
                        {borrowingStats.isCheckedOut ? "Yes" : "No"}
                      </span>
                    </p>
                    <p className="mt-2">
                      Total times borrowed: 
                      <span className="font-medium ml-1">
                        {borrowingStats.totalBorrowed}
                      </span>
                    </p>
                    <p className="mt-2">
                      Last borrowed: 
                      <span className="font-medium ml-1">
                        {formatDate(borrowingStats.lastBorrowed)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
            {book && book.status === "Available" && (
              <Button onClick={() => setIsCheckoutModalOpen(true)}>Checkout</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {book && (
        <CheckoutModal 
          isOpen={isCheckoutModalOpen} 
          onClose={() => setIsCheckoutModalOpen(false)}
          preselectedBookId={book.id}
        />
      )}
    </>
  );
}
