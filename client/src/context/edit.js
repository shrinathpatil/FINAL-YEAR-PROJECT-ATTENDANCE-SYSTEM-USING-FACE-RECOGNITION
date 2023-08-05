import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openAddClass: false,
  openAddStudent: false,
  openEditAttendance: false,
  editData: null,
};

const editSlice = createSlice({
  name: "edit",
  initialState,
  reducers: {
    setAddClass: (state, action) => {
      state.openAddClass = action.payload;
    },
    setAddStudent: (state, action) => {
      state.openAddStudent = action.payload;
    },
    setEditAttendance: (state, action) => {
      state.openEditAttendance = action.payload;
    },
    setData: (state, action) => {
      state.editData = action.payload;
    },
  },
});

export const { setAddClass, setAddStudent, setEditAttendance, setData } =
  editSlice.actions;

export default editSlice.reducer;
