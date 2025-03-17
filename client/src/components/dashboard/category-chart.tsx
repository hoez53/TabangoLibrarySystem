import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CategoryStat } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryChartProps {
  className?: string;
}

export function CategoryChart({ className }: CategoryChartProps) {
  const { data: categoryStats, isLoading } = useQuery<CategoryStat[]>({
    queryKey: ['/api/dashboard/category-stats'],
  });

  // Colors for different categories
  const categoryColors: Record<string, string> = {
    "Fiction": "bg-blue-500",
    "Non-Fiction": "bg-green-500",
    "Reference": "bg-purple-500",
    "Periodicals": "bg-amber-500",
    "Other": "bg-red-500"
  };

  // Find the maximum count to scale the chart
  const maxCount = categoryStats 
    ? Math.max(...categoryStats.map(stat => stat.count))
    : 0;

  // Calculate the height percentage for each bar
  const calculateHeight = (count: number) => {
    if (maxCount === 0) return "0%";
    const percentage = (count / maxCount) * 100;
    return `${Math.max(percentage, 5)}%`; // Minimum 5% height for visibility
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="text-lg font-medium">Books by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 flex items-end justify-center">
          {isLoading ? (
            <div className="grid grid-cols-5 gap-4 w-full h-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-end">
                  <Skeleton className="w-full rounded-t-lg" style={{ height: `${Math.random() * 50 + 30}%` }} />
                  <Skeleton className="h-4 w-16 mt-2" />
                  <Skeleton className="h-4 w-10 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4 w-full">
              {categoryStats?.map((stat) => (
                <div key={stat.category} className="flex flex-col items-center">
                  <div 
                    className={`w-full ${categoryColors[stat.category] || 'bg-gray-500'} rounded-t-lg`} 
                    style={{ height: calculateHeight(stat.count) }}
                  ></div>
                  <p className="text-xs mt-2">{stat.category}</p>
                  <p className="text-xs font-medium">{stat.count.toLocaleString()}</p>
                </div>
              ))}
              
              {(!categoryStats || categoryStats.length === 0) && (
                <div className="col-span-5 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
