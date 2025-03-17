import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { CheckoutModal } from "@/components/circulation/checkout-modal";
import { useLocation } from "wouter";

export function QuickActions() {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [location, navigate] = useLocation();

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-4 pt-4">
          <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Button 
            className="w-full bg-primary hover:bg-blue-700"
            onClick={() => navigate("/books/new")}
          >
            <span className="material-icons mr-2">add_circle</span>
            Add New Book
          </Button>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => setIsCheckoutModalOpen(true)}
          >
            <span className="material-icons mr-2">sync_alt</span>
            Check Out / Return
          </Button>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/patrons/new")}
          >
            <span className="material-icons mr-2">person_add</span>
            Register New Patron
          </Button>
          
          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={() => navigate("/books")}
          >
            <span className="material-icons mr-2">search</span>
            Advanced Search
          </Button>
        </CardContent>
      </Card>

      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </>
  );
}
