import { useState, useEffect } from "react";
import { ShieldCheck, Clock, AlertCircle, RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge, StatCard, Card, PageHeader, Btn, SearchBar, Table, Td, Select, Input } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog";
import * as api from "../../api";

function ProduceVerificationScreen() {
  const [selected, setSelected] = useState<any | null>(null);
  const [produceList, setProduceList] = useState<any[]>([]);

  const [grade, setGrade] = useState("");
  const [qualityStatus, setQualityStatus] = useState("");
  const [moistureContent, setMoistureContent] = useState("");
  const [inspectorComments, setInspectorComments] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPendingProduce = () => {
    api
      .listProduce({ limit: 50, status: "Pending" })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.produce || data.data;
          setProduceList(
            list.map((p: any) => ({
              _id: p._id,
              id: p.produceId || p._id,
              farmer: p.farmerName || p.farmer?.name || "Unknown",
              farmerObj: p.farmer,
              commodity: p.commodity,
              quantity: `${p.quantity} ${p.unit}`,
              district: p.sourceDistrict,
              arrived: new Date(p.arrivalDate).toISOString().split("T")[0],
              status: p.status,
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(loadPendingProduce, []);

  const selectItem = (p: any) => {
    setSelected(p);
    setGrade("");
    setQualityStatus("");
    setMoistureContent("");
    setInspectorComments("");
    setInspectorName("");
  };

  const resetForm = () => {
    setSelected(null);
    setGrade("");
    setQualityStatus("");
    setMoistureContent("");
    setInspectorComments("");
    setInspectorName("");
  };

  const handleVerify = async (approved: boolean) => {
    if (!selected) return;
    if (!grade) {
      alert("Please select a quality grade");
      return;
    }
    if (!qualityStatus) {
      alert("Please select a quality status");
      return;
    }
    if (!inspectorComments) {
      alert("Please enter inspector comments");
      return;
    }

    setSaving(true);
    try {
      const produce = produceList.find((p: any) => p._id === selected._id);
      const farmerId =
        produce?.farmerObj?._id || produce?.farmerObj || selected._id;
      await api.createVerification({
        produce: selected._id,
        farmer: farmerId,
        commodity: selected.commodity,
        quantity: parseFloat(selected.quantity?.split(" ")[0]) || 0,
        district: selected.district,
        arrived: selected.arrived,
        grade: grade.replace("Grade ", ""),
        qualityStatus,
        inspectorComments,
        inspectorName: inspectorName || "Anonymous",
        moistureContent: moistureContent ? Number(moistureContent) : undefined,
      });
      resetForm();
      loadPendingProduce();
      alert(`Produce ${approved ? "approved" : "rejected"} successfully`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = produceList.filter((p) => p.status === "Pending").length;
  const reviewCount = produceList.filter(
    (p) => p.status === "Under Review",
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produce Verification"
        subtitle="Inspect and verify quality of registered produce"
      >
        <StatCard
          icon={Clock}
          label="Pending"
          value={String(pendingCount)}
          sub="awaiting inspection"
          color={COLORS.warning}
        />
        <StatCard
          icon={AlertCircle}
          label="Under Review"
          value={String(reviewCount)}
          sub="being inspected"
          color={COLORS.info}
        />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card
            title="Pending Verification Queue"
            action={
              <Btn
                icon={RefreshCw}
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadPendingProduce();
                  resetForm();
                }}
              >
                Refresh
              </Btn>
            }
          >
            <Table
              headers={[
                "ID",
                "Farmer",
                "Commodity",
                "Quantity",
                "Origin",
                "Arrived",
                "Status",
                "",
              ]}
            >
              {produceList.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === p.id ? "bg-green-50" : ""}`}
                  onClick={() => selectItem(p)}
                >
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {p.id}
                    </span>
                  </Td>
                  <Td className="font-medium">{p.farmer}</Td>
                  <Td>{p.commodity}</Td>
                  <Td>{p.quantity}</Td>
                  <Td>{p.district}</Td>
                  <Td className="text-xs">{p.arrived}</Td>
                  <Td>
                    <Badge
                      label={p.status}
                      color={
                        p.status === "Under Review"
                          ? COLORS.info
                          : COLORS.warning
                      }
                    />
                  </Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectItem(p);
                      }}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <Eye size={12} />
                    </button>
                  </Td>
                </tr>
              ))}
              {produceList.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-center text-gray-400 py-8">
                    No pending produce records
                  </Td>
                </tr>
              )}
            </Table>
          </Card>
        </div>

        <div>
          {selected ? (
            <Card title="Verification Form">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-800">
                    Ref: {selected.id}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {selected.farmer}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selected.commodity} · {selected.quantity} ·{" "}
                    {selected.district}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Quality Grade <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Grade A", "Grade B", "Grade C"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`py-2 text-xs rounded-lg border-2 font-semibold transition-all ${grade === g ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Quality Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qualityStatus}
                    onChange={(e) => setQualityStatus(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  >
                    <option value="">Select status...</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 14.5"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Inspector Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter inspection notes..."
                    value={inspectorComments}
                    onChange={(e) => setInspectorComments(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleVerify(true)}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> {saving ? "Saving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleVerify(false)}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> {saving ? "Saving..." : "Reject"}
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a produce item to verify</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProduceVerificationScreen;
