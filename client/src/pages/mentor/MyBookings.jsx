import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import { getMyBookings, cancelBooking, submitFeedback } from "../../services/mentorService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { CalendarDays, Clock, Video, MessageSquare, Star, MessageCircle } from "lucide-react";

const STATUS_COLORS = {
  confirmed:  "bg-brand-50 text-brand-700 border-brand-100",
  completed:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled:  "bg-red-50 text-red-700 border-red-100",
  no_show:    "bg-gray-50 text-gray-600 border-gray-200",
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
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId, { reason: "Cancelled by mentee" });
      setBookings((p) => p.map((b) => b._id === bookingId ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled successfully");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await submitFeedback(feedbackId, { feedback: feedbackText, rating });
      setBookings((p) => p.map((b) => b._id === feedbackId ? { ...b, status: "completed", menteeFeedback: feedbackText } : b));
      setFeedbackId(null);
      setFeedbackText("");
      toast.success("Feedback submitted successfully!");
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1.5 flex items-center gap-2">
            My Bookings <CalendarDays className="w-6 h-6 text-brand-600" />
          </h1>
          <p className="text-sm font-medium text-gray-500">Your upcoming and past mentorship sessions</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-8 w-full md:w-fit overflow-x-auto">
          {["all","confirmed","completed","cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap
                ${filter === f ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900 border border-transparent"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-gray-400 shadow-sm">
            <CalendarDays className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-900 mb-1">No bookings yet</p>
            <p className="text-sm font-medium">Browse mentors and book your first session!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  {/* Mentor info */}
                  <div className="flex items-center gap-4">
                    <Avatar src={booking.mentor?.avatar} name={booking.mentor?.name} size="md" />
                    <div>
                      <p className="font-bold text-gray-900 text-lg leading-tight">{booking.mentor?.name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{booking.mentor?.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border shadow-sm w-fit ${STATUS_COLORS[booking.status] || "bg-gray-50"}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Slot details */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: "Topic",    value: booking.slot?.topic, icon: MessageCircle },
                    { label: "Date",     value: formatDate(booking.slot?.date), icon: CalendarDays },
                    { label: "Time",     value: `${booking.slot?.startTime} – ${booking.slot?.endTime}`, icon: Clock },
                    { label: "Duration", value: `${booking.slot?.duration} min`, icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      </div>
                      <p className="font-semibold text-gray-800">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {booking.menteeNote && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-gray-500 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="font-medium italic">"{booking.menteeNote}"</p>
                  </div>
                )}

                {/* Actions & Links */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {booking.slot?.meetLink && booking.status === "confirmed" && (
                    <a href={booking.slot.meetLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-brand-100 transition-colors">
                      <Video className="w-4 h-4" /> Join Meeting
                    </a>
                  )}
                  
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === "confirmed" && !booking.menteeFeedback && (
                    <button
                      onClick={() => setFeedbackId(booking._id)}
                      className="text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4" /> Leave Feedback
                    </button>
                  )}
                </div>

                {/* Feedback Display */}
                {booking.menteeFeedback && (
                  <div className="mt-5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Your Feedback</p>
                    <p className="text-sm font-medium text-emerald-800">{booking.menteeFeedback}</p>
                  </div>
                )}

                {/* Inline Feedback Form */}
                {feedbackId === booking._id && (
                  <div className="mt-5 p-5 bg-amber-50 border border-amber-100 rounded-xl space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm font-bold text-amber-900">Rate your session</p>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setRating(s)}
                          className="transition-transform hover:scale-110 focus:outline-none">
                          <Star className={`w-8 h-8 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-white text-gray-300 stroke-[1.5]"}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3} 
                      className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none"
                      placeholder="How was the session? What did you learn?" />
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setFeedbackId(null)} className="flex-1 bg-white border border-amber-200 text-amber-800 font-bold py-2 rounded-lg hover:bg-amber-100 transition-colors">Cancel</button>
                      <button onClick={handleFeedbackSubmit} className="flex-[2] bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm">Submit Feedback</button>
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