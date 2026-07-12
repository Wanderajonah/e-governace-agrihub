import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, RefreshCw, X } from "lucide-react";
import {
  PageHeader,
  Btn,
  SearchBar,
  Table,
  Td,
  Badge,
  Input,
  Card,
} from "../components/shared";
import { COLORS } from "../components/shared/COLORS";
import * as api from "../../api";

function UsersScreen() {
  const [userList, setUserList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState([
    {
      t: "2024-06-15 09:45",
      u: "Wandera Jonah",
      a: "Farmer registered",
      m: "Farmers",
      ip: "197.157.x.x",
    },
    {
      t: "2024-06-15 09:30",
      u: "Sarah Tendo",
      a: "Price updated",
      m: "Commodity Prices",
      ip: "197.157.x.x",
    },
    {
      t: "2024-06-15 09:15",
      u: "David Okello",
      a: "Produce verified",
      m: "Verification",
      ip: "197.158.x.x",
    },
    {
      t: "2024-06-15 08:50",
      u: "Agnes Nalwoga",
      a: "Report exported",
      m: "Reports",
      ip: "197.159.x.x",
    },
  ]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Market Officer",
    agency: "KCCA",
  });
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    api
      .listUsers({ limit: 100 })
      .then(({ data }) => {
        if (data.data) {
          const list = data.data.users || data.data;
          setUserList(
            list.map((u: any) => ({
              _id: u._id,
              id: u._id?.slice(-4).toUpperCase() || "U001",
              name: u.name,
              role: u.role,
              email: u.email,
              status: u.status,
              lastLogin: u.lastLogin
                ? new Date(u.lastLogin).toLocaleString()
                : "Never",
            })),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUsers();
    api
      .getNotifications()
      .then(({ data }) => {
        if (data.data) {
          const logs = data.data.slice(0, 4).map((n: any) => ({
            t: new Date(n.createdAt).toLocaleString(),
            u: "System",
            a: n.title,
            m: n.type,
            ip: "197.157.x.x",
          }));
          setAuditLogs(logs.length ? logs : auditLogs);
        }
      })
      .catch(() => {});
  }, []);

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Market Officer",
      agency: "KCCA",
    });
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      agency: u.agency || "KCCA",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          agency: form.agency,
        };
        if (form.password) payload.password = form.password;
        await api.updateUser(editingUser._id, payload);
      } else {
        await api.createUser({
          ...form,
          password: form.password || "password123",
        });
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Are you sure you want to deactivate user "${u.name}"?`))
      return;
    try {
      await api.updateUser(u._id, { status: "Inactive" });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleReactivate = async (u: any) => {
    try {
      await api.updateUser(u._id, { status: "Active" });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to activate user");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and permissions"
      >
        <Btn icon={Plus} size="sm" onClick={openAddModal}>
          Add User
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="System Users"
            action={
              <div className="flex gap-2 flex-wrap">
                <SearchBar
                  placeholder="Search users..."
                  className="w-48"
                  value={search}
                  onChange={(v) => setSearch(v)}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Market Officer">Market Officer</option>
                  <option value="Government Officer">Government Officer</option>
                </select>
              </div>
            }
          >
            <Table
              headers={[
                "User ID",
                "Name",
                "Role",
                "Email",
                "Status",
                "Last Login",
                "",
              ]}
            >
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <span className="font-mono text-xs text-green-700 font-semibold">
                      {u.id}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-700">
                          {u.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {u.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <Badge
                      label={u.role}
                      color={
                        u.role === "Administrator"
                          ? COLORS.danger
                          : COLORS.primary
                      }
                    />
                  </Td>
                  <Td className="text-xs text-gray-600">{u.email}</Td>
                  <Td>
                    <Badge
                      label={u.status}
                      color={
                        u.status === "Active" ? COLORS.success : COLORS.warning
                      }
                    />
                  </Td>
                  <Td className="text-xs text-gray-500">{u.lastLogin}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded hover:bg-green-50 text-green-600"
                      >
                        <Edit3 size={12} />
                      </button>
                      {u.status === "Active" ? (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Audit Logs">
            <Table
              headers={["Timestamp", "User", "Action", "Module", "IP Address"]}
            >
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <Td className="font-mono text-xs">{log.t}</Td>
                  <Td className="font-medium text-xs">{log.u}</Td>
                  <Td className="text-xs">{log.a}</Td>
                  <Td>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                      {log.m}
                    </span>
                  </Td>
                  <Td className="font-mono text-xs text-gray-500">{log.ip}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Roles & Permissions">
            <div className="space-y-3">
              {[
                {
                  role: "Administrator",
                  count: userList.filter((u) => u.role === "Administrator")
                    .length,
                  perms: ["Full Access", "User Management", "System Config"],
                },
                {
                  role: "Market Officer",
                  count: userList.filter((u) => u.role === "Market Officer")
                    .length,
                  perms: ["Farmers", "Produce", "Transactions", "Prices"],
                },
                {
                  role: "Government Officer",
                  count: userList.filter((u) => u.role === "Government Officer")
                    .length,
                  perms: ["Dashboard", "Reports", "Analytics", "Price Trends"],
                },
              ].map((r) => (
                <div
                  key={r.role}
                  className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {r.role}
                      </p>
                      <p className="text-xs text-gray-400">{r.count} users</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.perms.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total Users</span>
                <span className="font-semibold">{userList.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active</span>
                <span className="font-semibold text-green-600">
                  {userList.filter((u) => u.status === "Active").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inactive</span>
                <span className="font-semibold text-red-500">
                  {userList.filter((u) => u.status !== "Active").length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Ssekandi"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@kcca.go.ug"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              {!editingUser && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="Leave blank for default password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              )}
              {editingUser && (
                <Input
                  label="New Password (leave blank to keep current)"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Market Officer">Market Officer</option>
                  <option value="Government Officer">Government Officer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Agency
                </label>
                <select
                  value={form.agency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, agency: e.target.value }))
                  }
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="KCCA">KCCA</option>
                  <option value="MAAIF">MAAIF</option>
                  <option value="UBOS">UBOS</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Btn
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Btn>
                <Btn className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersScreen;
