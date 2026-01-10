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
    if (window.confirm("CRITICAL: Permanent user de-registration?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted from list.");
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
        toast.success("New user created.");
        setIsAddModalOpen(false);
      } else {
        await updateUser({ userId: selectedUser._id, ...updatedData }).unwrap();
        toast.success("User profile updated.");
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
      <AdminHeader title="User Management" subtitle={`Overseeing ${users?.length || 0} registered members on the platform.`}>
        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-zinc-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-red-600/20">
            <FaPlus size={10} /> Add New User
          </button>
        </div>
      </AdminHeader>

      <div className="px-6 lg:px-10 py-10 max-w-[1700px] mx-auto space-y-10">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Accounts", val: users?.length, color: "zinc", icon: <FaShieldAlt /> },
            { label: "Admins", val: users?.filter(u => u.isAdmin).length, color: "red", icon: <FaUserShield /> },
            { label: "Active Customers", val: users?.filter(u => u.isActive && !u.isAdmin).length, color: "zinc", icon: <FaCheck /> },
            { label: "Status", val: "Online", color: "zinc", icon: <FaShieldAlt /> }
          ].map((kpi, i) => (
            <div key={i} className={`bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-900 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-2xl ${kpi.color === 'red' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center shadow-lg`}>{kpi.icon}</div>
              <div>
                <p className={`text-[10px] font-black ${kpi.color === 'red' ? 'text-red-500' : 'text-zinc-500'} uppercase tracking-widest`}>{kpi.label}</p>
                <h4 className="text-2xl font-black text-white tracking-tight">{kpi.val}</h4>
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
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">User Profile</th>
                  <th className="px-8 py-6">Connectivity</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Pulse Status</th>
                  <th className="px-8 py-6">Session ID</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <motion.tr key={user._id} variants={itemVariants} className="group hover:bg-zinc-900/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl p-[2px] ${user.isActive ? 'bg-gradient-to-br from-red-600 to-black' : 'bg-zinc-800'} shadow-lg`}>
                          <div className="w-full h-full bg-black rounded-[14px] overflow-hidden">
                            {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-500 font-black uppercase">{user.username.charAt(0)}</div>}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{user.username}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Joined {moment(user.createdAt).format("MMM YYYY")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-gray-600 lowercase">{user.email}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{user.phone || "No direct link"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border 
                          ${user._id === superAdminId ? 'bg-red-900/20 text-red-500 border-red-900/50' : (user.isAdmin ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800')}`}>
                        {user._id === superAdminId ? "Super Admin" : (user.isAdmin ? "Admin" : "Customer")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {user.isActive ? 'Operational' : 'Restricted'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md inline-block">
                        {user.userId || user._id.substring(0, 12).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === user._id ? null : user._id); }} className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><FaEllipsisV /></button>
                      <AnimatePresence>
                        {openActionId === user._id && (
                          <motion.div ref={dropdownRef} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute right-8 top-full mt-2 w-48 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 z-50 p-2 text-left">
                            <button onClick={() => handleEditClick(user)} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl transition-all"><FaUserEdit /> Edit Profile</button>
                            {user._id !== superAdminId && <button onClick={() => toggleUserStatus(user)} className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${user.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{user.isActive ? <><FaBan /> Restrict Access</> : <><FaCheck /> Grant Access</>}</button>}
                            {!user.isAdmin && <button onClick={() => handleDeleteClick(user._id)} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-t border-gray-50 mt-1"><FaTrashAlt /> Delete User</button>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl p-[2px] ${user.isActive ? 'bg-gradient-to-br from-red-600 to-black' : 'bg-zinc-800'} shadow-lg shrink-0`}>
                      <div className="w-full h-full bg-black rounded-[10px] overflow-hidden flex items-center justify-center text-zinc-500 font-black uppercase text-lg">
                        {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : user.username.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{user.username}</p>
                        {user.isAdmin && <FaUserShield className="text-red-600 text-[10px]" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold lowercase">{user.email}</p>
                    </div>
                  </div>

                  <div className={`px-2 py-1 rounded border flex items-center gap-1.5 ${user.isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-rose-500/30 bg-rose-500/10 text-rose-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[9px] font-black uppercase">{user.isActive ? 'Active' : 'Locked'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-black/50 p-2 rounded-lg border border-zinc-800">
                    <p className="text-zinc-500 font-bold uppercase">Role</p>
                    <p className="text-zinc-300 font-bold">{user.isAdmin ? (user._id === superAdminId ? 'Super Admin' : 'Admin') : 'Customer'}</p>
                  </div>
                  <div className="bg-black/50 p-2 rounded-lg border border-zinc-800">
                    <p className="text-zinc-500 font-bold uppercase">UID</p>
                    <p className="text-zinc-300 font-mono">{user.userId || user._id.substring(0, 8)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800/50">
                  <button onClick={() => handleEditClick(user)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase rounded-xl transition-colors">Edit</button>
                  {user._id !== superAdminId && (
                    <button onClick={() => toggleUserStatus(user)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-colors ${user.isActive ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                      {user.isActive ? 'Restrict' : 'Activate'}
                    </button>
                  )}
                  {!user.isAdmin && (
                    <button onClick={() => handleDeleteClick(user._id)} className="w-10 flex items-center justify-center bg-zinc-800 text-rose-500 hover:bg-rose-900/20 rounded-xl transition-colors"><FaTrashAlt size={12} /></button>
                  )}
                </div>
              </div>
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
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border border-white/20"
            >
              <div className="p-8 lg:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/20"><FaUserShield size={24} /></div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{isAddModalOpen ? 'CREATE NEW USER' : 'MODIFY USER'}</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{isAddModalOpen ? 'Profile Creation' : `Profile ID: ${selectedUser?._id.substring(0, 16)}`}</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); setSelectedUser(null); }} className="p-4 text-gray-300 hover:text-rose-500 transition-colors"><FaTimes size={24} /></button>
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

  const inputClass = "w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-teal-500/10 placeholder:text-gray-300 transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-full md:col-span-1">
          <label className={labelClass}><FaUserShield className="inline mr-2" />User Designation</label>
          <input name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="REAL NAME" required />
        </div>
        <div className="space-y-2 col-span-full md:col-span-1">
          <label className={labelClass}><FaEnvelope className="inline mr-2" />Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="LINK_ID@DOMAIN.TOP" required />
        </div>

        {mode === 'add' && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Security Passphrase</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Verify Passphrase</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className={labelClass}><FaPhoneAlt className="inline mr-2" />Comm Line</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+X XXX XXX XXXX" />
        </div>
        <div className="space-y-2">
          <label className={labelClass}><FaVenusMars className="inline mr-2" />Biological Marker</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
            <option value="Male">MALE</option>
            <option value="Female">FEMALE</option>
            <option value="Other">OTHER</option>
          </select>
        </div>
        <div className="space-y-2 col-span-full">
          <label className={labelClass}><FaCalendarAlt className="inline mr-2" />Temporal Origin (DOB)</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-teal-50 rounded-[1.5rem] border border-teal-100">
        <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} className="w-6 h-6 text-teal-600 rounded-lg border-teal-200 focus:ring-teal-500" />
        <div>
          <p className="text-xs font-black text-teal-700 uppercase leading-none">Administrative Access</p>
          <p className="text-[10px] text-teal-600/60 font-medium mt-1">Grant administrative access to system controls.</p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors">Abort</button>
        <button type="submit" className="flex-2 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all">Synchronize Profile</button>
      </div>
    </form>
  );
};

export default UserList;