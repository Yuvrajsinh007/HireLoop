import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { getDrive } from "../../services/driveService";
import { addApplication } from "../../services/memberService";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";
import { DRIVE_TYPES } from "../../utils/constants";
import toast from "react-hot-toast";

const ROUND_ICONS = {
  "Aptitude Test": "🧮",
  "Coding Test": "💻",
  "Group Discussion": "🗣️",
  "Technical Interview": "⚙️",
  "HR Interview": "🤝",
  "Management Round": "👔",
  Other: "📋",
};

const DriveDetail = () => {
  const { id } = useParams();
  const { user, isCurrentStudent } = useAuth();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await getDrive(id);
        setDrive(res.data.data);

        if (res.data.data?.roles?.length > 0) {
          setSelectedRole(res.data.data.roles[0].title);
        }
      } catch {
        toast.error("Drive not found");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  const handleApply = async () => {
    if (!selectedRole) {
      return toast.error("Please select a role");
    }

    try {
      setApplying(true);

      await addApplication({
        companyId: drive.company._id,
        role: selectedRole,
      });

      toast.success("Added to your Journey Tracker! 🎉");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to apply"
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="page-wrapper text-center py-20 text-gray-400">
        Drive not found
      </div>
    );
  }

  const STATUS_COLOR = {
    UPCOMING: "badge-indigo",
    ACTIVE: "badge-green",
    COMPLETED: "badge-gray",
    CANCELLED: "badge-red",
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link
          to="/drives"
          className="hover:text-indigo-600"
        >
          Drives
        </Link>

        <span>/</span>

        <span className="text-gray-700 font-medium truncate">
          {drive.title}
        </span>
      </div>

      {/* Hero */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {drive.company?.logo ? (
              <img
                src={drive.company.logo}
                alt={drive.company.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
                {drive.company?.name?.[0]}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {drive.company?.name}
              </h1>

              <p className="text-gray-400 text-sm">
                {drive.title}
              </p>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={`badge text-xs ${
                    STATUS_COLOR[drive.status] ||
                    "badge-gray"
                  }`}
                >
                  {drive.status}
                </span>

                <span className="badge badge-gray text-xs">
                  {
                    DRIVE_TYPES.find(
                      (t) =>
                        t.value === drive.driveType
                    )?.label
                  }
                </span>
              </div>
            </div>
          </div>

          {isCurrentStudent &&
            drive.status !== "COMPLETED" &&
            drive.status !== "CANCELLED" && (
              <div className="flex flex-col gap-2">
                {drive.roles?.length > 1 && (
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(
                        e.target.value
                      )
                    }
                    className="input-field text-sm"
                  >
                    {drive.roles.map((role) => (
                      <option
                        key={role.title}
                        value={role.title}
                      >
                        {role.title}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary"
                >
                  {applying
                    ? "Adding..."
                    : "📋 Track Application"}
                </button>
              </div>
            )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {[
            {
              label: "Drive Date",
              value: drive.driveDate
                ? formatDate(drive.driveDate)
                : "TBA",
            },
            {
              label: "Deadline",
              value: drive.applicationDeadline
                ? formatDate(
                    drive.applicationDeadline
                  )
                : "TBA",
            },
            {
              label: "Min CGPA",
              value:
                drive.minCGPA > 0
                  ? `${drive.minCGPA}+`
                  : "No criteria",
            },
            {
              label: "Max Backlogs",
              value:
                drive.maxBacklogs > 0
                  ? drive.maxBacklogs
                  : "0 allowed",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-gray-50 rounded-xl"
            >
              <p className="text-xs text-gray-400 mb-1">
                {item.label}
              </p>

              <p className="font-semibold text-gray-800 text-sm">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roles */}
          {drive.roles?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4">
                Job Roles ({drive.roles.length})
              </h2>

              <div className="space-y-3">
                {drive.roles.map((role, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {role.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {role.employmentType}
                        </p>
                      </div>

                      {role.ctcTotal && (
                        <span className="badge badge-green font-bold">
                          {role.ctcTotal} LPA
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {role.location && (
                        <span>
                          📍 {role.location}
                        </span>
                      )}

                      {role.openings && (
                        <span>
                          👥 {role.openings} openings
                        </span>
                      )}

                      {role.bond && (
                        <span>
                          📋 Bond: {role.bond}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rounds */}
          {drive.rounds?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-800 mb-4">
                Interview Rounds ({drive.rounds.length})
              </h2>

              <div className="space-y-3">
                {drive.rounds.map(
                  (round, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {ROUND_ICONS[
                            round.name
                          ] || "📋"}{" "}
                          {round.name}
                        </p>

                        {round.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {round.description}
                          </p>
                        )}

                        {round.duration && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            ⏱ {round.duration}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skills */}
          {drive.skillsRequired?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">
                Required Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {drive.skillsRequired.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="badge badge-indigo text-xs px-3 py-1"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Programs */}
          {drive.eligiblePrograms?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">
                Eligible Programs
              </h3>

              <div className="space-y-1">
                {drive.eligiblePrograms.map(
                  (program) => (
                    <div
                      key={program._id}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="text-green-500">
                        ✓
                      </span>

                      {program.name} (
                      {program.code})
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {drive.description && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">
                About this Drive
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {drive.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetail;