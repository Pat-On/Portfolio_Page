import React from "react";
import classes from "./About.module.scss";

import ProfilePhoto from "../../UI/ProfilePhoto/ProfilePhoto";

const About = () => {
  return (
    <section className={classes.about} data-animate="true">
      <div className={classes.about__description}>
        <div className={classes.about__sectionHead}>
          <span className={classes.about__num}>01</span>
          <h2 className={classes.about__title}>About Me</h2>
        </div>
        <p className={classes.about__paragraph}>
          I came to software engineering from an academic background that shaped
          how I approach hard problems — methodically, from first principles.
          I've spent five years applying that rigour to distributed systems in
          production, earning eleven Azure, AWS and HashiCorp certifications along
          the way.
        </p>

        <p className={classes.about__paragraph}>
          Today I build distributed microservices, cloud infrastructure and
          CI/CD pipelines at{" "}
          <a className={classes.about__links} href="https://www.friendmts.com/">
            Friend MTS
          </a>
          , where I progressed from Junior Software Engineer. Alongside that I've
          mentored aspiring developers at{" "}
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
          .
        </p>

        <p className={classes.about__paragraph}>
          Recent tools I've been working with:
        </p>
        <div className={classes.about__paragraph}>
          <ul className={classes.about__recentSkills}>
            <li>PHP / Laravel</li>
            <li>Python / FastAPI</li>
            <li>AWS Bedrock AgentCore</li>
            <li>Strands Agents</li>
            <li>TypeScript</li>
            <li>Docker / Kubernetes</li>
            <li>AWS (EKS, ECS, RDS)</li>
            <li>Terraform</li>
            <li>Elastic / Kibana</li>
            <li>RabbitMQ / Redis</li>
            <li>GitLab CI/CD</li>
            <li>Helm</li>
          </ul>
        </div>
      </div>

      <div className={classes.about__photoContainer}>
        <ProfilePhoto />
      </div>
    </section>
  );
};

export default About;
