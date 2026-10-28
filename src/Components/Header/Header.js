import React from "react";
import classes from "./Header.module.scss";
import ButtonLink from "../../UI/ButtonLink/ButtonLink";
import { certificationData } from "../../assets/JSON/certificationsData";

import gitHubIcon from "../../assets/icons/githubLogo.svg";
import linkedInIcon from "../../assets/icons/linkedinLogo.svg";

const CV_LINK =
  "https://drive.google.com/u/0/uc?id=118e1K4RTeDTNRwZmTQff0iMZqWFsPcKF&export=download";

const stats = [
  { value: "5 yrs", label: "industry experience" },
  { value: `${certificationData.length}×`, label: "Azure, AWS & HashiCorp certifications" },
  { value: "15+", label: "microservices maintained" },
];

const Header = (props) => {
  return (
    <header className={classes.header}>
      <div className={classes.header__container}>
        <p className={classes.header__eyebrow}>Software Engineer</p>

        <h1 className={classes.header__name}>Patryk Nowak</h1>

        <h2 className={classes.header__tagline}>
          I build distributed, scalable systems — and the occasional solar
          system.
        </h2>

        <p className={classes.header__description}>
          Currently engineering a large-scale media-fingerprinting platform at{" "}
          <a
            className={classes.header__inlineLink}
            href="https://www.friendmts.com/"
            target="_blank"
            rel="noreferrer"
          >
            Friend MTS
          </a>{" "}
          — distributed microservices, cloud infrastructure, and CI/CD. I take
          ownership of complex problems from design through to production.
        </p>

        <ul className={classes.header__stats}>
          {stats.map((stat) => (
            <li key={stat.label} className={classes.header__stat}>
              <span className={classes.header__statValue}>{stat.value}</span>
              <span className={classes.header__statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>

        <div className={classes.header__actions}>
          <ButtonLink text="Download CV" link={CV_LINK} />
          <a
            className={classes.header__ghostButton}
            href="mailto:patryk.r.nowak@gmail.com"
          >
            Get in touch
          </a>

          <nav className={classes.header__social} aria-label="Social links">
            <a
              className={classes.header__socialLink}
              href="https://github.com/Pat-On"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <img src={gitHubIcon} alt="GitHub" />
            </a>
            <a
              className={classes.header__socialLink}
              href="https://www.linkedin.com/in/patryknowak1990/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <img src={linkedInIcon} alt="LinkedIn" />
            </a>
          </nav>
        </div>

        <p className={classes.header__hint}>
          Tip: hit <span className={classes.header__kbd}>Explore</span> to fly
          through the scene — it's a procedural solar system built in Three.js.
        </p>
      </div>
    </header>
  );
};

export default Header;
