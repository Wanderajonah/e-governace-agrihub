import { Shield } from "lucide-react";
import { Btn } from "../components/shared";

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

export default UnauthorizedScreen;
