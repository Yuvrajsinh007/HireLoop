import { useState } from "react";
import Avatar from "../common/Avatar";
import { bookSlot } from "../../services/mentorService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { X, CalendarDays, Clock, Timer, Loader2 } from "lucide-react";

const BookingModal = ({ slot, mentor, onClose, onBooked }) => {
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    try {
      setLoading(true);
      const res = await bookSlot(slot._id, { menteeNote: note });
      toast.success("Slot booked! Check your bookings.");
      onBooked(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to book slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mentor info */}
          <div className="flex items-center gap-4 p-4 bg-brand-50 border border-brand-100 rounded-xl">
            <Avatar src={mentor?.avatar} name={mentor?.name} size="md" />
            <div>
              <p className="font-bold text-gray-900">{mentor?.name}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{mentor?.role}</p>
            </div>
          </div>

          {/* Slot details */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Topic</span>
                <span className="text-sm font-bold text-gray-900">{slot.topic}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><CalendarDays className="w-3.5 h-3.5" /> Date</span>
                <span className="text-sm font-semibold text-gray-800">{formatDate(slot.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Clock className="w-3.5 h-3.5" /> Time</span>
                <span className="text-sm font-semibold text-gray-800">{slot.startTime} – {slot.endTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Timer className="w-3.5 h-3.5" /> Duration</span>
                <span className="text-sm font-semibold text-gray-800">{slot.duration} minutes</span>
              </div>
            </div>

            {slot.description && (
              <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mentor's Note</p>
                <p className="text-sm text-gray-600 font-medium italic">{slot.description}</p>
              </div>
            )}
          </div>

          {/* Note to mentor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note to Mentor <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              placeholder="What do you want to focus on? Any specific questions?"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleBook} disabled={loading} className="flex-[2] bg-brand-600 text-white font-bold py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;