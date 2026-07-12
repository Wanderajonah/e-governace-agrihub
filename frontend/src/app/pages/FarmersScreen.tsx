import { useState, useEffect } from "react";
import { ChevronRight, User, Hash, MapPin, Phone, Leaf, Calendar, Edit3, Trash2, Eye, Plus, Download } from "lucide-react";
import { Badge, StatCard, Card, PageHeader, Btn, SearchBar, Table, Td, Select, Input } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog";
import * as api from "../../api";

function FarmersScreen() {
  const [view, setView] = useState<"list" | "profile">("list");
  const [farmerList, setFarmerList] = useState<any[]>([]);
  const [selectedFarmer, setSelected] = useState<any | null>(null);
  const [produceHistory, setProduceHistory] = useState<any[]>([]);
  const [txnHistory, setTxnHistory] = useState<any[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any | null>(null);
  const [deletingFarmer, setDeletingFarmer] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    district: "",
    phone: "",
    produce: "",
  });
  const [saving, setSaving] = useState(false);

  const loadFarmers = () => {
    api
      .listFarmers({ limit: 50 })
      .then(({ data }) => {
        if (data.data?.farmers || data.data?.length) {
          const list = data.data.farmers || data.data;
          setFarmerList(
            list.map((f) => ({
              id: f.farmerId || f._id,
              _id: f._id,
              name: f.name,
              district: f.district,
              phone: f.phone,
              produce: f.produce,
              status: f.status,
              registered: new Date(f.registered).toISOString().split("T")[0],
            })),
          );
          setTotalFarmers(data.pagination?.total || list.length);
          if (!selectedFarmer) setSelected(list[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(loadFarmers, []);

  const loadFarmerProfile = async (farmerId) => {
    api
      .listProduce({ farmer: farmerId })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceHistory(
            list.slice(0, 5).map((p: any) => ({
              c: p.commodity,
              q: `${p.quantity} ${p.unit}`,
              d: new Date(p.arrivalDate).toISOString().split("T")[0],
              s: p.status,
            })),
          );
        }
      })
      .catch(() => {});
    api
      .listTransactions({ seller: farmerId })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.transactions || data.data;
          setTxnHistory(
            list.slice(0, 3).map((t: any) => ({
              id: t.transactionId || t._id,
              buyer: t.buyer,
              seller: t.seller,
              total: t.total,
              payment: t.payment,
              date: new Date(t.date).toLocaleString(),
            })),
          );
        }
      })
      .catch(() => {});
  };

  const selectFarmer = (f) => {
    setSelected(f);
    setView("profile");
    loadFarmerProfile(f._id || f.id);
  };

  const openAddModal = () => {
    setForm({ name: "", district: "Wakiso", phone: "", produce: "" });
    setEditingFarmer(null);
    setShowAddModal(true);
  };

  const openEditModal = (f) => {
    setForm({
      name: f.name,
      district: f.district,
      phone: f.phone,
      produce: f.produce,
    });
    setEditingFarmer(f);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingFarmer) {
        await api.updateFarmer(editingFarmer._id || editingFarmer.id, form);
      } else {
        await api.createFarmer(form);
      }
      setShowAddModal(false);
      setEditingFarmer(null);
      loadFarmers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save farmer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFarmer) return;
    setSaving(true);
    try {
      await api.deleteFarmer(deletingFarmer._id || deletingFarmer.id);
      setDeletingFarmer(null);
      if (
        view === "profile" &&
        (selectedFarmer?._id || selectedFarmer?.id) ===
          (deletingFarmer._id || deletingFarmer.id)
      ) {
        setView("list");
      }
      loadFarmers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete farmer");
    } finally {
      setSaving(false);
    }
  };

  if (view === "profile") {
    if (!selectedFarmer) return null;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
          >
            <ChevronRight size={14} className="rotate-180" /> Back to Farmers
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-w-0">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <User size={36} className="text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 break-words text-lg">
                {selectedFarmer.name}
              </h3>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-green-50 rounded-full text-xs font-mono font-semibold text-green-800">
                <Hash size={11} />
                {selectedFarmer.id || selectedFarmer.farmerId}
              </div>
              <div className="mt-2">
                <Badge label={selectedFarmer.status} color={COLORS.primary} />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              {[
                {
                  icon: MapPin,
                  label: "District",
                  value: selectedFarmer.district,
                },
                { icon: Phone, label: "Phone", value: selectedFarmer.phone },
                { icon: Leaf, label: "Produce", value: selectedFarmer.produce },
                {
                  icon: Calendar,
                  label: "Registered",
                  value: selectedFarmer.registered,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-gray-800 font-medium truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-gray-100">
              <Btn
                variant="outline"
                icon={Edit3}
                size="sm"
                className="flex-1"
                onClick={() => openEditModal(selectedFarmer)}
              >
                Edit
              </Btn>
              <Btn
                variant="danger"
                icon={Trash2}
                size="sm"
                className="flex-1"
                onClick={() => setDeletingFarmer(selectedFarmer)}
              >
                Delete
              </Btn>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Card title="Produce History">
              <Table headers={["Commodity", "Quantity", "Date", "Status"]}>
                {produceHistory.map((r, i) => (
                  <tr key={i}>
                    <Td>{r.c}</Td>
                    <Td>{r.q}</Td>
                    <Td>{r.d}</Td>
                    <Td>
                      <Badge label={r.s} color={COLORS.success} />
                    </Td>
                  </tr>
                ))}
              </Table>
            </Card>
            <Card title="Transaction History">
              <Table headers={["Ref", "Buyer", "Amount", "Payment", "Date"]}>
                {txnHistory.map((t) => (
                  <tr key={t.id}>
                    <Td>
                      <span className="font-mono text-xs text-green-700">
                        {t.id}
                      </span>
                    </Td>
                    <Td>{t.buyer}</Td>
                    <Td className="whitespace-nowrap">
                      UGX {t.total.toLocaleString()}
                    </Td>
                    <Td>{t.payment}</Td>
                    <Td className="text-xs text-gray-500 whitespace-nowrap">
                      {t.date}
                    </Td>
                  </tr>
                ))}
              </Table>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farmer Management"
        subtitle={`${farmerList.length} registered farmers`}
      >
        <Btn icon={Download} variant="outline" size="sm">
          Export
        </Btn>
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add Farmer
        </Btn>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-200">
          <SearchBar
            placeholder="Search by name, ID, district..."
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={[
              "All Districts",
              "Wakiso",
              "Mukono",
              "Lira",
              "Gulu",
              "Mbarara",
              "Kampala",
            ]}
          />
          <Select options={["All Status", "Active", "Inactive", "Pending"]} />
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-[13px]"
            style={{ borderCollapse: "separate", borderSpacing: 0 }}
          >
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {[
                  "Farmer ID", "Name", "District", "Phone",
                  "Produce", "Status", "Registered", "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-[48px] px-5 whitespace-nowrap align-middle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {farmerList.map((f) => (
                <tr
                  key={f.id || f._id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-5 text-gray-700 align-middle">
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {f.id || f.farmerId}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-700 align-middle">
                    <button
                      onClick={() => selectFarmer(f)}
                      className="text-left text-gray-700 hover:text-green-700 transition-colors"
                    >
                      {f.name}
                    </button>
                  </td>
                  <td className="py-3 px-5 text-gray-700 align-middle">{f.district}</td>
                  <td className="py-3 px-5 text-gray-500 align-middle">{f.phone}</td>
                  <td className="py-3 px-5 text-gray-600 align-middle">{f.produce}</td>
                  <td className="py-3 px-5 align-middle">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-400 align-middle">{f.registered}</td>
                  <td className="py-3 px-5 align-middle">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectFarmer(f)}
                        className="text-xs font-medium text-gray-500 hover:text-green-700 transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => openEditModal(f)}
                        className="text-xs font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingFarmer(f)}
                        className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Show</span>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>per page</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 48].map((p, i) => (
              <button
                key={i}
                className={`min-w-[32px] h-8 text-xs font-medium rounded-md flex items-center justify-center transition-colors ${
                  p === 1
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Showing 1–{farmerList.length} of {totalFarmers}
          </div>
        </div>
      </div>

      {/* Add/Edit Farmer Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFarmer ? "Edit Farmer" : "Add New Farmer"}
            </DialogTitle>
            <DialogDescription>
              {editingFarmer
                ? "Update the farmer's details below."
                : "Fill in the details to register a new farmer."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              label="Full Name"
              placeholder="e.g. John Ssekandi"
              required
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +256 700 000 000"
              required
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  "Wakiso",
                  "Mukono",
                  "Lira",
                  "Gulu",
                  "Mbarara",
                  "Kampala",
                  "Jinja",
                  "Soroti",
                  "Mbale",
                ]}
                value={form.district}
                onChange={(v) => setForm((p) => ({ ...p, district: v }))}
              />
            </div>
            <Input
              label="Produce (comma-separated)"
              placeholder="e.g. Maize, Beans"
              required
              value={form.produce}
              onChange={(v) => setForm((p) => ({ ...p, produce: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingFarmer
                  ? "Update Farmer"
                  : "Add Farmer"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingFarmer}
        onOpenChange={() => setDeletingFarmer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Farmer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingFarmer?.name}</strong>? This action cannot be
              undone.
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

export default FarmersScreen;
