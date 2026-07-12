import React, { useState, useEffect } from "react";
import * as api from "../../api";
import { Tag, ShieldCheck, Settings, BarChart2, MoreVertical } from "lucide-react";
import { PageHeader, Btn, Card, Input, Select } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";

export default function NotificationsScreen() {
  const [notifList, setNotifList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .getNotifications()
      .then(({ data }) => {
        if (data.data) {
          const mapped = data.data.map((n: any) => ({
            id: n._id || n.id,
            type: n.type,
            title: n.title,
            time: new Date(n.createdAt).toLocaleString(),
            read: n.read,
          }));
          setNotifList(mapped);
          setUnreadCount(mapped.filter((n: any) => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markAsRead(id);
    } catch {}
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
      >
        <Btn
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await api.markAllAsRead();
              setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
              setUnreadCount(0);
            } catch {}
          }}
        >
          Mark All Read
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {notifList.map((n) => {
            const typeMap: Record<
              string,
              { icon: React.ElementType; color: string; bg: string }
            > = {
              price: { icon: Tag, color: COLORS.warning, bg: "#FFF8E1" },
              verification: {
                icon: ShieldCheck,
                color: COLORS.info,
                bg: "#E3F2FD",
              },
              system: { icon: Settings, color: "#8B5CF6", bg: "#F3E8FF" },
              market: { icon: BarChart2, color: COLORS.success, bg: "#E8F5E9" },
            };
            const t = typeMap[n.type];
            return (
              <div
                key={n.id}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${!n.read ? "border-green-200" : "border-gray-100"}`}
              >
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
                )}
                {n.read && <div className="w-2 h-2 flex-shrink-0" />}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.bg }}
                >
                  <t.icon size={16} style={{ color: t.color }} />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreVertical size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card title="Notification Settings">
            <div className="space-y-3">
              {[
                {
                  label: "Price Alerts",
                  desc: "Commodity price changes",
                  on: true,
                },
                {
                  label: "Verification Alerts",
                  desc: "New items to verify",
                  on: true,
                },
                {
                  label: "System Announcements",
                  desc: "Maintenance & updates",
                  on: false,
                },
                {
                  label: "Market Updates",
                  desc: "Daily market summaries",
                  on: true,
                },
                {
                  label: "Farmer Activities",
                  desc: "New registrations",
                  on: false,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <button
                    className={`w-10 h-5 rounded-full relative transition-colors ${s.on ? "bg-green-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.on ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Send Market Announcement">
            <div className="space-y-3">
              <Input label="Title" placeholder="Announcement title" />
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter announcement message..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Recipients
                </label>
                <Select
                  options={[
                    "All Users",
                    "Market Officers",
                    "Government Officers",
                    "Inspectors",
                  ]}
                  className="w-full"
                />
              </div>
              <Btn className="w-full">Send Announcement</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
