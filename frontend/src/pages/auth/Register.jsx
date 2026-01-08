import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useRegisterMutation } from "../../redux/api/userApiSlice";
import { useUploadProductImageMutation } from "../../redux/api/productApiSlice";
import { MdVisibility, MdVisibilityOff, MdEmail, MdPerson, MdPhone, MdLock, MdArrowForward, MdWc, MdCalendarToday, MdCloudUpload } from "react-icons/md";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

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
      setImage(res.url); // Using res.url as fixed in previous task
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
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-4xl flex bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 m-4">

        {/* Left Side - Welcome Text */}
        <div className="hidden md:flex w-1/2 flex-col justify-center p-12 text-white bg-teal-900/40 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>

          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Join the <br /><span className="text-teal-300">Fashionisto</span></h1>
          <p className="text-lg text-gray-200 mb-8">Discover the latest trends and exclusive collections tailored just for you.</p>

          <div className="mt-auto">
            <p className="text-sm text-gray-300 mb-2">Already have an account?</p>
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="inline-flex items-center text-white font-bold text-lg hover:text-teal-300 transition-colors">
              Log in here <MdArrowForward className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white/95 text-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 mb-8 text-sm">Fill in your details to get started</p>

          <form onSubmit={submitHandler} className="space-y-6">

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-2">
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-teal-500" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 text-gray-400">
                    <MdPerson className="text-4xl" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg">
                  <MdCloudUpload className="text-sm" />
                  <input type="file" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                </label>
              </div>
              <span className="text-xs text-gray-500 font-medium">{image ? "Image Uploaded" : "Upload Profile Photo"}</span>
              {loadingUpload && <div className="text-xs text-teal-600 mt-1">Uploading...</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div className="relative">
                <MdPerson className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Gender */}
              <div className="relative">
                <MdWc className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-700 appearance-none bg-white"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="relative md:col-span-2">
                <MdCalendarToday className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  placeholder="Date of Birth"
                  value={dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all w-full"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative md:col-span-2">
                <MdEmail className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative md:col-span-2">
                <MdPhone className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group md:col-span-2">
                <MdLock className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>

                {/* Password Strength Popup */}
                {password && !isAllMet && (
                  <div className="absolute left-0 bottom-full mb-2 w-full p-4 bg-white border border-gray-100 rounded-xl shadow-xl z-20 text-sm transform transition-all duration-300 ease-out origin-bottom">
                    <div className="space-y-2">
                      <div className={`flex items-center ${isLength ? "text-teal-600" : "text-gray-400"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isLength ? "bg-teal-500" : "bg-gray-300"}`}></div>
                        5+ Characters
                      </div>
                      <div className={`flex items-center ${isUpper ? "text-teal-600" : "text-gray-400"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isUpper ? "bg-teal-500" : "bg-gray-300"}`}></div>
                        Uppercase Letter
                      </div>
                      <div className={`flex items-center ${isLower ? "text-teal-600" : "text-gray-400"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isLower ? "bg-teal-500" : "bg-gray-300"}`}></div>
                        Lowercase Letter
                      </div>
                      <div className={`flex items-center ${isSymbol ? "text-teal-600" : "text-gray-400"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isSymbol ? "bg-teal-500" : "bg-gray-300"}`}></div>
                        Symbol (@$!%*?&)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative md:col-span-2">
                <MdLock className="absolute left-3 top-3.5 text-gray-400 text-xl" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Register Now"
              )}
            </button>

            <div className="md:hidden mt-8 text-center text-sm">
              <p className="text-gray-500">Already have an account? <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} className="text-teal-600 font-bold">Login</Link></p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;