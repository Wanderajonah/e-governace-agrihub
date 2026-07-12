import { useState, useEffect } from "react";
import * as api from "../../api";
import { Leaf, MapPin, TrendingUp, ChevronRight } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = {
  primary: "#2E7D32", secondary: "#4CAF50", info: "#1E88E5",
  warning: "#F9A825", danger: "#E53935", success: "#43A047",
  dark: "#1F2937", bg: "#F5F7FA", border: "#E5E7EB", text: "#374151",
};

export default function PriceBoardPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [range, setRange] = useState<7 | 30 | 90 | 365>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.listPrices({ limit: 100 }),
      api.getCommodityTrends({ period: range }),
    ])
      .then(([priceRes, trendRes]) => {
        const priceData = priceRes.data?.data?.prices || priceRes.data?.data || [];
        setPrices(Array.isArray(priceData) ? priceData : []);
        
        const trendData = trendRes.data?.data || [];
        if (Array.isArray(trendData) && trendData.length) {
          const byMonth: Record<string, any> = {};
          const monthOrder: string[] = [];
          trendData.forEach((c: any) => {
            (c.data || []).forEach((d: any) => {
              const month = new Date(d.date).toLocaleString("en", { month: "short" });
              if (!byMonth[month]) {
                byMonth[month] = { month };
                monthOrder.push(month);
              }
              byMonth[month][c.commodity.toLowerCase()] = d.price || d.avgPrice;
            });
          });
          setTrends(monthOrder.map((m) => byMonth[m]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between h-16 px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2E7D32] text-white">
              <Leaf size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2E7D32]">AgriHub</span>
          </a>
          <nav className="flex items-center gap-2">
            <a href="/markets" className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">Markets</a>
            <a href="/price-board" className="px-3 py-2 text-sm font-medium text-white bg-[#2E7D32] rounded-lg hover:bg-[#256d28]">Price Board</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin size={14} /> Nakasero Market
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">Price Board</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nakasero Market — Prices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Public, up-to-date commodity prices for Kampala Central — no login required.
          </p>
        </div>

        {/* Prices Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  {["Commodity", "Unit Price", "Type", "Date"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[52px] px-6 whitespace-nowrap align-middle">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">Loading prices...</td>
                  </tr>
                ) : prices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">No prices logged yet for this market.</td>
                  </tr>
                ) : (
                  prices.map((p: any, i: number) => (
                    <tr key={p._id || i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-6 text-[13px] text-gray-800 font-medium">{p.commodity}</td>
                      <td className="py-3.5 px-6 text-[13px] text-gray-900 font-bold">
                        UGX {(p.price || p.avgPrice || 0).toLocaleString()} <span className="font-normal text-gray-500">/ {p.unit || "kg"}</span>
                      </td>
                      <td className="py-3.5 px-6 text-[13px]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          {p.priceType || "wholesale"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-[13px] text-gray-500">
                        {p.date ? new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Trends */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-800">Price Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Historical wholesale prices, per commodity.</p>
            </div>
            <div className="flex gap-1">
              {([7, 30, 90, 365] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    range === d
                      ? "bg-[#2E7D32] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {d === 365 ? "1 year" : `${d} days`}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">Loading trends...</div>
          ) : trends.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">No trend data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `UGX ${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`UGX ${v.toLocaleString()}`, ""]} />
                {Object.keys(trends[0] || {})
                  .filter((k) => k !== "month")
                  .slice(0, 4)
                  .map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={[COLORS.primary, COLORS.info, COLORS.warning, COLORS.danger][i % 4]}
                      strokeWidth={2}
                      dot={false}
                      name={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <p className="text-sm text-gray-500 text-center">
            AgriHub — a digital agricultural market governance platform. Case study: Nakasero Market, Kampala.
          </p>
        </div>
      </footer>
    </div>
  );
}
