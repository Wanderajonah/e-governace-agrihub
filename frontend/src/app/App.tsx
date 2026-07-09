import { useState, useEffect, useRef, useCallback } from "react";
import {
  ROLE_SCREENS,
  PERMISSIONS,
  canAccess,
  getDefaultScreen,
} from "./auth/rbac";
import type { Role } from "./auth/rbac";
import * as api from "../api";
import {
  LayoutDashboard,
  Users,
  Package,
  ShieldCheck,
  BarChart2,
  ArrowLeftRight,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  UserCog,
  Bell,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Download,
  Printer,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Leaf,
  MapPin,
  Calendar,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  ChevronRight,
  MoreVertical,
  Star,
  ArrowUp,
  ArrowDown,
  Globe,
  Lock,
  Shield,
  User,
  Mail,
  Phone,
  Hash,
  FileBarChart,
  PieChart,
  Activity,
  Layers,
  Tag,
  Truck,
  CheckSquare,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "./components/ui/sheet";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
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

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#2E7D32",
  secondary: "#4CAF50",
  info: "#1E88E5",
  warning: "#F9A825",
  danger: "#E53935",
  success: "#43A047",
  dark: "#1F2937",
  bg: "#F5F7FA",
  border: "#E5E7EB",
  text: "#374151",
};

// ─── Shared Components ────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Inactive: "bg-gray-100 text-gray-600",
    Pending: "bg-amber-50 text-amber-700",
    "Under Review": "bg-blue-50 text-blue-700",
    Administrator: "bg-purple-50 text-purple-700",
    "Market Officer": "bg-blue-50 text-blue-700",
    Inspector: "bg-orange-50 text-orange-700",
    "Government Officer": "bg-teal-50 text-teal-700",
  };
  const cls = map[label] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-none ${cls}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  trend?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
          {value}
        </p>
        <div className="flex items-center gap-1 text-xs">
          {trend !== undefined &&
            (trend >= 0 ? (
              <ArrowUp size={11} className="text-green-600" />
            ) : (
              <ArrowDown size={11} className="text-red-500" />
            ))}
          <span
            className={
              trend !== undefined
                ? trend >= 0
                  ? "text-green-600"
                  : "text-red-500"
                : "text-gray-400"
            }
          >
            {sub}
          </span>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 lg:mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 sm:gap-3 flex-wrap">{children}</div>}
    </div>
  );
}

function Btn({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: React.ElementType;
  onClick?: () => void;
  className?: string;
}) {
  const variants = {
    primary: "bg-green-700 hover:bg-green-800 text-white shadow-sm",
    secondary: "bg-green-500 hover:bg-green-600 text-white shadow-sm",
    outline: "border border-gray-200 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-600",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  };
  const sizes = {
    sm: "text-xs px-3 py-2.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
}

function SearchBar({
  placeholder = "Search...",
  className = "",
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
      />
    </div>
  );
}

function Table({
  headers,
  children,
  headerClassNames,
}: {
  headers: string[];
  children: React.ReactNode;
  headerClassNames?: string[];
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[52px] px-6 whitespace-nowrap align-middle ${headerClassNames?.[i] ?? ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`py-3.5 px-6 text-sm text-gray-700 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

function Select({
  options,
  className = "",
  value,
  onChange,
}: {
  options: string[];
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
  required,
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
      />
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "produce-registration", label: "Produce Registration", icon: Package },
  {
    id: "produce-verification",
    label: "Produce Verification",
    icon: ShieldCheck,
  },
  { id: "commodity-prices", label: "Commodity Prices", icon: Tag },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "market-analytics", label: "Market Analytics", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "government", label: "Government Dashboard", icon: Building2 },
  { id: "users", label: "User Management", icon: UserCog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({
  active,
  onNav,
  collapsed,
  onCollapse,
  onLogout,
  role,
  mobile,
}: {
  active: Screen;
  onNav: (s: Screen) => void;
  collapsed: boolean;
  onCollapse: () => void;
  onLogout?: () => void;
  role?: string;
  mobile?: boolean;
}) {
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

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function Topbar({
  screen,
  notifCount,
  onNotif,
  user,
  onMenuToggle,
}: {
  screen: Screen;
  notifCount: number;
  onNotif: () => void;
  user?: any;
  onMenuToggle?: () => void;
}) {
  const label = navItems.find((n) => n.id === screen)?.label ?? "Dashboard";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
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

// ─── Screens ──────────────────────────────────────────────────────────────────

// 403 UNAUTHORIZED
function UnauthorizedScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <Shield size={36} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          403 — Access Denied
        </h1>
        <p className="text-gray-500 mb-6">
          You do not have the required permissions to access this page. Please
          contact your administrator if you believe this is a mistake.
        </p>
        <Btn onClick={() => window.location.reload()}>Return to Dashboard</Btn>
      </div>
    </div>
  );
}

// LANDING / LOGIN
function LoginScreen({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void;
}) {
  const [email, setEmail] = useState("admin@agrihub.com");
  const [password, setPassword] = useState("admin123");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPortal, setShowPortal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState({
    farmers: 0,
    produce: 0,
    value: 0,
    txns: 0,
  });
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setVisible((p) => new Set(p).add(e.target.id));
        }
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll("[data-observe]")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = { farmers: 2847, produce: 12340, value: 2400, txns: 15600 };
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        farmers: Math.min(Math.round((t.farmers * step) / steps), t.farmers),
        produce: Math.min(Math.round((t.produce * step) / steps), t.produce),
        value: Math.min(Math.round((t.value * step) / steps), t.value),
        txns: Math.min(Math.round((t.txns * step) / steps), t.txns),
      });
      if (step >= steps) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.login(email, password);
      const { token, user } = res.data.data;
      onLogin(token, user);
    } catch (err: any) {
      setLoginError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const openPortal = () => setShowPortal(true);
  const closePortal = () => setShowPortal(false);
  const viewMarketPrices = async (market: any) => {
    setSelectedMarket(market);
    setLoadingPrices(true);
    setMarketPrices([]);
    try {
      const res = await api.listPrices({ limit: 20 });
      setMarketPrices(res.data.data || []);
    } catch {
      setMarketPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };
  const closeMarketPrices = () => setSelectedMarket(null);

  const features = [
    {
      icon: Users,
      title: "Farmer Registration",
      desc: "Digitally register and manage farmer profiles with complete traceability and history.",
    },
    {
      icon: Package,
      title: "Produce Management",
      desc: "Track produce from farm gate through quality verification with full chain-of-custody.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      desc: "Standardised inspection workflows to ensure only quality produce reaches consumers.",
    },
    {
      icon: TrendingUp,
      title: "Price Intelligence",
      desc: "Real-time commodity pricing with historical trends for informed trading decisions.",
    },
    {
      icon: ArrowLeftRight,
      title: "Transaction Recording",
      desc: "Secure digital recording of all market transactions with instant receipt generation.",
    },
    {
      icon: BarChart2,
      title: "Analytics & Reports",
      desc: "Comprehensive dashboards with exportable reports for data-driven governance.",
    },
  ];

  const steps = [
    {
      icon: Leaf,
      title: "Produce arrives",
      desc: "Farmers bring fresh harvests to market for registration.",
    },
    {
      icon: CheckSquare,
      title: "Gets registered",
      desc: "Officers log type, quantity, and origin into the system.",
    },
    {
      icon: ShieldCheck,
      title: "Quality verified",
      desc: "Inspectors certify quality against national standards.",
    },
    {
      icon: Tag,
      title: "Price logged",
      desc: "Real-time prices recorded and published for transparency.",
    },
    {
      icon: ArrowRight,
      title: "Transaction recorded",
      desc: "Every sale captured with full buyer and seller details.",
    },
    {
      icon: BarChart2,
      title: "Analytics generated",
      desc: "Data rolls into actionable insights for authorities.",
    },
  ];

  const markets = [
    {
      name: "Nakasero Market",
      location: "Kampala Central",
      traders: "1,200+",
      volume: "450 tons/wk",
    },
    {
      name: "Kalerwe Market",
      location: "Kawempe Division",
      traders: "850+",
      volume: "280 tons/wk",
    },
    {
      name: "Kireka Market",
      location: "Wakiso District",
      traders: "600+",
      volume: "190 tons/wk",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Tendo",
      role: "Market Officer, Nakasero",
      quote:
        "AgriHub transformed our market management. Registration that took days now takes minutes. The data quality is unmatched.",
      initial: "ST",
    },
    {
      name: "David Okello",
      role: "Analyst, Ministry of Agriculture",
      quote:
        "Real-time market data has fundamentally changed how we formulate agricultural policy. This is the future of governance.",
      initial: "DO",
    },
    {
      name: "Grace Akello",
      role: "Farmer, Wakiso District",
      quote:
        "I see fair prices before leaving my farm. AgriHub gives smallholder farmers a voice in the market.",
      initial: "GA",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-gray-900">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-16">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f6a34] text-white">
              <Leaf size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0f6a34]">
              AgriHub
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="#features"
              className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="#markets"
              className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Markets
            </a>
            <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-1">
              <button
                type="button"
                onClick={openPortal}
                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={openPortal}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0f6a34] rounded-lg hover:bg-[#0c5b2d] transition-colors shadow-sm"
              >
                Sign in
              </button>
            </div>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white px-4 pb-6 pt-4 md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                How it works
              </a>
              <a
                href="#markets"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Markets
              </a>
              <hr className="my-2 border-gray-100" />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openPortal();
                }}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 text-left"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openPortal();
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#0f6a34] rounded-lg hover:bg-[#0c5b2d] text-left"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-gray-200">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop&auto=format"
              alt=""
              className="h-full w-full object-cover object-[68%_28%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/70 lg:bg-white/0" />
            <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(to right, #fcfcf9 0%, #fcfcf9 calc(50vw + 64px), transparent calc(50vw + 344px))' }} />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-40">
            <div className="max-w-xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-gray-900">
                Real market data, for everyone who depends on it
              </h1>
              <p className="mt-5 text-lg text-white/90 lg:text-gray-600">
                AgriHub digitises Uganda's agricultural markets — from produce
                arrival to final sale — so farmers, traders, authorities, and
                government can rely on real numbers, not guesswork.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openPortal}
                  className="inline-flex items-center justify-center h-12 px-6 text-sm font-medium text-white bg-[#0f6a34] rounded-lg hover:bg-[#0c5b2d] transition-colors shadow-sm"
                >
                  Get started
                </button>
                <a
                  href="#markets"
                  className="inline-flex items-center justify-center h-12 px-6 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  View today's prices
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="border-y border-gray-200 bg-[#0f6a34]">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                {
                  label: "Farmers Registered",
                  value: counts.farmers.toLocaleString(),
                  suffix: "+",
                },
                {
                  label: "Produce Records",
                  value: counts.produce.toLocaleString(),
                  suffix: "+",
                },
                {
                  label: "Market Value (UGX)",
                  value: `${counts.value}B`,
                  suffix: "+",
                },
                {
                  label: "Transactions",
                  value: counts.txns.toLocaleString(),
                  suffix: "+",
                },
              ].map(({ label, value, suffix }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {value}<span className="text-green-300">{suffix}</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-green-100/80">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 items-start lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#0f6a34]">
                What is AgriHub?
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                A digital governance platform
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Used by market officials to register farmers and produce, verify quality, log prices, and record transactions — with every step rolling up into analytics that support better decisions.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                How it works
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {steps.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:shadow-sm transition-shadow"
                  >
                    <Icon size={22} className="text-[#0f6a34]" />
                    <p className="text-xs font-medium text-gray-700">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* <section
          data-observe
          className="mx-auto max-w-[92vw] xl:max-w-[1800px] px-5 py-12 md:px-8 md:py-16"
        >
          <div

            className={`text-center transition-all duration-700 ${visible.has("testimonials-section") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            id="testimonials-section"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6a6657]">
              Testimonials
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-[#121a12] sm:text-3xl">
              Trusted by market communities
            </h2>
          </div>
          <div
            className={`mt-8 grid gap-5 md:grid-cols-3 transition-all duration-700 delay-200 ${visible.has("testimonials-section") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            {testimonials.map(({ name, role, quote, initial }) => (
              <div
                key={name}
                className="rounded-2xl border border-[#ded6c7] bg-white p-6 shadow-[0_1px_0_rgba(17,24,39,0.02)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f6a34] text-sm font-bold text-white">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#121a12]">
                      {name}
                    </p>
                    <p className="text-xs text-[#66614f]">{role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#66614f] italic">
                  "{quote}"
                </p>
              </div>
            ))}
          </div>
        </section> */}

        <section
          id="markets"
          data-observe
          className="border-t border-gray-200"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div
              className={`transition-all duration-700 ${visible.has("markets") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                Participating markets
              </h2>
              <p className="mt-2 text-gray-600">
                Markets currently using AgriHub for digital governance and price
                transparency.
              </p>
            </div>
            <div
              className={`mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 delay-200 ${visible.has("markets") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              {markets.map((market) => (
                <article
                  key={market.name}
                  onClick={() => viewMarketPrices(market)}
                  className="group/card flex flex-col rounded-xl bg-white py-4 text-sm ring-1 ring-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="px-4 flex items-center justify-between pt-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {market.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        <MapPin size={12} className="inline mr-1" />
                        {market.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 px-4 flex items-center gap-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{market.traders} traders</span>
                    <span className="text-xs text-gray-500">{market.volume}</span>
                    <span className="ml-auto text-xs font-medium text-[#0f6a34] hover:underline cursor-pointer">
                      View today's prices &rarr;
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-observe className="border-t border-gray-200 bg-[#0f6a34]">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Ready to transform your market?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-green-100">
              Join the growing network of markets using digital governance for
              transparency and efficiency.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openPortal}
                className="inline-flex items-center justify-center h-12 px-6 text-sm font-medium text-[#0f6a34] bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Get started
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center h-12 px-6 text-sm font-medium text-white rounded-lg border border-green-400/50 hover:bg-white/10 transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f6a34] text-white">
                <Leaf size={14} />
              </div>
              <span className="text-sm font-bold text-gray-900">
                AgriHub
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 sm:mt-0">
              &copy; {new Date().getFullYear()} AgriHub — a digital agricultural market governance platform.
            </p>
          </div>
        </div>
      </footer>

      {showPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              onClick={closePortal}
              className="absolute right-3 top-3 z-10 rounded-lg bg-white/80 p-1.5 text-gray-500 hover:bg-white"
            >
              <X size={16} />
            </button>
            <div className="grid md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative hidden min-h-[520px] bg-[#0f6a34] p-10 md:flex md:flex-col md:justify-between">
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <Leaf size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">AgriHub</p>
                    <p className="text-sm text-green-100">
                      Agricultural Market Platform
                    </p>
                  </div>
                </div>
                <div className="relative mx-auto max-w-sm text-center">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=520&fit=crop&auto=format"
                    alt=""
                    className="h-52 w-full rounded-xl object-cover shadow-lg"
                  />
                </div>
                <div className="relative">
                  <p className="text-sm leading-6 text-green-100">
                    Digital agricultural governance for market officers,
                    farmers, and government teams.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 md:p-10">
                <div className="mb-8">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Sign in
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                    Welcome to AgriHub
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Authorized access only for market administrators and
                    officers.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#0f6a34] focus:ring-1 focus:ring-[#0f6a34]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#0f6a34] focus:ring-1 focus:ring-[#0f6a34]/20"
                      />
                    </div>
                  </div>
                  {loginError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-700">
                        {loginError}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        defaultChecked
                      />{" "}
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="font-medium text-[#0f6a34] transition hover:text-[#0c5b2d]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full rounded-lg bg-[#0f6a34] py-2.5 text-sm font-medium text-white hover:bg-[#0c5b2d] transition-colors disabled:opacity-50"
                  >
                    {loggingIn ? "Signing in..." : "Sign in"}
                  </button>
                </form>
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Shield size={12} /> Secure portal — authorized access only
                  </p>
                </div>
                <details className="group mt-4 rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer select-none text-xs font-medium text-gray-500 transition hover:text-gray-700">
                    Test Accounts
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-gray-500">
                    <p className="flex justify-between gap-4">
                      <span>Administrator</span>
                      <span className="font-mono">
                        admin@agrihub.com / admin123
                      </span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>Market Officer</span>
                      <span className="font-mono">
                        officer@agrihub.com / officer123
                      </span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>Government Officer</span>
                      <span className="font-mono">
                        gov@agrihub.com / gov123
                      </span>
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Prices Dialog */}
      <Dialog open={!!selectedMarket} onOpenChange={(o) => !o && closeMarketPrices()}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-[1600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Current Prices — {selectedMarket?.name}</DialogTitle>
            <DialogDescription className="text-base">
              Latest commodity prices at {selectedMarket?.location} — {selectedMarket?.traders} traders, {selectedMarket?.volume}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto space-y-6">
            {loadingPrices ? (
              <div className="text-center py-12 text-lg text-gray-500">Loading prices...</div>
            ) : marketPrices.length === 0 ? (
              <div className="text-center py-12 text-lg text-gray-500">No price data available</div>
            ) : (
              <>
              {(() => {
                const latest: Record<string, { price: number; unit: string }> = {};
                marketPrices.forEach((p: any) => {
                  if (!latest[p.commodity] || new Date(p.date) > new Date(latest[p.commodity].date)) {
                    latest[p.commodity] = p;
                  }
                });
                const chartData = Object.entries(latest).map(([name, p]: any) => ({ name, price: p.price }));
                if (chartData.length < 2) return null;
                return (
                  <div className="w-full">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Latest Prices by Commodity</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `UGX ${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [`UGX ${v.toLocaleString()}`, "Price"]} />
                        <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={[COLORS.primary, COLORS.info, COLORS.warning, COLORS.danger, "#8B5CF6", COLORS.success, COLORS.secondary][i % 7]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
              <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Commodity</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Price (UGX)</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Change</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Unit</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((p: any, i: number) => (
                    <tr key={p._id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-800 text-lg">{p.commodity}</td>
                      <td className="text-right py-4 px-4 text-gray-700 font-bold text-lg">UGX {p.price?.toLocaleString()}</td>
                      <td className="text-right py-4 px-4">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${(p.change || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {(p.change || 0) >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {Math.abs(p.change || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-gray-500">{p.unit || "kg"}</td>
                      <td className="text-right py-4 px-4 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Close</Btn>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// DASHBOARD
function DashboardScreen({ onNavigate }: { onNavigate?: (s: Screen) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [priceTrends, setPriceTrends] = useState<any[]>([]);
  const [weeklyTxns, setWeeklyTxns] = useState<any[]>([]);
  const [produceVol, setProduceVol] = useState<any[]>([]);
  const [revChart, setRevChart] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getDashboardStats(),
      api.getCommodityTrends({ period: 180 }),
      api.getMonthlyTransactions(),
      api.getProduceVolume(),
      api.getRevenue({ period: 180 }),
    ])
      .then(([statsRes, trendsRes, txnsRes, volRes, revRes]) => {
        if (!mounted) return;
        if (statsRes.data.data) setStats(statsRes.data.data);
        if (trendsRes.data.data) {
          const byMonth: Record<string, any> = {};
          const monthOrder: string[] = [];
          trendsRes.data.data.forEach((c: any) => {
            (c.data || []).forEach((d: any) => {
              const month = new Date(d.date).toLocaleString("en", {
                month: "short",
              });
              if (!byMonth[month]) {
                byMonth[month] = { month };
                monthOrder.push(month);
              }
              byMonth[month][c.commodity.toLowerCase()] = d.price;
            });
          });
          setPriceTrends(monthOrder.map((m) => byMonth[m]));
        }
        if (txnsRes.data.data) {
          setWeeklyTxns(
            txnsRes.data.data.map((m: any) => ({
              day:
                [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ][m.month] || `M${m.month}`,
              transactions: m.count,
              value: m.totalValue,
            })),
          );
        }
        if (volRes.data.data) {
          const fills = [
            COLORS.primary,
            COLORS.info,
            COLORS.danger,
            COLORS.warning,
            "#8B5CF6",
            COLORS.success,
            COLORS.secondary,
          ];
          setProduceVol(
            volRes.data.data.map((v: any, i: number) => ({
              name: v.commodity,
              value: v.totalQuantity,
              fill: fills[i % fills.length],
            })),
          );
        }
        if (revRes.data.data) {
          setRevChart(
            revRes.data.data.map((r: any) => ({
              month: new Date(r.date).toLocaleString("en", { month: "short" }),
              revenue: r.revenue,
              target: r.revenue * 1.1,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    api
      .getNotifications()
      .then(({ data }) => {
        if (data.data && mounted) {
          const acts = data.data.slice(0, 5).map((n) => ({
            action: n.title,
            user: "System",
            detail: n.message || "",
            time: new Date(n.createdAt).toLocaleDateString(),
            icon:
              n.type === "price"
                ? Tag
                : n.type === "verification"
                  ? ShieldCheck
                  : n.type === "system"
                    ? Settings
                    : BarChart2,
            color:
              n.type === "price"
                ? COLORS.warning
                : n.type === "verification"
                  ? COLORS.info
                  : n.type === "system"
                    ? "#8B5CF6"
                    : COLORS.success,
          }));
          if (mounted) setActivities(acts);
        }
      })
      .catch(() => {});
    fetch("https://wttr.in/Kampala?format=j1")
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setWeather(d.current_condition[0]);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const s = stats || {
    totalFarmers: 2847,
    registeredProduce: 1234,
    verifiedProduce: 1089,
    pendingVerification: 145,
    todayTransactions: { count: 156, value: 48200000 },
    marketValue: 48200000,
    monthlyRevenue: 2400000000,
    avgPrices: [{ commodity: "Maize", avgPrice: 1500 }],
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-xs font-medium mb-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="text-xl font-bold">
              {((h) =>
                h < 12
                  ? "Good Morning"
                  : h < 17
                    ? "Good Afternoon"
                    : "Good Evening")(new Date().getHours())}
              ,{" "}
              {(() => {
                try {
                  return (
                    JSON.parse(
                      localStorage.getItem("agrihub_user") || "{}",
                    ).name?.split(" ")[0] || "James"
                  );
                } catch {
                  return "James";
                }
              })()}
            </h2>
            <p className="text-green-200 text-sm mt-0.5">
              Here's what's happening at Nakasero Market today.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
            {weather ? (
              parseInt(weather.weatherCode) < 200 ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <CloudRain size={20} className="text-blue-200" />
              )
            ) : (
              <Sun size={20} className="text-yellow-300" />
            )}
            <div>
              <p className="text-lg font-bold">
                {weather ? `${weather.temp_C}°C` : "--°C"}
              </p>
              <p className="text-xs text-green-200">
                {weather
                  ? `${weather.weatherDesc[0].value}, Kampala`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Farmers"
          value={(s.totalFarmers || 0).toLocaleString()}
          sub={`+${s.farmersThisWeek || 12} this week`}
          color={COLORS.primary}
          trend={s.farmersThisWeek || 12}
          onClick={() => onNavigate?.("farmers")}
        />
        <StatCard
          icon={Package}
          label="Registered Produce"
          value={(s.registeredProduce || 0).toLocaleString()}
          sub={`+${s.produceToday || 45} today`}
          color={COLORS.info}
          trend={s.produceToday || 45}
          onClick={() => onNavigate?.("produce-registration")}
        />
        <StatCard
          icon={ShieldCheck}
          label="Verified Produce"
          value={(s.verifiedProduce || 0).toLocaleString()}
          sub={`${Math.round(((s.verifiedProduce || 1089) / (s.registeredProduce || 1234 || 1)) * 100)}% verified`}
          color={COLORS.success}
          trend={3}
          onClick={() => onNavigate?.("produce-verification")}
        />
        <StatCard
          icon={Clock}
          label="Pending Verification"
          value={(s.pendingVerification || 0).toLocaleString()}
          sub="+8 urgent"
          color={COLORS.warning}
          trend={-8}
          onClick={() => onNavigate?.("produce-verification")}
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Today's Transactions"
          value={(s.todayTransactions?.count || 0).toLocaleString()}
          sub="+23 from yesterday"
          color="#8B5CF6"
          trend={23}
          onClick={() => onNavigate?.("transactions")}
        />
        <StatCard
          icon={DollarSign}
          label="Today's Market Value"
          value={`UGX ${((s.todayTransactions?.value || s.marketValue || 48200000) / 1000000).toFixed(1)}M`}
          sub="+5.7% vs avg"
          color={COLORS.success}
          trend={5.7}
          onClick={() => onNavigate?.("transactions")}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Maize Price"
          value={`UGX ${(s.avgPrices?.find((p: any) => p.commodity === "Maize")?.avgPrice || 1500).toLocaleString()}/kg`}
          sub="+5.2% today"
          color={COLORS.secondary}
          trend={5.2}
          onClick={() => onNavigate?.("commodity-prices")}
        />
        <StatCard
          icon={BarChart2}
          label="Monthly Revenue"
          value={`UGX ${((s.monthlyRevenue || 2400000000) / 1000000).toFixed(0)}M`}
          sub="+11.8% vs last month"
          color={COLORS.danger}
          trend={11.8}
          onClick={() => onNavigate?.("market-analytics")}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="Commodity Price Trends (UGX/kg)"
          action={<Select options={["Last 6 months", "Last year"]} />}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="maize"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={false}
                name="Maize"
              />
              <Line
                type="monotone"
                dataKey="beans"
                stroke={COLORS.info}
                strokeWidth={2}
                dot={false}
                name="Beans"
              />
              <Line
                type="monotone"
                dataKey="tomatoes"
                stroke={COLORS.danger}
                strokeWidth={2}
                dot={false}
                name="Tomatoes"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Weekly Transactions"
          action={<Select options={["This week", "Last week"]} />}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTxns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="transactions"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
                name="Transactions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Produce by Commodity"
          action={<Select options={["Today", "This week"]} />}
        >
          <ResponsiveContainer width="100%" height={200}>
            <RPieChart>
              <Pie
                data={produceVol}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {produceVol.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </RPieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="lg:col-span-2">
          <Card
            title="Revenue vs Target (UGX Millions)"
            action={<Select options={["2024", "2023"]} />}
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(v: number) => `UGX ${(v / 1000000).toFixed(1)}M`}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activities">
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: a.color + "18" }}
                >
                  <a.icon size={13} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {a.action}
                  </p>
                  <p className="text-sm text-gray-500 leading-tight truncate">
                    {a.detail}
                  </p>
                  <p className="text-sm text-gray-400 leading-tight">
                    {a.time} · {a.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => onNavigate?.("produce-verification")}
        >
          <AlertTriangle
            size={18}
            className="text-yellow-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {s.pendingVerification || 145} Pending Verifications
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              8 items are urgent and require immediate inspection.
            </p>
          </div>
        </div>
        <div
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => onNavigate?.("commodity-prices")}
        >
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Maize Price Alert
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Prices up 5.2% today. Consider issuing a market advisory.
            </p>
          </div>
        </div>
        <div
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => onNavigate?.("reports")}
        >
          <CheckCircle
            size={18}
            className="text-green-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Daily Report Ready
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              June 15 market report is available for download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// FARMER MANAGEMENT
function FarmersScreen() {
  const [view, setView] = useState<"list" | "profile">("list");
  const [farmerList, setFarmerList] = useState<any[]>([]);
  const [selectedFarmer, setSelected] = useState<any | null>(null);
  const [produceHistory, setProduceHistory] = useState<any[]>([]);
  const [txnHistory, setTxnHistory] = useState<any[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any | null>(null);
  const [deletingFarmer, setDeletingFarmer] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    district: "",
    phone: "",
    produce: "",
  });
  const [saving, setSaving] = useState(false);

  const loadFarmers = () => {
    api
      .listFarmers({ limit: 50 })
      .then(({ data }) => {
        if (data.data?.farmers || data.data?.length) {
          const list = data.data.farmers || data.data;
          setFarmerList(
            list.map((f) => ({
              id: f.farmerId || f._id,
              _id: f._id,
              name: f.name,
              district: f.district,
              phone: f.phone,
              produce: f.produce,
              status: f.status,
              registered: new Date(f.registered).toISOString().split("T")[0],
            })),
          );
          setTotalFarmers(data.pagination?.total || list.length);
          if (!selectedFarmer) setSelected(list[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(loadFarmers, []);

  const loadFarmerProfile = async (farmerId) => {
    api
      .listProduce({ farmer: farmerId })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceHistory(
            list.slice(0, 5).map((p: any) => ({
              c: p.commodity,
              q: `${p.quantity} ${p.unit}`,
              d: new Date(p.arrivalDate).toISOString().split("T")[0],
              s: p.status,
            })),
          );
        }
      })
      .catch(() => {});
    api
      .listTransactions({ seller: farmerId })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.transactions || data.data;
          setTxnHistory(
            list.slice(0, 3).map((t: any) => ({
              id: t.transactionId || t._id,
              buyer: t.buyer,
              seller: t.seller,
              total: t.total,
              payment: t.payment,
              date: new Date(t.date).toLocaleString(),
            })),
          );
        }
      })
      .catch(() => {});
  };

  const selectFarmer = (f) => {
    setSelected(f);
    setView("profile");
    loadFarmerProfile(f._id || f.id);
  };

  const openAddModal = () => {
    setForm({ name: "", district: "Wakiso", phone: "", produce: "" });
    setEditingFarmer(null);
    setShowAddModal(true);
  };

  const openEditModal = (f) => {
    setForm({
      name: f.name,
      district: f.district,
      phone: f.phone,
      produce: f.produce,
    });
    setEditingFarmer(f);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingFarmer) {
        await api.updateFarmer(editingFarmer._id || editingFarmer.id, form);
      } else {
        await api.createFarmer(form);
      }
      setShowAddModal(false);
      setEditingFarmer(null);
      loadFarmers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save farmer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFarmer) return;
    setSaving(true);
    try {
      await api.deleteFarmer(deletingFarmer._id || deletingFarmer.id);
      setDeletingFarmer(null);
      if (
        view === "profile" &&
        (selectedFarmer?._id || selectedFarmer?.id) ===
          (deletingFarmer._id || deletingFarmer.id)
      ) {
        setView("list");
      }
      loadFarmers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete farmer");
    } finally {
      setSaving(false);
    }
  };

  if (view === "profile") {
    if (!selectedFarmer) return null;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
          >
            <ChevronRight size={14} className="rotate-180" /> Back to Farmers
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-w-0">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <User size={36} className="text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 break-words text-lg">
                {selectedFarmer.name}
              </h3>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-green-50 rounded-full text-xs font-mono font-semibold text-green-800">
                <Hash size={11} />
                {selectedFarmer.id || selectedFarmer.farmerId}
              </div>
              <div className="mt-2">
                <Badge label={selectedFarmer.status} color={COLORS.primary} />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              {[
                {
                  icon: MapPin,
                  label: "District",
                  value: selectedFarmer.district,
                },
                { icon: Phone, label: "Phone", value: selectedFarmer.phone },
                { icon: Leaf, label: "Produce", value: selectedFarmer.produce },
                {
                  icon: Calendar,
                  label: "Registered",
                  value: selectedFarmer.registered,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-gray-800 font-medium truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-gray-100">
              <Btn
                variant="outline"
                icon={Edit3}
                size="sm"
                className="flex-1"
                onClick={() => openEditModal(selectedFarmer)}
              >
                Edit
              </Btn>
              <Btn
                variant="danger"
                icon={Trash2}
                size="sm"
                className="flex-1"
                onClick={() => setDeletingFarmer(selectedFarmer)}
              >
                Delete
              </Btn>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Card title="Produce History">
              <Table headers={["Commodity", "Quantity", "Date", "Status"]}>
                {produceHistory.map((r, i) => (
                  <tr key={i}>
                    <Td>{r.c}</Td>
                    <Td>{r.q}</Td>
                    <Td>{r.d}</Td>
                    <Td>
                      <Badge label={r.s} color={COLORS.success} />
                    </Td>
                  </tr>
                ))}
              </Table>
            </Card>
            <Card title="Transaction History">
              <Table headers={["Ref", "Buyer", "Amount", "Payment", "Date"]}>
                {txnHistory.map((t) => (
                  <tr key={t.id}>
                    <Td>
                      <span className="font-mono text-xs text-green-700">
                        {t.id}
                      </span>
                    </Td>
                    <Td>{t.buyer}</Td>
                    <Td className="whitespace-nowrap">
                      UGX {t.total.toLocaleString()}
                    </Td>
                    <Td>{t.payment}</Td>
                    <Td className="text-xs text-gray-500 whitespace-nowrap">
                      {t.date}
                    </Td>
                  </tr>
                ))}
              </Table>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farmer Management"
        subtitle={`${farmerList.length} registered farmers`}
      >
        <Btn icon={Download} variant="outline" size="sm">
          Export
        </Btn>
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add Farmer
        </Btn>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-gray-200">
          <SearchBar
            placeholder="Search by name, ID, district..."
            className="flex-1 min-w-[220px]"
          />
          <Select
            options={[
              "All Districts",
              "Wakiso",
              "Mukono",
              "Lira",
              "Gulu",
              "Mbarara",
              "Kampala",
            ]}
          />
          <Select options={["All Status", "Active", "Inactive", "Pending"]} />
          <Btn icon={Filter} variant="outline" size="sm">
            Filter
          </Btn>
        </div>

        <Table
          headers={[
            "Farmer ID",
            "Name",
            "District",
            "Phone",
            "Produce",
            "Status",
            "Registered",
            "Actions",
          ]}
          headerClassNames={[
            "sticky left-0 bg-gray-50/80 z-10 after:absolute after:right-0 after:top-3 after:h-[calc(100%-24px)] after:w-px after:bg-gray-200",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]}
        >
          {farmerList.map((f) => (
            <tr
              key={f.id || f._id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              <Td className="sticky left-0 bg-white z-10 after:absolute after:right-0 after:top-3 after:h-[calc(100%-24px)] after:w-px after:bg-gray-100">
                <span className="font-mono text-xs text-green-700 font-semibold">
                  {f.id || f.farmerId}
                </span>
              </Td>
              <Td>
                <button
                  onClick={() => selectFarmer(f)}
                  className="font-semibold text-gray-800 hover:text-green-700 transition-colors"
                >
                  {f.name}
                </button>
              </Td>
              <Td>{f.district}</Td>
              <Td className="text-gray-500">{f.phone}</Td>
              <Td>
                <span className="text-gray-600">{f.produce}</span>
              </Td>
              <Td>
                <Badge label={f.status} color={COLORS.primary} />
              </Td>
              <Td className="text-gray-400">{f.registered}</Td>
              <Td>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => selectFarmer(f)}
                    className="w-8 h-8 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => openEditModal(f)}
                    className="w-8 h-8 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors flex items-center justify-center"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingFarmer(f)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm">
          <span className="text-gray-500">
            Showing 1–{farmerList.length} of {totalFarmers} farmers
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, "...", 48].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-colors ${p === 1 ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Farmer Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFarmer ? "Edit Farmer" : "Add New Farmer"}
            </DialogTitle>
            <DialogDescription>
              {editingFarmer
                ? "Update the farmer's details below."
                : "Fill in the details to register a new farmer."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              label="Full Name"
              placeholder="e.g. John Ssekandi"
              required
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +256 700 000 000"
              required
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  "Wakiso",
                  "Mukono",
                  "Lira",
                  "Gulu",
                  "Mbarara",
                  "Kampala",
                  "Jinja",
                  "Soroti",
                  "Mbale",
                ]}
                value={form.district}
                onChange={(v) => setForm((p) => ({ ...p, district: v }))}
              />
            </div>
            <Input
              label="Produce (comma-separated)"
              placeholder="e.g. Maize, Beans"
              required
              value={form.produce}
              onChange={(v) => setForm((p) => ({ ...p, produce: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingFarmer
                  ? "Update Farmer"
                  : "Add Farmer"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingFarmer}
        onOpenChange={() => setDeletingFarmer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Farmer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingFarmer?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PRODUCE REGISTRATION
function ProduceRegistrationScreen() {
  const [produceRecords, setProduceRecords] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);

  const [form, setForm] = useState({
    farmerId: "",
    farmerName: "",
    commodity: "",
    quantity: "",
    unit: "kg",
    sourceDistrict: "",
    arrivalDate: "",
    vehiclePlate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduce, setEditingProduce] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    commodity: "",
    quantity: "",
    unit: "kg",
    sourceDistrict: "",
    arrivalDate: "",
    vehiclePlate: "",
    notes: "",
  });
  const [showDetail, setShowDetail] = useState<any | null>(null);
  const [deletingProduce, setDeletingProduce] = useState<any | null>(null);

  const loadProduce = () => {
    api
      .listProduce({ limit: 20 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceRecords(
            list.map((p: any) => ({
              _id: p._id,
              id: p.produceId || p._id,
              farmer: p.farmerName || p.farmer?.name || "Unknown",
              farmerId: p.farmer?._id || p.farmer,
              c: p.commodity,
              q: `${p.quantity} ${p.unit}`,
              quantity: p.quantity,
              unit: p.unit,
              d: p.sourceDistrict,
              date: new Date(p.arrivalDate).toISOString().split("T")[0],
              s: p.status,
            })),
          );
        }
      })
      .catch(() => {});
  };

  const loadFarmers = () => {
    api
      .listFarmers({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.farmers || data.data;
          setFarmers(list);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProduce();
    loadFarmers();
  }, []);

  const filteredFarmers = farmers
    .filter(
      (f: any) =>
        (f.name || "").toLowerCase().includes(farmerSearch.toLowerCase()) ||
        (f.farmerId || "").toLowerCase().includes(farmerSearch.toLowerCase()),
    )
    .slice(0, 10);

  const selectFarmer = (f: any) => {
    setForm((p) => ({
      ...p,
      farmerId: f._id,
      farmerName: `${f.farmerId} - ${f.name}`,
    }));
    setFarmerSearch(`${f.farmerId} - ${f.name}`);
    setShowFarmerDropdown(false);
  };

  const resetForm = () => {
    setForm({
      farmerId: "",
      farmerName: "",
      commodity: "",
      quantity: "",
      unit: "kg",
      sourceDistrict: "",
      arrivalDate: "",
      vehiclePlate: "",
      notes: "",
    });
    setFarmerSearch("");
  };

  const handleSave = async () => {
    const missing = [];
    if (!form.farmerId) missing.push("Farmer");
    if (!form.commodity || form.commodity.includes("Select"))
      missing.push("Commodity");
    if (!form.quantity) missing.push("Quantity");
    if (!form.sourceDistrict || form.sourceDistrict.includes("Select"))
      missing.push("Source District");
    if (!form.arrivalDate) missing.push("Arrival Date");
    if (missing.length) {
      alert("Please fill in: " + missing.join(", "));
      return;
    }
    setSaving(true);
    try {
      await api.registerProduce({
        farmer: form.farmerId,
        commodity: form.commodity,
        quantity: Number(form.quantity),
        unit: form.unit,
        sourceDistrict: form.sourceDistrict,
        arrivalDate: form.arrivalDate,
        vehiclePlate: form.vehiclePlate || undefined,
        notes: form.notes || undefined,
      });
      resetForm();
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save produce");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (r: any) => {
    setEditingProduce(r);
    setEditForm({
      commodity: r.c,
      quantity: r.quantity || r.q.replace(/[^0-9]/g, ""),
      unit: r.unit || (r.q.includes("tonnes") ? "tonnes" : "kg"),
      sourceDistrict: r.d,
      arrivalDate: r.date,
      vehiclePlate: "",
      notes: "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editingProduce) return;
    setSaving(true);
    try {
      await api.updateProduce(editingProduce._id, {
        commodity: editForm.commodity,
        quantity: Number(editForm.quantity),
        unit: editForm.unit,
        sourceDistrict: editForm.sourceDistrict,
        arrivalDate: editForm.arrivalDate,
      });
      setShowEditModal(false);
      setEditingProduce(null);
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update produce");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduce) return;
    setSaving(true);
    try {
      await api.deleteProduce(deletingProduce._id);
      setDeletingProduce(null);
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete produce");
    } finally {
      setSaving(false);
    }
  };

  const totalQuantity = produceRecords.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0),
    0,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produce Registration"
        subtitle="Register agricultural produce arriving at Nakasero Market"
      >
        <Btn
          icon={RefreshCw}
          variant="outline"
          size="sm"
          onClick={() => {
            resetForm();
            loadProduce();
          }}
        >
          Reset
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <Card title="Register New Produce">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Farmer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />
                  <input
                    type="text"
                    placeholder="Search farmer by ID or name..."
                    value={farmerSearch}
                    onChange={(e) => {
                      setFarmerSearch(e.target.value);
                      setForm((p) => ({ ...p, farmerId: "" }));
                      setShowFarmerDropdown(true);
                    }}
                    onFocus={() => setShowFarmerDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowFarmerDropdown(false), 200)
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>
                {showFarmerDropdown && filteredFarmers.length > 0 && (
                  <div className="absolute z-20 mt-1 w-[calc(100%-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredFarmers.map((f: any) => (
                      <button
                        key={f._id}
                        onMouseDown={() => selectFarmer(f)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="font-mono text-xs text-green-700 font-semibold">
                          {f.farmerId}
                        </span>
                        <span className="ml-2 text-gray-800">{f.name}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          {f.district}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Commodity <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.commodity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, commodity: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="">Select commodity...</option>
                  <option value="Maize">Maize</option>
                  <option value="Beans">Beans</option>
                  <option value="Tomatoes">Tomatoes</option>
                  <option value="Onions">Onions</option>
                  <option value="Cassava">Cassava</option>
                  <option value="Sweet Potato">Sweet Potato</option>
                  <option value="Groundnuts">Groundnuts</option>
                  <option value="Sorghum">Sorghum</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantity"
                  placeholder="e.g. 500"
                  required
                  value={form.quantity}
                  onChange={(v) => setForm((p) => ({ ...p, quantity: v }))}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit: e.target.value }))
                    }
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  >
                    <option value="kg">kg</option>
                    <option value="tonnes">tonnes</option>
                    <option value="bags">bags</option>
                    <option value="crates">crates</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Source District <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.sourceDistrict}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sourceDistrict: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="">Select district...</option>
                  <option value="Wakiso">Wakiso</option>
                  <option value="Mukono">Mukono</option>
                  <option value="Lira">Lira</option>
                  <option value="Gulu">Gulu</option>
                  <option value="Mbarara">Mbarara</option>
                  <option value="Kampala">Kampala</option>
                  <option value="Jinja">Jinja</option>
                  <option value="Soroti">Soroti</option>
                  <option value="Mbale">Mbale</option>
                </select>
              </div>
              <Input
                label="Arrival Date"
                type="date"
                required
                value={form.arrivalDate}
                onChange={(v) => setForm((p) => ({ ...p, arrivalDate: v }))}
              />
              <Input
                label="Vehicle Plate Number"
                placeholder="e.g. UAA 123B"
                value={form.vehiclePlate}
                onChange={(v) => setForm((p) => ({ ...p, vehiclePlate: v }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional notes about the produce..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <Btn className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Produce"}
                </Btn>
                <Btn variant="outline" className="flex-1" onClick={resetForm}>
                  Cancel
                </Btn>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={Package}
              label="Today's Arrivals"
              value={produceRecords.length.toString()}
              sub="Registered today"
              color={COLORS.primary}
            />
            <StatCard
              icon={Leaf}
              label="Total Produce"
              value={`${totalQuantity.toLocaleString()} kg`}
              sub="Across all records"
              color={COLORS.info}
            />
            <StatCard
              icon={Clock}
              label="Pending Verification"
              value={produceRecords
                .filter((r) => r.s === "Pending")
                .length.toString()}
              sub="Awaiting inspection"
              color={COLORS.warning}
            />
          </div>

          <Card title="Recent Produce Registrations">
            <div className="flex items-center gap-3 mb-4">
              <SearchBar
                placeholder="Search produce records..."
                className="flex-1"
              />
              <Select
                options={["All Commodities", "Maize", "Beans", "Tomatoes"]}
              />
            </div>
            <Table
              headers={[
                "Reg. ID",
                "Farmer",
                "Commodity",
                "Quantity",
                "Source",
                "Arrival Date",
                "Status",
                "",
              ]}
            >
              {produceRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {r.id}
                    </span>
                  </Td>
                  <Td className="font-medium">{r.farmer}</Td>
                  <Td>{r.c}</Td>
                  <Td>{r.q}</Td>
                  <Td>{r.d}</Td>
                  <Td className="text-xs">{r.date}</Td>
                  <Td>
                    <Badge label={r.s} color={COLORS.primary} />
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowDetail(r)}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingProduce(r)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produce Details</DialogTitle>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs font-semibold text-green-700">
                  Registration ID
                </p>
                <p className="font-mono font-bold text-gray-900">
                  {showDetail.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Farmer</p>
                  <p className="font-medium">{showDetail.farmer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Commodity</p>
                  <p className="font-medium">{showDetail.c}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className="font-medium">{showDetail.q}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Source District</p>
                  <p className="font-medium">{showDetail.d}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Arrival Date</p>
                  <p className="font-medium">{showDetail.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <Badge label={showDetail.s} color={COLORS.primary} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Close</Btn>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produce Record</DialogTitle>
            <DialogDescription>Update the produce details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Commodity <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  "Maize",
                  "Beans",
                  "Tomatoes",
                  "Onions",
                  "Cassava",
                  "Sweet Potato",
                  "Groundnuts",
                  "Sorghum",
                ]}
                value={editForm.commodity}
                onChange={(v) => setEditForm((p) => ({ ...p, commodity: v }))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                required
                value={editForm.quantity}
                onChange={(v) => setEditForm((p) => ({ ...p, quantity: v }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Unit
                </label>
                <Select
                  options={["kg", "tonnes", "bags", "crates", "boxes"]}
                  value={editForm.unit}
                  onChange={(v) => setEditForm((p) => ({ ...p, unit: v }))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Source District <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  "Wakiso",
                  "Mukono",
                  "Lira",
                  "Gulu",
                  "Mbarara",
                  "Kampala",
                  "Jinja",
                  "Soroti",
                  "Mbale",
                ]}
                value={editForm.sourceDistrict}
                onChange={(v) =>
                  setEditForm((p) => ({ ...p, sourceDistrict: v }))
                }
                className="w-full"
              />
            </div>
            <Input
              label="Arrival Date"
              type="date"
              required
              value={editForm.arrivalDate}
              onChange={(v) => setEditForm((p) => ({ ...p, arrivalDate: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Update"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingProduce}
        onOpenChange={() => setDeletingProduce(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Produce Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingProduce?.id}</strong> ({deletingProduce?.c})?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PRODUCE VERIFICATION
function ProduceVerificationScreen() {
  const [selected, setSelected] = useState<any | null>(null);
  const [produceList, setProduceList] = useState<any[]>([]);

  const [grade, setGrade] = useState("");
  const [qualityStatus, setQualityStatus] = useState("");
  const [moistureContent, setMoistureContent] = useState("");
  const [inspectorComments, setInspectorComments] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPendingProduce = () => {
    api
      .listProduce({ limit: 50, status: "Pending" })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceList(
            list.map((p: any) => ({
              _id: p._id,
              id: p.produceId || p._id,
              farmer: p.farmerName || p.farmer?.name || "Unknown",
              farmerObj: p.farmer,
              commodity: p.commodity,
              quantity: `${p.quantity} ${p.unit}`,
              district: p.sourceDistrict,
              arrived: new Date(p.arrivalDate).toISOString().split("T")[0],
              status: p.status,
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(loadPendingProduce, []);

  const selectItem = (p: any) => {
    setSelected(p);
    setGrade("");
    setQualityStatus("");
    setMoistureContent("");
    setInspectorComments("");
    setInspectorName("");
  };

  const resetForm = () => {
    setSelected(null);
    setGrade("");
    setQualityStatus("");
    setMoistureContent("");
    setInspectorComments("");
    setInspectorName("");
  };

  const handleVerify = async (approved: boolean) => {
    if (!selected) return;
    if (!grade) {
      alert("Please select a quality grade");
      return;
    }
    if (!qualityStatus) {
      alert("Please select a quality status");
      return;
    }
    if (!inspectorComments) {
      alert("Please enter inspector comments");
      return;
    }

    setSaving(true);
    try {
      const produce = produceList.find((p: any) => p._id === selected._id);
      const farmerId =
        produce?.farmerObj?._id || produce?.farmerObj || selected._id;
      await api.createVerification({
        produce: selected._id,
        farmer: farmerId,
        commodity: selected.commodity,
        quantity: parseFloat(selected.quantity?.split(" ")[0]) || 0,
        district: selected.district,
        arrived: selected.arrived,
        grade: grade.replace("Grade ", ""),
        qualityStatus,
        inspectorComments,
        inspectorName: inspectorName || "Anonymous",
        moistureContent: moistureContent ? Number(moistureContent) : undefined,
      });
      resetForm();
      loadPendingProduce();
      alert(`Produce ${approved ? "approved" : "rejected"} successfully`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = produceList.filter((p) => p.status === "Pending").length;
  const reviewCount = produceList.filter(
    (p) => p.status === "Under Review",
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produce Verification"
        subtitle="Inspect and verify quality of registered produce"
      >
        <StatCard
          icon={Clock}
          label="Pending"
          value={String(pendingCount)}
          sub="awaiting inspection"
          color={COLORS.warning}
        />
        <StatCard
          icon={AlertCircle}
          label="Under Review"
          value={String(reviewCount)}
          sub="being inspected"
          color={COLORS.info}
        />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card
            title="Pending Verification Queue"
            action={
              <Btn
                icon={RefreshCw}
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadPendingProduce();
                  resetForm();
                }}
              >
                Refresh
              </Btn>
            }
          >
            <Table
              headers={[
                "ID",
                "Farmer",
                "Commodity",
                "Quantity",
                "Origin",
                "Arrived",
                "Status",
                "",
              ]}
            >
              {produceList.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === p.id ? "bg-green-50" : ""}`}
                  onClick={() => selectItem(p)}
                >
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {p.id}
                    </span>
                  </Td>
                  <Td className="font-medium">{p.farmer}</Td>
                  <Td>{p.commodity}</Td>
                  <Td>{p.quantity}</Td>
                  <Td>{p.district}</Td>
                  <Td className="text-xs">{p.arrived}</Td>
                  <Td>
                    <Badge
                      label={p.status}
                      color={
                        p.status === "Under Review"
                          ? COLORS.info
                          : COLORS.warning
                      }
                    />
                  </Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectItem(p);
                      }}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <Eye size={12} />
                    </button>
                  </Td>
                </tr>
              ))}
              {produceList.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-center text-gray-400 py-8">
                    No pending produce records
                  </Td>
                </tr>
              )}
            </Table>
          </Card>
        </div>

        <div>
          {selected ? (
            <Card title="Verification Form">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-800">
                    Ref: {selected.id}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selected.farmer}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selected.commodity} · {selected.quantity} ·{" "}
                    {selected.district}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Quality Grade <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Grade A", "Grade B", "Grade C"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`py-2 text-xs rounded-lg border-2 font-semibold transition-all ${grade === g ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Quality Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qualityStatus}
                    onChange={(e) => setQualityStatus(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  >
                    <option value="">Select status...</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 14.5"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Inspector Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter inspection notes..."
                    value={inspectorComments}
                    onChange={(e) => setInspectorComments(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleVerify(true)}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> {saving ? "Saving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleVerify(false)}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> {saving ? "Saving..." : "Reject"}
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a produce item to verify</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// COMMODITY PRICES
function CommodityPricesScreen() {
  const [prices, setPrices] = useState<any[]>([]);
  const [priceTrends, setPriceTrends] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any | null>(null);
  const [deletingPrice, setDeletingPrice] = useState<any | null>(null);
  const [form, setForm] = useState({
    commodity: "",
    price: "",
    grade: "A",
    date: "",
  });
  const [saving, setSaving] = useState(false);

  const loadPrices = () => {
    api
      .listPrices({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.prices || data.data;
          setPrices(
            list.map((p: any) => ({
              _id: p._id,
              id: p._id,
              commodity: p.commodity,
              unit: p.unit,
              price: p.price,
              change: p.change || 0,
              date: new Date(p.date).toISOString().split("T")[0],
              grade: p.grade,
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPrices();
    api
      .getCommodityTrends({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          const byMonth: Record<string, any> = {};
          const monthOrder: string[] = [];
          data.data.forEach((c: any) => {
            (c.data || []).forEach((d: any) => {
              const month = new Date(d.date).toLocaleString("en", {
                month: "short",
              });
              if (!byMonth[month]) {
                byMonth[month] = { month };
                monthOrder.push(month);
              }
              byMonth[month][c.commodity.toLowerCase()] = d.price;
            });
          });
          setPriceTrends(monthOrder.map((m) => byMonth[m]));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = prices.filter((c) =>
    c.commodity.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openAddModal = () => {
    setForm({
      commodity: "Maize",
      price: "",
      grade: "A",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingPrice(null);
    setShowAddModal(true);
  };

  const openEditModal = (c: any) => {
    setForm({
      commodity: c.commodity,
      price: String(c.price),
      grade: c.grade || "A",
      date: c.date,
    });
    setEditingPrice(c);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.commodity || !form.price || !form.date) {
      alert("Please fill in commodity, price, and date");
      return;
    }
    setSaving(true);
    try {
      if (editingPrice) {
        await api.updatePrice(editingPrice._id, {
          commodity: form.commodity,
          price: Number(form.price),
          grade: form.grade,
          date: form.date,
        });
      } else {
        await api.createPrice({
          commodity: form.commodity,
          price: Number(form.price),
          unit: "kg",
          grade: form.grade,
          date: form.date,
        });
      }
      setShowAddModal(false);
      setEditingPrice(null);
      loadPrices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save price");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPrice) return;
    setSaving(true);
    try {
      await api.deletePrice(deletingPrice._id);
      setDeletingPrice(null);
      loadPrices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete price");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "Commodity",
      "Grade",
      "Price (UGX/kg)",
      "Change (%)",
      "Date",
    ];
    const rows = prices.map((c) => [
      c.commodity,
      c.grade,
      c.price,
      c.change,
      c.date,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commodity_prices_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commodity Price Management"
        subtitle="Daily market prices at Nakasero Market"
      >
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add Price
        </Btn>
        <Btn icon={Download} variant="outline" size="sm" onClick={handleExport}>
          Export
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={`Today's Commodity Prices — ${today}`}
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search commodity..."
                  className="w-48"
                  value={search}
                  onChange={(v) => setSearch(v)}
                />
                <Btn
                  icon={RefreshCw}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    loadPrices();
                    setPage(1);
                  }}
                >
                  Refresh
                </Btn>
              </div>
            }
          >
            <Table
              headers={[
                "Commodity",
                "Grade",
                "Price (UGX/kg)",
                "Change",
                "Updated",
                "",
              ]}
            >
              {pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                        <Leaf size={12} className="text-green-700" />
                      </div>
                      <span className="font-semibold text-gray-800">
                        {c.commodity}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs font-bold text-green-700">
                      {c.grade}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-base font-bold text-gray-900">
                      {c.price.toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold ${c.change > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {c.change > 0 ? (
                        <ArrowUp size={11} />
                      ) : (
                        <ArrowDown size={11} />
                      )}
                      {Math.abs(c.change)}%
                    </span>
                  </Td>
                  <Td className="text-xs text-gray-500">{c.date}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingPrice(c)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-gray-400 py-8">
                    No prices found
                  </Td>
                </tr>
              )}
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm">
                <span className="text-gray-500">
                  Page {page} of {totalPages} ({filtered.length} items)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg ${p === page ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>

          <Card title="Price Trend — Maize vs Beans (Jan–Jun 2024)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={priceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="maize"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  name="Maize"
                />
                <Line
                  type="monotone"
                  dataKey="beans"
                  stroke={COLORS.info}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.info, r: 4 }}
                  name="Beans"
                />
                <Line
                  type="monotone"
                  dataKey="tomatoes"
                  stroke={COLORS.danger}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.danger, r: 4 }}
                  name="Tomatoes"
                />
                <Line
                  type="monotone"
                  dataKey="onions"
                  stroke={COLORS.warning}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.warning, r: 4 }}
                  name="Onions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Top Movers Today">
            <div className="space-y-3">
              {[...prices]
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 4)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                        <Leaf size={10} className="text-green-700" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {c.commodity}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        UGX {c.price.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${c.change > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {c.change > 0 ? (
                          <ArrowUp size={9} />
                        ) : (
                          <ArrowDown size={9} />
                        )}
                        {Math.abs(c.change)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Price Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? "Edit Price" : "Add New Price"}
            </DialogTitle>
            <DialogDescription>
              {editingPrice
                ? "Update the commodity price below."
                : "Enter the commodity price details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Commodity <span className="text-red-500">*</span>
              </label>
              <select
                value={form.commodity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, commodity: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="Maize">Maize</option>
                <option value="Beans">Beans</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Onions">Onions</option>
                <option value="Cassava">Cassava</option>
                <option value="Sweet Potato">Sweet Potato</option>
                <option value="Groundnuts">Groundnuts</option>
                <option value="Sorghum">Sorghum</option>
              </select>
            </div>
            <Input
              label="Price (UGX/kg)"
              placeholder="e.g. 1500"
              type="number"
              required
              value={form.price}
              onChange={(v) => setForm((p) => ({ ...p, price: v }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Grade
              </label>
              <select
                value={form.grade}
                onChange={(e) =>
                  setForm((p) => ({ ...p, grade: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <Input
              label="Effective Date"
              type="date"
              required
              value={form.date}
              onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingPrice
                  ? "Update Price"
                  : "Add Price"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingPrice}
        onOpenChange={() => setDeletingPrice(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Price</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the price for{" "}
              <strong>{deletingPrice?.commodity}</strong> (
              {deletingPrice?.grade})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// TRANSACTIONS
function TransactionsScreen() {
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [txnList, setTxnList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Methods");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showNewTxn, setShowNewTxn] = useState(false);
  const [form, setForm] = useState({
    buyer: "",
    seller: "",
    commodity: "",
    qtyNum: "",
    unitPrice: "",
    payment: "Mobile Money",
  });
  const [saving, setSaving] = useState(false);

  const loadTxns = () => {
    api
      .listTransactions({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.transactions || data.data;
          setTxnList(
            list.map((t: any) => ({
              _id: t._id,
              id: t.transactionId || t._id,
              buyer: t.buyer,
              seller: t.seller,
              commodity: t.commodity,
              qty: t.qty || `${t.qtyNum || 0} kg`,
              qtyNum: t.qtyNum,
              unitPrice: t.unitPrice,
              total: t.total,
              payment: t.payment,
              date: new Date(t.date || t.createdAt).toLocaleString(),
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(loadTxns, []);

  const filtered = txnList.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(q) ||
      t.buyer.toLowerCase().includes(q) ||
      t.seller.toLowerCase().includes(q);
    const matchPayment =
      paymentFilter === "All Methods" || t.payment === paymentFilter;
    return matchSearch && matchPayment;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

  const totVal = filtered.reduce((s, t) => s + (t.total || 0), 0);
  const todayTxns = filtered.filter(
    (t) => new Date(t.date).toDateString() === new Date().toDateString(),
  );

  const computedTotal =
    (Number(form.qtyNum) || 0) * (Number(form.unitPrice) || 0);

  const resetForm = () =>
    setForm({
      buyer: "",
      seller: "",
      commodity: "",
      qtyNum: "",
      unitPrice: "",
      payment: "Mobile Money",
    });

  const handleSaveTxn = async () => {
    if (
      !form.buyer ||
      !form.seller ||
      !form.commodity ||
      !form.qtyNum ||
      !form.unitPrice
    ) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await api.createTransaction({
        buyer: form.buyer,
        seller: form.seller,
        commodity: form.commodity,
        quantity: `${Number(form.qtyNum)} kg`,
        qtyNum: Number(form.qtyNum),
        unitPrice: Number(form.unitPrice),
        payment: form.payment,
        date: new Date().toISOString(),
      });
      resetForm();
      setShowNewTxn(false);
      loadTxns();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReport = () => window.print();

  const handlePrintReceipt = () => {
    const el = document.getElementById("receipt-content");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:20px;max-width:350px;margin:auto}table{width:100%}td{padding:4px 0}.total{border-top:2px solid #000;font-weight:bold;font-size:18px}</style></head><body>${el.innerHTML}</body></html>`,
    );
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transaction Management"
        subtitle="Record and track all market transactions"
      >
        <Btn
          icon={Plus}
          size="sm"
          onClick={() => {
            resetForm();
            setShowNewTxn(true);
          }}
        >
          New Transaction
        </Btn>
        <Btn
          icon={Printer}
          variant="outline"
          size="sm"
          onClick={handlePrintReport}
        >
          Print Report
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={ArrowLeftRight}
              label="Today"
              value={String(todayTxns.length)}
              sub="transactions"
              color={COLORS.primary}
            />
            <StatCard
              icon={DollarSign}
              label="Total Value"
              value={`UGX ${totVal.toLocaleString()}`}
              sub="all records"
              color={COLORS.success}
            />
            <StatCard
              icon={Hash}
              label="Total Records"
              value={String(filtered.length)}
              sub="filtered"
              color={COLORS.warning}
            />
          </div>

          <Card
            title="Transaction History"
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search TXN ID, buyer, seller..."
                  className="w-48"
                  value={search}
                  onChange={setSearch}
                />
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="All Methods">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            }
          >
            <Table
              headers={[
                "TXN ID",
                "Buyer",
                "Seller",
                "Commodity",
                "Qty",
                "Total (UGX)",
                "Payment",
                "Date",
                "",
              ]}
            >
              {pageItems.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedTxn?.id === t.id ? "bg-green-50" : ""}`}
                  onClick={() => setSelectedTxn(t)}
                >
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {t.id}
                    </span>
                  </Td>
                  <Td className="font-medium text-xs">{t.buyer}</Td>
                  <Td className="text-xs">{t.seller}</Td>
                  <Td>{t.commodity}</Td>
                  <Td>{t.qty}</Td>
                  <Td>
                    <span className="font-bold">
                      {t.total?.toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs">{t.payment}</span>
                  </Td>
                  <Td className="text-xs text-gray-500">{t.date}</Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTxn(t);
                        setShowReceipt(true);
                      }}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <Eye size={12} />
                    </button>
                  </Td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <Td colSpan={9} className="text-center text-gray-400 py-8">
                    No transactions found
                  </Td>
                </tr>
              )}
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm">
                <span className="text-gray-500">
                  Page {page} of {totalPages} ({filtered.length} items)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg ${p === page ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Record New Transaction">
            <div className="space-y-3">
              <Input
                label="Buyer Name"
                placeholder="Company or individual name"
                required
                value={form.buyer}
                onChange={(v) => setForm((p) => ({ ...p, buyer: v }))}
              />
              <Input
                label="Seller (Farmer)"
                placeholder="Farmer name"
                required
                value={form.seller}
                onChange={(v) => setForm((p) => ({ ...p, seller: v }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Commodity <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.commodity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, commodity: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="">Select commodity...</option>
                  <option value="Maize">Maize</option>
                  <option value="Beans">Beans</option>
                  <option value="Tomatoes">Tomatoes</option>
                  <option value="Onions">Onions</option>
                  <option value="Cassava">Cassava</option>
                  <option value="Sorghum">Sorghum</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity (kg)"
                  placeholder="500"
                  type="number"
                  required
                  value={form.qtyNum}
                  onChange={(v) => setForm((p) => ({ ...p, qtyNum: v }))}
                />
                <Input
                  label="Unit Price (UGX)"
                  placeholder="1500"
                  type="number"
                  required
                  value={form.unitPrice}
                  onChange={(v) => setForm((p) => ({ ...p, unitPrice: v }))}
                />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-700">
                  UGX {computedTotal.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={form.payment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, payment: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <Btn className="w-full" onClick={handleSaveTxn} disabled={saving}>
                {saving ? "Saving..." : "Record Transaction"}
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={showNewTxn} onOpenChange={setShowNewTxn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
            <DialogDescription>
              Record a new market transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              label="Buyer Name"
              placeholder="Company or individual name"
              required
              value={form.buyer}
              onChange={(v) => setForm((p) => ({ ...p, buyer: v }))}
            />
            <Input
              label="Seller (Farmer)"
              placeholder="Farmer name"
              required
              value={form.seller}
              onChange={(v) => setForm((p) => ({ ...p, seller: v }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Commodity <span className="text-red-500">*</span>
              </label>
              <select
                value={form.commodity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, commodity: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="">Select commodity...</option>
                <option value="Maize">Maize</option>
                <option value="Beans">Beans</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Onions">Onions</option>
                <option value="Cassava">Cassava</option>
                <option value="Sorghum">Sorghum</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity (kg)"
                placeholder="500"
                type="number"
                required
                value={form.qtyNum}
                onChange={(v) => setForm((p) => ({ ...p, qtyNum: v }))}
              />
              <Input
                label="Unit Price (UGX)"
                placeholder="1500"
                type="number"
                required
                value={form.unitPrice}
                onChange={(v) => setForm((p) => ({ ...p, unitPrice: v }))}
              />
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-green-700">
                UGX {computedTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Payment Method
              </label>
              <select
                value={form.payment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, payment: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSaveTxn} disabled={saving}>
              {saving ? "Saving..." : "Record Transaction"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowReceipt(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Market Receipt</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div id="receipt-content">
              <div className="text-center border-b border-gray-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-2">
                  <Leaf size={18} className="text-white" />
                </div>
                <p className="font-bold text-gray-900">Nakasero Market</p>
                <p className="text-xs text-gray-500">
                  Kampala Capital City Authority
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  E-Governance AgriHub
                </p>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {[
                  ["Receipt No", selectedTxn.id],
                  ["Date", selectedTxn.date],
                  ["Buyer", selectedTxn.buyer],
                  ["Seller", selectedTxn.seller],
                  ["Commodity", selectedTxn.commodity],
                  ["Quantity", selectedTxn.qty],
                  [
                    "Unit Price",
                    `UGX ${(selectedTxn.unitPrice || 0).toLocaleString()}`,
                  ],
                  ["Payment", selectedTxn.payment],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-base">
                  <span>TOTAL</span>
                  <span className="text-green-700">
                    UGX {(selectedTxn.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Btn
                icon={Printer}
                className="flex-1"
                size="sm"
                onClick={handlePrintReceipt}
              >
                Print
              </Btn>
              <Btn
                icon={Download}
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={handlePrintReceipt}
              >
                PDF
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MARKET ANALYTICS
function MarketAnalyticsScreen() {
  const [topFarmers, setTopFarmers] = useState<any[]>([]);
  const [marketData, setMarketData] = useState({
    priceTrends: [] as any[],
    weeklyTxns: [] as any[],
    produceVol: [] as any[],
    revChart: [] as any[],
  });

  useEffect(() => {
    api
      .listFarmers({ limit: 5, sort: "-createdAt" })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.farmers || data.data;
          setTopFarmers(
            list.map((f: any, i: number) => ({
              id: f.farmerId || f._id,
              name: f.name,
              district: f.district,
              produce: f.produce,
              phone: f.phone,
              status: f.status,
              registered: new Date(f.registered).toISOString().split("T")[0],
              volume: 2000 - i * 300,
            })),
          );
        }
      })
      .catch(() => {});

    api
      .getCommodityTrends({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          const byMonth: Record<string, any> = {};
          const monthOrder: string[] = [];
          data.data.forEach((c: any) => {
            (c.data || []).forEach((d: any) => {
              const month = new Date(d.date).toLocaleString("en", {
                month: "short",
              });
              if (!byMonth[month]) {
                byMonth[month] = { month };
                monthOrder.push(month);
              }
              byMonth[month][c.commodity.toLowerCase()] = d.price;
            });
          });
          setMarketData((prev) => ({
            ...prev,
            priceTrends: monthOrder.map((m) => byMonth[m]),
          }));
        }
      })
      .catch(() => {});

    api
      .getMonthlyTransactions()
      .then(({ data }) => {
        if (data.data) {
          setMarketData((prev) => ({
            ...prev,
            weeklyTxns: data.data.map((m: any) => ({
              day:
                [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ][m.month] || `M${m.month}`,
              transactions: m.count,
              value: m.totalValue,
            })),
          }));
        }
      })
      .catch(() => {});

    api
      .getProduceVolume()
      .then(({ data }) => {
        if (data.data) {
          const fills = [
            COLORS.primary,
            COLORS.info,
            COLORS.danger,
            COLORS.warning,
            "#8B5CF6",
            COLORS.success,
            COLORS.secondary,
          ];
          setMarketData((prev) => ({
            ...prev,
            produceVol: data.data.map((v: any, i: number) => ({
              name: v.commodity,
              value: v.totalQuantity,
              fill: fills[i % fills.length],
            })),
          }));
        }
      })
      .catch(() => {});

    api
      .getRevenue({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          setMarketData((prev) => ({
            ...prev,
            revChart: data.data.map((r: any) => ({
              month: new Date(r.date).toLocaleString("en", { month: "short" }),
              revenue: r.revenue,
              target: r.revenue * 1.1,
            })),
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Market Analytics"
        subtitle="Data insights for Nakasero Market — June 2024"
      >
        <Select options={["June 2024", "May 2024", "Q2 2024", "2024"]} />
        <Btn icon={Download} variant="outline" size="sm">
          Export
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Market Turnover"
          value="UGX 2.4B"
          sub="+11.8% vs last month"
          color={COLORS.primary}
          trend={11.8}
        />
        <StatCard
          icon={Package}
          label="Total Volume"
          value="456,000 kg"
          sub="+8.2% vs last month"
          color={COLORS.info}
          trend={8.2}
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Transactions"
          value="4,892"
          sub="+15.3% vs last month"
          color={COLORS.success}
          trend={15.3}
        />
        <StatCard
          icon={Users}
          label="Active Farmers"
          value="1,234"
          sub="This month"
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card title="Monthly Revenue vs Target (UGX)">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={marketData.revChart}>
              <defs>
                <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(v: number) => `UGX ${(v / 1000000).toFixed(1)}M`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                fill="url(#rev2)"
                strokeWidth={2}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={COLORS.warning}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weekly Transaction Volume">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={marketData.weeklyTxns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="transactions"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
                name="Transactions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Commodity Price Fluctuations">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={marketData.priceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="maize"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Maize"
              />
              <Line
                type="monotone"
                dataKey="beans"
                stroke={COLORS.info}
                strokeWidth={2}
                name="Beans"
              />
              <Line
                type="monotone"
                dataKey="tomatoes"
                stroke={COLORS.danger}
                strokeWidth={2}
                name="Tomatoes"
              />
              <Line
                type="monotone"
                dataKey="onions"
                stroke={COLORS.warning}
                strokeWidth={2}
                name="Onions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Produce Volume by Commodity (kg)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={marketData.produceVol} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Volume (kg)">
                {marketData.produceVol.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title="Top Commodities by Revenue">
          <div className="space-y-3">
            {[
              { n: "Maize", v: "UGX 680M", pct: 28, c: COLORS.primary },
              { n: "Beans", v: "UGX 520M", pct: 22, c: COLORS.info },
              { n: "Tomatoes", v: "UGX 380M", pct: 16, c: COLORS.danger },
              { n: "Onions", v: "UGX 290M", pct: 12, c: COLORS.warning },
              { n: "Cassava", v: "UGX 180M", pct: 8, c: "#8B5CF6" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">
                    <span className="text-gray-400 mr-1">#{i + 1}</span>
                    {item.n}
                  </span>
                  <span className="font-bold text-gray-800">{item.v}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.pct}%`, background: item.c }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Farmers by Volume">
          <div className="space-y-3">
            {topFarmers.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">
                  #{i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-500">{f.district}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">
                    {f.volume} kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Price Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <RPieChart>
              <Pie
                data={marketData.produceVol}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
              >
                {marketData.produceVol.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
              />
            </RPieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// REPORTS
function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<
    "daily" | "weekly" | "monthly" | "annual"
  >("monthly");
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    api
      .getRevenue({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          setRevenueData(
            data.data.map((r: any) => ({
              month: new Date(r.date).toLocaleString("en", { month: "short" }),
              revenue: r.revenue,
              target: r.revenue * 1.1,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Generate and export market reports">
        <Btn icon={Printer} variant="outline" size="sm">
          Print
        </Btn>
        <Btn icon={Download} size="sm">
          Export Excel
        </Btn>
      </PageHeader>

      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
        {(["daily", "weekly", "monthly", "annual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value="UGX 67M"
          sub="June 2024"
          color={COLORS.primary}
        />
        <StatCard
          icon={Package}
          label="Total Volume"
          value="89,400 kg"
          sub="June 2024"
          color={COLORS.info}
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Transactions"
          value="812"
          sub="June 2024"
          color={COLORS.success}
        />
        <StatCard
          icon={Users}
          label="Active Farmers"
          value="348"
          sub="June 2024"
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card
            title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Revenue Report`}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(v: number) => `UGX ${(v / 1000000).toFixed(1)}M`}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="target"
                  fill={COLORS.info}
                  radius={[4, 4, 0, 0]}
                  name="Target"
                  opacity={0.6}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Commodity Report Summary">
          <div className="space-y-3">
            {[
              { c: "Maize", vol: "32,400 kg", rev: "UGX 48.6M", pct: "+8.2%" },
              { c: "Beans", vol: "18,200 kg", rev: "UGX 56.4M", pct: "+12.1%" },
              {
                c: "Tomatoes",
                vol: "14,600 kg",
                rev: "UGX 17.5M",
                pct: "-2.3%",
              },
              { c: "Onions", vol: "11,800 kg", rev: "UGX 21.2M", pct: "+5.7%" },
              { c: "Cassava", vol: "12,400 kg", rev: "UGX 9.9M", pct: "+1.2%" },
            ].map((r) => (
              <div
                key={r.c}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.c}</p>
                  <p className="text-xs text-gray-500">{r.vol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{r.rev}</p>
                  <p
                    className={`text-xs font-semibold ${r.pct.startsWith("+") ? "text-green-600" : "text-red-500"}`}
                  >
                    {r.pct}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Report Export Options">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {[
            {
              label: "Daily Market Report",
              desc: "Today's summary",
              icon: FileBarChart,
              color: COLORS.primary,
            },
            {
              label: "Weekly Report",
              desc: "June 10–15, 2024",
              icon: BarChart2,
              color: COLORS.info,
            },
            {
              label: "Monthly Report",
              desc: "June 2024",
              icon: PieChart,
              color: "#8B5CF6",
            },
            {
              label: "Annual Report",
              desc: "FY 2024",
              icon: Activity,
              color: COLORS.warning,
            },
          ].map(({ label, desc, icon: Icon, color }) => (
            <div
              key={label}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: color + "18" }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">
                {label}
              </p>
              <p className="text-xs text-gray-500 mb-3">{desc}</p>
              <div className="flex gap-2 flex-wrap">
                <button className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1">
                  <Download size={11} /> PDF
                </button>
                <button className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1">
                  <Download size={11} /> Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// GOVERNMENT DASHBOARD
function GovernmentScreen() {
  const [agency, setAgency] = useState<"kcca" | "maaif" | "ubos">("kcca");
  const [produceVol, setProduceVol] = useState<any[]>([]);
  const [revChart, setRevChart] = useState<any[]>([]);

  const agencyMeta = {
    kcca: {
      name: "KCCA",
      full: "Kampala Capital City Authority",
      color: COLORS.primary,
    },
    maaif: {
      name: "MAAIF",
      full: "Ministry of Agriculture, Animal Industry and Fisheries",
      color: COLORS.info,
    },
    ubos: {
      name: "UBOS",
      full: "Uganda Bureau of Statistics",
      color: "#8B5CF6",
    },
  };

  const meta = agencyMeta[agency];

  useEffect(() => {
    api
      .getProduceVolume()
      .then(({ data }) => {
        if (data.data) {
          const fills = [
            COLORS.primary,
            COLORS.info,
            COLORS.danger,
            COLORS.warning,
            "#8B5CF6",
            COLORS.success,
            COLORS.secondary,
          ];
          setProduceVol(
            data.data.map((v: any, i: number) => ({
              name: v.commodity,
              value: v.totalQuantity,
              fill: fills[i % fills.length],
            })),
          );
        }
      })
      .catch(() => {});
    api
      .getRevenue({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          setRevChart(
            data.data.map((r: any) => ({
              month: new Date(r.date).toLocaleString("en", { month: "short" }),
              revenue: r.revenue,
              target: r.revenue * 1.1,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Government Dashboard"
        subtitle="Unified analytics for government agencies"
      >
        <Btn icon={Download} variant="outline" size="sm">
          Export Report
        </Btn>
      </PageHeader>

      <div className="flex items-center gap-2">
        {(["kcca", "maaif", "ubos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAgency(a)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${agency === a ? "text-white shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            style={
              agency === a
                ? {
                    background: agencyMeta[a].color,
                    borderColor: agencyMeta[a].color,
                  }
                : {}
            }
          >
            <Globe size={14} />
            {agencyMeta[a].name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: meta.color + "18" }}
        >
          <Building2 size={22} style={{ color: meta.color }} />
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {meta.name} — {meta.full}
          </p>
          <p className="text-xs text-gray-500">
            Market analytics dashboard · Nakasero Market, Kampala · Reporting
            Period: June 2024
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Market Revenue"
          value="UGX 2.4B"
          sub="+11.8% YoY"
          color={meta.color}
          trend={11.8}
        />
        <StatCard
          icon={Users}
          label="Registered Farmers"
          value="2,847"
          sub="+342 this year"
          color={COLORS.success}
          trend={342}
        />
        <StatCard
          icon={Package}
          label="Commodity Types"
          value="156"
          sub="Active"
          color={COLORS.info}
        />
        <StatCard
          icon={TrendingUp}
          label="Market Growth"
          value="14.2%"
          sub="Year-on-year"
          color={COLORS.warning}
          trend={14.2}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card
          title="Commodity Movement — Top 5"
          action={<Select options={["June 2024", "Q2 2024"]} />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={produceVol}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Volume (kg)" radius={[4, 4, 0, 0]}>
                {produceVol.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue Trend">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revChart}>
              <defs>
                <linearGradient id="govGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={meta.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(v: number) => `UGX ${(v / 1000000).toFixed(1)}M`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={meta.color}
                fill="url(#govGrad)"
                strokeWidth={2.5}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Policy Insights & Market Statistics">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Food Security Index",
              value: "82/100",
              sub: "Good",
              detail:
                "Market supply meets 82% of demand requirements for Kampala.",
              icon: CheckCircle,
              color: COLORS.success,
            },
            {
              title: "Price Stability Score",
              value: "74/100",
              sub: "Moderate",
              detail:
                "Maize and tomato prices show some volatility requiring monitoring.",
              icon: AlertCircle,
              color: COLORS.warning,
            },
            {
              title: "Farmer Registration Rate",
              value: "94%",
              sub: "Excellent",
              detail:
                "94% of active market vendors are formally registered in the system.",
              icon: Star,
              color: COLORS.info,
            },
          ].map(({ title, value, sub, detail, icon: Icon, color }) => (
            <div
              key={title}
              className="text-center p-4 rounded-xl border border-gray-100"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: color + "18" }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-semibold mb-1" style={{ color }}>
                {sub}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// USER MANAGEMENT
function UsersScreen() {
  const [userList, setUserList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState([
    {
      t: "2024-06-15 09:45",
      u: "Wandera Jonah",
      a: "Farmer registered",
      m: "Farmers",
      ip: "197.157.x.x",
    },
    {
      t: "2024-06-15 09:30",
      u: "Sarah Tendo",
      a: "Price updated",
      m: "Commodity Prices",
      ip: "197.157.x.x",
    },
    {
      t: "2024-06-15 09:15",
      u: "David Okello",
      a: "Produce verified",
      m: "Verification",
      ip: "197.158.x.x",
    },
    {
      t: "2024-06-15 08:50",
      u: "Agnes Nalwoga",
      a: "Report exported",
      m: "Reports",
      ip: "197.159.x.x",
    },
  ]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Market Officer",
    agency: "KCCA",
  });
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    api
      .listUsers({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.users || data.data;
          setUserList(
            list.map((u: any) => ({
              _id: u._id,
              id: u._id?.slice(-4).toUpperCase() || "U001",
              name: u.name,
              role: u.role,
              email: u.email,
              status: u.status,
              lastLogin: u.lastLogin
                ? new Date(u.lastLogin).toLocaleString()
                : "Never",
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUsers();
    api
      .getNotifications()
      .then(({ data }) => {
        if (data.data) {
          const logs = data.data.slice(0, 4).map((n: any) => ({
            t: new Date(n.createdAt).toLocaleString(),
            u: "System",
            a: n.title,
            m: n.type,
            ip: "197.157.x.x",
          }));
          setAuditLogs(logs.length ? logs : auditLogs);
        }
      })
      .catch(() => {});
  }, []);

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Market Officer",
      agency: "KCCA",
    });
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      agency: u.agency || "KCCA",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          agency: form.agency,
        };
        if (form.password) payload.password = form.password;
        await api.updateUser(editingUser._id, payload);
      } else {
        await api.createUser({
          ...form,
          password: form.password || "password123",
        });
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Are you sure you want to deactivate user "${u.name}"?`))
      return;
    try {
      await api.updateUser(u._id, { status: "Inactive" });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleReactivate = async (u: any) => {
    try {
      await api.updateUser(u._id, { status: "Active" });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to activate user");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and permissions"
      >
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add User
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="System Users"
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search users..."
                  className="w-48"
                  value={search}
                  onChange={(v) => setSearch(v)}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Market Officer">Market Officer</option>
                  <option value="Government Officer">Government Officer</option>
                </select>
              </div>
            }
          >
            <Table
              headers={[
                "User ID",
                "Name",
                "Role",
                "Email",
                "Status",
                "Last Login",
                "",
              ]}
            >
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {u.id}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-700">
                          {u.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {u.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <Badge
                      label={u.role}
                      color={
                        u.role === "Administrator"
                          ? COLORS.danger
                          : COLORS.primary
                      }
                    />
                  </Td>
                  <Td className="text-xs text-gray-600">{u.email}</Td>
                  <Td>
                    <Badge
                      label={u.status}
                      color={
                        u.status === "Active" ? COLORS.success : COLORS.warning
                      }
                    />
                  </Td>
                  <Td className="text-xs text-gray-500">{u.lastLogin}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      {u.status === "Active" ? (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Audit Logs">
            <Table
              headers={["Timestamp", "User", "Action", "Module", "IP Address"]}
            >
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <Td className="font-mono text-xs">{log.t}</Td>
                  <Td className="font-medium text-xs">{log.u}</Td>
                  <Td className="text-xs">{log.a}</Td>
                  <Td>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                      {log.m}
                    </span>
                  </Td>
                  <Td className="font-mono text-xs text-gray-500">{log.ip}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Roles & Permissions">
            <div className="space-y-3">
              {[
                {
                  role: "Administrator",
                  count: userList.filter((u) => u.role === "Administrator")
                    .length,
                  perms: ["Full Access", "User Management", "System Config"],
                },
                {
                  role: "Market Officer",
                  count: userList.filter((u) => u.role === "Market Officer")
                    .length,
                  perms: ["Farmers", "Produce", "Transactions", "Prices"],
                },
                {
                  role: "Government Officer",
                  count: userList.filter((u) => u.role === "Government Officer")
                    .length,
                  perms: ["Dashboard", "Reports", "Analytics", "Price Trends"],
                },
              ].map((r) => (
                <div
                  key={r.role}
                  className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {r.role}
                      </p>
                      <p className="text-xs text-gray-400">{r.count} users</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.perms.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total Users</span>
                <span className="font-semibold">{userList.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active</span>
                <span className="font-semibold text-green-600">
                  {userList.filter((u) => u.status === "Active").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inactive</span>
                <span className="font-semibold text-red-500">
                  {userList.filter((u) => u.status !== "Active").length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Ssekandi"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@kcca.go.ug"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              {!editingUser && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="Leave blank for default password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              )}
              {editingUser && (
                <Input
                  label="New Password (leave blank to keep current)"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Market Officer">Market Officer</option>
                  <option value="Government Officer">Government Officer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Agency
                </label>
                <select
                  value={form.agency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, agency: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="KCCA">KCCA</option>
                  <option value="MAAIF">MAAIF</option>
                  <option value="UBOS">UBOS</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Btn
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Btn>
                <Btn className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// NOTIFICATIONS
function NotificationsScreen() {
  const [notifList, setNotifList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .getNotifications()
      .then(({ data }) => {
        if (data.data) {
          const mapped = data.data.map((n: any) => ({
            id: n._id || n.id,
            type: n.type,
            title: n.title,
            time: new Date(n.createdAt).toLocaleString(),
            read: n.read,
          }));
          setNotifList(mapped);
          setUnreadCount(mapped.filter((n: any) => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markAsRead(id);
    } catch {}
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
      >
        <Btn
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await api.markAllAsRead();
              setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
              setUnreadCount(0);
            } catch {}
          }}
        >
          Mark All Read
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {notifList.map((n) => {
            const typeMap: Record<
              string,
              { icon: React.ElementType; color: string; bg: string }
            > = {
              price: { icon: Tag, color: COLORS.warning, bg: "#FFF8E1" },
              verification: {
                icon: ShieldCheck,
                color: COLORS.info,
                bg: "#E3F2FD",
              },
              system: { icon: Settings, color: "#8B5CF6", bg: "#F3E8FF" },
              market: { icon: BarChart2, color: COLORS.success, bg: "#E8F5E9" },
            };
            const t = typeMap[n.type];
            return (
              <div
                key={n.id}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${!n.read ? "border-green-200" : "border-gray-100"}`}
              >
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
                )}
                {n.read && <div className="w-2 h-2 flex-shrink-0" />}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.bg }}
                >
                  <t.icon size={16} style={{ color: t.color }} />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreVertical size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card title="Notification Settings">
            <div className="space-y-3">
              {[
                {
                  label: "Price Alerts",
                  desc: "Commodity price changes",
                  on: true,
                },
                {
                  label: "Verification Alerts",
                  desc: "New items to verify",
                  on: true,
                },
                {
                  label: "System Announcements",
                  desc: "Maintenance & updates",
                  on: false,
                },
                {
                  label: "Market Updates",
                  desc: "Daily market summaries",
                  on: true,
                },
                {
                  label: "Farmer Activities",
                  desc: "New registrations",
                  on: false,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <button
                    className={`w-10 h-5 rounded-full relative transition-colors ${s.on ? "bg-green-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.on ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Send Market Announcement">
            <div className="space-y-3">
              <Input label="Title" placeholder="Announcement title" />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter announcement message..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Recipients
                </label>
                <Select
                  options={[
                    "All Users",
                    "Market Officers",
                    "Government Officers",
                    "Inspectors",
                  ]}
                  className="w-full"
                />
              </div>
              <Btn className="w-full">Send Announcement</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// SETTINGS
function SettingsScreen() {
  const [tab, setTab] = useState<"profile" | "security" | "system" | "theme">(
    "profile",
  );

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    {
      device: "Chrome · Windows 11",
      ip: "197.157.x.x",
      time: "Current session",
      current: true,
    },
    {
      device: "Firefox · Ubuntu 22",
      ip: "197.158.x.x",
      time: "2 hours ago",
      current: false,
    },
  ]);
  const [toggles, setToggles] = useState({
    "Email Notifications": true,
    "Automatic Daily Reports": true,
    "Real-time Price Alerts": false,
    "Audit Logging": true,
  });
  const [sidebarStyle, setSidebarStyle] = useState("Dark");
  const [fontSize, setFontSize] = useState("Medium");
  const [colorTheme, setColorTheme] = useState("Government Green");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPw !== confirmPw) {
      alert("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await api.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      alert("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Configure your account and system preferences"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 h-fit">
          {(
            [
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "system", label: "System Config", icon: Settings },
              { id: "theme", label: "Theme & Display", icon: Layers },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all ${tab === id ? "bg-green-700 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {tab === "profile" && (
            <Card title="Profile Settings">
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-green-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JM</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Wandera Jonah
                  </h3>
                  <p className="text-gray-500 text-sm">Administrator · KCCA</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        alert("Photo changed successfully");
                    }}
                  />
                  <Btn
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="Wandera" />
                <Input label="Last Name" placeholder="Jonah" />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="j.mugisha@kcca.go.ug"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+256 700 000 000"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Agency
                  </label>
                  <Select
                    options={["KCCA", "MAAIF", "UBOS"]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Role
                  </label>
                  <Select options={["Administrator"]} className="w-full" />
                </div>
                <div className="lg:col-span-2">
                  <Input
                    label="Department"
                    placeholder="Market Management Division"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                <Btn
                  onClick={() => alert("Profile changes saved successfully")}
                >
                  Save Changes
                </Btn>
                <Btn variant="outline">Cancel</Btn>
              </div>
            </Card>
          )}

          {tab === "security" && (
            <Card title="Security Settings">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPw}
                      onChange={setCurrentPw}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      value={newPw}
                      onChange={setNewPw}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={setConfirmPw}
                    />
                    <Btn onClick={handleUpdatePassword} disabled={pwSaving}>
                      {pwSaving ? "Updating..." : "Update Password"}
                    </Btn>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                    Two-Factor Authentication
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        SMS Authentication
                      </p>
                      <p className="text-xs text-gray-500">
                        Receive OTP via SMS on login
                      </p>
                    </div>
                    <Btn
                      variant={twoFAEnabled ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTwoFAEnabled(!twoFAEnabled);
                        alert(
                          twoFAEnabled
                            ? "2FA disabled"
                            : "2FA enabled - OTP will be sent to your phone on login",
                        );
                      }}
                    >
                      {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Btn>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    Active Sessions
                  </h4>
                  {sessions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {s.device}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.ip} · {s.time}
                        </p>
                      </div>
                      {s.current ? (
                        <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSessions((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                        >
                          Revoke
                        </Btn>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {tab === "system" && (
            <Card title="System Configuration">
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Default Market
                    </label>
                    <Select
                      options={[
                        "Nakasero Market",
                        "Owino Market",
                        "St. Balikuddembe",
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Currency
                    </label>
                    <Select
                      options={["UGX — Ugandan Shilling", "USD — US Dollar"]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Date Format
                    </label>
                    <Select
                      options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Language
                    </label>
                    <Select
                      options={["English", "Luganda", "Swahili"]}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    System Toggles
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(toggles).map(([label, on]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2"
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {label}
                        </p>
                        <button
                          onClick={() =>
                            setToggles((prev) => ({
                              ...prev,
                              [label]: !prev[label],
                            }))
                          }
                          className={`w-10 h-5 rounded-full relative transition-colors ${on ? "bg-green-600" : "bg-gray-200"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-0.5"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Btn onClick={() => alert("Configuration saved successfully")}>
                  Save Configuration
                </Btn>
              </div>
            </Card>
          )}

          {tab === "theme" && (
            <Card title="Theme & Display">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        name: "Government Green",
                        primary: "#2E7D32",
                        secondary: "#4CAF50",
                      },
                      {
                        name: "KCCA Blue",
                        primary: "#1E3A5F",
                        secondary: "#1E88E5",
                      },
                      {
                        name: "MAAIF Gold",
                        primary: "#8B6914",
                        secondary: "#F9A825",
                      },
                    ].map((theme) => (
                      <div
                        key={theme.name}
                        onClick={() => setColorTheme(theme.name)}
                        className={`p-4 border-2 rounded-xl cursor-pointer ${colorTheme === theme.name ? "border-green-600" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex gap-1.5 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ background: theme.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ background: theme.secondary }}
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          {theme.name}
                        </p>
                        {colorTheme === theme.name && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Active
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Sidebar Style
                  </label>
                  <div className="flex gap-3">
                    {["Dark", "Light", "Colored"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSidebarStyle(s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${sidebarStyle === s ? "border-green-600 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Font Size
                  </label>
                  <div className="flex gap-3">
                    {["Small", "Medium", "Large"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${fontSize === s ? "border-green-600 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Btn onClick={() => alert("Preferences saved successfully")}>
                  Save Preferences
                </Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("agrihub_token"),
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("agrihub_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [screen, setScreenRaw] = useState<Screen>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifList, setNotifList] = useState<any[]>([]);

  const userRole = (currentUser?.role as Role) || "Administrator";
  const perm = PERMISSIONS[userRole] || PERMISSIONS.Administrator;

  const setScreen = useCallback(
    (s: Screen) => {
      setScreenRaw((prev) => {
        if (s === prev) return prev;
        if (!canAccess(userRole, s)) {
          return getDefaultScreen(userRole) as Screen;
        }
        return s;
      });
    },
    [userRole],
  );

  useEffect(() => {
    if (loggedIn && currentUser) {
      api
        .getUnreadCount()
        .then(({ data }) => {
          if (data.data !== undefined)
            setUnreadNotifs(data.data.count ?? data.data);
        })
        .catch(() => {});
      api
        .getNotifications()
        .then(({ data }) => {
          if (data.data) setNotifList(data.data);
        })
        .catch(() => {});
    }
    if (screen && !canAccess(userRole, screen)) {
      setScreen(getDefaultScreen(userRole) as Screen);
    }
  }, [loggedIn, currentUser]);

  const handleLogin = async (token, user) => {
    localStorage.setItem("agrihub_token", token);
    localStorage.setItem("agrihub_user", JSON.stringify(user));
    setCurrentUser(user);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("agrihub_token");
    localStorage.removeItem("agrihub_user");
    setCurrentUser(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const screenMap: Record<Screen, React.ReactNode> = {
    login: null,
    dashboard: <DashboardScreen onNavigate={setScreen} />,
    farmers: <FarmersScreen />,
    "produce-registration": <ProduceRegistrationScreen />,
    "produce-verification": <ProduceVerificationScreen />,
    "commodity-prices": <CommodityPricesScreen />,
    transactions: <TransactionsScreen />,
    "market-analytics": <MarketAnalyticsScreen />,
    reports: <ReportsScreen />,
    government: <GovernmentScreen />,
    users: <UsersScreen />,
    notifications: <NotificationsScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'Inter', 'Poppins', system-ui, sans-serif",
        background: COLORS.bg,
      }}
    >
      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-gray-900 border-r border-gray-700 [&_[data-slot=sheet-close]]:hidden">
          <Sidebar
            mobile
            active={screen}
            onNav={(s) => { setScreen(s); setMobileMenuOpen(false); }}
            collapsed={false}
            onCollapse={() => {}}
            onLogout={() => { handleLogout(); setMobileMenuOpen(false); }}
            role={userRole}
          />
        </SheetContent>
      </Sheet>

      <Sidebar
        active={screen}
        onNav={(s) => setScreen(s)}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((c) => !c)}
        onLogout={handleLogout}
        role={userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          screen={screen}
          notifCount={unreadNotifs}
          onNotif={() => setScreen("notifications")}
          user={currentUser}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {canAccess(userRole, screen) ? (
            screenMap[screen]
          ) : (
            <UnauthorizedScreen />
          )}
        </main>
      </div>
    </div>
  );
}
