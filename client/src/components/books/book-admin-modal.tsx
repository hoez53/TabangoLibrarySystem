import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { insertBookSchema, BOOK_CATEGORIES, BOOK_STATUS } from "@shared/schema";

interface BookAdminModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

// Extend the book schema for form validation
const bookFormSchema = insertBookSchema.extend({
  isbn: z.string().min(10, "ISBN must be at least 10 characters"),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().min(1, "Publisher is required"),
  publicationDate: z.string().min(1, "Publication date is required"),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export function BookAdminModal({ book, isOpen, onClose }: BookAdminModalProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const queryClient = useQueryClient();
  
  // Set up the form with default values from the book
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: book ? {
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publicationDate: book.publicationDate,
      category: book.category,
      description: book.description || "",
      status: book.status
    } : {
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      publicationDate: "",
      category: "Fiction",
      description: "",
      status: "Available"
    }
  });
  
  // Reset form when book changes
  useEffect(() => {
    if (book && isOpen) {
      form.reset({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        publicationDate: book.publicationDate,
        category: book.category,
        description: book.description || "",
        status: book.status
      });
    }
  }, [book, isOpen, form]);

  // Update book mutation
  const updateMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      if (!book) return null;
      return apiRequest("PUT", `/api/books/${book.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book updated",
        description: "The book details have been successfully updated.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating book",
        description: error.message || "An error occurred while updating the book.",
        variant: "destructive"
      });
    }
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!book) return null;
      return apiRequest("DELETE", `/api/books/${book.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book deleted",
        description: "The book has been successfully deleted from the system.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting book",
        description: error.message || "An error occurred while deleting the book.",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  function onSubmit(data: BookFormValues) {
    updateMutation.mutate(data);
  }

  // Handle delete confirmation
  function handleDelete() {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
    } else {
      deleteMutation.mutate();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setDeleteConfirmation(false);
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Book: {book?.title}</DialogTitle>
          <DialogDescription>
            Make changes to book information below. Changes will be saved when you click Save.
          </DialogDescription>
        </DialogHeader>
        
        {book && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input placeholder="ISBN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input placeholder="Publisher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publicationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Date</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY or YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {BOOK_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {BOOK_STATUS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Book description" 
                        className="min-h-[100px]" 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        disabled={field.disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    {deleteConfirmation ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Confirm Delete
                      </>
                    ) : (
                      "Delete Book"
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}