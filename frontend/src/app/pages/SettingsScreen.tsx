import { useState, useRef } from "react";
import * as api from "../../api";
import { User, Lock, Settings, Layers } from "lucide-react";
import { PageHeader, Btn, Card, Input, Select } from "../components/shared";
import { COLORS } from "../components/shared/COLORS";

export default function SettingsScreen() {
  const [tab, setTab] = useState<"profile" | "security" | "system" | "theme">(
    "profile",
  );

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    {
      device: "Chrome · Windows 11",
      ip: "197.157.x.x",
      time: "Current session",
      current: true,
    },
    {
      device: "Firefox · Ubuntu 22",
      ip: "197.158.x.x",
      time: "2 hours ago",
      current: false,
    },
  ]);
  const [toggles, setToggles] = useState({
    "Email Notifications": true,
    "Automatic Daily Reports": true,
    "Real-time Price Alerts": false,
    "Audit Logging": true,
  });
  const [sidebarStyle, setSidebarStyle] = useState("Dark");
  const [fontSize, setFontSize] = useState("Medium");
  const [colorTheme, setColorTheme] = useState("Government Green");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPw !== confirmPw) {
      alert("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await api.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      alert("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Configure your account and system preferences"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 h-fit">
          {(
            [
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "system", label: "System Config", icon: Settings },
              { id: "theme", label: "Theme & Display", icon: Layers },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all ${tab === id ? "bg-green-700 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {tab === "profile" && (
            <Card title="Profile Settings">
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-green-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JM</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Wandera Jonah
                  </h3>
                  <p className="text-gray-500 text-sm">Administrator · KCCA</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        alert("Photo changed successfully");
                    }}
                  />
                  <Btn
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="Wandera" />
                <Input label="Last Name" placeholder="Jonah" />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="j.mugisha@kcca.go.ug"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+256 700 000 000"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Agency
                  </label>
                  <Select
                    options={["KCCA", "MAAIF", "UBOS"]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Role
                  </label>
                  <Select options={["Administrator"]} className="w-full" />
                </div>
                <div className="lg:col-span-2">
                  <Input
                    label="Department"
                    placeholder="Market Management Division"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                <Btn
                  onClick={() => alert("Profile changes saved successfully")}
                >
                  Save Changes
                </Btn>
                <Btn variant="outline">Cancel</Btn>
              </div>
            </Card>
          )}

          {tab === "security" && (
            <Card title="Security Settings">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPw}
                      onChange={setCurrentPw}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      value={newPw}
                      onChange={setNewPw}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={setConfirmPw}
                    />
                    <Btn onClick={handleUpdatePassword} disabled={pwSaving}>
                      {pwSaving ? "Updating..." : "Update Password"}
                    </Btn>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">
                    Two-Factor Authentication
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        SMS Authentication
                      </p>
                      <p className="text-xs text-gray-500">
                        Receive OTP via SMS on login
                      </p>
                    </div>
                    <Btn
                      variant={twoFAEnabled ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTwoFAEnabled(!twoFAEnabled);
                        alert(
                          twoFAEnabled
                            ? "2FA disabled"
                            : "2FA enabled - OTP will be sent to your phone on login",
                        );
                      }}
                    >
                      {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Btn>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    Active Sessions
                  </h4>
                  {sessions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {s.device}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.ip} · {s.time}
                        </p>
                      </div>
                      {s.current ? (
                        <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSessions((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                        >
                          Revoke
                        </Btn>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {tab === "system" && (
            <Card title="System Configuration">
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Default Market
                    </label>
                    <Select
                      options={[
                        "Nakasero Market",
                        "Owino Market",
                        "St. Balikuddembe",
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Currency
                    </label>
                    <Select
                      options={["UGX — Ugandan Shilling", "USD — US Dollar"]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Date Format
                    </label>
                    <Select
                      options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Language
                    </label>
                    <Select
                      options={["English", "Luganda", "Swahili"]}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    System Toggles
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(toggles).map(([label, on]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2"
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {label}
                        </p>
                        <button
                          onClick={() =>
                            setToggles((prev) => ({
                              ...prev,
                              [label]: !prev[label],
                            }))
                          }
                          className={`w-10 h-5 rounded-full relative transition-colors ${on ? "bg-green-600" : "bg-gray-200"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-0.5"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Btn onClick={() => alert("Configuration saved successfully")}>
                  Save Configuration
                </Btn>
              </div>
            </Card>
          )}

          {tab === "theme" && (
            <Card title="Theme & Display">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        name: "Government Green",
                        primary: "#2E7D32",
                        secondary: "#4CAF50",
                      },
                      {
                        name: "KCCA Blue",
                        primary: "#1E3A5F",
                        secondary: "#1E88E5",
                      },
                      {
                        name: "MAAIF Gold",
                        primary: "#8B6914",
                        secondary: "#F9A825",
                      },
                    ].map((theme) => (
                      <div
                        key={theme.name}
                        onClick={() => setColorTheme(theme.name)}
                        className={`p-4 border-2 rounded-xl cursor-pointer ${colorTheme === theme.name ? "border-green-600" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex gap-1.5 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ background: theme.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ background: theme.secondary }}
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          {theme.name}
                        </p>
                        {colorTheme === theme.name && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Active
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Sidebar Style
                  </label>
                  <div className="flex gap-3">
                    {["Dark", "Light", "Colored"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSidebarStyle(s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${sidebarStyle === s ? "border-green-600 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-3">
                    Font Size
                  </label>
                  <div className="flex gap-3">
                    {["Small", "Medium", "Large"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${fontSize === s ? "border-green-600 bg-green-50 text-green-700 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Btn onClick={() => alert("Preferences saved successfully")}>
                  Save Preferences
                </Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
