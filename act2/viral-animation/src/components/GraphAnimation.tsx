import { useState } from "react";
import { motion } from "framer-motion";

export interface Node {
  id: number;
  x: string;
  y: string;
  step: number;
  origin: number;
  name: string;
}

interface Position {
  x: string;
  y: string;
}

const Person = ({
  name,
  initialSize,
  step,
  x,
  y,
  scaleByStep,
}: {
  name: string;
  x: string;
  y: string;
  step: number;
  initialSize?: number;
  scaleByStep?: boolean;
}) => {
  return (
    <motion.img
      src={name?.includes("/") ? name : `/characters/${name}.svg`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      style={{
        position: "absolute",
        width: `${
          (initialSize ?? 50) / (scaleByStep ? Math.sqrt(step + 1) : 1)
        }px`,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      alt="person"
    />
  );
};

const Meme = ({
  position,
  step,
  initialSize,
  scaleByStep,
  scaleDown,
  memeUrl,
}: {
  position: Position;
  step: number;
  initialSize?: number;
  scaleByStep?: boolean;
  scaleDown?: boolean;
  memeUrl?: string;
}) => {
  const yoffset = scaleDown ? -40 : -20;
  const left = `calc(${position.x} + 20px)`;
  const top = `calc(${position.y} + ${yoffset}px)`;
  return (
    <motion.img
      src={ memeUrl ?? "/animation/meme.jpg" }
      style={{
        position: "absolute",
        width: `${
          (initialSize ?? 50) / (scaleByStep ? Math.sqrt(step + 1) : 1)
        }px`,
      }}
      initial={{
        left,
        top,
        opacity: 0,
        scale: 1,
      }}
      animate={{
        left,
        top,
        opacity: 1,
        scale: scaleDown ? 0 : 1,
      }}
      transition={{
        left: { duration: 0.5, ease: "easeOut" },
        top: { duration: 0.5, ease: "easeOut" },
        opacity: { delay: 0.5 },
      }}
      alt="meme"
    />
  );
};

interface ArrowProps {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

const lerp = (start: string, end: string, ratio: number): string => {
  const startNum = parseFloat(start.replace("%", ""));
  const endNum = parseFloat(end.replace("%", ""));
  return startNum * (1 - ratio) + endNum * ratio + "%";
};

const Arrow = ({ x1, y1, x2, y2 }: ArrowProps) => {
  if (x1 === x2 && y1 === y2) {
    return null;
  }
  const markerId = "arrow-end-marker";

  // calculate the new start and end points
  const startX = lerp(x1, x2, 0.25);
  const startY = lerp(y1, y2, 0.25);
  const endX = lerp(x1, x2, 0.75);
  const endY = lerp(y1, y2, 0.75);

  return (
    <motion.svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: 0.125,
      }}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
          fill="white"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="white"
        strokeWidth="1"
        markerEnd={`url(#${markerId})`}
      />
    </motion.svg>
  );
};

interface GraphAnimationProps {
  numSteps: number;
  nodes: Node[];
  height: number;
  advance: () => void;
  initialSize?: number;
  scaleByStep?: boolean;
  name: string;
  memeUrl?: string;
}

export const GraphAnimation = ({
  numSteps,
  nodes,
  height,
  advance,
  initialSize,
  scaleByStep,
  name,
  memeUrl,
}: GraphAnimationProps) => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    setStep((step + 1) % numSteps);
  };

  const memesThisStep = nodes
    .filter((node) => node.step === step)
    .map((node) => (
      <Meme
        key={name + "-message-" + node.id}
        position={{
          x: node.x,
          y: node.y,
        }}
        step={node.step}
        initialSize={initialSize}
        scaleByStep={scaleByStep}
        scaleDown={name === "spam" && step === 3}
        memeUrl={memeUrl}
      />
    ));

  const memesPrevStep = nodes
    .filter((node) => node.step === step + 1)
    .map((node) => (
      <Meme
        key={name + "-message-" + node.id}
        position={{
          x: nodes[node.origin].x,
          y: nodes[node.origin].y,
        }}
        step={nodes[node.origin].step}
        initialSize={initialSize}
        scaleByStep={scaleByStep}
        memeUrl={memeUrl}
      />
    ));

  const memes = [...memesPrevStep, ...memesThisStep];

  const arrows = nodes
    .filter((node) => node.step <= step)
    .filter((node) => name !== "spam" || node.step === 2)
    .map((node) => {
      return (
        <Arrow
          key={name + "-arrow-" + node.id}
          x1={nodes[node.origin].x}
          y1={nodes[node.origin].y}
          x2={node.x}
          y2={node.y}
        />
      );
    });

  const buttonStyle = {
    backgroundColor: "#191970",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "6px",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "relative", height: height + "px" }}>
      {nodes.map((person, index) => {
        return step >= person.step ? (
          <Person
            name={person.name}
            key={name + "-person-" + person.id}
            x={person.x}
            y={person.y}
            step={person.step}
            initialSize={initialSize}
            scaleByStep={scaleByStep}
          />
        ) : null;
      })}
      {memes}
      {arrows}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          gap: "10px",
        }}
        onClick={nextStep}
      >
        <button style={buttonStyle} onClick={nextStep}>
          Next Step
        </button>
        <button
          style={buttonStyle}
          onClick={() => {
            setStep(0);
            advance();
          }}
        >
          Next Animation
        </button>
      </div>
    </div>
  );
};
