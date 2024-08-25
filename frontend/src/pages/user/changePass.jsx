import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "../../redux/api/userApiSlice";
import { logout, setCredentials } from "../../redux/features/auth/authSlice";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success("Password updated successfully");

      // Log out user after password change
      dispatch(logout());
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  return (
    <div className="w-full lg:py-20 py-16 bg-gray-50">
      <div className="lg:w-2/5 mx-auto text-center">
        <div className="flex flex-col md:flex-row bg-white shadow-2xl">
          <div className="w-full h-full">
            <div className="py-10">
              <h2 className="text-3xl font-bold capitalize text-teal-800 mb-2">
                Change Password
              </h2>
              <div className="border-2 w-10 border-teal-800 inline-block mb-2"></div>
              <div className="flex flex-col items-center">
                <form onSubmit={submitHandler}>
                  <div className="p-4">
                    <input
                      type="password"
                      value={currentPassword}
                      placeholder="Current Password"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="password"
                      value={newPassword}
                      placeholder="New Password"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    <input
                      type="password"
                      value={confirmPassword}
                      placeholder="Confirm New Password"
                      className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="group my-4 bg-teal-800 text-white px-8 py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                  >
                    Change Password
                  </button>
                </form>
              </div>
              {isLoading && <Loader />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
