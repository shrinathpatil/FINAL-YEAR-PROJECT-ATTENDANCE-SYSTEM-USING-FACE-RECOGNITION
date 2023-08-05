import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { MdOutlineClass } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import img from "../../assets/robot.gif";
import { AddClass, AddStudent, Edit, Loader, Table } from "../../components";
import { logOut } from "../../context/authSlice";
import { setClassId, setCurrentClass } from "../../context/currClass";
import { setAddClass, setAddStudent } from "../../context/edit";
import { BASE_URL } from "../../utils/url";
import "./Home.scss";
const Home = () => {
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const { currUser } = useSelector((state) => state.auth);
  const { openAddClass, openEditAttendance, openAddStudent } = useSelector(
    (state) => state.edit
  );
  const [showRooms, setShowRooms] = useState(false);
  const { currentClass, classId } = useSelector((state) => state.currClass);

  useEffect(() => {
    const createData = async () => {
      const data = [];
      let firstLine = [];
      firstLine.push("Enrollment no.");
      firstLine.push("FirstName");
      currentClass.attendance.map((a) => {
        firstLine.push(`${a.date} ${a.time}`);
      });
      data.push(firstLine);

      currentClass.students.forEach((s) => {
        const line = [];
        line.push(s.enroll);
        line.push(s.name);
        currentClass.attendance.forEach((a) => {
          if (a.presentStudents.includes(s.enroll)) {
            line.push("Present");
          } else {
            line.push("Absent");
          }
        });
        data.push(line);
      });

      setCsvFile(data);
    };
    currentClass && createData();
  }, [currentClass]);

  const {
    isLoading: loadingClasses,
    isError: classError,
    data: classes,
    refetch,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const {
        data: { success, classes },
      } = await axios.get(`${BASE_URL}/users/classes/${currUser?._id}`);

      if (success) {
        return classes;
      }
      return [];
    },
  });

  const { isLoading, isError, data } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const {
        data: { success, timetables },
      } = await axios.get(`${BASE_URL}/timetables`);
      if (success) {
        return timetables;
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [currUser?._id, openAddClass, openAddStudent]);

  const logout = () => {
    localStorage.removeItem("currUser__id");
    dispatch(setCurrentClass(null));
    dispatch(setClassId(null));
    dispatch(logOut());
    navigate("/login");
  };

  const gotoAuto = () => {
    const room = localStorage.getItem("room__no");
    if (room) {
      navigate("/auto");
    } else {
      toast.error("To use auto mode, select a time Table first.");
    }
  };

  return (
    <div className="home__page">
      <div className="home__container">
        <div className="home__sidebar">
          <button
            className="add__class"
            onClick={() => dispatch(setAddClass(true))}
          >
            Create Class <MdOutlineClass className="icon" />
          </button>
          <div className="class__list">
            {loadingClasses ? (
              <Loader />
            ) : (
              !classError && (
                <ul>
                  {classes && classes.length > 0 ? (
                    classes.map((item) => (
                      <li
                        className={classId === item._id ? "active" : undefined}
                        onClick={() => dispatch(setClassId(item._id))}
                        key={item._id}
                      >
                        {item.className}
                      </li>
                    ))
                  ) : (
                    <li>No class created yet!</li>
                  )}
                </ul>
              )
            )}
          </div>
          <div className="user" onClick={() => setShowOptions(!showOptions)}>
            <FaUserCircle className="icon" />
            {showOptions && (
              <div className="options">
                <h3>{currUser?.name}</h3>
                <p>{currUser?.email}</p>
                <button onClick={logout}>LogOut</button>
              </div>
            )}
          </div>
        </div>
        <div className="home__main__container">
          {classId && (
            <>
              <div className="btns">
                <button className="auto__mode" onClick={gotoAuto}>
                  Auto Mode
                </button>
                <button
                  className="set__Timetable"
                  onClick={() => setShowRooms(true)}
                >
                  Set Time-Table
                </button>
                <button
                  className="show__tt"
                  onClick={() => navigate("/time-tables")}
                >
                  show time-tables
                </button>
                {csvFile && (
                  <CSVLink
                    filename={`${currentClass.className}- Attendance.csv`}
                    data={csvFile}
                    className="csv__link"
                  >
                    Get Excel Sheet
                  </CSVLink>
                )}
                <button
                  className="add__student"
                  onClick={() => dispatch(setAddStudent(true))}
                >
                  Add student
                </button>
                <button
                  className="take__attendance"
                  onClick={() => navigate(`/attendance/${classId}`)}
                >
                  Take Attendance
                </button>
                <FiRefreshCcw className="icon" onClick={() => refetch()} />
              </div>
              <Table />
            </>
          )}
          {!classId && <img src={img} alt="" className="" />}
        </div>
      </div>
      <div
        className="set__tt"
        style={{ transform: `translateY(-${showRooms ? 0 : 100}%)` }}
      >
        <ul className="rooms">
          <IoCloseOutline
            className="icon"
            onClick={() => setShowRooms(false)}
          />
          {data &&
            data.map((item, i) => (
              <li
                className="room"
                onClick={() => {
                  localStorage.setItem("room__no", item.roomNo);
                  setShowRooms(false);
                }}
                key={item._id}
              >
                Room no: {item.roomNo}
              </li>
            ))}
        </ul>
      </div>
      {<AddClass />}
      {<AddStudent />}
      {openEditAttendance && <Edit />}
    </div>
  );
};

export default Home;
