import "./styles.css";
import React, { useEffect, useMemo, useRef } from "react";
import { raw_data as _raw_data } from "./telecom";
import ForceGraph3D from "react-force-graph-3d";
import styled from "styled-components";
import * as THREE from "three";

const RELATIONALAI_BLUE = "#090F4A";
const RELATIONALAI_ORANGE = "#E1856C";

const raw_data = _raw_data;

export default function App() {
  const fgRef = useRef();
  const [showFraud, setShowFraud] = React.useState(false);
  const [showPagerank, setShowPagerank] = React.useState(false);

  const toggleFraud = React.useCallback(() => {
    setCooldownTicks(0);
    setShowFraud((val) => !val);
  }, []);

  const togglePagerank = React.useCallback(() => {
    setCooldownTicks(0);
    setShowPagerank((val) => !val);
  }, []);

  const [filteredNodes, filteredEdges] = useMemo(() => {
    const nodesWithAttributes = {};
    const edgesWithAttributes = {};
    const nodesWithEdge = new Set();
    const edges = [];
    raw_data.forEach((d) => {
      if (d[0] === "node_attribute") {
        if (nodesWithAttributes[d[1]]) {
          nodesWithAttributes[d[1]][d[2]] = d[3];
        } else {
          nodesWithAttributes[d[1]] = { [d[2]]: d[3], id: d[1] };
        }
      }

      if (d[0] === "edge_attribute") {
        const key = `${d[1]}-${d[2]}`;
        if (edgesWithAttributes[key]) {
          edgesWithAttributes[key][d[3]] = d[4];
        } else {
          edgesWithAttributes[key] = {
            source: d[1],
            target: d[2],
            [d[3]]: d[4],
            distance: 1000,
          };
        }
      }

      if (d[0] === "edge") {
        edges.push({ source: d[1], target: d[2] });
        nodesWithEdge.add(d[1]);
        nodesWithEdge.add(d[2]);
      }
    });

    const newEdge = [...new Set(edges)].map((d) => {
      const key = `${d.source}-${d.target}`;
      // const weight = edgesWithAttributes[key]?.weight;
      return edgesWithAttributes[key] || d;
    }); // .filter(Boolean);

    const filteredNodes = Object.values(nodesWithAttributes).filter((n) =>
      nodesWithEdge.has(n.id)
    );

    return [filteredNodes, newEdge];
  }, [raw_data]);

  const handleZoom = React.useCallback((node) => {
    // Aim at node from outside it
    const distance = 200;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    // console.log(node);
    const newPos =
      node.x || node.y || node.z
        ? {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    fgRef.current.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      1000 // ms transition duration
    );
    //     fgRef.current.d3Force('link')
    // .distance(link => 100)
    // .strength(link => 30)
  }, []);

  const nodeThreeObject = React.useCallback(
    (node) => {
      // Create a sphere geometry, where the radius is based on the pagerank_score
      const geometry = new THREE.SphereGeometry(
        (node.pagerank_score ?? 1) * 10,
        32,
        32
      );
      const material = new THREE.MeshPhongMaterial({
        color: node.fraud ? RELATIONALAI_ORANGE : "#DDD",
      });
      return new THREE.Mesh(geometry, material);
    },
    [showFraud, showPagerank]
  );

  const linkWidth = React.useCallback((link) => {
    if (link.weight) {
      if (link.weight >= 0.5) {
        return link.weight;
      } else {
        return 0.001;
      }
    } else {
      return 0.001;
    }
  }, []);

  const [cooldownTicks, setCooldownTicks] = React.useState(undefined);

  useEffect(() => {
    setTimeout(() => {
      // setCooldownTicks(0);
    }, 1000);
  }, []);

  const linkColors = new Float32Array([
    255,
    255,
    255,
    1, // source
    255,
    255,
    255,
    0, // target
  ]);

  const linkThreeObject = React.useCallback((link) => {
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
    });
    const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
    // geometry.setAttribute('color', new THREE.BufferAttribute(linkColors, 4));
    return new THREE.Line(geometry, material);
  }, []);

  const Container = styled.div`
    width: 160px;
    height: 100%;
    //   background-color: rgba(255, 255, 255, 0.18);
    backgorund-color: rgb(230, 230, 230);
    overflow: scroll;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
  `;

  // this is ugly as sin but if you 
  // do it the right way it forces
  // a hard re-render of the graph that 
  // destroys the desired effect
  const originalNodes = useMemo(() => {
    return filteredNodes.map((node) => ({
      ...node
    }));
  }, []);

  if (showFraud) {
    filteredNodes.forEach((node, j) => {
      node.fraud = originalNodes[j].fraud;
    });
  } else {
    filteredNodes.forEach((node) => {
      node.fraud = false;
    });
  }

  if (showPagerank) {
    filteredNodes.forEach((node, j) => {
      node.pagerank_score = originalNodes[j].pagerank_score;
    });
  } else {
    filteredNodes.forEach((node) => {
      node.pagerank_score = 0.25;
    });
  }

  const graphData = useMemo(
    () => ({
      nodes: filteredNodes,
      links: filteredEdges,
    }),
    [showFraud, showPagerank, filteredNodes, filteredEdges]
  );

  return (
    <div className="App">
      <ControlPanel showFraud={showFraud} toggleFraud={toggleFraud} showPagerank={showPagerank} togglePagerank={togglePagerank}/>
      <Container></Container>
      <ForceGraph3D
        ref={fgRef}
        backgroundColor={RELATIONALAI_BLUE}
        graphData={graphData}
        // nodeLabel={() => ""}
        nodeThreeObjectExtend={false}
        nodeThreeObject={nodeThreeObject}
        // link props
        // linkDirectionalParticleColor={() => "blue"}
        // linkDirectionalParticleWidth={3}
        // linkHoverPrecision={10}
        // linkDirectionalParticles={1}
        // linkDirectionalParticleWidth={1}
        linkOpacity={0.25}
        linkWidth={linkWidth}
        // linkDirectionalArrowLength={2}
        // linkDirectionalArrowRelPos={1}
        linkColor={() => "#BBB"}
        // linkColor={(link) => {
        //   if (link.color) {
        //     return link.color;
        //   } else {
        //     return "#9A9A9A";
        //   }
        // }}
        // linkThreeObjectExtend={true}
        // linkThreeObject={linkThreeObject}
        // linkPositionUpdate={(sprite, { start, end }) => {
        //   const middlePos = Object.assign(
        //     ...["x", "y", "z"].map((c) => ({
        //       [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
        //     }))
        //   );
        //   Object.assign(sprite.position, middlePos);
        // }}
        // loading optimization
        // warmupTicks={100}
        cooldownTicks={cooldownTicks}
        onNodeClick={handleZoom}
      />
    </div>
  );
}

const ControlPanel = ({ showFraud, toggleFraud, showPagerank, togglePagerank }) => {
  return (
    <>
      <img
        style={{
          width: 200,
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 100,
        }}
        src={"logo.svg"}
        alt="RelationalAI Logo"
      />
      <button
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 100,
          backgroundColor: "white",
          border: "none",
          borderRadius: 5,
          padding: 10,
          cursor: "pointer",
        }}
        onClick={toggleFraud}
      >
        {showFraud ? "Hide Fraud" : "Show Fraud"}
      </button>
      <button
        style={{
          position: "absolute",
          top: 10,
          right: 120,
          zIndex: 100,
          backgroundColor: "white",
          border: "none",
          borderRadius: 5,
          padding: 10,
          cursor: "pointer",
        }}
        onClick={togglePagerank}
      >
        {showPagerank ? "Hide PageRank" : "Show PageRank"}
      </button>
    </>
  );
};
