import React from "react";
import classes from "./ButtonLink.module.scss";

const ButtonLink = (props) => {
  return (
    <a className={(props.styling, classes.buttonLink)} href={props.link}>
      {props.text}
    </a>
  );
};

export default ButtonLink;
