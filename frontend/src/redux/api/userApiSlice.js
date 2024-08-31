import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { USERS_URL } from "../constants";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: USERS_URL }),
  endpoints: (builder) => ({
    
    login: builder.mutation({
      query: (data) => ({
        url: `/auth`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `/logout`,
        method: "POST",
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `/profile/password`,
        method: "PUT",
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: () => "/",
      providesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getUserDetails: builder.query({
      query: (userId) => `/${userId}`,
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUserReviewedProducts: builder.query({
      query: () => `/user/reviewed-products`,
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useGetUserReviewedProductsQuery,
} = userApiSlice;
