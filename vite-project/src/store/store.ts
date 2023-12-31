// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ipolistReducer from './ipoSlice';


const store = configureStore({
    reducer: {
        auth: authReducer,
        // add other reducers here
        ipolist: ipolistReducer
    },
});

export default store;

// Define RootState type for useSelector
export type RootState = ReturnType<typeof store.getState>;
