import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import MentorCard from "../../components/mentor/MentorCard";
import BookingModal from "../../components/mentor/BookingModal";
import SlotPicker from "../../components/mentor/SlotPicker";
import Loader from "../../components/common/Loader";
import { getMentors, getMySlots, deleteSlot } from "../../services/mentorService";
import { useAuth } from '../../hooks/useAuth';
import { MENTOR_TOPICS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const MentorList = () => {
  const { user }  = useAuth();
  const isSenior  = ["senior","admin"].includes(user?.role);

  const [mentors, setMentors]         = useState([]);
  const [mySlots, setMySlots]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [topicFilter, setTopicFilter] = useState("");
  const [view, setView]               = useState("browse"); // browse | my-slots

  useEffect(() => { fetchData(); }, [topicFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (topicFilter) params.topic = topicFilter;
      const [mentorsRes, slotsRes] = await Promise.allSettled([
        getMentors(params),
        isSenior ? getMySlots() : Promise.resolve(null),
      ]);
      if (mentorsRes.status === "fulfilled") setMentors(mentorsRes.value.data.data || []);
      if (slotsRes.status  === "fulfilled" && slotsRes.value) setMySlots(slotsRes.value.data.data || []);
    } catch {
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (slot, mentor) => {
    setBookingSlot(slot);
    setBookingMentor(mentor);
  };

  const handleBooked = () => fetchData();

  const handleSlotCreated = (slot) => {
    setMySlots((p) => [slot, ...p]);
    setShowCreateSlot(false);
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await deleteSlot(slotId);
      setMySlots((p) => p.filter((s) => s._id !== slotId));
      toast.success("Slot deleted");
    } catch {
      toast.error("Failed to delete slot");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-1">Mentor Connect 🤝</h1>
            <p className="text-sm text-gray-500">
              Book mock interviews and guidance sessions with placed seniors
            </p>
          </div>
          {isSenior && (
            <button
              onClick={() => setShowCreateSlot((p) => !p)}
              className={showCreateSlot ? "btn-secondary" : "btn-primary"}
            >
              {showCreateSlot ? "✕ Cancel" : "+ Offer a Session"}
            </button>
          )}
        </div>

        {/* Create Slot Form */}
        {showCreateSlot && (
          <div className="mb-8">
            <SlotPicker
              onCreated={handleSlotCreated}
              onCancel={() => setShowCreateSlot(false)}
            />
          </div>
        )}

        {/* Tabs (for seniors) */}
        {isSenior && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
            {["browse","my-slots"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${view === v ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {v === "browse" ? "Browse Mentors" : `My Slots (${mySlots.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Topic Filter */}
        {view === "browse" && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setTopicFilter("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${!topicFilter ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
            >
              All Topics
            </button>
            {MENTOR_TOPICS.map((t) => (
              <button key={t} onClick={() => setTopicFilter(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                  ${topicFilter === t ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size="lg" text="Loading mentors..." />
          </div>
        ) : view === "browse" ? (
          mentors.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🤝</div>
              <p className="text-lg font-medium text-gray-500">No mentors available right now</p>
              <p className="text-sm mt-1">Check back later or change the topic filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map(({ mentor, slots }) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  slots={slots}
                  onBook={(slot) => handleBook(slot, mentor)}
                />
              ))}
            </div>
          )
        ) : (
          /* My Slots view */
          <div className="space-y-3">
            {mySlots.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm">No slots created yet</p>
                <button onClick={() => setShowCreateSlot(true)} className="btn-primary mt-4 text-sm">
                  Create Your First Slot
                </button>
              </div>
            ) : (
              mySlots.map((slot) => (
                <div key={slot._id} className="card flex items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{slot.topic}</span>
                      <span className={`badge text-xs ${
                        slot.status === "available" ? "badge-green" :
                        slot.status === "booked"    ? "badge-indigo" : "badge-gray"
                      }`}>{slot.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(slot.date)} · {slot.startTime}–{slot.endTime} · {slot.duration}min
                    </p>
                    {slot.bookedBy && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Booked by: {slot.bookedBy?.name}
                      </p>
                    )}
                  </div>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <BookingModal
          slot={bookingSlot}
          mentor={bookingMentor}
          onClose={() => { setBookingSlot(null); setBookingMentor(null); }}
          onBooked={handleBooked}
        />
      )}
    </DashboardLayout>
  );
};

export default MentorList;