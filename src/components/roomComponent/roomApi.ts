import { baseApi } from "../../shared/baseApi";
import { socketManager } from "../../shared/socketManager";
import type { getRoomType, Participant, RoomInfo, Team } from "../../shared/types";

export const roomApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRoomInfo: builder.query<RoomInfo, getRoomType>({
            query: ({ role, roomId }) => ({
                url: '/get_room',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, roomId })
            }),

            async onCacheEntryAdded(arg, {
                cacheDataLoaded, cacheEntryRemoved, updateCachedData
            }) {
                try {
                    await cacheDataLoaded;
                } catch {
                    return;
                }

                const socket = socketManager.connect(); 
                socket.emit("join_room", arg);

                const onRoomJoined = (data: { participants: Participant[]; team: Team }) => {
                    updateCachedData((draft) => {
                        if (!draft.ok) {
                            return;
                        }

                        draft.data.participantsCount = data.participants.length;

                        if ("participants" in draft.data) {
                            draft.data.participants = data.participants;
                        }

                        if ("team" in draft.data) {
                            draft.data.team = data.team;
                        }
                    })
                };

                const onUserJoined = (data: Participant[]) => {
                    updateCachedData((draft) => {
                        if (!draft.ok) {
                            return;
                        }

                        draft.data.participantsCount = data.length;

                        if ("participants" in draft.data) {
                            draft.data.participants = data;
                        }
                    });
                };

                const onMessage = (data: { roomId: number; team: Team | 'creator'; message: string }) => {
                    updateCachedData((draft) => {
                        if (!draft.ok) {
                            return;
                        }

                        draft.data.messages.push(data);
                    })
                };

                socket.on("room_joined", onRoomJoined);
                socket.on("user_joined", onUserJoined);
                socket.on("user_left", onUserJoined);
                socket.on('message', onMessage);

                await cacheEntryRemoved;
                socket.off("room_joined", onRoomJoined);
                socket.off("user_joined", onUserJoined);
                socket.off("user_left", onUserJoined);
                socket.off("message", onMessage);

                socket.disconnect();
            }
        })
    }),
});
