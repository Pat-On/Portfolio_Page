import React, { useState } from "react";
import classes from "./Experience.module.scss";

import JobsContainer from "./JobsContainer/JobsContainer";
import ControllerList from "./ControllerList/ControllerList";

import jobs from "../../assets/JSON/workExperience.json";

const Experience = (props) => {
  const [activeJob, setActiveJob] = useState("0");
  const [job, setJob] = useState(jobs[0]);

  const jobSwitcher = (e) => {
    if (!e.target.value) return;
    const chosenJob = e.target.value;
    setJob((prev) => jobs[chosenJob]);
    setActiveJob((prev) => chosenJob);
  };

  return (
    <section className={classes.experience} data-animate="true">
      <div className={classes.experience__sectionHead}>
        <span className={classes.experience__num}>02</span>
        <h2 className={classes.experience__title}>Selected Work</h2>
      </div>

      <div
        className={classes.experience__jobsPort}
        role="tabpanel"
        aria-label={`${job.title} at ${job.company}`}
      >
        <JobsContainer
          title={job.title}
          company={job.company}
          time={job.time}
          description={job.description}
          link={job.link}
        />
      </div>

      <div className={classes.experience__jobsControl}>
        <ControllerList jobs={jobs} chosenJob={activeJob} onSelect={jobSwitcher} />
      </div>
    </section>
  );
};

export default Experience;
