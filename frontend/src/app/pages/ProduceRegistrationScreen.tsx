import { useState, useEffect } from "react";
import { Search, Package, Leaf, Clock, Eye, Edit3, Trash2, RefreshCw } from "lucide-react";
import { Badge, StatCard, Card, PageHeader, Btn, SearchBar, Table, Td, Select, Input } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog";
import * as api from "../../api";

function ProduceRegistrationScreen() {
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("agrihub_user") || "{}"); } catch { return {}; } })();
  const isFarmer = currentUser.role === "Farmer";
  const [produceRecords, setProduceRecords] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);

  const [form, setForm] = useState({
    farmerId: isFarmer ? currentUser._id : "",
    farmerName: isFarmer ? currentUser.name : "",
    commodity: "",
    quantity: "",
    unit: "kg",
    sourceDistrict: "",
    arrivalDate: "",
    vehiclePlate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduce, setEditingProduce] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    commodity: "",
    quantity: "",
    unit: "kg",
    sourceDistrict: "",
    arrivalDate: "",
    vehiclePlate: "",
    notes: "",
  });
  const [showDetail, setShowDetail] = useState<any | null>(null);
  const [deletingProduce, setDeletingProduce] = useState<any | null>(null);

  const loadProduce = () => {
    const apiCall = isFarmer ? api.listProduce({ limit: 20, farmerId: currentUser._id }) : api.listProduce({ limit: 20 });
    apiCall
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceRecords(
            list.map((p: any) => ({
              _id: p._id,
              id: p.produceId || p._id,
              farmer: p.farmerName || p.farmer?.name || "Unknown",
              farmerId: p.farmer?._id || p.farmer,
              c: p.commodity,
              q: `${p.quantity} ${p.unit}`,
              quantity: p.quantity,
              unit: p.unit,
              d: p.sourceDistrict,
              date: new Date(p.arrivalDate).toISOString().split("T")[0],
              s: p.status,
            })),
          );
        }
      })
      .catch(() => {});
  };

  const loadFarmers = () => {
    api
      .listFarmers({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.farmers || data.data;
          setFarmers(list);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProduce();
    loadFarmers();
  }, []);

  const filteredFarmers = farmers
    .filter(
      (f: any) =>
        (f.name || "").toLowerCase().includes(farmerSearch.toLowerCase()) ||
        (f.farmerId || "").toLowerCase().includes(farmerSearch.toLowerCase()),
    )
    .slice(0, 10);

  const selectFarmer = (f: any) => {
    setForm((p) => ({
      ...p,
      farmerId: f._id,
      farmerName: `${f.farmerId} - ${f.name}`,
    }));
    setFarmerSearch(`${f.farmerId} - ${f.name}`);
    setShowFarmerDropdown(false);
  };

  const resetForm = () => {
    setForm({
      farmerId: "",
      farmerName: "",
      commodity: "",
      quantity: "",
      unit: "kg",
      sourceDistrict: "",
      arrivalDate: "",
      vehiclePlate: "",
      notes: "",
    });
    setFarmerSearch("");
  };

  const handleSave = async () => {
    const missing = [];
    if (!form.farmerId) missing.push("Farmer");
    if (!form.commodity || form.commodity.includes("Select"))
      missing.push("Commodity");
    if (!form.quantity) missing.push("Quantity");
    if (!form.sourceDistrict || form.sourceDistrict.includes("Select"))
      missing.push("Source District");
    if (!form.arrivalDate) missing.push("Arrival Date");
    if (missing.length) {
      alert("Please fill in: " + missing.join(", "));
      return;
    }
    setSaving(true);
    try {
      await api.registerProduce({
        farmer: form.farmerId,
        commodity: form.commodity,
        quantity: Number(form.quantity),
        unit: form.unit,
        sourceDistrict: form.sourceDistrict,
        arrivalDate: form.arrivalDate,
        vehiclePlate: form.vehiclePlate || undefined,
        notes: form.notes || undefined,
      });
      resetForm();
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save produce");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (r: any) => {
    setEditingProduce(r);
    setEditForm({
      commodity: r.c,
      quantity: r.quantity || r.q.replace(/[^0-9]/g, ""),
      unit: r.unit || (r.q.includes("tonnes") ? "tonnes" : "kg"),
      sourceDistrict: r.d,
      arrivalDate: r.date,
      vehiclePlate: "",
      notes: "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editingProduce) return;
    setSaving(true);
    try {
      await api.updateProduce(editingProduce._id, {
        commodity: editForm.commodity,
        quantity: Number(editForm.quantity),
        unit: editForm.unit,
        sourceDistrict: editForm.sourceDistrict,
        arrivalDate: editForm.arrivalDate,
      });
      setShowEditModal(false);
      setEditingProduce(null);
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update produce");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduce) return;
    setSaving(true);
    try {
      await api.deleteProduce(deletingProduce._id);
      setDeletingProduce(null);
      loadProduce();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete produce");
    } finally {
      setSaving(false);
    }
  };

  const totalQuantity = produceRecords.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0),
    0,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produce Registration"
        subtitle="Register agricultural produce arriving at Nakasero Market"
      >
        <Btn
          icon={RefreshCw}
          variant="outline"
          size="sm"
          onClick={() => {
            resetForm();
            loadProduce();
          }}
        >
          Reset
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <Card title="Register New Produce">
            <div className="space-y-4">
              {!isFarmer && (
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Farmer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />
                  <input
                    type="text"
                    placeholder="Search farmer by ID or name..."
                    value={farmerSearch}
                    onChange={(e) => {
                      setFarmerSearch(e.target.value);
                      setForm((p) => ({ ...p, farmerId: "" }));
                      setShowFarmerDropdown(true);
                    }}
                    onFocus={() => setShowFarmerDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowFarmerDropdown(false), 200)
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>
                {showFarmerDropdown && filteredFarmers.length > 0 && (
                  <div className="absolute z-20 mt-1 w-[calc(100%-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredFarmers.map((f: any) => (
                      <button
                        key={f._id}
                        onMouseDown={() => selectFarmer(f)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="font-mono text-xs text-green-700 font-semibold">
                          {f.farmerId}
                        </span>
                        <span className="ml-2 text-gray-800">{f.name}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          {f.district}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}
              {isFarmer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  Registering produce as <strong>{currentUser.name}</strong>
                </div>
              )}

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
                  <option value="">Select commodity...</option>
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantity"
                  placeholder="e.g. 500"
                  required
                  value={form.quantity}
                  onChange={(v) => setForm((p) => ({ ...p, quantity: v }))}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit: e.target.value }))
                    }
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  >
                    <option value="kg">kg</option>
                    <option value="tonnes">tonnes</option>
                    <option value="bags">bags</option>
                    <option value="crates">crates</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Source District <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.sourceDistrict}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sourceDistrict: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="">Select district...</option>
                  <option value="Wakiso">Wakiso</option>
                  <option value="Mukono">Mukono</option>
                  <option value="Lira">Lira</option>
                  <option value="Gulu">Gulu</option>
                  <option value="Mbarara">Mbarara</option>
                  <option value="Kampala">Kampala</option>
                  <option value="Jinja">Jinja</option>
                  <option value="Soroti">Soroti</option>
                  <option value="Mbale">Mbale</option>
                </select>
              </div>
              <Input
                label="Arrival Date"
                type="date"
                required
                value={form.arrivalDate}
                onChange={(v) => setForm((p) => ({ ...p, arrivalDate: v }))}
              />
              <Input
                label="Vehicle Plate Number"
                placeholder="e.g. UAA 123B"
                value={form.vehiclePlate}
                onChange={(v) => setForm((p) => ({ ...p, vehiclePlate: v }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional notes about the produce..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <Btn className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Produce"}
                </Btn>
                <Btn variant="outline" className="flex-1" onClick={resetForm}>
                  Cancel
                </Btn>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={Package}
              label="Today's Arrivals"
              value={produceRecords.length.toString()}
              sub="Registered today"
              color={COLORS.primary}
            />
            <StatCard
              icon={Leaf}
              label="Total Produce"
              value={`${totalQuantity.toLocaleString()} kg`}
              sub="Across all records"
              color={COLORS.info}
            />
            <StatCard
              icon={Clock}
              label="Pending Verification"
              value={produceRecords
                .filter((r) => r.s === "Pending")
                .length.toString()}
              sub="Awaiting inspection"
              color={COLORS.warning}
            />
          </div>

          <Card title="Recent Produce Registrations">
            <div className="flex items-center gap-3 mb-4">
              <SearchBar
                placeholder="Search produce records..."
                className="flex-1"
              />
              <Select
                options={["All Commodities", "Maize", "Beans", "Tomatoes"]}
              />
            </div>
            <Table
              headers={[
                "Reg. ID",
                "Farmer",
                "Commodity",
                "Quantity",
                "Source",
                "Arrival Date",
                "Status",
                "",
              ]}
            >
              {produceRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {r.id}
                    </span>
                  </Td>
                  <Td className="font-medium">{r.farmer}</Td>
                  <Td>{r.c}</Td>
                  <Td>{r.q}</Td>
                  <Td>{r.d}</Td>
                  <Td className="text-xs">{r.date}</Td>
                  <Td>
                    <Badge label={r.s} color={COLORS.primary} />
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowDetail(r)}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingProduce(r)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produce Details</DialogTitle>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs font-semibold text-green-700">
                  Registration ID
                </p>
                <p className="font-mono font-bold text-gray-900">
                  {showDetail.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Farmer</p>
                  <p className="font-medium">{showDetail.farmer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Commodity</p>
                  <p className="font-medium">{showDetail.c}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className="font-medium">{showDetail.q}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Source District</p>
                  <p className="font-medium">{showDetail.d}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Arrival Date</p>
                  <p className="font-medium">{showDetail.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <Badge label={showDetail.s} color={COLORS.primary} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Close</Btn>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produce Record</DialogTitle>
            <DialogDescription>Update the produce details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Commodity <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  "Maize",
                  "Beans",
                  "Tomatoes",
                  "Onions",
                  "Cassava",
                  "Sweet Potato",
                  "Groundnuts",
                  "Sorghum",
                ]}
                value={editForm.commodity}
                onChange={(v) => setEditForm((p) => ({ ...p, commodity: v }))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                required
                value={editForm.quantity}
                onChange={(v) => setEditForm((p) => ({ ...p, quantity: v }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Unit
                </label>
                <Select
                  options={["kg", "tonnes", "bags", "crates", "boxes"]}
                  value={editForm.unit}
                  onChange={(v) => setEditForm((p) => ({ ...p, unit: v }))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Source District <span className="text-red-500">*</span>
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
                value={editForm.sourceDistrict}
                onChange={(v) =>
                  setEditForm((p) => ({ ...p, sourceDistrict: v }))
                }
                className="w-full"
              />
            </div>
            <Input
              label="Arrival Date"
              type="date"
              required
              value={editForm.arrivalDate}
              onChange={(v) => setEditForm((p) => ({ ...p, arrivalDate: v }))}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Update"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingProduce}
        onOpenChange={() => setDeletingProduce(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Produce Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingProduce?.id}</strong> ({deletingProduce?.c})?
              This cannot be undone.
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

export default ProduceRegistrationScreen;
