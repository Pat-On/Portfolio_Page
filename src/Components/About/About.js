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
          I have over four years of experience in the industry and hold ten
          certifications across Azure and AWS Cloud.
        </p>

        <p className={classes.about__paragraph}>
          Currently, I am working as a Software Engineer at{" "}
          <a className={classes.about__links} href="https://www.friendmts.com/">
            Friend MTS
          </a>
          , where I progressed from Junior Software Engineer, working across
          distributed microservices, cloud infrastructure, and CI/CD
          pipelines. My passion for teaching and supporting the local community
          motivated me to volunteer at{" "}
          <a className={classes.about__links} href="https://codeyourfuture.io/">
            Code Your Future
          </a>{" "}
          and{" "}
          <a
            className={classes.about__links}
            href="https://www.schoolofcode.co.uk/"
          >
            School of Code
          </a>
          , where I mentored aspiring developers in their growth.
        </p>

        <p className={classes.about__paragraph}>
          I pick up new technologies quickly and adapt to whatever the project
          demands. The most recently used technologies by me, to name a few:
        </p>
        <div className={classes.about__paragraph}>
          <ul className={classes.about__recentSkills}>
            <li>PHP</li>
            <li>Laravel</li>
            <li>TypeScript</li>
            <li>Docker</li>
            <li>Kubernetes</li>
            <li>AWS</li>
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
