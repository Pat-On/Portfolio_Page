import React from "react";
import classes from "./Header.module.scss";
import ButtonLink from "../../UI/ButtonLink/ButtonLink";

const Header = (props) => {
  return (
    <div className={classes.header}>
      <div className={classes.header__container}>
        <h3 className={classes.header__mediumTitle}>Hi, my name is</h3>
        <h2 className={classes.header__bigTitle}>Patryk Nowak</h2>
        <h3 className={classes.header__mediumTitle}>
          I love coding, building complicated systems and solving problems.
        </h3>
        <p className={classes.header__description}>
          I'm a software engineer who enjoys building distributed, scalable
          systems and taking ownership of complex problems — from designing and
          testing microservices to deploying and maintaining them in the cloud.
        </p>
        <div className={classes.header__buttonContainer}>
          <ButtonLink
            text="Find My CV HERE"
            link="https://drive.google.com/u/0/uc?id=1ii_m15I890LX5v59Vc2wTO2T4tuXp2uK&export=download"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
