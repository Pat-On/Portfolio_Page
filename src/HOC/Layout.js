import React from "react";
import classes from "./Layout.module.scss";

import Header from "../Components/Header/Header";

const Layout = (props) => {
  return (
    <div className={classes.layout}>
      <Header />
    </div>
  );
};

export default Layout;
