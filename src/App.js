import "./App.scss";
import React, { useState } from "react";
import Scene from "./TreeJSComponents/Scene";
import Layout from "./HOC/Layout";
import ExploreButton from "./Components/ExploreButton/ExploreButton";

function App() {
  const [exploring, setExploring] = useState(false);

  return (
    <div className="App">
      <Scene exploring={exploring} onExploreEnd={() => setExploring(false)} />
      <ExploreButton exploring={exploring} onToggle={() => setExploring((e) => !e)} />
      {!exploring && <Layout />}
    </div>
  );
}

export default App;
