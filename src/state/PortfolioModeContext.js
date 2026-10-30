import { createContext, useContext } from "react";

// Lets the page ask App to start Explore or open the game briefing, and to
// remember where the visitor was so they land back there afterwards. Null
// outside App (tests, or a page rendered without the scene).
const PortfolioModeContext = createContext(null);

export const PortfolioModeProvider = PortfolioModeContext.Provider;

export const usePortfolioMode = () => useContext(PortfolioModeContext);
