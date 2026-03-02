import { baseApi } from "../../shared/baseApi";
import type { StartGameResponce } from "../../shared/types";

export const playApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        initStartGame: builder.query<StartGameResponce, number>({
            query: (roomId) => ({
                url: `/init_start_game/${roomId}`,
                method: 'GET'
            })
        })
    })
})