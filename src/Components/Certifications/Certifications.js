import React from "react";
import classes from "./Certifications.module.scss";

import {
  certificationData,
  certificationGroups,
} from "../../assets/JSON/certificationsData.js";

const CREDLY_URL = "https://www.credly.com/users/patryknowak1990/badges";

const Certifications = () => {
  return (
    <section className={classes.certifications} data-animate="true">
      <div className={classes.certifications__sectionHead}>
        <span className={classes.certifications__num}>04</span>
        <h2 className={classes.certifications__title}>Certifications</h2>
      </div>
      <div className={classes.certifications__groups}>
        {certificationGroups.map((group) => {
          const headingId = `cert-group-${group
            .toLowerCase()
            .replace(/[^a-z]+/g, "-")}`;
          return (
            <div className={classes.certifications__group} key={group}>
              <h3 id={headingId} className={classes.certifications__groupTitle}>
                {group}
              </h3>
              <ul
                className={classes.certifications__list}
                aria-labelledby={headingId}
              >
                {certificationData
                  .filter((cert) => cert.group === group)
                  .map((cert) => (
                    <li className={classes.certifications__badge} key={cert.title}>
                      {/* The visible code and full name describe the badge */}
                      <img
                        className={classes.certifications__img}
                        src={cert.img}
                        alt=""
                        loading="lazy"
                        width="96"
                        height="96"
                      />
                      <span className={classes.certifications__code}>
                        {cert.title}
                      </span>
                      <span className={classes.certifications__name}>
                        {cert.name}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>
      <a
        className={classes.certifications__verify}
        href={CREDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Verify on Credly →
      </a>
    </section>
  );
};

export default Certifications;
