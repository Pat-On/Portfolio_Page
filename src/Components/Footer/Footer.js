import React from "react";
import classes from "./Footer.module.scss";

import ButtonLink from "../../UI/ButtonLink/ButtonLink";

import gitHubIcon from "../../assets/icons/githubLogo.svg";
import emailLogo from "../../assets/icons/emailIcon.svg";
import leetCodeLogo from "../../assets/icons/leetCodeLogo.svg";
import credlyLogo from "../../assets/icons/credly-custom.svg";
import linkedInIcon from "../../assets/icons/linkedinLogo.svg";

const Footer = () => {
  return (
    <footer className={classes.footer} data-animate="true">
      <div className={classes.footer__contactMe}>
        <div className={classes.footer__sectionHead}>
          <span className={classes.footer__num}>05</span>
          <h2 className={classes.footer__title}>Get In Touch</h2>
        </div>
        <p className={classes.footer__paragraph}>
          Open to new opportunities — let's talk.
        </p>
        <ul className={classes.footer__contactList}>
          <li>
            {/* Email icon by www.wishforge.games https://freeicons.io/profile/2257 */}
            <a href="mailto:patryk.r.nowak@gmail.com" aria-label="Email me">
              <img src={emailLogo} alt="" />
            </a>
          </li>
          <li>
            {/* LinkedIn logo from https://fontawesomeicons.com/svg/icons/linkedin */}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.linkedin.com/in/patryknowak1990/"
              aria-label="LinkedIn profile"
            >
              <img src={linkedInIcon} alt="" />
            </a>
          </li>
        </ul>
      </div>

      <div className={classes.footer__bottom}>
        <div className={classes.footer__buttonCV}>
          <ButtonLink
            styleConfig={{ padding: "0.6rem 1.8rem", fontSize: "1.1rem" }}
            text="Find My CV HERE"
            link="https://drive.google.com/u/0/uc?id=1H_Ec-cBj9ushxDrxQiqIIOrtJrTwkFed&export=download"
          />
        </div>

        <ul className={classes.footer__listOfIcons}>
          <li>
            {/* LeetCode logo by svgrepo.com */}
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://leetcode.com/Pat-On/"
              target="_blank"
              aria-label="LeetCode profile"
            >
              <img src={leetCodeLogo} alt="" />
            </a>
          </li>
          <li>
            {/* GitHub logo by Alan https://freeicons.io/profile/1353 */}
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://github.com/Pat-On"
              target="_blank"
              aria-label="GitHub profile"
            >
              <img src={gitHubIcon} alt="" />
            </a>
          </li>
          <li>
            {/* Credly logo from https://fontawesomeicons.com/svg/icons/credly */}
            <a
              rel="noreferrer"
              className={classes.links}
              href="https://www.credly.com/users/patryknowak1990/badges"
              target="_blank"
              aria-label="Credly badges"
            >
              <img src={credlyLogo} alt="" />
            </a>
          </li>
        </ul>

        <div className={classes.footer__legal}>
          &copy; {new Date().getFullYear()} Made by Patryk Nowak
        </div>
      </div>
    </footer>
  );
};

export default Footer;
