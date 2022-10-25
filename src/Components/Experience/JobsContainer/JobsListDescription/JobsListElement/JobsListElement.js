import React from "react";
import classes from "./JobsListElement.module.scss";

const JobsListElement = (props) => {
  const lisElements = props.description.map((description, idx) => (
    <li key={idx} className={classes.lisElements}>
      {description}
    </li>
  ));

  return lisElements;
};

export default JobsListElement;
