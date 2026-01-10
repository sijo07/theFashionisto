import { useState, useEffect, useRef } from "react";
import {
  FaSearch, FaEllipsisV, FaPlus, FaBan,
  FaTimes, FaCheck, FaUserShield, FaUserEdit,
  FaTrashAlt, FaEnvelope, FaPhoneAlt, FaVenusMars,
  FaCalendarAlt, FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import moment from "moment";
import AdminHeader from "./AdminHeader";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createUser] = useCreateUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenActionId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    setOpenActionId(null);
  };

  const toggleUserStatus = async (user) => {
    try {
      await updateUser({ userId: user._id, isActive: !user.isActive }).unwrap();
      toast.success(`Access ${!user.isActive ? 'activated' : 'deactivated'}.`);
      setOpenActionId(null);
      refetch();
    } catch (err) {
      toast.error("Status update sequence failed.");
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("CRITICAL: Permanent member de-registration?")) {
      try {
        await deleteUser(id);
        toast.success("Member removed from registry.");
        refetch();
      } catch (err) {
        toast.error("Operation failed.");
      }
    }
    setOpenActionId(null);
  };

  const handleSave = async (updatedData) => {
    try {
      if (isAddModalOpen) {
        await createUser(updatedData).unwrap();
        toast.success("New member registered.");
        setIsAddModalOpen(false);
      } else {
        await updateUser({ userId: selectedUser._id, ...updatedData }).unwrap();
        toast.success("Member profile updated.");
        setIsEditModalOpen(false);
        setSelectedUser(null);
      }
      refetch();
    } catch (err) {
      toast.error("Data synchronization failed.");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-rose-500 font-bold uppercase tracking-widest">Data retrieval failed</div>;

  const superAdminId = users?.length > 0 ? users.reduce((p, c) => (new Date(p.createdAt) < new Date(c.createdAt) ? p : c))._id : null;
  const filteredUsers = users?.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white pb-20 overflow-x-hidden">
      <AdminHeader title="Client Registry" subtitle={`Curating ${users?.length || 0} registered members on the platform.`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CLIENTELE..."
              className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl py-4 md:py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-zinc-700/50 transition-all placeholder:text-zinc-700 text-white uppercase tracking-wider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 px-6 py-4 md:py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
              <FaPlus size={8} />
            </div>
            <span>Register Member</span>
          </button>
        </div>
      </AdminHeader>

      <div className="px-6 lg:px-10 py-10 max-w-[1700px] mx-auto space-y-10">

        {/* KPI Strip (Fashion Design) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: "Total Members", val: users?.length, color: "zinc", icon: <FaShieldAlt /> },
            { label: "Directors", val: users?.filter(u => u.isAdmin).length, color: "red", icon: <FaUserShield /> },
            { label: "Active Patrons", val: users?.filter(u => u.isActive && !u.isAdmin).length, color: "zinc", icon: <FaCheck /> },
            { label: "Registry Status", val: "Online", color: "zinc", icon: <FaShieldAlt />, isStatus: true }
          ].map((kpi, i) => (
            <div key={i} className="bg-[#09090b]/80 backdrop-blur-md p-5 lg:p-6 rounded-[2rem] border border-zinc-800/50 flex flex-col items-start lg:flex-row lg:items-center gap-3 lg:gap-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
              {/* Glow Effect */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${kpi.color === 'red' ? 'from-rose-500/20' : 'from-zinc-500/10'} to-transparent rounded-full blur-2xl group-hover:opacity-100 transition-opacity opacity-50`} />

              <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-lg lg:text-xl shadow-inner relative z-10 shrink-0
                ${kpi.color === 'red' ? 'bg-rose-900/20 text-rose-500' : 'bg-zinc-900 text-zinc-500'}`}>
                {kpi.icon}
              </div>

              <div className="relative z-10">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${kpi.color === 'red' ? 'text-rose-500/80' : 'text-zinc-500'}`}>
                  {kpi.label}
                </p>
                {kpi.isStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <h4 className="text-2xl font-black text-white tracking-tight">ONLINE</h4>
                  </div>
                ) : (
                  <h4 className="text-3xl font-black text-white tracking-tighter">{kpi.val}</h4>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* User Table Desktop Interface */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-zinc-950 rounded-[3rem] border border-zinc-900 shadow-2xl shadow-zinc-900/30 overflow-hidden"
        >
          {/* Desktop Client Card Grid */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className="group relative bg-[#09090b]/80 backdrop-blur-xl rounded-[2rem] border border-zinc-800/50 hover:border-zinc-700 transition-all duration-500 overflow-hidden"
              >
                {/* Decorative gradients */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${user.isActive ? 'from-emerald-500/10' : 'from-rose-500/10'} to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="p-8 relative z-10">
                  {/* Card Header: Avatar & Access Ring */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-[2rem] p-[3px] ${user.isActive ? 'bg-gradient-to-br from-white/10 to-transparent' : 'bg-rose-900/20'}`}>
                        <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-black relative">
                          {user.image ? (
                            <img src={user.image} alt={user.username} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-700 uppercase">
                              {user.username.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Active Pulse Dot */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#09090b] flex items-center justify-center ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {user.isActive && <div className="w-full h-full rounded-full animate-ping bg-emerald-500 opacity-20" />}
                      </div>
                    </div>

                    {/* Actions Menu Trigger */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === user._id ? null : user._id); }}
                        className="w-10 h-10 rounded-full bg-zinc-900/50 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                      >
                        <FaEllipsisV size={12} />
                      </button>

                      <AnimatePresence>
                        {openActionId === user._id && (
                          <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 z-50 p-2 text-left"
                          >
                            <button onClick={() => handleEditClick(user)} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl transition-all"><FaUserEdit /> Edit Details</button>
                            {user._id !== superAdminId && <button onClick={() => toggleUserStatus(user)} className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${user.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{user.isActive ? <><FaBan /> Suspend Access</> : <><FaCheck /> Restore Access</>}</button>}
                            {!user.isAdmin && <button onClick={() => handleDeleteClick(user._id)} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-t border-gray-50 mt-1"><FaTrashAlt /> Revoke Membership</button>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2 line-clamp-1">{user.username}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border 
                            ${user._id === superAdminId ? 'bg-red-900/20 text-red-500 border-red-900/30' : (user.isAdmin ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800')}`}>
                          {user._id === superAdminId ? "Director" : (user.isAdmin ? "Curator" : "Patron")}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{user.userId || user._id.substring(0, 8)}</span>
                      </div>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 gap-2 p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/30">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600"><FaEnvelope size={10} /></div>
                        <p className="text-xs font-bold text-zinc-400 truncate">{user.email}</p>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600"><FaPhoneAlt size={10} /></div>
                          <p className="text-xs font-bold text-zinc-400">{user.phone}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      <span>Joined {moment(user.createdAt).format("MMM YYYY")}</span>
                      <span className={user.isActive ? "text-emerald-500" : "text-rose-500"}>{user.isActive ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Card View */}
          {/* Mobile Client Card View (Fashion Design) */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 rounded-[2rem] overflow-hidden relative group"
              >
                {/* Active Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                <div className="p-5 pl-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 rounded-2xl p-[2px] ${user.isActive ? 'bg-gradient-to-br from-white/20 to-transparent' : 'bg-rose-900/30'}`}>
                        <div className="w-full h-full rounded-[0.9rem] overflow-hidden bg-black">
                          {user.image ? (
                            <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-zinc-700 uppercase">
                              {user.username.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Role Badge overlapping avatar */}
                      <div className={`absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest shadow-lg
                        ${user.isAdmin ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                        {user.isAdmin ? (user._id === superAdminId ? 'DIR' : 'CUR') : 'PTR'}
                      </div>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight truncate pr-2">{user.username}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {user.isActive ? 'Active' : 'Locked'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-[10px] text-zinc-600" />
                          <p className="text-[10px] font-bold text-zinc-400 truncate w-full">{user.email}</p>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-600 bg-zinc-900/50 px-1.5 py-0.5 rounded-md self-start border border-zinc-800/50">
                          ID: {user.userId || user._id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Action Bar */}
                <div className="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 bg-black/40">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="py-3 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:bg-zinc-800/50 hover:text-white transition-colors"
                  >
                    <FaUserEdit /> Edit
                  </button>

                  {user._id !== superAdminId && (
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${user.isActive ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                      {user.isActive ? <FaBan /> : <FaCheck />} {user.isActive ? 'Suspend' : 'Active'}
                    </button>
                  )}

                  {!user.isAdmin && (
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className="py-3 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-rose-900/20 hover:text-rose-500 transition-colors"
                    >
                      <FaTrashAlt /> Revoke
                    </button>
                  )}
                  {/* Empty slot filler if actions are hidden */}
                  {(user.isAdmin || user._id === superAdminId) && <div className="bg-zinc-900/20"></div>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* User Management Modals */}
      <AnimatePresence>
        {(isEditModalOpen || isAddModalOpen) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#09090b] rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border border-zinc-800"
            >
              <div className="p-8 lg:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shadow-xl"><FaUserShield size={24} /></div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{isAddModalOpen ? 'REGISTER MEMBER' : 'MODIFY ENTRY'}</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{isAddModalOpen ? 'New Entry' : `Membership ID: ${selectedUser?._id.substring(0, 16)}`}</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); setSelectedUser(null); }} className="p-4 text-zinc-500 hover:text-white transition-colors"><FaTimes size={24} /></button>
                </div>

                <UserForm
                  mode={isAddModalOpen ? "add" : "edit"}
                  user={selectedUser}
                  onClose={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); setSelectedUser(null); }}
                  onSave={handleSave}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 z-[45] pointer-events-none" onClick={() => setOpenActionId(null)}></div>
    </div>
  );
};

const UserForm = ({ mode, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    isAdmin: user?.isAdmin || false,
    phone: user?.phone || "",
    gender: user?.gender || "Other",
    dateOfBirth: user?.dateOfBirth ? moment(user.dateOfBirth).format("YYYY-MM-DD") : ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add' && formData.password !== formData.confirmPassword) return toast.error("Password discrepancy detected.");
    onSave(formData);
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-zinc-700 placeholder:text-zinc-700 transition-all uppercase tracking-wide";
  const labelClass = "text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-full md:col-span-1">
          <label className={labelClass}>Full Name</label>
          <input name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="REAL NAME" required />
        </div>
        <div className="space-y-2 col-span-full md:col-span-1">
          <label className={labelClass}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="LINK_ID@DOMAIN.TOP" required />
        </div>

        {mode === 'add' && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Access Key</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Verify Key</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className={labelClass}>Phone Number</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+X XXX XXX XXXX" />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Gender Identity</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
            <option value="Male">MALE</option>
            <option value="Female">FEMALE</option>
            <option value="Other">OTHER</option>
          </select>
        </div>
        <div className="space-y-2 col-span-full">
          <label className={labelClass}>Date of Birth</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`${inputClass} text-zinc-400`} />
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-zinc-900/50 rounded-[1.5rem] border border-zinc-800">
        <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} className="w-6 h-6 text-red-600 rounded-lg bg-black border-zinc-700 focus:ring-red-900 focus:ring-offset-0" />
        <div>
          <p className="text-xs font-black text-white uppercase leading-none">Director Authority</p>
          <p className="text-[10px] text-zinc-500 font-medium mt-1">Grant full administrative control over the registry.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4">
        <button type="button" onClick={onClose} className="col-span-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Discard</button>
        <button type="submit" className="col-span-2 py-4 bg-white hover:bg-zinc-200 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">Confirm Registry</button>
      </div>
    </form>
  );
};

export default UserList;