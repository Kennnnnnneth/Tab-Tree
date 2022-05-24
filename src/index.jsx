import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

chrome.storage.local.get(["node", "position", "pic", "edge"], (result) => {
  window.nodes = result.node;
  window.edges = result.edge;
  window.pict = result.pic;
  if (result.node.length < result.position + 1) {
    window.thislocation = 0;
  } else {
    window.thislocation = result.position;
  }
  window.nodes[window.thislocation].data.focus = true;

  ReactDOM.render(<App />, document.getElementById("root"));
});
