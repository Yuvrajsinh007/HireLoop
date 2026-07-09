import { useState } from "react";
import { STAGE_COLORS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import StageUpdateModal from "./StageUpdateModal";
import toast from "react-hot-toast";
import { deleteApplication } from "../../services/studentService";

const KanbanCard = ({ application, onUpdated, onDeleted }) => {
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const company = application.company;
  const initial = company?.name?.[0]?.toUpperCase() || "?";

  const handleDelete = async () => {
    if (!window.confirm(`Remove application for ${company?.name}?`)) return;
    try {
      setDeleting(true);
      await deleteApplication(application._id);
      toast.success("Application removed");
      onDeleted(application._id);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow group">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-9 h-9 rounded-lg object-cover border border-gray-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm flex-shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{company?.name}</p>
              <p className="text-xs text-gray-500 truncate">{application.role}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden">
                <button
                  onClick={() => { setShowStageModal(true); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  ✏️ Update Stage
                </button>
                <button
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  disabled={deleting}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  🗑️ {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stage Badge */}
        <div className="mb-3">
          <span className={`badge text-xs ${STAGE_COLORS[application.currentStage] || "badge-gray"}`}>
            {application.currentStage}
          </span>
          {application.ctcOffered && (
            <span className="badge badge-green text-xs ml-1">
              {application.ctcOffered} LPA
            </span>
          )}
          {application.isPrivate && (
            <span className="badge badge-gray text-xs ml-1">🔒</span>
          )}
        </div>

        {/* Notes */}
        {application.notes && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{application.notes}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Applied {formatDate(application.applyDate)}
          </span>
          <button
            onClick={() => setShowStageModal(true)}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Update →
          </button>
        </div>

        {/* Stage history count */}
        {application.stageHistory?.length > 1 && (
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              {application.stageHistory.length} stage updates
            </p>
          </div>
        )}
      </div>

      {/* Stage Update Modal */}
      {showStageModal && (
        <StageUpdateModal
          application={application}
          onClose={() => setShowStageModal(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
};

export default KanbanCard;