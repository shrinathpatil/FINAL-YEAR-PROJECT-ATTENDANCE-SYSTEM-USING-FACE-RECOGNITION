import React, { useState } from "react";
import "./AddTimeTable.scss";
import { BsDoorOpenFill, BsDatabaseAdd } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { CiCircleRemove, CiClock1, CiClock2 } from "react-icons/ci";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const AddTimeTable = () => {
  const navigate = useNavigate();

  const [roomNo, setRoomNo] = useState(null);
  const [monPeriods, setMonPeriods] = useState([]);
  const [tuePeriods, setTuePeriods] = useState([]);
  const [wedPeriods, setWedPeriods] = useState([]);
  const [thuPeriods, setThuPeriods] = useState([]);
  const [friPeriods, setFriPeriods] = useState([]);
  const [satPeriods, setSatPeriods] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState({
    day: "",
    class: {
      className: "",
      classId: "",
    },
    user: {
      userName: "",
      userId: "",
    },
    startTime: "",
    endTime: "",
  });

  console.log(monPeriods);

  const { isLoading, isError, data, refetch } = useQuery({
    queryKey: ["getClasses"],
    queryFn: async () => {
      const {
        data: { success, classes },
      } = await axios.get(`${BASE_URL}/classes/all`);
      return classes;
    },
  });
  console.log(data);

  const openAdd = (day) => {
    setCurrentPeriod({ ...currentPeriod, day });
    setShowAdd(true);
  };

  const addCurrentPeriod = () => {
    if (!currentPeriod.class.className) {
      return toast.error("Please select a class");
    }
    if (!currentPeriod.startTime) {
      return toast.error("Please give a start time");
    }
    if (!currentPeriod.endTime) {
      return toast.error("Please give a end time");
    }

    switch (currentPeriod.day) {
      case "Mon":
        setMonPeriods([...monPeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;

      case "Tue":
        setTuePeriods([...tuePeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;
      case "Wed":
        setWedPeriods([...wedPeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;
      case "Thu":
        setThuPeriods([...thuPeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;
      case "Fri":
        setFriPeriods([...friPeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;
      case "Sat":
        setSatPeriods([...satPeriods, currentPeriod]);
        setCurrentPeriod({
          day: "",
          class: {
            className: "",
            classId: "",
          },
          user: {
            userName: "",
            userId: "",
          },
          startTime: "",
          endTime: "",
        });
        setShowAdd(false);
        break;
    }
  };

  const addItem = (id) => {
    if (id === -1) {
      return;
    }
    const cl = data.find((i) => i._id === id);
    setCurrentPeriod({
      ...currentPeriod,
      class: { className: cl.className, classId: cl._id },
      user: { userName: cl.userName, userId: cl.userId },
    });
  };

  const removeItem = (day, index) => {
    switch (day) {
      case "Mon":
        setMonPeriods(monPeriods.filter((item, i) => i !== index));
        break;
      case "Tue":
        setTuePeriods(tuePeriods.filter((item, i) => i !== index));
        break;
      case "Wed":
        setWedPeriods(wedPeriods.filter((item, i) => i !== index));
        break;
      case "Thu":
        setThuPeriods(thuPeriods.filter((item, i) => i !== index));
        break;
      case "Fri":
        setFriPeriods(friPeriods.filter((item, i) => i !== index));
        break;
      case "Sat":
        setSatPeriods(satPeriods.filter((item, i) => i !== index));
        break;
    }
    toast.success("Period removed successfully!");
  };

  const saveTT = async () => {
    if (!roomNo) {
      return toast.error("Please enter a room number");
    }

    if (
      !monPeriods.length &&
      !tuePeriods.length &&
      !wedPeriods.length &&
      !satPeriods.length &&
      !thuPeriods.length &&
      !friPeriods.length
    ) {
      return toast.error("All periods cannot be empty!");
    }
    try {
      const body = {
        roomNo,
        Mon: monPeriods,
        Tue: tuePeriods,
        Wed: wedPeriods,
        Thu: thuPeriods,
        Fri: friPeriods,
        Sat: satPeriods,
      };

      const {
        data: { success, message },
      } = await axios.post(`${BASE_URL}/timetables/create`, body);

      if (success) {
        toast.success(message);
        navigate("/time-tables");
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message);
    }
  };

  console.log(currentPeriod);
  return (
    <div className="add_tt__page">
      <div className="add__container">
        <div className="add__tt__top">
          <BsDoorOpenFill className="icon" /> <label>Room No:</label>
          <input
            type="number"
            required
            className=""
            placeholder="Room no"
            onChange={(e) => setRoomNo(e.target.value)}
          />
          <button className="add__tt" onClick={saveTT}>
            Save Time Table
          </button>
        </div>
        <div className="add__tt__bottom">
          <ul className="days">
            <li className="day">Mon</li>
            {monPeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Mon", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Mon")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
          <ul className="days">
            <li className="day">Tue</li>
            {tuePeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Tue", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Tue")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
          <ul className="days">
            <li className="day">Wed</li>
            {wedPeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Wed", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Wed")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
          <ul className="days">
            <li className="day">Thu</li>
            {thuPeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Thu", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Thu")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
          <ul className="days">
            <li className="day">Fri</li>
            {friPeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Fri", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Fri")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
          <ul className="days">
            <li className="day">Sat</li>
            {satPeriods.map((item, i) => (
              <li key={i}>
                <span>
                  <p>{item.class.className}</p>
                  <small>
                    {item.startTime} - {item.endTime}
                  </small>
                </span>
                <CiCircleRemove
                  onClick={() => removeItem("Sat", i)}
                  className="remove__icon"
                />
              </li>
            ))}
            <li className="add" onClick={() => openAdd("Sat")}>
              <BsDatabaseAdd className="add__icon" />
            </li>
          </ul>
        </div>
      </div>
      <div
        className="add__tt__class"
        style={{ transform: `translateX(${showAdd ? 0 : 100}%)` }}
      >
        <span>
          <IoMdClose onClick={() => setShowAdd(false)} className="icon" />
        </span>
        <h3>{currentPeriod.day}</h3>
        <div className="input">
          <label>Select Class :</label>
          <select onChange={(e) => addItem(e.target.value)}>
            <option value={-1}>select class</option>
            {data &&
              data.map((item, i) => (
                <option value={item._id} key={item._id}>
                  {item.className}
                </option>
              ))}
          </select>
        </div>
        <div className="input">
          <CiClock1 className="icon" />
          <input
            type="text"
            className=""
            onChange={(e) =>
              setCurrentPeriod({ ...currentPeriod, startTime: e.target.value })
            }
            value={currentPeriod.startTime}
            placeholder="Start Time (HH:MM:SS)"
          />
        </div>

        <div className="input">
          <CiClock2 className="icon" />
          <input
            type="text"
            className=""
            value={currentPeriod.endTime}
            onChange={(e) =>
              setCurrentPeriod({ ...currentPeriod, endTime: e.target.value })
            }
            placeholder="End Time (HH:MM:SS)"
          />
        </div>
        <button onClick={addCurrentPeriod}>
          <HiOutlineViewGridAdd className="icon" />
        </button>
      </div>
    </div>
  );
};

export default AddTimeTable;
