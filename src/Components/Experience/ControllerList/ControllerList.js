import React from "react";
import PropTypes from "prop-types";
import classes from "./ControllerList.module.scss";

import ControllerElement from "./ControllerElement/ControllerElement";

const ControllerList = (props) => {
  const ControllerListElements = Object.keys(props.jobs).map((key) => {
    return (
      <ControllerElement
        key={key}
        chosenJob={props.chosenJob}
        val={key}
        label={props.jobs[key].label || props.jobs[key].company}
        onSelect={props.onSelect}
      />
    );
  });

  return (
    <ul className={classes.controlList} role="tablist" aria-label="Employers">
      {ControllerListElements}
    </ul>
  );
};

ControllerList.propTypes = {
  jobs: PropTypes.objectOf(
    PropTypes.shape({
      company: PropTypes.string.isRequired,
      label: PropTypes.string,
    })
  ).isRequired,
  chosenJob: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ControllerList;
