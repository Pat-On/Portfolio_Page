import React from "react";
import classes from "./JobsListElement.module.scss";

const JobsListElement = ({ description }) =>
  description.map((text, idx) => {
    if (text.startsWith("Skills:")) {
      const chips = text.replace("Skills: ", "").split(" · ");
      return (
        <li key={idx} className={classes.skills}>
          {chips.map((chip) => (
            <span key={chip} className={classes.chip}>
              {chip}
            </span>
          ))}
        </li>
      );
    }
    return (
      <li key={idx} className={classes.lisElements}>
        {text}
      </li>
    );
  });

export default JobsListElement;
