import { baseApi } from "../../shared/baseApi";
import type { CreateInfo, ResponceStartModal } from "../../shared/types";


export const startWindowApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        check_pincode: builder.mutation<ResponceStartModal, number>({
            query: (pincode) => ({
                url: '/check_pincode',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode })
            })
        }),
        create_room: builder.mutation<ResponceStartModal, CreateInfo>({
            query: (creatorInfo) => ({
                url: '/create_room',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creatorInfo)
            })
        })
    }),
})
