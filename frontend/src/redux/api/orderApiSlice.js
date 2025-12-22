import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYPAL_URL } from "../constants";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to create a new order
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    // Endpoint to fetch order details by ID
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
    }),

    // Endpoint to pay for an order
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: details,
      }),
    }),

    // Endpoint to fetch PayPal client ID
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
    }),

    // Endpoint to get orders for the authenticated user
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5, // Adjust this value based on your use case
    }),

    // Endpoint to get all orders (admin only)
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
    }),

    // Endpoint to mark an order as delivered
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    // Endpoint to count total orders
    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`,
    }),

    // Endpoint to calculate total sales
    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`,
    }),

    // Endpoint to calculate total sales by date
    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`,
    }),
    // Endpoint to update order status
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${ORDERS_URL}/${orderId}/status`,
        method: "PUT",
        body: { status },
      }),
    }),
    updateOrderItemStatus: builder.mutation({
      query: ({ orderId, itemId, status }) => ({
        url: `${ORDERS_URL}/${orderId}/items/${itemId}/status`,
        method: "PUT",
        body: { status },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,
} = orderApiSlice;
