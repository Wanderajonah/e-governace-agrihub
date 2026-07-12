import { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShieldCheck,
  Clock,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  BarChart2,
  Sun,
  CloudRain,
  Tag,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
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
import * as api from "../../api";
import { COLORS } from "../components/shared/COLORS";
import { StatCard, Card, Select } from "../components/shared";

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

export default DashboardScreen;
