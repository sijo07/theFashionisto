import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),

    getProfile: builder.query({
      query: () => `${USERS_URL}/profile`,
      keepUnusedDataFor: 5,
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile/password`,
        method: "PUT",
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: () => `${USERS_URL}`,
      providesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getUserDetails: builder.query({
      query: (userId) => `${USERS_URL}/${userId}`,
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `${USERS_URL}/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUserReviewedProducts: builder.query({
      query: () => `${USERS_URL}/user/reviewed-products`,
    }),

    createUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/create-by-admin`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useCreateUserMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useGetUserReviewedProductsQuery,
} = userApiSlice;
