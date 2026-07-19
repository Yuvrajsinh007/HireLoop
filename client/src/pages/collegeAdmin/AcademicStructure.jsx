import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Building2, BookOpen, Plus, Edit2, Trash2, 
  ChevronRight, X, Loader2, Info 
} from "lucide-react";
import api from "../../services/api";

const AcademicStructure = () => {
  const [institution, setInstitution] = useState(null);
  const [units, setUnits] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedUnitId, setSelectedUnitId] = useState("all");

  // Modal States
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [instRes, unitsRes, progRes] = await Promise.all([
        api.get("/institutions/me"),
        api.get("/institutions/academic-units"),
        api.get("/institutions/programs")
      ]);
      
      setInstitution(instRes.data.data);
      setUnits(unitsRes.data.data || []);
      setPrograms(progRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load academic structure");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}? Programs under this unit will be orphaned.`)) return;
    try {
      await api.delete(`/institutions/academic-units/${id}`);
      toast.success(`${name} deactivated successfully`);
      fetchData();
      if (selectedUnitId === id) setSelectedUnitId("all");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to deactivate unit");
    }
  };

  const handleDeleteProgram = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate the program: ${name}?`)) return;
    try {
      await api.delete(`/institutions/programs/${id}`);
      toast.success(`${name} deactivated successfully`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to deactivate program");
    }
  };

  // Filter programs based on selected unit
  const filteredPrograms = selectedUnitId === "all" 
    ? programs 
    : programs.filter(p => p.academicUnit?._id === selectedUnitId);

  const unitLabel = institution?.academicUnitLabel || "Academic Unit";
  const programLabel = institution?.programLabel || "Program";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading academic structure..." />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Academic Structure</h1>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Define and manage your institution's hierarchy of {unitLabel.toLowerCase()}s and {programLabel.toLowerCase()}s.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column: Academic Units */}
          <motion.div variants={itemVariants} className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{unitLabel}s</h2>
              <button 
                onClick={() => { setEditingUnit(null); setShowUnitModal(true); }}
                className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                title={`Add ${unitLabel}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <button
                onClick={() => setSelectedUnitId("all")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                  selectedUnitId === "all" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <span className="font-semibold text-sm">All {unitLabel}s</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${selectedUnitId === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {units.length}
                </span>
              </button>

              {units.length === 0 && (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-gray-400 font-medium">No units configured yet.</p>
                </div>
              )}

              {units.map(unit => (
                <div 
                  key={unit._id}
                  onClick={() => setSelectedUnitId(unit._id)}
                  className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border group relative ${
                    selectedUnitId === unit._id 
                      ? "bg-indigo-50 border-indigo-200" 
                      : "bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <h4 className={`text-sm font-bold truncate ${selectedUnitId === unit._id ? "text-indigo-900" : "text-gray-900"}`}>
                        {unit.name}
                      </h4>
                      <p className={`text-xs font-medium mt-0.5 ${selectedUnitId === unit._id ? "text-indigo-600" : "text-gray-500"}`}>
                        {unit.code || "No Code"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Unit Actions */}
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity ${selectedUnitId === unit._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingUnit(unit); setShowUnitModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-md shadow-sm border border-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit._id, unit.name); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md shadow-sm border border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Programs */}
          <motion.div variants={itemVariants} className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{programLabel}s</h2>
                {selectedUnitId !== "all" && (
                  <p className="text-xs font-medium text-indigo-600 mt-0.5 flex items-center">
                    Filtering by: {units.find(u => u._id === selectedUnitId)?.name}
                  </p>
                )}
              </div>
              <button 
                onClick={() => { setEditingProgram(null); setShowProgramModal(true); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add {programLabel}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No {programLabel}s Found</h3>
                  <p className="text-sm font-medium text-gray-500 max-w-sm text-center">
                    {selectedUnitId === "all" 
                      ? `Get started by adding your first ${programLabel.toLowerCase()}.` 
                      : `No ${programLabel.toLowerCase()}s exist under this ${unitLabel.toLowerCase()}.`}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">Program Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">Type & Duration</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredPrograms.map((prog) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={prog._id} 
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{prog.name}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">Code: {prog.code || "N/A"}</p>
                            {selectedUnitId === "all" && prog.academicUnit && (
                              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1.5 flex items-center">
                                <ChevronRight className="w-3 h-3 mr-0.5" /> {prog.academicUnit.name}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800">
                              {prog.degreeType || "Degree"}
                            </span>
                            <span className="ml-2 text-xs font-medium text-gray-500">
                              {prog.durationYears ? `${prog.durationYears} Years` : "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingProgram(prog); setShowProgramModal(true); }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-md shadow-sm border border-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProgram(prog._id, prog.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md shadow-sm border border-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Unit Modal */}
      <AnimatePresence>
        {showUnitModal && (
          <UnitModal 
            unit={editingUnit} 
            unitLabel={unitLabel}
            onClose={() => setShowUnitModal(false)}
            onSuccess={() => { setShowUnitModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      {/* Program Modal */}
      <AnimatePresence>
        {showProgramModal && (
          <ProgramModal 
            program={editingProgram} 
            units={units}
            unitLabel={unitLabel}
            programLabel={programLabel}
            preSelectedUnitId={selectedUnitId !== "all" ? selectedUnitId : ""}
            onClose={() => setShowProgramModal(false)}
            onSuccess={() => { setShowProgramModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Modal: Academic Unit ────────────────────────────────────────────────── */
const UnitModal = ({ unit, unitLabel, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setForm] = useState({
    name: unit?.name || "",
    code: unit?.code || "",
    description: unit?.description || "",
    head: unit?.head || "",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (unit) {
        await api.put(`/institutions/academic-units/${unit._id}`, formData);
        toast.success(`${unitLabel} updated successfully`);
      } else {
        await api.post("/institutions/academic-units", formData);
        toast.success(`${unitLabel} created successfully`);
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to save ${unitLabel.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {unit ? `Edit ${unitLabel}` : `Add New ${unitLabel}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder={`e.g. Faculty of Technology`} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code / Abbreviation</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder={`e.g. CSPIT`} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Head / Dean (Optional)</label>
            <input type="text" name="head" value={formData.head} onChange={handleChange} placeholder={`Dr. John Doe`} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Brief description..." />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Modal: Program ──────────────────────────────────────────────────────── */
const ProgramModal = ({ program, units, unitLabel, programLabel, preSelectedUnitId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setForm] = useState({
    academicUnit: program?.academicUnit?._id || program?.academicUnit || preSelectedUnitId || "",
    name: program?.name || "",
    code: program?.code || "",
    degreeType: program?.degreeType || "B.Tech",
    durationYears: program?.durationYears || 4,
    description: program?.description || "",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.academicUnit) return toast.error(`Please select a parent ${unitLabel}`);
    
    try {
      setLoading(true);
      if (program) {
        await api.put(`/institutions/programs/${program._id}`, formData);
        toast.success(`${programLabel} updated successfully`);
      } else {
        await api.post("/institutions/programs", formData);
        toast.success(`${programLabel} created successfully`);
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to save ${programLabel.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {program ? `Edit ${programLabel}` : `Add New ${programLabel}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {units.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3 border border-amber-100">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">You must create an Academic Unit before adding programs.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent {unitLabel} *</label>
                <select required name="academicUnit" value={formData.academicUnit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="">Select {unitLabel}</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder={`e.g. Computer Engineering`} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. CE" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years)</label>
                  <input type="number" name="durationYears" value={formData.durationYears} onChange={handleChange} min="1" max="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type</label>
                <input type="text" name="degreeType" value={formData.degreeType} onChange={handleChange} placeholder="e.g. B.Tech, M.Tech, BCA" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AcademicStructure;