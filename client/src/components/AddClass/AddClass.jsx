import axios from "axios";
import imageToBase64 from "image-to-base64/browser";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineSync, AiOutlineUserAdd } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { MdClass, MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setAddClass } from "../../context/edit";
import { BASE_URL } from "../../utils/url";
import Loader from "../Loader/Loader";
import "./AddClass.scss";

const AddClass = () => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const { currUser } = useSelector((state) => state.auth);
  const { openAddClass } = useSelector((state) => state.edit);

  const dispatch = useDispatch();

  const [classData, setClassData] = useState({
    name: "",
    userId: currUser?._id,
    userName: currUser?.name,
    students: [],
  });

  const addStudents = async (e) => {
    if (!files.length) {
      toast.error("Please select images !");
      return;
    }
    try {
      let urls = [];
      urls = await Promise.all(
        files.map(async (item) => {
          const res = await imageToBase64(URL.createObjectURL(item));
          const name = item.name.split(".")[0].split("_")[0];
          const enroll = item.name.split(".")[0].split("_")[1];
          const student = {
            name,
            enroll,
            img: res,
          };
          return student;
        })
      );
      setClassData({
        ...classData,
        students: [...classData.students, ...urls],
      });
    } catch (e) {}
  };

  const addClass = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const {
        data: { success, message },
      } = await axios.post(`${BASE_URL}/users/class`, classData);
      if (success) {
        toast.success(message);
        setLoading(false);
        dispatch(setAddClass(false));
      }
    } catch (e) {
      setLoading(false);
      toast.error(e.response.data.message);
    }
  };

  return (
    <div className={openAddClass ? "add__class__comp" : "add__class__comp off"}>
      <div className="add__class__container">
        <form onSubmit={addClass} className="add__class__form">
          <MdClose
            onClick={() => dispatch(setAddClass(false))}
            className="icon"
          />
          <h2>Add Class</h2>
          <div className="add__input">
            <MdClass className="input__icon" />
            <input
              required
              type="text"
              className=""
              onChange={(e) =>
                setClassData({ ...classData, name: e.target.value })
              }
              placeholder="Enter Class Name"
            />
          </div>
          <label>Select Student Images</label>
          <div className="add__input">
            <BsFillPersonFill className="input__icon" />
            <input
              type="file"
              multiple
              className=""
              placeholder="enter class name"
              onChange={(e) => setFiles([...e.target.files])}
            />
            <AiOutlineUserAdd onClick={addStudents} className="input__icon" />
            {classData.students.length > 0 && classData.students.length}
          </div>
          <button disabled={loading} type="submit" className="create__btn">
            {loading ? <Loader type={"circle"} /> : " Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClass;
