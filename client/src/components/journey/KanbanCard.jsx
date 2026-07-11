import { useState, useRef, useEffect } from "react";
import { STAGE_COLORS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import StageUpdateModal from "./StageUpdateModal";
import toast from "react-hot-toast";
import { deleteApplication } from "../../services/studentService";
import { MoreVertical, Pencil, Trash2, Lock, ArrowRight, Building2, History } from "lucide-react";

const KanbanCard = ({ application, onUpdated, onDeleted }) => {
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const company = application.company;
  const initial = company?.name?.[0]?.toUpperCase() || "?";

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm flex-shrink-0">
                {company?.name ? initial : <Building2 className="w-5 h-5 stroke-[1.5]" />}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{company?.name || "Unknown Company"}</p>
              <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{application.role}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { setShowStageModal(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-4 h-4" /> Update Stage
                </button>
                <button
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  disabled={deleting}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stage Badge & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`badge text-[10px] uppercase tracking-wider font-bold shadow-sm ${STAGE_COLORS[application.currentStage] || "badge-gray"}`}>
            {application.currentStage}
          </span>
          {application.ctcOffered && (
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase font-bold tracking-wider">
              {application.ctcOffered} LPA
            </span>
          )}
          {application.isPrivate && (
            <span className="text-gray-400 bg-gray-50 p-1 rounded-md border border-gray-100" title="Private Application">
              <Lock className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Notes */}
        {application.notes && (
          <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
            {application.notes}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs font-medium text-gray-400">
            Applied {formatDate(application.applyDate)}
          </span>
          <button
            onClick={() => setShowStageModal(true)}
            className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1 group/btn"
          >
            Update <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Stage history count */}
        {application.stageHistory?.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5">
            <History className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {application.stageHistory.length} stage updates
            </p>
          </div>
        )}
      </div>

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