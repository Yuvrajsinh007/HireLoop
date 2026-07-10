import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import ExperienceCard from "../../components/experience/ExperienceCard";
import Loader from "../../components/common/Loader";
import { getSavedExperiences } from "../../services/studentService";
import toast from "react-hot-toast";

const SavedExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getSavedExperiences();
        setExperiences(res.data.data || []);
      } catch {
        toast.error("Failed to load saved experiences");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">
        <div className="mb-6">
          <h1 className="section-title mb-1">Saved Experiences 🔖</h1>
          <p className="text-sm text-gray-500">Experiences you've bookmarked for later reference</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size="lg" text="Loading saved experiences..." />
          </div>
        ) : experiences.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔖</div>
            <p className="text-lg font-medium text-gray-500">No saved experiences yet</p>
            <p className="text-sm mt-1">Browse experiences and save the ones that help you</p>
            <Link to="/experiences" className="btn-primary mt-5">
              Browse Experiences →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{experiences.length} saved</p>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedExperiences;