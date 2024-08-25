import { useState, useEffect } from "react";
import { FaUserEdit, FaCheck, FaTimes } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";

import { FcOk, FcCancel } from "react-icons/fc";
import Loader from "../../components/loader";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import Message from "../../components/message";
import AdminMenu from "./adminMenu";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserPhone, setEditableUserPhone] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleEdit = (id, username, phone, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserPhone(phone);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName,
        phone: editableUserPhone,
        email: editableUserEmail,
      }).unwrap();
      toast.success("User updated successfully");
      setEditableUserId(null);
      refetch();
    } catch (error) {
      toast.error(error.data.message || error.error);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error.data.message || error.error);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">{error.data.message || error.error}</Message>
    );
  }

  return (
    <>
      <div className="container mx-auto">
        <AdminMenu />
        <h1 className="flex items-center m-4 h-10 text-1xl lg:text-2xl text-[#649899] font-bold uppercase tracking-wider">
          User List{" "}
          <svg
            className="w-10 h-5 ml-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </h1>
        <div className="flex justify-center items-center min-h-screen">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-6">
            {users?.map((user) => (
              <div
                key={user._id}
                className="bg-gray-200 p-6 shadow-lg rounded-md w-[17rem] h-[19rem]"
              >
                <div className="mb-4">
                  <strong>ID:</strong> {user._id}
                </div>
                <div className="mb-4">
                  {editableUserId === user._id ? (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={editableUserName}
                        onChange={(e) => setEditableUserName(e.target.value)}
                        className="w-full p-2 mb-2 border rounded-lg text-black"
                        placeholder="Username"
                      />
                      <input
                        type="tel"
                        value={editableUserPhone}
                        onChange={(e) => setEditableUserPhone(e.target.value)}
                        className="w-full p-2 mb-2 border rounded-lg text-black lining-nums"
                        placeholder="Phone"
                      />
                      <input
                        type="email"
                        value={editableUserEmail}
                        onChange={(e) => setEditableUserEmail(e.target.value)}
                        className="w-full p-2 mb-2 border rounded-lg text-black"
                        placeholder="Email"
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="group my-4 bg-teal-800 text-white px-8 m-1 py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => setEditableUserId(null)}
                          className="group my-4 bg-red-700 text-white px-8 m-1 py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2 capitalize">
                        <strong>Username:</strong>
                        <p>{user.username}</p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <strong>Email:</strong>
                        <p>{user.email}</p>
                      </div>
                      <div className="flex items-center justify-between mb-2 lining-nums">
                        <strong>Phone:</strong>
                        <p>{user.phone}</p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <strong>Admin:</strong>
                        {user.isAdmin ? (
                          <FcOk size={24} />
                        ) : (
                          <FcCancel size={22} />
                        )}
                      </div>
                      <div className="flex m-6">
                        <button
                          onClick={() =>
                            toggleEdit(
                              user._id,
                              user.username,
                              user.phone,
                              user.email
                            )
                          }
                          className="group my-4 bg-teal-800 text-white px-8 py-3 m-1 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                        >
                          <FaUserEdit />
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() => deleteHandler(user._id)}
                            className="group my-4 bg-red-700 text-white px-8  py-3 font-bold capitalize rounded-full tracking-wider cursor-pointer hover:scale-105 duration-200"
                          >
                            <FaDeleteLeft />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserList;
