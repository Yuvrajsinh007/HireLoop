import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import { getMyBookings, cancelBooking, submitFeedback } from "../../services/mentorService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  confirmed:  "badge-indigo",
  completed:  "badge-green",
  cancelled:  "badge-red",
  no_show:    "badge-gray",
};

const MyBookings = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating]       = useState(5);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getMyBookings();
        setBookings(res.data.data || []);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(bookingId, { reason: "Cancelled by mentee" });
      setBookings((p) => p.map((b) => b._id === bookingId ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await submitFeedback(feedbackId, { feedback: feedbackText, rating });
      setBookings((p) => p.map((b) => b._id === feedbackId ? { ...b, status: "completed", menteeFeedback: feedbackText } : b));
      setFeedbackId(null);
      setFeedbackText("");
      toast.success("Feedback submitted! ⭐");
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">
        <div className="mb-6">
          <h1 className="section-title mb-1">My Bookings 📅</h1>
          <p className="text-sm text-gray-500">Your upcoming and past mentor sessions</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {["all","confirmed","completed","cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                ${filter === f ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size="lg" text="Loading bookings..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-lg font-medium text-gray-500">No bookings yet</p>
            <p className="text-sm mt-1">Browse mentors and book a session!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Mentor info */}
                  <div className="flex items-center gap-3">
                    <Avatar src={booking.mentor?.avatar} name={booking.mentor?.name} size="md" />
                    <div>
                      <p className="font-semibold text-gray-900">{booking.mentor?.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{booking.mentor?.role}</p>
                    </div>
                  </div>

                  <span className={`badge ${STATUS_COLORS[booking.status] || "badge-gray"} capitalize`}>
                    {booking.status}
                  </span>
                </div>

                {/* Slot details */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    { label: "Topic",    value: booking.slot?.topic    },
                    { label: "Date",     value: formatDate(booking.slot?.date) },
                    { label: "Time",     value: `${booking.slot?.startTime} – ${booking.slot?.endTime}` },
                    { label: "Duration", value: `${booking.slot?.duration} min` },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="font-medium text-gray-700">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Meet link */}
                {booking.slot?.meetLink && (
                  <a href={booking.slot.meetLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 text-sm mt-3 hover:underline">
                    🔗 Join Meeting →
                  </a>
                )}

                {/* Note */}
                {booking.menteeNote && (
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Your note: "{booking.menteeNote}"
                  </p>
                )}

                {/* Feedback */}
                {booking.menteeFeedback && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700">Your Feedback</p>
                    <p className="text-xs text-green-600 mt-0.5">{booking.menteeFeedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-sm text-red-500 hover:underline font-medium"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === "confirmed" && !booking.menteeFeedback && (
                    <button
                      onClick={() => setFeedbackId(booking._id)}
                      className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>

                {/* Inline Feedback Form */}
                {feedbackId === booking._id && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-indigo-800">Rate your session</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setRating(s)}
                          className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={2} className="input-field resize-none text-sm"
                      placeholder="How was the session? What did you learn?" />
                    <div className="flex gap-2">
                      <button onClick={() => setFeedbackId(null)} className="btn-secondary text-sm flex-1">Cancel</button>
                      <button onClick={handleFeedbackSubmit} className="btn-primary text-sm flex-1">Submit</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;