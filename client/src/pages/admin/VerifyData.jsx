import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import { getExperiences } from "../../services/experienceService";
import { verifyExperience } from "../../services/officerService";
import { timeAgo } from "../../utils/formatDate";
import toast from "react-hot-toast";

const VerifyData = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [verifying, setVerifying]     = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getExperiences({ limit: 50, sort: "-createdAt" });
        setExperiences(res.data.data?.experiences || []);
      } catch {
        toast.error("Failed to load experiences");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleVerify = async (id) => {
    try {
      setVerifying(id);
      await verifyExperience(id);
      setExperiences((p) =>
        p.map((e) => e._id === id ? { ...e, isVerified: true } : e)
      );
      toast.success("Experience verified ✅");
    } catch {
      toast.error("Failed to verify");
    } finally {
      setVerifying("");
    }
  };

  const unverified = experiences.filter((e) => !e.isVerified);
  const verified   = experiences.filter((e) => e.isVerified);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">
        <div className="mb-6">
          <h1 className="section-title mb-1">Verify Data ✅</h1>
          <p className="text-sm text-gray-500">Review and verify interview experiences submitted by students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card bg-yellow-50 border-yellow-100 text-center">
            <p className="text-3xl font-bold text-yellow-600">{unverified.length}</p>
            <p className="text-sm text-yellow-700 font-medium mt-1">Pending Verification</p>
          </div>
          <div className="card bg-green-50 border-green-100 text-center">
            <p className="text-3xl font-bold text-green-600">{verified.length}</p>
            <p className="text-sm text-green-700 font-medium mt-1">Verified Experiences</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader size="lg" /></div>
        ) : (
          <>
            {/* Pending */}
            {unverified.length > 0 && (
              <div className="mb-8">
                <h2 className="font-bold text-gray-800 mb-4">
                  ⏳ Pending ({unverified.length})
                </h2>
                <div className="space-y-3">
                  {unverified.map((exp) => (
                    <div key={exp._id} className="card border-yellow-200 bg-yellow-50/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-gray-800">{exp.company?.name}</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="text-gray-600 text-sm">{exp.role}</span>
                            <span className={`badge text-xs ${
                              exp.outcome === "Selected" ? "badge-green" :
                              exp.outcome === "Rejected" ? "badge-red" : "badge-gray"
                            }`}>{exp.outcome}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            By {exp.isAnonymous ? "Anonymous" : exp.author?.name} · {timeAgo(exp.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{exp.summary}</p>
                        </div>
                        <button
                          onClick={() => handleVerify(exp._id)}
                          disabled={verifying === exp._id}
                          className="btn-primary text-xs px-4 py-2 flex-shrink-0"
                        >
                          {verifying === exp._id ? "Verifying..." : "✅ Verify"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified */}
            {verified.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-800 mb-4">✅ Verified ({verified.length})</h2>
                <div className="space-y-2">
                  {verified.map((exp) => (
                    <div key={exp._id} className="card py-3 px-4 flex items-center gap-3">
                      <span className="text-green-500 text-lg">✅</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800">{exp.company?.name}</span>
                        <span className="text-gray-400 text-xs mx-2">·</span>
                        <span className="text-sm text-gray-600">{exp.role}</span>
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(exp.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experiences.length === 0 && (
              <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm">No experiences to review</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VerifyData;