import { useState } from "react";
import Avatar from "../common/Avatar";
import { bookSlot } from "../../services/mentorService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const BookingModal = ({ slot, mentor, onClose, onBooked }) => {
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    try {
      setLoading(true);
      const res = await bookSlot(slot._id, { menteeNote: note });
      toast.success("Slot booked! Check your bookings. 🎉");
      onBooked(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to book slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mentor info */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
            <Avatar src={mentor?.avatar} name={mentor?.name} size="md" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{mentor?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{mentor?.role}</p>
            </div>
          </div>

          {/* Slot details */}
          <div className="space-y-2 text-sm">
            {[
              { label: "Topic",    value: slot.topic },
              { label: "Date",     value: formatDate(slot.date) },
              { label: "Time",     value: `${slot.startTime} – ${slot.endTime}` },
              { label: "Duration", value: `${slot.duration} minutes` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>

          {slot.description && (
            <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">{slot.description}</p>
          )}

          {/* Note to mentor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note to Mentor (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input-field resize-none text-sm"
              placeholder="What do you want to focus on? Any specific questions?"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleBook} disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking...
                </span>
              ) : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;