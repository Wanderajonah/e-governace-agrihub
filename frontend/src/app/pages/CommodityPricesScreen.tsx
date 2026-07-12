import { useState, useEffect } from "react";
import {
  Leaf,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
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

function CommodityPricesScreen() {
  const [prices, setPrices] = useState<any[]>([]);
  const [priceTrends, setPriceTrends] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any | null>(null);
  const [deletingPrice, setDeletingPrice] = useState<any | null>(null);
  const [form, setForm] = useState({
    commodity: "",
    price: "",
    grade: "A",
    date: "",
  });
  const [saving, setSaving] = useState(false);

  const loadPrices = () => {
    api
      .listPrices({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.prices || data.data;
          setPrices(
            list.map((p: any) => ({
              _id: p._id,
              id: p._id,
              commodity: p.commodity,
              unit: p.unit,
              price: p.price,
              change: p.change || 0,
              date: new Date(p.date).toISOString().split("T")[0],
              grade: p.grade,
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPrices();
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
          setPriceTrends(monthOrder.map((m) => byMonth[m]));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = prices.filter((c) =>
    c.commodity.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openAddModal = () => {
    setForm({
      commodity: "Maize",
      price: "",
      grade: "A",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingPrice(null);
    setShowAddModal(true);
  };

  const openEditModal = (c: any) => {
    setForm({
      commodity: c.commodity,
      price: String(c.price),
      grade: c.grade || "A",
      date: c.date,
    });
    setEditingPrice(c);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.commodity || !form.price || !form.date) {
      alert("Please fill in commodity, price, and date");
      return;
    }
    setSaving(true);
    try {
      if (editingPrice) {
        await api.updatePrice(editingPrice._id, {
          commodity: form.commodity,
          price: Number(form.price),
          grade: form.grade,
          date: form.date,
        });
      } else {
        await api.createPrice({
          commodity: form.commodity,
          price: Number(form.price),
          unit: "kg",
          grade: form.grade,
          date: form.date,
        });
      }
      setShowAddModal(false);
      setEditingPrice(null);
      loadPrices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save price");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPrice) return;
    setSaving(true);
    try {
      await api.deletePrice(deletingPrice._id);
      setDeletingPrice(null);
      loadPrices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete price");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "Commodity",
      "Grade",
      "Price (UGX/kg)",
      "Change (%)",
      "Date",
    ];
    const rows = prices.map((c) => [
      c.commodity,
      c.grade,
      c.price,
      c.change,
      c.date,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commodity_prices_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commodity Price Management"
        subtitle="Daily market prices at Nakasero Market"
      >
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add Price
        </Btn>
        <Btn icon={Download} variant="outline" size="sm" onClick={handleExport}>
          Export
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={`Today's Commodity Prices — ${today}`}
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search commodity..."
                  className="w-48"
                  value={search}
                  onChange={(v) => setSearch(v)}
                />
                <Btn
                  icon={RefreshCw}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    loadPrices();
                    setPage(1);
                  }}
                >
                  Refresh
                </Btn>
              </div>
            }
          >
            <Table
              headers={[
                "Commodity",
                "Grade",
                "Price (UGX/kg)",
                "Change",
                "Updated",
                "",
              ]}
            >
              {pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                        <Leaf size={12} className="text-green-700" />
                      </div>
                      <span className="font-semibold text-gray-800">
                        {c.commodity}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs font-bold text-green-700">
                      {c.grade}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-base font-bold text-gray-900">
                      {c.price.toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold ${c.change > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {c.change > 0 ? (
                        <ArrowUp size={11} />
                      ) : (
                        <ArrowDown size={11} />
                      )}
                      {Math.abs(c.change)}%
                    </span>
                  </Td>
                  <Td className="text-xs text-gray-500">{c.date}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingPrice(c)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-gray-400 py-8">
                    No prices found
                  </Td>
                </tr>
              )}
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm">
                <span className="text-gray-500">
                  Page {page} of {totalPages} ({filtered.length} items)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg ${p === page ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>

          <Card title="Price Trend — Maize vs Beans (Jan–Jun 2024)">
            <ResponsiveContainer width="100%" height={250}>
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
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  name="Maize"
                />
                <Line
                  type="monotone"
                  dataKey="beans"
                  stroke={COLORS.info}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.info, r: 4 }}
                  name="Beans"
                />
                <Line
                  type="monotone"
                  dataKey="tomatoes"
                  stroke={COLORS.danger}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.danger, r: 4 }}
                  name="Tomatoes"
                />
                <Line
                  type="monotone"
                  dataKey="onions"
                  stroke={COLORS.warning}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.warning, r: 4 }}
                  name="Onions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Top Movers Today">
            <div className="space-y-3">
              {[...prices]
                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                .slice(0, 4)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                        <Leaf size={10} className="text-green-700" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {c.commodity}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        UGX {c.price.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${c.change > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {c.change > 0 ? (
                          <ArrowUp size={9} />
                        ) : (
                          <ArrowDown size={9} />
                        )}
                        {Math.abs(c.change)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Price Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? "Edit Price" : "Add New Price"}
            </DialogTitle>
            <DialogDescription>
              {editingPrice
                ? "Update the commodity price below."
                : "Enter the commodity price details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Commodity <span className="text-red-500">*</span>
              </label>
              <select
                value={form.commodity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, commodity: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="Maize">Maize</option>
                <option value="Beans">Beans</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Onions">Onions</option>
                <option value="Cassava">Cassava</option>
                <option value="Sweet Potato">Sweet Potato</option>
                <option value="Groundnuts">Groundnuts</option>
                <option value="Sorghum">Sorghum</option>
              </select>
            </div>
            <Input
              label="Price (UGX/kg)"
              placeholder="e.g. 1500"
              type="number"
              required
              value={form.price}
              onChange={(v) => setForm((p) => ({ ...p, price: v }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Grade
              </label>
              <select
                value={form.grade}
                onChange={(e) =>
                  setForm((p) => ({ ...p, grade: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <Input
              label="Effective Date"
              type="date"
              required
              value={form.date}
              onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingPrice
                  ? "Update Price"
                  : "Add Price"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingPrice}
        onOpenChange={() => setDeletingPrice(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Price</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the price for{" "}
              <strong>{deletingPrice?.commodity}</strong> (
              {deletingPrice?.grade})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CommodityPricesScreen;
