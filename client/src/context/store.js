import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import classReducer from "./currClass";
import editReducer from "./edit";
const store = configureStore({
  reducer: {
    auth: authReducer,
    currClass: classReducer,
    edit: editReducer,
  },
});

export default store;
