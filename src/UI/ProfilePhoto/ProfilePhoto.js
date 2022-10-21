import React from "react";
import classes from "./ProfilePhoto.module.scss";

import profilePhoto from "../../assets/images/ProfilePhoto.jpeg";

const ProfilePhoto = (props) => {
  return (
    <figure className={classes.profilePhoto__figure}>
      <img
        className={classes.profilePhoto__img}
        src={profilePhoto}
        alt="Profile"
      />
      <figcaption className={classes.profilePhoto__figcaption}>
        Sky is <br />
        the limit
      </figcaption>
    </figure>
  );
};

export default ProfilePhoto;
