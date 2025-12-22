import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useUpdateProfileMutation, useGetProfileQuery } from "../../redux/api/userApiSlice";
import { useUploadProductImageMutation } from "../../redux/api/productApiSlice";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import fashion1 from "../../assets/avatars/fashion_avatar_1.png";
import fashion2 from "../../assets/avatars/fashion_avatar_2.png";
import fashion3 from "../../assets/avatars/fashion_avatar_3.png";
import fashion4 from "../../assets/avatars/fashion_avatar_4.png";
import fashion5 from "../../assets/avatars/fashion_avatar_5.png";
import fashion6 from "../../assets/avatars/fashion_avatar_6.png";

const Profile = () => {
  const [username, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const { data: userProfile, refetch } = useGetProfileQuery();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateProfileMutation();

  useEffect(() => {
    const userData = userProfile || userInfo;
    if (userData) {
      setUserName(userData.username);
      setPhone(userData.phone);
      setEmail(userData.email);
      setImage(userData.image || "");
      setGender(userData.gender || "");
      if (userData.dateOfBirth) {
        setDob(new Date(userData.dateOfBirth).toISOString().split('T')[0]);
      }
    }
  }, [userProfile, userInfo]);

  const dispatch = useDispatch();

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

    if (!password) {
      toast.error("Please enter your current password to save changes");
      return;
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        username,
        phone,
        email,
        image,
        gender,
        dateOfBirth: dob,
        password,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile updated successfully");
      setPassword(""); // Clear password after success
      refetch(); // Refetch profile data
    } catch (error) {
      // Handle validation errors from the backend
      if (error?.data?.errors) {
        // Display all validation errors
        error.data.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(error?.data?.message || error.message || "An error occurred");
      }
    }
  };

  return (
    <>
      <div className="w-full bg-gray-50">
        <div className="lg:w-2/5 mx-auto text-center">
          <div className="flex flex-col md:flex-row">
            <div className="w-full h-full">
              <div className="py-10">
                <h2 className="text-3xl font-bold capitalize text-teal-800 mb-2">
                  Update profile
                </h2>
                <div className="border-2 w-10 border-teal-800 inline-block mb-2"></div>
                <div className="flex flex-col items-center">
                  <form onSubmit={submitHandler}>
                    <div className="p-4 flex flex-col items-center">
                      {image ? (
                        <div className="mb-4 relative w-24 h-24 rounded-full overflow-hidden border-2 border-teal-800">
                          <img src={image} alt="Profile" className="w-full h-full object-cover transform scale-150" />
                        </div>
                      ) : (
                        <div className="mb-4 w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-teal-800">
                          No Img
                        </div>
                      )}
                      <div className="relative">
                        <label className="bg-teal-800 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors text-sm font-semibold capitalize">
                          {image ? "Change Photo" : "Upload Photo"}
                          <input type="file" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                        </label>
                        {loadingUpload && <Loader />}
                      </div>

                      {/* Predefined Avatars */}
                      <div className="mt-6 w-full">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Or Choose an Avatar</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                          {[
                            fashion1,
                            fashion2,
                            fashion3,
                            fashion4,
                            fashion5,
                            fashion6,
                          ].map((avatarUrl, index) => (
                            <div
                              key={index}
                              onClick={() => setImage(avatarUrl)}
                              className={`relative w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-110 border-2 ${image === avatarUrl ? "border-teal-600 scale-110 shadow-md" : "border-transparent"}`}
                            >
                              <img
                                src={avatarUrl}
                                alt={`Avatar ${index}`}
                                className="w-full h-full object-cover transform scale-150"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <input
                        type="text"
                        value={username}
                        placeholder="Name"
                        autoComplete="username"
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
                        autoComplete="tel"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="p-4">
                      <input
                        type="email"
                        value={email}
                        placeholder="Email"
                        autoComplete="email"
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="p-4">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200 text-gray-700"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="p-4">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="bg-gray-100 w-64 p-2 border-2 rounded-lg flex focus:outline-none border-blur-200 text-gray-700"
                        placeholder="Date of Birth"
                      />
                    </div>
                    <div className="p-4 relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Current Password (to save changes)"
                        autoComplete="current-password"
                        className="bg-gray-100 w-64 p-2 pr-10 border-2 rounded-lg flex focus:outline-none border-blur-200"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-500"
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                    <div className="flex justify-between w-64 pl-5">
                      <Link
                        to="/changePassword"
                        className="text-xs capitalize underline text-teal-800"
                      >
                        !change password
                      </Link>
                    </div>
                    <button
                      type="submit"
                      className="group my-4 bg-teal-800 text-white px-8 py-2 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
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