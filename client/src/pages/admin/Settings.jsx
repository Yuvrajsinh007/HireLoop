import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import { Settings as SettingsIcon, Bell, Shield, Paintbrush, Save } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center border border-gray-700 shadow-sm">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Configure global preferences and system behaviors.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="w-full md:w-64 flex-shrink-0 space-y-1">
            {[
              { id: "general", label: "General", icon: <SettingsIcon className="w-4 h-4" /> },
              { id: "appearance", label: "Appearance", icon: <Paintbrush className="w-4 h-4" /> },
              { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
              { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="flex-1">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Platform Name</label>
                      <input type="text" defaultValue="HireLoop" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
                      <input type="email" defaultValue="support@hireloop.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Appearance</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">System Theme</p>
                      <p className="text-xs text-gray-500 mt-0.5">Choose your preferred theme.</p>
                    </div>
                    <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500">
                      <option>System Default</option>
                      <option>Light</option>
                      <option>Dark</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Notifications</h3>
                  <div className="space-y-3">
                    {["Email Alerts", "In-App Notifications", "Weekly Reports"].map((item) => (
                      <label key={item} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        <span className="text-sm font-semibold text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Session Timeout (minutes)</label>
                      <input type="number" defaultValue="60" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
