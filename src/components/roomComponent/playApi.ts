import { baseApi } from "../../shared/baseApi";
import { socketManager } from "../../shared/socketManager";
import type { Question, StartGameResponce, Team } from "../../shared/types";

export const playApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        initStartGame: builder.query<StartGameResponce, number>({
            query: (roomId) => ({
                url: `/init_start_game/${roomId}`,
                method: 'GET'
            }),

            async onCacheEntryAdded(
                _arg,
                { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
            ) {
                await cacheDataLoaded;

                const socket =
                    socketManager.getSocket() || socketManager.connect();

                const onGameStarted = (data: {
                    status: 'waiting' | 'playing'
                    currentQuestion: Question
                }) => {
                    updateCachedData((draft) => {
                        if (!draft.ok) {
                            return;
                        }

                        draft.data.status = data.status;
                        draft.data.currentQuestion = data.currentQuestion
                    })
                }

                const onCheck_answer = (data: {
                    ok: boolean
                    team: Team | null
                    currentQuestion: Question
                }) => {
                    updateCachedData((draft) => {
                        if (!draft.ok) {
                            return;
                        }

                        data.team && draft.data.count[data.team]++;
                        draft.data.currentQuestion = data.currentQuestion
                    })
                }


                socket.on('game_started', onGameStarted);
                socket.on('check_answer', onCheck_answer);

                await cacheEntryRemoved;

                socket.off('game_started', onGameStarted);
                socket.off('check_answer', onCheck_answer);
                socketManager.disconnect();
            }
        })
    })
})