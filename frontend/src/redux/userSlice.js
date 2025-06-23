import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // will hold { id, username, email, cfUsername, profilePic }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload; // payload is the user object
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('token');
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
