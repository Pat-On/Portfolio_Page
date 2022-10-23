import React from "react";
import classes from "./Footer.module.scss";

import ButtonLink from "../../UI/ButtonLink/ButtonLink";

import gitHubIcon from "../../assets/icons/iconmonstr-github-2.svg";
import linkedInIcon from "../../assets/icons/iconmonstr-linkedin-3.svg";
import emailLogo from "../../assets/icons/basic_mail.svg";
import leetCodeLogo from "../../assets/icons/leetcode-svgrepo-com.svg";
import credlyLogo from "../../assets/icons/credly.svg";

const Footer = (props) => {
  return (
    <div className={classes.footer}>
      <div className={classes.footer__contactMe}>
        <h2 className={classes.footer__title}>Get In Touch</h2>
        <p className={classes.footer__paragraph}>
          Do not hesitate to contact me via email or LinkedIn
        </p>
        <ul className={classes.footer__contactList}>
          <li>
            <a href="mailto: patryk.r.nowak@gmail.com">
              <img src={emailLogo} alt="Email icon" />
            </a>
          </li>
          <li>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.linkedin.com/in/patryknowak1990/"
            >
              <img
                // style={{
                //   backgroundColor: "gold",
                //   border: "1px solid gold",
                // }}
                src={linkedInIcon}
                alt="LinkedIn logo"
              />
            </a>
          </li>
        </ul>
      </div>
      {/* <div className={classes.goldLine} /> */}

      <footer className={classes.footer__bottom}>
        <div className={classes.footer__buttonCV}>
          <ButtonLink
            styleConfig={{ padding: "0.6rem 1.8rem", fontSize: "1.1rem" }}
            text="Find My CV HERE"
            link="https://drive.google.com/u/0/uc?id=1ii_m15I890LX5v59Vc2wTO2T4tuXp2uK&export=download"
          />
        </div>

        <ul className={classes.footer__listOfIcons}>
          <li>
            <img src={leetCodeLogo} alt="LeetCode logo" />
          </li>
          <li>
            <img src={gitHubIcon} alt="Github logo" />
          </li>
          <li>
            <img src={credlyLogo} alt="Credly logo" />
          </li>
        </ul>

        <div className={classes.footer__legal}>
          &copy; 2022 Made by Patryk Nowak
        </div>
      </footer>
    </div>
  );
};

export default Footer;
