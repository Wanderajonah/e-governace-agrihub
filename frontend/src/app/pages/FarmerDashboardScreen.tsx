import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  CheckCircle,
  ArrowLeftRight,
  Plus,
  Tag,
  Sun,
  CloudRain,
} from "lucide-react";
import * as api from "../../api";
import { COLORS } from "../components/shared/COLORS";
import { Card } from "../components/shared";

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

function FarmerDashboardScreen({ onNavigate }: { onNavigate?: (s: Screen) => void }) {
  const [myProduce, setMyProduce] = useState<any[]>([]);
  const [myTxns, setMyTxns] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("agrihub_user") || "{}"); }
    catch { return {} as any; }
  })();

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.listProduce({ farmer: currentUser._id || currentUser.id }),
      api.listTransactions({ seller: currentUser._id || currentUser.id }),
      api.listPrices({ limit: 10 }),
    ])
      .then(([prodRes, txnRes, priceRes]) => {
        if (!mounted) return;
        const plist = prodRes.data?.data?.produce || prodRes.data?.data || [];
        setMyProduce(plist.slice(0, 5));
        const tlist = txnRes.data?.data?.transactions || txnRes.data?.data || [];
        setMyTxns(tlist.slice(0, 5));
        const pricelist = priceRes.data?.data?.prices || priceRes.data?.data || [];
        setPrices(pricelist.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    fetch("https://wttr.in/Kampala?format=j1")
      .then((r) => r.json())
      .then((d) => { if (mounted) setWeather(d.current_condition[0]); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const userName = currentUser?.name?.split(" ")[0] || "Farmer";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-xs font-medium mb-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
            <h2 className="text-xl font-bold">
              {((h) => h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening")(new Date().getHours())}, {userName}
            </h2>
            <p className="text-green-200 text-sm mt-0.5">
              Track your produce and stay updated on market prices.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
            {weather ? (
              parseInt(weather.weatherCode) < 200
                ? <Sun size={20} className="text-yellow-300" />
                : <CloudRain size={20} className="text-blue-200" />
            ) : <Sun size={20} className="text-yellow-300" />}
            <div>
              <p className="text-lg font-bold">{weather ? `${weather.temp_C}°C` : "--°C"}</p>
              <p className="text-xs text-green-200">
                {weather ? `${weather.weatherDesc[0].value}, Kampala` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("produce-registration")}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS.primary + "18" }}>
            <Package size={22} style={{ color: COLORS.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">My Produce</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{(myProduce.length || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">Registered items</div>
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("commodity-prices")}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS.success + "18" }}>
            <TrendingUp size={22} style={{ color: COLORS.success }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Market Prices</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{prices.length}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">Commodities tracked</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS.warning + "18" }}>
            <CheckCircle size={22} style={{ color: COLORS.warning }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Verified</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{myProduce.filter(p => p.status === "Verified").length}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">of {myProduce.length} items</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS.info + "18" }}>
            <ArrowLeftRight size={22} style={{ color: COLORS.info }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{myTxns.length}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">Recent sales</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate?.("produce-registration")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm"
        >
          <Plus size={15} /> Register New Produce
        </button>
        <button
          onClick={() => onNavigate?.("commodity-prices")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Tag size={15} /> View Market Prices
        </button>
      </div>

      {/* My Produce & Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="My Recent Produce">
          {myProduce.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No produce registered yet.</p>
          ) : (
            <table className="w-full text-[13px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["Commodity", "Quantity", "Status", "Date"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[40px] px-4 whitespace-nowrap align-middle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProduce.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-4 text-gray-700 align-middle">{p.commodity}</td>
                    <td className="py-2.5 px-4 text-gray-700 align-middle">{p.quantity} {p.unit}</td>
                    <td className="py-2.5 px-4 align-middle">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "Verified" ? "bg-green-50 text-green-700" :
                        p.status === "Rejected" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>{p.status || "Pending"}</span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-400 align-middle">{new Date(p.arrivalDate || p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Market Prices">
          {prices.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No price data available.</p>
          ) : (
            <table className="w-full text-[13px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["Commodity", "Grade", "Price (UGX)", "Date"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[40px] px-4 whitespace-nowrap align-middle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-4 text-gray-700 align-middle">{p.commodity}</td>
                    <td className="py-2.5 px-4 text-gray-500 align-middle">{p.grade || "Standard"}</td>
                    <td className="py-2.5 px-4 text-gray-700 font-medium align-middle">{(p.price || p.avgPrice || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-gray-400 align-middle">{new Date(p.date || p.recordedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions">
        {myTxns.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No transactions yet.</p>
        ) : (
          <table className="w-full text-[13px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {["Ref", "Buyer", "Total", "Date"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[40px] px-4 whitespace-nowrap align-middle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myTxns.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50/60">
                  <td className="py-2.5 px-4 align-middle"><span className="font-mono text-xs text-green-700 font-semibold">{t.transactionId || t._id?.slice(-8) || `#TXN-${i+1}`}</span></td>
                  <td className="py-2.5 px-4 text-gray-700 align-middle">{t.buyer || "Market"}</td>
                  <td className="py-2.5 px-4 text-gray-700 font-medium align-middle">UGX {(t.total || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-gray-400 align-middle">{new Date(t.date || t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default FarmerDashboardScreen;
