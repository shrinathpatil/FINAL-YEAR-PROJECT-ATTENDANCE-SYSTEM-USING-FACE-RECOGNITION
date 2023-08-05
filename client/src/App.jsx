import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components";
import { loginFailed, loginSuccess } from "./context/authSlice";
import {
  AddTimeTable,
  Attendance,
  AutoAttendance,
  Home,
  Login,
  Register,
  TimeTables,
} from "./pages";
import { BASE_URL } from "./utils/url";

const App = () => {
  const client = new QueryClient();
  const dispatch = useDispatch();
  const { isLogged } = useSelector((state) => state.auth);

  useEffect(() => {
    const getUser = async () => {
      const userId = localStorage.getItem("currUser__id");
      if (userId) {
        const {
          data: { success, user },
        } = await axios.get(`${BASE_URL}/auth/me/${userId}`);
        if (success) {
          dispatch(loginSuccess(user));
        } else {
          dispatch(loginFailed());
        }
      } else {
        dispatch(loginFailed());
      }
    };
    getUser();
  }, []);
  return (
    <BrowserRouter>
      <QueryClientProvider client={client}>
        <Toaster position="top-right" reverseOrder={false}></Toaster>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              isLogged === false ? <Navigate to={"/register"} /> : <Home />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={isLogged === true ? <Navigate to="/" /> : <Login />}
          />
          <Route path="/attendance/:cid" element={<Attendance />} />
          <Route path="/auto" element={<AutoAttendance />} />
          <Route path="/time-tables" element={<TimeTables />} />
          <Route path="/create/time-table" element={<AddTimeTable />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
