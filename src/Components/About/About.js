import React from "react";
import classes from "./About.module.scss";

import ProfilePhoto from "../../UI/ProfilePhoto/ProfilePhoto";

const About = (props) => {
  return (
    <div className={classes.about}>
      <div className={classes.about__description}>
        <h2 className={classes.about__title}>About Me</h2>
        <p className={classes.about__paragraph}>
          I'm a passionate software engineer who started from a non-IT
          background. I came from the academic sector, where I learnt a
          methodological and analytical approach to solving problems during my
          PhD studies.
        </p>

        <p className={classes.about__paragraph}>
          I am very good at working as part of a team and can also take the lead
          when needed in situations. I have two years of experience in the
          industry and most recently became Azure and AWS cloud certified.
        </p>

        <p className={classes.about__paragraph}>
          Currently, I am working at{" "}
          <a className={classes.about__links} href="https://synaptek.co.uk/">
            Synaptek
          </a>
          , working with many project-dependent technologies. My passion for
          teaching and supporting the local community motivated me to volunteer
          at{" "}
          <a className={classes.about__links} href="https://codeyourfuture.io/">
            Code Your Future{" "}
          </a>{" "}
          and{" "}
          <a
            className={classes.about__links}
            href="https://www.schoolofcode.co.uk/"
          >
            School of Code
          </a>
          , where I can mentor and support people in their growth.
        </p>

        <p className={classes.about__paragraph}>
          I can quickly adapt to what I need to work with and pick up new
          technologies. The most recently used technologies by me, to name a
          few:
        </p>
        <p className={classes.about__paragraph}>
          <ul className={classes.about__recentSkills}>
            <li>JavaScript</li>
            <li>Python</li>
            <li>React</li>
            <li>Flask</li>
            <li>Node.js</li>
            <li>Tree.js</li>
          </ul>
        </p>
      </div>

      <div className={classes.about__photoContainer}>
        <ProfilePhoto />
      </div>
    </div>
  );
};

export default About;
