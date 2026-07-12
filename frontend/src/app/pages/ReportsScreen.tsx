import { useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  ArrowLeftRight,
  Users,
  BarChart2,
  PieChart,
  Activity,
  Download,
  Printer,
  FileBarChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, Btn, StatCard, Card } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import * as api from "../../api";

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

export default ReportsScreen;
