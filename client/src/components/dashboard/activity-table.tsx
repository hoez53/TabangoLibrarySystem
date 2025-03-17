import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { RecentActivity } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityTableProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

export function ActivityTable({ activities, isLoading = false }: ActivityTableProps) {
  // Helper function to get icon and color based on transaction type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case "Checkout":
        return { icon: "login", color: "text-green-500" };
      case "Return":
        return { icon: "logout", color: "text-blue-500" };
      case "New Book":
        return { icon: "add_circle", color: "text-purple-500" };
      case "New Patron":
        return { icon: "person_add", color: "text-amber-500" };
      case "Overdue":
        return { icon: "error", color: "text-red-500" };
      default:
        return { icon: "info", color: "text-gray-500" };
    }
  };

  // Format date to display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    
    const now = new Date();
    const transactionDate = new Date(date);
    
    // Same day
    if (transactionDate.toDateString() === now.toDateString()) {
      return `Today, ${transactionDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (transactionDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${transactionDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // Other days
    return transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-xs text-gray-500 uppercase">Activity</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase">Book</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase">Patron</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 uppercase">Date/Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium text-xs text-gray-500 uppercase">Activity</TableHead>
            <TableHead className="font-medium text-xs text-gray-500 uppercase">Book</TableHead>
            <TableHead className="font-medium text-xs text-gray-500 uppercase">Patron</TableHead>
            <TableHead className="font-medium text-xs text-gray-500 uppercase">Date/Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const { icon, color } = getActivityIcon(activity.transactionType);
            return (
              <TableRow key={activity.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`material-icons ${color} mr-2`}>{icon}</span>
                    <span className="text-sm">{activity.transactionType}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {activity.book?.title || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {activity.patron?.name || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  {formatDate(activity.timestamp)}
                </TableCell>
              </TableRow>
            );
          })}
          
          {activities.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                No recent activity
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
