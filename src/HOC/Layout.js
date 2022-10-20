import React from "react";
import classes from "./Layout.module.scss";

import Header from "../Components/Header/Header";
import About from "../Components/About/About";
import Experience from "../Components/Experience/Experience";
import MyProjects from "../Components/MyProjects/MyProjects";
import Certifications from "../Components/Certifications/Certifications";
import Footer from "../Components/Footer/Footer";

const Layout = (props) => {
  return (
    <div className={classes.layout}>
      <Header />
      <About />
      <Experience />
      <MyProjects />
      <Certifications />
      <Footer />
    </div>
  );
};

export default Layout;
