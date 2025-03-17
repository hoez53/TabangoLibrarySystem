import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Book, Patron } from "@shared/schema";
import { CirculationFormData } from "@/lib/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookId?: number;
}

export function CheckoutModal({ isOpen, onClose, preselectedBookId }: CheckoutModalProps) {
  const [mode, setMode] = useState<"checkout" | "return">("checkout");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch books and patrons data
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  const { data: patrons, isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ['/api/patrons'],
  });

  const checkoutSchema = z.object({
    bookId: z.number({ required_error: "Book is required" }),
    patronId: z.number({ required_error: "Patron is required" }),
    dueDate: z.string({ required_error: "Due date is required" }),
    notes: z.string().optional()
  });

  const returnSchema = z.object({
    bookId: z.number({ required_error: "Book is required" }),
    notes: z.string().optional()
  });

  // Initialize form with the proper schema based on mode
  const form = useForm<CirculationFormData>({
    resolver: zodResolver(mode === "checkout" ? checkoutSchema : returnSchema),
    defaultValues: {
      bookId: preselectedBookId || undefined,
      patronId: undefined,
      dueDate: undefined,
      notes: ""
    }
  });

  // Set default due date to 14 days from now
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Filter books based on mode (Available for checkout, Checked Out for return)
  const filteredBooks = books ? books.filter(book => 
    mode === "checkout" 
      ? book.status === "Available" 
      : book.status === "Checked Out"
  ) : [];

  // Handle form submission
  const checkoutMutation = useMutation({
    mutationFn: async (data: CirculationFormData) => {
      return apiRequest("POST", "/api/circulation/checkout", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book checked out successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to check out book: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (data: { bookId: number, notes?: string }) => {
      return apiRequest("POST", "/api/circulation/return", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book returned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to return book: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CirculationFormData) => {
    if (mode === "checkout") {
      checkoutMutation.mutate(data);
    } else {
      returnMutation.mutate({ bookId: data.bookId, notes: data.notes });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "checkout" ? "Check Out Book" : "Return Book"}
          </DialogTitle>
          <DialogDescription>
            {mode === "checkout" 
              ? "Record a book checkout to a patron" 
              : "Process a book return from a patron"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          <Button 
            variant={mode === "checkout" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("checkout")}
            type="button"
          >
            Checkout
          </Button>
          <Button 
            variant={mode === "return" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("return")}
            type="button"
          >
            Return
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book ID/ISBN</FormLabel>
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingBooks}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title} ({book.isbn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {mode === "checkout" && (
              <>
                <FormField
                  control={form.control}
                  name="patronId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patron</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={isLoadingPatrons}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patron" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patrons?.map((patron) => (
                            <SelectItem key={patron.id} value={patron.id.toString()}>
                              {patron.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          defaultValue={getDefaultDueDate()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Add any additional notes here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={checkoutMutation.isPending || returnMutation.isPending}
              >
                {checkoutMutation.isPending || returnMutation.isPending 
                  ? "Processing..." 
                  : mode === "checkout" ? "Process Checkout" : "Process Return"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
