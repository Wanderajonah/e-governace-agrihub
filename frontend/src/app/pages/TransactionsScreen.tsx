import { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  ArrowLeftRight,
  DollarSign,
  Hash,
  Eye,
  X,
  Leaf,
  Download,
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

function TransactionsScreen() {
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [txnList, setTxnList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Methods");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showNewTxn, setShowNewTxn] = useState(false);
  const [form, setForm] = useState({
    buyer: "",
    seller: "",
    commodity: "",
    qtyNum: "",
    unitPrice: "",
    payment: "Mobile Money",
  });
  const [saving, setSaving] = useState(false);

  const loadTxns = () => {
    api
      .listTransactions({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.transactions || data.data;
          setTxnList(
            list.map((t: any) => ({
              _id: t._id,
              id: t.transactionId || t._id,
              buyer: t.buyer,
              seller: t.seller,
              commodity: t.commodity,
              qty: t.qty || `${t.qtyNum || 0} kg`,
              qtyNum: t.qtyNum,
              unitPrice: t.unitPrice,
              total: t.total,
              payment: t.payment,
              date: new Date(t.date || t.createdAt).toLocaleString(),
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(loadTxns, []);

  const filtered = txnList.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(q) ||
      t.buyer.toLowerCase().includes(q) ||
      t.seller.toLowerCase().includes(q);
    const matchPayment =
      paymentFilter === "All Methods" || t.payment === paymentFilter;
    return matchSearch && matchPayment;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

  const totVal = filtered.reduce((s, t) => s + (t.total || 0), 0);
  const todayTxns = filtered.filter(
    (t) => new Date(t.date).toDateString() === new Date().toDateString(),
  );

  const computedTotal =
    (Number(form.qtyNum) || 0) * (Number(form.unitPrice) || 0);

  const resetForm = () =>
    setForm({
      buyer: "",
      seller: "",
      commodity: "",
      qtyNum: "",
      unitPrice: "",
      payment: "Mobile Money",
    });

  const handleSaveTxn = async () => {
    if (
      !form.buyer ||
      !form.seller ||
      !form.commodity ||
      !form.qtyNum ||
      !form.unitPrice
    ) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await api.createTransaction({
        buyer: form.buyer,
        seller: form.seller,
        commodity: form.commodity,
        quantity: `${Number(form.qtyNum)} kg`,
        qtyNum: Number(form.qtyNum),
        unitPrice: Number(form.unitPrice),
        payment: form.payment,
        date: new Date().toISOString(),
      });
      resetForm();
      setShowNewTxn(false);
      loadTxns();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReport = () => window.print();

  const handlePrintReceipt = () => {
    const el = document.getElementById("receipt-content");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:20px;max-width:350px;margin:auto}table{width:100%}td{padding:4px 0}.total{border-top:2px solid #000;font-weight:bold;font-size:18px}</style></head><body>${el.innerHTML}</body></html>`,
    );
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transaction Management"
        subtitle="Record and track all market transactions"
      >
        <Btn
          icon={Plus}
          size="sm"
          onClick={() => {
            resetForm();
            setShowNewTxn(true);
          }}
        >
          New Transaction
        </Btn>
        <Btn
          icon={Printer}
          variant="outline"
          size="sm"
          onClick={handlePrintReport}
        >
          Print Report
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={ArrowLeftRight}
              label="Today"
              value={String(todayTxns.length)}
              sub="transactions"
              color={COLORS.primary}
            />
            <StatCard
              icon={DollarSign}
              label="Total Value"
              value={`UGX ${totVal.toLocaleString()}`}
              sub="all records"
              color={COLORS.success}
            />
            <StatCard
              icon={Hash}
              label="Total Records"
              value={String(filtered.length)}
              sub="filtered"
              color={COLORS.warning}
            />
          </div>

          <Card
            title="Transaction History"
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search TXN ID, buyer, seller..."
                  className="w-48"
                  value={search}
                  onChange={setSearch}
                />
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="All Methods">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            }
          >
            <Table
              headers={[
                "TXN ID",
                "Buyer",
                "Seller",
                "Commodity",
                "Qty",
                "Total (UGX)",
                "Payment",
                "Date",
                "",
              ]}
            >
              {pageItems.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedTxn?.id === t.id ? "bg-green-50" : ""}`}
                  onClick={() => setSelectedTxn(t)}
                >
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {t.id}
                    </span>
                  </Td>
                  <Td className="font-medium text-xs">{t.buyer}</Td>
                  <Td className="text-xs">{t.seller}</Td>
                  <Td>{t.commodity}</Td>
                  <Td>{t.qty}</Td>
                  <Td>
                    <span className="font-bold">
                      {t.total?.toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs">{t.payment}</span>
                  </Td>
                  <Td className="text-xs text-gray-500">{t.date}</Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTxn(t);
                        setShowReceipt(true);
                      }}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <Eye size={12} />
                    </button>
                  </Td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <Td colSpan={9} className="text-center text-gray-400 py-8">
                    No transactions found
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
        </div>

        <div className="space-y-4">
          <Card title="Record New Transaction">
            <div className="space-y-3">
              <Input
                label="Buyer Name"
                placeholder="Company or individual name"
                required
                value={form.buyer}
                onChange={(v) => setForm((p) => ({ ...p, buyer: v }))}
              />
              <Input
                label="Seller (Farmer)"
                placeholder="Farmer name"
                required
                value={form.seller}
                onChange={(v) => setForm((p) => ({ ...p, seller: v }))}
              />
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
                  <option value="Sorghum">Sorghum</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity (kg)"
                  placeholder="500"
                  type="number"
                  required
                  value={form.qtyNum}
                  onChange={(v) => setForm((p) => ({ ...p, qtyNum: v }))}
                />
                <Input
                  label="Unit Price (UGX)"
                  placeholder="1500"
                  type="number"
                  required
                  value={form.unitPrice}
                  onChange={(v) => setForm((p) => ({ ...p, unitPrice: v }))}
                />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-700">
                  UGX {computedTotal.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={form.payment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, payment: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                >
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <Btn className="w-full" onClick={handleSaveTxn} disabled={saving}>
                {saving ? "Saving..." : "Record Transaction"}
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={showNewTxn} onOpenChange={setShowNewTxn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
            <DialogDescription>
              Record a new market transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              label="Buyer Name"
              placeholder="Company or individual name"
              required
              value={form.buyer}
              onChange={(v) => setForm((p) => ({ ...p, buyer: v }))}
            />
            <Input
              label="Seller (Farmer)"
              placeholder="Farmer name"
              required
              value={form.seller}
              onChange={(v) => setForm((p) => ({ ...p, seller: v }))}
            />
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
                <option value="Sorghum">Sorghum</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity (kg)"
                placeholder="500"
                type="number"
                required
                value={form.qtyNum}
                onChange={(v) => setForm((p) => ({ ...p, qtyNum: v }))}
              />
              <Input
                label="Unit Price (UGX)"
                placeholder="1500"
                type="number"
                required
                value={form.unitPrice}
                onChange={(v) => setForm((p) => ({ ...p, unitPrice: v }))}
              />
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-green-700">
                UGX {computedTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Payment Method
              </label>
              <select
                value={form.payment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, payment: e.target.value }))
                }
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Btn variant="outline">Cancel</Btn>
            </DialogClose>
            <Btn onClick={handleSaveTxn} disabled={saving}>
              {saving ? "Saving..." : "Record Transaction"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowReceipt(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Market Receipt</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div id="receipt-content">
              <div className="text-center border-b border-gray-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-2">
                  <Leaf size={18} className="text-white" />
                </div>
                <p className="font-bold text-gray-900">Nakasero Market</p>
                <p className="text-xs text-gray-500">
                  Kampala Capital City Authority
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  E-Governance AgriHub
                </p>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {[
                  ["Receipt No", selectedTxn.id],
                  ["Date", selectedTxn.date],
                  ["Buyer", selectedTxn.buyer],
                  ["Seller", selectedTxn.seller],
                  ["Commodity", selectedTxn.commodity],
                  ["Quantity", selectedTxn.qty],
                  [
                    "Unit Price",
                    `UGX ${(selectedTxn.unitPrice || 0).toLocaleString()}`,
                  ],
                  ["Payment", selectedTxn.payment],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-base">
                  <span>TOTAL</span>
                  <span className="text-green-700">
                    UGX {(selectedTxn.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Btn
                icon={Printer}
                className="flex-1"
                size="sm"
                onClick={handlePrintReceipt}
              >
                Print
              </Btn>
              <Btn
                icon={Download}
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={handlePrintReceipt}
              >
                PDF
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsScreen;
