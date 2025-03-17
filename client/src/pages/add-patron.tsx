import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import { insertPatronSchema } from "@shared/schema";
import { z } from "zod";

// Extend the insert schema with validation rules
const patronFormSchema = insertPatronSchema.extend({
  name: z.string().min(1, "Name is required"),
  contactInfo: z.string().min(1, "Contact information is required").email("Must be a valid email address"),
  membershipStatus: z.string()
});

type PatronFormValues = z.infer<typeof patronFormSchema>;

export default function AddPatron() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<PatronFormValues>({
    resolver: zodResolver(patronFormSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      membershipStatus: "Active"
    }
  });
  
  // Handle form submission
  const createPatronMutation = useMutation({
    mutationFn: async (data: PatronFormValues) => {
      return apiRequest("POST", "/api/patrons", data);
    },
    onSuccess: () => {
      toast({
        title: "Patron registered",
        description: "The patron has been registered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patrons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      
      // Redirect to patrons page
      navigate("/patrons");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to register patron: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  function onSubmit(data: PatronFormValues) {
    createPatronMutation.mutate(data);
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4 p-0 hover:bg-transparent"
          onClick={() => navigate("/patrons")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Register New Patron</h1>
          <p className="text-gray-500">Add a new patron to the library system</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Patron Information
          </CardTitle>
          <CardDescription>
            Enter the patron's details to register them in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Email address for notifications and communication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/patrons")}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createPatronMutation.isPending}
          >
            {createPatronMutation.isPending ? "Registering..." : "Register Patron"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
