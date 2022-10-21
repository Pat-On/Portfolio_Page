import React from "react";
import classes from "./About.module.scss";

import ProfilePhoto from "../../UI/ProfilePhoto/ProfilePhoto";

const About = (props) => {
  return (
    <div className={classes.about}>
      <div className={classes.about__description}>
        <h2>About Me</h2>
        <p>
          I'm a full stack developer who started from a non IT background. I
          came from the academic sector, where
          <b>
            during my P.H.D studies I have learnt a methodological and
            analytical approach to solve problems.
          </b>
        </p>

        <p>
          <b>I have a burning passion to learn new technologies, </b> which in
          turn makes me a very persistent and a consistent learner. I also enjoy
          teaching all the things that I have learnt and get a lot of
          fulfillment from this.
        </p>

        <p>
          <b>I am a very organized person, </b> who can work independently, I
          also work well in a team. This is reflected in my past achievements in
          my career, where my team and I always produced high standards, got the
          result desired and achieved goals on time.
        </p>

        <p>
          <b>
            My proudest achievement is that I received the Grant of Ministry of
            Science and Higher Education of Republic of Poland (only 1000
            students were awarded) twice during my studies at university.
          </b>
          To achieve this, I set and focused on the goal, planned my time well
          and I was able to work under immense pressure.
        </p>
        <p>
          <b>
            I have a burning desire to work in the tech industry, I am excited
            to work with a dynamic team full of positive like-minded people.
          </b>
        </p>
      </div>

      <div className={classes.about__photoContainer}>
        <ProfilePhoto />
      </div>
    </div>
  );
};

export default About;
