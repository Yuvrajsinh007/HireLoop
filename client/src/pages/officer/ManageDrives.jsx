import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Rocket, Plus, Search, Calendar, MapPin, 
  Briefcase, Users, X, Loader2, ChevronRight, 
  ChevronLeft, CheckCircle, Bell, Edit2, Trash2
} from "lucide-react";

// Using your exact service imports
import api from "../../services/api"; 
import { getDrives, createDrive, updateDrive, sendDriveAlert } from "../../services/driveService";
import { getPrograms } from "../../services/institutionService";
import { DRIVE_TYPES, ROUND_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";

//  STRICT TABS: Removed DRAFT entirely
const STATUS_TABS = ["All", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"];

const ManageDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  useEffect(() => {
    fetchDrivesData();
  }, []);

  const fetchDrivesData = async () => {
    try {
      setLoading(true);
      const res = await getDrives({ limit: 50 });
      setDrives(res.data.data?.drives || []);
    } catch (err) {
      toast.error("Failed to load placement drives");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async (driveId) => {
    if (!window.confirm("Are you sure you want to send an email alert to all eligible students?")) return;
    try {
      const toastId = toast.loading("Calculating eligibility and sending emails...");
      const res = await sendDriveAlert(driveId);
      toast.success(`Alert sent to ${res.data.data.sent} students! `, { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send alerts");
    }
  };

  //  QUICK DELETE HANDLER
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the "${title}" drive?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/drives/${id}`);
      toast.success("Drive deleted successfully");
      
      // Remove from UI instantly without refreshing
      setDrives(prev => prev.filter(drive => drive._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete drive");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingDrive(null);
    setIsModalOpen(true);
  };

  const openEditModal = (drive) => {
    setEditingDrive(drive);
    setIsModalOpen(true);
  };

  // Filter drives
  const filteredDrives = drives.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                          d.company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "UPCOMING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED": return "bg-purple-100 text-purple-800 border-purple-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
              <Rocket className="mr-3 h-6 w-6 text-indigo-600" />
              Placement Drives
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage campus recruitment events and track applications.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Drive
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 lg:pb-0 hide-scrollbar gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab === "All" ? "All Drives" : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drives or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Drive Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader text="Loading drives..." />
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Rocket className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No drives found</h3>
            <p className="mt-1 text-sm text-slate-500">Create a new placement drive to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDrives.map((drive) => (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  <div className="p-5 flex-1">
                    {/* Top Row: Logo & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {drive.company?.logo ? (
                            <img src={drive.company.logo} alt={drive.company.name} className="h-full w-full object-contain p-1" />
                          ) : (
                            <Briefcase className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{drive.company?.name}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-1 ${getStatusColor(drive.status)}`}>
                            {drive.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons: Edit and Delete */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(drive)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Drive">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(drive._id, drive.title)}
                          disabled={deletingId === drive._id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" 
                          title="Delete Drive"
                        >
                          {deletingId === drive._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2" title={drive.title}>
                      {drive.title}
                    </h3>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                        <span className="font-medium">Date:</span> 
                        <span className="ml-1">{drive.driveDate ? formatDate(drive.driveDate) : "TBA"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Briefcase className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                        <span className="font-medium">Roles:</span> 
                        <span className="ml-1 truncate">{drive.roles?.map(r => r.title).join(", ") || "Not specified"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                        <span className="font-medium">Eligibility:</span> 
                        <span className="ml-1">{drive.minCGPA}+ CGPA, Max {drive.maxBacklogs} Backlogs</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 p-4 flex gap-2">
                    <Link
                      to={`/drives/${drive._id}/applications`}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg text-center hover:bg-slate-50 transition-colors"
                    >
                      View Applications
                    </Link>
                    {(drive.status === "ACTIVE" || drive.status === "UPCOMING") && (
                      <button
                        onClick={() => handleSendAlert(drive._id)}
                        title="Send Alert Email"
                        className="bg-indigo-100 text-indigo-700 border border-indigo-200 p-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center shrink-0"
                      >
                        <Bell className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <DriveWizardModal 
            drive={editingDrive}
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchDrivesData();
            }} 
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── MULTI-STEP CREATION WIZARD ──────────────────────────────────────────── */
const DriveWizardModal = ({ drive, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    company: drive?.company?._id || "",
    title: drive?.title || "",
    driveType: drive?.driveType || "ON_CAMPUS",
    academicYear: drive?.academicYear || new Date().getFullYear() + "-" + (new Date().getFullYear() + 1).toString().slice(2),
    driveDate: drive?.driveDate ? new Date(drive.driveDate).toISOString().split("T")[0] : "",
    applicationDeadline: drive?.applicationDeadline ? new Date(drive.applicationDeadline).toISOString().split("T")[0] : "",
    description: drive?.description || "",
    
    // Eligibility
    eligiblePrograms: drive?.eligiblePrograms?.map(p => p._id || p) || [],
    minCGPA: drive?.minCGPA || 0,
    maxBacklogs: drive?.maxBacklogs || 0,
    graduationYears: drive?.graduationYears?.join(", ") || "", 
    
    // Arrays
    roles: drive?.roles?.length ? drive.roles : [{ title: "", employmentType: "Full-Time", ctcTotal: "" }],
    rounds: drive?.rounds?.length ? drive.rounds : [{ name: "Aptitude Test", order: 1 }],
    skillsRequired: drive?.skillsRequired || []
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [compRes, progRes] = await Promise.all([
          api.get("/companies?limit=100"), // Get directory
          getPrograms() // Get college programs
        ]);
        setCompanies(compRes.data.data.companies || []);
        setPrograms(progRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load form dependencies");
      }
    };
    fetchDependencies();
  }, []);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Dynamic Array Handlers
  const handleRoleChange = (index, field, value) => {
    const newRoles = [...formData.roles];
    newRoles[index][field] = value;
    setFormData({ ...formData, roles: newRoles });
  };
  const addRole = () => setFormData({ ...formData, roles: [...formData.roles, { title: "", employmentType: "Full-Time", ctcTotal: "" }] });
  const removeRole = (idx) => setFormData({ ...formData, roles: formData.roles.filter((_, i) => i !== idx) });

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...formData.rounds];
    newRounds[index][field] = value;
    setFormData({ ...formData, rounds: newRounds });
  };
  const addRound = () => setFormData({ ...formData, rounds: [...formData.rounds, { name: ROUND_TYPES[0] || "Aptitude Test", duration: "60 mins" }] });
  const removeRound = (idx) => setFormData({ ...formData, rounds: formData.rounds.filter((_, i) => i !== idx) });

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setFormData(prev => ({ ...prev, skillsRequired: [...new Set([...prev.skillsRequired, skillInput.trim()])] }));
    setSkillInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    try {
      setLoading(true);
      // Clean up string payload before sending to API
      const payload = {
        ...formData,
        graduationYears: formData.graduationYears.toString().split(",").map(y => parseInt(y.trim())).filter(y => !isNaN(y)),
      };

      if (drive) {
        await updateDrive(drive._id, payload);
        toast.success("Drive Updated Successfully!");
      } else {
        await createDrive(payload);
        toast.success("Placement Drive Created! 🎉");
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] z-10 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{drive ? "Edit Placement Drive" : "Create Placement Drive"}</h3>
            <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wider">
              Step {step} of 4: {["Basic Details", "Job Roles", "Eligibility Rules", "Interview Rounds"][step - 1]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="wizard-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Company *</label>
                    <select required name="company" value={formData.company} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">-- Choose from Directory --</option>
                      {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Drive Title *</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. TCS Ninja Off-Campus 2025" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Drive Type</label>
                    <select name="driveType" value={formData.driveType} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      {DRIVE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Academic Year</label>
                    <input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} placeholder="2024-25" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Drive Date</label>
                    <input type="date" name="driveDate" value={formData.driveDate} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Application Deadline</label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: JOB ROLES */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {formData.roles.map((role, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    {formData.roles.length > 1 && (
                      <button type="button" onClick={() => removeRole(idx)} className="absolute top-3 right-3 text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Role Title *</label>
                        <input required type="text" value={role.title} onChange={(e) => handleRoleChange(idx, "title", e.target.value)} placeholder="e.g. Software Engineer" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                        <select value={role.employmentType} onChange={(e) => handleRoleChange(idx, "employmentType", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500">
                          <option value="Full-Time">Full-Time</option>
                          <option value="Intern">Internship</option>
                          <option value="PPO">Internship + PPO</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Total CTC (LPA) / Stipend</label>
                        <input type="number" step="0.1" value={role.ctcTotal} onChange={(e) => handleRoleChange(idx, "ctcTotal", e.target.value)} placeholder="e.g. 7.5" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addRole} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Add Another Role
                </button>
              </motion.div>
            )}

            {/* STEP 3: ELIGIBILITY */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                  <p className="text-sm text-amber-800 font-medium">
                    <strong>Note:</strong> The system automatically hides this drive from students who do not meet these mathematical criteria.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Minimum CGPA</label>
                    <input type="number" step="0.1" name="minCGPA" value={formData.minCGPA} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Active Backlogs</label>
                    <input type="number" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Graduation Years</label>
                    <input type="text" name="graduationYears" value={formData.graduationYears} onChange={handleInputChange} placeholder="e.g. 2024, 2025" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <p className="text-xs text-slate-500 mt-1">Comma separated. Leave empty to allow all.</p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Eligible Programs</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
                      {programs.length === 0 ? <p className="text-xs text-slate-500">No programs configured by admin.</p> : programs.map(p => (
                        <label key={p._id} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={formData.eligiblePrograms.includes(p._id)}
                            onChange={(e) => {
                              const newArr = e.target.checked 
                                ? [...formData.eligiblePrograms, p._id] 
                                : formData.eligiblePrograms.filter(id => id !== p._id);
                              setFormData({...formData, eligiblePrograms: newArr});
                            }}
                          />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: ROUNDS & SKILLS */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                {/* Required Skills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Required Skills</label>
                  <div className="flex gap-2 mb-3">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="Type skill and press Enter" />
                    <button type="button" onClick={addSkill} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.map((skill) => (
                      <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
                        {skill} <button type="button" onClick={() => setFormData(p => ({ ...p, skillsRequired: p.skillsRequired.filter(s => s !== skill)}))} className="ml-1.5 text-indigo-400 hover:text-indigo-600"><X className="w-3 h-3"/></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interview Rounds */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Interview Rounds</label>
                  <div className="space-y-3">
                    {formData.rounds.map((round, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold shrink-0">{idx + 1}</div>
                        <select value={round.name} onChange={(e) => handleRoundChange(idx, "name", e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-indigo-500">
                          {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input value={round.duration || ""} onChange={(e) => handleRoundChange(idx, "duration", e.target.value)} placeholder="e.g. 60 mins" className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
                        {formData.rounds.length > 1 && (
                          <button type="button" onClick={() => removeRound(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4"/></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addRound} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2">
                      <Plus className="w-4 h-4 mr-1" /> Add Round
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Drive Description (Optional)</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Additional details..." />
                </div>
              </motion.div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button type="button" onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center">
            {step > 1 ? <><ChevronLeft className="w-4 h-4 mr-1"/> Back</> : "Cancel"}
          </button>
          <button type="submit" form="wizard-form" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {step < 4 ? <>Next <ChevronRight className="w-4 h-4 ml-1"/></> : <><CheckCircle className="w-4 h-4 mr-2"/> {drive ? "Save Changes" : "Publish Drive"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageDrives;