import "./styles.css";
import * as THREE from "three";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, RoundedBox, Line, Text, Point, Box } from "@react-three/drei";
import React, { useMemo, useState, useCallback, useRef } from "react";
import { nodeEdges } from "./nodeEdges";
import { raw_data as _raw_data, viral_id, spam_id } from "./rules";
import ForceGraph3D from "react-force-graph-3d";
import Nav from "./Nav";
import SpriteText from "three-spritetext";
import styled from "styled-components";

const raw_data = _raw_data;

const flaggedNodes = [
  //  "f053688f09f7",
  "0c4a8e007015",
];

export default function App() {
  const fgRef = useRef();
  const [showViral, setShowViral] = useState(false);
  const [showSpam, setShowSpam] = useState(false);
  const flaggedNodesReference = flaggedNodes.reduce(
    (a, v) => ({ ...a, [v]: undefined }),
    {}
  );
  let sr1Node = undefined;
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
      return edgesWithAttributes[key] || d;
    });

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

  const handleNodeColor = React.useCallback((node) => {
    if (flaggedNodes.includes(node.label)) {
      flaggedNodesReference[node.label] = node;
    }
    const sprite = new SpriteText(node.label);
    sprite.color = "white";
    sprite.textHeight = 0.5;
    sprite.borderColor = "white";
    sprite.borderRadius = 6;
    sprite.padding = 3;
    sprite.borderWidth = 1;
    sprite.backgroundColor = "white";
    sprite.receiveShadow;
    sprite.castShadow;

    if (node.shape === "pentagon") {
      sprite.borderColor = "#508BE4";
      sprite.backgroundColor = "#508BE4";
    } else if (node.shape === "note") {
      sprite.borderColor = "#7434E7";
      sprite.backgroundColor = "#7434E7";
    } else if (node.shape === "oval") {
      sprite.borderColor = "#0A91AE";
      sprite.backgroundColor = "#0A91AE";
    } else if (node.shape === "house") {
      sprite.borderColor = "#5ABAEB";
      sprite.backgroundColor = "#5ABAEB";
    } else if (node.shape === "hexagon") {
      sprite.borderColor = "#408CFF";
      sprite.backgroundColor = "#408CFF";
    } else if (node.shape === "square") {
      sprite.borderColor = "#9F84BD";
      sprite.backgroundColor = "#9F84BD";
    }

    if (node.color && node.color === "red") {
      sprite.borderColor = "#FF4539";
      sprite.backgroundColor = "#FF4539";
      sprite.color = "white";
      sprite.textHeight = 10;
    }

    return sprite;
  }, []);

  // fgRef.current.d3Force('link')
  // .distance(link => 30)
  // .strength(link => 30)

  const filteredEdgesWithColors = (
    showViral || showSpam 
      ? filteredEdges.map((edge) => {
          if (showViral && edge.hash === viral_id) {
            return { ...edge, color: "#FF4539", width: 3 };
          } else if (showSpam && edge.hash === spam_id) {
            return { ...edge, color: "#FF4539", width: 3 };
          } else {
            return edge;
          }
        })
      : filteredEdges
  );

  const linkColor = React.useCallback((link) => {
      if (link.color) {
        return link.color;
      } else {
        return "#9A9A9A";
      }
    }
  , []);

  const linkWidth = React.useCallback((link) => {
    if (link.width) {
      return link.width;
    } else {
      return 1;
    }
  }, []);

  const linkDirectionalParticles = React.useCallback((link) => {
    if (link.width) {
      return 1;
    } else {
      return 0;
    }
  }, []);

  const data = useMemo(() => {
    return {
      nodes: filteredNodes,
      links: filteredEdgesWithColors,
    }
  }, [filteredNodes, filteredEdgesWithColors]);

  const nodeLabel = React.useCallback((node) => {
    return "";
  }, []);

  function showViralMessage() {
    setShowViral(true);
    setShowSpam(false);
  }

  function showSpamMessage() {
    setShowSpam(true);
    setShowViral(false);
  }

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

  const ListContainer = styled.div`
    width: 100%;
    height: 100%;
    background-color: #faf8f8;
  `;

  const MenuItem = styled.li`
    height: 44px;
    padding: 0px 28px;
    display: flex;
    align-items: center;
    color: black;
    justify-content: start;
    transition: 0.08s ease;
    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
      cursor: pointer;
    }
  `;

  const Text = styled.div`
    color: black;
    font-size: 18px;
  `;

  const Dot = styled.div`
    height: 16px;
    width: 2px;
    color: white;
    background-color: red;
    // border-radius: 4px;
    // padding: 4px;
    margin-right: 4px;
  `;

  return (
    <div className="App">
      <Container>
        <ListContainer>
          <Text>
            {" "}
            <h4>Hashes </h4>
          </Text>
          <MenuItem onClick={showViralMessage}>
            Viral
          </MenuItem>
          <MenuItem onClick={showSpamMessage}>
            Spam
          </MenuItem>
        </ListContainer>
      </Container>
      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#F5F5F5"
        graphData={data}
        nodeLabel={nodeLabel}
        nodeThreeObjectExtend={false}
        nodeThreeObject={handleNodeColor}
        // link props
        linkDirectionalParticleColor={() => "#FF4539"}
        linkDirectionalParticleWidth={4}
        linkHoverPrecision={10}
        linkDirectionalParticles={linkDirectionalParticles}
        linkOpacity={0.5}
        //linkDirectionalArrowLength={2}
        //linkDirectionalArrowRelPos={1}
        linkColor={linkColor}
        linkWidth={linkWidth}
        // linkMaterial={(link) => {
        //   if (link.style && link.style === "dotted") {
        //     const line =  new THREE.LineDashedMaterial( {
        //       color: link.color || "#9A9A9A",
        //       linewidth: 2,
        //       scale: 2,
        //       dashSize: 5,
        //       gapSize: 1,
        //     } );
        //     line.computeLineDistances()
        //     return line
        //   } else {
        //     return false;
        //   }
        // }}
        linkThreeObjectExtend={true}
        // linkThreeObject={(link) => {
        //   // extend link with text sprite
        //   const sprite = new SpriteText(link.label || "");
        //   sprite.color = link.fontcolor || "black";
        //   sprite.textHeight = 1.5;
        //   return sprite;
        // }}
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
        // cooldownTicks={0}
        onNodeClick={handleZoom}
      />
    </div>
  );
}
