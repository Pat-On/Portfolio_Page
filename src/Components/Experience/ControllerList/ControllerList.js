import React from "react";
import classes from "./ControllerList.module.scss";

import ControllerElement from "./ControllerElement/ControllerElement";

const ControllerList = (props) => {
  const ControllerListElements = Object.keys(props.jobs).map((key) => {
    return (
      <ControllerElement
        keyVal={key}
        val={key}
        company={props.jobs[key].company}
      />
    );
  });

  return <ul className={classes.controlList}>{ControllerListElements}</ul>;
};

export default ControllerList;
