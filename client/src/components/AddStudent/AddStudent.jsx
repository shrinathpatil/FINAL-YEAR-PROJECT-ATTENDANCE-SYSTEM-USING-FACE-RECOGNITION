import React, { useState } from "react";
import "./AddStudent.scss";
import { BsFillPersonFill } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import imageToBase64 from "image-to-base64/browser";
import { toast } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { setAddStudent } from "../../context/edit";

const AddStudent = () => {
  const [files, setFiles] = useState([]);
  const [students, setStudents] = useState([]);
  const { currentClass } = useSelector((state) => state.currClass);
  const { openAddStudent } = useSelector((state) => state.edit);
  const dispatch = useDispatch();

  const addStudents = async () => {
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

      setStudents(urls);
    } catch (e) {}
  };

  const updateStudents = async (e) => {
    e.preventDefault();
    try {
      const body = {
        classId: currentClass._id,
        className: currentClass.className,
        students,
      };
      const {
        data: { success, message },
      } = await axios.put(`${BASE_URL}/users/class/add`, body);
      if (success) {
        toast.success(message);
        dispatch(setAddStudent(false));
      }
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };
  return (
    <div
      className={
        openAddStudent ? "add__student__comp" : "add__student__comp off"
      }
    >
      <div className="as__container">
        <div
          className="as__left"
          onClick={() => dispatch(setAddStudent(false))}
        ></div>
        <form onSubmit={updateStudents} className="as__right">
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
            {students.length > 0 && students.length}
          </div>
          <button className="addStudent__btn" type="submit">
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
