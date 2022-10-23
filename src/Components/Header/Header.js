import React from "react";
import classes from "./Header.module.scss";

import ButtonLink from "../../UI/ButtonLink/ButtonLink";
// import profilePhoto from "../../assets/images/ProfilePhoto.jpeg";

const Header = (props) => {
  return (
    <div className={classes.header}>
      <div className={classes.header__left}>
        <h3 className={classes.header__left__mediumTitle}>Hi, my name is</h3>
        <h2 className={classes.header__left__bigTitle}>Patryk Nowak</h2>
        <h3 className={classes.header__left__mediumTitle}>
          I love coding, building complicated system and solving problems.
        </h3>
        <p className={classes.header__left__description}>
          I'm a passionate software engineer who is not afraid to work on the
          back-end and front-end to solve business problems and learn new
          things. Currently I'm focused on expanding my skills in coding and
          cloud.
        </p>
        <ButtonLink
          text="Find My CV HERE"
          link="https://drive.google.com/u/0/uc?id=1ii_m15I890LX5v59Vc2wTO2T4tuXp2uK&export=download"
        />
      </div>
    </div>
  );
};

export default Header;
