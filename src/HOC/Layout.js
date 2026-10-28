import React, { useEffect } from "react";
import classes from "./Layout.module.scss";

import Header from "../Components/Header/Header";
import About from "../Components/About/About";
import Experience from "../Components/Experience/Experience";
import MyProjects from "../Components/MyProjects/MyProjects";
import Certifications from "../Components/Certifications/Certifications";
import Footer from "../Components/Footer/Footer";

const Layout = (props) => {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="main-content" className={classes.layout}>
      <Header />
      <About />
      <Experience />
      <MyProjects />
      <Certifications />
      <Footer />
    </main>
  );
};

export default Layout;
