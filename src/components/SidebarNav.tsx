
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Calendar,
  Home,
  PieChart,
  Settings,
  Target,
  User
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BarChart, label: "Transactions", path: "/transactions" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function SidebarNav() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen w-64 bg-white border-r px-3 py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary px-4">FinFlow</h2>
      </div>
      
      {user && (
        <div className="px-4 mb-6">
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )}
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors",
              location.pathname === item.path && "bg-gray-100 text-primary font-medium"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
