// src/components/StatePreserver.js
import { useLocation } from "react-router-dom";
import React from "react";

const StatePreserver = ({ children }) => {
  const location = useLocation();

  console.log("[StatePreserver] Preserving state for:", location.pathname);
  console.log("[StatePreserver] Current state:", location.state);

  return React.cloneElement(children, {
    key: location.pathname,
    state: location.state,
  });
};

export default StatePreserver;
