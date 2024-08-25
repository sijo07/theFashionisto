import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useRegisterMutation } from "../../redux/api/userApiSlice";
import { MdExpandMore } from "react-icons/md";
import Loader from "../../components/loader";
import { toast } from "react-toastify";

const Register = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
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

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const newUser = { username, phone, email, password };
        const res = await register(newUser).unwrap(); 
        dispatch(setCredentials({ ...res })); 
        navigate(redirect); 
        toast.success("User successfully registered"); 
      } catch (error) {
        console.error("Error registering user:", error);
        toast.error(error.data.message || error.message); 
      }
    }
  };

  return (
    <div className="w-full py-2 bg-gray-50">
      <div className="lg:w-3/5 mx-auto text-center">
        <div className="flex flex-col md:flex-row bg-white shadow-2xl">
          <div className="w-full h-full">
            <div className="py-10">
              <h2 className="text-3xl font-bold capitalize text-teal-800 mb-2">
                Let&apos;s start
              </h2>
              <div className="border-2 w-10 border-teal-800 inline-block mb-2"></div>
              <p className="text-gray-400 text-sm capitalize">Create account</p>
              <div className="flex flex-col items-center">
                <form onSubmit={submitHandler}>
                  <div className="p-4">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      placeholder="Username"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      placeholder="Phone"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      placeholder="Email"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="password"
                      value={password}
                      id="password"
                      placeholder="Password"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      placeholder="Confirm Password"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="group my-4 bg-teal-800 text-white px-8 py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                  {isLoading && <Loader />}
                </form>
              </div>
            </div>
          </div>

          <div className="lg:w-2/5 h-full">
            <div className="bg-teal-700 lg:rounded-br-xl lg:rounded-tr-xl text-white py-8 lg:py-52 px-20">
              <h2 className="text-3xl capitalize font-bold mb-2">
                Hello, folks
              </h2>
              <div className="border-2 w-10 border-white inline-block mb-2"></div>
              <p className="capitalize">Already have an account?</p>
              <div
                className="group flex items-center justify-center border-2 border-white rounded-full py-2 px-10 m-8 text-white  
                text-sm lg:text-sm font-bold uppercase hover:bg-white/90 hover:text-teal-950 tracking-wider cursor-pointer"
              >
                <Link
                  className="capitalize"
                  to={redirect ? `/login?redirect=${redirect}` : "/login"}
                >
                  Login
                </Link>
                <span className="-rotate-90 duration-100 ease-in group-hover:rotate-90">
                  <MdExpandMore size={24} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
