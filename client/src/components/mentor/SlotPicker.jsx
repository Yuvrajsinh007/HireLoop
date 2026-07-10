import { useState } from "react";
import { createSlot } from "../../services/mentorService";
import { MENTOR_TOPICS } from "../../utils/constants";
import toast from "react-hot-toast";

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
      toast.success("Slot created! Students can now book it 🎉");
      onCreated(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-lg">
      <h3 className="font-bold text-gray-800 mb-4">Create Mentorship Slot</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
              className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Time *</label>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
              className="input-field text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
            <select name="topic" value={form.topic} onChange={handleChange} className="input-field text-sm">
              {MENTOR_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration (mins)</label>
            <select name="duration" value={form.duration} onChange={handleChange} className="input-field text-sm">
              {[15,20,30,45,60].map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Meet Link (optional)</label>
          <input type="url" name="meetLink" value={form.meetLink} onChange={handleChange}
            className="input-field text-sm" placeholder="https://meet.google.com/..." />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={2} className="input-field resize-none text-sm"
            placeholder="What will you cover in this session?" />
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Creating..." : "Create Slot"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotPicker;