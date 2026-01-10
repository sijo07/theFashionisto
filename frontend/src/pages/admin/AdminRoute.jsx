import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminMenu from "./AdminMenu";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.isAdmin ? (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <AdminMenu />
      <main className="flex-1 h-full overflow-y-auto transition-all duration-300 relative pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};
export default AdminRoute;
