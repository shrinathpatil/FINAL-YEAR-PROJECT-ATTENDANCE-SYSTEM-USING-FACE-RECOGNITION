import React, { useRef, useState } from "react";
import "./Register.scss";
import { CgProfile } from "react-icons/cg";
import { MdEmail, MdPassword } from "react-icons/md";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../context/authSlice";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [img, setImg] = useState(null);
  const [info, setInfo] = useState({
    name: "",
    email: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const webCamRef = useRef();
  const videoConstraints = {
    width: "100%",
    height: "100%",
    facingMode: "user",
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!img) {
      toast.error("Please capture your Image before registering !");
      return;
    }
    try {
      const body = {
        ...info,
        img,
      };
      const {
        data: { message, success, user },
      } = await axios.post(`${BASE_URL}/auth/register`, body);
      if (success) {
        dispatch(loginSuccess(user));
        toast.success(message);
        localStorage.setItem("currUser__id", user._id);
        navigate("/");
      }
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  const capture = () => {
    const imageSrc = webCamRef.current.getScreenshot();
    setImg(imageSrc);
  };
  return (
    <div className="register__page">
      <div className="register__container">
        <form onSubmit={handleRegister} className="register__form">
          <div className="video__container">
            <Webcam
              className="video"
              audio={false}
              ref={webCamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={1}
              videoConstraints={videoConstraints}
            />
          </div>

          <div className="buttons">
            <button type="button" className="capture__btn" onClick={capture}>
              {img ? "Capture Again" : "Capture"}
            </button>
          </div>

          <div className="form__input">
            <CgProfile className="icon" />
            <input
              name="name"
              required
              onChange={(e) =>
                setInfo({ ...info, [e.target.name]: e.target.value })
              }
              type="text"
              className=""
              placeholder="enter your name"
            />
          </div>
          <div className="form__input">
            <MdEmail className="icon" />
            <input
              name="email"
              required
              onChange={(e) =>
                setInfo({ ...info, [e.target.name]: e.target.value })
              }
              type="email"
              className=""
              placeholder="enter your email"
            />
          </div>

          <button type="submit" className="register__btn">
            Register
          </button>
          <p>
            Already have an account? &nbsp;{" "}
            <b onClick={() => navigate("/login")}>Login</b>
          </p>
        </form>
      </div>

      {img && (
        <div className="image__preview">
          <img src={img} alt="" className="" />
          <button className="discard" onClick={() => setImg(null)}>
            Discard
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
