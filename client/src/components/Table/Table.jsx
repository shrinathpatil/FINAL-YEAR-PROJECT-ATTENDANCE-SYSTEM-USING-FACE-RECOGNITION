import React, { useEffect, useState } from "react";
import "./Table.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { setCurrentClass } from "../../context/currClass";
import Loader from "../Loader/Loader";
import { setData, setEditAttendance } from "../../context/edit";
const Table = () => {
  const [columns, setColumns] = useState([
    { field: "enroll", headerName: "Enrollment no.", width: 150 },
    { field: "firstName", headerName: "First name", width: 130 },
  ]);
  const [rows, setRows] = useState([]);
  const { currentClass, classId } = useSelector((state) => state.currClass);
  const { openAddClass, openAddStudent, openEditAttendance } = useSelector(
    (state) => state.edit
  );

  const dispatch = useDispatch();

  const { isLoading, isError, data, refetch } = useQuery({
    queryKey: [classId],
    queryFn: async () => {
      const {
        data: { success, reqClass },
      } = await axios.get(`${BASE_URL}/users/class/${classId}`);

      if (success) {
        dispatch(setCurrentClass(reqClass));
        return reqClass;
      }
      return [];
    },
  });

  useEffect(() => {
    refetch();
  }, [classId, openAddClass, openAddStudent, openEditAttendance]);

  useEffect(() => {
    const makeColumns = () => {
      const dates = currentClass.attendance.map((a) => ({
        field: `${a.date} ${a.time}`,
        headerName: `${a.date} ${a.time}`,
        width: 160,
        sortable: false,
      }));

      setColumns([
        { field: "enroll", headerName: "Enrollment no.", width: 150 },
        { field: "firstName", headerName: "First name", width: 130 },
        ...dates,
      ]);
    };
    currentClass && makeColumns();
  }, [currentClass]);

  useEffect(() => {
    const markStudents = () => {
      let tempRow = [];
      currentClass.students.forEach((s, i) => {
        let attend = {
          id: s.enroll,
          enroll: s.enroll,
          firstName: s.name,
        };

        currentClass.attendance.forEach((a) => {
          if (a.presentStudents.includes(s.enroll)) {
            attend = {
              ...attend,
              [`${a.date} ${a.time}`]: "Present",
            };
          } else {
            attend = {
              ...attend,
              [`${a.date} ${a.time}`]: "Absent",
            };
          }
        });
        tempRow.push(attend);
      });
      setRows(tempRow);
    };

    currentClass?.students.length > 0 && markStudents();
  }, [currentClass]);

  const handleClick = (data) => {
    if (data.field !== "firstName" && data.field !== "enroll") {
      dispatch(setData(data));
      dispatch(setEditAttendance(true));
    }
  };

  return (
    <div className="table">
      {isLoading ? (
        <Loader />
      ) : (
        !isError && (
          <DataGrid
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            autoPageSize
            onCellClick={(d) => handleClick(d)}
          />
        )
      )}
    </div>
  );
};

export default Table;
