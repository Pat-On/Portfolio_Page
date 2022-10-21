import React from "react";
import classes from "./Footer.module.scss";

const Footer = (props) => {
  return (
    <div className={classes.footer}>
      <div className={classes.footer__contactMe}>
        <h2>Get In Touch</h2>
        <h3>Do not hesitate to contact me via email or LinkedIn</h3>
        <span>Email</span> <span>LinkedIn</span>
      </div>
      ------------------------------------------------------------------------
      <footer>
        <ul className={classes.footer__listOfIcons}>
          <li>
            <span>Find My CV</span>
          </li>
          <li>GitHub</li>
          <li>LeetCode</li>
          <li>Creedly</li>
        </ul>

        <div className={classes.footer__legal}>
          &copy; 2021 Made by Patryk Nowak
        </div>
      </footer>
    </div>
  );
};

export default Footer;
