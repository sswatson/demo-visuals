import "./styles.css";
import React, { useEffect, useMemo, useRef } from "react";
import { raw_data as _raw_data } from "./telecom";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import styled from "styled-components";
import * as THREE from 'three';

const RELATIONALAI_BLUE = '#090F4A';
const RELATIONALAI_ORANGE = '#E1856C';

const raw_data = _raw_data;

export default function App() {
  const fgRef = useRef();
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
    })// .filter(Boolean);

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

  const nodeThreeObject = React.useCallback((node) => {
      // Create a sphere geometry, where the radius is based on the pagerank_score
      const geometry = new THREE.SphereGeometry((node.pagerank_score ?? 1) * 10, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: node.fraud ? RELATIONALAI_ORANGE : "#DDD",
      });
      return new THREE.Mesh(geometry, material);
  });

  const handleNodeColor = React.useCallback((node) => {
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

  const linkWidth = React.useCallback((link) => {
    if (link.weight) {
      return Math.round(5 * link.weight);
    } else {
      return 1;
    }
  }, []);
  
  const [cooldownTicks, setCooldownTicks] = React.useState(undefined);

  useEffect(() => {
    setTimeout(() => {
      // setCooldownTicks(0);
    }, 1000);
  }, []);

  const linkColors = new Float32Array([
    255, 255, 255, 1, // source
    255, 255, 255, 0  // target
  ]);

  const linkThreeObject = React.useCallback((link) => {
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true });
    const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
    // geometry.setAttribute('color', new THREE.BufferAttribute(linkColors, 4));
    return new THREE.Line(geometry, material);
  }, []);

  const CameraOrbit = React.memo(() => {
    return (
      <ForceGraph3D
        ref={fgRef}
        backgroundColor={RELATIONALAI_BLUE}
        graphData={{
          nodes: filteredNodes,
          links: filteredEdges,
        }}
        // nodeLabel={() => ""}
        nodeThreeObjectExtend={false}
        nodeThreeObject={nodeThreeObject}
        // link props
        // linkDirectionalParticleColor={() => "blue"}
        // linkDirectionalParticleWidth={3}
        // linkHoverPrecision={10}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1}
        linkOpacity={0.2}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={2}
        linkDirectionalArrowRelPos={1}
        linkColor={(link) => {
          if (link.color) {
            return link.color;
          } else {
            return "#9A9A9A";
          }
        }}
        linkThreeObjectExtend={true}
        linkThreeObject={linkThreeObject}
        linkPositionUpdate={(sprite, { start, end }) => {
          const middlePos = Object.assign(
            ...["x", "y", "z"].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
            }))
          );
          Object.assign(sprite.position, middlePos);
        }}
        // loading optimization
        // warmupTicks={100}
        cooldownTicks={cooldownTicks}
        onNodeClick={handleZoom}
      />
    );
  });

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

  return (
    <div className="App">
      <img style={{
        width: 200,
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 100,
      }} src={"logo.svg"} alt="RelationalAI Logo"/>
      <Container>
      </Container>
      <CameraOrbit />
    </div>
  );
}
