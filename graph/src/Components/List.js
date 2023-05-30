import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
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
  }
`;

const data = ["SR1", "SR2", "SR3", "SR4"];

export default function List(props) {
  return (
    <Container>
      {data.map((x, index) => (
        <MenuItem key={index} >
          {x}
        </MenuItem>
      ))}
    </Container>
  );
}
