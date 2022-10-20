import "./App.scss";
import Scene from "./TreeJSComponents/Scene";
import React from "react";

import Layout from "./HOC/Layout";

function App() {
  return (
    <div className="App">
      <Scene />
      <Layout />
    </div>
  );
}

export default App;
