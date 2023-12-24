// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: User | null;
    // other state properties
}

interface User {
    _id: string;
    name: string;
    count :string;
}

const initialState: AuthState = {
    user: null,
    // other initial state properties
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        // other reducers
    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
