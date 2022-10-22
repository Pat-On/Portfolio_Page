import React, { useState } from "react";
import classes from "./Experience.module.scss";

import JobsContainer from "./JobsContainer/JobsContainer";
import ControllerList from "./ControllerList/ControllerList";

import jobs from "../../assets/JSON/workExperience.json";

const Experience = (props) => {
  const [job, setJob] = useState(jobs[0]);
  const jobSwitcher = (e) => {
    if (!e.target.value) return;
    const chosenJob = e.target.value;
    setJob((prev) => jobs[chosenJob]);
  };

  return (
    <div className={classes.experience}>
      <h2 className={classes.experience__title}>Working Experience</h2>

      <div className={classes.experience__jobsPort}>
        <JobsContainer
          title={job.title}
          company={job.company}
          time={job.time}
          description={job.description}
        />
      </div>

      <div className={classes.experience__jobsControl} onClick={jobSwitcher}>
        <ControllerList jobs={jobs} />
      </div>
    </div>
  );
};

export default Experience;
