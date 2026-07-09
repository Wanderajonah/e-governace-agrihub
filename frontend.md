# Frontend Changes — E-Governance AgriHub

## 1. All Button Wiring (Screens Made Functional)

The single-page app at `src/app/App.tsx` had many static/mock screens. Every page was wired to actual API calls.

### Farmers Screen
- **Add Farmer** — dialog modal with name, district, phone, produce fields; calls `api.createFarmer()`
- **Edit Farmer** — same dialog pre-filled via `api.updateFarmer()`
- **Delete Farmer** — sets `isActive: false` via `api.deleteFarmer()`
- **Farmer ID auto-generation** — fixed backend to return valid IDs (see backend.md)

### Produce Registration Screen
- **Save / Register** — calls `api.registerProduce()` with commodity, quantity, source district, quality, notes
- **Cancel / Reset** — clears form
- **Edit** — opens form pre-filled, calls `api.updateProduce()`
- **Delete** — calls `api.deleteProduce()`
- **Detail (Eye icon)** — shows produce detail in a read-only dialog
- **Farmer search dropdown** — fetches farmers and populates `<select>`

### Produce Verification Screen
- **Changed data source** — now fetches from `api.listProduce({ status: "Pending" })` instead of verification records. The produce items awaiting inspection are shown in a table.
- **Approve** — creates a verification record via `api.createVerification()` with pass status, quality grade, moisture, notes; auto-updates produce status to "Verified"
- **Reject** — same but with fail status and rejection reason
- **Inspection modal** — dialog for inspector to record findings

### Commodity Prices Screen
- **Pagination** — 5 records per page with Previous/Next and page numbers
- **Search** — filters by commodity name, district
- **Add Price** — dialog with commodity, price, unit, district, date
- **Edit Price** — same dialog pre-filled
- **Delete Price** — confirm and call `api.deletePrice()`
- **Export CSV** — generates and downloads a CSV of current filtered prices
- **Top Movers** — shows commodities with biggest price changes
- **Dynamic title** — shows date range of displayed data

### Transactions Screen
- **Pagination** — 10 records per page
- **Search** — filters by TXN ID, buyer, seller
- **Payment filter** — native `<select>` for Cash, Mobile Money, Bank Transfer, Cheque
- **New Transaction dialog** — modal with buyer, seller, commodity, quantity, unit price (auto-computes total), date, payment method; calls `api.createTransaction()`
- **Record Transaction sidebar** — same form in a side panel
- **Receipt Print/PDF** — opens a new window with formatted receipt HTML and triggers `window.print()`
- **Stat cards** — live counts for today's transactions, total value, filtered count

### Settings Screen
- **Change Photo** — hidden file input triggered by button; shows confirmation alert on selection
- **Update Password** — calls `api.changePassword()` with current/new/confirm password validation
- **Enable/Disable 2FA** — toggles state
- **Revoke sessions** — removes session entries from the list
- **System toggles** — clickable switches for maintenance mode, auto-verification, notifications, audit logging
- **Color theme, Sidebar style, Font size** — clickable selection cards with active state tracking
- **Save Preferences / Save Configuration** — shows success alerts

## 2. Component Fixes

### `SearchBar` (`App.tsx:215`)
Now accepts `value` and `onChange` props for controlled usage:
```typescript
function SearchBar({ placeholder, className, value, onChange }: {
  placeholder?: string; className?: string; value?: string; onChange?: (v: string) => void;
})
```

### `Input` and `Select`
Both components now accept `value` and `onChange` props to work in controlled forms.

### `Btn`
Accepts `onClick`, `disabled`, `icon`, `size`, `variant` props and renders consistently across all screens.

## 3. Dashboard Weather Widget

**File:** `src/app/App.tsx` — `DashboardScreen` (line ~539)

Replaced static "26°C, Partly Cloudy, Kampala" with live data from [wttr.in](https://wttr.in) (free, no API key):

```typescript
fetch("https://wttr.in/Kampala?format=j1")
  .then(r => r.json())
  .then(d => setWeather(d.current_condition[0]))
  .catch(() => {});
```

Also made dynamic:
- **Date** — `new Date().toLocaleDateString("en-US", { weekday: "long", ... })`
- **Greeting** — "Good Morning/Afternoon/Evening" based on `new Date().getHours()`
- **User name** — reads from `localStorage` (`agrihub_user.name`) with "Wandera Jonah" fallback

## 4. Admin Name Update

Changed **"James Mugisha"** to **"Wandera Jonah"** in all locations:

| Location | Line(s) | What changed |
|----------|---------|-------------|
| `systemUsers` mock data | 121 | User object name field |
| Header fallback | 374 | `user?.name \|\| "Wandera Jonah"` |
| Audit log mock | 2526 | Username in audit entry |
| Profile heading | 2831 | `<h3>Wandera Jonah</h3>` |
| Profile form placeholders | 2838-2839 | "Wandera" / "Jonah" |

## 5. Role-Based Access Control (RBAC)

### New file: `src/app/auth/rbac.tsx`

Contains all RBAC configuration and reusable components.

#### Role-Screen Mapping

| Role | Screens |
|------|---------|
| **Administrator** | dashboard, farmers, produce-registration, produce-verification, commodity-prices, transactions, market-analytics, reports, government, users, notifications, settings |
| **Market Officer** | dashboard, farmers, produce-registration, produce-verification, commodity-prices, transactions, market-analytics, reports |
| **Government Officer** | dashboard, market-analytics, reports, commodity-prices |

#### Permission Flags

```typescript
PERMISSIONS = {
  Administrator:       { canManageUsers: true,  canManageSettings: true,  canDelete: true,  canWrite: true  },
  "Market Officer":    { canManageUsers: false, canManageSettings: false, canDelete: false, canWrite: true  },
  "Government Officer": { canManageUsers: false, canManageSettings: false, canDelete: false, canWrite: false },
};
```

#### Exported Utilities

| Export | Type | Purpose |
|--------|------|---------|
| `canAccess(role, screen)` | function | Check if a role can access a screen |
| `getDefaultScreen(role)` | function | Returns "dashboard" for all roles |
| `hasPermission(role, permission)` | function | Check a specific permission flag |
| `<RequireRole role={...}>` | component | Renders children only if user has the exact role |
| `<PermissionGuard permission={...}>` | component | Renders children only if user has the permission |

All components read `localStorage` directly to get the current user's role.

### Modified: `src/app/App.tsx`

#### Dynamic Sidebar (lines 288-344)
- Accepts new `role` prop
- Filters `navItems` against `ROLE_SCREENS[role]` so each role only sees their permitted links

#### Navigation Guard
- `setScreen` is wrapped with a `canAccess` check
- If the target screen is not permitted for the current role, quietly redirects to dashboard

#### 403 Unauthorized Page
- `UnauthorizedScreen` component renders a centered error card with a shield icon and "Return to Dashboard" button
- Shown when a user lands on a screen they don't have access to

#### Screen Rendering Guard
```typescript
<main className="flex-1 overflow-y-auto p-6">
  {canAccess(userRole, screen) ? screenMap[screen] : <UnauthorizedScreen />}
</main>
```

#### Login Screen (line ~406)
- Default email changed to `admin@agrihub.com`
- Default password changed to `admin123`
- Collapsible **"Test Accounts"** section added below the form showing all three role credentials

### UsersScreen (line ~2552) — Fully Wired

The existing user management page was enhanced with working API calls:

| Feature | Implementation |
|---------|---------------|
| **Add User** | Opens modal with Full Name, Email, Password, Role, Agency fields; calls `api.createUser()` |
| **Edit User** | Same modal pre-filled; calls `api.updateUser()` with optional password reset |
| **Deactivate** | Sets `status: "Inactive"` via `api.updateUser()` with confirm dialog |
| **Reactivate** | Sets `status: "Active"` via `api.updateUser()` |
| **Search** | `SearchBar` filters by name or email client-side |
| **Role Filter** | Native `<select>` filters by Administrator, Market Officer, Government Officer |
| **User counts** | Roles & Permissions card now shows live counts from the API |
| **Quick Stats** | Total / Active / Inactive user counts |
| **Data loading** | Fetches from `api.listUsers({ limit: 100 })` on mount and after any mutation |

## 6. Login Screen Test Accounts

Added a collapsible `<details>` section showing test credentials for all three roles:

```
Administrator     admin@agrihub.com     admin123
Market Officer    officer@agrihub.com   officer123
Government Officer gov@agrihub.com      gov123
```

## 7. Frontend Infrastructure

- **Port:** 5173 (Vite dev server)
- **Tech:** React + TypeScript, Tailwind CSS v4, lucide-react (icons), recharts (charts), Radix UI
- **Routing:** State-based (no react-router) — single `screen` state with `Record<Screen, ReactNode>` map
- **Auth storage:** `localStorage` keys `agrihub_token` and `agrihub_user`
- **API base:** `http://localhost:5000/api` (configurable via `VITE_API_URL`)
- **Axios interceptor:** auto-attaches Bearer token, auto-logout on 401
