import React, { useRef, useState } from "react";
import "./Login.scss";
import Webcam from "react-webcam";
import { CgProfile } from "react-icons/cg";
import { MdOutlineEmail } from "react-icons/md";
import { FiChevronLeft } from "react-icons/fi";
import { BsArrowRightCircleFill } from "react-icons/bs";
import { Loader } from "../../components";
import { toast } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginFailed, loginStart, loginSuccess } from "../../context/authSlice";
const Login = () => {
  const webCamRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: "user",
  };
  const [loader, setLoader] = useState(false);
  const [tab, setTab] = useState("login");
  const [info, setInfo] = useState({ name: "", email: "" });
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!info.name || !info.email) {
        toast.error("Please enter a name and email address!");
        return;
      }
      setLoader(true);
      const {
        data: { success, message, user },
      } = await axios.post(`${BASE_URL}/auth/login`, info);

      if (success) {
        toast.success("Now, you can verify face");
        setTab("verify");
        setLoader(false);
        setUser(user);
      }
    } catch (e) {
      setLoader(false);
      toast.error(e.response.data.message);
    }
  };
  const verifyFace = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const imageSrc = webCamRef.current.getScreenshot();

      const {
        data: { success, message },
      } = await axios.post(`${BASE_URL}/auth/verify/${user._id}`, {
        img: imageSrc,
      });
      if (success) {
        toast.success(message);
        dispatch(loginSuccess(user));
        localStorage.setItem("currUser__id", user._id);
        navigate("/");
      }
    } catch (e) {
      dispatch(loginFailed());
      toast.error(e.response.data.message);
    }
  };
  return (
    <div className="login__page">
      <div className="login__container">
        <div className="login__con">
          {tab === "login" && (
            <div className="login__form">
              <h2>Login</h2>
              <div className="login__input">
                <CgProfile className="icon" />
                <input
                  type="text"
                  className=""
                  placeholder="Enter Your Name"
                  name="name"
                  onChange={(e) =>
                    setInfo({ ...info, [e.target.name]: e.target.value })
                  }
                  required
                />
              </div>
              <div className="login__input">
                <MdOutlineEmail className="icon" />
                <input
                  type="email"
                  className=""
                  placeholder="Enter Your Email "
                  name="email"
                  onChange={(e) =>
                    setInfo({ ...info, [e.target.name]: e.target.value })
                  }
                  required
                />
              </div>
              {!loader ? (
                <BsArrowRightCircleFill
                  onClick={handleLogin}
                  className="proceed"
                />
              ) : (
                <div className="loader">
                  <Loader />
                </div>
              )}
              <p>
                Don't have an account? &nbsp;{" "}
                <b onClick={() => navigate("/register")}>Register</b>
              </p>
            </div>
          )}
          {tab === "verify" && (
            <form onSubmit={verifyFace} className="verify__face">
              <FiChevronLeft
                onClick={() => setTab("login")}
                className="back__icon"
              />
              <h2>Face Verification</h2>
              <Webcam
                audio={false}
                height={400}
                width={400}
                ref={webCamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={1}
                videoConstraints={videoConstraints}
              />
              {isLoading ? (
                <Loader />
              ) : (
                <button className="verify__btn">verify</button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
