import { useState } from "react";
import toast from "react-hot-toast";
import { APPLICATION_STAGES, STAGE_COLORS } from "../../utils/constants";
import { updateAppStage } from "../../services/studentService";

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
      toast.success(`Stage updated to "${stage}" ✅`);
      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update stage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Update Stage</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {application.company?.name} — {application.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Stage selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Stage
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {APPLICATION_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${stage === s
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Current → New preview */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className={`badge ${STAGE_COLORS[application.currentStage] || "badge-gray"}`}>
              {application.currentStage}
            </span>
            <span className="text-gray-400 text-sm">→</span>
            <span className={`badge ${STAGE_COLORS[stage] || "badge-gray"}`}>
              {stage}
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="e.g. Cleared aptitude test, Technical round scheduled..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Stage"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageUpdateModal;