import React from "react";
import classes from "./MobileExploreOverlay.module.scss";

const MobileExploreOverlay = () => (
  <div className={classes.overlay}>
    <div className={classes.zone}>
      <span className={classes.icon}>⊕</span>
      <span className={classes.label}>MOVE</span>
    </div>
    <div className={classes.divider} />
    <div className={classes.zone}>
      <span className={classes.icon}>◎</span>
      <span className={classes.label}>LOOK</span>
    </div>
  </div>
);

export default MobileExploreOverlay;
