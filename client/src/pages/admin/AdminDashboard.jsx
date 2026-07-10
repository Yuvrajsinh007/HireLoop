import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";

const ADMIN_ACTIONS = [
  { to: "/admin/users",      icon: "👥", title: "Manage Users",       desc: "View, promote, deactivate users"          },
  { to: "/admin/verify",     icon: "✅", title: "Verify Data",        desc: "Verify experiences and student profiles"  },
  { to: "/officer/dashboard",icon: "📊", title: "Placement Overview", desc: "View full placement analytics"            },
  { to: "/officer/companies",icon: "🏭", title: "Manage Companies",   desc: "Add and edit company information"         },
  { to: "/officer/reports",  icon: "📑", title: "Reports",            desc: "Download and view placement reports"      },
  { to: "/experiences",      icon: "📝", title: "Experiences",        desc: "Moderate interview experiences"           },
];

const AdminDashboard = () => (
  <DashboardLayout>
    <div className="page-wrapper fade-in">
      <div className="mb-8">
        <h1 className="section-title mb-1">Admin Dashboard 🛡️</h1>
        <p className="text-sm text-gray-500">Full control over the HireLoop platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ADMIN_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to}>
            <div className="card-hover h-full">
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default AdminDashboard;