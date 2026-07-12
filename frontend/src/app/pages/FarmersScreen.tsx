import { useState, useEffect } from "react";
import { ChevronRight, User, Hash, MapPin, Phone, Leaf, Calendar, Edit3, Trash2, Eye, Plus, Download, Search, X, ArrowUpDown } from "lucide-react";
import { Badge, StatCard, Card, PageHeader, Btn, SearchBar, Table, Td, Select, Input } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog";
import * as api from "../../api";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Inactive: "bg-gray-50 text-gray-500 ring-gray-500/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Verified: "bg-green-50 text-green-700 ring-green-600/20",
  Rejected: "bg-red-50 text-red-700 ring-red-600/20",
};

function StatusBadge({ label }: { label: string }) {
  const cls = STATUS_STYLES[label] ?? "bg-gray-50 text-gray-500 ring-gray-400/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

function FarmersScreen() {
  const [view, setView] = useState<"list" | "profile">("list");
  const [farmerList, setFarmerList] = useState<any[]>([]);
  const [selectedFarmer, setSelected] = useState<any | null>(null);
  const [produceHistory, setProduceHistory] = useState<any[]>([]);
  const [txnHistory, setTxnHistory] = useState<any[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

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
              status: f.status || "Active",
              registered: f.registered ? new Date(f.registered).toISOString().split("T")[0] : "—",
            })),
          );
          setTotalFarmers(data.pagination?.total || list.length);
          if (!selectedFarmer) setSelected(list[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(loadFarmers, []);

  const loadFarmerProfile = (farmerId) => {
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

  const filteredList = farmerList.filter((f) =>
    !searchQuery ||
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === "profile") {
    if (!selectedFarmer) return null;
    return (
      <div className="space-y-6">
        <button
          onClick={() => setView("list")}
          className="inline-flex items-center gap-1.5 text-sm text-[#0f6a34] hover:text-[#0c5b2d] font-medium transition-colors"
        >
          <ChevronRight size={14} className="rotate-180" />
          Back to all farmers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0f6a34]/10 flex items-center justify-center mx-auto mb-3">
                <User size={28} className="text-[#0f6a34]" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedFarmer.name}
              </h3>
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-mono">
                <Hash size={11} />
                {selectedFarmer.id || selectedFarmer.farmerId}
              </div>
              <div className="mt-2">
                <StatusBadge label={selectedFarmer.status} />
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              {[
                { icon: MapPin, label: "District", value: selectedFarmer.district },
                { icon: Phone, label: "Phone", value: selectedFarmer.phone },
                { icon: Leaf, label: "Produce", value: selectedFarmer.produce },
                { icon: Calendar, label: "Registered", value: selectedFarmer.registered },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-gray-800 font-medium truncate">{value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6 pt-5 border-t border-gray-100">
              <Btn variant="outline" icon={Edit3} size="sm" className="flex-1" onClick={() => openEditModal(selectedFarmer)}>
                Edit
              </Btn>
              <Btn variant="danger" icon={Trash2} size="sm" className="flex-1" onClick={() => setDeletingFarmer(selectedFarmer)}>
                Delete
              </Btn>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-2 space-y-5">
            <Card title="Produce History">
              {produceHistory.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No produce records found.</p>
              ) : (
                <Table headers={["Commodity", "Quantity", "Date", "Status"]}>
                  {produceHistory.map((r, i) => (
                    <tr key={i}>
                      <Td>{r.c}</Td>
                      <Td>{r.q}</Td>
                      <Td className="text-gray-400">{r.d}</Td>
                      <Td><StatusBadge label={r.s} /></Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
            <Card title="Transaction History">
              {txnHistory.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No transactions found.</p>
              ) : (
                <Table headers={["Ref", "Buyer", "Amount", "Payment", "Date"]}>
                  {txnHistory.map((t) => (
                    <tr key={t.id}>
                      <Td><span className="font-mono text-xs text-[#0f6a34] font-semibold">{t.id?.slice(-10) || "—"}</span></Td>
                      <Td>{t.buyer}</Td>
                      <Td className="font-medium tabular-nums">UGX {(t.total || 0).toLocaleString()}</Td>
                      <Td className="text-gray-400">{t.payment || "—"}</Td>
                      <Td className="text-xs text-gray-400 whitespace-nowrap">{t.date}</Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Farmers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalFarmers} registered farmers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} />
            Export
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0f6a34] rounded-lg hover:bg-[#0c5b2d] transition-colors shadow-sm"
          >
            <Plus size={14} />
            Add farmer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search + filters */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, ID, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6a34]/20 focus:border-[#0f6a34] transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0f6a34]/20 focus:border-[#0f6a34]">
            <option>All districts</option>
            <option>Wakiso</option>
            <option>Mukono</option>
            <option>Lira</option>
            <option>Gulu</option>
            <option>Mbarara</option>
            <option>Kampala</option>
          </select>
          <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0f6a34]/20 focus:border-[#0f6a34]">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Farmer", "ID", "District", "Phone", "Produce", "Status", "Registered", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider h-12 px-4 whitespace-nowrap align-middle"
                  >
                    {h === "Farmer" ? (
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-700">
                        {h} <ArrowUpDown size={11} />
                      </span>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <User size={32} className="text-gray-300" />
                      <p className="text-sm text-gray-400">No farmers found</p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-xs text-[#0f6a34] hover:underline">
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((f) => (
                  <tr key={f.id || f._id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="py-3 px-4 align-middle">
                      <button
                        onClick={() => selectFarmer(f)}
                        className="text-sm font-medium text-gray-900 hover:text-[#0f6a34] transition-colors"
                      >
                        {f.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <span className="font-mono text-xs text-gray-400">{f.id}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 align-middle">{f.district}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 align-middle font-mono">{f.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 align-middle">{f.produce || "—"}</td>
                    <td className="py-3 px-4 align-middle">
                      <StatusBadge label={f.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400 align-middle whitespace-nowrap">{f.registered}</td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => selectFarmer(f)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#0f6a34] hover:bg-[#0f6a34]/5 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingFarmer(f)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {filteredList.length} of {totalFarmers} farmers
          </p>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#0f6a34] border border-[#0f6a34] rounded-md">
              1
            </button>
            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Farmer Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFarmer ? "Edit farmer" : "Add farmer"}</DialogTitle>
            <DialogDescription>
              {editingFarmer ? "Update the farmer's details below." : "Register a new farmer in the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Full name" placeholder="e.g. John Ssekandi" required value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
            <Input label="Phone number" placeholder="e.g. +256 700 000 000" required value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">District <span className="text-red-500">*</span></label>
              <Select
                options={["Wakiso", "Mukono", "Lira", "Gulu", "Mbarara", "Kampala", "Jinja", "Soroti", "Mbale"]}
                value={form.district}
                onChange={(v) => setForm((p) => ({ ...p, district: v }))}
                className="w-full"
              />
            </div>
            <Input label="Produce (comma-separated)" placeholder="e.g. Maize, Beans" required value={form.produce} onChange={(v) => setForm((p) => ({ ...p, produce: v }))} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingFarmer ? "Update farmer" : "Add farmer"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingFarmer} onOpenChange={() => setDeletingFarmer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete farmer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingFarmer?.name}</strong>? This action cannot be undone.
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
