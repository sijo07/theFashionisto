import { Outlet } from "react-router-dom";
import Navigation from "./pages/auth/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Footer} from './components/index'

const App = () => {
  return (
    <>
      <ToastContainer />
      <Navigation />
      <div className="py-7"></div>
      <main className="py-3 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default App;
