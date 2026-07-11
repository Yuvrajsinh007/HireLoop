import { useState } from "react";
import { createSlot } from "../../services/mentorService";
import { MENTOR_TOPICS } from "../../utils/constants";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const SlotPicker = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState({
    date: "", startTime: "", endTime: "",
    duration: 30, topic: "Mock Interview",
    description: "", meetLink: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime)
      return toast.error("Please fill date and time fields");
    try {
      setLoading(true);
      const res = await createSlot(form);
      toast.success("Slot created successfully!");
      onCreated(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
      <h3 className="text-lg font-bold text-gray-900 mb-6">Create Mentorship Slot</h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time *</label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Time *</label>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
            <select name="topic" value={form.topic} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-700">
              {MENTOR_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
            <select name="duration" value={form.duration} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-gray-700">
              {[15,20,30,45,60].map((d) => <option key={d} value={d}>{d} mins</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meet Link <span className="font-normal normal-case">(optional)</span></label>
          <input type="url" name="meetLink" value={form.meetLink} onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" placeholder="https://meet.google.com/..." />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description <span className="font-normal normal-case">(optional)</span></label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium resize-none"
            placeholder="What will you cover in this session?" />
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          )}
          <button type="submit" disabled={loading} className="flex-[2] bg-brand-600 text-white font-bold py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : "Create Slot"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotPicker;