import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "./types";

type RoleState = {
    role: Role | "";
};

const initialState: RoleState = {
    role: "",
};

export const roleSlice = createSlice({
    name: "role",
    initialState,
    selectors: {
        getRole: (state) => state.role,
    },
    reducers: {
        setRole: (state, action: PayloadAction<Role>) => {
            state.role = action.payload;
        },
    },
});

export const { setRole } = roleSlice.actions;
export const { getRole } = roleSlice.selectors;
