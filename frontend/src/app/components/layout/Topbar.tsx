import { Search, Bell, ChevronRight, ChevronDown, Menu } from "lucide-react";
import SearchBar from "../shared/SearchBar";
import { navItems } from "./Sidebar";
import type { Screen } from "./Sidebar";

interface TopbarProps {
  screen: Screen;
  notifCount: number;
  onNotif: () => void;
  onMenuToggle?: () => void;
  user?: { name?: string; role?: string };
}

function Topbar({ screen, notifCount, onNotif, onMenuToggle, user }: TopbarProps) {
  const label = navItems.find((n) => n.id === screen)?.label ?? "Dashboard";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
    : "JM";
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 lg:gap-4 flex-shrink-0 shadow-sm">
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
      >
        <Menu size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="truncate">AgriHub</span>
          <ChevronRight size={11} className="flex-shrink-0" />
          <span className="text-gray-700 font-medium truncate">{label}</span>
        </nav>
      </div>
      <SearchBar
        placeholder="Search farmers, produce, transactions..."
        className="w-64 hidden md:block"
      />
      <button
        onClick={onNotif}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <Bell size={18} />
        {notifCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </button>
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-800 leading-none">
            {user?.name || "Wandera Jonah"}
          </p>
          <p className="text-xs text-gray-400 leading-none mt-0.5">
            {user?.role || "Administrator"}
          </p>
        </div>
        <ChevronDown size={14} className="text-gray-400" />
      </div>
    </header>
  );
}

export default Topbar;
