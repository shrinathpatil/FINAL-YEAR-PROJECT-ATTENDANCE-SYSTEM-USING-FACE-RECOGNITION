import React, { useState } from "react";
import "./TimeTables.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { Loader } from "../../components";
import { useNavigate } from "react-router-dom";
import { ImBin } from "react-icons/im";
import { toast } from "react-hot-toast";
const TimeTables = () => {
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState(null);
  const { isLoading, isError, data, refetch } = useQuery({
    queryKey: ["timeTables"],
    queryFn: async () => {
      const {
        data: { success, timetables },
      } = await axios.get(`${BASE_URL}/timetables`);
      if (success) {
        return timetables;
      }
    },
  });

  const deleteTimeTable = async () => {
    try {
      const {
        data: { success, message },
      } = await axios.delete(`${BASE_URL}/timetable/delete/${activeTable._id}`);

      if (success) {
        toast.success(message);
        setActiveTable(null);
        refetch();
      }
    } catch (e) {
      console.log(e);
      toast.error(e.response.data.message);
    }
  };

  console.log("data=>", data);
  return (
    <div className="timetable__page">
      <div className="tt__container">
        <div className="tt__sidebar">
          <ul className="list">
            <li
              className="add__tt"
              onClick={() => navigate("/create/time-table")}
            >
              Add
            </li>
            {isLoading ? (
              <Loader />
            ) : (
              !isError &&
              data.map((item) => (
                <li
                  key={item._id}
                  onClick={() => setActiveTable(item)}
                  className={
                    activeTable
                      ? activeTable.roomNo === item.roomNo
                        ? "list__item active"
                        : "list__item"
                      : "list__item"
                  }
                >
                  Room : {item.roomNo}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="tt__main__container">
          {activeTable && (
            <div className="tt__main__con">
              <button className="delete__btn" onClick={deleteTimeTable}>
                <ImBin className="icon" />
              </button>
              <ul className="periods">
                <li className="period day">Mon</li>
                {activeTable.Mon.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>

              <ul className="periods">
                <li className="period day">Tue</li>
                {activeTable.Tue.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>
              <ul className="periods">
                <li className="period day">Wed</li>
                {activeTable.Wed.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>
              <ul className="periods">
                <li className="period day">Thu</li>
                {activeTable.Thu.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>
              <ul className="periods">
                <li className="period day">Fri</li>
                {activeTable.Fri.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>
              <ul className="periods">
                <li className="period day">Sat</li>
                {activeTable.Sat.map((p, i) => (
                  <li className="period">
                    <p>{p.class.className}</p>
                    <small>
                      {p.startTime} - {p.endTime}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTables;
