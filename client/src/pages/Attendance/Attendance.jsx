import React, { useRef, useState } from "react";
import "./Attendance.scss";
import { useSelector } from "react-redux";
import Webcam from "react-webcam";
import { BsClockHistory } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import toast from "react-hot-toast";
import { Loader } from "../../components";
const Attendance = () => {
  const { currentClass } = useSelector((state) => state.currClass);
  const [time, setTime] = useState("");
  const [start, setStart] = useState({ start: false, stop: false });
  const [presentStudents, setPresentStudents] = useState([]);
  const [inter, setInter] = useState(null);
  const navigate = useNavigate();

  const params = useParams();

  const videoConstraints = {
    facingMode: "user",
  };
  const webCamRef = useRef();

  const startAttendance = async () => {
    if (!start.start) {
      try {
        const {
          data: { success, message },
        } = await axios.post(`${BASE_URL}/attendance/start`, {
          className: currentClass.className,
        });
        if (success) {
          toast.success(message);
          setTimeout(() => {
            startDetecting();
          }, 1000);
        }

        setStart({ start: true, stop: false });
      } catch (e) {
        toast.error(e.response.data.message);
      }
    } else {
      clearInterval(inter);
      try {
        const {
          data: { success, message },
        } = await axios.post(`${BASE_URL}/attendance/stop`);
        if (success) {
          toast.success(message);
        }
        setStart({ start: false, stop: true });
      } catch (e) {
        toast.error(e.response.data.message);
      }
    }
  };

  const handleAttendance = async () => {
    if (start.start) {
      toast.error("Stop taking the attendance First.");
      return;
    }
    if (!start.stop) {
      toast.error("Start taking the attendance First.");
      return;
    }
    if (!time) {
      return toast.error("Please mention the Time.");
    }

    try {
      let d = new Date();
      d = d.toLocaleDateString().split("/");
      let date = `${d[1]}/${d[0]}/${d[2]}`;
      const doc = {
        time,
        date,
        presentStudents,
      };
      const {
        data: { success, message },
      } = await axios.put(`${BASE_URL}/attendance/add`, {
        classId: currentClass._id,
        data: doc,
      });

      if (success) {
        toast.success(message);
        navigate("/");
      }
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  const startDetecting = () => {
    const interval = setInterval(async () => {
      const imageSrc = webCamRef.current.getScreenshot();

      const res = await axios.post(`${BASE_URL}/attendance/detect`, {
        img: imageSrc,
        id: currentClass._id,
      });

      if (res.data.success) {
        setPresentStudents(res.data.detected);
      }
    }, 3000);
    setInter(interval);
  };

  return (
    <div className="attendance__page">
      <div className="attendance__container">
        <div className="ap__left">
          <div>
            <h3 className="">Class Name</h3>
            <p>{currentClass.className} </p>
          </div>

          <div>
            <h3 className="">Class Time</h3>

            <div className="time__input">
              <BsClockHistory className="icon" />
              <input
                type="text"
                className=""
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time   (AM/PM)"
              />
            </div>
          </div>
          <div>
            {start.start ? (
              <div className="loader">
                <Loader />
              </div>
            ) : (
              <button onClick={handleAttendance} className="attendance__btn">
                Mark Attendance
              </button>
            )}
            <button
              onClick={startAttendance}
              className={start.start ? "start__btn on" : "start__btn"}
            >
              {start.start ? "Stop" : "Start"}
            </button>
          </div>
        </div>
        <div className="ap__center">
          <Webcam
            className="attendance__video"
            audio={false}
            ref={webCamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={videoConstraints}
          />
        </div>
        <div className="ap__right">
          <label>Present Students</label>
          <ul>
            {Array.from(presentStudents).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
