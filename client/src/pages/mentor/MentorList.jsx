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
import { Handshake, Plus, X, CalendarDays, Users, Trash2, Clock, MapPin } from "lucide-react";

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
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await deleteSlot(slotId);
      setMySlots((p) => p.filter((s) => s._id !== slotId));
      toast.success("Slot deleted successfully");
    } catch {
      toast.error("Failed to delete slot");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1.5 flex items-center gap-2">
               Mentor Connect <Handshake className="w-6 h-6 text-brand-600" />
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Book mock interviews and guidance sessions with placed seniors
            </p>
          </div>
          {isSenior && (
            <button
              onClick={() => setShowCreateSlot((p) => !p)}
              className={`${showCreateSlot ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"} font-medium text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0`}
            >
              {showCreateSlot ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Offer a Session</>}
            </button>
          )}
        </div>

        {/* Create Slot Form */}
        {showCreateSlot && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <SlotPicker
              onCreated={handleSlotCreated}
              onCancel={() => setShowCreateSlot(false)}
            />
          </div>
        )}

        {/* Tabs (for seniors) */}
        {isSenior && (
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-6 w-fit">
            {["browse","my-slots"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap
                  ${view === v ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900 border border-transparent"}`}>
                {v === "browse" ? "Browse Mentors" : `My Slots (${mySlots.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Topic Filter */}
        {view === "browse" && (
          <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center mr-2">Topics:</span>
            <button
              onClick={() => setTopicFilter("")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                ${!topicFilter ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-sm" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}
            >
              All Topics
            </button>
            {MENTOR_TOPICS.map((t) => (
              <button key={t} onClick={() => setTopicFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                  ${topicFilter === t ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-sm" : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader />
          </div>
        ) : view === "browse" ? (
          mentors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-gray-400 shadow-sm">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold text-gray-900 mb-1">No mentors available right now</p>
              <p className="text-sm font-medium">Check back later or change the topic filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="space-y-4">
            {mySlots.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400 shadow-sm">
                <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-base font-bold text-gray-900 mb-1">No slots created yet</p>
                <button onClick={() => setShowCreateSlot(true)} className="bg-brand-50 text-brand-600 font-bold px-4 py-2 rounded-lg mt-4 hover:bg-brand-100 transition-colors">
                  Create Your First Slot
                </button>
              </div>
            ) : (
              mySlots.map((slot) => (
                <div key={slot._id} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-brand-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-base">{slot.topic}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm border ${
                        slot.status === "available" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        slot.status === "booked"    ? "bg-brand-50 text-brand-700 border-brand-100" : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>{slot.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {formatDate(slot.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {slot.startTime} – {slot.endTime} ({slot.duration}m)</span>
                    </div>
                    {slot.bookedBy && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-lg text-xs font-bold text-brand-700">
                        <span className="w-5 h-5 rounded-full bg-brand-200 flex items-center justify-center text-[10px] text-brand-800">
                          {slot.bookedBy.name[0]}
                        </span>
                        Booked by: {slot.bookedBy.name}
                      </div>
                    )}
                  </div>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
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