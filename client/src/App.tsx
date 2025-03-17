import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Books from "@/pages/books";
import AddBook from "@/pages/add-book";
import Patrons from "@/pages/patrons";
import AddPatron from "@/pages/add-patron";
import Circulation from "@/pages/circulation";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Check if user is authenticated
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // If not authenticated and not on login page, redirect to login
  useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  // If authenticated and on login page, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user && location === "/login") {
      setLocation("/");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    // Show minimal loading state while checking authentication
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/books">
        <Layout>
          <Books />
        </Layout>
      </Route>
      <Route path="/books/new">
        <Layout>
          <AddBook />
        </Layout>
      </Route>
      <Route path="/patrons">
        <Layout>
          <Patrons />
        </Layout>
      </Route>
      <Route path="/patrons/new">
        <Layout>
          <AddPatron />
        </Layout>
      </Route>
      <Route path="/circulation">
        <Layout>
          <Circulation />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
