import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { OverdueBooks } from "@/components/dashboard/overdue-books";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { DashboardMetrics, RecentActivity } from "@/lib/types";
import { Transaction, Book, Patron } from "@shared/schema";

export default function Dashboard() {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });
  
  // Fetch recent activities
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });
  
  // Fetch books and patrons for enriching transactions
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  const { data: patrons, isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ['/api/patrons'],
  });

  // Process transactions to add book and patron details
  useEffect(() => {
    if (recentTransactions && books && patrons) {
      const enrichedTransactions = recentTransactions.map(transaction => {
        const activity: RecentActivity = { ...transaction };
        
        if (transaction.bookId) {
          activity.book = books.find(book => book.id === transaction.bookId);
        }
        
        if (transaction.patronId) {
          activity.patron = patrons.find(patron => patron.id === transaction.patronId);
        }
        
        return activity;
      });
      
      setRecentActivities(enrichedTransactions);
    }
  }, [recentTransactions, books, patrons]);

  const isLoading = isLoadingMetrics || isLoadingTransactions || isLoadingBooks || isLoadingPatrons;

  return (
    <main className="p-6">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Books" 
            value={metrics?.totalBooks || 0} 
            icon="menu_book" 
            color="blue" 
          />
          
          <MetricCard 
            title="Books Checked Out" 
            value={metrics?.booksCheckedOut || 0} 
            icon="login" 
            color="amber" 
          />
          
          <MetricCard 
            title="Active Patrons" 
            value={metrics?.activePatrons || 0} 
            icon="people" 
            color="green" 
          />
          
          <MetricCard 
            title="Overdue Books" 
            value={metrics?.overdueBooks || 0} 
            icon="schedule" 
            color="red" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4">
              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              <Button variant="link" className="text-primary text-sm font-medium">
                View All
              </Button>
            </CardHeader>
            
            <ActivityTable 
              activities={recentActivities} 
              isLoading={isLoading} 
            />
          </Card>
        </div>

        <div>
          <QuickActions />
          <OverdueBooks />
        </div>
      </div>

      <div className="mt-6">
        <CategoryChart />
      </div>
    </main>
  );
}
