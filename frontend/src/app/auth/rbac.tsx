import React from "react";

export type Role = "Administrator" | "Market Officer" | "Government Officer" | "Farmer";

export const ROLES: Role[] = ["Administrator", "Market Officer", "Government Officer", "Farmer"];

export const ROLE_SCREENS: Record<Role, string[]> = {
  Administrator: [
    "dashboard", "farmers", "produce-registration", "produce-verification",
    "commodity-prices", "transactions", "market-analytics", "reports",
    "government", "users", "notifications", "settings",
  ],
  "Market Officer": [
    "dashboard", "farmers", "produce-registration", "produce-verification",
    "commodity-prices", "transactions", "market-analytics", "reports",
  ],
  "Government Officer": [
    "dashboard", "market-analytics", "reports", "commodity-prices",
  ],
  Farmer: [
    "dashboard", "produce-registration", "commodity-prices",
  ],
};

export const PERMISSIONS: Record<Role, {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canDelete: boolean;
  canWrite: boolean;
}> = {
  Administrator: { canManageUsers: true, canManageSettings: true, canDelete: true, canWrite: true },
  "Market Officer": { canManageUsers: false, canManageSettings: false, canDelete: false, canWrite: true },
  "Government Officer": { canManageUsers: false, canManageSettings: false, canDelete: false, canWrite: false },
  Farmer: { canManageUsers: false, canManageSettings: false, canDelete: false, canWrite: true },
};

export function canAccess(role: string | undefined, screen: string): boolean {
  if (!role) return false;
  const allowed = ROLE_SCREENS[role as Role];
  return allowed ? allowed.includes(screen) : false;
}

export function getDefaultScreen(role: string | undefined): string {
  return "dashboard";
}

export function hasPermission(role: string | undefined, permission: keyof typeof PERMISSIONS.Administrator): boolean {
  if (!role) return false;
  const p = PERMISSIONS[role as Role];
  return p ? p[permission] : false;
}

export interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem("agrihub_user") || "{}").role; } catch { return null; }
  })();
  if (userRole === role) return <>{children}</>;
  return <>{fallback}</>;
}

export interface PermissionGuardProps {
  permission: keyof typeof PERMISSIONS.Administrator;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem("agrihub_user") || "{}").role; } catch { return null; }
  })();
  if (hasPermission(userRole, permission)) return <>{children}</>;
  return <>{fallback}</>;
}
