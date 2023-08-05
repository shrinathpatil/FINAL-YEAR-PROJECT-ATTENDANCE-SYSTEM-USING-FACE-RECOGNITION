import React, { useState } from "react";
import { BiHomeCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import "./Navbar.scss";
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="nav__menu">
        <BiHomeCircle onClick={() => navigate("/")} />
      </div>
    </div>
  );
};

export default Navbar;
