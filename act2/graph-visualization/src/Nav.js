import React, { useState } from "react";
import styled from "styled-components";
// import { motion } from "framer-motion";
import List from "./Components/List";
import Text from "./Components/Text";

const Container = styled.div`
  width: 300px;
  height: 100%;
//   background-color: rgba(255, 255, 255, 0.18);
  backgorund-color: rgb(230,230,230);
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

export default function () {
  return (
    <Container>
      <Text> Components </Text>
      <List />
    </Container>
  );
}