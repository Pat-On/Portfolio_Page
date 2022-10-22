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
        <h2>Get In Touch</h2>
        <h3>Do not hesitate to contact me via email or LinkedIn</h3>
        <ul style={{ listStyle: "none", display: "flex" }}>
          <li>
            <a
              className={classes.links}
              href="mailto: patryk.r.nowak@gmail.com"
            >
              <img
                style={{
                  backgroundColor: "gold",
                  width: "24px",
                  height: "24px",
                }}
                src={emailLogo}
                alt="Email icon"
              />
            </a>
          </li>
          <li>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.linkedin.com/in/patryknowak1990/"
            >
              <img
                style={{
                  backgroundColor: "gold",
                  border: "1px solid gold",
                }}
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
            text="Find My CV HERE"
            link="https://drive.google.com/u/0/uc?id=1ii_m15I890LX5v59Vc2wTO2T4tuXp2uK&export=download"
          />
        </div>

        <ul className={classes.footer__listOfIcons}>
          <li>
            <img
              style={{ backgroundColor: "gold" }}
              src={leetCodeLogo}
              alt="LeetCode logo"
            />
          </li>
          <li>
            <img
              style={{ backgroundColor: "gold", border: "1px solid gold" }}
              src={gitHubIcon}
              alt="Github logo"
            />
          </li>
          <li>
            <img
              style={{ border: "1px solid gold" }}
              src={credlyLogo}
              alt="Credly logo"
            />
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
