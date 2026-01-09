import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Joi from "joi";
import { generateId } from "../utils/idGenerator.js";

// Function to calculate prices based on item details and tax logic
function calculateTax(item) {
  const gstRate = item.price > 1000 ? 0.12 : 0.05; // 12% for items > ₹1000, otherwise 5%
  return item.price * item.qty * gstRate;
}

function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const taxPrice = orderItems.reduce(
    (acc, item) => acc + calculateTax(item),
    0
  );
  const shippingPrice = itemsPrice < 500 ? 50 : 0; // ₹50 for orders below ₹500, otherwise free
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice,
  };
}

// Input validation schema
const orderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().required(),
        qty: Joi.number().integer().min(1).required(),
      }).unknown(true)
    )
    .required(),
  shippingAddress: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().optional(),
    country: Joi.string().required(),
  }).unknown(true).required(),
  paymentMethod: Joi.string().valid("Credit Card", "PayPal", "COD").required(),
  itemsPrice: Joi.number().required(),
  taxPrice: Joi.number().required(),
  shippingPrice: Joi.number().required(),
  totalPrice: Joi.number().required(),
});

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // Map pinCode to postalCode if necessary
    if (shippingAddress && shippingAddress.pinCode && !shippingAddress.postalCode) {
      shippingAddress.postalCode = shippingAddress.pinCode;
    }

    // Validate input
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const dbOrderItems = [];

    // Iterate to validate and update stock sequentially
    for (const item of orderItems) {
      const product = await Product.findById(item._id);

      if (!product) {
        res.status(404); // Set status for error handler
        throw new Error(`Product not found: ${item._id}`);
      }

      // Check Stock Availability
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Decrement Global Stock
      product.countInStock -= item.qty;

      // Decrement Size Stock if applicable
      if (item.size) {
        const sizeVariant = product.sizes.find((s) => s.size === item.size);
        if (sizeVariant) {
          if (sizeVariant.stock < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size})`);
          }
          sizeVariant.stock -= item.qty;
        }
      }

      await product.save();

      dbOrderItems.push({
        ...item,
        product: item._id,
        price: product.price,
        _id: undefined,
      });
    }

    // Calculate the prices based on the updated logic
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    // Generate custom Order ID (FSOxxx)
    const orderId = await generateId("FSO", "order");

    // Create and save the order
    const order = new Order({
      orderId,
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Other order-related controllers (unchanged for this update)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id username email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "orderItems.product"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
    ]);
    res.json({ totalSales: totalSales[0]?.totalSales || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "username email"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || order._id,
      status: req.body.status || "COMPLETED",
      update_time: req.body.update_time || Date.now().toString(),
      email_address: req.body.payer?.email_address || "manual@admin.com",
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = "Delivered"; // Sync status
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
      // Restore stock for all items
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.qty;
          if (item.size) {
            const sizeVar = product.sizes.find(s => s.size === item.size);
            if (sizeVar) sizeVar.stock += item.qty;
          }
          await product.save();
        }
        item.itemStatus = "Cancelled"; // Sync item status
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (order) {
      const item = order.orderItems.find((i) => i._id.toString() === itemId);

      if (item) {
        const oldStatus = item.itemStatus;

        // Stock Management: Restock on Cancel, Deduct on Un-Cancel
        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock += item.qty;
            if (item.size) {
              const sizeVar = product.sizes.find(s => s.size === item.size);
              if (sizeVar) sizeVar.stock += item.qty;
            }
            await product.save();
          }
        } else if (status !== 'Cancelled' && oldStatus === 'Cancelled') {
          const product = await Product.findById(item.product);
          if (product) {
            if (product.countInStock < item.qty) {
              return res.status(400).json({ message: `Insufficient stock to un-cancel: ${product.name}` });
            }
            product.countInStock -= item.qty;
            if (item.size) {
              const sizeVar = product.sizes.find(s => s.size === item.size);
              if (sizeVar) {
                if (sizeVar.stock < item.qty) {
                  return res.status(400).json({ message: `Insufficient size stock: ${item.size}` });
                }
                sizeVar.stock -= item.qty;
              }
            }
            await product.save();
          }
        }

        item.itemStatus = status;

        if (status === "Delivered") {
          item.isDelivered = true;
          item.deliveredAt = Date.now();
        } else {
          item.isDelivered = false;
          item.deliveredAt = null;
        }

        // Check if all items are delivered to update main order status
        const allDelivered = order.orderItems.every(i => i.itemStatus === "Delivered");
        if (allDelivered) {
          order.orderStatus = "Delivered";
          order.isDelivered = true;
          order.deliveredAt = Date.now();
        }

        await order.save();
        res.json(order);
      } else {
        res.status(404).json({ message: "Order item not found" });
      }
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
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
};
