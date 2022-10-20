import React from "react";
import classes from "./Layout.module.scss";

import About from "../Components/About/About";

const Layout = (props) => {
  return (
    <div className={classes.layout}>
      <About />
    </div>
  );
};

export default Layout;
