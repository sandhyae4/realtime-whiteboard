import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const whiteboardApi = createApi({
  reducerPath: "whiteboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken;
      if (token) headers.set("Authorization", "Bearer " + token);
      return headers;
    },
  }),
  tagTypes: ["Room", "Stroke"],
  endpoints: (builder) => ({
    register: builder.mutation({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    login: builder.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    logout: builder.mutation({ query: () => ({ url: "/auth/logout", method: "POST" }) }),
    getMe: builder.query({ query: () => "/auth/me", providesTags: ["User"] }),
    refreshToken: builder.mutation({ query: (body) => ({ url: "/auth/refresh", method: "POST", body }) }),

    getRooms: builder.query({ query: () => "/rooms", providesTags: ["Room"] }),
    getRoom: builder.query({ query: (id) => "/rooms/" + id, providesTags: (r, e, id) => [{ type: "Room", id }] }),
    createRoom: builder.mutation({
      query: (body) => ({ url: "/rooms", method: "POST", body }),
      invalidatesTags: ["Room"],
    }),
    joinRoom: builder.mutation({
      query: (inviteCode) => ({ url: "/rooms/join/" + inviteCode, method: "GET" }),
      invalidatesTags: ["Room"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: "/rooms/" + id, method: "DELETE" }),
      invalidatesTags: ["Room"],
    }),
    clearCanvas: builder.mutation({
      query: (id) => ({ url: "/rooms/" + id + "/clear", method: "POST" }),
      invalidatesTags: (r, e, id) => [{ type: "Stroke", id }],
    }),
    getInviteLink: builder.query({ query: (id) => "/rooms/" + id + "/invite" }),
    sendInvite: builder.mutation({
      query: ({ roomId, email }) => ({ url: "/rooms/" + roomId + "/invite/send", method: "POST", body: { email } }),
    }),
    getTopRooms: builder.query({ query: () => "/rooms/top" }),
    getStrokes: builder.query({
      query: (roomId) => "/rooms/" + roomId + "/strokes",
      providesTags: (r, e, id) => [{ type: "Stroke", id }],
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useLogoutMutation,
  useGetMeQuery, useRefreshTokenMutation,
  useGetRoomsQuery, useGetRoomQuery, useCreateRoomMutation,
  useJoinRoomMutation, useDeleteRoomMutation, useClearCanvasMutation,
  useGetInviteLinkQuery, useSendInviteMutation,
  useGetTopRoomsQuery, useGetStrokesQuery,
} = whiteboardApi;
