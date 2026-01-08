import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { Loader } from "../../components";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebookF, FaTwitter, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));

      if (res.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate(redirect);
      }
    } catch (error) {
      if (error?.data?.errors) {
        error.data.errors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      } else {
        toast.error(error?.data?.message || error.message || "An error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden font-inter text-white p-4 pt-20">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen animate-pulse delay-1000" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl h-auto md:h-[550px] flex flex-col md:flex-row bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >

        {/* Left Side - Visual & Brand */}
        <div className="w-full md:w-1/2 relative hidden md:block overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop"
            alt="Fashion Model"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 w-full p-8 z-20">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-playfair font-bold italic mb-2 leading-tight"
            >
              Redefine <br /> <span className="text-red-500">Elegance.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-300 text-sm font-light tracking-wide"
            >
              Step into a world where style knows no bounds.
            </motion.p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative bg-[#0a0a0a]">
          <div className="max-w-sm mx-auto w-full">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold mb-1 tracking-tight">Welcome Back</h2>
              <p className="text-gray-400 text-xs">Please enter your details to sign in</p>
            </motion.div>

            <form onSubmit={submitHandler} className="space-y-4">

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-500 text-sm group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-500 text-sm group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="flex justify-between items-center text-xs"
              >
                <label className="flex items-center text-gray-400 hover:text-gray-300 cursor-pointer transition-colors select-none">
                  <input type="checkbox" className="mr-2 rounded border-gray-700 bg-[#1a1a1a] text-red-600 focus:ring-red-500/50" />
                  Remember me
                </label>
                <Link to="#" className="text-red-400 hover:text-red-300 transition-colors font-medium">Forgot Password?</Link>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {isLoading ? <Loader /> : (
                  <>
                    Sign In <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#0a0a0a] text-gray-500">Or continue with</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex gap-3 mt-4 justify-center"
              >
                {[FaGoogle, FaFacebookF, FaTwitter].map((Icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2, backgroundColor: "#262626" }}
                    className="p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 text-gray-400 hover:text-white transition-all"
                  >
                    <Icon size={16} />
                  </motion.button>
                ))}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-6 text-center text-gray-500 text-xs"
            >
              Don't have an account?{" "}
              <Link to={redirect ? `/register?redirect=${redirect}` : "/register"} className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                Create one now
              </Link>
            </motion.p>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;