import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { getDrives } from "../../services/driveService";
import {
  DRIVE_STATUS,
  DRIVE_TYPES,
} from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const DriveList = () => {
  const { isCurrentStudent } = useAuth();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await getDrives({
          status,
          page,
          limit: 12,
        });

        setDrives(res.data.data?.drives || []);
        setTotal(res.data.data?.total || 0);
      } catch {
        toast.error("Failed to load drives");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [status, page]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const STATUS_COLOR = {
    UPCOMING: "badge-indigo",
    ACTIVE: "badge-green",
    COMPLETED: "badge-gray",
    CANCELLED: "badge-red",
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title mb-1">
            Placement Drives 🚀
          </h1>

          <p className="text-sm text-gray-500">
            {isCurrentStudent
              ? "Browse drives you are eligible for"
              : "All placement drives"}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[{ label: "All", value: "" }, ...DRIVE_STATUS].map(
          (item) => (
            <button
              key={item.value}
              onClick={() => setStatus(item.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === item.value
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </button>
          )
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader
            size="lg"
            text="Loading drives..."
          />
        </div>
      ) : drives.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🚀</div>

          <p className="text-lg font-medium text-gray-500">
            No drives found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => (
            <Link
              key={drive._id}
              to={`/drives/${drive._id}`}
            >
              <div className="card-hover h-full">
                {/* Company */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {drive.company?.logo ? (
                      <img
                        src={drive.company.logo}
                        alt={drive.company.name}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                        {drive.company?.name?.[0] || "?"}
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {drive.company?.name}
                      </h3>

                      <p className="text-xs text-gray-400">
                        {drive.company?.industry}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`badge text-xs ${
                      STATUS_COLOR[drive.status] ||
                      "badge-gray"
                    }`}
                  >
                    {drive.status}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {drive.title}
                </p>

                {/* Roles */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {drive.roles
                    ?.slice(0, 2)
                    .map((role, index) => (
                      <span
                        key={index}
                        className="badge badge-indigo text-xs"
                      >
                        {role.title}
                      </span>
                    ))}

                  {drive.roles?.length > 2 && (
                    <span className="badge badge-gray text-xs">
                      +{drive.roles.length - 2}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>
                    {DRIVE_TYPES.find(
                      (type) =>
                        type.value === drive.driveType
                    )?.label || drive.driveType}
                  </span>

                  {drive.driveDate && (
                    <span className="text-indigo-600 font-medium">
                      📅 {formatDate(drive.driveDate)}
                    </span>
                  )}
                </div>

                {drive.minCGPA > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Min CGPA: {drive.minCGPA}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() =>
              setPage((prev) => Math.max(1, prev - 1))
            }
            disabled={page === 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 12)}
          </span>

          <button
            onClick={() =>
              setPage((prev) => prev + 1)
            }
            disabled={
              page >= Math.ceil(total / 12)
            }
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DriveList;