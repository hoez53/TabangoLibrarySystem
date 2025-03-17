import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { AppBar } from "@/components/ui/app-bar";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/books":
        return "Books Catalog";
      case "/books/new":
        return "Add New Book";
      case "/patrons":
        return "Patrons";
      case "/patrons/new":
        return "Register New Patron";
      case "/circulation":
        return "Circulation";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "Tabango Library";
    }
  };
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen || !isMobile} onClose={isMobile ? () => setSidebarOpen(false) : undefined} />
      
      <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-[250px]'} transition-all duration-300`}>
        <AppBar title={getPageTitle()} onMenuClick={toggleSidebar} />
        {children}
      </div>
    </div>
  );
}
