import React from "react";
import PropTypes from "prop-types";
import classes from "./ButtonLink.module.scss";

const ButtonLink = (props) => {
  return (
    <a className={classes.buttonLink} href={props.link}>
      {props.text}
    </a>
  );
};

ButtonLink.propTypes = {
  link: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default ButtonLink;
