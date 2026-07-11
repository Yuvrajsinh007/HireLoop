import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import PlacementChart from "../../components/dashboard/PlacementChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import ProgressFunnel from "../../components/dashboard/ProgressFunnel";
import Loader from "../../components/common/Loader";
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats, getMyApplications } from "../../services/studentService";
import { formatDate } from "../../utils/formatDate";
import { 
  ClipboardList, CheckCircle, Target, Award, 
  Building, BookOpen, Handshake, User, 
  Lightbulb, AlertTriangle 
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.allSettled([
          getDashboardStats(),
          getMyApplications({ limit: 6 }),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        
        // FIX: Safely extract the 'applications' array from the paginated response
        if (appsRes.status === "fulfilled") {
          setApplications(appsRes.value.data.data?.applications || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = stats?.byStage
    ? Object.entries(stats.byStage).map(([stage, count]) => ({ stage, count }))
    : [];

  const funnelStats = {
    Applied:     stats?.total || 0,
    Shortlisted: stats?.shortlisted || 0,
    Interview:   stats?.interviews || 0,
    Offer:       stats?.offers || 0,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <DashboardLayout>
      <Loader />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {greeting()}, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 font-medium">
              {formatDate(new Date())} · Here is your placement overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/companies" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Building className="w-4 h-4" /> Browse Companies
            </Link>
            <Link to="/journey" className="bg-brand-600 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm">
              <ClipboardList className="w-4 h-4" /> Add Application
            </Link>
          </div>
        </div>

        {/* Email verification banner */}
        {!user?.isEmailVerified && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Verify your email address</p>
              <p className="text-sm text-amber-700 mt-1">
                Please check your inbox at <span className="font-semibold">{user?.email}</span> to verify your account and unlock all features.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Applied"  value={stats?.total ?? 0}       icon={ClipboardList} color="indigo" subtitle="companies applied" />
          <StatsCard title="Shortlisted"    value={stats?.shortlisted ?? 0} icon={CheckCircle}   color="emerald" subtitle="moved forward" />
          <StatsCard title="Interviews"     value={stats?.interviews ?? 0}  icon={Target}        color="amber"  subtitle="rounds attended" />
          <StatsCard title="Offers"         value={stats?.offers ?? 0}      icon={Award}         color="purple" subtitle={stats?.offers > 0 ? "congratulations!" : "keep going!"} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PlacementChart data={chartData} />
          </div>
          <div>
            <ProgressFunnel stats={funnelStats} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
          <div className="lg:col-span-2">
            <RecentActivity applications={applications} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { to: "/journey",      icon: ClipboardList, label: "Track Application"   },
                  { to: "/experiences",  icon: BookOpen,      label: "Read Experiences"    },
                  { to: "/mentors",      icon: Handshake,     label: "Book Mentor Session" },
                  { to: "/profile",      icon: User,          label: "Update Profile"      },
                ].map((a) => (
                  <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-brand-700 transition-colors text-sm font-medium group border border-transparent hover:border-gray-100">
                    <a.icon className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Lightbulb className="w-24 h-24 text-brand-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-brand-900">Tip of the Day</h3>
                </div>
                <p className="text-sm text-brand-800 leading-relaxed font-medium">
                  Update your application stages regularly so your dashboard stays accurate. Seniors use anonymized trends to write better experiences for you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;