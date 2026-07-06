import React from "react";
import PropTypes from "prop-types";
import classes from "./JobsListElement.module.scss";

const JobsListElement = ({ description }) =>
  description.map((text) => {
    if (text.startsWith("Skills:")) {
      const chips = text.replace("Skills: ", "").split(" · ");
      return (
        <li key={text} className={classes.skills}>
          {chips.map((chip) => (
            <span key={chip} className={classes.chip}>
              {chip}
            </span>
          ))}
        </li>
      );
    }
    return (
      <li key={text} className={classes.lisElements}>
        {text}
      </li>
    );
  });

JobsListElement.propTypes = {
  description: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default JobsListElement;
