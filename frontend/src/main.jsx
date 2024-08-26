import ReactDOM from "react-dom/client";
import { Suspense, lazy } from "react";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import PrivateRoute from "./components/privateRoute";
import {
  AdminRoute,
  CategoryList,
  ProductList,
  AllProducts,
  ProductUpdate,
  UserList,
  AdminDashboard,
  OrderList,
} from "./pages/admin/index.js";
// Auth
const Login = lazy(() => import("./pages/auth/login.jsx"));
const Register = lazy(() => import("./pages/auth/register.jsx"));

import Profile from "./pages/user/profile";
import ChangePassword from "./pages/user/changePass.jsx";

const Home = lazy(() => import("./pages/home.jsx"));

import Favorites from "./pages/products/Favorites.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";

import Cart from "./pages/cart.jsx";
import Shop from "./pages/shop.jsx";

import Shipping from "./pages/orders/shipping.jsx";
import PlaceOrder from "./pages/orders/placeOrder.jsx";
import Order from "./pages/orders/order.jsx";
import Contact from "./components/contact.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index={true}
        path="/"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Register />
          </Suspense>
        }
      />
      <Route index={true} path="/" element={<Home />} />
      <Route path="/favorite" element={<Favorites />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeOrder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route path="userList" element={<UserList />} />
        <Route path="categoryList" element={<CategoryList />} />
        <Route path="productList" element={<ProductList />} />
        <Route path="allProductsList" element={<AllProducts />} />
        <Route path="productList/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderList" element={<OrderList />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
