import { useState, useEffect, useRef } from "react";
import { FaSearch, FaEllipsisH, FaPlus, FaBan, FaTimes, FaCheck } from "react-icons/fa";
import { MdEdit, MdDeleteForever } from "react-icons/md";
import Loader from "../../components/loader";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import Message from "../../components/message";
import moment from "moment";
import AdminHeader from "./AdminHeader";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createUser] = useCreateUserMutation();

  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dropdown State
  const [openActionId, setOpenActionId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Click outside to close actions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenActionId(null);
      }
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
      await updateUser({
        userId: user._id,
        isActive: !user.isActive
      }).unwrap();
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
      setOpenActionId(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteClick = async (id) => {
    setOpenActionId(null);
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || error?.error || "An error occurred");
      }
    }
  };

  const handleEditSave = async (updatedUserData) => {
    try {
      await updateUser({
        userId: selectedUser._id,
        ...updatedUserData
      }).unwrap();
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const handleAddUser = async (newUserData) => {
    try {
      await createUser(newUserData).unwrap();
      toast.success("User created successfully");
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  if (isLoading) return <Loader />;

  if (error)
    return (
      <Message variant="danger">{error?.data?.message || error?.error || "An error occurred"}</Message>
    );

  // Identify Super Admin (First registered user)
  const superAdminId = users && users.length > 0
    ? users.reduce((prev, curr) => (new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr))._id
    : null;

  // Counts
  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.isAdmin).length || 0;
  const customerCount = users?.filter(u => !u.isAdmin).length || 0;
  const activeCount = users?.filter(u => u.isActive && !u.isAdmin).length || 0;

  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900" onClick={() => setOpenActionId(null)}>

      {/* Header */}
      <AdminHeader title="Customers" subtitle="Manage your customer base">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium text-gray-700 placeholder-gray-400"
          />
        </div>
      </AdminHeader>

      <div className="p-8 max-w-[1600px] mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Admins</p>
            <p className="text-2xl font-bold text-[#EA580C]">{adminCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Customers</p>
            <p className="text-2xl font-bold text-[#0EA5E9]">{customerCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Active Customers</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-colors"
          >
            <FaPlus /> Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-white text-gray-500">
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Phone</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Age</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Gender</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">
                    {user.userId ? <span className="font-mono text-gray-500">{user.userId}</span> : `#${user._id.substring(0, 4).toUpperCase()}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image ? (
                        <div className="h-10 w-10 relative rounded-full overflow-hidden mr-4 border border-gray-200">
                          <img src={user.image} alt={user.username} className="w-full h-full object-cover transform scale-150" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#EADDCD] flex items-center justify-center text-[#9A7B4F] text-sm font-bold mr-4 uppercase">
                          {user.username.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{user.username}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {user.phone || <span className="text-gray-300 italic">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {user.dateOfBirth ? moment().diff(user.dateOfBirth, 'years') : <span className="text-gray-300 italic">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium capitalize">
                    {user.gender || "Other"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(user.userId?.startsWith("FSS") || user._id === superAdminId) ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE] mr-2"></span>
                        Super Admin
                      </span>
                    ) : user.isAdmin ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mr-2"></span>
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center text-xs font-bold text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.updatedAt ? moment(user.updatedAt).fromNow() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="relative">
                      <button
                        className={`text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all ${openActionId === user._id ? 'bg-gray-100 text-gray-600' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === user._id ? null : user._id);
                        }}
                      >
                        <FaEllipsisH />
                      </button>
                      {/* Dropdown Menu */}
                      {openActionId === user._id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-10 top-0 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-200 z-50 overflow-hidden transform origin-top-right animate-fade-in-up"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditClick(user)}
                            className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <MdEdit className="text-gray-500" size={20} /> Edit
                          </button>

                          {/* Super Admin Protection: Cannot deactivate the first registered user */}
                          {user._id !== superAdminId ? (
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className={`w-full text-left px-5 py-3 text-sm flex items-center gap-3 transition-colors ${user.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                            >
                              {user.isActive ? (
                                <>
                                  <FaBan className="text-orange-500" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <FaCheck className="text-green-500" /> Activate
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="w-full text-left px-5 py-3 text-xs text-gray-400 italic flex items-center gap-2 bg-gray-50 cursor-not-allowed">
                              <FaBan /> Super Admin Protected
                            </div>
                          )}

                          {!user.isAdmin && (
                            <button
                              onClick={() => handleDeleteClick(user._id)}
                              className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                            >
                              <MdDeleteForever className="text-red-500" size={20} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="mt-6 flex justify-between items-center text-xs text-gray-400 px-2">
          <p>Showing {filteredUsers?.length} users</p>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <UserModal
          mode="edit"
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <UserModal
          mode="add"
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
};

// Reusable User Modal Component
const UserModal = ({ mode = "edit", user, onClose, onSave }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "Other");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? moment(user.dateOfBirth).format("YYYY-MM-DD") : "");

  // Update state when modal user changes (fix for edit mode)
  useEffect(() => {
    if (mode === 'edit' && user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setIsAdmin(user.isAdmin || false);
      setPhone(user.phone || "");
      setGender(user.gender || "Other");
      setDateOfBirth(user.dateOfBirth ? moment(user.dateOfBirth).format("YYYY-MM-DD") : "");
    }
  }, [user, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (dateOfBirth) {
      const age = moment().diff(dateOfBirth, 'years');
      if (age < 18) {
        toast.error("User must be at least 18 years old");
        return;
      }
    }

    if (mode === "add") {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      onSave({ username, email, password, isAdmin, phone, gender, dateOfBirth });
    } else {
      onSave({ username, email, isAdmin, phone, gender, dateOfBirth });
    }

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800">{mode === 'edit' ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Password fields only for Add Mode */}
            {mode === "add" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                max={moment().subtract(18, 'years').format("YYYY-MM-DD")}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all shadow-sm"
              />
            </div>
          </div>

          {user?.userId?.startsWith("FSS") ? (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-200">
                <FaCheck className="text-purple-600 text-xs" />
              </div>
              <span className="text-sm font-bold text-purple-700">
                Super Admin Account
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400 border-gray-300"
                />
              </div>
              <label htmlFor="isAdmin" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                Grant Admin Privileges
              </label>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5"
            >
              {mode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserList;