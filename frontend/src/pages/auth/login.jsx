import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { MdExpandMore } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";
import Loader from "../../components/loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      console.log(res);
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  return (
    <div className="w-full lg:py-10 bg-gray-50">
      <div className="mx-auto text-center lg:w-3/5">
        <div className="flex flex-col bg-white shadow-2xl md:flex-row">
          <div className="w-full h-full ">
            <div className="py-10">
              <h2 className="mb-2 text-3xl font-bold text-teal-800 capitalize">
                Welcome back!
              </h2>
              <div className="inline-block w-10 mb-2 border-2 border-teal-800"></div>
              <div className="flex justify-center my-2">
                <a
                  href="#"
                  className="p-3 mx-1 border-2 border-gray-200 rounded-full"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="p-3 mx-1 border-2 border-gray-200 rounded-full"
                >
                  <FaGoogle />
                </a>
                <a
                  href="#"
                  className="p-3 mx-1 border-2 border-gray-200 rounded-full"
                >
                  <FaTwitter />
                </a>
              </div>
              <p className="my-3 text-sm text-gray-400 capitalize">
                Or enter email and password
              </p>
              <div className="flex flex-col items-center">
                <form onSubmit={submitHandler}>
                  <div className="p-4">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      placeholder="Email"
                      className="flex w-64 p-2 bg-gray-100 border-2 rounded-lg focus:outline-none border-blur-200"
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
                      className="flex w-64 p-2 bg-gray-100 border-2 rounded-lg focus:outline-none border-blur-200"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between w-64 pl-5 mb-5">
                    <label className="flex items-center text-xs capitalize">
                      <input type="checkbox" name="remember" className="mr-1" />
                      Remember me
                    </label>
                    <a href="#" className="text-xs capitalize">
                      Forget password?
                    </a>
                  </div>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="px-8 py-3 my-4 font-bold tracking-wider text-white capitalize duration-200 bg-teal-800 rounded-full cursor-pointer group hover:scale-105"
                  >
                    {isLoading ? "Signing in..." : "Continue"}
                  </button>
                  {isLoading && <Loader />}
                </form>
              </div>
            </div>
          </div>

          <div className="h-full lg:w-2/5">
            <div className="px-20 py-8 text-white bg-teal-700 lg:rounded-br-xl lg:rounded-tr-xl lg:py-40">
              <h2 className="mb-2 text-3xl font-bold capitalize">
                Hello, folks
              </h2>
              <div className="inline-block w-10 mb-2 border-2 border-white"></div>
              <p className="capitalize">Don&apos;t have an account!</p>
              <div className="flex items-center justify-center px-10 py-2 m-8 text-sm font-bold tracking-wider text-white uppercase border-2 border-white rounded-full cursor-pointer group lg:text-sm hover:bg-white/90 hover:text-teal-950">
                <Link
                  className="capitalize"
                  to={redirect ? `/register?redirect=${redirect}` : "/register"}
                >
                  Register
                </Link>
                <span className="duration-100 ease-in -rotate-90 group-hover:rotate-90">
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

export default Login;
