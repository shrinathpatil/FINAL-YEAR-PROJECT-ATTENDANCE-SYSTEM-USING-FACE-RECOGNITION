import React, { CSSProperties } from "react";
import PulseLoader from "react-spinners/PulseLoader";

const Loader = () => {
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  return (
    <PulseLoader
      color={"#F04259"}
      loading={true}
      cssOverride={override}
      size={12}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
};

export default Loader;
