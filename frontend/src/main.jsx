import ReactDOM from "react-dom/client";
import { Suspense, lazy } from "react";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";


import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./pages/admin/AdminRoute.jsx";
// Admin Pages
import AdminDash from "./pages/admin/AdminDash.jsx";
import UserList from "./pages/admin/UserList.jsx";
import CategoryList from "./pages/admin/CategoryList.jsx";
import ProductList from "./pages/admin/ProductList.jsx";
import AllProducts from "./pages/admin/AllProducts.jsx";
import ProductUpdate from "./pages/admin/ProductUpdate.jsx";
import OrderList from "./pages/admin/OrderList.jsx";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails.jsx";
import Inventory from "./pages/admin/Inventory.jsx"; // Added based on original content
// Auth
const Login = lazy(() => import("./pages/auth/Login.jsx")); // Changed to PascalCase
const Register = lazy(() => import("./pages/auth/Register.jsx")); // Changed to PascalCase
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

import Profile from "./pages/user/Profile.jsx"; // Changed to PascalCase
import ChangePassword from "./pages/user/ChangePass.jsx"; // Changed to PascalCase

const Home = lazy(() => import("./pages/Home.jsx")); // Changed to PascalCase

import Favorites from "./pages/products/Favorites.jsx"; // Changed to PascalCase
import ProductDetails from "./pages/products/ProductDetails.jsx"; // Changed to PascalCase

import Cart from "./pages/Cart.jsx"; // Changed to PascalCase
import Shop from "./pages/Shop.jsx"; // Changed to PascalCase

import Shipping from "./pages/orders/Shipping.jsx"; // Changed to PascalCase
import PlaceOrder from "./pages/orders/PlaceOrder.jsx"; // Changed to PascalCase
import Payment from "./pages/orders/Payment.jsx";
import Order from "./pages/orders/Order.jsx"; // Changed to PascalCase
import UserOrders from "./pages/orders/UserOrders.jsx";
import Contact from "./components/Contact.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={
      <Suspense fallback={<div className="p-10 text-center">Loading Error...</div>}>
        <ErrorPage />
      </Suspense>
    }>
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
        <Route path="/payment" element={<Payment />} />
        <Route path="/placeOrder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/user-orders" element={<UserOrders />} />
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route path="userList" element={<UserList />} />
        <Route path="categoryList" element={<CategoryList />} />
        <Route path="productList" element={<ProductList />} />
        <Route path="allProductsList" element={<AllProducts />} />
        <Route path="productList/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderList" element={<OrderList />} />
        <Route path="order/:id" element={<AdminOrderDetails />} />
        <Route path="dashboard" element={<AdminDash />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={
        <Suspense fallback={<div>Loading...</div>}>
          <NotFound />
        </Suspense>
      } />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
