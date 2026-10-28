import React from "react";
import classes from "./Experience.module.scss";

import work from "../../assets/JSON/workExperience.json";

// Everything is visible at once: the old tab switcher changed the section's height on every click
const Experience = () => {
  const { current, previous, volunteering } = work;
  const groups = [
    { label: "Previous role", roles: previous },
    { label: "Mentoring & volunteering", roles: volunteering },
  ];

  return (
    <section className={classes.experience} data-animate="true">
      <div className={classes.experience__sectionHead}>
        <span className={classes.experience__num}>02</span>
        <h2 className={classes.experience__title}>Selected Work</h2>
      </div>

      <article className={classes.experience__now} aria-labelledby="experience-now">
        <header className={classes.experience__company}>
          <span className={classes.experience__eyebrow}>Current role</span>
          <h3 id="experience-now" className={classes.experience__companyName}>
            <a className={classes.experience__link} href={current.link}>
              {current.company}
            </a>
          </h3>
          <span className={classes.experience__meta}>{current.location}</span>
        </header>

        <ol className={classes.experience__roles}>
          {current.roles.map((role, i) => (
            <li className={classes.experience__role} key={role.title}>
              {/* Roles run newest first, so every role after the first is the one promoted from */}
              {i > 0 && (
                <span className={classes.experience__promoted}>Promoted from</span>
              )}
              <h4 className={classes.experience__roleTitle}>{role.title}</h4>
              <p className={classes.experience__meta}>{role.time}</p>
              <ul className={classes.experience__bullets}>
                {role.description.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <ul className={classes.experience__skills} aria-label="Skills">
          {current.skills.map((skill) => (
            <li key={skill} className={classes.experience__chip}>
              {skill}
            </li>
          ))}
        </ul>
      </article>

      {groups.map((group) => (
        <div className={classes.experience__group} key={group.label}>
          <h3 className={classes.experience__eyebrow}>{group.label}</h3>
          <ol className={classes.experience__timeline} aria-label={group.label}>
            {group.roles.map((role) => (
              <li className={classes.experience__entry} key={role.title}>
                <p className={classes.experience__entryHead}>
                  <span className={classes.experience__entryTitle}>{role.title}</span>
                  {" · "}
                  <a className={classes.experience__link} href={role.link}>
                    {role.company}
                  </a>
                </p>
                <p className={classes.experience__entryTime}>{role.time}</p>
                <p className={classes.experience__entrySummary}>{role.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
};

export default Experience;
