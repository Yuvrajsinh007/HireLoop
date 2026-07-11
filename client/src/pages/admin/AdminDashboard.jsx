import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import { Shield, Users, CheckSquare, BarChart, Factory, FileText } from "lucide-react";

const ADMIN_ACTIONS = [
  { to: "/admin/users", icon: Users, title: "Manage Users", desc: "View, promote, deactivate users" },
  { to: "/admin/verify", icon: CheckSquare, title: "Verify Data", desc: "Verify experiences and student profiles" },
  { to: "/officer/dashboard", icon: BarChart, title: "Placement Overview", desc: "View full placement analytics" },
  { to: "/officer/companies", icon: Factory, title: "Manage Companies", desc: "Add and edit company information" },
  { to: "/officer/reports", icon: FileText, title: "Reports", desc: "Download and view placement reports" },
];

const AdminDashboard = () => (
  <DashboardLayout>
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-brand-600" /> Admin Dashboard
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Full administrative control over HireLoop</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to} className="group">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all h-full">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500 font-medium">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default AdminDashboard;