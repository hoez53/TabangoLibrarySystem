import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: "blue" | "amber" | "green" | "red";
  className?: string;
}

export function MetricCard({ title, value, icon, color, className }: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-primary"
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-600"
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600"
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-500"
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={cn("text-2xl font-medium mt-1", 
            color === "red" ? "text-red-500" : "text-gray-800"
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorClasses[color].bg)}>
          <span className={cn("material-icons", colorClasses[color].text)}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}
