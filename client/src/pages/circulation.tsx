import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckoutModal } from "@/components/circulation/checkout-modal";
import { Book, Patron, Transaction } from "@shared/schema";
import { RecentActivity } from "@/lib/types";

export default function Circulation() {
  const [activeTab, setActiveTab] = useState("current");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // Fetch all necessary data
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  const { data: patrons, isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ['/api/patrons'],
  });
  
  const { data: overdueTransactions, isLoading: isLoadingOverdue } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/overdue'],
  });
  
  const isLoading = isLoadingTransactions || isLoadingBooks || isLoadingPatrons || isLoadingOverdue;

  // Process and enrich transactions with book and patron details
  const enrichTransactions = (transactionList: Transaction[] | undefined): RecentActivity[] => {
    if (!transactionList || !books || !patrons) return [];
    
    return transactionList.map(transaction => {
      const activity: RecentActivity = { ...transaction };
      
      if (transaction.bookId) {
        activity.book = books.find(book => book.id === transaction.bookId);
      }
      
      if (transaction.patronId) {
        activity.patron = patrons.find(patron => patron.id === transaction.patronId);
      }
      
      return activity;
    });
  };

  // Get current checkouts (checked out but not returned)
  const getCurrentCheckouts = (): RecentActivity[] => {
    if (!transactions) return [];
    
    const checkoutTransactions = transactions.filter(t => 
      t.transactionType === "Checkout" &&
      !transactions.some(rt => 
        rt.transactionType === "Return" && 
        rt.bookId === t.bookId && 
        rt.checkoutDate === t.checkoutDate
      )
    );
    
    // Sort by due date ascending
    const sorted = [...checkoutTransactions].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    return enrichTransactions(sorted);
  };

  // Get all transaction history
  const getTransactionHistory = (): RecentActivity[] => {
    if (!transactions) return [];
    
    // Sort by timestamp descending (newest first)
    const sorted = [...transactions].sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return enrichTransactions(sorted);
  };

  // Get overdue checkouts
  const getOverdueCheckouts = (): RecentActivity[] => {
    if (!overdueTransactions) return [];
    
    // Sort by most overdue first
    const sorted = [...overdueTransactions].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    return enrichTransactions(sorted);
  };

  // Format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days overdue
  const getDaysOverdue = (dueDate: Date | null | undefined) => {
    if (!dueDate) return 0;
    
    const due = new Date(dueDate);
    const today = new Date();
    
    if (due >= today) return 0;
    
    const diffTime = today.getTime() - due.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentCheckouts = getCurrentCheckouts();
  const transactionHistory = getTransactionHistory();
  const overdueCheckouts = getOverdueCheckouts();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Circulation</h1>
          <p className="text-gray-500">Manage checkouts, returns, and circulation records</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button onClick={() => setIsCheckoutModalOpen(true)}>
            <span className="material-icons mr-2">sync_alt</span>
            Checkout / Return
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="current" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="current">Current Checkouts</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Checkouts</CardTitle>
              <CardDescription>
                Books currently checked out from the library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Patron</TableHead>
                      <TableHead>Checkout Date</TableHead>
                      <TableHead>Due Date</TableHead>
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
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : currentCheckouts.length > 0 ? (
                      currentCheckouts.map((checkout) => {
                        const daysLate = getDaysOverdue(checkout.dueDate);
                        return (
                          <TableRow key={checkout.id}>
                            <TableCell className="font-medium">
                              {checkout.book?.title || "Unknown Book"}
                            </TableCell>
                            <TableCell>
                              {checkout.patron?.name || "Unknown Patron"}
                            </TableCell>
                            <TableCell>
                              {formatDate(checkout.checkoutDate)}
                            </TableCell>
                            <TableCell>
                              {formatDate(checkout.dueDate)}
                            </TableCell>
                            <TableCell>
                              {daysLate > 0 ? (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  {daysLate} {daysLate === 1 ? "day" : "days"} overdue
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  On time
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // Open return modal with this book
                                }}
                              >
                                Process Return
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          No books currently checked out
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Books</CardTitle>
              <CardDescription>
                Books that are past their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Patron</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : overdueCheckouts.length > 0 ? (
                      overdueCheckouts.map((checkout) => {
                        const daysLate = getDaysOverdue(checkout.dueDate);
                        return (
                          <TableRow key={checkout.id}>
                            <TableCell className="font-medium">
                              {checkout.book?.title || "Unknown Book"}
                            </TableCell>
                            <TableCell>
                              {checkout.patron?.name || "Unknown Patron"}
                            </TableCell>
                            <TableCell>
                              {formatDate(checkout.dueDate)}
                            </TableCell>
                            <TableCell className="text-red-500 font-medium">
                              {daysLate} {daysLate === 1 ? "day" : "days"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                >
                                  Notify
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    // Open return modal with this book
                                  }}
                                >
                                  Process Return
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No overdue books
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete record of all library transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Patron</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : transactionHistory.length > 0 ? (
                      transactionHistory.map((transaction) => {
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Badge 
                                className={`
                                  ${transaction.transactionType === "Checkout" ? "bg-green-100 text-green-800" : ""}
                                  ${transaction.transactionType === "Return" ? "bg-blue-100 text-blue-800" : ""}
                                  ${transaction.transactionType === "New Book" ? "bg-purple-100 text-purple-800" : ""}
                                  ${transaction.transactionType === "New Patron" ? "bg-amber-100 text-amber-800" : ""}
                                  ${transaction.transactionType === "Overdue" ? "bg-red-100 text-red-800" : ""}
                                  hover:bg-opacity-100
                                `}
                              >
                                {transaction.transactionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {transaction.book?.title || "—"}
                            </TableCell>
                            <TableCell>
                              {transaction.patron?.name || "—"}
                            </TableCell>
                            <TableCell>
                              {formatDate(transaction.timestamp)}
                            </TableCell>
                            <TableCell>
                              {transaction.transactionType === "Checkout" && (
                                <span>Due: {formatDate(transaction.dueDate)}</span>
                              )}
                              {transaction.transactionType === "Return" && (
                                <span>Returned: {formatDate(transaction.returnDate)}</span>
                              )}
                              {transaction.notes && (
                                <span className="text-gray-500 text-sm ml-2">
                                  Note: {transaction.notes}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No transaction history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </div>
  );
}
