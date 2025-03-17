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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Plus, UserPlus } from "lucide-react";
import { Patron, Transaction } from "@shared/schema";
import { PatronDetailModal } from "@/components/patrons/patron-detail-modal";

export default function Patrons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, navigate] = useLocation();
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { data: patrons, isLoading } = useQuery<Patron[]>({
    queryKey: ['/api/patrons'],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Filter patrons based on search
  const filteredPatrons = patrons ? patrons.filter(patron => 
    patron.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patron.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Count books currently checked out by patron
  const getBooksCheckedOut = (patronId: number) => {
    if (!transactions) return 0;
    
    const checkouts = transactions.filter(t => 
      t.patronId === patronId && 
      t.transactionType === "Checkout" &&
      !transactions.some(rt => 
        rt.transactionType === "Return" && 
        rt.patronId === patronId && 
        rt.bookId === t.bookId && 
        rt.checkoutDate === t.checkoutDate
      )
    );
    
    return checkouts.length;
  };

  // Generate registration date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patrons</h1>
          <p className="text-gray-500">Manage library members</p>
        </div>
        <Button 
          className="mt-4 md:mt-0"
          onClick={() => navigate("/patrons/new")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Register New Patron
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search Patrons</CardTitle>
          <CardDescription>Find patrons by name or contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search by name or contact info..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Patron Directory</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Loading patrons..." 
              : `${filteredPatrons.length} patron${filteredPatrons.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Books Checked Out</TableHead>
                  <TableHead>Membership Status</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredPatrons.length > 0 ? (
                  filteredPatrons.map((patron) => {
                    const booksOut = getBooksCheckedOut(patron.id);
                    return (
                      <TableRow key={patron.id}>
                        <TableCell className="font-medium">{patron.name}</TableCell>
                        <TableCell>{patron.contactInfo}</TableCell>
                        <TableCell>
                          {booksOut > 0 ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              {booksOut}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={patron.membershipStatus === "Active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }>
                            {patron.membershipStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(patron.registeredDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPatron(patron);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              View Profile
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No patrons found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Patron Detail Modal */}
      <PatronDetailModal
        patron={selectedPatron}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
