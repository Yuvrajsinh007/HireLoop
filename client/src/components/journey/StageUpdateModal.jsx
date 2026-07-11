import { useState } from "react";
import toast from "react-hot-toast";
import { APPLICATION_STAGES, STAGE_COLORS } from "../../utils/constants";
import { updateAppStage } from "../../services/studentService";
import { X, ArrowRight, Loader2 } from "lucide-react";

const StageUpdateModal = ({ application, onClose, onUpdated }) => {
  const [stage, setStage] = useState(application.currentStage);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stage === application.currentStage) {
      return toast.error("Please select a different stage");
    }
    try {
      setLoading(true);
      const res = await updateAppStage(application._id, { stage, note });
      toast.success(`Stage updated to "${stage}"`);
      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update stage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Update Stage</h2>
            <p className="text-xs font-medium text-gray-500 mt-1 truncate max-w-[240px]">
              {application.company?.name} — {application.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Stage selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Stage
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {APPLICATION_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                    ${stage === s
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                      : "border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Current → New preview */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className={`badge ${STAGE_COLORS[application.currentStage] || "badge-gray"} shadow-sm`}>
              {application.currentStage}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className={`badge ${STAGE_COLORS[stage] || "badge-gray"} shadow-sm`}>
              {stage}
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              placeholder="e.g. Cleared aptitude test, Technical round scheduled..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-brand-600 text-white font-medium py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageUpdateModal;