import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useRegisterMutation } from "../../redux/api/userApiSlice";
import { useUploadProductImageMutation } from "../../redux/api/productApiSlice";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaCalendar, FaCamera, FaTransgender, FaArrowRight } from "react-icons/fa";
import { Loader } from "../../components";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Register = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Password Validation Check
  const isLength = password.length >= 5;
  const isUpper = /[A-Z]/.test(password);
  const isLower = /[a-z]/.test(password);
  const isSymbol = /[@$!%*?&]/.test(password);
  const isAllMet = isLength && isUpper && isLower && isSymbol;

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      setImage(res.url);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Phone Validation
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    // Email Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password Strength Validation
    if (!isAllMet) {
      toast.error("Password does not meet complexity requirements");
      return;
    }

    // Age Validation
    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    let calculateAge = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      calculateAge--;
    }

    if (calculateAge < 18) {
      toast.error("You must be at least 18 years old to register.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const newUser = { username, phone, email, password, gender, dateOfBirth, image };
        const res = await register(newUser).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("User successfully registered");
      } catch (error) {
        console.error("Error registering user:", error);
        if (error?.status === 400 && error?.data?.errors) {
          if (Array.isArray(error.data.errors)) {
            error.data.errors.forEach(err => toast.error(err));
          } else {
            toast.error(error.data.message || "Validation failed");
          }
        } else {
          toast.error(error?.data?.message || error.message || "An error occurred");
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full pt-20 flex items-center justify-center bg-[#050505] relative overflow-hidden font-inter text-white p-4 pt-10">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen animate-pulse delay-1000" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl h-auto flex flex-col md:flex-row bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >

        {/* Left Side - Visual & Brand */}
        <div className="w-full md:w-5/12 relative hidden md:block overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop"
            alt="Fashion Model"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 w-full p-8 z-20">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl font-playfair font-bold italic mb-2 leading-tight"
            >
              Join the <br /> <span className="text-red-500">Revolution.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-300 text-xs font-light tracking-wide"
            >
              Create your account and start your journey.
            </motion.p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center relative bg-[#0a0a0a]">
          <div className="max-w-lg mx-auto w-full">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5 text-center md:text-left"
            >
              <h2 className="text-xl font-bold mb-0.5 tracking-tight">Create Account</h2>
              <p className="text-gray-400 text-[10px]">Fill in your details to get started</p>
            </motion.div>

            <form onSubmit={submitHandler} className="space-y-4">

              {/* Image Upload */}
              <div className="flex justify-center md:justify-start mb-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-700 group-hover:border-red-500 transition-colors flex items-center justify-center bg-[#1a1a1a]">
                    {image ? (
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaCamera className="text-gray-600 text-lg group-hover:text-red-500 transition-colors" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={uploadFileHandler} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {loadingUpload && <div className="absolute -bottom-5 text-[9px] text-red-500 w-full text-center">Uploading...</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Username */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative">
                    <FaUser className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-7 pr-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all" placeholder="username" required />
                  </div>
                </motion.div>

                {/* Gender */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                  <div className="relative">
                    <FaTransgender className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full pl-7 pr-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none text-gray-400" required>
                      <option value="" className="bg-[#1a1a1a]">Select</option>
                      <option value="Male" className="bg-[#1a1a1a]">Male</option>
                      <option value="Female" className="bg-[#1a1a1a]">Female</option>
                      <option value="Other" className="bg-[#1a1a1a]">Other</option>
                    </select>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-7 pr-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all" placeholder="email@example.com" required />
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                  <div className="relative">
                    <FaPhone className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-7 pr-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all" placeholder="10 digits" required />
                  </div>
                </motion.div>

                {/* Date of Birth */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                  <div className="relative">
                    <FaCalendar className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type="date" value={dateOfBirth} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full pl-7 pr-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-gray-400" required />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-7 pr-7 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all" placeholder="••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <MdVisibilityOff size={12} /> : <MdVisibility size={12} />}
                    </button>
                    {/* Password Strength Popup */}
                    {password && !isAllMet && (
                      <div className="absolute left-0 bottom-full mb-1 w-full p-2 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl z-20 text-[9px] text-gray-400">
                        <div className="space-y-0.5">
                          <div className={isLength ? "text-red-500" : ""}>• 5+ Chars</div>
                          <div className={isUpper ? "text-red-500" : ""}>• Uppercase</div>
                          <div className={isLower ? "text-red-500" : ""}>• Lowercase</div>
                          <div className={isSymbol ? "text-red-500" : ""}>• Symbol</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="space-y-1">
                  <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider ml-1">Confirm</label>
                  <div className="relative">
                    <FaLock className="absolute left-2.5 top-2.5 text-gray-500 text-[10px]" />
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-7 pr-7 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all" placeholder="••••••" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-gray-500 hover:text-white transition-colors">
                      {showConfirmPassword ? <MdVisibilityOff size={12} /> : <MdVisibility size={12} />}
                    </button>
                  </div>
                </motion.div>

              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {isLoading ? <Loader /> : (
                  <>
                    Sign Up <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-4 text-center text-gray-500 text-[10px]"
            >
              Already have an account?{" "}
              <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                Login here
              </Link>
            </motion.p>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;