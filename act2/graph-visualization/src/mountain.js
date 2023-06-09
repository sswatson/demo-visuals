/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: TastefullBrick (https://sketchfab.com/tastefullbrick)
license: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
source: https://sketchfab.com/3d-models/low-poly-mountain-411a7d5b223648c6bb011dbdb8d963d9
title: Low Poly Mountain
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Mountain(props) {
  const { nodes, materials } = useGLTF("/low_poly_mountain.glb");
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.15}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <group
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[1269.22, 1269.22, 290.3]}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Plane_Material002_0.geometry}
              material={materials["Material.002"]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Plane_Material002_0_1.geometry}
              material={materials["Material.002"]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Plane_Material002_0_2.geometry}
              material={materials["Material.002"]}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/low_poly_mountain.glb");
