import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { GiTeacher } from "react-icons/gi";
import { MdClass } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { BASE_URL } from "../../utils/url";
import "./AutoAttendance.scss";
const AutoAttendance = () => {
  const videoConstraints = {
    facingMode: "user",
  };
  const navigate = useNavigate();

  const webCamRef = useRef();
  const [presentStudents, setPresentStudents] = useState([]);
  const [className, setClassName] = useState(null);
  const [classTeacher, setClassTeacher] = useState(null);
  const [startBtn, setStartBtn] = useState(null);
  const [timeTable, setTimeTable] = useState([]);
  const [period, setPeriod] = useState(null);
  const [detectInterval, setDetectInterval] = useState(null);
  const [start, setStart] = useState(null);
  const [prev, setPrev] = useState(-1);
  const [currentTime, setCurrentTime] = useState("");
  // console.log("prev=>", prev);
  // // console.log("timeTable=>", timeTable);
  // // console.log("startBtn=>", startBtn);

  console.log("className=>", className);
  console.log("classTeacher=>", classTeacher);
  console.log("period=>", period);
  console.log("presentStudents=>", presentStudents);
  console.log("start=>", start);
  console.log("currentTime=>", currentTime);

  useEffect(() => {
    const getTodayTimeTable = async () => {
      try {
        const room = Number(localStorage.getItem("room__no"));

        const {
          data: { success, timeTable },
        } = await axios.get(`${BASE_URL}/timetable/${room}`);

        if (success) {
          setTimeTable(timeTable);
        }
      } catch (e) {
        console.log(e);
        toast.error(e.response.data.message);
      }
    };
    getTodayTimeTable();
  }, [1]);
  // console.log(timeTable);
  useEffect(() => {
    const periodInterval = setInterval(() => {
      const date = new Date();
      const time = date.toTimeString().split(" ")[0];
      // console.log("currentTime", time);
      setCurrentTime(time);
    }, 1000 * 15);
    return () => clearInterval(periodInterval);
  }, [timeTable]);

  // useEffect(() => {
  //   const markAttendance = async () => {
  //     if (period) {
  //       const prevIdx = timeTable.findIndex(
  //         (item) =>
  //           item.startTime === period.startTime &&
  //           item.endTime === period.endTime
  //       );
  //       if (prevIdx === 0) {
  //         setPrev(0);
  //       } else {
  //         setPrev(prevIdx);
  //         const prevPeriod = timeTable[prevIdx - 1];
  //         try {
  //           console.log("stopDetecting...");
  //           const {
  //             data: { success: stop_detect, message },
  //           } = await axios.post(`${BASE_URL}/attendance/stop`);
  //           console.log(stop_detect);
  //           if (stop_detect) {
  //             const doc = {
  //               time: prevPeriod.startTime,
  //               date: date.toDateString(),
  //               presentStudents,
  //             };

  //             const {
  //               data: { success: add_success },
  //             } = await axios.put(`${BASE_URL}/attendance/add`, {
  //               classId: prevPeriod.classId,
  //               data: doc,
  //             });
  //             console.log(add_success);

  //             if (add_success) {
  //               setPresentStudents([]);
  //               console.log("attendance added !");
  //             }
  //           }
  //         } catch (e) {
  //           console.log(e);
  //         }
  //       }
  //     } else {
  //       const prevPeriod = timeTable[prev];
  //       try {
  //         console.log("stopDetecting...");
  //         const {
  //           data: { success: stop_detect, message },
  //         } = await axios.post(`${BASE_URL}/attendance/stop`);
  //         console.log(stop_detect);
  //         if (stop_detect) {
  //           const doc = {
  //             time: prevPeriod.startTime,
  //             date: date.toDateString(),
  //             presentStudents,
  //           };

  //           const {
  //             data: { success: add_success },
  //           } = await axios.put(`${BASE_URL}/attendance/add`, {
  //             classId: prevPeriod.classId,
  //             data: doc,
  //           });
  //           console.log(add_success);

  //           if (add_success) {
  //             setPresentStudents([]);
  //             console.log("attendance added !");
  //           }
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //   };
  // }, [period]);

  useEffect(() => {
    const selectPeriod = async () => {
      if (period) {
        if (currentTime > period.endTime) {
          await stopDetect();
        }
      }

      const p = timeTable.find(
        (item) => item.startTime <= currentTime && item.endTime > currentTime
      );
      // console.log("p->", p);
      if (p) {
        // console.log("period->", period);
        if (period) {
          const check =
            p.startTime === period.startTime && p.endTime === period.endTime;
          if (!check) {
            setPeriod(p);
          }
        } else {
          setPeriod(p);
        }
      } else {
        setPeriod(null);
      }
    };
    currentTime && selectPeriod();
  }, [currentTime]);

  useEffect(() => {
    const setUp = async () => {
      try {
        setClassName(period.class);
        setClassTeacher(period.user);

        const {
          data: { success: start_success, message },
        } = await axios.post(`${BASE_URL}/attendance/start`, {
          className: period.class.className,
        });
        if (start_success) {
          setStart(period.startTime);
        }
      } catch (e) {
        console.log(e);
      }
    };

    if (period) {
      setUp();
    } else {
      setStart(null);
    }
  }, [period]);

  useEffect(() => {
    const startDetecting = () => {
      const detect_interval = setInterval(async () => {
        const imageSrc = webCamRef.current.getScreenshot();
        const {
          data: { success: detect_success, detected },
        } = await axios.post(`${BASE_URL}/attendance/detect`, {
          img: imageSrc,
          id: className.classId,
        });

        if (detect_success) {
          setPresentStudents(detected);
        }
      }, 3000);
      setDetectInterval(detect_interval);
    };
    if (start) {
      startDetecting();
    } else {
      clearInterval(detectInterval);
    }
  }, [start]);

  const stopDetect = async () => {
    try {
      clearInterval(detectInterval);
      console.log("stopDetecting...");
      const {
        data: { success: stop_detect, message },
      } = await axios.post(`${BASE_URL}/attendance/stop`);
      console.log(stop_detect);
      if (stop_detect) {
        let d = new Date();

        d = d.toLocaleDateString().split("/");
        let date = `${d[1]}/${d[0]}/${d[2]}`;
        const doc = {
          time: period.startTime,
          date: date,
          presentStudents,
        };

        const {
          data: { success: add_success },
        } = await axios.put(`${BASE_URL}/attendance/add`, {
          classId: period.class.classId,
          data: doc,
        });
        console.log(add_success);

        if (add_success) {
          setPresentStudents([]);
          console.log("attendance added !");
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const stop = async () => {
    clearInterval(detectInterval);
    navigate("/");
  };

  return (
    <div className="auto__page">
      <div className="ap__top">
        <div className="class__name">
          <MdClass className="icon" />
          <label htmlFor="" className="">
            {className ? className.className : "Class"}
          </label>
        </div>
        <button onClick={stop}>Stop</button>
        <div className="class__teacher">
          <GiTeacher className="icon" />
          <label htmlFor="" className="">
            {classTeacher ? classTeacher.userName : "Teacher"}
          </label>
        </div>
      </div>
      <div className="ap__bottom">
        <Webcam
          className="ap__video"
          audio={false}
          ref={webCamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          videoConstraints={videoConstraints}
        />
      </div>
    </div>
  );
};

export default AutoAttendance;
