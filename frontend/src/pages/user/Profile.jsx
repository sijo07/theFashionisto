import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/loader";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);
  const { data: userProfile, isLoading: loadingProfile } = useGetProfileQuery();

  const [updateProfile, { isLoading: loadingUpdate }] = useUpdateProfileMutation();

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setEmail(userProfile.email);
      setImage(userProfile.image || "");
    }
  }, [userProfile]);

  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(reader.result); // In a real app, you might upload first or send base64
      };
      reader.readAsDataURL(file);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          username,
          email,
          password,
          image, // Sending base64 or url
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success("Profile updated successfully");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 text-white text-sm font-medium rounded-sm px-4 py-3 focus:border-red-600 focus:outline-none placeholder:text-zinc-600 transition-colors";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2";

  if (loadingProfile) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar / Navigation */}
          <div className="w-full md:w-64 bg-zinc-950 border border-zinc-800 p-6 rounded-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-2 border-zinc-800 overflow-hidden mb-4 relative group">
                <img
                  src={imagePreview || image || `https://ui-avatars.com/api/?name=${username}&background=EF4444&color=fff`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <FaCamera className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <h2 className="text-lg font-bold text-white">{username}</h2>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>

            <nav className="space-y-2">
              <Link to="/profile" className="block px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                Account Settings
              </Link>
              <Link to="/user-orders" className="block px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors">
                Order History
              </Link>
              <button className="w-full text-left px-4 py-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 mt-8">
                <FaSignOutAlt /> Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-zinc-950 border border-zinc-800 p-8 rounded-sm w-full">
            <h1 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-3">
              <FaUser className="text-red-600" /> Account Settings
            </h1>

            <form onSubmit={submitHandler} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Username</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Enter username"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-6">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                >
                  {loadingUpdate ? "Updating..." : <><FaSave /> Save Changes</>}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;