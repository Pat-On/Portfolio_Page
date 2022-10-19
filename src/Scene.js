import React from "react";
import ViewGL from "./ViewGL";

export default class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  // ******************* COMPONENT LIFECYCLE ******************* //
  componentDidMount() {
    // Get canvas, pass to custom class
    const canvas = this.canvasRef.current;
    this.viewGL = new ViewGL(canvas);
    // Init any event listeners
    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("resize", this.handleResize);

    document.addEventListener("scroll", this.scrollMouse);
  }

  componentDidUpdate(prevProps, prevState) {
    // Pass updated props to
    const newValue = this.props.whateverProperty;
    this.viewGL.updateValue(newValue);
  }

  componentWillUnmount() {
    // Remove any event listeners
    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("resize", this.handleResize);
  }

  // ******************* EVENT LISTENERS ******************* //
  mouseMove = (event) => {
    this.viewGL.onMouseMove(event);
  };

  handleResize = () => {
    this.viewGL.onWindowResize(window.innerWidth, window.innerHeight);
  };

  scrollMouse = (event) => {
    console.log("?");
    this.viewGL.onScroll(event);
  };

  render() {
    return (
      <canvas
        onScroll={this.scrollMouse}
        ref={this.canvasRef}
        style={{ position: "fixed", top: 0, left: 0 }}
      />
    );
  }
}
