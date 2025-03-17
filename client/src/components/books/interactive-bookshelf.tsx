import { useState, useRef, useEffect } from "react";
import { Book } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  ShoppingCart, 
  Edit, 
  AlertTriangle 
} from "lucide-react";

// Color palette for book spines based on categories
const CATEGORY_COLORS: Record<string, string> = {
  "Fiction": "bg-gradient-to-r from-blue-600 to-blue-500",
  "Science Fiction": "bg-gradient-to-r from-indigo-600 to-purple-500",
  "Mystery": "bg-gradient-to-r from-purple-600 to-pink-500",
  "Romance": "bg-gradient-to-r from-pink-600 to-rose-500",
  "Biography": "bg-gradient-to-r from-green-600 to-teal-500",
  "History": "bg-gradient-to-r from-amber-600 to-yellow-500",
  "Self-Help": "bg-gradient-to-r from-orange-600 to-red-500",
  "Reference": "bg-gradient-to-r from-gray-700 to-gray-600",
  "Children": "bg-gradient-to-r from-cyan-600 to-sky-500",
  "Non-fiction": "bg-gradient-to-r from-teal-600 to-emerald-500",
  "Poetry": "bg-gradient-to-r from-violet-600 to-fuchsia-500",
  "default": "bg-gradient-to-r from-gray-600 to-gray-500"
};

interface BookSpineProps {
  book: Book;
  onClick: () => void;
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

function BookSpine({ book, onClick, onAdminClick, isAdmin = false }: BookSpineProps) {
  // Get the color based on category or use default
  const bgColor = CATEGORY_COLORS[book.category] || CATEGORY_COLORS.default;
  
  // Calculate height based on title length (purely visual)
  const height = Math.max(180, Math.min(280, 180 + book.title.length * 2));
  
  // Calculate width based on title length
  const width = Math.max(30, Math.min(50, 30 + book.title.length / 2));

  return (
    <div 
      className="book-spine relative transition-all duration-300 cursor-pointer mx-1"
      style={{ 
        height: `${height}px`, 
        width: `${width}px`,
        perspective: '1000px'
      }}
    >
      <div 
        className={cn(
          "absolute inset-0 rounded-sm rounded-r-none transition-transform duration-500 hover:translate-x-4 flex flex-col text-white shadow-lg",
          bgColor,
          book.status === "Checked Out" && "opacity-50"
        )}
        onClick={onClick}
      >
        {/* Book title rotated along spine */}
        <div className="flex-1 flex items-center justify-center origin-center" style={{ writingMode: 'vertical-rl' }}>
          <h3 className="text-xs font-bold mx-auto px-1 truncate whitespace-nowrap">
            {book.title}
          </h3>
        </div>
        
        {/* Book status indicator */}
        {book.status === "Checked Out" && (
          <div className="absolute top-1 right-1">
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        )}
        
        {/* Admin button */}
        {isAdmin && onAdminClick && (
          <div 
            className="absolute opacity-0 hover:opacity-100 inset-0 flex items-center justify-center bg-black/50 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onAdminClick();
            }}
          >
            <Edit className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      
      {/* Book edge */}
      <div 
        className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-r from-gray-300 to-white dark:from-gray-600 dark:to-gray-500 rounded-r-sm"
        style={{ transformOrigin: 'right center' }}
      />
    </div>
  );
}

interface InteractiveBookshelfProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onAdminClick?: (book: Book) => void;
  isAdmin?: boolean;
  className?: string;
}

export function InteractiveBookshelf({ 
  books, 
  onBookClick, 
  onAdminClick,
  isAdmin = false,
  className
}: InteractiveBookshelfProps) {
  const [sortedBooks, setSortedBooks] = useState<Book[]>([]);
  const [sortBy, setSortBy] = useState<string>("category");
  const shelfRef = useRef<HTMLDivElement>(null);

  // Sort and organize books when books array or sort criteria changes
  useEffect(() => {
    if (!books) return;
    
    let sorted = [...books];
    
    // Sort books based on criteria
    if (sortBy === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "author") {
      sorted.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === "category") {
      sorted.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "status") {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    
    setSortedBooks(sorted);
  }, [books, sortBy]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Library Bookshelf</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-1">
            {["category", "title", "author", "status"].map((option) => (
              <Button 
                key={option} 
                variant={sortBy === option ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortBy(option)}
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Card className="p-4 bg-muted/50">
        <div className="w-full overflow-x-auto pb-4">
          {/* Bookshelf */}
          <div 
            ref={shelfRef}
            className="flex items-end min-w-max"
            style={{ 
              minHeight: '300px',
              paddingBottom: '15px', // Shelf thickness
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 90%, rgba(0,0,0,0.1) 100%)',
              borderBottom: '15px solid #8B4513',
              boxShadow: '0 15px 10px -10px rgba(0, 0, 0, 0.3)'
            }}
          >
            {sortedBooks.map((book) => (
              <BookSpine 
                key={book.id} 
                book={book} 
                onClick={() => onBookClick(book)}
                onAdminClick={onAdminClick ? () => onAdminClick(book) : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">Categories:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(CATEGORY_COLORS).filter(([key]) => key !== 'default').map(([category, color]) => (
                <Badge 
                  key={category}
                  className={cn("text-white", color.replace("bg-", ""))}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}