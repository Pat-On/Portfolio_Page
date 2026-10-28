# Patryk Nowak — Portfolio

A personal portfolio (React 18 + Create React App) built around **two co-existing layers**:

1. **An interactive Three.js / WebGL scene** rendered imperatively (no react-three-fiber) — a
   procedurally generated solar system and sci-fi ships built entirely from Three.js primitives,
   with no external model files. An "Explore" mode turns the canvas interactive (pointer-lock +
   WASD on desktop, dual-thumb touch joystick on mobile).
2. **A React UI layer** stacked on top: `Header → About → Selected Work → Selected Projects →
   Certifications → Footer`, styled with CSS Modules and a small SCSS design-token system.

## Architecture

```
src/
├─ TreeJSComponents/      # the WebGL world
│  ├─ ViewGL.js           #   core engine class (owns Scene, Camera, Renderer)
│  ├─ animation.js        #   per-frame update loop, bound to the ViewGL instance
│  ├─ planets/            #   each planet is a singleton with a .build() method
│  └─ spaceship/          #   procedural ships (same singleton + .build() pattern)
├─ Components/            # React UI sections (each with a co-located *.module.scss)
├─ UI/                    # reusable presentational components (buttons, photo)
├─ assets/                # JSON content, styles/_variables.scss (design tokens), images
└─ HOC/Layout.js          # stacks the UI sections inside a <main> landmark
```

Performance & device notes: mobile/iOS quality is scaled in `src/utils/mobileQuality.js`
(capped pixel ratio, reduced texture sizes), and the UI respects `prefers-reduced-motion`.

## Testing

Jest + React Testing Library, run with `npm test`. The suite (200+ tests) covers the UI
sections, reducers, the Three.js object registry, and content-data validation.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
