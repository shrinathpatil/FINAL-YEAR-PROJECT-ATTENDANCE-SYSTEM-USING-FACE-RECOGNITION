import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentClass: null,
  classId: null,
  loading: false,
};

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    setCurrentClass: (state, action) => {
      state.currentClass = action.payload;
    },
    addStudents: (state, action) => {
      state.currentClass.students = [
        state.currentClass.students,
        ...action.payload,
      ];
    },
    setClassId: (state, action) => {
      state.classId = action.payload;
    },
  },
});

export const { setCurrentClass, setClassId, addStudents } = classSlice.actions;

export default classSlice.reducer;
