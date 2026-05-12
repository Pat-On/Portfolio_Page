import React from "react";
import ViewGL from "./ViewGL";

export default class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef        = React.createRef();
    this.overlayCanvasRef = React.createRef();
  }

  // ******************* COMPONENT LIFECYCLE ******************* //
  componentDidMount() {
    // Get canvas, pass to custom class
    const canvas        = this.canvasRef.current;
    const overlayCanvas = this.overlayCanvasRef.current;
    this.viewGL = new ViewGL(canvas, overlayCanvas, this.props.onReady);
    // Init any event listeners
    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("resize", this.handleResize);

    document.addEventListener("scroll", this.scrollMouse);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.exploring !== this.props.exploring) {
      this.viewGL.setExploreMode(this.props.exploring, this.props.onExploreEnd);
    }
    if (prevProps.gameMode !== this.props.gameMode) {
      this.viewGL.setGameMode(
        this.props.gameMode,
        this.props.onGameOver,
        this.props.onHudUpdate,
        this.props.onPlayerHit,
        this.props.onKill,
        this.props.onWaveComplete,
        this.props.onPause
      );
    }
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
    this.viewGL.onScroll(event);
  };

  render() {
    return (
      <>
        <canvas
          onScroll={this.scrollMouse}
          ref={this.canvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 10,
            height: "100vh",
            width: "100%",
            touchAction: this.props.exploring ? "none" : "auto",
          }}
        />
        <canvas
          ref={this.overlayCanvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 15,
            height: "100vh",
            width: "100%",
            pointerEvents: "none",
          }}
        />
      </>
    );
  }
}
