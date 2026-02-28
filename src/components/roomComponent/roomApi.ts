import { baseApi } from "../../shared/baseApi";
import type { getRoomType, RoomInfo_Creator, RoomInfo_Participant } from "../../shared/types";

export const roomApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRoomForParticipant: builder.mutation<RoomInfo_Participant, getRoomType>({
            query: ({ role, roomId }) => ({
                url: '/get_room_for_participant',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, roomId })
            })
        }),
        getRoomForCreator: builder.mutation<RoomInfo_Creator, getRoomType>({
            query: ({ role, roomId }) => ({
                url: '/get_room_for_creator',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, roomId })
            })
        }),
    }),
});