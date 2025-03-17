import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { OverdueBook } from "@/lib/types";
import type { Book, Patron, Transaction } from "@shared/schema";

interface OverdueBooksProps {
  className?: string;
}

export function OverdueBooks({ className }: OverdueBooksProps) {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  
  const { data: overdueTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/overdue'],
  });

  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });

  const { data: patrons, isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ['/api/patrons'],
  });

  const isLoading = isLoadingTransactions || isLoadingBooks || isLoadingPatrons;

  useEffect(() => {
    if (overdueTransactions && books && patrons) {
      const today = new Date();
      const overdue = overdueTransactions.map(transaction => {
        const book = books.find(b => b.id === transaction.bookId);
        const patron = patrons.find(p => p.id === transaction.patronId);
        
        if (!book || !patron || !transaction.dueDate) return null;
        
        const dueDate = new Date(transaction.dueDate);
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        return {
          book,
          patron,
          dueDate,
          daysLate
        };
      }).filter(item => item !== null) as OverdueBook[];
      
      // Sort by most overdue first
      overdue.sort((a, b) => b.daysLate - a.daysLate);
      
      setOverdueBooks(overdue);
    }
  }, [overdueTransactions, books, patrons]);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pt-4 pb-4">
        <CardTitle className="text-lg font-medium">Overdue Books</CardTitle>
        <Link href="/circulation">
          <Button variant="link" className="text-primary text-sm font-medium">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 py-3">
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-28 mb-1" />
                <div className="flex justify-between mt-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {overdueBooks.slice(0, 3).map((item) => (
              <li key={item.book.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{item.book.title}</p>
                    <p className="text-xs text-gray-500">Due: {formatDate(item.dueDate)}</p>
                    <p className="text-xs mt-1">
                      {item.patron.name}
                      <span className="text-red-500"> ({item.daysLate} days late)</span>
                    </p>
                  </div>
                  <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm h-7">
                    Notify
                  </Button>
                </div>
              </li>
            ))}
            
            {overdueBooks.length === 0 && (
              <li className="py-3 text-center text-gray-500 text-sm">
                No overdue books
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
