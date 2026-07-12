import { useState, useEffect } from "react";
import {
  Download,
  DollarSign,
  Package,
  ArrowLeftRight,
  Users,
  User,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  Badge,
  StatCard,
  Card,
  PageHeader,
  Btn,
  SearchBar,
  Table,
  Td,
  Select,
  Input,
} from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import * as api from "../../api";

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

export default MarketAnalyticsScreen;
