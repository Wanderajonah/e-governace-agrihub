import {
  Leaf, LogOut, Menu, ChevronRight,
  LayoutDashboard, Users, Package, ShieldCheck,
  Tag, ArrowLeftRight, TrendingUp, FileText,
  Building2, UserCog, Bell, Settings,
} from "lucide-react";
import { COLORS } from "../shared/COLORS";
import { ROLE_SCREENS } from "../../auth/rbac";
import type { Role } from "../../auth/rbac";

export type Screen =
  | "login"
  | "dashboard"
  | "farmers"
  | "produce-registration"
  | "produce-verification"
  | "commodity-prices"
  | "transactions"
  | "market-analytics"
  | "reports"
  | "government"
  | "users"
  | "notifications"
  | "settings";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "produce-registration", label: "Produce Registration", icon: Package },
  { id: "produce-verification", label: "Produce Verification", icon: ShieldCheck },
  { id: "commodity-prices", label: "Commodity Prices", icon: Tag },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "market-analytics", label: "Market Analytics", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "government", label: "Government Dashboard", icon: Building2 },
  { id: "users", label: "User Management", icon: UserCog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: Screen;
  onNav: (s: Screen) => void;
  collapsed: boolean;
  onCollapse: () => void;
  onLogout?: () => void;
  role?: string;
  mobile?: boolean;
}

function Sidebar({
  active,
  onNav,
  collapsed,
  onCollapse,
  onLogout,
  role,
  mobile,
}: SidebarProps) {
  const allowedScreens =
    ROLE_SCREENS[role as Role] || ROLE_SCREENS.Administrator;
  const filteredNav = navItems.filter((item) =>
    allowedScreens.includes(item.id),
  );
  return (
    <div
      className={`${mobile ? "flex" : "hidden md:flex"} flex-col h-full transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      style={{ background: COLORS.dark, borderRight: `1px solid #374151` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none">AgriHub</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">
              Nakasero Market
            </p>
          </div>
        )}
        <button
          onClick={onCollapse}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <Menu size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {filteredNav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id as Screen)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-green-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
