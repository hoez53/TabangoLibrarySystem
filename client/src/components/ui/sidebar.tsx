import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./skeleton";
import { type User } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/books", label: "Books Catalog", icon: "menu_book" },
    { path: "/patrons", label: "Patrons", icon: "people" },
    { path: "/circulation", label: "Circulation", icon: "sync_alt" },
    { path: "/reports", label: "Reports", icon: "assessment" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside 
      className={cn(
        "fixed h-full bg-white shadow-md z-30 w-[250px] transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Library Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-primary">local_library</span>
            <h1 className="text-xl font-medium text-primary">Tabango Library</h1>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  onClick={onClose}
                >
                  <a 
                    className={cn(
                      "flex items-center px-6 py-3 text-sm hover:bg-gray-100",
                      location === item.path 
                        ? "bg-blue-50 text-primary border-l-4 border-primary"
                        : "text-gray-700"
                    )}
                  >
                    <span className="material-icons mr-3 text-sm">{item.icon}</span>
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile Section */}
        <div className="border-t p-4">
          {isLoading ? (
            <div className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="text-sm">{user.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <a className="text-sm text-primary hover:underline">Login</a>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
