import React, { useState, useEffect } from "react";
import ReactFlow, { Handle, MiniMap, Background } from "react-flow-renderer";
import { motion } from "framer-motion";
import "./index.css";
const CustomNodeComponent = ({ data }) => {
  return (
    <motion.div
      style={{
        backgroundImage: `url(${data.favIconUrl})`,
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        filter: data.exist ? "brightness(100%)" : "brightness(50%)",
      }}
      animate={
        data.focus
          ? {
              scale: [1, 2, 2, 1, 1],
            }
          : {}
      }
      transition={{ duration: 0.8 }}
      onClick={() => {
        chrome.runtime.sendMessage(
          data.trackId,
          () => chrome.runtime.lastError
        );
      }}
      title={data.title}
    >
      <Handle
        type="target"
        position={"left"}
        style={{ opacity: 0, position: "absolute", top: "16px", left: "16px" }}
      />
      <Handle
        type="source"
        position={"bottom"}
        style={{ opacity: 0, position: "absolute", top: "16px", left: "16px" }}
      />
    </motion.div>
  );
};

export default function Map() {
  const [state, usethisState] = useState("");
  const processBkg = (action) => {
    if (action !== -1) {
      usethisState(window.pict[action]);
    } else {
      usethisState("");
    }
  };
  useEffect(() => {
    setTimeout(() => {
      window.nodes[window.thislocation].data.focus = false;
    }, 1000);
  });
  function styleingBackground() {
    return {
      backgroundImage: `url(${state})`,
      backgroundSize: "cover",
    };
  }
  return (
    <div
      style={{
        height: "450px",
        width: "800px",
      }}
    >
      <ReactFlow
        nodeTypes={{ special: CustomNodeComponent }}
        nodes={window.nodes}
        edges={window.edges}
        nodesDraggable={false}
        panOnScroll={true}
        zoomOnDoubleClick={false}
        onConnect={false}
        panOnScrollSpeed={1.5}
        connectionLineStyle={{ stroke: "#a2a2a2" }}
        defaultPosition={[
          0,
          -window.nodes[window.thislocation].position.y + 100,
        ]}
        onNodeMouseEnter={(e, node) => processBkg(node.data.trackId)}
        onNodeMouseLeave={() => processBkg(-1)}
      >
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              default:
                return "#eee";
            }
          }}
          nodeStrokeWidth={3}
        />
        <Background style={styleingBackground()} />
      </ReactFlow>
    </div>
  );
}
