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
          I am a highly adaptable, flexible professional who enjoys teamwork and
          can work independently. I am not afraid to take the lead when needed.
          I have two years of experience in the industry and, most recently,
          received eight certifications from Azure and one from AWS Cloud.
        </p>

        <p className={classes.about__paragraph}>
          Currently, I am working at{" "}
          <a className={classes.about__links} href="https://www.friendmts.com/">
            Friend MTS
          </a>
          , with many project-dependent technologies. My passion for teaching
          and supporting the local community motivated me to volunteer at{" "}
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
          I am a person that picks up new technologies quickly and is adaptable
          to what I need to work with. The most recently used technologies by
          me, to name a few:
        </p>
        <div className={classes.about__paragraph}>
          <ul className={classes.about__recentSkills}>
            <li>PHP</li>
            <li>Laravel</li>
            <li>JavaScript</li>
            <li>Docker</li>
            <li>Node.js</li>
            <li>Tree.js</li>
          </ul>
        </div>
      </div>

      <div className={classes.about__photoContainer}>
        <ProfilePhoto />
      </div>
    </div>
  );
};

export default About;
