import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currUser: null,
  isLogged: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginFailed: (state) => {
      state.isLoading = false;
      state.isLogged = false;
    },
    loginSuccess: (state, action) => {
      state.currUser = action.payload;
      state.isLogged = true;
      state.isLoading = false;
    },
    logOut: (state, action) => {
      state.currUser = null;
      state.isLogged = false;
    },
  },
});

export const { logOut, loginStart, loginSuccess, loginFailed } =
  authSlice.actions;

export default authSlice.reducer;
