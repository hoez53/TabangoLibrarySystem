import { MenuIcon, Bell, Search } from "lucide-react";
import { Input } from "./input";
import { Badge } from "./badge";
import { ThemeToggle } from "./theme-toggle";

interface AppBarProps {
  title: string;
  onMenuClick: () => void;
}

export function AppBar({ title, onMenuClick }: AppBarProps) {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-foreground focus:outline-none" 
            onClick={onMenuClick}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-medium text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 text-sm w-64"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative text-foreground focus:outline-none">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white">
              3
            </Badge>
          </button>
        </div>
      </div>
    </header>
  );
}
