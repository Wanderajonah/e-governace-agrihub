import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { PERMISSIONS, canAccess, getDefaultScreen } from "./auth/rbac";
import type { Role } from "./auth/rbac";
import type { Screen } from "./components/layout";
import * as api from "../api";
import LandingPage from "./landing/LandingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import { COLORS } from "./components/shared";
import UnauthorizedScreen from "./pages/UnauthorizedScreen";
import DashboardScreen from "./pages/DashboardScreen";
import FarmerDashboardScreen from "./pages/FarmerDashboardScreen";
import FarmersScreen from "./pages/FarmersScreen";
import ProduceRegistrationScreen from "./pages/ProduceRegistrationScreen";
import ProduceVerificationScreen from "./pages/ProduceVerificationScreen";
import CommodityPricesScreen from "./pages/CommodityPricesScreen";
import TransactionsScreen from "./pages/TransactionsScreen";
import MarketAnalyticsScreen from "./pages/MarketAnalyticsScreen";
import ReportsScreen from "./pages/ReportsScreen";
import GovernmentScreen from "./pages/GovernmentScreen";
import UsersScreen from "./pages/UsersScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import SettingsScreen from "./pages/SettingsScreen";
import PriceBoardPage from "./pages/PriceBoardPage";

function AuthenticatedApp() {
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
    if (currentUser) {
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
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("agrihub_token");
    localStorage.removeItem("agrihub_user");
    setCurrentUser(null);
    window.location.href = "/";
  };

  const screenMap: Record<string, React.ReactNode> = {
    dashboard:
      userRole === "Farmer" ? (
        <FarmerDashboardScreen onNavigate={setScreen} />
      ) : (
        <DashboardScreen onNavigate={setScreen} />
      ),
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
    login: null,
  };

  const currentScreen = canAccess(userRole, screen)
    ? screenMap[screen]
    : null;

  return (
    <DashboardLayout
      screen={screen}
      onNavigate={setScreen}
      user={currentUser}
      onLogout={handleLogout}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
      mobileMenuOpen={mobileMenuOpen}
      onMobileMenuToggle={setMobileMenuOpen}
      unreadNotifs={unreadNotifs}
      onNotifClick={() => setScreen("notifications")}
      role={userRole}
    >
      {currentScreen ?? <UnauthorizedScreen />}
    </DashboardLayout>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("agrihub_token"),
  );

  const handleLogin = async (token: string, user: any) => {
    localStorage.setItem("agrihub_token", token);
    localStorage.setItem("agrihub_user", JSON.stringify(user));
    setLoggedIn(true);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              loggedIn ? (
                <AuthenticatedApp />
              ) : (
                <LandingPage onLogin={handleLogin} />
              )
            }
          />
          <Route path="/price-board" element={<PriceBoardPage />} />
          <Route
            path="/*"
            element={
              loggedIn ? <AuthenticatedApp /> : <LandingPage onLogin={handleLogin} />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
