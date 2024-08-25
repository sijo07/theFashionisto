import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useUpdateProfileMutation } from "../../redux/api/userApiSlice";

const Profile = () => {
  const [username, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.username);
      setPhone(userInfo.phone);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter password to save");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          username,
          phone,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    }
  };

  return (
    <>
      <div className="w-full lg:py-20 py-16 bg-gray-50">
        <div className="lg:w-2/5 mx-auto text-center">
          <div className="flex flex-col md:flex-row bg-white shadow-2xl">
            <div className="w-full h-full">
              <div className="py-10">
                <h2 className="text-3xl font-bold capitalize text-teal-800 mb-2">
                  Update profile
                </h2>
                <div className="border-2 w-10 border-teal-800 inline-block mb-2"></div>
                <div className="flex flex-col items-center">
                  <form onSubmit={submitHandler}>
                    <div className="p-4">
                      <input
                        type="text"
                        value={username}
                        placeholder="Name"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-4">
                      <input
                        type="tel"
                        value={phone}
                        placeholder="Phone"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="p-4">
                      <input
                        type="email"
                        value={email}
                        placeholder="Email"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-4">
                      <input
                        type="password"
                        value={password}
                        placeholder="Password"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="p-4">
                      <input
                        type="password"
                        value={confirmPassword}
                        placeholder="Confirm Password"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between w-64 pl-5 mb-5">
                      <Link
                        to="/changePassword"
                        className="text-xs capitalize underline text-teal-800"
                      >
                        !change password
                      </Link>
                    </div>
                    <button
                      type="submit"
                      className="group my-4 bg-teal-800 text-white px-8 py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                    >
                      Update
                    </button>
                  </form>
                </div>
                {loadingUpdateProfile && <Loader />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
