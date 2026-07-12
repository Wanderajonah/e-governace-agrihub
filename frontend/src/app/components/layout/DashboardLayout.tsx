import { Sheet, SheetContent } from "../ui/sheet";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { canAccess } from "../../auth/rbac";
import UnauthorizedScreen from "../../pages/UnauthorizedScreen";
import type { Screen } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  screen: Screen;
  onNavigate: (s: Screen) => void;
  user?: { name?: string; role?: string };
  onLogout?: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: (open: boolean) => void;
  unreadNotifs: number;
  onNotifClick: () => void;
  role?: string;
}

function DashboardLayout({
  children,
  screen,
  onNavigate,
  user,
  onLogout,
  sidebarCollapsed,
  onToggleSidebar,
  mobileMenuOpen,
  onMobileMenuToggle,
  unreadNotifs,
  onNotifClick,
  role,
}: DashboardLayoutProps) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', system-ui, sans-serif" }}
    >
      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuToggle}>
        <SheetContent side="left" className="p-0 w-64 bg-gray-900 border-r border-gray-700 [&_[data-slot=sheet-close]]:hidden">
          <Sidebar
            mobile
            active={screen}
            onNav={(s) => { onNavigate(s); onMobileMenuToggle(false); }}
            collapsed={false}
            onCollapse={() => {}}
            onLogout={() => { onLogout?.(); onMobileMenuToggle(false); }}
            role={role}
          />
        </SheetContent>
      </Sheet>

      <Sidebar
        active={screen}
        onNav={onNavigate}
        collapsed={sidebarCollapsed}
        onCollapse={onToggleSidebar}
        onLogout={onLogout}
        role={role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          screen={screen}
          notifCount={unreadNotifs}
          onNotif={onNotifClick}
          user={user}
          onMenuToggle={() => onMobileMenuToggle(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {canAccess(role, screen) ? (
            children
          ) : (
            <UnauthorizedScreen />
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
