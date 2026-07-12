import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Globe,
  Building2,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, Btn, StatCard, Card, Select } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import * as api from "../../api";

function GovernmentScreen() {
  const [agency, setAgency] = useState<"kcca" | "maaif" | "ubos">("kcca");
  const [produceVol, setProduceVol] = useState<any[]>([]);
  const [revChart, setRevChart] = useState<any[]>([]);

  const agencyMeta = {
    kcca: {
      name: "KCCA",
      full: "Kampala Capital City Authority",
      color: COLORS.primary,
    },
    maaif: {
      name: "MAAIF",
      full: "Ministry of Agriculture, Animal Industry and Fisheries",
      color: COLORS.info,
    },
    ubos: {
      name: "UBOS",
      full: "Uganda Bureau of Statistics",
      color: "#8B5CF6",
    },
  };

  const meta = agencyMeta[agency];

  useEffect(() => {
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
          setProduceVol(
            data.data.map((v: any, i: number) => ({
              name: v.commodity,
              value: v.totalQuantity,
              fill: fills[i % fills.length],
            })),
          );
        }
      })
      .catch(() => {});
    api
      .getRevenue({ period: 180 })
      .then(({ data }) => {
        if (data.data) {
          setRevChart(
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
      <PageHeader
        title="Government Dashboard"
        subtitle="Unified analytics for government agencies"
      >
        <Btn icon={Download} variant="outline" size="sm">
          Export Report
        </Btn>
      </PageHeader>

      <div className="flex items-center gap-2">
        {(["kcca", "maaif", "ubos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAgency(a)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${agency === a ? "text-white shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            style={
              agency === a
                ? {
                    background: agencyMeta[a].color,
                    borderColor: agencyMeta[a].color,
                  }
                : {}
            }
          >
            <Globe size={14} />
            {agencyMeta[a].name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: meta.color + "18" }}
        >
          <Building2 size={22} style={{ color: meta.color }} />
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {meta.name} — {meta.full}
          </p>
          <p className="text-xs text-gray-500">
            Market analytics dashboard · Nakasero Market, Kampala · Reporting
            Period: June 2024
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Market Revenue"
          value="UGX 2.4B"
          sub="+11.8% YoY"
          color={meta.color}
          trend={11.8}
        />
        <StatCard
          icon={Users}
          label="Registered Farmers"
          value="2,847"
          sub="+342 this year"
          color={COLORS.success}
          trend={342}
        />
        <StatCard
          icon={Package}
          label="Commodity Types"
          value="156"
          sub="Active"
          color={COLORS.info}
        />
        <StatCard
          icon={TrendingUp}
          label="Market Growth"
          value="14.2%"
          sub="Year-on-year"
          color={COLORS.warning}
          trend={14.2}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card
          title="Commodity Movement — Top 5"
          action={<Select options={["June 2024", "Q2 2024"]} />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={produceVol}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Volume (kg)" radius={[4, 4, 0, 0]}>
                {produceVol.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue Trend">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revChart}>
              <defs>
                <linearGradient id="govGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={meta.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={meta.color}
                fill="url(#govGrad)"
                strokeWidth={2.5}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Policy Insights & Market Statistics">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Food Security Index",
              value: "82/100",
              sub: "Good",
              detail:
                "Market supply meets 82% of demand requirements for Kampala.",
              icon: CheckCircle,
              color: COLORS.success,
            },
            {
              title: "Price Stability Score",
              value: "74/100",
              sub: "Moderate",
              detail:
                "Maize and tomato prices show some volatility requiring monitoring.",
              icon: AlertCircle,
              color: COLORS.warning,
            },
            {
              title: "Farmer Registration Rate",
              value: "94%",
              sub: "Excellent",
              detail:
                "94% of active market vendors are formally registered in the system.",
              icon: Star,
              color: COLORS.info,
            },
          ].map(({ title, value, sub, detail, icon: Icon, color }) => (
            <div
              key={title}
              className="text-center p-4 rounded-xl border border-gray-100"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: color + "18" }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-semibold mb-1" style={{ color }}>
                {sub}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default GovernmentScreen;
