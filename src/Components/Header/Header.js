import React from "react";
import classes from "./Header.module.scss";

// import profilePhoto from "../../assets/images/ProfilePhoto.jpeg";

const Header = (props) => {
  return (
    <div className={classes.header}>
      <div className={classes.header__left}>
        <h4>Hi, my name is</h4>
        <h3>Patryk Nowak</h3>
        <h3>
          I love coding, building complicated system and solving problems.
        </h3>
        <p>
          I'm software engineer that is not afraid to work on the back-end and
          front-end to solve business problems. Currently I'm focused on
          expanding my skills in coding and Azure
        </p>
        <a
          className={classes.header__buttonCV}
          href="https://drive.google.com/u/0/uc?id=1ii_m15I890LX5v59Vc2wTO2T4tuXp2uK&export=download"
        >
          Find My CV HERE
        </a>
      </div>

      {/* <div className={classes.header__right}>
        <img src={profilePhoto} alt="profile" />
      </div> */}
    </div>
  );
};

export default Header;
