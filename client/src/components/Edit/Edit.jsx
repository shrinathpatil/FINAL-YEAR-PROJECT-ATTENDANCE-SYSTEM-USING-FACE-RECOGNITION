import React from "react";
import "./Edit.scss";
import { useDispatch, useSelector } from "react-redux";
import { setEditAttendance } from "../../context/edit";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { toast } from "react-hot-toast";
const Edit = () => {
  const { editData } = useSelector((state) => state.edit);
  const { currentClass } = useSelector((state) => state.currClass);
  const dispatch = useDispatch();

  const editAttendance = async () => {
    try {
      const idx = editData.field.indexOf(" ");
      const date = editData.field.substring(0, idx);
      const time = editData.field.substring(idx + 1);
      const body = {
        classId: currentClass._id,
        status: editData.value,
        date,
        time,
        enroll: editData.row.enroll,
      };

      const {
        data: { success, message },
      } = await axios.put(`${BASE_URL}/attendance/edit`, body);
      if (success) {
        toast.success(message);
        dispatch(setEditAttendance(false));
      }
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  return (
    <div className="edit__comp">
      <div className="edit__card">
        <MdClose
          onClick={() => dispatch(setEditAttendance(false))}
          className="icon"
        />
        <h2>{currentClass.className}</h2>
        <h3>{editData.row.firstName}</h3>
        <h3>{editData.row.enroll}</h3>
        <button
          className={editData.value === "Present" && "p"}
          onClick={editAttendance}
        >
          Mark {editData.value === "Present" ? "Absent" : "Present"}
        </button>
      </div>
    </div>
  );
};

export default Edit;
