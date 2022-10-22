import React, { useEffect, useState } from "react";
import classes from "./Experience.module.scss";

const arrayOfExperience = [
  [
    <div className={classes.experience__jobBox1}>
      <h3>Integration Engineer at Synaptek</h3>
      <h4>July 2021 - Present</h4>
      <ul>
        <li>
          Leading agile team in shifting ReactJS from Bootstrap to Tailwind,
          which required integration with Craco, modification of JEST tests and
          CI/CD pipeline
        </li>
        <li>
          Leading agile team in upgrading of ReactJS application to NEXT.JS,
          which required a reconfiguration of JEST, Webpack, Tailwind and deep
          modification of REDUX and ReactJS’s components. NextJS server side
          rendering and authorization of users was added in line with NextJS
          best practices
        </li>
        <li>
          Optimization of NodeJS and ReactJS application, which were deployed to
          the Google Cloud Platform
        </li>
      </ul>
    </div>,
  ],
  [
    <div className={classes.experience__jobBox2}>
      <h3>Volunteer Software Engineer Intructor at Code Your Future</h3>
      <h4>July 2022 - Present</h4>
      <ul>
        <li>
          Volunteer for CYF, a non-profit organisation that trains refugees and
          disadvantaged people to become web developers and helps them to find
          work in the tech industry
        </li>
        <li>
          Roles include providing additional support to students in class,
          marking homework, assisting in their personal development through
          workshops, explaining technical concepts
        </li>
        <li>
          Main technologies include: Html, CSS, JavaScript, PostgreSQL, ReactJS,
          Express.js
        </li>
      </ul>
    </div>,
  ],
  [
    <div className={classes.experience__jobBox3}>
      <h3>Volunteer Student Mentor at School Of Code</h3>
      <h4>September 2022 - Present</h4>
      <ul>
        <li>
          Supporting aspiring developers learning with School of Code during
          their intensive 16 weeks course.
        </li>
        <li>
          Support includes but is not limited to solving technical problems and
          answering non-technical questions related to the IT sector.
        </li>
        <li>
          Main technologies include: Html, CSS, JavaScript, PostgreSQL, ReactJS,
          Express.js
        </li>
      </ul>
    </div>,
  ],
  [
    <div className={classes.experience__jobBox4}>
      <h3>Trainee at Code Your Future</h3>
      <h4>September 2020 - July 2021</h4>
      <ul>
        <li>
          Helping other trainees in studies within the fields of HTML, CSS,
          JavaScript and SQL databases
        </li>
        <li>
          Studying and practising many new and difficult concepts, which proved
          that I can work under the stress and I am quick learner
        </li>
        <li>
          Working within a small development team to design and build an on-line
          quote application using React, SASS, Express and Postgress
        </li>
      </ul>
    </div>,
  ],
];

const Experience = (props) => {
  const [job, setJob] = useState(arrayOfExperience[0]);
  const jobSwitcher = (e) => {
    if (!e.target.value) return;
    const chosenJob = e.target.value;

    setJob((prev) => arrayOfExperience[chosenJob]);
    console.log(e.target.value);
  };

  return (
    <div className={classes.experience}>
      <h2 className={classes.experience__title}>Working Experience</h2>

      <div className={classes.experience__jobsPort}>{job}</div>

      <div className={classes.experience__jobsControl} onClick={jobSwitcher}>
        <ul className={classes.experience__buttonList}>
          <li>
            <button value="0">Synaptek</button>
          </li>
          <li>
            <button value="1">Code Your Future</button>
          </li>
          <li>
            <button value="2">School of Code</button>
          </li>
          <li>
            <button value="3">Code Your Future</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Experience;
