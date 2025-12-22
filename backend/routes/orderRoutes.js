import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  updateOrderStatus,
  updateOrderItemStatus,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Route to create a new order and get all orders (admin only)
router
  .route("/")
  .post(authenticate, createOrder) // Create new order
  .get(authenticate, authorizeAdmin, getAllOrders); // Get all orders (admin)

// Route to get orders specific to the authenticated user
router.route("/mine").get(authenticate, getUserOrders);

// Route to count total orders
router.route("/total-orders").get(countTotalOrders);

// Route to calculate total sales
router.route("/total-sales").get(calculateTotalSales);

// Route to calculate total sales by date
router.route("/total-sales-by-date").get(calculateTotalSalesByDate);

// Route to get a specific order by ID
router.route("/:id").get(authenticate, findOrderById);

// Route to mark an order as paid
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

// Route to mark an order as delivered (admin only)
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

// Route to update order status (admin only)
router
  .route("/:id/status")
  .put(authenticate, authorizeAdmin, updateOrderStatus);

// Route to update specific order item status (admin only)
router
  .route("/:orderId/items/:itemId/status")
  .put(authenticate, authorizeAdmin, updateOrderItemStatus);

export default router;
