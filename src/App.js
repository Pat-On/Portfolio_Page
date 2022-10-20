import "./App.css";
import Scene from "./TreeJSComponents/Scene";
import React from "react";

import profilePhoto from "./assets/ProfilePhoto.jpeg";

function App() {
  return (
    <div className="App">
      <Scene />
      <div className="reactContainer">
        <div className="sectionRight">
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
            className="buttonCV"
            href="https://drive.google.com/u/0/uc?id=1ZRNlv_CfjR3pqzYbbeKq_NMJCQ_TFA8N&export=download"
          >
            Find My CV HERE
          </a>
        </div>
        <div className="test">
          <img src={profilePhoto} alt="profile photo" />
        </div>
        <p className="left">
          here are many variations of passages of Lorem Ipsum available, but the
          majority have suffered alteration in some form, by injected humour, or
          randomised words which don't look even slightly believable. If you are
          going to use a passage of Lorem Ipsum, you need to be sure there isn't
          anything embarrassing hidden in the middle of text. All the Lorem
          Ipsum generators on the Internet tend to repeat predefined chunks as
          necessary, making this the first true generator on the Internet. It
          uses a dictionary of over 200 Latin words, combined with a handful of
          model sentence structures, to generate Lorem Ipsum which looks
          reasonable. The generated Lorem Ipsum is therefore always free from
          repetition, injected humour, or non-characteristic words etc.
        </p>
      </div>
    </div>
  );
}

export default App;
