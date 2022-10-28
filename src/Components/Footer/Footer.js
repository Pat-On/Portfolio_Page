import React from "react";
import classes from "./Footer.module.scss";

import ButtonLink from "../../UI/ButtonLink/ButtonLink";

import gitHubIcon from "../../assets/icons/githubLogo.svg";
import emailLogo from "../../assets/icons/emailIcon.svg";
import leetCodeLogo from "../../assets/icons/leetCodeLogo.svg";
import credlyLogo from "../../assets/icons/credly-custom.svg";
import linkedInIcon from "../../assets/icons/linkedinLogo.svg";

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
              <img
                src={emailLogo}
                alt="Email icon by www.wishforge.games https://freeicons.io/profile/2257"
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
                src={linkedInIcon}
                alt="LinkedIn logo from https://fontawesomeicons.com/svg/icons/linkedin"
              />
            </a>
          </li>
        </ul>
      </div>

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
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://leetcode.com/Pat-On/"
              target="_blank"
            >
              <img src={leetCodeLogo} alt="LeetCode logo by svgrepo.com" />
            </a>
          </li>
          <li>
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://github.com/Pat-On"
              target="_blank"
            >
              <img
                src={gitHubIcon}
                alt="Github logo by Alan https://freeicons.io/profile/1353"
              />
            </a>
          </li>
          <li>
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://www.credly.com/users/patryknowak1990/badges"
              target="_blank"
            >
              <img
                src={credlyLogo}
                alt="Credly logo from https://fontawesomeicons.com/svg/icons/credly"
              />
            </a>
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
