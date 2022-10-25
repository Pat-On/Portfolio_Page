import React from "react";
import classes from "./ButtonLink.module.scss";

const ButtonLink = (props) => {
  let styleConfig = props.styleConfig;
  if (!props.styleConfig) {
    styleConfig = { padding: "1.2rem 3rem", fontSize: "1.5rem" };
  }

  return (
    <a
      className={(props.styling, classes.buttonLink)}
      href={props.link}
      style={styleConfig}
    >
      {props.text}
    </a>
  );
};

export default ButtonLink;
