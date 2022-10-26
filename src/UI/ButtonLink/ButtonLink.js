import React from "react";
import classes from "./ButtonLink.module.scss";

const ButtonLink = (props) => {
  // let styleConfig = classes.buttonLink;
  // if (!props.styleConfig) {
  //   // styleConfig = { padding: "1.2rem 3rem", fontSize: "1.5rem" };
  //   styleConfig = `${props.styleConfig} ${classes.buttonLink}`;
  // }

  return (
    <a
      className={classes.buttonLink}
      href={props.link}
      // style={styleConfig}
    >
      {props.text}
    </a>
  );
};

export default ButtonLink;
